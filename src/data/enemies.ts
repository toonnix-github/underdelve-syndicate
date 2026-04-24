import { Ability, Role } from '../types';

export interface EnemyTemplate {
    name: string;
    hp: number;
    spd: number;
    pwr: number;
    def: number;
    img: string;
    role: Role;
    minFloor?: number;
    maxFloor?: number;
    skills: Ability[];
}

export const ENEMY_POOL: EnemyTemplate[] = [
    {
        name: 'Shadow Bat',
        hp: 36,
        spd: 18,
        pwr: 7,
        def: 1,
        img: 'enemy_bat',
        role: 'DPS',
        minFloor: 1,
        maxFloor: 1,
        skills: [{ id: 'bat_screech_bite', name: 'Screech Bite', description: 'A quick close-range bite.', val: 92, type: 'damage', actionType: 'melee', targetType: 'single' }]
    },
    {
        name: 'Cave Rat',
        hp: 44,
        spd: 15,
        pwr: 8,
        def: 2,
        img: 'enemy_bat',
        role: 'DPS',
        minFloor: 1,
        maxFloor: 2,
        skills: [{ id: 'rat_frenzied_nip', name: 'Frenzied Nip', description: 'A dirty snap at the nearest target.', val: 96, type: 'damage', actionType: 'melee', targetType: 'single' }]
    },
    {
        name: 'Fungal Crawler',
        hp: 58,
        spd: 8,
        pwr: 7,
        def: 6,
        img: 'enemy_lurker',
        role: 'TANK',
        minFloor: 1,
        maxFloor: 2,
        skills: [{ id: 'crawler_slam', name: 'Spore Slam', description: 'A heavy body-check from a lumbering fungus.', val: 90, type: 'damage', actionType: 'melee', targetType: 'single' }]
    },
    {
        name: 'Rubble Beetle',
        hp: 66,
        spd: 7,
        pwr: 6,
        def: 8,
        img: 'enemy_ogre',
        role: 'TANK',
        minFloor: 1,
        maxFloor: 2,
        skills: [{ id: 'beetle_ram', name: 'Shell Ram', description: 'A blunt collision with its stone-like shell.', val: 88, type: 'damage', actionType: 'melee', targetType: 'single' }]
    },
    {
        name: 'Tunnel Wolf',
        hp: 52,
        spd: 17,
        pwr: 9,
        def: 3,
        img: 'enemy_bat',
        role: 'DPS',
        minFloor: 1,
        maxFloor: 3,
        skills: [{ id: 'wolf_lunge', name: 'Lunge', description: 'A fast pounce from the dark.', val: 102, type: 'damage', actionType: 'melee', targetType: 'single' }]
    },
    {
        name: 'Deep Lurker',
        hp: 74,
        spd: 12,
        pwr: 9,
        def: 5,
        img: 'enemy_lurker',
        role: 'DPS',
        minFloor: 2,
        maxFloor: 3,
        skills: [{ id: 'lurker_spit', name: 'Acid Spit', description: 'A ranged corrosive shot.', val: 102, type: 'damage', actionType: 'ranged', targetType: 'single' }]
    },
    {
        name: 'Bone Slinger',
        hp: 62,
        spd: 14,
        pwr: 10,
        def: 4,
        img: 'enemy_lurker',
        role: 'DPS',
        minFloor: 2,
        maxFloor: 3,
        skills: [{ id: 'slinger_bone_shard', name: 'Bone Shard', description: 'A sharpened shard thrown from behind the line.', val: 104, type: 'damage', actionType: 'ranged', targetType: 'single' }]
    },
    {
        name: 'Mire Shaman',
        hp: 70,
        spd: 12,
        pwr: 11,
        def: 5,
        img: 'enemy_lurker',
        role: 'SUPPORT',
        minFloor: 3,
        maxFloor: 4,
        skills: [{ id: 'shaman_bog_bolt', name: 'Bog Bolt', description: 'A foul magical bolt from the rear.', val: 106, type: 'damage', actionType: 'magic', targetType: 'single' }]
    },
    {
        name: 'Crypt Hound',
        hp: 88,
        spd: 16,
        pwr: 12,
        def: 6,
        img: 'enemy_bat',
        role: 'DPS',
        minFloor: 3,
        maxFloor: 4,
        skills: [{ id: 'hound_rend', name: 'Rend', description: 'A savage tearing bite.', val: 108, type: 'damage', actionType: 'melee', targetType: 'single' }]
    },
    {
        name: 'Stone Brute',
        hp: 118,
        spd: 8,
        pwr: 13,
        def: 10,
        img: 'enemy_ogre',
        role: 'TANK',
        minFloor: 3,
        maxFloor: 5,
        skills: [{ id: 'brute_cave_in', name: 'Cave-In', description: 'A crushing overhead smash.', val: 110, type: 'damage', actionType: 'melee', targetType: 'single' }]
    },
    {
        name: 'Venom Spitter',
        hp: 86,
        spd: 15,
        pwr: 12,
        def: 6,
        img: 'enemy_lurker',
        role: 'DPS',
        minFloor: 4,
        maxFloor: 5,
        skills: [{ id: 'spitter_venom_burst', name: 'Venom Burst', description: 'A pressurized spit aimed past the frontline.', val: 110, type: 'damage', actionType: 'ranged', targetType: 'single' }]
    },
    {
        name: 'Abyss Hexer',
        hp: 92,
        spd: 13,
        pwr: 13,
        def: 7,
        img: 'enemy_lurker',
        role: 'SUPPORT',
        minFloor: 4,
        maxFloor: 5,
        skills: [{ id: 'hexer_void_wave', name: 'Void Wave', description: 'A sweeping curse aimed at the front row.', val: 98, type: 'damage', actionType: 'magic', targetType: 'row' }]
    },
    {
        name: 'Ogre King',
        hp: 150,
        spd: 8,
        pwr: 16,
        def: 12,
        img: 'enemy_ogre',
        role: 'TANK',
        minFloor: 5,
        maxFloor: 5,
        skills: [{ id: 'ogre_crush', name: 'Crushing Blow', description: 'A brutal heavy strike.', val: 114, type: 'damage', actionType: 'melee', targetType: 'single' }]
    }
];

export const BOSS_POOL: EnemyTemplate[] = [
    {
        name: 'Void Archon',
        role: 'TANK',
        hp: 560,
        spd: 12,
        pwr: 34,
        def: 22,
        img: 'enemy_ogre',
        minFloor: 5,
        skills: [{ id: 'archon_annihilation', name: 'Annihilation', description: 'A cataclysmic magical blast.', val: 126, type: 'damage', actionType: 'magic', targetType: 'row' }]
    },
    {
        name: 'Void Guard',
        role: 'DPS',
        hp: 170,
        spd: 12,
        pwr: 20,
        def: 14,
        img: 'enemy_lurker',
        minFloor: 5,
        skills: [{ id: 'guard_acid_spit', name: 'Acid Spit', description: 'A disciplined ranged acid strike.', val: 106, type: 'damage', actionType: 'ranged', targetType: 'single' }]
    }
];

export const FLOOR_SCALING = {
    HP_PER_FLOOR: 0.16,
    PWR_PER_FLOOR: 0.1,
    DEF_PER_FLOOR: 0.08,
    SPD_PER_FLOOR: 0.04,
    TRAP_DMG_BASE: 0.15,
    TRAP_DMG_FLOOR: 0.05
};

export const getEnemyPoolForFloor = (floor: number) => ENEMY_POOL.filter(enemy => {
    const minFloor = enemy.minFloor ?? 1;
    const maxFloor = enemy.maxFloor ?? Number.MAX_SAFE_INTEGER;
    return minFloor <= floor && floor <= maxFloor;
});

export const getEncounterEnemyCountRange = (floor: number) => {
    if (floor <= 1) return { min: 1, max: 2 };
    if (floor <= 3) return { min: 1, max: 3 };
    return { min: 2, max: 3 };
};

export const scaleEnemyStatsForFloor = (enemy: EnemyTemplate, floor: number) => ({
    hp: Math.max(1, Math.floor(enemy.hp * (1 + (floor - 1) * FLOOR_SCALING.HP_PER_FLOOR))),
    pwr: Math.max(1, Math.floor(enemy.pwr * (1 + (floor - 1) * FLOOR_SCALING.PWR_PER_FLOOR))),
    def: Math.max(0, Math.floor(enemy.def * (1 + (floor - 1) * FLOOR_SCALING.DEF_PER_FLOOR))),
    spd: Math.max(1, Math.floor(enemy.spd * (1 + (floor - 1) * FLOOR_SCALING.SPD_PER_FLOOR)))
});
