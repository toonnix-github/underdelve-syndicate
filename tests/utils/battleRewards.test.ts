import { describe, expect, it } from 'vitest';
import { MONSTER_LOOT_DROP_CHANCE, MONSTER_LOOT_ITEM_IDS, SCRIP_PER_MONSTER, buildBattleRewardSummary, rollEncounterRewards } from '../../src/utils/battleRewards';
import { makeCombatant } from '../helpers/combatantFactory';

describe('battleRewards', () => {
  it('grants fixed scrip per defeated enemy', () => {
    const result = rollEncounterRewards({
      defeatedEnemies: 3,
      rand: () => 0.99,
      now: 1700000000000
    });

    expect(result.scrip).toBe(3 * SCRIP_PER_MONSTER);
    expect(result.droppedItem).toBeNull();
  });

  it('drops no loot when defeated enemy count is zero', () => {
    const result = rollEncounterRewards({
      defeatedEnemies: 0,
      rand: () => 0,
      now: 1700000000000
    });

    expect(result.scrip).toBe(0);
    expect(result.droppedItem).toBeNull();
  });

  it('drops a consumable monster loot item only when roll passes the chance gate', () => {
    const result = rollEncounterRewards({
      defeatedEnemies: 2,
      rand: (() => {
        const rolls = [MONSTER_LOOT_DROP_CHANCE - 0.01, 0.4, 0.1234];
        return () => rolls.shift() ?? 0;
      })(),
      now: 1700000000000
    });

    expect(result.scrip).toBe(2 * SCRIP_PER_MONSTER);
    expect(result.droppedItem).not.toBeNull();
    expect(MONSTER_LOOT_ITEM_IDS.some(id => result.droppedItem?.id.startsWith(id))).toBe(true);
    expect(result.droppedItem?.type).toBe('CONSUMABLE');
  });

  it('builds a reward summary with surviving and fallen heroes', () => {
    const alive = makeCombatant({ name: 'Valerius', hp: 100 });
    const fallen = makeCombatant({ name: 'Kael', hp: 90 });
    fallen.hp = 0;

    const summary = buildBattleRewardSummary({
      rewards: {
        scrip: 60,
        droppedItem: {
          id: 'cons_minor_healing_vial-1',
          name: 'Minor Healing Vial',
          type: 'CONSUMABLE',
          rarity: 'Common',
          description: '',
          statBoost: { hp: 25 },
          value: 40
        }
      },
      heroes: [alive, fallen],
      defeatedEnemies: 2
    });

    expect(summary.defeatedEnemies).toBe(2);
    expect(summary.scrip).toBe(60);
    expect(summary.droppedItem?.name).toBe('Minor Healing Vial');
    expect(summary.survivingHeroes.map(hero => hero.name)).toEqual(['Valerius']);
    expect(summary.fallenHeroes.map(hero => hero.name)).toEqual(['Kael']);
  });
});
