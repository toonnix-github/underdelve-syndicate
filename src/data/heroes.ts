import { Ability, Trait, Role } from '../types';

export interface HeroTemplate {
    name: string;
    hp: number;
    atk: number;
    def: number;
    spd: number;
    role: Role;
    imageId: string;
    trait: Trait;
    skills: Ability[];
}

export const HERO_ROSTER: HeroTemplate[] = [
    { 
        name: 'Valerius', hp: 140, atk: 8, def: 18, spd: 10, role: 'TANK', imageId: 'hero_valerius', 
        trait: { id: 'iron_aura', name: 'Aura of Iron', description: 'Provides 10% global damage reduction to the entire party.' }, 
        skills: [
            { id: 'v_s1', name: 'Shield Slam', description: 'Deals 100% damage to a single target.', val: 12, type: 'damage', targetType: 'single' },
            { id: 'v_s2', name: 'Guardian Pulse', description: 'Rare chance to heal the entire party.', val: 15, type: 'heal', targetType: 'all', procChance: 0.12 }
        ] 
    },
    { 
        name: 'Slyn', hp: 75, atk: 22, def: 6, spd: 28, role: 'DPS', imageId: 'hero_slyn', 
        trait: { id: 'infiltrator', name: 'Infiltrator', description: 'Ignores Vanguard protection; can strike any enemy freely.' }, 
        skills: [
            { id: 's_s1', name: 'Backstab', description: 'Deals 100% damage to a single target.', val: 35, type: 'damage', targetType: 'single' },
            { id: 's_s2', name: 'Shadow Rain', description: 'Chance to pepper all enemies with needles.', val: 20, type: 'damage', targetType: 'all', procChance: 0.15 }
        ] 
    },
    { 
        name: 'Morgra', hp: 95, atk: 12, def: 12, spd: 15, role: 'HEALER', imageId: 'hero_morgra', 
        trait: { id: 'blood_pact', name: 'Blood Pact', description: 'Heals are 40% stronger, but she loses 5 HP per cast.' }, 
        skills: [
            { id: 'm_s1', name: 'Blood Mend', description: 'High-potency single target heal.', val: 20, type: 'heal', targetType: 'single' },
            { id: 'm_s2', name: 'Sanguine Burst', description: 'Rare chance to mend all allies simultaneously.', val: 25, type: 'heal', targetType: 'all', procChance: 0.12 }
        ] 
    },
    { 
        name: 'Kael', hp: 85, atk: 18, def: 22, spd: 12, role: 'DPS', imageId: 'hero_kael', 
        trait: { id: 'steady_aim', name: 'Steady Aim', description: 'Gains +25% damage bonus when targeting enemies in the Rearguard.' }, 
        skills: [
            { id: 'k_s1', name: 'Twin Arrow', description: 'Precision physical strike.', val: 30, type: 'damage', targetType: 'single' },
            { id: 'k_s2', name: 'Rain of Steel', description: 'Chance to loose a volley upon all opponents.', val: 25, type: 'damage', targetType: 'all', procChance: 0.15 }
        ] 
    },
    { 
        name: 'Borum', hp: 100, atk: 20, def: 12, spd: 8, role: 'DPS', imageId: 'hero_borum', 
        trait: { id: 'sunder', name: 'Sunder', description: 'Strikes reduce the target\'s Defense by 5 permanently.' }, 
        skills: [
            { id: 'b_s1', name: 'Hammer Crash', description: 'Massive single-target blunt impact.', val: 30, type: 'damage', targetType: 'single' },
            { id: 'b_s2', name: 'Earthquake', description: 'Chance to strike the entire enemy front row.', val: 28, type: 'damage', targetType: 'row', procChance: 0.12 }
        ] 
    }
];
