import { Ability, Trait, Role } from '../types';

export interface HeroTemplate {
    name: string;
    hp: number;
    atk: number;
    def: number;
    spd: number;
    role: Role;
    job: string;
    race: string;
    imageId: string;
    trait: Trait;
    skills: Ability[];
    initialEquipment?: string[];
}

export const HERO_ROSTER: HeroTemplate[] = [
    {
        name: 'Valerius', hp: 150, atk: 10, def: 18, spd: 9, role: 'TANK', 
        job: 'Sentinel', race: 'Human', imageId: 'hero_valerius',
        trait: { id: 'iron_aura', name: 'Aura of Iron', description: 'Provides 10% global damage reduction to the entire party.' },
        skills: [
            { id: 'v_s1', name: 'Shield Slam', description: 'A steady frontline hit.', val: 100, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'v_s2', name: 'Guardian Pulse', description: 'Rare chance to heal the entire party.', val: 16, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.12 }
        ],
        initialEquipment: ['wpn_syndicate_blade', 'chest_kevlar_vest']
    },
    {
        name: 'Slyn', hp: 78, atk: 18, def: 6, spd: 24, role: 'DPS', 
        job: 'Infiltrator', race: 'Elf', imageId: 'hero_slyn',
        trait: { id: 'infiltrator', name: 'Infiltrator', description: 'Ignores Vanguard protection; can strike any enemy freely.' },
        skills: [
            { id: 's_s1', name: 'Backstab', description: 'A vicious single-target strike.', val: 130, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 's_s2', name: 'Shadow Rain', description: 'Chance to pepper all enemies with needles.', val: 80, type: 'damage', actionType: 'ranged', targetType: 'all', procChance: 0.15 }
        ],
        initialEquipment: ['wpn_vibro_shiv', 'shoes_sprint_kickers']
    },
    {
        name: 'Morgra', hp: 92, atk: 9, def: 10, spd: 14, role: 'HEALER', 
        job: 'Sanguimancer', race: 'Blood Elf', imageId: 'hero_morgra',
        trait: { id: 'blood_pact', name: 'Blood Pact', description: 'Heals are 40% stronger, but she loses 5 HP per cast.' },
        skills: [
            { id: 'm_s1', name: 'Blood Mend', description: 'High-potency single target heal.', val: 18, type: 'heal', actionType: 'support', targetType: 'single' },
            { id: 'm_s2', name: 'Sanguine Burst', description: 'Rare chance to heal all allies at once.', val: 12, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.12 }
        ],
        initialEquipment: ['wpn_bio_catalyst', 'hat_tactical_visor']
    },
    {
        name: 'Krix', hp: 84, atk: 15, def: 9, spd: 20, role: 'DPS', 
        job: 'Tinkerer', race: 'Gnome', imageId: 'hero_krix',
        trait: { id: 'overclock', name: 'Overclock', description: '15% chance for his mechanisms to refill half of his ATB after acting.' },
        skills: [
            { id: 'kr_s1', name: 'Gatling Blast', description: 'A burst of unstable gadget fire into one target.', val: 108, type: 'damage', actionType: 'ranged', targetType: 'single' },
            { id: 'kr_s2', name: 'Overheat', description: 'Rare chance to detonate a cone of volatile scrap across the enemy front.', val: 82, type: 'damage', actionType: 'magic', targetType: 'row', procChance: 0.14 }
        ],
        initialEquipment: ['wpn_heavy_railgun'] // 2-Handed
    },
    {
        name: 'Draka', hp: 168, atk: 11, def: 21, spd: 6, role: 'TANK', 
        job: 'Vanguard', race: 'Dragonkin', imageId: 'hero_draka',
        trait: { id: 'dragon_scales', name: 'Dragon Scales', description: 'Reflects 6 damage whenever an enemy strikes him.' },
        skills: [
            { id: 'd_s1', name: 'Crimson Mace', description: 'A crushing frontline smash with draconic weight behind it.', val: 98, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'd_s2', name: 'Dragon Breath', description: 'Rare chance to wash the enemy row in scorching flame.', val: 78, type: 'damage', actionType: 'magic', targetType: 'row', procChance: 0.11 }
        ],
        initialEquipment: ['chest_reactive_plate'] // Bare-hands start
    },
    {
        name: 'Vex', hp: 82, atk: 17, def: 7, spd: 18, role: 'DPS', 
        job: 'Soul-Reaper', race: 'Shadow-Wraith', imageId: 'hero_vex',
        trait: { id: 'soul_reaper', name: 'Soul Reaper', description: 'Recovers 10 HP whenever an enemy falls in battle.' },
        skills: [
            { id: 'vx_s1', name: 'Soul Siphon', description: 'Rips vitality from a single victim with a cursed invocation.', val: 114, type: 'damage', actionType: 'magic', targetType: 'single' },
            { id: 'vx_s2', name: 'Death Nova', description: 'Rare chance to erupt with spectral force against all foes.', val: 76, type: 'damage', actionType: 'magic', targetType: 'all', procChance: 0.13 }
        ],
        initialEquipment: ['wpn_syndicate_blade']
    },
    {
        name: 'Leora', hp: 74, atk: 17, def: 6, spd: 21, role: 'DPS', 
        job: 'Sharpshooter', race: 'Human', imageId: 'hero_leora',
        trait: { id: 'eagle_eye', name: 'Eagle Eye', description: 'Her shots ignore 50% of the target\'s Defense.' },
        skills: [
            { id: 'l_s1', name: 'Sniper Shot', description: 'A disciplined long-range arrow to a single enemy.', val: 120, type: 'damage', actionType: 'ranged', targetType: 'single' },
            { id: 'l_s2', name: 'Wind Arrow', description: 'Rare chance to sweep the enemy row with cutting wind.', val: 84, type: 'damage', actionType: 'ranged', targetType: 'row', procChance: 0.12 }
        ],
        initialEquipment: ['wpn_tactical_pistol', 'hat_tactical_visor']
    },
    {
        name: 'Grimm', hp: 124, atk: 12, def: 16, spd: 10, role: 'TANK', 
        job: 'Stone-Shield', race: 'Golem', imageId: 'hero_grimm',
        trait: { id: 'undying', name: 'Undying', description: 'The first lethal blow leaves him standing at 1 HP instead.' },
        skills: [
            { id: 'g_s1', name: 'Tremor', description: 'A heavy shovel-glaive strike that rattles the frontline.', val: 102, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'g_s2', name: 'Stone Wall', description: 'Rare chance to brace and restore the entire party.', val: 11, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.1 }
        ],
        initialEquipment: ['chest_kevlar_vest']
    },
    {
        name: 'Lira', hp: 86, atk: 9, def: 9, spd: 18, role: 'HEALER', 
        job: 'Bard', race: 'Half-Elf', imageId: 'hero_lira',
        trait: { id: 'inspire', name: 'Inspire', description: 'Her song keeps the whole party\'s tempo elevated.' },
        skills: [
            { id: 'li_s1', name: 'Serenade', description: 'A melodic heal woven around one ally.', val: 16, type: 'heal', actionType: 'support', targetType: 'single' },
            { id: 'li_s2', name: 'Song of Hope', description: 'Rare chance to heal all allies with a swelling chorus.', val: 10, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.14 }
        ],
        initialEquipment: ['wpn_bio_catalyst', 'shoes_sprint_kickers']
    },
    {
        name: 'Umbra', hp: 98, atk: 8, def: 8, spd: 30, role: 'TANK', 
        job: 'Shadow-Hand', race: 'Human', imageId: 'hero_umbra',
        trait: { id: 'afterimage', name: 'Afterimage', description: 'While in Vanguard, enemy attacks are much more likely to miss her.' },
        skills: [
            { id: 'u_s1', name: 'Phantom Cut', description: 'A fast vanguard strike that keeps pressure on one foe.', val: 90, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'u_s2', name: 'Afterimage Relay', description: 'Rare chance to grant +5% SPD to the lowest-SPD ally and +5% dodge to Umbra until battle ends.', val: 5, type: 'heal', actionType: 'support', targetType: 'single', procChance: 0.16 }
        ],
        initialEquipment: ['wpn_vibro_shiv']
    },
    {
        name: 'Kael', hp: 82, atk: 16, def: 10, spd: 16, role: 'DPS', 
        job: 'Ranger', race: 'Elf', imageId: 'hero_kael',
        trait: { id: 'steady_aim', name: 'Steady Aim', description: 'Gains +25% damage bonus when targeting enemies in the Rearguard.' },
        skills: [
            { id: 'k_s1', name: 'Twin Arrow', description: 'Precision ranged strike.', val: 115, type: 'damage', actionType: 'ranged', targetType: 'single' },
            { id: 'k_s2', name: 'Rain of Steel', description: 'Chance to unleash a volley on all opponents.', val: 75, type: 'damage', actionType: 'ranged', targetType: 'all', procChance: 0.15 }
        ],
        initialEquipment: ['wpn_heavy_railgun']
    },
    {
        name: 'Borum', hp: 112, atk: 19, def: 14, spd: 8, role: 'DPS', 
        job: 'Earth-Breaker', race: 'Dwarf', imageId: 'hero_borum',
        trait: { id: 'sunder', name: 'Sunder', description: 'Strikes reduce the target\'s Defense by 5 permanently.' },
        skills: [
            { id: 'b_s1', name: 'Hammer Crash', description: 'Massive single-target blunt impact.', val: 125, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'b_s2', name: 'Earthquake', description: 'Chance to strike the entire enemy front row.', val: 85, type: 'damage', actionType: 'melee', targetType: 'row', procChance: 0.12 }
        ],
        initialEquipment: ['wpn_kinetic_sledge']
    },
    {
        name: 'Valthea', hp: 132, atk: 11, def: 17, spd: 11, role: 'TANK', 
        job: 'Sentinel', race: 'Human', imageId: 'hero_valthea',
        trait: { id: 'vanguard_stance', name: 'Vanguard Stance', description: 'Fights with greater stability while holding the frontline.' },
        skills: [
            { id: 'vt_s1', name: 'Vanguard Strike', description: 'A shield-led opening that punishes one enemy up close.', val: 100, type: 'damage', actionType: 'melee', targetType: 'single' },
            { id: 'vt_s2', name: 'Bulwark', description: 'Rare chance to heal all allies while holding the line.', val: 11, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.11 }
        ],
        initialEquipment: ['wpn_syndicate_blade', 'chest_reactive_plate']
    },
    {
        name: 'Elara', hp: 82, atk: 8, def: 12, spd: 9, role: 'HEALER', 
        job: 'Oracle', race: 'Moon-Elf', imageId: 'hero_elara',
        trait: { id: 'moonlight_rain', name: 'Moonlight Rain', description: 'Her restorative arts sometimes spill over the whole party.' },
        skills: [
            { id: 'e_s1', name: 'Holy Rain', description: 'A patient healing light placed on one ally.', val: 20, type: 'heal', actionType: 'support', targetType: 'single' },
            { id: 'e_s2', name: 'Divine Shield', description: 'Rare chance to bathe every ally in moonlit recovery.', val: 12, type: 'heal', actionType: 'support', targetType: 'all', procChance: 0.16 }
        ],
        initialEquipment: ['wpn_bio_catalyst', 'hat_heavy_helm']
    }
];
