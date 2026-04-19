import { Ability, Role } from '../types';

interface EnemyTemplate {
    name: string;
    hp: number;
    spd: number;
    pwr: number;
    def: number;
    img: string;
    role: Role;
    skills: Ability[];
}

export const ENEMY_POOL: EnemyTemplate[] = [
    {
        name: "Shadow Bat",
        hp: 42,
        spd: 24,
        pwr: 8,
        def: 2,
        img: "enemy_bat",
        role: "DPS",
        skills: [{ id: 'bat_screech_bite', name: 'Screech Bite', description: 'A quick close-range bite.', val: 95, type: 'damage', actionType: 'melee', targetType: 'single' }]
    },
    {
        name: "Deep Lurker",
        hp: 88,
        spd: 14,
        pwr: 11,
        def: 6,
        img: "enemy_lurker",
        role: "DPS",
        skills: [{ id: 'lurker_spit', name: 'Acid Spit', description: 'A ranged corrosive shot.', val: 110, type: 'damage', actionType: 'ranged', targetType: 'single' }]
    },
    {
        name: "Ogre King",
        hp: 175,
        spd: 7,
        pwr: 18,
        def: 11,
        img: "enemy_ogre",
        role: "TANK",
        skills: [{ id: 'ogre_crush', name: 'Crushing Blow', description: 'A brutal heavy strike.', val: 115, type: 'damage', actionType: 'melee', targetType: 'single' }]
    }
];

export const BOSS_POOL: EnemyTemplate[] = [
    { 
        name: "Void Archon", 
        role: "TANK", 
        hp: 600, 
        spd: 15, 
        pwr: 40, 
        def: 25, 
        img: "enemy_ogre", 
        skills: [{ id: 'archon_annihilation', name: 'Annihilation', description: 'A cataclysmic magical blast.', val: 135, type: 'damage', actionType: 'magic', targetType: 'row' }] 
    },
    { 
        name: "Void Guard", 
        role: "DPS", 
        hp: 150, 
        spd: 12, 
        pwr: 25, 
        def: 15, 
        img: "enemy_lurker", 
        skills: [{ id: 'guard_acid_spit', name: 'Acid Spit', description: 'A disciplined ranged acid strike.', val: 110, type: 'damage', actionType: 'ranged', targetType: 'single' }] 
    }
];

export const FLOOR_SCALING = {
    HP_PER_FLOOR: 0.25,
    PWR_PER_FLOOR: 0.15,
    TRAP_DMG_BASE: 0.15,
    TRAP_DMG_FLOOR: 0.05
};
