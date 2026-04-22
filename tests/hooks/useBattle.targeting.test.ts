import { afterEach, describe, expect, it, vi } from 'vitest';
import { selectTargetsForSkill } from '../../src/hooks/useBattle';
import { makeCombatant } from '../helpers/combatantFactory';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useBattle target selection', () => {
  it('buff (single) targets ally only, never enemy', () => {
    const actor = makeCombatant({
      name: 'Bard',
      job: 'Bard',
      abilities: [
        {
          id: 'buff',
          name: 'Motivate',
          description: '',
          val: 10,
          type: 'buff',
          actionType: 'support',
          targetType: 'single',
          stat: 'ATK'
        }
      ]
    });
    const ally = makeCombatant({ name: 'Ally' });
    const enemy = makeCombatant({ name: 'Enemy', isHero: false });

    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const targets = selectTargetsForSkill({
      currentUnit: actor,
      isHero: true,
      selectedSkill: actor.abilities[0],
      currentHeroes: [actor, ally],
      currentEnemies: [enemy]
    });

    expect(targets.length).toBe(1);
    expect([actor.id, ally.id]).toContain(targets[0].id);
    expect(targets[0].id).not.toBe(enemy.id);
  });

  it('debuff (single) targets frontline enemy when frontline block applies', () => {
    const actor = makeCombatant({
      name: 'Caster',
      job: 'Mage',
      abilities: [
        {
          id: 'debuff',
          name: 'Weakness',
          description: '',
          val: -10,
          type: 'debuff',
          actionType: 'support',
          targetType: 'single',
          stat: 'DEF'
        }
      ]
    });
    const enemyFront = makeCombatant({ name: 'Front', isHero: false, positionLine: 'VANGUARD' });
    const enemyRear = makeCombatant({ name: 'Rear', isHero: false, positionLine: 'REARGUARD' });

    const targets = selectTargetsForSkill({
      currentUnit: actor,
      isHero: true,
      selectedSkill: actor.abilities[0],
      currentHeroes: [actor],
      currentEnemies: [enemyFront, enemyRear]
    });

    expect(targets).toHaveLength(1);
    expect(targets[0].id).toBe(enemyFront.id);
  });

  it('heal (single) targets ally with lowest HP ratio', () => {
    const healer = makeCombatant({
      name: 'Healer',
      job: 'Priest',
      abilities: [
        {
          id: 'heal',
          name: 'Mend',
          description: '',
          val: 12,
          type: 'heal',
          actionType: 'support',
          targetType: 'single'
        }
      ]
    });
    const allyA = makeCombatant({ name: 'A', hp: 100 });
    const allyB = makeCombatant({ name: 'B', hp: 100 });
    allyA.hp = 90; // 90%
    allyB.hp = 40; // 40%

    const targets = selectTargetsForSkill({
      currentUnit: healer,
      isHero: true,
      selectedSkill: healer.abilities[0],
      currentHeroes: [healer, allyA, allyB],
      currentEnemies: [makeCombatant({ isHero: false })]
    });

    expect(targets).toHaveLength(1);
    expect(targets[0].id).toBe(allyB.id);
  });

  it('damage (single, melee) respects frontline block', () => {
    const attacker = makeCombatant({
      name: 'Warrior',
      job: 'Swordsman',
      abilities: [
        {
          id: 'hit',
          name: 'Hit',
          description: '',
          val: 100,
          type: 'damage',
          actionType: 'melee',
          targetType: 'single'
        }
      ]
    });
    const enemyFront = makeCombatant({ name: 'Front', isHero: false, positionLine: 'VANGUARD' });
    const enemyRear = makeCombatant({ name: 'Rear', isHero: false, positionLine: 'REARGUARD' });

    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const targets = selectTargetsForSkill({
      currentUnit: attacker,
      isHero: true,
      selectedSkill: attacker.abilities[0],
      currentHeroes: [attacker],
      currentEnemies: [enemyFront, enemyRear]
    });

    expect(targets).toHaveLength(1);
    expect(targets[0].id).toBe(enemyFront.id);
  });

  it('damage (single, ranged) can bypass frontline', () => {
    const archer = makeCombatant({
      name: 'Archer',
      job: 'Archer',
      abilities: [
        {
          id: 'shot',
          name: 'Shot',
          description: '',
          val: 100,
          type: 'damage',
          actionType: 'ranged',
          targetType: 'single'
        }
      ]
    });
    const enemyFront = makeCombatant({ name: 'Front', isHero: false, positionLine: 'VANGUARD' });
    const enemyRear = makeCombatant({ name: 'Rear', isHero: false, positionLine: 'REARGUARD' });

    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const targets = selectTargetsForSkill({
      currentUnit: archer,
      isHero: true,
      selectedSkill: archer.abilities[0],
      currentHeroes: [archer],
      currentEnemies: [enemyFront, enemyRear]
    });

    expect(targets).toHaveLength(1);
    expect([enemyFront.id, enemyRear.id]).toContain(targets[0].id);
  });

  it('buff/debuff all-target rules are ally/enemy consistent', () => {
    const actor = makeCombatant();
    const allies = [actor, makeCombatant({ name: 'A2' })];
    const enemies = [makeCombatant({ name: 'E1', isHero: false }), makeCombatant({ name: 'E2', isHero: false })];

    const buffTargets = selectTargetsForSkill({
      currentUnit: actor,
      isHero: true,
      selectedSkill: {
        id: 'buff_all',
        name: 'Buff All',
        description: '',
        val: 10,
        type: 'buff',
        actionType: 'support',
        targetType: 'all',
        stat: 'SPD'
      },
      currentHeroes: allies,
      currentEnemies: enemies
    });

    const debuffTargets = selectTargetsForSkill({
      currentUnit: actor,
      isHero: true,
      selectedSkill: {
        id: 'debuff_all',
        name: 'Debuff All',
        description: '',
        val: -10,
        type: 'debuff',
        actionType: 'support',
        targetType: 'all',
        stat: 'DEF'
      },
      currentHeroes: allies,
      currentEnemies: enemies
    });

    expect(new Set(buffTargets.map(t => t.id))).toEqual(new Set(allies.map(a => a.id)));
    expect(new Set(debuffTargets.map(t => t.id))).toEqual(new Set(enemies.map(e => e.id)));
  });
});
