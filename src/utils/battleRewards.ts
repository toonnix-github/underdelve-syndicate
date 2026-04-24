import { Combatant } from '../models/Combatant';
import { getItemById } from '../data/items';
import { Item } from '../types';

export const SCRIP_PER_MONSTER = 30;
export const MONSTER_LOOT_DROP_CHANCE = 0.3;
export const MONSTER_LOOT_ITEM_IDS = [
  'cons_minor_healing_vial',
  'cons_field_bandage',
  'cons_emergency_elixir'
] as const;

export interface EncounterRewardResult {
  scrip: number;
  droppedItem: Item | null;
}

export interface BattleRewardSummary {
  defeatedEnemies: number;
  scrip: number;
  droppedItem: Item | null;
  survivingHeroes: Combatant[];
  fallenHeroes: Combatant[];
}

export const rollEncounterRewards = ({
  defeatedEnemies,
  rand = Math.random,
  now = Date.now()
}: {
  defeatedEnemies: number;
  rand?: () => number;
  now?: number;
}): EncounterRewardResult => {
  const enemyCount = Math.max(0, Math.floor(defeatedEnemies));
  const scrip = enemyCount * SCRIP_PER_MONSTER;

  if (enemyCount <= 0 || rand() >= MONSTER_LOOT_DROP_CHANCE) {
    return {
      scrip,
      droppedItem: null
    };
  }

  const poolIndex = Math.floor(rand() * MONSTER_LOOT_ITEM_IDS.length);
  const baseItem = getItemById(MONSTER_LOOT_ITEM_IDS[poolIndex]);

  if (!baseItem) {
    return {
      scrip,
      droppedItem: null
    };
  }

  return {
    scrip,
    droppedItem: {
      ...baseItem,
      id: `${baseItem.id}-${now}-${Math.floor(rand() * 10000)}`
    }
  };
};

export const buildBattleRewardSummary = ({
  rewards,
  heroes,
  defeatedEnemies
}: {
  rewards: EncounterRewardResult;
  heroes: Combatant[];
  defeatedEnemies: number;
}): BattleRewardSummary => ({
  defeatedEnemies: Math.max(0, Math.floor(defeatedEnemies)),
  scrip: rewards.scrip,
  droppedItem: rewards.droppedItem,
  survivingHeroes: heroes.filter(hero => hero.hp > 0),
  fallenHeroes: heroes.filter(hero => hero.hp <= 0)
});
