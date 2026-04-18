import { useState, useCallback, useEffect } from 'react';
import { Combatant } from '../models/Combatant';
import { calculateDamage, calculateHeal } from '../utils/combatMath';

export const useBattle = (initialHeroes: Combatant[], initialEnemies: Combatant[]) => {
    // Clone to ensure we don't mutate original refs
    const [heroes, setHeroes] = useState<Combatant[]>(initialHeroes.map(h => h.clone()));
    const [enemies, setEnemies] = useState<Combatant[]>(initialEnemies.map(e => e.clone()));
    const [isPaused, setIsPaused] = useState(true);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [winner, setWinner] = useState<'heros' | 'enemies' | null>(null);

    const log = useCallback((msg: string) => {
        setBattleLog(prev => [msg, ...prev].slice(0, 5));
    }, []);

    const processAction = useCallback(async (unit: Combatant) => {
        const isHero = unit.isHero;
        const targets = isHero ? enemies : heroes;
        const aliveTargets = targets.filter(t => t.hp > 0);

        if (aliveTargets.length === 0) return;

        const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
        const ability = unit.abilities[0];

        // START ACTION CYCLE
        unit.isActing = true;
        unit.attackPhase = 'advance';
        
        // Trigger React rerender for 'advance'
        setHeroes(prev => prev.map(h => h.id === unit.id ? unit : h));
        setEnemies(prev => prev.map(e => e.id === unit.id ? unit : e));
        
        await new Promise(r => setTimeout(r, 150));
        
        unit.attackPhase = 'strike';
        
        if (ability.type === 'damage') {
            const dmg = calculateDamage(unit, target, isHero ? heroes : enemies, isHero ? enemies : heroes);
            target.hp = Math.max(0, target.hp - dmg);
            target.addVfx(`-${dmg}`, 'damage');
            log(`${unit.name} uses ${ability.name} on ${target.name} for ${dmg} damage!`);
        } else {
            const heal = calculateHeal(unit, ability.val, isHero ? heroes : enemies);
            const healTarget = isHero 
                ? heroes.filter(h => h.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0]
                : enemies.filter(e => e.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0];
            
            if (healTarget) {
                healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + heal);
                healTarget.addVfx(`+${heal}`, 'heal');
                log(`${unit.name} heals ${healTarget.name} for ${heal}!`);
            }
        }

        unit.atb = 0;
        
        // Trigger React rerender for 'strike' results
        setHeroes([...heroes]);
        setEnemies([...enemies]);

        await new Promise(r => setTimeout(r, 200));

        unit.attackPhase = 'return';
        setHeroes([...heroes]);
        setEnemies([...enemies]);

        await new Promise(r => setTimeout(r, 150));

        unit.attackPhase = 'idle';
        unit.isActing = false;

        setHeroes([...heroes]);
        setEnemies([...enemies]);

        // Check for win/loss
        if (enemies.every(e => e.hp <= 0)) setWinner('heros');
        if (heroes.every(h => h.hp <= 0)) setWinner('enemies');
    }, [heroes, enemies, log]);

    useEffect(() => {
        if (isPaused || winner) return;

        const interval = setInterval(() => {
            const allUnits = [...heroes, ...enemies].filter(u => u.hp > 0);
            
            // Update ATB
            allUnits.forEach(u => u.updateAtb(0.05));

            // Check if anyone can act
            const actor = allUnits.find(u => u.atb >= 100);
            if (actor) {
                processAction(actor);
            }

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
        setHeroes,
        setEnemies
    };
};
