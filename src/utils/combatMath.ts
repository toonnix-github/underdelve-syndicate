import { Combatant } from '../models/Combatant';
import { Ability } from '../types';

export type RowActionType = 'melee' | 'ranged' | 'magic' | 'support';

export const getSkillActionType = (skill?: Ability | null): RowActionType => skill?.actionType ?? 'melee';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const applyRowModifier = (value: number, positionLine: 'VANGUARD' | 'REARGUARD', actionType: RowActionType) => {
    if (actionType === 'melee') {
        if (positionLine === 'VANGUARD') return Math.max(1, Math.floor(value * 1.1));
        return Math.max(1, Math.floor(value * 0.65));
    }

    if (positionLine === 'REARGUARD' && (actionType === 'ranged' || actionType === 'magic' || actionType === 'support')) {
        return Math.max(1, Math.floor(value * 1.1));
    }

    return value;
};

const getBaseAccuracyByActionType = (actionType: Exclude<RowActionType, 'support'>) => {
    if (actionType === 'melee') return 88;
    if (actionType === 'ranged') return 90;
    return 92; // magic
};

export const calculateHitChance = (
    attacker: Combatant,
    target: Combatant,
    attackerParty: Combatant[],
    targetParty: Combatant[],
    actionType: Exclude<RowActionType, 'support'>
): number => {
    const attackerSpd = attacker.getSPD(attackerParty);
    const targetSpd = target.getSPD(targetParty);
    const speedDelta = attackerSpd - targetSpd;
    const baseAccuracy = getBaseAccuracyByActionType(actionType);

    // Accuracy is primarily driven by speed tempo; tiny role bias for ranged.
    let chance = baseAccuracy + speedDelta * 1.2;

    if (actionType === 'ranged' && attacker.positionLine === 'REARGUARD') {
        chance += 2;
    }

    if (target.trait?.id === 'infiltrator') {
        chance -= 3;
    }

    return clamp(Math.floor(chance), 60, 98);
};

export const rollHitCheck = (
    attacker: Combatant,
    target: Combatant,
    attackerParty: Combatant[],
    targetParty: Combatant[],
    actionType: Exclude<RowActionType, 'support'>
) => {
    const hitChance = calculateHitChance(attacker, target, attackerParty, targetParty, actionType);
    const roll = Math.floor(Math.random() * 100) + 1;
    return { hit: roll <= hitChance, hitChance, roll };
};

export const calculateDamage = (
    attacker: Combatant,
    target: Combatant,
    attackerParty: Combatant[],
    targetParty: Combatant[],
    actionType: Exclude<RowActionType, 'support'>,
    potency = 100
): number => {
    const atk = attacker.getATK(attackerParty);
    const scaledAtk = Math.max(1, Math.floor(atk * (potency / 100)));
    const def = target.getDEF(targetParty);
    let dmg = Math.max(1, scaledAtk - def);

    // Kael Leader Perk: Ignore 15% DEF vs Rearguard
    const attackerLeader = attackerParty.find(u => u.isLeader);
    if (attackerLeader?.name === 'Kael' && target.positionLine === 'REARGUARD') {
        const rawDef = target.getDEF(targetParty);
        const ignoredDef = Math.floor(rawDef * 0.15);
        dmg = Math.max(1, scaledAtk - (rawDef - ignoredDef));
    }

    dmg = applyRowModifier(dmg, attacker.positionLine, actionType);

    // Trait Buffs: Iron Aura (10% DR)
    const targetHasIronAura = targetParty.some(u => u.trait?.id === 'iron_aura' && u.hp > 0);
    if (targetHasIronAura) {
        dmg = Math.floor(dmg * 0.9);
    }

    return dmg;
};

export const calculateHeal = (caster: Combatant, baseVal: number, party: Combatant[]): number => {
    let heal = baseVal;
    // Morgra Trait: +40% Heal power
    if (caster.trait?.id === 'blood_pact') {
        heal = Math.floor(heal * 1.4);
    }

    return applyRowModifier(heal, caster.positionLine, 'support');
};
