import { describe, expect, it, vi, afterEach } from 'vitest';
import { calculateDamage, calculateHeal, calculateHitChance, getSkillActionType, rollHitCheck } from '../../src/utils/combatMath';
import { makeCombatant } from '../helpers/combatantFactory';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('combatMath', () => {
  it('returns melee as default skill action type', () => {
    expect(getSkillActionType()).toBe('melee');
  });

  it('returns provided skill action type', () => {
    expect(
      getSkillActionType({
        id: 's1',
        name: 'Arrow',
        description: 'Shot',
        val: 100,
        type: 'damage',
        actionType: 'ranged',
        targetType: 'single'
      })
    ).toBe('ranged');
  });

  it('clamps hit chance to max 98', () => {
    const attacker = makeCombatant({ spd: 90, job: 'Thief' });
    const target = makeCombatant({ spd: 1, job: 'Guardian', race: 'Titan' });
    const chance = calculateHitChance(attacker, target, [attacker], [target], 'ranged');
    expect(chance).toBe(98);
  });

  it('clamps hit chance to min 60', () => {
    const attacker = makeCombatant({ spd: 1, job: 'Guardian', race: 'Titan' });
    const target = makeCombatant({ spd: 70, job: 'Scout', race: 'Night-Elf' });
    target.addBattleEvasionBuff(20, 20);
    const chance = calculateHitChance(attacker, target, [attacker], [target], 'melee');
    expect(chance).toBe(60);
  });

  it('rollHitCheck respects rolled value against hit chance', () => {
    const attacker = makeCombatant({ spd: 20, job: 'Thief' });
    const target = makeCombatant({ spd: 10, job: 'Guardian' });

    vi.spyOn(Math, 'random').mockReturnValueOnce(0);
    const hitResult = rollHitCheck(attacker, target, [attacker], [target], 'melee');
    expect(hitResult.hit).toBe(true);
    expect(hitResult.roll).toBe(1);

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9999);
    const missResult = rollHitCheck(attacker, target, [attacker], [target], 'melee');
    expect(missResult.roll).toBe(100);
    expect(missResult.hit).toBe(false);
  });

  it('applies row modifiers for melee damage', () => {
    const attackerFront = makeCombatant({ atk: 20, job: 'Mage', race: 'Human', positionLine: 'VANGUARD' });
    const attackerRear = makeCombatant({ atk: 20, job: 'Mage', race: 'Human', positionLine: 'REARGUARD' });
    const target = makeCombatant({ def: 0, job: 'Mage', race: 'Human' });

    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const frontDmg = calculateDamage(attackerFront, target, [attackerFront], [target], 'melee');
    const rearDmg = calculateDamage(attackerRear, target, [attackerRear], [target], 'melee');

    expect(frontDmg).toBeGreaterThan(rearDmg);
    expect(frontDmg).toBe(22);
    expect(rearDmg).toBe(13);
  });

  it('applies defensive aura and immovable damage reduction', () => {
    const attacker = makeCombatant({ atk: 60, job: 'Mage', race: 'Human' });
    const target = makeCombatant({ def: 0, job: 'Mage', race: 'Human' });
    target.equipment.chest = { skillName: 'Immovable' };
    const ironAuraAlly = makeCombatant({
      name: 'Aura Tank',
      trait: { id: 'iron_aura', name: 'Aura', description: 'DR' }
    });

    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const dmg = calculateDamage(attacker, target, [attacker], [target, ironAuraAlly], 'magic');
    // 60 (no def) -> row modifier (vanguard magic unchanged) => 60 -> iron aura 54 -> immovable 44
    expect(dmg).toBe(44);
  });

  it('calculates heal with blood pact and rearguard support bonus', () => {
    const caster = makeCombatant({
      job: 'Priest',
      race: 'Human',
      positionLine: 'REARGUARD',
      trait: { id: 'blood_pact', name: 'Blood Pact', description: '' }
    });

    const heal = calculateHeal(caster, 10, [caster]);
    expect(heal).toBe(17);
  });
});
