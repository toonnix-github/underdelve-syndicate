import { describe, expect, it } from 'vitest';
import { BOSS_POOL, ENEMY_POOL, FLOOR_SCALING } from '../../src/data/enemies';

describe('enemies data', () => {
  it('has base enemies and bosses configured', () => {
    expect(ENEMY_POOL.length).toBeGreaterThan(0);
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
    expect(FLOOR_SCALING.TRAP_DMG_BASE).toBeGreaterThan(0);
    expect(FLOOR_SCALING.TRAP_DMG_FLOOR).toBeGreaterThan(0);
  });
});
