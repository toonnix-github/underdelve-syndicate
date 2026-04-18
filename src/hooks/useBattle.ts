import { useState, useCallback, useEffect } from 'react';
import { Combatant } from '../models/Combatant';
import { calculateDamage, calculateHeal } from '../utils/combatMath';

export interface ActiveAction {
    id: string;
    actorId: string;
    targetId: string;
    type: 'damage' | 'heal' | 'magic';
    icon: 'sword' | 'bow' | 'fang' | 'fire' | 'heart' | 'zap';
    geometry: 'melee' | 'range' | 'magic';
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
        const ability = unit.abilities[0];
        
        let target: Combatant | null = null;
        if (ability.type === 'heal') {
            const teammates = isHero ? heroes : enemies;
            target = teammates.filter(t => t.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0];
        } else {
            const opponents = isHero ? enemies : heroes;
            const aliveOpponents = opponents.filter(t => t.hp > 0);
            if (aliveOpponents.length > 0) {
                target = aliveOpponents[Math.floor(Math.random() * aliveOpponents.length)];
            }
        }

        if (!target) return;

        const actionId = Math.random().toString(36).substr(2, 9);
        let type: 'damage' | 'heal' | 'magic' = 'damage';
        let icon: 'sword' | 'bow' | 'fang' | 'fire' | 'heart' | 'zap' = 'sword';
        let geometry: 'melee' | 'range' | 'magic' = 'melee';
        let hitType: 'slash' | 'broken' | 'burn' = 'slash';

        if (ability.type === 'heal') {
            type = 'heal'; icon = 'heart'; geometry = 'magic';
        } else if (unit.role === 'DPS') {
            type = 'magic'; icon = 'fire'; geometry = 'magic'; hitType = 'burn';
        } else if (unit.role === 'HEALER') {
            type = 'magic'; icon = 'zap'; geometry = 'magic'; hitType = 'broken';
        } else if (!isHero && unit.role === 'TANK') {
            icon = 'fang'; geometry = 'melee'; hitType = 'broken';
        } else if (unit.role === 'TANK' && isHero) {
            icon = 'sword'; geometry = 'melee'; hitType = 'slash';
        }

        const newAction: ActiveAction = { id: actionId, actorId: unit.id, targetId: target.id, type, icon, geometry };
        
        setActiveActions(prev => [...prev, newAction]);
        unit.isActing = true;
        unit.attackPhase = 'advance';
        setHeroes([...heroes]); setEnemies([...enemies]);
        
        await new Promise(r => setTimeout(r, 200));
        
        unit.attackPhase = 'strike';
        if (ability.type === 'damage') {
            const dmg = calculateDamage(unit, target, isHero ? heroes : enemies, isHero ? enemies : heroes);
            target.hp = Math.max(0, target.hp - dmg);
            target.addVfx(`-${dmg}`, 'damage');
            target.triggerHit(hitType);
            log(`${unit.name} strikes ${target.name} for ${dmg} damage!`);
        } else {
            const heal = calculateHeal(unit, ability.val, isHero ? heroes : enemies);
            target.hp = Math.min(target.maxHp, target.hp + heal);
            target.addVfx(`+${heal}`, 'heal');
            target.triggerHeal();
            log(`${unit.name} heals ${target.name} for ${heal}!`);
        }

        unit.atb = 0;
        setHeroes([...heroes]); setEnemies([...enemies]);

        await new Promise(r => setTimeout(r, 300));
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
