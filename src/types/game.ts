export type Role = 'TANK' | 'DPS' | 'HEALER';

export interface Trait {
  id: string;
  name: string;
  description: string;
}

export interface Ability {
  name: string;
  val: number;
  type: 'damage' | 'heal';
}

export interface HeroDefinition {
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

export interface LeaderPerk {
  id: string;
  name: string;
  perk: string;
}

export interface ItemStatBoost {
  atk?: number;
  def?: number;
  spd?: number;
  heal?: number;
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface Item {
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE';
  statBoost: ItemStatBoost;
  icon: string;
  rarity: Rarity;
  passives?: Trait[];
}

export interface FloorState {
  layout: number[][];
  bgs: Record<string, number>;
  interactables: any[]; // To be refined
  enemies: any[];      // To be refined
  explored: Set<string>;
  playerPos: { x: number; y: number };
}
