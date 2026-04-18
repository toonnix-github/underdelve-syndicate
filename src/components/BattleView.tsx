import React, { useState } from 'react';
import { Combatant } from '../models/Combatant';
import { useBattle } from '../hooks/useBattle';
import { CombatantCard } from './CombatantCard';
import { Button } from './UI';
import { Swords, Info, AlertCircle, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface BattleViewProps {
    heroes: Combatant[];
    enemies: Combatant[];
    onVictory: (remainingHeroes: Combatant[]) => void;
    onDefeat: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ heroes: initialHeroes, enemies: initialEnemies, onVictory, onDefeat }) => {
    const { 
        heroes, 
        enemies, 
        isPaused, 
        setIsPaused, 
        battleLog, 
        winner 
    } = useBattle(initialHeroes, initialEnemies);

    // Effect to handle win/loss transitions
    React.useEffect(() => {
        if (winner === 'heros') {
            setTimeout(() => onVictory(heroes), 2000);
        } else if (winner === 'enemies') {
            setTimeout(() => onDefeat(), 2000);
        }
    }, [winner, heroes, onVictory, onDefeat]);

    const heroVanguard = heroes.filter(h => h.positionLine === 'VANGUARD');
    const heroRearguard = heroes.filter(h => h.positionLine === 'REARGUARD');
    
    // Note: Enemies also have positionLines, but they might all be VANGUARD by default.
    // For now, we split them to show the layout even if mostly VANGUARD.
    const enemyVanguard = enemies.filter(e => e.positionLine === 'VANGUARD');
    const enemyRearguard = enemies.filter(e => e.positionLine === 'REARGUARD');

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 p-6 relative overflow-hidden font-sans">
            {/* Battle Header */}
            <div className="flex justify-between items-center mb-6 relative z-10 px-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-950/40 rounded-lg border border-red-900/50">
                        <Swords className="text-red-500 animate-pulse" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-100">Conflict Engaged</h2>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{isPaused ? 'Engagement Paused' : 'Real-time Combat Active'}</p>
                    </div>
                </div>

                <Button 
                    variant={isPaused ? "primary" : "secondary"} 
                    onClick={() => setIsPaused(!isPaused)}
                    className="w-40 py-2 text-xs"
                >
                    {isPaused ? "RESUME" : "PAUSE"}
                </Button>
            </div>

            {/* Combat Arena */}
            <div className="flex-1 flex items-center justify-center gap-12 relative z-10 px-4">
                
                {/* HOSTILE FORCES (LEFT) */}
                <div className="flex gap-4 items-center">
                    {/* ENEMY REARGUARD */}
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">REAR</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center border-r border-zinc-900 pr-4">
                            {enemyRearguard.map(enemy => (
                                <CombatantCard key={enemy.id} unit={enemy} isEnemy party={enemies} className="scale-75 origin-center -my-8" />
                            ))}
                        </div>
                    </div>
                    {/* ENEMY VANGUARD */}
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-red-900 uppercase tracking-widest">FRONT</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center">
                            {enemyVanguard.map(enemy => (
                                <CombatantCard key={enemy.id} unit={enemy} isEnemy party={enemies} className="scale-75 origin-center -my-8" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* CLASH POINT (CENTER) */}
                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                    <div className="relative group">
                        <div className="absolute inset-0 bg-zinc-500/20 blur-xl rounded-full" />
                        <div className="relative p-3 bg-zinc-900 rounded-full border border-zinc-800 my-2">
                            <AlertCircle className="text-zinc-600" size={16} />
                        </div>
                    </div>
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                </div>

                {/* SYNDICATE FORCES (RIGHT) */}
                <div className="flex gap-4 items-center">
                    {/* HERO VANGUARD */}
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-cyan-900 uppercase tracking-widest">FRONT</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center">
                            {heroVanguard.map(hero => (
                                <CombatantCard key={hero.id} unit={hero} party={heroes} className="scale-75 origin-center -my-8" />
                            ))}
                        </div>
                    </div>
                    {/* HERO REARGUARD */}
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">REAR</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center border-l border-zinc-900 pl-4">
                            {heroRearguard.map(hero => (
                                <CombatantCard key={hero.id} unit={hero} party={heroes} className="scale-75 origin-center -my-8" />
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Victory/Defeat Overlay */}
            {winner && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-1000">
                    <div className="text-center space-y-4">
                        <h2 className={clsx(
                            "text-9xl font-black italic tracking-tighter uppercase",
                            winner === 'heros' ? "text-cyan-400" : "text-red-600"
                        )}>
                            {winner === 'heros' ? 'VICTORY' : 'DEFEAT'}
                        </h2>
                        <p className="text-zinc-400 font-bold uppercase tracking-widest">
                            {winner === 'heros' ? 'The syndicate secures the floor.' : 'The expedition has been terminated.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Battle Logs */}
            <div className="mt-4 bg-black/40 border border-zinc-800/50 rounded-xl p-4 backdrop-blur-sm relative z-10 mx-4">
                <div className="flex items-center gap-2 mb-2 text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    <Info size={10} /> Data Stream
                </div>
                <div className="h-20 overflow-y-auto space-y-0.5 font-mono text-[10px]">
                    {battleLog.map((log, i) => (
                        <div key={i} className={clsx(
                            "py-0.5 border-b border-zinc-900/50 last:border-0",
                            i === 0 ? "text-zinc-100 font-black italic" : "text-zinc-600"
                        )}>
                            {log}
                        </div>
                    ))}
                    {battleLog.length === 0 && <div className="text-zinc-800 italic">Standby for combat data...</div>}
                </div>
            </div>

            {/* Background Vibe */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-900/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-900/5 blur-[100px] rounded-full" />
            </div>
        </div>
    );
};
