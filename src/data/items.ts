import { Item } from '../types';

export const ITEM_DATABASE: Item[] = [
  // --- WEAPONS (10) ---
  {
    id: "wpn_syndicate_blade",
    name: "Syndicate Blade",
    type: "WEAPON",
    rarity: "Common",
    description: "Standard-issue balanced tactical blade for Syndicate mercenaries.",
    statBoost: { atk: 10 },
    value: 150,
    isTwoHanded: false,
    allowedJobs: ["Swordsman", "Knight", "Thief", "Paladin"],
    imagePath: "/assets/item_weapon.png"
  },
  {
    id: "wpn_heavy_claymore",
    name: "Heavy Claymore",
    type: "WEAPON",
    rarity: "Uncommon",
    description: "A massive blackened steel blade for crushing heavy armor.",
    statBoost: { atk: 35, spd: -5 },
    value: 450,
    isTwoHanded: true,
    allowedJobs: ["Berserker", "Knight", "Paladin"],
    imagePath: "/assets/item_weapon.png"
  },
  {
    id: "wpn_scout_longbow",
    name: "Scout’s Longbow",
    type: "WEAPON",
    rarity: "Common",
    description: "Yew wood bow reinforced with iron bands.",
    statBoost: { atk: 18, spd: -3 },
    value: 200,
    isTwoHanded: true,
    allowedJobs: ["Archer", "Scout"],
    imagePath: "/assets/item_weapon.png"
  },
  {
    id: "wpn_apprentice_staff",
    name: "Apprentice Staff",
    type: "WEAPON",
    rarity: "Common",
    description: "Simple wooden staff with a small quartz focus.",
    statBoost: { atk: 16, spd: -2 },
    value: 180,
    isTwoHanded: true,
    allowedJobs: ["Mage", "Priest"],
    imagePath: "/assets/item_weapon.png"
  },
  {
    id: "wpn_iron_buckler",
    name: "Iron Buckler",
    type: "WEAPON",
    rarity: "Common",
    description: "Standard round shield for defensive parrying.",
    statBoost: { def: 15 },
    value: 120,
    isTwoHanded: false,
    allowedJobs: ["Guardian", "Knight", "Paladin"],
    imagePath: "/assets/item_weapon.png"
  },
  {
    id: "wpn_venter_daggers",
    name: "Venter Daggers",
    type: "WEAPON",
    rarity: "Rare",
    description: "Dual obsidian daggers that hum with a cursed purple aura.",
    statBoost: { atk: 18, spd: 6 },
    value: 850,
    isTwoHanded: false,
    allowedJobs: ["Thief", "Scout", "Berserker"],
    passives: [
      { id: "deadly_reflex", name: "Deadly Reflex", description: "+15% Critical Damage." }
    ],
    imagePath: "/assets/item_venter_daggers.png"
  },
  {
    id: "wpn_war_hammer",
    name: "War Hammer",
    type: "WEAPON",
    rarity: "Uncommon",
    description: "Heavy iron tool designed to cave in enemy skulls.",
    statBoost: { atk: 22, spd: -2 },
    value: 380,
    isTwoHanded: false,
    allowedJobs: ["Berserker", "Guardian", "Paladin"],
    imagePath: "/assets/item_weapon.png"
  },
  {
    id: "wpn_void_scythe",
    name: "Void Scythe",
    type: "WEAPON",
    rarity: "Epic",
    description: "A tattered bone scythe pulsating with necrotic green energy.",
    statBoost: { atk: 50, spd: -8 },
    value: 1800,
    isTwoHanded: true,
    allowedJobs: ["Berserker", "Paladin"],
    passives: [
      { id: "soul_feast", name: "Soul Feast", description: "Heals 5 HP on every killing blow." },
      { id: "venom_blade", name: "Venomous Strike", description: "10% chance to Poison on hit." }
    ],
    imagePath: "/assets/item_void_scythe.png"
  },
  {
    id: "wpn_stormcaller_staff",
    name: "Stormcaller Staff",
    type: "WEAPON",
    rarity: "Epic",
    description: "Ancient iron-bound staff that channels the fury of the clouds.",
    statBoost: { atk: 38, spd: -5, hp: 15 },
    value: 2200,
    isTwoHanded: true,
    allowedJobs: ["Mage"],
    passives: [
      { id: "chain_lightning", name: "Chain Lightning", description: "15% Proc chance to hit entire row." },
      { id: "mana_font", name: "Mana Font", description: "Adjacent allies act 5% faster." }
    ],
    imagePath: "/assets/item_stormcaller_staff.png"
  },
  {
    id: "wpn_kings_judgement",
    name: "King’s Judgement",
    type: "WEAPON",
    rarity: "Legendary",
    description: "Gilded relic of a fallen monarch, radiating a holy golden light.",
    statBoost: { atk: 45, def: 20 },
    value: 5000,
    isTwoHanded: false,
    allowedJobs: ["Knight", "Paladin", "Guardian"],
    passives: [
      { id: "royal_decree", name: "Royal Decree", description: "Grants +10% ATK to all allies in same row." },
      { id: "divine_barrier", name: "Divine Barrier", description: "10% chance to ignore incoming DMG." }
    ],
    imagePath: "/assets/item_kings_judgement.png"
  },

  // --- CHEST (5) ---
  {
    id: "chest_padded_tunic",
    name: "Padded Tunic",
    type: "CHEST",
    rarity: "Common",
    description: "Reinforced leather and wool for the journey ahead.",
    statBoost: { def: 8, spd: 2 },
    value: 100,
    allowedJobs: null,
    imagePath: "/assets/item_padded_tunic.png"
  },
  {
    id: "chest_heavy_plate",
    name: "Heavy Plate",
    type: "CHEST",
    rarity: "Uncommon",
    description: "Forged steel plating for maximum frontline protection.",
    statBoost: { def: 25, spd: -6 },
    value: 400,
    allowedJobs: ["Knight", "Guardian", "Paladin", "Berserker"],
    imagePath: "/assets/item_heavy_plate.png"
  },
  {
    id: "chest_nightshade_cloak",
    name: "Nightshade Cloak",
    type: "CHEST",
    rarity: "Rare",
    description: "Dark velvet cloak enchanted with shifting shadows.",
    statBoost: { def: 12, spd: 18 },
    value: 950,
    allowedJobs: ["Thief", "Scout", "Archer", "Mage"],
    passives: [
      { id: "flash_vanish", name: "Flash Vanish", description: "Grants +10% Evasion to Night-Elves." }
    ],
    imagePath: "/assets/item_nightshade_cloak.png"
  },
  {
    id: "chest_dragon_scale_mail",
    name: "Dragon-Scale Mail",
    type: "CHEST",
    rarity: "Epic",
    description: "Mechanical-like dragon scales that glow with volcanic heat.",
    statBoost: { atk: 10, def: 40 },
    value: 2500,
    allowedJobs: ["Knight", "Guardian", "Berserker", "Paladin"],
    passives: [
      { id: "fire_proof", name: "Fire-Proof", description: "50% Resistance to Burn/Fire effects." },
      { id: "dragon_heart", name: "Dragon Heart", description: "+5% HP Regeneration per turn." }
    ],
    imagePath: "/assets/item_dragon_scale_mail.png"
  },
  {
    id: "chest_titans_carapace",
    name: "Titan’s Carapace",
    type: "CHEST",
    rarity: "Legendary",
    description: "Monolithic stone-infused armor that laughs at mortal weapons.",
    statBoost: { def: 75, spd: -12 },
    value: 6500,
    allowedJobs: ["Guardian", "Knight"],
    passives: [
      { id: "immovable", name: "Immovable", description: "Reduces all incoming damage by a flat 10." },
      { id: "mountain_will", name: "Mountain Will", description: "Cannot be stunned or pushed." }
    ],
    imagePath: "/assets/item_titans_carapace.png"
  },

  // --- SHOES (5) ---
  {
    id: "shoes_leather_boots",
    name: "Leather Boots",
    type: "SHOES",
    rarity: "Common",
    description: "Worn traveling boots for the long dark road.",
    statBoost: { spd: 6 },
    value: 80,
    allowedJobs: null,
    imagePath: "/assets/item_shoes.png"
  },
  {
    id: "shoes_steel_greaves",
    name: "Steel Greaves",
    type: "SHOES",
    rarity: "Uncommon",
    description: "Heavy plated boots for stable stance.",
    statBoost: { def: 6, spd: 4 },
    value: 280,
    allowedJobs: ["Knight", "Guardian", "Paladin", "Berserker", "Swordsman"],
    imagePath: "/assets/item_shoes.png"
  },
  {
    id: "shoes_sprint_kickers",
    name: "Sprint Kickers",
    type: "SHOES",
    rarity: "Rare",
    description: "Lightweight leather boots etched with wind-step runes.",
    statBoost: { spd: 22 },
    value: 1100,
    allowedJobs: ["Thief", "Scout", "Archer"],
    passives: [
      { id: "quick_start", name: "Quick Start", description: "User starts battle with +20% ATB." }
    ],
    imagePath: "/assets/item_sprint_kickers.png"
  },
  {
    id: "shoes_silent_treads",
    name: "Silent Treads",
    type: "SHOES",
    rarity: "Epic",
    description: "Ghostly fibers that erase the wearer's footsteps.",
    statBoost: { spd: 12 },
    value: 2100,
    allowedJobs: ["Thief", "Scout", "Mage"],
    passives: [
      { id: "shadow_walk", name: "Shadow Walk", description: "+15% EVA; ignores single-target spells." }
    ],
    imagePath: "/assets/item_silent_treads.png"
  },
  {
    id: "shoes_chronos_sandals",
    name: "Chronos Sandals",
    type: "SHOES",
    rarity: "Legendary",
    description: "Mythical sandals that pulse with the rhythm of stalled time.",
    statBoost: { atk: 10, spd: 30 },
    value: 5800,
    allowedJobs: ["Mage", "Priest", "Scout", "Thief"],
    passives: [
      { id: "time_warp", name: "Time Warp", description: "10% chance to act immediately after their turn ends." },
      { id: "eagle_eye", name: "Eagle Eye", description: "+15% Accuracy and Hit chance." }
    ],
    imagePath: "/assets/item_chronos_sandals.png"
  },

  // --- CONSUMABLES (3) ---
  {
    id: "cons_minor_healing_vial",
    name: "Minor Healing Vial",
    type: "CONSUMABLE",
    rarity: "Common",
    description: "A small red tonic that closes cuts and restores a little vitality.",
    statBoost: { hp: 25 },
    value: 40
  },
  {
    id: "cons_field_bandage",
    name: "Field Bandage",
    type: "CONSUMABLE",
    rarity: "Common",
    description: "A quick battlefield wrap that helps a wounded fighter stay in the action.",
    statBoost: { hp: 40 },
    value: 65
  },
  {
    id: "cons_emergency_elixir",
    name: "Emergency Elixir",
    type: "CONSUMABLE",
    rarity: "Uncommon",
    description: "A bitter restorative brew reserved for dangerous dives and worse injuries.",
    statBoost: { hp: 60 },
    value: 110
  }
];

export const getItemById = (id: string) => ITEM_DATABASE.find(i => i.id === id);
