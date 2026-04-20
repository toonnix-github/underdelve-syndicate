import { Item } from '../types';

export const ITEM_DATABASE: Item[] = [
    // --- WEAPONS (1-HANDED) ---
    {
        id: 'wpn_syndicate_blade',
        name: 'Syndicate Standard Blade',
        type: 'WEAPON',
        rarity: 'Common',
        description: 'Cold-forged steel issued to most tactical units. Reliable and efficient.',
        statBoost: { atk: 5 },
        value: 150
    },
    {
        id: 'wpn_tactical_pistol',
        name: 'S-7 Tactical Pistol',
        type: 'WEAPON',
        rarity: 'Uncommon',
        description: 'A rapid-fire sidearm that favors speed over raw stopping power.',
        statBoost: { atk: 4, spd: 3 },
        value: 350
    },
    {
        id: 'wpn_vibro_shiv',
        name: 'Vibro-Shiv',
        type: 'WEAPON',
        rarity: 'Rare',
        description: 'A high-frequency blade that vibrates through armor plating.',
        statBoost: { atk: 8, spd: 5 },
        value: 850
    },
    {
        id: 'wpn_bio_catalyst',
        name: 'Bio-Catalyst Wand',
        type: 'WEAPON',
        rarity: 'Uncommon',
        description: 'Amplifies restorative bio-signals. Essential for field medics.',
        statBoost: { heal: 10, spd: 2 },
        value: 400
    },

    // --- WEAPONS (2-HANDED) ---
    {
        id: 'wpn_kinetic_sledge',
        name: 'Kinetic Sledge',
        type: 'WEAPON',
        rarity: 'Rare',
        isTwoHanded: true,
        description: 'A massive industrial hammer modified for combat. Extremely heavy.',
        statBoost: { atk: 22, def: 5, spd: -6 },
        value: 1200
    },
    {
        id: 'wpn_heavy_railgun',
        name: 'X-01 Heavy Railgun',
        type: 'WEAPON',
        rarity: 'Epic',
        isTwoHanded: true,
        description: 'A shoulder-mounted monster that fires magnetic slugs. Recoil is significant.',
        statBoost: { atk: 35, spd: -4 },
        value: 2500
    },

    // --- HEADGEAR ---
    {
        id: 'hat_tactical_visor',
        name: 'Tactical Visor',
        type: 'HAT',
        rarity: 'Common',
        description: 'Basic HUD integration for tracking enemy movement.',
        statBoost: { spd: 2 },
        value: 100
    },
    {
        id: 'hat_heavy_helm',
        name: 'Crusher Helm',
        type: 'HAT',
        rarity: 'Uncommon',
        description: 'Thick plating optimized for absorbing frontal impacts.',
        statBoost: { def: 4, atk: -1 },
        value: 300
    },

    // --- ARMOR ---
    {
        id: 'chest_kevlar_vest',
        name: 'Syndicate Kevlar-X',
        type: 'CHEST',
        rarity: 'Common',
        description: 'Standard protective vest for expeditionary forces.',
        statBoost: { def: 5 },
        value: 250
    },
    {
        id: 'chest_reactive_plate',
        name: 'Reactive Plate Mail',
        type: 'CHEST',
        rarity: 'Rare',
        description: 'Armor that explodes outward to dampen kinetic energy.',
        statBoost: { def: 12, spd: -2 },
        value: 900
    },

    // --- SHOES ---
    {
        id: 'shoes_sprint_kickers',
        name: 'Aero-Sprint Boots',
        type: 'SHOES',
        rarity: 'Uncommon',
        description: 'Lightweight footwear with compressed air thrusters.',
        statBoost: { spd: 8 },
        value: 400
    },

    // --- CONSUMABLES ---
    {
        id: 'item_medgel_pack',
        name: 'Syndicate Med-Gel',
        type: 'CONSUMABLE',
        rarity: 'Common',
        description: 'Standard issue field medicine. Restores 30 HP.',
        statBoost: { heal: 30 },
        value: 50
    },
    {
        id: 'item_adrenaline_shot',
        name: 'Adrenaline Shot',
        type: 'CONSUMABLE',
        rarity: 'Uncommon',
        description: 'Briefly pushes metabolic limits. Restores 10 HP and grants permanent +2 SPD.',
        statBoost: { heal: 10, spd: 2 },
        value: 150
    },

    // --- GOD RELICS (RARE RESTRICTED ITEMS) ---
    {
        id: 'god_mjolnir_echo',
        name: 'Mjolnir Echo',
        type: 'WEAPON',
        rarity: 'Legendary',
        imagePath: 'assets/item_god_hammer.png',
        isTwoHanded: true,
        description: 'A thunder-charged relic hammer blessed by storm gods. Massive power, brutal recoil.',
        statBoost: { atk: 32, def: 8, spd: -5 },
        allowedJobs: ['Vanguard', 'Earth-Breaker', 'Stone-Shield'],
        allowedRaces: ['Dragonkin', 'Dwarf', 'Golem'],
        value: 4800
    },
    {
        id: 'god_lunaris_bow',
        name: 'Lunaris Bow',
        type: 'WEAPON',
        rarity: 'Legendary',
        imagePath: 'assets/item_god_bow.png',
        description: 'Moon-forged bow that rewards precision and grace under pressure.',
        statBoost: { atk: 20, spd: 9 },
        allowedJobs: ['Ranger', 'Sharpshooter', 'Infiltrator'],
        allowedRaces: ['Elf', 'Human', 'Half-Elf', 'Moon-Elf'],
        value: 4300
    },
    {
        id: 'god_helm_of_veil',
        name: 'Helm of the Veil',
        type: 'HAT',
        rarity: 'Epic',
        imagePath: 'assets/item_god_helm.png',
        description: 'A sacred helm that sharpens battlefield instincts and dampens fatal blows.',
        statBoost: { def: 9, atk: 4, spd: 2 },
        allowedJobs: ['Sentinel', 'Oracle', 'Soul-Reaper'],
        allowedRaces: ['Human', 'Moon-Elf', 'Shadow-Wraith'],
        value: 3600
    },
    {
        id: 'god_aegis_plate',
        name: 'Aegis Plate',
        type: 'CHEST',
        rarity: 'Legendary',
        imagePath: 'assets/item_god_armor.png',
        description: 'Divine chestplate inscribed with warding sigils. Turns impact into resolve.',
        statBoost: { def: 18, atk: 3, spd: 1 },
        allowedJobs: ['Sentinel', 'Vanguard', 'Stone-Shield'],
        allowedRaces: ['Human', 'Dragonkin', 'Golem', 'Dwarf'],
        value: 5000
    },
    {
        id: 'god_hermes_steps',
        name: 'Steps of Hermes',
        type: 'SHOES',
        rarity: 'Epic',
        imagePath: 'assets/item_god_sandals.png',
        description: 'Winged sandals that convert momentum into speed and tactical repositioning.',
        statBoost: { spd: 15, def: 2 },
        allowedJobs: ['Shadow-Hand', 'Infiltrator', 'Ranger'],
        allowedRaces: ['Human', 'Elf', 'Half-Elf'],
        value: 3900
    }
];

export const getItemById = (id: string) => ITEM_DATABASE.find(i => i.id === id);
