import { describe, expect, it } from 'vitest';
import { BOSS_POOL, ENEMY_POOL, FLOOR_SCALING, getEnemyPoolForFloor, getEncounterEnemyCountRange, scaleEnemyStatsForFloor } from '../../src/data/enemies';

describe('enemies data', () => {
  it('has base enemies and bosses configured', () => {
    expect(ENEMY_POOL.length).toBeGreaterThanOrEqual(13);
    expect(BOSS_POOL.length).toBeGreaterThan(0);
  });

  it('ensures enemies have at least one skill and valid combat stats', () => {
    [...ENEMY_POOL, ...BOSS_POOL].forEach(enemy => {
      expect(enemy.hp).toBeGreaterThan(0);
      expect(enemy.spd).toBeGreaterThan(0);
      expect(enemy.pwr).toBeGreaterThanOrEqual(0);
      expect(enemy.def).toBeGreaterThanOrEqual(0);
      expect(enemy.skills.length).toBeGreaterThan(0);
    });
  });

  it('ensures enemy skill ids are unique across all enemy definitions', () => {
    const ids = [...ENEMY_POOL, ...BOSS_POOL].flatMap(enemy => enemy.skills.map(skill => skill.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has sane positive floor scaling constants', () => {
    expect(FLOOR_SCALING.HP_PER_FLOOR).toBeGreaterThan(0);
    expect(FLOOR_SCALING.PWR_PER_FLOOR).toBeGreaterThan(0);
    expect(FLOOR_SCALING.DEF_PER_FLOOR).toBeGreaterThan(0);
    expect(FLOOR_SCALING.SPD_PER_FLOOR).toBeGreaterThan(0);
    expect(FLOOR_SCALING.TRAP_DMG_BASE).toBeGreaterThan(0);
    expect(FLOOR_SCALING.TRAP_DMG_FLOOR).toBeGreaterThan(0);
  });

  it('keeps floor 1 enemy pool to single-target melee threats only', () => {
    const floor1Enemies = getEnemyPoolForFloor(1);

    expect(floor1Enemies.length).toBeGreaterThan(0);
    floor1Enemies.forEach(enemy => {
      expect(enemy.skills.every(skill => skill.actionType === 'melee')).toBe(true);
      expect(enemy.skills.every(skill => skill.targetType === 'single')).toBe(true);
      expect(enemy.pwr).toBeLessThanOrEqual(9);
      expect(enemy.hp).toBeLessThanOrEqual(70);
    });
  });

  it('narrows early encounter counts and scales enemies moderately by floor', () => {
    expect(getEncounterEnemyCountRange(1)).toEqual({ min: 1, max: 2 });
    expect(getEncounterEnemyCountRange(3)).toEqual({ min: 1, max: 3 });
    expect(getEncounterEnemyCountRange(5)).toEqual({ min: 2, max: 3 });

    const baseEnemy = getEnemyPoolForFloor(1)[0];
    const scaled = scaleEnemyStatsForFloor(baseEnemy, 5);
    expect(scaled.hp).toBeGreaterThan(baseEnemy.hp);
    expect(scaled.pwr).toBeGreaterThan(baseEnemy.pwr);
    expect(scaled.spd).toBeGreaterThanOrEqual(baseEnemy.spd);
  });
});
