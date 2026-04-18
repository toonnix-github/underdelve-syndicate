import { Combatant } from '../models/Combatant';

export const calculateDamage = (attacker: Combatant, target: Combatant, attackerParty: Combatant[], targetParty: Combatant[]): number => {
    const atk = attacker.getATK(attackerParty);
    const def = target.getDEF(targetParty);
    let dmg = Math.max(1, atk - def);
    
    // Trait Buffs: Iron Aura (10% DR)
    const targetHasIronAura = targetParty.some(u => u.trait?.id === 'iron_aura' && u.hp > 0);
    if (targetHasIronAura) {
        dmg = Math.floor(dmg * 0.9);
    }
    
    // Kael Leader Perk: Ignore 15% DEF vs Rearguard
    const attackerLeader = attackerParty.find(u => u.isLeader);
    if (attackerLeader?.name === 'Kael' && target.positionLine === 'REARGUARD') {
        const rawDef = target.getDEF(targetParty);
        const ignoredDef = Math.floor(rawDef * 0.15);
        dmg = Math.max(1, atk - (rawDef - ignoredDef));
    }

    return dmg;
};

export const calculateHeal = (caster: Combatant, baseVal: number, party: Combatant[]): number => {
    let heal = baseVal;
    // Morgra Trait: +40% Heal power
    if (caster.trait?.id === 'blood_pact') {
        heal = Math.floor(heal * 1.4);
    }
    return heal;
};
