export const ENEMY_POOL = [
    { name: "Shadow Bat", hp: 40, spd: 22, pwr: 10, def: 2, img: "enemy_bat" },
    { name: "Deep Lurker", hp: 90, spd: 12, pwr: 12, def: 5, img: "enemy_lurker" },
    { name: "Ogre King", hp: 200, spd: 8, pwr: 25, def: 10, img: "enemy_ogre" }
];

export const BOSS_POOL = [
    { 
        name: "Void Archon", 
        role: "TANK", 
        hp: 600, 
        spd: 15, 
        pwr: 40, 
        def: 25, 
        img: "enemy_ogre", 
        skills: [{name: 'Annihilation', val: 60, type: 'damage'}] 
    },
    { 
        name: "Void Guard", 
        role: "DPS", 
        hp: 150, 
        spd: 12, 
        pwr: 25, 
        def: 15, 
        img: "enemy_lurker", 
        skills: [{name: 'Acid Spit', val: 20, type: 'damage'}] 
    }
];

export const FLOOR_SCALING = {
    HP_PER_FLOOR: 0.25,
    PWR_PER_FLOOR: 0.15,
    TRAP_DMG_BASE: 0.15,
    TRAP_DMG_FLOOR: 0.05
};
