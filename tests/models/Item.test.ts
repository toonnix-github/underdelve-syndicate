import { describe, expect, it, vi } from 'vitest';
import { Item } from '../../src/models/Item';

describe('Item model', () => {
  it('constructs item with defaults', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const item = new Item('Iron Hat', 'HAT', { def: 5 }, 'hat_icon');

    expect(item.name).toBe('Iron Hat');
    expect(item.type).toBe('HAT');
    expect(item.rarity).toBe('Common');
    expect(item.passives).toEqual([]);
    expect(item.statBoost.def).toBe(5);
    expect(item.id.length).toBeGreaterThan(0);
  });

  it('constructs item with custom rarity and passives', () => {
    const item = new Item(
      'Mythic Blade',
      'WEAPON',
      { atk: 40, spd: -5 },
      'blade_icon',
      'Legendary',
      [{ id: 'bleed', name: 'Bleed', description: 'Causes bleed.' }]
    );

    expect(item.rarity).toBe('Legendary');
    expect(item.passives).toHaveLength(1);
    expect(item.passives[0].id).toBe('bleed');
  });
});
