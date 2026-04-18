import { ItemType, Rarity, StatBoost, Passive } from '../types';

export class Item {
    id: string;
    name: string;
    type: ItemType;
    statBoost: StatBoost;
    icon: string;
    rarity: Rarity;
    passives: Passive[];

    constructor(name: string, type: ItemType, statBoost: StatBoost, icon: string, rarity: Rarity = 'Common', passives: Passive[] = []) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.type = type;
        this.statBoost = statBoost;
        this.icon = icon;
        this.rarity = rarity;
        this.passives = passives;
    }
}
