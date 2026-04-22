import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeCombatant } from '../helpers/combatantFactory';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Combatant', () => {
  it('applies race-based max HP adjustments at construction', () => {
    const human = makeCombatant({ race: 'Human', hp: 100 });
    const nightElf = makeCombatant({ race: 'Night-Elf', hp: 100 });
    const dragon = makeCombatant({ race: 'Dragon', hp: 100 });
    const titan = makeCombatant({ race: 'Titan', hp: 100 });

    expect(human.maxHp).toBe(105);
    expect(nightElf.maxHp).toBe(90);
    expect(dragon.maxHp).toBe(110);
    expect(titan.maxHp).toBe(120);
  });

  it('equips two-handed weapons into both weapon slots with placeholder', () => {
    const unit = makeCombatant();
    const greatsword = { id: 'w1', name: 'Greatsword', isTwoHanded: true };

    unit.equip(greatsword, 'weapon1');

    expect(unit.equipment.weapon1).toEqual(greatsword);
    expect(unit.equipment.weapon2?.isPlaceholder).toBe(true);
    expect(unit.equipment.weapon2?.parentSlot).toBe('weapon1');
  });

  it('unequips two-handed weapon from both weapon slots', () => {
    const unit = makeCombatant();
    unit.equip({ id: 'w1', name: 'Greatsword', isTwoHanded: true }, 'weapon1');

    unit.unequip('weapon1');

    expect(unit.equipment.weapon1).toBeUndefined();
    expect(unit.equipment.weapon2).toBeUndefined();
  });

  it('computes attack with race and job modifiers', () => {
    const unit = makeCombatant({ atk: 10, race: 'Orc', job: 'Swordsman' });
    expect(unit.getATK([unit])).toBe(15);
  });

  it('computes defense with race and guardian scaling', () => {
    const unit = makeCombatant({ def: 10, race: 'Demon', job: 'Guardian' });
    expect(unit.getDEF([unit])).toBe(6);
  });

  it('computes speed with race and thief scaling', () => {
    const unit = makeCombatant({ spd: 10, race: 'Night-Elf', job: 'Thief' });
    expect(unit.getSPD([unit])).toBe(17);
  });

  it('clamps battle buffs to their max values', () => {
    const unit = makeCombatant();

    unit.addBattleBuff('ATK', 70, 100);
    unit.addBattleBuff('ATK', 70, 100);
    unit.addBattleEvasionBuff(25, 20);

    expect(unit.battleAtkBuffPct).toBe(100);
    expect(unit.battleEvasionBonus).toBe(20);
  });

  it('prevents immediate duplicate VFX entries and expires VFX entries', () => {
    vi.useFakeTimers();
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    const unit = makeCombatant();
    unit.addVfx('-10', 'damage');
    unit.addVfx('-10', 'damage');

    expect(unit.vfx).toHaveLength(1);

    vi.advanceTimersByTime(1500);
    expect(unit.vfx).toHaveLength(0);
  });
});
