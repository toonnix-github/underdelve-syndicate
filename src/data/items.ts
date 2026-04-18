import { Item } from '../models/Item.js';
import { ICONS } from './constants.js';
import { PASSIVES } from './traits.js';

export const LOOT_TABLE = [
    { name: "Iron Broadsword", type: "WEAPON", stats: { atk: 15 }, icon: ICONS.blade, rarity: "Common" },
    { name: "Tower Shield", type: "WEAPON", stats: { def: 12, spd: -2 }, icon: ICONS.def, rarity: "Uncommon" },
    { name: "Leather Cowl", type: "HAT", stats: { def: 5, spd: 4 }, icon: ICONS.hat, rarity: "Common" },
    { name: "Chainmail Hauberk", type: "CHEST", stats: { def: 18, spd: -3 }, icon: ICONS.armor, rarity: "Uncommon" },
    { name: "Quickstep Boots", type: "SHOES", stats: { spd: 10 }, icon: ICONS.boots, rarity: "Uncommon" },
    { name: "Ruby Signet", type: "HAT", stats: { atk: 10, def: 2 }, icon: ICONS.gem, rarity: "Rare" },
    { name: "Assassin Dagger", type: "WEAPON", stats: { atk: 12, spd: 8 }, icon: ICONS.blade, rarity: "Epic" },
    { name: "Voidwalker Treads", type: "SHOES", stats: { def: 8, spd: 15 }, icon: ICONS.boots, rarity: "Legendary" },
    { name: "Healing Potion", type: "CONSUMABLE", stats: { heal: 40 }, icon: ICONS.potion, rarity: "Uncommon" }
];

export const INITIAL_INVENTORY = [
    { name: "Healing Potion", type: "CONSUMABLE", stats: { heal: 40 }, icon: ICONS.potion, rarity: "Uncommon" },
    { name: "Healing Potion", type: "CONSUMABLE", stats: { heal: 40 }, icon: ICONS.potion, rarity: "Uncommon" }
];
