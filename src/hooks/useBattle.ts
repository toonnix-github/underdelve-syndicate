import { useState, useCallback, useEffect } from 'react';
import { Combatant } from '../models/Combatant';
import { calculateDamage, calculateHeal } from '../utils/combatMath';

export interface ActiveAction {
    id: string;
    actorId: string;
    targetIds: string[]; // UPDATED TO ARRAY FOR AOE
    type: 'damage' | 'heal' | 'magic';
    icon: 'sword' | 'bow' | 'fang' | 'fire' | 'heart' | 'zap';
    geometry: 'melee' | 'range' | 'magic';
    isSpecial?: boolean;
    skillName?: string;
}

export interface UnitIntent {
    actorId: string;
    targetId: string;
    atb: number;
    geometry: 'melee' | 'range' | 'magic';
}

export const useBattle = (initialHeroes: Combatant[], initialEnemies: Combatant[]) => {
    const [heroes, setHeroes] = useState<Combatant[]>(initialHeroes.map(h => h.clone()));
    const [enemies, setEnemies] = useState<Combatant[]>(initialEnemies.map(e => e.clone()));
    const [isPaused, setIsPaused] = useState(true);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [winner, setWinner] = useState<'heros' | 'enemies' | null>(null);
    const [activeActions, setActiveActions] = useState<ActiveAction[]>([]);
    const [intents, setIntents] = useState<UnitIntent[]>([]);

    const log = useCallback((msg: string) => {
        setBattleLog(prev => [msg, ...prev].slice(0, 5));
    }, []);

    const processAction = useCallback(async (unitId: string) => {
        const all = [...heroes, ...enemies];
        const unit = all.find(u => u.id === unitId);
        if (!unit || unit.hp <= 0 || unit.isActing) return;

        const isHero = unit.isHero;
        
        // --- SIGNATURE MOVE SELECTION ---
        let selectedSkill = unit.abilities[0]; // Normal
        if (unit.abilities[1] && Math.random() < (unit.abilities[1].procChance || 0)) {
            selectedSkill = unit.abilities[1]; 
            unit.triggerChant(selectedSkill.name);
            log(`!!! ${unit.name} triggers ${selectedSkill.name.toUpperCase()} !!!`);
        }
        
        // --- MULTI-TARGET RESOLUTION ---
        let targets: Combatant[] = [];
        const opponents = isHero ? enemies : heroes;
        const teammates = isHero ? heroes : enemies;

        if (selectedSkill.targetType === 'all') {
            targets = selectedSkill.type === 'heal' 
                ? teammates.filter(t => t.hp > 0)
                : opponents.filter(o => o.hp > 0);
        } else if (selectedSkill.targetType === 'row') {
            // Target the front row if anyone is alive, else back row
            const front = opponents.filter(o => o.positionLine === 'VANGUARD' && o.hp > 0);
            targets = front.length > 0 ? front : opponents.filter(o => o.hp > 0);
        } else {
            // Single target
            if (selectedSkill.type === 'heal') {
                const healT = teammates.filter(t => t.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0];
                if (healT) targets = [healT];
            } else {
                const aliveOps = opponents.filter(t => t.hp > 0);
                if (aliveOps.length > 0) {
                    targets = [aliveOps[Math.floor(Math.random() * aliveOps.length)]];
                }
            }
        }

        if (targets.length === 0) return;

        // Visual Setup
        const actionId = Math.random().toString(36).substr(2, 9);
        const isSpecial = selectedSkill === unit.abilities[1];
        let icon: 'sword' | 'bow' | 'fang' | 'fire' | 'heart' | 'zap' = 'sword';
        let geometry: 'melee' | 'range' | 'magic' = 'melee';
        let hitType: 'slash' | 'broken' | 'burn' = 'slash';

        if (selectedSkill.type === 'heal' || unit.role === 'HEALER') {
            icon = selectedSkill.type === 'heal' ? 'heart' : 'zap';
            geometry = 'magic';
            hitType = selectedSkill.type === 'heal' ? 'slash' : 'broken';
        } else if (unit.imageId === 'hero_kael' || unit.imageId === 'hero_slyn') {
            icon = 'bow';
            geometry = 'range';
            hitType = 'slash';
        } else if (unit.role === 'DPS' && selectedSkill.targetType !== 'single') {
            // Big AOE/Special logic often feels like magic/tactical rain
            icon = 'fire';
            geometry = 'magic';
            hitType = 'burn';
        } else if (unit.role === 'TANK') {
            icon = isHero ? 'sword' : 'fang';
            geometry = 'melee';
            hitType = 'broken';
        }

        const newAction: ActiveAction = { 
            id: actionId, 
            actorId: unit.id, 
            targetIds: targets.map(t => t.id), 
            type: selectedSkill.type, 
            icon, 
            geometry,
            isSpecial,
            skillName: selectedSkill.name
        };
        
        setActiveActions(prev => [...prev, newAction]);
        unit.isActing = true;
        unit.attackPhase = 'advance';
        setHeroes([...heroes]); setEnemies([...enemies]);
        
        await new Promise(r => setTimeout(r, 200));
        
        unit.attackPhase = 'strike';
        
        // EXECUTE IMPACT ON ALL TARGETS
        targets.forEach(target => {
            if (selectedSkill.type === 'damage') {
                const dmg = calculateDamage(unit, target, isHero ? heroes : enemies, isHero ? enemies : heroes);
                target.hp = Math.max(0, target.hp - dmg);
                target.addVfx(`-${dmg}`, 'damage');
                target.triggerHit(hitType);
            } else {
                const heal = calculateHeal(unit, selectedSkill.val, isHero ? heroes : enemies);
                target.hp = Math.min(target.maxHp, target.hp + heal);
                target.addVfx(`+${heal}`, 'heal');
                target.triggerHeal();
            }
        });
        
        log(`${unit.name} uses ${selectedSkill.name}!`);

        unit.atb = 0;
        setHeroes([...heroes]); setEnemies([...enemies]);

        await new Promise(r => setTimeout(r, 400));
        unit.attackPhase = 'return';
        setHeroes([...heroes]); setEnemies([...enemies]);

        await new Promise(r => setTimeout(r, 150));
        unit.attackPhase = 'idle';
        unit.isActing = false;
        setActiveActions(prev => prev.filter(a => a.id !== actionId));

        setHeroes([...heroes]); setEnemies([...enemies]);

        if (enemies.every(e => e.hp <= 0)) setWinner('heros');
        if (heroes.every(h => h.hp <= 0)) setWinner('enemies');
    }, [heroes, enemies, log]);

    useEffect(() => {
        if (isPaused || winner) return;

        const interval = setInterval(() => {
            const allAlive = [...heroes, ...enemies].filter(u => u.hp > 0);
            allAlive.forEach(u => {
                if (!u.isActing) u.updateAtb(0.05);
            });

            const newIntents: UnitIntent[] = allAlive.map(u => {
                let tid = "";
                let geom: 'melee' | 'range' | 'magic' = 'melee';
                if (u.abilities[0].type === 'heal') {
                    const teammates = u.isHero ? heroes : enemies;
                    tid = teammates.filter(t => t.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0]?.id || "";
                    geom = 'magic';
                } else {
                    const opponents = u.isHero ? enemies : heroes;
                    tid = opponents.filter(t => t.hp > 0)[0]?.id || "";
                    geom = (u.role === 'DPS' || u.role === 'HEALER') ? 'magic' : 'melee';
                }
                return { actorId: u.id, targetId: tid, atb: u.atb, geometry: geom };
            });
            setIntents(newIntents);

            const actors = allAlive.filter(u => u.atb >= 100 && !u.isActing);
            actors.forEach(actor => processAction(actor.id));

            setHeroes([...heroes]);
            setEnemies([...enemies]);
        }, 50);

        return () => clearInterval(interval);
    }, [isPaused, heroes, enemies, winner, processAction]);

    return {
        heroes,
        enemies,
        isPaused,
        setIsPaused,
        battleLog,
        winner,
        activeActions,
        intents,
        setHeroes,
        setEnemies
    };
};
