import { describe, expect, it } from 'vitest';
import { getItemById, ITEM_DATABASE } from '../../src/data/items';

describe('items data', () => {
  it('has non-empty item database', () => {
    expect(ITEM_DATABASE.length).toBeGreaterThan(0);
  });

  it('has unique item IDs', () => {
    const ids = ITEM_DATABASE.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('returns item by ID through helper', () => {
    const first = ITEM_DATABASE[0];
    expect(getItemById(first.id)?.id).toBe(first.id);
    expect(getItemById('__missing__')).toBeUndefined();
  });

  it('ensures two-handed flag is only set for weapons', () => {
    ITEM_DATABASE.forEach(item => {
      if (item.isTwoHanded) {
        expect(item.type).toBe('WEAPON');
      }
    });
  });

  it('ensures item image paths use assets convention when provided', () => {
    ITEM_DATABASE.forEach(item => {
      if (item.imagePath) {
        expect(item.imagePath.startsWith('/assets/')).toBe(true);
      }
    });
  });

  it('ensures stat boost values are numbers when present', () => {
    ITEM_DATABASE.forEach(item => {
      const boost = item.statBoost;
      if (!boost) return;
      Object.values(boost).forEach(value => {
        expect(typeof value).toBe('number');
        expect(Number.isFinite(value)).toBe(true);
      });
    });
  });

  it('ensures restriction lists have no duplicates', () => {
    ITEM_DATABASE.forEach(item => {
      if (item.allowedJobs) {
        expect(new Set(item.allowedJobs).size).toBe(item.allowedJobs.length);
      }
      if (item.allowedRaces) {
        expect(new Set(item.allowedRaces).size).toBe(item.allowedRaces.length);
      }
    });
  });

  it('includes consumable loot items for dungeon drops', () => {
    const consumables = ITEM_DATABASE.filter(item => item.type === 'CONSUMABLE');
    expect(consumables.length).toBeGreaterThan(0);
    consumables.forEach(item => {
      expect(item.statBoost?.hp).toBeGreaterThan(0);
    });
  });
});
