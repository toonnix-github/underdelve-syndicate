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

    constructor(name: string, role: Role, maxHp: number, speed: number, power: number, def: number, imageId: string, abilities: Ability[], positionLine?: Position, isHero = true, trait: Trait | null = null) {
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
    }

    clone(): Combatant {
        const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        copy.equipment = { ...this.equipment };
        copy.abilities = [...this.abilities];
        copy.vfx = [...this.vfx];
        copy.isCharging = this.isCharging;
        copy.chargeColor = this.chargeColor;
        copy.activeSigil = this.activeSigil;
        copy.isPopping = this.isPopping;
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
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.atk) total += item.statBoost.atk; });
        
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
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.def) total += item.statBoost.def; });
        if (this.trait?.id === 'vanguard_stance' && this.positionLine === 'VANGUARD') {
            total = Math.floor(total * 1.1);
        }

        const leader = party.find(h => h.isLeader);
        if (leader?.name === 'Valerius') {
            total = Math.floor(total * 1.15);
        }

        // --- NEW FORMATION PERK ---
        if (this.positionLine === 'VANGUARD') {
            total = Math.floor(total * 1.10); // +10% DEF
        }
        
        return total;
    }

    getSPD(party: Combatant[] = []): number {
        let total = this.speed;
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.spd) total += item.statBoost.spd; });
        
        const leader = party.find(h => h.isLeader);
        if (leader?.name === 'Lira') {
            total = Math.floor(total * 1.10);
        }

        // --- NEW FORMATION PERK ---
        if (this.positionLine === 'REARGUARD') {
            total = Math.floor(total * 1.15); // +15% SPD
        }

        return total;
    }

    updateAtb(dt: number, partySpeedMult = 1.0) {
        if (this.hp <= 0) return;
        const increment = (this.getSPD() * dt * partySpeedMult) * 5;
        this.atb = Math.min(100, this.atb + increment);
    }

    addVfx(text: string, type: string) {
        const id = Date.now() + Math.random();
        this.vfx.push({ id, text, type });
        setTimeout(() => {
            this.vfx = this.vfx.filter(v => v.id !== id);
        }, 1000);
    }
}
