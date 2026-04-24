import { describe, expect, it } from 'vitest';
import { Item } from '../../src/types';
import { makeCombatant } from '../helpers/combatantFactory';
import { purchaseMerchantOffer, MerchantOffer, buildMerchantEquipPreviews } from '../../src/utils/merchant';
import { ITEM_DATABASE } from '../../src/data/items';

const baseItem = ITEM_DATABASE[0];

const makeOffer = (id = 'offer-1', price = 300): MerchantOffer => ({
  id,
  item: { ...baseItem, id: `item-${id}` },
  price
});

describe('merchant purchase', () => {
  it('returns insufficient when scrip is not enough and keeps offers unchanged', () => {
    const offers = [makeOffer('offer-low', 500)];
    const result = purchaseMerchantOffer({
      offers,
      offerId: 'offer-low',
      scrip: 120,
      now: 1700000000000,
      rand: () => 0.1
    });

    expect(result.status).toBe('insufficient');
    expect(result.scripDelta).toBe(0);
    expect(result.grantedItem).toBeNull();
    expect(result.nextOffers).toEqual(offers);
  });

  it('purchases exactly once and removes the offer from next state', () => {
    const offers = [makeOffer('offer-buy', 250), makeOffer('offer-2', 400)];
    const result = purchaseMerchantOffer({
      offers,
      offerId: 'offer-buy',
      scrip: 999,
      now: 1700000000000,
      rand: () => 0.1234
    });

    expect(result.status).toBe('ok');
    expect(result.scripDelta).toBe(-250);
    expect(result.grantedItem).not.toBeNull();
    expect(result.grantedItem?.id).toBe('item-offer-buy-1700000000000-1234');
    expect(result.nextOffers.map(offer => offer.id)).toEqual(['offer-2']);
  });

  it('second attempt on already-removed offer is not_found and has no extra penalty', () => {
    const offers = [makeOffer('offer-buy', 250), makeOffer('offer-2', 400)];
    const first = purchaseMerchantOffer({
      offers,
      offerId: 'offer-buy',
      scrip: 999,
      now: 1700000000000,
      rand: () => 0.1234
    });

    const second = purchaseMerchantOffer({
      offers: first.nextOffers,
      offerId: 'offer-buy',
      scrip: 999 + first.scripDelta,
      now: 1700000000001,
      rand: () => 0.2222
    });

    expect(first.status).toBe('ok');
    expect(second.status).toBe('not_found');
    expect(second.scripDelta).toBe(0);
    expect(second.grantedItem).toBeNull();
    expect(second.nextOffers).toEqual(first.nextOffers);
  });
});

describe('merchant equip preview', () => {
  it('shows projected stats only for qualified heroes', () => {
    const swordsman = makeCombatant({
      name: 'Blade',
      job: 'Swordsman',
      race: 'Human',
      atk: 10,
      def: 8,
      spd: 10
    });
    const priest = makeCombatant({
      name: 'Light',
      job: 'Priest',
      race: 'Human',
      atk: 10,
      def: 8,
      spd: 10
    });
    const item: Item = {
      id: 'weapon_preview',
      name: 'Preview Blade',
      type: 'WEAPON',
      rarity: 'Common',
      description: 'Test blade',
      value: 100,
      statBoost: { atk: 12, spd: -1 },
      allowedJobs: ['Swordsman']
    };

    const previews = buildMerchantEquipPreviews({ heroes: [swordsman, priest], item });
    const swordsmanPreview = previews.find(entry => entry.heroName === 'Blade');
    const priestPreview = previews.find(entry => entry.heroName === 'Light');

    expect(swordsmanPreview?.qualified).toBe(true);
    expect((swordsmanPreview?.after.atk ?? 0) > (swordsmanPreview?.current.atk ?? 0)).toBe(true);
    expect((swordsmanPreview?.after.spd ?? 0) < (swordsmanPreview?.current.spd ?? 0)).toBe(true);

    expect(priestPreview?.qualified).toBe(false);
    expect(priestPreview?.restrictionReason).toBe('Job mismatch');
    expect(priestPreview?.after).toEqual(priestPreview?.current);
  });

  it('suggests weapon2 when hero already has one one-handed weapon equipped', () => {
    const ranger = makeCombatant({
      name: 'Arrow',
      job: 'Archer',
      race: 'Elf',
      atk: 12,
      def: 7,
      spd: 13
    });
    ranger.equipment.weapon1 = {
      id: 'existing_bow',
      name: 'Existing Bow',
      type: 'WEAPON',
      rarity: 'Common',
      description: '',
      value: 1,
      statBoost: { atk: 10 }
    };

    const offhand: Item = {
      id: 'side_dagger',
      name: 'Side Dagger',
      type: 'WEAPON',
      rarity: 'Common',
      description: '',
      value: 10,
      statBoost: { atk: 5 },
      allowedJobs: ['Archer']
    };

    const [preview] = buildMerchantEquipPreviews({ heroes: [ranger], item: offhand });
    expect(preview.slot).toBe('weapon2');
    expect(preview.qualified).toBe(true);
    expect(preview.after.atk).toBeGreaterThan(preview.current.atk);
  });

  it('adds hp preview delta when item grants hp', () => {
    const guardian = makeCombatant({
      name: 'Wall',
      job: 'Guardian',
      race: 'Human',
      hp: 100
    });
    const chest: Item = {
      id: 'hp_chest',
      name: 'Guardian Plate',
      type: 'CHEST',
      rarity: 'Rare',
      description: '',
      value: 400,
      statBoost: { hp: 20 },
      allowedJobs: ['Guardian']
    };

    const [preview] = buildMerchantEquipPreviews({ heroes: [guardian], item: chest });
    expect(preview.qualified).toBe(true);
    expect(preview.after.hp).toBe(preview.current.hp + 20);
  });
});
