import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Combatant } from '../models/Combatant';
import { useBattle, UnitIntent, ActiveAction } from '../hooks/useBattle';
import { CombatantCard } from './CombatantCard';
import { Button } from './UI';
import { Swords, Info, Play, Pause } from 'lucide-react';
import { clsx } from 'clsx';

interface BattleViewProps {
    heroes: Combatant[];
    enemies: Combatant[];
    onVictory: (remainingHeroes: Combatant[]) => void;
    onDefeat: () => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ heroes: initialHeroes, enemies: initialEnemies, onVictory, onDefeat }) => {
    const battleRef = useRef<HTMLDivElement>(null);
    const [arcSystem, setArcSystem] = useState<Map<string, {x: number, y: number}>>(new Map());
    const [countdown, setCountdown] = useState<number | null>(3);

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

    // Random Background selector (one per battle encounter)
    const battleBg = useMemo(() => {
        const bgIdx = Math.floor(Math.random() * 4) + 1;
        return `assets/battle-bgs/bg_${bgIdx}.png`;
    }, []);

    // Initial Countdown logic
    useEffect(() => {
        if (!isPaused) {
            setCountdown(null);
            return;
        }

        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setIsPaused(false);
            setCountdown(null);
        }
    }, [countdown, isPaused, setIsPaused]);

    // Track unit positions in real-time
    useEffect(() => {
        const container = battleRef.current;
        if (!container) return;

        const updatePositions = () => {
            const containerBox = container.getBoundingClientRect();
            const newPosMap = new Map();

            const allUnitIds = [...heroes, ...enemies].map(u => u.id);

            allUnitIds.forEach(id => {
                const el = document.getElementById(`unit-${id}`);
                if (el) {
                    const box = el.getBoundingClientRect();
                    newPosMap.set(id, {
                        x: (box.left + box.width / 2) - containerBox.left,
                        y: (box.top + box.height / 2) - containerBox.top,
                    });
                }
            });

            setArcSystem(newPosMap);
        };

        let frameId: number;
        const loop = () => {
            updatePositions();
            frameId = requestAnimationFrame(loop);
        };
        
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [heroes, enemies, intents, activeActions]);

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
            default: return '#f59e0b';
        }
    };

    const getPath = (p1: {x: number, y: number}, p2: {x: number, y: number}, geometry: 'melee' | 'range' | 'magic') => {
        const midX = (p1.x + p2.x) / 2;
        const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const curveFactor = geometry === 'magic' ? 0.6 : geometry === 'range' ? 0.2 : 0.05; 
        const midY = Math.min(p1.y, p2.y) - (dist * curveFactor); 
        return `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;
    };

    return (
        <div ref={battleRef} className="w-full h-full flex flex-col bg-zinc-950 p-6 relative overflow-hidden font-sans">
            
            {/* AMBIENT BATTLE BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={battleBg} 
                    alt="Battle Arena" 
                    className="w-full h-full object-cover opacity-60 brightness-[0.4] blur-[2px]" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95" />
            </div>
            
            <svg className="absolute inset-0 pointer-events-none z-[60] w-full h-full">
                <defs>
                    <marker id="arrow-solid-amber" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M 0 0 L 6 2 L 0 4 Z" fill="#f59e0b" />
                    </marker>
                    <marker id="arrow-solid-magic" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M 0 0 L 6 2 L 0 4 Z" fill="#d946ef" />
                    </marker>
                    <marker id="arrow-solid-heal" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M 0 0 L 6 2 L 0 4 Z" fill="#10b981" />
                    </marker>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                
                {/* HIGH-VISIBILITY NEON STRIKES */}
                {activeActions.map(action => {
                    const p1 = arcSystem.get(action.actorId);
                    if (!p1) return null;
                    
                    return action.targetIds.map(tid => {
                        const p2 = arcSystem.get(tid);
                        if (!p2) return null;
                        const pathData = getPath(p1, p2, action.geometry);
                        const color = getArcColor(action.type);
                        
                        return (
                            <g key={`action-${action.id}-${tid}`} filter="url(#glow)">
                                <path 
                                    d={pathData}
                                    fill="transparent"
                                    stroke="#000"
                                    strokeWidth="10"
                                    opacity="0.3"
                                    strokeLinecap="round"
                                />
                                <path 
                                    d={pathData}
                                    fill="transparent"
                                    stroke={color}
                                    strokeWidth="6"
                                    strokeOpacity="0.8"
                                    strokeLinecap="round"
                                    strokeDasharray="15 10"
                                    markerEnd={
                                        action.type === 'heal' ? 'url(#arrow-solid-heal)' : 
                                        action.type === 'magic' ? 'url(#arrow-solid-magic)' : 
                                        'url(#arrow-solid-amber)'
                                    }
                                >
                                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />
                                </path>
                                <path 
                                    d={pathData}
                                    fill="transparent"
                                    stroke="#fff"
                                    strokeWidth="1.5"
                                    strokeOpacity="0.6"
                                    strokeLinecap="round"
                                    strokeDasharray="15 10"
                                >
                                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />
                                </path>
                            </g>
                        );
                    });
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
                {/* Countdown visual if active */}
                {countdown !== null && countdown > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-500/40 animate-pulse">
                        <span className="text-[10px] font-black italic text-amber-500 tracking-widest">AUTO-DISPATCH IN {countdown}S</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex items-center justify-center gap-12 relative z-10 px-4">
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">REAR</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center border-r border-zinc-900 pr-4">
                            {enemies.filter(e => e.positionLine === 'REARGUARD').map(enemy => (
                                <CombatantCard 
                                    key={enemy.id} unit={enemy} isEnemy party={enemies} 
                                    className="w-48 h-64 scale-75 origin-center -my-8" 
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
                                    className="w-48 h-64 scale-75 origin-center -my-8" 
                                    activeIcon={activeActions.find(a => a.actorId === enemy.id)?.icon}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* CENTRAL CONTROL HUB */}
                <div className="flex flex-col items-center flex-shrink-0 group">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                    
                    <button 
                        onClick={() => {
                            setIsPaused(!isPaused);
                            setCountdown(null);
                        }}
                        className={clsx(
                            "w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-lg scale-110 active:scale-95",
                            isPaused 
                                ? "bg-cyan-500 border-cyan-400 text-black shadow-cyan-500/20 hover:scale-125 hover:shadow-cyan-500/40" 
                                : "bg-black/80 border-zinc-800 text-zinc-400 hover:border-cyan-500 hover:text-cyan-500"
                        )}
                    >
                        {isPaused ? <Play size={28} className="ml-1" fill="currentColor" /> : <Pause size={28} fill="currentColor" />}
                        {isPaused && (
                             <div className="absolute -inset-2 rounded-full border border-cyan-500/30 animate-ping pointer-events-none" />
                        )}
                    </button>

                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-cyan-900 uppercase tracking-widest">FRONT</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center">
                            {heroes.filter(h => h.positionLine === 'VANGUARD').map(hero => (
                                <CombatantCard 
                                    key={hero.id} unit={hero} party={heroes} 
                                    className="w-48 h-64 scale-75 origin-center -my-8" 
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
                                    className="w-48 h-64 scale-75 origin-center -my-8" 
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
