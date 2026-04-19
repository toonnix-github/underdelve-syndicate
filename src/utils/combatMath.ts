import { Combatant } from '../models/Combatant';
import { Ability } from '../types';

export type RowActionType = 'melee' | 'ranged' | 'magic' | 'support';

export const getSkillActionType = (skill?: Ability | null): RowActionType => skill?.actionType ?? 'melee';

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
