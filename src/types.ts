export type Role = 'TANK' | 'HEALER' | 'DPS' | 'SUPPORT';
export type Position = 'VANGUARD' | 'REARGUARD';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ItemType = 'WEAPON' | 'HAT' | 'CHEST' | 'SHOES' | 'CONSUMABLE';

export type Race = 
    | 'Human' 
    | 'Elf' 
    | 'Night-Elf' 
    | 'Dwarf' 
    | 'Orc' 
    | 'Undead' 
    | 'Beastman' 
    | 'Demon' 
    | 'Dragon' 
    | 'Titan';

export type Job = 
    | 'Swordsman' 
    | 'Archer' 
    | 'Priest' 
    | 'Knight' 
    | 'Thief' 
    | 'Mage' 
    | 'Berserker' 
    | 'Guardian' 
    | 'Scout' 
    | 'Paladin'
    | 'Bard';

export interface StatBoost {
    atk?: number;
    def?: number;
    spd?: number;
    hp?: number;
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
    allowedJobs?: Job[] | null;
    allowedRaces?: Race[] | null;
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
    type: 'damage' | 'heal' | 'buff' | 'debuff';
    actionType: 'melee' | 'ranged' | 'magic' | 'support';
    targetType: 'single' | 'row' | 'all';
    stat?: 'ATK' | 'DEF' | 'SPD';
    procChance?: number; 
}

export interface AbilityWithVisuals extends Ability {
    vfx?: string;
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
    job: Job;
    race: Race;
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
    job: Job;
    race: Race;
}
