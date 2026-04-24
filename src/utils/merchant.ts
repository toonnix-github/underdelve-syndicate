import { Combatant } from '../models/Combatant';
import { Item } from '../types';

export interface MerchantOffer {
  id: string;
  item: Item;
  price: number;
}

export interface MerchantPurchaseResult {
  status: 'ok' | 'not_found' | 'insufficient';
  nextOffers: MerchantOffer[];
  scripDelta: number;
  grantedItem: Item | null;
  message: string;
}

type EquipmentSlot = 'weapon1' | 'weapon2' | 'hat' | 'chest' | 'shoes';

export interface MerchantStatPreview {
  atk: number;
  def: number;
  spd: number;
  hp: number;
}

export interface MerchantHeroEquipPreview {
  heroId: string;
  heroName: string;
  slot: EquipmentSlot | null;
  qualified: boolean;
  restrictionReason: string | null;
  current: MerchantStatPreview;
  after: MerchantStatPreview;
}

const getEffectiveHp = (unit: Combatant): number => {
  const hpBoost = Object.values(unit.equipment || {}).reduce((sum, entry: any) => {
    if (!entry || entry.isPlaceholder) return sum;
    return sum + (entry.statBoost?.hp ?? 0);
  }, 0);

  return unit.maxHp + hpBoost;
};

const getCombatPreviewStats = (unit: Combatant, party: Combatant[]): MerchantStatPreview => ({
  atk: unit.getATK(party),
  def: unit.getDEF(party),
  spd: unit.getSPD(party),
  hp: getEffectiveHp(unit)
});

const getRestrictionReason = (hero: Combatant, item: Item): string | null => {
  const raceBlocked = Boolean(item.allowedRaces && !item.allowedRaces.includes(hero.race));
  const jobBlocked = Boolean(item.allowedJobs && !item.allowedJobs.includes(hero.job));

  if (raceBlocked && jobBlocked) return 'Race & Job mismatch';
  if (raceBlocked) return 'Race mismatch';
  if (jobBlocked) return 'Job mismatch';
  return null;
};

const getSuggestedSlot = (hero: Combatant, item: Item): EquipmentSlot | null => {
  if (item.type === 'HAT') return 'hat';
  if (item.type === 'CHEST') return 'chest';
  if (item.type === 'SHOES') return 'shoes';
  if (item.type !== 'WEAPON') return null;

  const weapon1 = hero.equipment?.weapon1;
  const weapon2 = hero.equipment?.weapon2;

  if (!weapon1) return 'weapon1';
  if (weapon1?.isTwoHanded) return 'weapon1';
  if (!weapon2 || weapon2?.isPlaceholder) return 'weapon2';
  return 'weapon1';
};

const simulateEquip = (hero: Combatant, item: Item, slot: EquipmentSlot | null) => {
  if (!slot) return;

  if (item.type === 'WEAPON') {
    if (item.isTwoHanded) {
      hero.equipment.weapon1 = item;
      hero.equipment.weapon2 = { ...item, isPlaceholder: true, parentSlot: 'weapon1' };
      return;
    }

    if (slot === 'weapon1') {
      hero.equipment.weapon1 = item;
      if (hero.equipment.weapon2?.isPlaceholder) {
        hero.equipment.weapon2 = null;
      }
      return;
    }

    hero.equipment.weapon2 = item;
    return;
  }

  hero.equipment[slot] = item;
};

export const buildMerchantEquipPreviews = ({
  heroes,
  item
}: {
  heroes: Combatant[];
  item: Item;
}): MerchantHeroEquipPreview[] => {
  return heroes.map((hero, heroIndex) => {
    const restrictionReason = getRestrictionReason(hero, item);
    const qualified = restrictionReason === null;
    const slot = getSuggestedSlot(hero, item);
    const current = getCombatPreviewStats(hero, heroes);

    if (!qualified || !slot) {
      return {
        heroId: hero.id,
        heroName: hero.name,
        slot,
        qualified,
        restrictionReason,
        current,
        after: current
      };
    }

    const previewParty = heroes.map(member => member.clone());
    simulateEquip(previewParty[heroIndex], item, slot);
    const after = getCombatPreviewStats(previewParty[heroIndex], previewParty);

    return {
      heroId: hero.id,
      heroName: hero.name,
      slot,
      qualified,
      restrictionReason,
      current,
      after
    };
  });
};

export const purchaseMerchantOffer = ({
  offers,
  offerId,
  scrip,
  now = Date.now(),
  rand = Math.random
}: {
  offers: MerchantOffer[];
  offerId: string;
  scrip: number;
  now?: number;
  rand?: () => number;
}): MerchantPurchaseResult => {
  const offer = offers.find(entry => entry.id === offerId);
  if (!offer) {
    return {
      status: 'not_found',
      nextOffers: offers,
      scripDelta: 0,
      grantedItem: null,
      message: 'OFFER_NOT_FOUND'
    };
  }

  if (scrip < offer.price) {
    return {
      status: 'insufficient',
      nextOffers: offers,
      scripDelta: 0,
      grantedItem: null,
      message: 'INSUFFICIENT SCRIP'
    };
  }

  return {
    status: 'ok',
    nextOffers: offers.filter(entry => entry.id !== offerId),
    scripDelta: -offer.price,
    grantedItem: {
      ...offer.item,
      id: `${offer.item.id}-${now}-${Math.floor(rand() * 10000)}`
    },
    message: `PURCHASED: ${offer.item.name}`
  };
};
