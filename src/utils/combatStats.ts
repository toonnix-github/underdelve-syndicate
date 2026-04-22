import { Combatant } from '../models/Combatant';

export type CombatStatLabel = 'ATK' | 'DEF' | 'SPD' | 'EVA';

export interface CombatStatContribution {
    stat: CombatStatLabel;
    delta: number;
    source: string;
}

export interface CombatStatBreakdown {
    atk: { base: number; final: number; delta: number };
    def: { base: number; final: number; delta: number };
    spd: { base: number; final: number; delta: number };
    eva: { base: number; final: number; delta: number };
    contributions: CombatStatContribution[];
}

export const getCombatStatBreakdown = (unit: Combatant, allies: Combatant[]): CombatStatBreakdown => {
    const contributions: CombatStatContribution[] = [];
    const leader = allies.find(member => member.isLeader);

    const push = (stat: CombatStatLabel, delta: number, source: string) => {
        if (delta !== 0) {
            contributions.push({ stat, delta, source });
        }
    };

    let atkFinal = unit.power;
    let defFinal = unit.def;
    let spdFinal = unit.speed;

    // --- Race Bonuses ---
    if (unit.race === 'Orc') {
        atkFinal += 3;
        push('ATK', 3, 'Race (Orc)');
    } else if (unit.race === 'Undead') {
        atkFinal += 2;
        push('ATK', 2, 'Race (Undead)');
        spdFinal -= 1;
        push('SPD', -1, 'Race (Undead)');
    } else if (unit.race === 'Elf') {
        spdFinal += 3;
        push('SPD', 3, 'Race (Elf)');
    } else if (unit.race === 'Construct') {
        defFinal += 5;
        push('DEF', 5, 'Race (Construct)');
        spdFinal -= 2;
        push('SPD', -2, 'Race (Construct)');
    } else if (unit.race === 'Dwarf') {
        defFinal += 4;
        push('DEF', 4, 'Race (Dwarf)');
    }

    // --- Equipment ---
    Object.values(unit.equipment || {}).forEach((item: any) => {
        if (!item?.statBoost) return;
        const boost = item.statBoost as { atk?: number; def?: number; spd?: number };
        if (boost.atk) {
            atkFinal += boost.atk;
            push('ATK', boost.atk, 'Gear');
        }
        if (boost.def) {
            defFinal += boost.def;
            push('DEF', boost.def, 'Gear');
        }
        if (boost.spd) {
            spdFinal += boost.spd;
            push('SPD', boost.spd, 'Gear');
        }
    });

    // --- Job Bonuses (Multiplicative on current total) ---
    if (unit.job === 'Berserker') {
        const boosted = Math.floor(atkFinal * 1.15);
        push('ATK', boosted - atkFinal, 'Job (Berserker)');
        atkFinal = boosted;
    }
    if (unit.job === 'Knight') {
        const boosted = Math.floor(defFinal * 1.15);
        push('DEF', boosted - defFinal, 'Job (Knight)');
        defFinal = boosted;
    }
    if (unit.job === 'Slayer' || unit.job === 'Rogue') {
        const boosted = Math.floor(spdFinal * 1.15);
        push('SPD', boosted - spdFinal, `Job (${unit.job})`);
        spdFinal = boosted;
    }

    // --- Leader Perks & Traits ---
    if (leader?.name === 'Valthea' && unit.positionLine === 'VANGUARD') {
        const boosted = Math.floor(atkFinal * 1.15);
        push('ATK', boosted - atkFinal, 'Leader');
        atkFinal = boosted;
    }

    if (leader?.name === 'Vex' && unit.hasEliteBonus) {
        const boosted = Math.floor(atkFinal * 1.10);
        push('ATK', boosted - atkFinal, 'Leader');
        atkFinal = boosted;
    }

    if (unit.battleAtkBuffPct !== 0) {
        const boosted = Math.floor(atkFinal * (1 + unit.battleAtkBuffPct / 100));
        push('ATK', boosted - atkFinal, 'Battle Buff');
        atkFinal = boosted;
    }

    if (unit.trait?.id === 'vanguard_stance' && unit.positionLine === 'VANGUARD') {
        const boosted = Math.floor(defFinal * 1.1);
        push('DEF', boosted - defFinal, 'Trait');
        defFinal = boosted;
    }

    if (leader?.name === 'Valerius') {
        const boosted = Math.floor(defFinal * 1.15);
        push('DEF', boosted - defFinal, 'Leader');
        defFinal = boosted;
    }

    if (unit.battleDefBuffPct !== 0) {
        const boosted = Math.floor(defFinal * (1 + unit.battleDefBuffPct / 100));
        push('DEF', boosted - defFinal, 'Battle Buff');
        defFinal = boosted;
    }

    if (leader?.name === 'Lira') {
        const boosted = Math.floor(spdFinal * 1.10);
        push('SPD', boosted - spdFinal, 'Leader');
        spdFinal = boosted;
    }

    if (unit.battleSpdBuffPct !== 0) {
        const boosted = Math.floor(spdFinal * (1 + unit.battleSpdBuffPct / 100));
        push('SPD', boosted - spdFinal, 'Battle Buff');
        spdFinal = boosted;
    }

    const traitEvasionBonus = unit.trait?.id === 'afterimage' && unit.positionLine === 'VANGUARD' ? 8 : 0;
    if (traitEvasionBonus > 0) {
        push('EVA', traitEvasionBonus, 'Trait');
    }

    const battleEvasionBonus = unit.getActiveEvasionBonus();
    if (battleEvasionBonus !== 0) {
        push('EVA', battleEvasionBonus, 'Battle Buff');
    }

    const evaFinal = traitEvasionBonus + battleEvasionBonus;

    return {
        atk: { base: unit.power, final: atkFinal, delta: atkFinal - unit.power },
        def: { base: unit.def, final: defFinal, delta: defFinal - unit.def },
        spd: { base: unit.speed, final: spdFinal, delta: spdFinal - unit.speed },
        eva: { base: 0, final: evaFinal, delta: evaFinal },
        contributions,
    };
};
