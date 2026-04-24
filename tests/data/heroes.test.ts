import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HERO_ROSTER } from '../../src/data/heroes';
import { ITEM_DATABASE } from '../../src/data/items';

describe('heroes data', () => {
  it('has a non-empty roster', () => {
    expect(HERO_ROSTER.length).toBeGreaterThan(0);
  });

  it('has unique hero names', () => {
    const names = HERO_ROSTER.map(hero => hero.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('has unique image IDs', () => {
    const imageIds = HERO_ROSTER.map(hero => hero.imageId);
    expect(new Set(imageIds).size).toBe(imageIds.length);
  });

  it('ensures each hero has at least one skill and valid stats', () => {
    HERO_ROSTER.forEach(hero => {
      expect(hero.skills.length).toBeGreaterThan(0);
      expect(hero.hp).toBeGreaterThan(0);
      expect(hero.atk).toBeGreaterThanOrEqual(0);
      expect(hero.def).toBeGreaterThanOrEqual(0);
      expect(hero.spd).toBeGreaterThan(0);
    });
  });

  it('ensures buff/debuff skills include target stat', () => {
    HERO_ROSTER.forEach(hero => {
      hero.skills.forEach(skill => {
        if (skill.type === 'buff' || skill.type === 'debuff') {
          expect(skill.stat).toBeDefined();
        }
      });
    });
  });

  it('ensures skill ids are unique across the roster', () => {
    const allSkillIds = HERO_ROSTER.flatMap(hero => hero.skills.map(skill => skill.id));
    expect(new Set(allSkillIds).size).toBe(allSkillIds.length);
  });

  it('ensures initial equipment IDs point to known items', () => {
    const itemIds = new Set(ITEM_DATABASE.map(item => item.id));
    HERO_ROSTER.forEach(hero => {
      (hero.initialEquipment ?? []).forEach(itemId => {
        expect(itemIds.has(itemId)).toBe(true);
      });
    });
  });

  it('keeps starting loadouts below epic rarity for balance', () => {
    const itemLookup = new Map(ITEM_DATABASE.map(item => [item.id, item]));
    HERO_ROSTER.forEach(hero => {
      (hero.initialEquipment ?? []).forEach(itemId => {
        const item = itemLookup.get(itemId);
        expect(item).toBeDefined();
        expect(item?.rarity === 'Epic' || item?.rarity === 'Legendary').toBe(false);
      });
    });
  });

  it('ensures starting equipment respects hero race and job restrictions', () => {
    const itemLookup = new Map(ITEM_DATABASE.map(item => [item.id, item]));
    HERO_ROSTER.forEach(hero => {
      (hero.initialEquipment ?? []).forEach(itemId => {
        const item = itemLookup.get(itemId);
        expect(item).toBeDefined();
        if (!item) return;
        if (item.allowedJobs) {
          expect(item.allowedJobs.includes(hero.job)).toBe(true);
        }
        if (item.allowedRaces) {
          expect(item.allowedRaces.includes(hero.race)).toBe(true);
        }
      });
    });
  });

  it('ensures hero portrait assets exist', () => {
    HERO_ROSTER.forEach(hero => {
      const heroPath = path.resolve(process.cwd(), 'assets', `${hero.imageId}.png`);
      expect(fs.existsSync(heroPath)).toBe(true);
    });
  });
});
