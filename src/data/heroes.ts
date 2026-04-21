import { Ability, Trait, Role, Race, Job } from '../types';

export interface HeroTemplate {
    name: string;
    hp: number;
    atk: number;
    def: number;
    spd: number;
    role: Role;
    job: Job;
    race: Race;
    imageId: string;
    trait: Trait;
    skills: Ability[];
    initialEquipment?: string[];
}

export const HERO_ROSTER: HeroTemplate[] = [
    {
        name: 'Valerius', hp: 150, atk: 12, def: 18, spd: 9, role: 'TANK', 
        job: 'Paladin', race: 'Human', imageId: 'hero_valerius',
        trait: { id: 'iron_aura', name: 'Aura of Iron', description: 'Provides 10% global damage reduction to the entire party.' },
        skills: [
            { id: 'v_s1', name: 'Shield Slam', description: 'A steady frontline hit.', val: 100, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'v_s2', name: 'Guardian Pulse', description: 'Rare chance to heal the entire party.', val: 16, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.12 }
        ],
        initialEquipment: ['wpn_syndicate_blade', 'chest_padded_tunic']
    },
    {
        name: 'Slyn', hp: 85, atk: 18, def: 6, spd: 22, role: 'DPS', 
        job: 'Thief', race: 'Night-Elf', imageId: 'hero_slyn',
        trait: { id: 'infiltrator', name: 'Infiltrator', description: 'Ignores Vanguard protection; can strike any enemy freely.' },
        skills: [
            { id: 's_s1', name: 'Backstab', description: 'A vicious single-target strike.', val: 130, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 's_s2', name: 'Shadow Rain', description: 'Chance to pepper all enemies with needles.', val: 80, type: 'damage', actionType: 'ranged', targetType: 'all', procChance: 0.15 }
        ],
        initialEquipment: ['wpn_venter_daggers', 'shoes_sprint_kickers']
    },
    {
        name: 'Morgra', hp: 92, atk: 9, def: 10, spd: 14, role: 'HEALER', 
        job: 'Priest', race: 'Undead', imageId: 'hero_morgra',
        trait: { id: 'blood_pact', name: 'Blood Pact', description: 'Heals are 40% stronger, but she loses 5 HP per cast.' },
        skills: [
            { id: 'm_s1', name: 'Blood Mend', description: 'High-potency single target heal.', val: 18, type: 'heal', actionType: 'support', targetType: 'single' },
            { id: 'm_s2', name: 'Sanguine Burst', description: 'Rare chance to heal all allies at once.', val: 12, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.12 }
        ],
        initialEquipment: ['wpn_apprentice_staff', 'chest_padded_tunic']
    },
    {
        name: 'Draka', hp: 160, atk: 13, def: 20, spd: 7, role: 'TANK', 
        job: 'Guardian', race: 'Dragon', imageId: 'hero_draka',
        trait: { id: 'dragon_scales', name: 'Dragon Scales', description: 'Reflects 6 damage whenever an enemy strikes him.' },
        skills: [
            { id: 'd_s1', name: 'Crimson Mace', description: 'A crushing frontline smash.', val: 98, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'd_s2', name: 'Dragon Breath', description: 'Chance to wash the enemy row in flame.', val: 78, type: 'damage', actionType: 'magic', targetType: 'row', procChance: 0.11 }
        ],
        initialEquipment: ['wpn_iron_buckler', 'chest_heavy_plate']
    },
    {
        name: 'Kael', hp: 90, atk: 15, def: 8, spd: 18, role: 'DPS', 
        job: 'Archer', race: 'Elf', imageId: 'hero_kael',
        trait: { id: 'steady_aim', name: 'Steady Aim', description: 'Gains +25% damage bonus when targeting Rearguard.' },
        skills: [
            { id: 'k_s1', name: 'Twin Arrow', description: 'Precision ranged strike.', val: 115, type: 'damage', actionType: 'ranged', targetType: 'single' },
            { id: 'k_s2', name: 'Rain of Steel', description: 'Chance to unleash a volley on all opponents.', val: 75, type: 'damage', actionType: 'ranged', targetType: 'all', procChance: 0.15 }
        ],
        initialEquipment: ['wpn_scout_longbow']
    },
    {
        name: 'Vex', hp: 100, atk: 18, def: 5, spd: 20, role: 'DPS', 
        job: 'Berserker', race: 'Demon', imageId: 'hero_vex',
        trait: { id: 'soul_reaper', name: 'Soul Reaper', description: 'Recovers 10 HP whenever an enemy falls.' },
        skills: [
            { id: 'vx_s1', name: 'Soul Siphon', description: 'Rips vitality from a victim.', val: 114, type: 'damage', actionType: 'magic', targetType: 'single' },
            { id: 'vx_s2', name: 'Death Nova', description: 'Chance to erupt with spectral force.', val: 76, type: 'damage', actionType: 'magic', targetType: 'all', procChance: 0.13 }
        ],
        initialEquipment: ['wpn_void_scythe']
    },
    {
        name: 'Grimm', hp: 200, atk: 10, def: 22, spd: 5, role: 'TANK', 
        job: 'Guardian', race: 'Titan', imageId: 'hero_grimm',
        trait: { id: 'undying', name: 'Undying', description: 'The first lethal blow leaves him at 1 HP.' },
        skills: [
            { id: 'g_s1', name: 'Tremor', description: 'A heavy strike that rattles the frontline.', val: 102, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'g_s2', name: 'Stone Wall', description: 'Chance to brace and restore the party.', val: 11, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.1 }
        ],
        initialEquipment: ['wpn_iron_buckler', 'chest_titans_carapace']
    },
    {
        name: 'Lira', hp: 115, atk: 7, def: 10, spd: 22, role: 'SUPPORT', 
        job: 'Bard', race: 'Human', imageId: 'hero_lira',
        trait: { id: 'battle_hymn', name: 'Battle Hymn', description: 'Increases party SPD by 5% and ATK by 5% through harmonized morale.' },
        skills: [
            { id: 'li_s1', name: 'Echoing Note', description: 'A minor ranged sound pulse.', val: 80, type: 'damage', actionType: 'ranged', targetType: 'single' },
            { id: 'li_s2', name: 'Melody of Vigor', description: 'Increases a single ally\'s ATK by 20%.', val: 20, type: 'buff', actionType: 'support', targetType: 'single', stat: 'ATK', procChance: 0.20 },
            { id: 'li_s3', name: 'Syndicate Anthem', description: 'Bolsters the entire party, increasing ATK and DEF by 10%.', val: 10, type: 'buff', actionType: 'support', targetType: 'all', stat: 'ATK', procChance: 0.12 }
        ],
        initialEquipment: ['wpn_apprentice_staff', 'shoes_sprint_kickers']
    },
    {
        name: 'Borum', hp: 130, atk: 20, def: 12, spd: 8, role: 'DPS', 
        job: 'Berserker', race: 'Orc', imageId: 'hero_borum',
        trait: { id: 'sunder', name: 'Sunder', description: 'Strikes reduce target DEF permanently.' },
        skills: [
            { id: 'b_s1', name: 'Hammer Crash', description: 'Massive single-target impact.', val: 125, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'b_s2', name: 'Earthquake', description: 'Chance to strike entire front row.', val: 85, type: 'damage', actionType: 'melee', targetType: 'row', procChance: 0.12 }
        ],
        initialEquipment: ['wpn_heavy_claymore']
    },
    {
        name: 'Krix', hp: 85, atk: 18, def: 10, spd: 12, role: 'DPS', 
        job: 'Mage', race: 'Dwarf', imageId: 'hero_krix',
        trait: { id: 'overclock', name: 'Overclock', description: 'Chance to refill ATB after acting.' },
        skills: [
            { id: 'kr_s1', name: 'Arcane Blast', description: 'A burst of energy.', val: 120, type: 'damage', actionType: 'magic', targetType: 'single' },
            { id: 'kr_s2', name: 'Storm Call', description: 'Chance to lightning strike row.', val: 90, type: 'damage', actionType: 'magic', targetType: 'row', procChance: 0.14 }
        ],
        initialEquipment: ['wpn_stormcaller_staff']
    },
    {
        name: 'Elara', hp: 82, atk: 8, def: 12, spd: 11, role: 'HEALER', 
        job: 'Priest', race: 'Elf', imageId: 'hero_elara',
        trait: { id: 'moonlight_rain', name: 'Moonlight Rain', description: 'Restorative arts sometimes spill over party.' },
        skills: [
            { id: 'e_s1', name: 'Holy Strike', description: 'Melee strike that heals slightly.', val: 90, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'e_s2', name: 'Grace', description: 'Chance to restore party HP.', val: 12, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.16 }
        ],
        initialEquipment: ['wpn_syndicate_blade', 'chest_dragon_scale_mail']
    },
    {
        name: 'Zarek', hp: 95, atk: 14, def: 12, spd: 13, role: 'SUPPORT', 
        job: 'Mage', race: 'Undead', imageId: 'hero_zarek',
        trait: { id: 'withering_curse', name: 'Withering Curse', description: 'Enemies start battle with -10% Defense.' },
        skills: [
            { id: 'z_s1', name: 'Shadow Bolt', description: 'Dark energy blast.', val: 110, type: 'damage', actionType: 'magic', targetType: 'single' },
            { id: 'z_s2', name: 'Enfeeble', description: 'Reduces an enemy\'s Attack by 25%.', val: -25, type: 'debuff', actionType: 'support', targetType: 'single', stat: 'ATK', procChance: 0.18 }
        ],
        initialEquipment: ['wpn_stormcaller_staff']
    },
    {
        name: 'Seraphina', hp: 140, atk: 10, def: 16, spd: 12, role: 'TANK', 
        job: 'Paladin', race: 'Human', imageId: 'hero_seraphina',
        trait: { id: 'divine_shield', name: 'Divine Shield', description: 'Has a 10% chance to completely negate incoming damage.' },
        skills: [
            { id: 'sr_s1', name: 'Holy Strike', description: 'A blow that burns with light.', val: 105, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'sr_s2', name: 'Consecration', description: 'Buffs the party\'s DEF by 15%.', val: 15, type: 'buff', actionType: 'support', targetType: 'all', stat: 'DEF', procChance: 0.15 }
        ],
        initialEquipment: ['wpn_syndicate_blade', 'chest_heavy_plate']
    },
    {
        name: 'Thok', hp: 125, atk: 16, def: 10, spd: 10, role: 'SUPPORT', 
        job: 'Priest', race: 'Orc', imageId: 'hero_thok',
        trait: { id: 'totem_mastery', name: 'Totem Mastery', description: 'All party-wide buffs are 20% more effective.' },
        skills: [
            { id: 'th_s1', name: 'Lightning Lash', description: 'Crackling elemental strike.', val: 100, type: 'damage', actionType: 'magic', targetType: 'single' },
            { id: 'th_s2', name: 'Bloodlust', description: 'Increases entire party\'s SPD by 15%.', val: 15, type: 'buff', actionType: 'support', targetType: 'all', stat: 'SPD', procChance: 0.14 }
        ],
        initialEquipment: ['wpn_heavy_claymore', 'shoes_sprint_kickers']
    },
    {
        name: 'Nyx', hp: 78, atk: 22, def: 4, spd: 25, role: 'DPS', 
        job: 'Thief', race: 'Night-Elf', imageId: 'hero_nyx',
        trait: { id: 'lethality', name: 'Lethality', description: 'Deals 50% more damage if the target is below 40% HP.' },
        skills: [
            { id: 'nx_s1', name: 'Ambush', description: 'A blindingly fast strike.', val: 140, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'nx_s2', name: 'Poison Cloud', description: 'Debuffs target DEF by 20%.', val: -20, type: 'debuff', actionType: 'support', targetType: 'single', stat: 'DEF', procChance: 0.20 }
        ],
        initialEquipment: ['wpn_venter_daggers']
    }
];
