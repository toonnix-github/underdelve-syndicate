import { describe, expect, it } from 'vitest';
import { getCombatStatBreakdown } from '../../src/utils/combatStats';
import { makeCombatant } from '../helpers/combatantFactory';

describe('combatStats breakdown', () => {
  it('applies race and job modifiers for ATK and tracks contributions', () => {
    const unit = makeCombatant({
      atk: 10,
      def: 10,
      spd: 10,
      race: 'Orc',
      job: 'Berserker'
    });

    const breakdown = getCombatStatBreakdown(unit, [unit]);
    expect(breakdown.atk.base).toBe(10);
    expect(breakdown.atk.final).toBe(14); // (10 + 3) * 1.15 floored
    expect(breakdown.contributions.some(c => c.source === 'Race (Orc)' && c.stat === 'ATK')).toBe(true);
    expect(breakdown.contributions.some(c => c.source === 'Job (Berserker)' && c.stat === 'ATK')).toBe(true);
  });

  it('applies trait and leader modifiers for DEF in vanguard', () => {
    const leader = makeCombatant({ name: 'Valerius', role: 'TANK', job: 'Paladin' });
    leader.isLeader = true;

    const unit = makeCombatant({
      def: 10,
      positionLine: 'VANGUARD',
      trait: { id: 'vanguard_stance', name: 'Vanguard Stance', description: '' },
      race: 'Human',
      job: 'Mage'
    });

    const breakdown = getCombatStatBreakdown(unit, [leader, unit]);
    expect(breakdown.def.final).toBe(12); // 10 -> 11 (trait) -> 12 (leader 15% floor)
    expect(breakdown.contributions.some(c => c.source === 'Trait' && c.stat === 'DEF')).toBe(true);
    expect(breakdown.contributions.some(c => c.source === 'Leader' && c.stat === 'DEF')).toBe(true);
  });

  it('applies equipment modifiers for all primary stats', () => {
    const unit = makeCombatant({ atk: 10, def: 10, spd: 10, race: 'Human', job: 'Mage' });
    unit.equipment.weapon1 = { statBoost: { atk: 3, def: 2, spd: 4 } };

    const breakdown = getCombatStatBreakdown(unit, [unit]);
    expect(breakdown.atk.final).toBe(13);
    expect(breakdown.def.final).toBe(12);
    expect(breakdown.spd.final).toBe(14);
  });

  it('computes EVA from afterimage trait and active evasion buff', () => {
    const unit = makeCombatant({
      positionLine: 'VANGUARD',
      trait: { id: 'afterimage', name: 'Afterimage', description: '' },
      job: 'Mage'
    });
    unit.addBattleEvasionBuff(5, 20);

    const breakdown = getCombatStatBreakdown(unit, [unit]);
    expect(breakdown.eva.final).toBe(13);
    expect(breakdown.contributions.some(c => c.stat === 'EVA' && c.delta === 8)).toBe(true);
    expect(breakdown.contributions.some(c => c.stat === 'EVA' && c.delta === 5)).toBe(true);
  });
});
