import { describe, expect, it } from 'vitest';
import { ICONS, RARITY_COLORS, ROLES, TYPE_COLORS } from '../../src/data/constants';
import { STAIR_MODAL_BACKGROUNDS, NARRATIONS } from '../../src/data/narrative';
import { LEADER_PERKS as LEADER_PERKS_TYPED, PASSIVES } from '../../src/data/traits';
import { LEADER_PERKS as LEADER_PERKS_RAW } from '../../src/data/perks';

describe('static data modules', () => {
  it('has non-empty role and icon maps', () => {
    expect(Object.keys(ROLES).length).toBeGreaterThan(0);
    expect(Object.keys(ICONS).length).toBeGreaterThan(0);
  });

  it('has required type color keys', () => {
    expect(TYPE_COLORS.WEAPON).toBeDefined();
    expect(TYPE_COLORS.HAT).toBeDefined();
    expect(TYPE_COLORS.CHEST).toBeDefined();
    expect(TYPE_COLORS.SHOES).toBeDefined();
    expect(TYPE_COLORS.CONSUMABLE).toBeDefined();
    expect(TYPE_COLORS.DEFAULT).toBeDefined();
  });

  it('has required rarity color keys', () => {
    expect(RARITY_COLORS.Common).toBeDefined();
    expect(RARITY_COLORS.Uncommon).toBeDefined();
    expect(RARITY_COLORS.Rare).toBeDefined();
    expect(RARITY_COLORS.Epic).toBeDefined();
    expect(RARITY_COLORS.Legendary).toBeDefined();
  });

  it('has stair backgrounds and directional narration', () => {
    expect(STAIR_MODAL_BACKGROUNDS.length).toBeGreaterThan(0);
    STAIR_MODAL_BACKGROUNDS.forEach(bg => expect(bg.startsWith('assets/')).toBe(true));

    expect(NARRATIONS.DOWN.length).toBeGreaterThan(0);
    expect(NARRATIONS.UP.length).toBeGreaterThan(0);
  });

  it('keeps leader perk IDs unique across both perk maps', () => {
    const typedIds = Object.values(LEADER_PERKS_TYPED).map(perk => perk.id);
    const rawIds = Object.values(LEADER_PERKS_RAW).map(perk => perk.id);

    expect(new Set(typedIds).size).toBe(typedIds.length);
    expect(new Set(rawIds).size).toBe(rawIds.length);
  });

  it('defines valid passive skill metadata', () => {
    Object.values(PASSIVES).forEach(passive => {
      expect(passive.id.length).toBeGreaterThan(0);
      expect(passive.name.length).toBeGreaterThan(0);
      expect(passive.description.length).toBeGreaterThan(0);
    });
  });
});
