import { Role, Position, Ability, Trait, Race, Job } from '../types';

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
    battleAtkBuffPct: number;
    battleDefBuffPct: number;
    battleEvasionBonus: number;
    job: Job;
    race: Race;

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
        job: Job = 'Swordsman', 
        race: Race = 'Human'
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
        this.battleAtkBuffPct = 0;
        this.battleDefBuffPct = 0;
        this.battleEvasionBonus = 0;
        this.job = job;
        this.race = race;

        // Apply innate race HP bonuses at birth
        if (this.race === 'Human') this.maxHp += 5;
        if (this.race === 'Night-Elf') this.maxHp = Math.max(1, this.maxHp - 10);
        if (this.race === 'Dragon') this.maxHp += 10;
        if (this.race === 'Titan') this.maxHp += 20;
        this.hp = this.maxHp;
    }

    clone(): Combatant {
        const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        copy.equipment = { ...this.equipment };
        copy.abilities = [...this.abilities].map(a => ({ ...a }));
        copy.vfx = [...this.vfx].map(v => ({ ...v }));
        copy.trait = this.trait ? { ...this.trait } : null;
        
        copy.name = String(this.name);
        copy.hp = Number(this.hp);
        copy.maxHp = Number(this.maxHp);
        copy.isLeader = Boolean(this.isLeader);
        
        return copy;
    }

    static rehydrate(data: any): Combatant {
        if (data instanceof Combatant) return data;
        
        // If it's a POJO that looks like a Combatant, wrap it
        const instance = Object.assign(Object.create(Combatant.prototype), data);
        
        // Ensure standard fields are proper types
        instance.hp = Number(instance.hp || 0);
        instance.maxHp = Number(instance.maxHp || 100);
        instance.atb = Number(instance.atb || 0);
        instance.vfx = Array.isArray(instance.vfx) ? instance.vfx : [];
        instance.abilities = Array.isArray(instance.abilities) ? instance.abilities : [];
        instance.equipment = instance.equipment || {};
        
        return instance;
    }

    getATK(party: Combatant[] = []): number {
        let total = this.power;
        
        // --- Innate Race Bonuses ---
        if (this.race === 'Orc') total += 4;
        if (this.race === 'Undead') total += 2;
        if (this.race === 'Beastman') total += 2;
        if (this.race === 'Demon') total += 5;
        
        // --- Equipment ---
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.atk) total += item.statBoost.atk; });

        // --- Job Scaling ---
        if (this.job === 'Swordsman') total = Math.floor(total * 1.10);
        if (this.job === 'Berserker') total = Math.floor(total * 1.20);
        
        // --- Item Skills ---
        // Skill: Royal Decree (+10% ATK to all allies in same row)
        const rowAllies = party.filter(p => p.positionLine === this.positionLine && p.hp > 0);
        const hasRoyalDecree = rowAllies.some(p => 
            Object.values(p.equipment).some(i => i?.passives?.some((ps: any) => ps.name === 'Royal Decree' || ps.id === 'royal_decree'))
        );
        if (hasRoyalDecree) {
            total = Math.floor(total * 1.10);
        }

        // --- Leader/Trait Bonuses ---
        const leader = party.find(h => h.isLeader);
        if (leader?.name === 'Valthea' && this.positionLine === 'VANGUARD') total = Math.floor(total * 1.15);
        if (leader?.name === 'Vex' && this.hasEliteBonus) total = Math.floor(total * 1.10);

        if (this.battleAtkBuffPct !== 0) total = Math.floor(total * (1 + this.battleAtkBuffPct / 100));

        return total;
    }

    getDEF(party: Combatant[] = []): number {
        let total = this.def;

        // --- Innate Race Bonuses ---
        if (this.race === 'Dwarf') total += 5;
        if (this.race === 'Undead') total += 5;
        if (this.race === 'Demon') total -= 5;
        if (this.race === 'Dragon') total += 5;

        // --- Equipment ---
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.def) total += item.statBoost.def; });

        // --- Job Scaling ---
        if (this.job === 'Knight') total = Math.floor(total * 1.15);
        if (this.job === 'Berserker') total = Math.floor(total * 0.90);
        if (this.job === 'Guardian') total = Math.floor(total * 1.20);
        if (this.job === 'Paladin') total = Math.floor(total * 1.10);

        if (this.trait?.id === 'vanguard_stance' && this.positionLine === 'VANGUARD') total = Math.floor(total * 1.1);

        const leader = party.find(h => h.isLeader);
        if (leader?.name === 'Valerius') total = Math.floor(total * 1.15);

        if (this.battleDefBuffPct !== 0) total = Math.floor(total * (1 + this.battleDefBuffPct / 100));
        
        return Math.max(0, total);
    }

    getSPD(party: Combatant[] = []): number {
        let total = this.speed;

        // --- Innate Race Bonuses ---
        if (this.race === 'Human') total += 1;
        if (this.race === 'Elf') total += 3;
        if (this.race === 'Night-Elf') total += 5;
        if (this.race === 'Undead') total -= 2;
        if (this.race === 'Beastman') total += 2;
        if (this.race === 'Dragon') total -= 2;
        if (this.race === 'Titan') total -= 5;

        // --- Equipment ---
        Object.values(this.equipment).forEach(item => { if (item?.statBoost?.spd) total += item.statBoost.spd; });
        
        // --- Job Scaling ---
        if (this.job === 'Archer') total = Math.floor(total * 1.10);
        if (this.job === 'Thief') total = Math.floor(total * 1.15);
        if (this.job === 'Guardian') total = Math.floor(total * 0.95);
        if (this.job === 'Scout') total = Math.floor(total * 1.10);

        const leader = party.find(h => h.isLeader);
        if (leader?.name === 'Lira') total = Math.floor(total * 1.10);
        if (this.battleSpdBuffPct !== 0) total = Math.floor(total * (1 + this.battleSpdBuffPct / 100));

        return Math.max(1, total);
    }

    getHealPower(party: Combatant[] = []): number {
        let power = 1.0;
        if (this.job === 'Priest') power += 0.15;
        if (this.job === 'Paladin') power += 0.10;
        return power;
    }

    getActiveEvasionBonus(): number {
        let bonus = this.battleEvasionBonus;
        if (this.job === 'Scout') bonus += 10;
        
        // --- Item Skills ---
        // Skill: Flash Vanish (+10% Evasion to Night-Elves)
        if (this.race === 'Night-Elf' && Object.values(this.equipment).some(i => i?.passives?.some((ps: any) => ps.name === 'Flash Vanish' || ps.id === 'flash_vanish'))) {
            bonus += 10;
        }
        
        // Skill: Shadow Walk (+15% EVA)
        if (Object.values(this.equipment).some(i => i?.passives?.some((ps: any) => ps.name === 'Shadow Walk' || ps.id === 'shadow_walk'))) {
            bonus += 15;
        }

        return bonus;
    }

    addBattleBuff(stat: 'ATK' | 'DEF' | 'SPD', percent: number, maxTotalPct = 100) {
        if (stat === 'ATK') this.battleAtkBuffPct = Math.min(maxTotalPct, this.battleAtkBuffPct + percent);
        if (stat === 'DEF') this.battleDefBuffPct = Math.min(maxTotalPct, this.battleDefBuffPct + percent);
        if (stat === 'SPD') this.battleSpdBuffPct = Math.min(maxTotalPct, this.battleSpdBuffPct + percent);
    }

    addBattleEvasionBuff(bonus: number, maxTotal = 20) {
        this.battleEvasionBonus = Math.min(maxTotal, this.battleEvasionBonus + Math.max(0, bonus));
    }

    addVfx(text: string, tone: 'damage' | 'heal' | 'miss' | 'special' = 'damage') {
        const now = Date.now();
        const isImmediateDuplicate = this.vfx.some(v =>
            v?.text === text &&
            (v?.tone ?? v?.type) === tone &&
            typeof v?.createdAt === 'number' &&
            now - v.createdAt < 140
        );

        if (isImmediateDuplicate) return;

        const vfxId = Math.random().toString(36).substr(2, 9);
        this.vfx.push({ id: vfxId, text, tone, createdAt: now });
        setTimeout(() => {
            this.vfx = this.vfx.filter(v => v.id !== vfxId);
        }, 1500);
    }

    triggerHit(hitType: 'slash' | 'broken' | 'burn' | null = 'slash') {
        this.hitType = hitType;
        this.hitShake = true;
        this.showImpact = true;
        setTimeout(() => {
            this.hitShake = false;
            this.showImpact = false;
        }, 400);
    }

    triggerHeal() {
        this.healSparkle = true;
        setTimeout(() => {
            this.healSparkle = false;
        }, 600);
    }

    triggerChant(name: string) {
        this.activeChant = name;
        this.traitGlow = true;
        setTimeout(() => {
            this.activeChant = null;
            this.traitGlow = false;
        }, 2000);
    }

    clearBattleBuffs() {
        this.battleSpdBuffPct = 0;
        this.battleAtkBuffPct = 0;
        this.battleDefBuffPct = 0;
        this.battleEvasionBonus = 0;
    }

    updateAtb(dt: number, partySpeedMult = 1.0) {
        if (this.hp <= 0) return;
        const speed = this.getSPD();
        const increment = (speed * dt * partySpeedMult) * 5;
        this.atb = Math.min(100, this.atb + increment);
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
        if (item.isTwoHanded) {
            this.equipment['weapon1'] = item;
            this.equipment['weapon2'] = { ...item, isPlaceholder: true, parentSlot: 'weapon1' };
        } else {
            this.equipment[slot] = item;
        }
    }

    unequip(slot: string) {
        const item = this.equipment[slot];
        if (!item) return;

        if (item.isTwoHanded) {
            delete this.equipment['weapon1'];
            delete this.equipment['weapon2'];
        } else if (item.isPlaceholder) {
            const parent = this.equipment[item.parentSlot];
            if (parent && parent.isTwoHanded) {
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
    }

    // --- Stat Breakdown for Tooltips ---
    getStatBreakdown(stat: 'ATK' | 'DEF' | 'SPD', party: Combatant[] = []): { source: string, value: string, isNegative: boolean }[] {
        const breakdown: { source: string, value: string, isNegative: boolean }[] = [];
        
        if (stat === 'ATK') {
            let current = this.power;
            // Innate
            if (this.race === 'Orc') breakdown.push({ source: 'Orc Ferocity', value: '+4', isNegative: false }), current += 4;
            if (this.race === 'Undead') breakdown.push({ source: 'Undead Might', value: '+2', isNegative: false }), current += 2;
            if (this.race === 'Beastman') breakdown.push({ source: 'Beast Roar', value: '+2', isNegative: false }), current += 2;
            if (this.race === 'Demon') breakdown.push({ source: 'Demonic Pact', value: '+5', isNegative: false }), current += 5;
            
            // Equipment
            Object.values(this.equipment).forEach(item => {
                if (item?.statBoost?.atk) {
                    breakdown.push({ source: item.name, value: `+${item.statBoost.atk}`, isNegative: false });
                    current += item.statBoost.atk;
                }
            });

            // Scaling
            if (this.job === 'Swordsman') {
                const boost = Math.floor(current * 0.10);
                breakdown.push({ source: 'Swordsman Training', value: `+${boost} (10%)`, isNegative: false });
                current += boost;
            }
            if (this.job === 'Berserker') {
                const boost = Math.floor(current * 0.20);
                breakdown.push({ source: 'Berserker Rage', value: `+${boost} (20%)`, isNegative: false });
                current += boost;
            }

            // Skills
            const rowAllies = party.filter(p => p.positionLine === this.positionLine && p.hp > 0);
            const hasRoyalDecree = rowAllies.some(p => 
                Object.values(p.equipment).some(i => i?.passives?.some((ps: any) => ps.name === 'Royal Decree' || ps.id === 'royal_decree'))
            );
            if (hasRoyalDecree) {
                const boost = Math.floor(current * 0.10);
                breakdown.push({ source: 'Royal Decree Aura', value: `+${boost} (10%)`, isNegative: false });
            }

            // Leader
            const leader = party.find(h => h.isLeader);
            if (leader?.name === 'Valthea' && this.positionLine === 'VANGUARD') {
                const boost = Math.floor(current * 0.15);
                breakdown.push({ source: 'Valthea Precision', value: `+${boost} (15%)`, isNegative: false });
                current += boost;
            }
            if (leader?.name === 'Vex' && this.hasEliteBonus) {
                const boost = Math.floor(current * 0.10);
                breakdown.push({ source: 'Vex Ferocity', value: `+${boost} (10%)`, isNegative: false });
                current += boost;
            }
            if (this.battleAtkBuffPct !== 0) {
                const boost = Math.floor(current * (this.battleAtkBuffPct / 100));
                breakdown.push({ source: 'Combat Momentum', value: `${boost > 0 ? '+' : ''}${boost} (${this.battleAtkBuffPct}%)`, isNegative: this.battleAtkBuffPct < 0 });
            }
        }

        if (stat === 'DEF') {
            let current = this.def;
            if (this.race === 'Dwarf') breakdown.push({ source: 'Dwarf Resilience', value: '+5', isNegative: false }), current += 5;
            if (this.race === 'Undead') breakdown.push({ source: 'Cold Flesh', value: '+5', isNegative: false }), current += 5;
            if (this.race === 'Demon') breakdown.push({ source: 'Demonic Frailty', value: '-5', isNegative: true }), current -= 5;
            if (this.race === 'Dragon') breakdown.push({ source: 'Dragon Scales', value: '+5', isNegative: false }), current += 5;

            Object.values(this.equipment).forEach(item => {
                if (item?.statBoost?.def) {
                    const isNeg = item.statBoost.def < 0;
                    breakdown.push({ source: item.name, value: `${isNeg ? '' : '+'}${item.statBoost.def}`, isNegative: isNeg });
                    current += item.statBoost.def;
                }
            });

            if (this.job === 'Knight') {
                const boost = Math.floor(current * 0.15);
                breakdown.push({ source: 'Knight Bulwark', value: `+${boost} (15%)`, isNegative: false });
                current += boost;
            }
            if (this.job === 'Berserker') {
                const penalty = Math.floor(current * 0.10);
                breakdown.push({ source: 'Berserker Recklessness', value: `-${penalty} (10%)`, isNegative: true });
                current -= penalty;
            }
            if (this.job === 'Guardian') {
                const boost = Math.floor(current * 0.20);
                breakdown.push({ source: 'Guardian Aegis', value: `+${boost} (20%)`, isNegative: false });
                current += boost;
            }
            if (this.job === 'Paladin') {
                const boost = Math.floor(current * 0.10);
                breakdown.push({ source: 'Divine Grace', value: `+${boost} (10%)`, isNegative: false });
                current += boost;
            }

            if (this.trait?.id === 'vanguard_stance' && this.positionLine === 'VANGUARD') {
                const boost = Math.floor(current * 0.10);
                breakdown.push({ source: 'Vanguard Stance', value: `+${boost} (10%)`, isNegative: false });
            }

            const leader = party.find(h => h.isLeader);
            if (leader?.name === 'Valerius') {
                const boost = Math.floor(current * 0.15);
                breakdown.push({ source: 'Valerius Iron Will', value: `+${boost} (15%)`, isNegative: false });
                current += boost;
            }
            if (this.battleDefBuffPct !== 0) {
                const boost = Math.floor(current * (this.battleDefBuffPct / 100));
                breakdown.push({ source: 'Combat Momentum', value: `${boost > 0 ? '+' : ''}${boost} (${this.battleDefBuffPct}%)`, isNegative: this.battleDefBuffPct < 0 });
            }
        }

        if (stat === 'SPD') {
            let current = this.speed;
            if (this.race === 'Human') breakdown.push({ source: 'Human Adaptability', value: '+1', isNegative: false }), current += 1;
            if (this.race === 'Elf') breakdown.push({ source: 'Elf Grace', value: '+3', isNegative: false }), current += 3;
            if (this.race === 'Night-Elf') breakdown.push({ source: 'Shadow Affinity', value: '+5', isNegative: false }), current += 5;
            if (this.race === 'Undead') breakdown.push({ source: 'Eternal Slumber', value: '-2', isNegative: true }), current -= 2;
            if (this.race === 'Beastman') breakdown.push({ source: 'Feral Speed', value: '+2', isNegative: false }), current += 2;
            if (this.race === 'Dragon') breakdown.push({ source: 'Heavy Flight', value: '-2', isNegative: true }), current -= 2;
            if (this.race === 'Titan') breakdown.push({ source: 'Titan Stride', value: '-5', isNegative: true }), current -= 5;

            Object.values(this.equipment).forEach(item => {
                if (item?.statBoost?.spd) {
                    const isNeg = item.statBoost.spd < 0;
                    breakdown.push({ source: item.name, value: `${isNeg ? '' : '+'}${item.statBoost.spd}`, isNegative: isNeg });
                    current += item.statBoost.spd;
                }
            });

            if (this.job === 'Archer') {
                const boost = Math.floor(current * 0.10);
                breakdown.push({ source: 'Archer Reflexes', value: `+${boost} (10%)`, isNegative: false });
                current += boost;
            }
            if (this.job === 'Thief') {
                const boost = Math.floor(current * 0.15);
                breakdown.push({ source: 'Thief Cunning', value: `+${boost} (15%)`, isNegative: false });
                current += boost;
            }
            if (this.job === 'Guardian') {
                const penalty = Math.floor(current * 0.05);
                breakdown.push({ source: 'Guardian Bulk', value: `-${penalty} (5%)`, isNegative: true });
                current -= penalty;
            }
            if (this.job === 'Scout') {
                const boost = Math.floor(current * 0.10);
                breakdown.push({ source: 'Scout Agility', value: `+${boost} (10%)`, isNegative: false });
                current += boost;
            }

            const leader = party.find(h => h.isLeader);
            if (leader?.name === 'Lira') {
                const boost = Math.floor(current * 0.10);
                breakdown.push({ source: 'Lira Command', value: `+${boost} (10%)`, isNegative: false });
                current += boost;
            }

            if (this.battleSpdBuffPct !== 0) {
                const boost = Math.floor(current * (this.battleSpdBuffPct / 100));
                breakdown.push({ source: 'Combat Momentum', value: `${boost > 0 ? '+' : ''}${boost} (${this.battleSpdBuffPct}%)`, isNegative: this.battleSpdBuffPct < 0 });
            }
        }

        return breakdown;
    }
}
