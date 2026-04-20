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

export interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: Rarity;
    description: string;
    imagePath?: string;
    statBoost?: StatBoost;
    passives?: Passive[];
    value: number;
    isTwoHanded?: boolean;
    allowedJobs?: string[];
    allowedRaces?: string[];
}

export interface VaultItem {
    item: Item;
    quantity: number;
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
    initialEquipment?: string[]; // Item IDs
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
    job: string;
    race: string;
}
