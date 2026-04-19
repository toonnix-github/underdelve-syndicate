export type Role = 'TANK' | 'HEALER' | 'DPS';
export type Position = 'VANGUARD' | 'REARGUARD';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ItemType = 'WEAPON' | 'HAT' | 'CHEST' | 'SHOES' | 'CONSUMABLE';

export interface StatBoost {
    atk?: number;
    def?: number;
    spd?: number;
    heal?: number;
}

export interface Passive {
    id: string;
    name: string;
    description: string;
}

export interface Ability {
    id: string;
    name: string;
    description: string;
    val: number;
    type: 'damage' | 'heal';
    actionType: 'melee' | 'ranged' | 'magic' | 'support';
    targetType: 'single' | 'row' | 'all';
    procChance?: number; 
}

export interface Trait {
    id: string;
    name: string;
    description: string;
    icon?: string;
}

export interface CombatantState {
    id: string;
    name: string;
    role: Role;
    maxHp: number;
    hp: number;
    speed: number;
    power: number;
    def: number;
    imageId: string;
    abilities: Ability[];
    positionLine: Position;
    atb: number;
    isDead: boolean;
    isHero: boolean;
    trait: Trait | null;
    isLeader: boolean;
}
