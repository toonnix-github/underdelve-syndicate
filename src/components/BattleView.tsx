import React, { useState, useRef, useEffect } from 'react';
import { Combatant } from '../models/Combatant';
import { useBattle, UnitIntent, ActiveAction } from '../hooks/useBattle';
import { CombatantCard } from './CombatantCard';
import { Button } from './UI';
import { Swords, Info, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface BattleViewProps {
    heroes: Combatant[];
    enemies: Combatant[];
    onVictory: (remainingHeroes: Combatant[]) => void;
    onDefeat: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ heroes: initialHeroes, enemies: initialEnemies, onVictory, onDefeat }) => {
    const battleRef = useRef<HTMLDivElement>(null);
    const [arcSystem, setArcSystem] = useState<Map<string, {x1: number, y1: number, x2: number, y2: number}>>(new Map());

    const { 
        heroes, 
        enemies, 
        isPaused, 
        setIsPaused, 
        battleLog, 
        winner,
        activeActions,
        intents
    } = useBattle(initialHeroes, initialEnemies);

    useEffect(() => {
        const container = battleRef.current;
        if (!container) return;

        const updateArcs = () => {
            const containerBox = container.getBoundingClientRect();
            const newArcMap = new Map();

            const allTrackedIds = new Set([
                ...intents.map(i => i.actorId),
                ...activeActions.map(a => a.actorId)
            ]);

            allTrackedIds.forEach(actorId => {
                const intent = intents.find(i => i.actorId === actorId);
                const action = activeActions.find(a => a.actorId === actorId);
                const tid = action?.targetId || intent?.targetId;

                if (!tid) return;

                const actorEl = document.getElementById(`unit-${actorId}`);
                const targetEl = document.getElementById(`unit-${tid}`);

                if (actorEl && targetEl) {
                    const actorBox = actorEl.getBoundingClientRect();
                    const targetBox = targetEl.getBoundingClientRect();

                    newArcMap.set(actorId, {
                        x1: (actorBox.left + actorBox.width / 2) - containerBox.left,
                        y1: (actorBox.top + actorBox.height / 2) - containerBox.top,
                        x2: (targetBox.left + targetBox.width / 2) - containerBox.left,
                        y2: (targetBox.top + targetBox.height / 2) - containerBox.top,
                    });
                }
            });

            setArcSystem(newArcMap);
        };

        let frameId: number;
        const loop = () => {
            updateArcs();
            frameId = requestAnimationFrame(loop);
        };
        
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [intents, activeActions]);

    useEffect(() => {
        if (winner === 'heros') {
            setTimeout(() => onVictory(heroes), 2000);
        } else if (winner === 'enemies') {
            setTimeout(() => onDefeat(), 2000);
        }
    }, [winner, heroes, onVictory, onDefeat]);

    const getArcColor = (type: string) => {
        switch (type) {
            case 'heal': return '#10b981';
            case 'magic': return '#d946ef';
            default: return '#000000';
        }
    };

    const getPath = (coords: {x1: number, y1: number, x2: number, y2: number}, geometry: 'melee' | 'range' | 'magic') => {
        const { x1, y1, x2, y2 } = coords;
        
        if (geometry === 'melee') {
            return `M ${x1} ${y1} L ${x2} ${y2}`;
        }

        const midX = (x1 + x2) / 2;
        const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // Ranged attacks arc moderately, Magic arcs high
        const curveFactor = geometry === 'magic' ? 0.35 : 0.15;
        const midY = Math.min(y1, y2) - (dist * curveFactor); 
        return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
    };

    return (
        <div ref={battleRef} className="w-full h-full flex flex-col bg-zinc-950 p-6 relative overflow-hidden font-sans">
            
            <svg className="absolute inset-0 pointer-events-none z-20 w-full h-full">
                <defs>
                    <marker id="arrow-dashed-black" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M 0 0 L 6 2 L 0 4 Z" fill="#000000" fillOpacity="0.4" />
                    </marker>
                    <marker id="arrow-dashed-magic" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M 0 0 L 6 2 L 0 4 Z" fill="#d946ef" fillOpacity="0.4" />
                    </marker>
                    <marker id="arrow-dashed-heal" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M 0 0 L 6 2 L 0 4 Z" fill="#10b981" fillOpacity="0.4" />
                    </marker>
                </defs>
                
                {/* Intent Lines */}
                {intents.filter(i => !activeActions.some(a => a.actorId === i.actorId) && i.atb > 5).map(intent => {
                    const coords = arcSystem.get(intent.actorId);
                    if (!coords) return null;
                    return (
                        <path 
                            key={`intent-${intent.actorId}`}
                            d={getPath(coords, intent.geometry)}
                            fill="transparent"
                            stroke="#333333"
                            strokeWidth="1"
                            strokeDasharray="2 4"
                            opacity={0.15}
                        />
                    );
                })}

                {/* BOLDER, GEOMETRIC ACTIVE STRIKES */}
                {activeActions.map(action => {
                    const coords = arcSystem.get(action.actorId);
                    if (!coords) return null;
                    return (
                        <g key={`action-${action.id}`} className="animate-in fade-in duration-200">
                            <path 
                                d={getPath(coords, action.geometry)}
                                fill="transparent"
                                stroke={getArcColor(action.type)}
                                strokeWidth="4" // 1.3x BOLDER
                                strokeDasharray="6 4"
                                strokeOpacity="0.5"
                                strokeLinecap="round"
                                markerEnd={
                                    action.type === 'heal' ? 'url(#arrow-dashed-heal)' : 
                                    action.type === 'magic' ? 'url(#arrow-dashed-magic)' : 
                                    'url(#arrow-dashed-black)'
                                }
                            />
                        </g>
                    );
                })}
            </svg>

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

            <div className="flex-1 flex items-center justify-center gap-12 relative z-10 px-4">
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">REAR</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center border-r border-zinc-900 pr-4">
                            {enemies.filter(e => e.positionLine === 'REARGUARD').map(enemy => (
                                <CombatantCard 
                                    key={enemy.id} unit={enemy} isEnemy party={enemies} 
                                    className="scale-75 origin-center -my-8" 
                                    activeIcon={activeActions.find(a => a.actorId === enemy.id)?.icon}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-red-900 uppercase tracking-widest">FRONT</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center">
                            {enemies.filter(e => e.positionLine === 'VANGUARD').map(enemy => (
                                <CombatantCard 
                                    key={enemy.id} unit={enemy} isEnemy party={enemies} 
                                    className="scale-75 origin-center -my-8" 
                                    activeIcon={activeActions.find(a => a.actorId === enemy.id)?.icon}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                    <div className="p-3 bg-zinc-900 rounded-full border border-zinc-800 my-2">
                        <AlertCircle className="text-zinc-600" size={16} />
                    </div>
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-cyan-900 uppercase tracking-widest">FRONT</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center">
                            {heroes.filter(h => h.positionLine === 'VANGUARD').map(hero => (
                                <CombatantCard 
                                    key={hero.id} unit={hero} party={heroes} 
                                    className="scale-75 origin-center -my-8" 
                                    activeIcon={activeActions.find(a => a.actorId === hero.id)?.icon}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">REAR</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center border-l border-zinc-900 pl-4">
                            {heroes.filter(h => h.positionLine === 'REARGUARD').map(hero => (
                                <CombatantCard 
                                    key={hero.id} unit={hero} party={heroes} 
                                    className="scale-75 origin-center -my-8" 
                                    activeIcon={activeActions.find(a => a.actorId === hero.id)?.icon}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

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
        </div>
    );
};
