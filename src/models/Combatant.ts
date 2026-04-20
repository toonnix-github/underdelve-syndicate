import { Role, Position, Ability, Trait } from '../types';

export class Combatant {
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
    hasRevived: boolean;
    lastAction: string;
    isActing: boolean;
    attackPhase: 'idle' | 'advance' | 'strike' | 'return';
    impactPulse: boolean;
    hitShake: boolean;
    hitType: 'slash' | 'broken' | 'burn' | null;
    showImpact: boolean;
    healSparkle: boolean;
    traitGlow: boolean;
    isLeader: boolean;
    hasEliteBonus: boolean;
    vfx: any[];
    equipment: Record<string, any>;
    isCharging: boolean;
    chargeColor: string;
    activeSigil: string | null;
    isPopping: boolean;
    activeChant: string | null;
    battleSpdBuffPct: number;
    battleEvasionBonus: number;
    job: string;
    race: string;

    constructor(
        name: string, 
        role: Role, 
        maxHp: number, 
        speed: number, 
        power: number, 
        def: number, 
        imageId: string, 
        abilities: Ability[], 
        positionLine?: Position, 
        isHero = true, 
        trait: Trait | null = null, 
        job = 'N/A', 
        race = 'N/A'
    ) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.role = role;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.speed = speed;
        this.power = power;
        this.def = def;
        this.imageId = imageId;
        this.abilities = abilities;
        this.positionLine = positionLine || 'VANGUARD';
        this.atb = 0;
        this.isDead = false;
        this.isHero = isHero;
        this.trait = trait;
        this.hasRevived = false;
        this.lastAction = "";
        this.isActing = false;
        this.attackPhase = 'idle';
        this.impactPulse = false;
        this.hitShake = false;
        this.hitType = null;
        this.showImpact = false;
        this.healSparkle = false;
        this.traitGlow = false;
        this.isLeader = false;
        this.hasEliteBonus = false;
        this.vfx = [];
        this.equipment = {
            weapon1: null,
            weapon2: null,
            hat: null,
            chest: null,
            shoes: null
        };
        this.isCharging = false;
        this.chargeColor = 'amber';
        this.activeSigil = null;
        this.isPopping = false;
        this.activeChant = null;
        this.battleSpdBuffPct = 0;
        this.battleEvasionBonus = 0;
        this.job = job;
        this.race = race;
    }

    clone(): Combatant {
        const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        // Deep copy nested objects/arrays
        copy.equipment = { ...this.equipment };
        copy.abilities = [...this.abilities];
        copy.vfx = [...this.vfx];
        copy.trait = this.trait ? { ...this.trait } : null;
        
        // Ensure primitives didn't somehow get corrupted into objects
        copy.name = String(this.name);
        copy.hp = Number(this.hp);
        copy.isLeader = Boolean(this.isLeader);
        
        return copy;
    }

    getPassives(): string[] {
        const passives: string[] = [];
        Object.values(this.equipment).forEach(item => {
            if (item && item.passives) {
                item.passives.forEach((p: any) => passives.push(p.id));
            }
        });
        return passives;
    }

    getATK(party: Combatant[] = []): number {
        let total = this.power;
        
        // --- Innate Race Bonuses ---
        if (this.race === 'Orc') total += 3;
        if (this.race === 'Undead') total += 2;
        
        // --- Equipment ---
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.atk) total += item.statBoost.atk; });

        // --- Innate Job Bonuses ---
        if (this.job === 'Berserker') total = Math.floor(total * 1.15);
        
        const leader = party.find(h => h.isLeader);
        if (leader?.name === 'Valthea' && this.positionLine === 'VANGUARD') {
            total = Math.floor(total * 1.15);
        }

        if (leader?.name === 'Vex' && this.hasEliteBonus) {
            total = Math.floor(total * 1.10);
        }

        return total;
    }

    getDEF(party: Combatant[] = []): number {
        let total = this.def;

        // --- Innate Race Bonuses ---
        if (this.race === 'Construct') total += 5;
        if (this.race === 'Dwarf') total += 4;

        // --- Equipment ---
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.def) total += item.statBoost.def; });

        // --- Innate Job Bonuses ---
        if (this.job === 'Knight') total = Math.floor(total * 1.15);

        if (this.trait?.id === 'vanguard_stance' && this.positionLine === 'VANGUARD') {
            total = Math.floor(total * 1.1);
        }

        const leader = party.find(h => h.isLeader);
        if (leader?.name === 'Valerius') {
            total = Math.floor(total * 1.15);
        }
        
        return total;
    }

    getSPD(party: Combatant[] = []): number {
        let total = this.speed;

        // --- Innate Race Bonuses ---
        if (this.race === 'Elf') total += 3;
        if (this.race === 'Undead') total -= 1;
        if (this.race === 'Construct') total -= 2;

        // --- Equipment ---
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.spd) total += item.statBoost.spd; });
        
        // --- Innate Job Bonuses ---
        if (this.job === 'Slayer' || this.job === 'Rogue') total = Math.floor(total * 1.15);

        const leader = party.find(h => h.isLeader);
        if (leader?.name === 'Lira') {
            total = Math.floor(total * 1.10);
        }

        if (this.battleSpdBuffPct > 0) {
            total = Math.floor(total * (1 + this.battleSpdBuffPct));
        }

        return total;
    }

    getActiveEvasionBonus(): number {
        return this.battleEvasionBonus;
    }

    addBattleSpdBuff(percent: number, maxTotalPct = 0.3) {
        this.battleSpdBuffPct = Math.min(maxTotalPct, this.battleSpdBuffPct + Math.max(0, percent));
    }

    addBattleEvasionBuff(bonus: number, maxTotal = 20) {
        this.battleEvasionBonus = Math.min(maxTotal, this.battleEvasionBonus + Math.max(0, bonus));
    }

    clearBattleBuffs() {
        this.battleSpdBuffPct = 0;
        this.battleEvasionBonus = 0;
    }

    updateAtb(dt: number, partySpeedMult = 1.0) {
        if (this.hp <= 0) return;
        const speed = this.getSPD();
        const increment = (speed * dt * partySpeedMult) * 5;
        this.atb = Math.min(100, this.atb + increment);
    }

    addVfx(text: string, type: string) {
        const id = Date.now() + Math.random();
        this.vfx.push({ id, text, type });
        setTimeout(() => {
            this.vfx = this.vfx.filter(v => v.id !== id);
        }, 1300);
    }

    triggerHit(type: 'slash' | 'broken' | 'burn') {
        this.hitShake = true;
        this.hitType = type;
        setTimeout(() => {
            this.hitShake = false;
            this.hitType = null;
        }, 300);
    }

    triggerHeal() {
        this.healSparkle = true;
        setTimeout(() => {
            this.healSparkle = false;
        }, 600);
    }

    triggerChant(name: string) {
        this.activeChant = name.toUpperCase();
        setTimeout(() => {
            this.activeChant = null;
        }, 1500);
    }

    // --- Static Factory ---
    static fromTemplate(template: any, isHero: boolean, position: Position = 'VANGUARD'): Combatant {
        return new Combatant(
            template.name,
            template.role,
            template.hp || template.maxHp,
            template.spd || template.speed,
            template.atk || template.power || template.pwr,
            template.def || template.defense,
            template.imageId || template.img,
            template.skills || template.abilities,
            position,
            isHero,
            template.trait,
            template.job,
            template.race
        );
    }

    // --- Inventory System ---
    equip(item: any, slot: string) {
        // Handle two-handed weapons
        if (item.slots === 2) {
            this.equipment['weapon1'] = item;
            this.equipment['weapon2'] = { ...item, isPlaceholder: true, parentSlot: 'weapon1' };
        } else {
            this.equipment[slot] = item;
        }
    }

    unequip(slot: string) {
        const item = this.equipment[slot];
        if (!item) return;

        if (item.slots === 2) {
            delete this.equipment['weapon1'];
            delete this.equipment['weapon2'];
        } else if (item.isPlaceholder) {
            const parent = this.equipment[item.parentSlot];
            if (parent && parent.slots === 2) {
                delete this.equipment['weapon1'];
                delete this.equipment['weapon2'];
            }
        } else {
            delete this.equipment[slot];
        }
    }

    consume(item: any) {
        if (!item.statBoost) return;
        const boost = item.statBoost;
        if (boost.hp) this.hp = Math.min(this.maxHp, this.hp + boost.hp);
        // Temporary battle buffs could be handled here if needed
    }
}
