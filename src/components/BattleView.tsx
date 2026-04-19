import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Combatant } from '../models/Combatant';
import { useBattle } from '../hooks/useBattle';
import { CombatantCard } from './CombatantCard';
import { Swords, Info, Play, Pause } from 'lucide-react';
import { clsx } from 'clsx';

interface BattleViewProps {
    heroes: Combatant[];
    enemies: Combatant[];
    onVictory: (remainingHeroes: Combatant[]) => void;
    onDefeat: () => void;
}

interface BattleUnitNotes {
    unitId: string;
    summary: string[];
    stats: string[];
}

interface HoverPanelPosition {
    top: number;
    left: number;
}

export const BattleView: React.FC<BattleViewProps> = ({ heroes: initialHeroes, enemies: initialEnemies, onVictory, onDefeat }) => {
    const battleRef = useRef<HTMLDivElement>(null);
    const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [arcSystem, setArcSystem] = useState<Map<string, { x: number; y: number }>>(new Map());
    const [countdown, setCountdown] = useState<number | null>(3);
    const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);
    const [hoverPanelPosition, setHoverPanelPosition] = useState<HoverPanelPosition | null>(null);

    const {
        heroes,
        enemies,
        isPaused,
        setIsPaused,
        battleLog,
        winner,
        activeActions
    } = useBattle(initialHeroes, initialEnemies);

    const battleBg = useMemo(() => {
        const bgIdx = Math.floor(Math.random() * 4) + 1;
        return `assets/battle-bgs/bg_${bgIdx}.png`;
    }, []);

    useEffect(() => {
        if (!isPaused) {
            setCountdown(null);
            return;
        }

        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        if (countdown === 0) {
            setIsPaused(false);
            setCountdown(null);
        }
    }, [countdown, isPaused, setIsPaused]);

    const unitById = useMemo(() => {
        return new Map([...heroes, ...enemies].map(unit => [unit.id, unit]));
    }, [heroes, enemies]);

    const actionByActorId = useMemo(() => {
        return new Map(activeActions.map(action => [action.actorId, action]));
    }, [activeActions]);

    const battleNotesById = useMemo(() => {
        const describeUnit = (unit: Combatant, allies: Combatant[]): BattleUnitNotes => {
            const stats: string[] = [];
            const leader = allies.find(member => member.isLeader);
            const pushStat = (delta: number, label: string, source: string) => {
                if (delta !== 0) {
                    stats.push(`${delta > 0 ? '+' : ''}${delta} ${label} : ${source}`);
                }
            };

            let atkRunning = unit.power;
            let defRunning = unit.def;
            let spdRunning = unit.speed;

            Object.values(unit.equipment || {}).forEach((item: any) => {
                if (!item?.statBoost) return;
                const boost = item.statBoost as { atk?: number; def?: number; spd?: number };
                if (boost.atk) {
                    atkRunning += boost.atk;
                    pushStat(boost.atk, 'ATK', 'Gear');
                }
                if (boost.def) {
                    defRunning += boost.def;
                    pushStat(boost.def, 'DEF', 'Gear');
                }
                if (boost.spd) {
                    spdRunning += boost.spd;
                    pushStat(boost.spd, 'SPD', 'Gear');
                }
            });

            if (leader?.name === 'Valthea' && unit.positionLine === 'VANGUARD') {
                const boosted = Math.floor(atkRunning * 1.15);
                pushStat(boosted - atkRunning, 'ATK', 'Leader');
                atkRunning = boosted;
            }

            if (leader?.name === 'Vex' && unit.hasEliteBonus) {
                const boosted = Math.floor(atkRunning * 1.10);
                pushStat(boosted - atkRunning, 'ATK', 'Leader');
                atkRunning = boosted;
            }

            if (unit.trait?.id === 'vanguard_stance' && unit.positionLine === 'VANGUARD') {
                const boosted = Math.floor(defRunning * 1.1);
                pushStat(boosted - defRunning, 'DEF', 'Trait');
                defRunning = boosted;
            }

            if (leader?.name === 'Valerius') {
                const boosted = Math.floor(defRunning * 1.15);
                pushStat(boosted - defRunning, 'DEF', 'Leader');
                defRunning = boosted;
            }

            if (unit.positionLine === 'VANGUARD') {
                const boosted = Math.floor(defRunning * 1.10);
                pushStat(boosted - defRunning, 'DEF', 'Frontline');
                defRunning = boosted;
            }

            if (leader?.name === 'Lira') {
                const boosted = Math.floor(spdRunning * 1.10);
                pushStat(boosted - spdRunning, 'SPD', 'Leader');
                spdRunning = boosted;
            }

            if (unit.positionLine === 'REARGUARD') {
                const boosted = Math.floor(spdRunning * 1.15);
                pushStat(boosted - spdRunning, 'SPD', 'Rearline');
                spdRunning = boosted;
            }

            return {
                unitId: unit.id,
                summary: [
                    unit.isLeader ? 'Leader' : 'Fighter',
                    unit.role,
                    unit.positionLine === 'VANGUARD' ? 'Frontline' : 'Rearline'
                ],
                stats,
            };
        };

        return new Map(
            [...heroes, ...enemies].map(unit => [
                unit.id,
                describeUnit(unit, unit.isHero ? heroes : enemies)
            ])
        );
    }, [heroes, enemies]);

    const hoveredUnit = useMemo(() => {
        if (!hoveredUnitId) return null;
        return unitById.get(hoveredUnitId) ?? null;
    }, [hoveredUnitId, unitById]);

    const hoveredUnitNotes = useMemo(() => {
        if (!hoveredUnitId) return null;
        return battleNotesById.get(hoveredUnitId) ?? null;
    }, [battleNotesById, hoveredUnitId]);

    useEffect(() => {
        if (hoveredUnitId && !unitById.has(hoveredUnitId)) {
            setHoveredUnitId(null);
            setHoverPanelPosition(null);
        }
    }, [hoveredUnitId, unitById]);

    useEffect(() => {
        if (!hoveredUnitId) return;

        let frameId = 0;
        const syncPosition = () => {
            const cardEl = document.getElementById(`unit-${hoveredUnitId}`);
            if (cardEl) {
                updateHoverPanelPosition(cardEl.getBoundingClientRect());
                frameId = requestAnimationFrame(syncPosition);
            }
        };

        syncPosition();
        return () => cancelAnimationFrame(frameId);
    }, [hoveredUnitId]);

    useEffect(() => {
        return () => {
            if (hoverCloseTimer.current) {
                clearTimeout(hoverCloseTimer.current);
            }
        };
    }, []);

    const updateHoverPanelPosition = (cardRect: DOMRect) => {
        const panelWidth = 200;
        const viewportPadding = 12;
        const left = Math.min(
            Math.max(viewportPadding, cardRect.left + (cardRect.width - panelWidth) / 2),
            window.innerWidth - panelWidth - viewportPadding
        );
        const top = Math.min(
            Math.max(viewportPadding, cardRect.top),
            window.innerHeight - 180
        );

        setHoverPanelPosition({ top, left });
    };

    const openUnitNotes = (unitId: string, cardRect: DOMRect) => {
        if (hoverCloseTimer.current) {
            clearTimeout(hoverCloseTimer.current);
            hoverCloseTimer.current = null;
        }
        setHoveredUnitId(unitId);
        updateHoverPanelPosition(cardRect);
    };

    const closeUnitNotesSoon = () => {
        if (hoverCloseTimer.current) {
            clearTimeout(hoverCloseTimer.current);
        }
        hoverCloseTimer.current = setTimeout(() => {
            setHoveredUnitId(null);
            setHoverPanelPosition(null);
            hoverCloseTimer.current = null;
        }, 90);
    };

    useEffect(() => {
        const container = battleRef.current;
        if (!container) return;

        const updatePositions = () => {
            const containerBox = container.getBoundingClientRect();
            const newPosMap = new Map<string, { x: number; y: number }>();

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

        if (activeActions.length === 0) {
            setArcSystem(new Map());
            return;
        }

        let frameId = 0;
        const loop = () => {
            updatePositions();
            frameId = requestAnimationFrame(loop);
        };

        updatePositions();
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [heroes, enemies, activeActions.length]);

    useEffect(() => {
        if (winner === 'heros') {
            setTimeout(() => onVictory(heroes), 2000);
        } else if (winner === 'enemies') {
            setTimeout(() => onDefeat(), 2000);
        }
    }, [winner, heroes, onVictory, onDefeat]);

    const getArcColor = (type: string, isHero: boolean) => {
        if (!isHero) return '#ef4444';
        switch (type) {
            case 'heal': return '#10b981';
            case 'magic': return '#d946ef';
            default: return '#f59e0b';
        }
    };

    const getSpecialColor = (icon?: string | null) => {
        switch (icon) {
            case 'heart': return '#10b981';
            case 'zap': return '#38bdf8';
            case 'fire': return '#f97316';
            case 'bow': return '#c084fc';
            case 'fang': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const getPath = (p1: { x: number; y: number }, p2: { x: number; y: number }, geometry: 'melee' | 'range' | 'magic') => {
        const midX = (p1.x + p2.x) / 2;
        const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const curveFactor = geometry === 'magic' ? 0.6 : geometry === 'range' ? 0.2 : 0.05;
        const midY = Math.min(p1.y, p2.y) - (dist * curveFactor);
        return `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;
    };

    const renderCombatantCard = (unit: Combatant, party: Combatant[], isEnemy = false) => {
        const action = actionByActorId.get(unit.id);

        return (
            <CombatantCard
                key={unit.id}
                unit={unit}
                isEnemy={isEnemy}
                party={party}
                className="w-48 h-64 scale-75 origin-center -my-8"
                activeIcon={action?.icon}
                isSpecialAction={Boolean(action?.isSpecial)}
                specialColor={getSpecialColor(action?.icon)}
                showInfoBadge
                onInfoHoverStart={(event) => openUnitNotes(unit.id, event.currentTarget.getBoundingClientRect())}
                onInfoHoverEnd={closeUnitNotesSoon}
            />
        );
    };

    const renderNoteSection = (items: string[]) => {
        return (
            <div className="space-y-1">
                {items.map(item => {
                    const isNegative = item.trim().startsWith('-');
                    return (
                        <div
                            key={item}
                            className={clsx(
                                'rounded-md border px-2 py-1 text-[9px] leading-tight bg-black/20',
                                isNegative ? 'border-rose-500/15 text-rose-100' : 'border-emerald-500/15 text-emerald-100'
                            )}
                        >
                            <span className="font-black uppercase tracking-[0.12em]">{item}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div ref={battleRef} className="w-full h-full flex flex-col bg-zinc-950 p-6 relative overflow-hidden font-sans">
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
                    <marker id="arrow-solid-villain" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M 0 0 L 6 2 L 0 4 Z" fill="#ef4444" />
                    </marker>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {activeActions.map(action => {
                    const p1 = arcSystem.get(action.actorId);
                    if (!p1) return null;
                    const actor = unitById.get(action.actorId);

                    return action.targetIds.map(tid => {
                        const p2 = arcSystem.get(tid);
                        if (!p2) return null;
                        const pathData = getPath(p1, p2, action.geometry);
                        const isHero = actor?.isHero ?? true;
                        const color = getArcColor(action.type, isHero);
                        const markerEnd = isHero
                            ? (action.type === 'heal'
                                ? 'url(#arrow-solid-heal)'
                                : action.type === 'magic'
                                    ? 'url(#arrow-solid-magic)'
                                    : 'url(#arrow-solid-amber)')
                            : 'url(#arrow-solid-villain)';

                        return (
                            <g key={`action-${action.id}-${tid}`} filter="url(#glow)">
                                {action.isSpecial && (
                                    <g>
                                        <circle cx={p1.x} cy={p1.y} r="20" fill="none" stroke="#facc15" strokeWidth="2" strokeOpacity="0.95">
                                            <animate attributeName="r" values="10;28;10" dur="0.8s" repeatCount="indefinite" />
                                            <animate attributeName="stroke-opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
                                        </circle>
                                        <circle cx={p1.x} cy={p1.y} r="34" fill="none" stroke={isHero ? "#d946ef" : "#ef4444"} strokeWidth="1.5" strokeDasharray="4 8" strokeOpacity="0.8">
                                            <animateTransform attributeName="transform" type="rotate" from={`0 ${p1.x} ${p1.y}`} to={`360 ${p1.x} ${p1.y}`} dur="1.2s" repeatCount="indefinite" />
                                        </circle>
                                        {Array.from({ length: 8 }).map((_, i) => {
                                            const angle = (Math.PI * 2 * i) / 8;
                                            const inner = 26;
                                            const outer = 48;
                                            const x1 = p1.x + Math.cos(angle) * inner;
                                            const y1 = p1.y + Math.sin(angle) * inner;
                                            const x2 = p1.x + Math.cos(angle) * outer;
                                            const y2 = p1.y + Math.sin(angle) * outer;
                                            return (
                                                <line
                                                    key={`${action.id}-ray-${i}`}
                                                    x1={x1}
                                                    y1={y1}
                                                    x2={x2}
                                                    y2={y2}
                                                    stroke="#fff"
                                                    strokeWidth="1.5"
                                                    strokeOpacity="0.55"
                                                >
                                                    <animate attributeName="stroke-opacity" values="0.15;0.9;0.15" dur="0.8s" begin={`${i * 0.05}s`} repeatCount="indefinite" />
                                                </line>
                                            );
                                        })}
                                        <text x={p1.x} y={p1.y - 48} textAnchor="middle" className="fill-amber-300 font-black text-[10px] tracking-[0.3em] uppercase">
                                            SPECIAL
                                        </text>
                                    </g>
                                )}
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
                                    strokeWidth={action.isSpecial ? 8 : 6}
                                    strokeOpacity={action.isSpecial ? 1 : 0.8}
                                    strokeLinecap="round"
                                    strokeDasharray={action.isSpecial ? '22 8' : '15 10'}
                                    markerEnd={markerEnd}
                                >
                                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur={action.isSpecial ? '0.55s' : '1s'} repeatCount="indefinite" />
                                </path>
                                <path
                                    d={pathData}
                                    fill="transparent"
                                    stroke="#fff"
                                    strokeWidth={action.isSpecial ? 2.5 : 1.5}
                                    strokeOpacity={action.isSpecial ? 0.95 : 0.6}
                                    strokeLinecap="round"
                                    strokeDasharray={action.isSpecial ? '22 8' : '15 10'}
                                >
                                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur={action.isSpecial ? '0.55s' : '1s'} repeatCount="indefinite" />
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
            </div>

            <div className="flex-1 flex items-center justify-center gap-12 relative z-10 px-4">
                <div className="flex gap-4 items-center">
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">REAR</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center border-r border-zinc-900 pr-4">
                            {enemies.filter(e => e.positionLine === 'REARGUARD').map(enemy => renderCombatantCard(enemy, enemies, true))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-red-900 uppercase tracking-widest">FRONT</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center">
                            {enemies.filter(e => e.positionLine === 'VANGUARD').map(enemy => renderCombatantCard(enemy, enemies, true))}
                        </div>
                    </div>
                </div>

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
                        {countdown !== null && countdown > 0 && (
                            <>
                                <div className="absolute -inset-3 rounded-full border border-amber-400/70 animate-pulse pointer-events-none" />
                                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black leading-none shadow-lg tabular-nums">
                                    {countdown}
                                </span>
                            </>
                        )}
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
                            {heroes.filter(h => h.positionLine === 'VANGUARD').map(hero => renderCombatantCard(hero, heroes))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 items-center">
                        <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">REAR</span>
                        <div className="flex flex-col gap-2 min-w-[120px] min-h-[300px] items-center justify-center border-l border-zinc-900 pl-4">
                            {heroes.filter(h => h.positionLine === 'REARGUARD').map(hero => renderCombatantCard(hero, heroes))}
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

            {hoveredUnit && hoveredUnitNotes && hoverPanelPosition && (
                <div
                    className="fixed z-40 w-[12.5rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-zinc-800/45 bg-black/45 backdrop-blur-sm shadow-xl shadow-black/20 transition-opacity duration-150"
                    style={{
                        top: hoverPanelPosition.top,
                        left: hoverPanelPosition.left,
                    }}
                    onMouseEnter={() => {
                        if (hoverCloseTimer.current) {
                            clearTimeout(hoverCloseTimer.current);
                            hoverCloseTimer.current = null;
                        }
                    }}
                    onMouseLeave={closeUnitNotesSoon}
                >
                    <div className="border-b border-zinc-800/70 px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[7px] font-black uppercase tracking-[0.22em] text-zinc-400">
                            <Info size={9} /> Params
                        </div>
                        <div className="mt-1 text-[12px] font-black uppercase tracking-tight text-zinc-100">
                            {hoveredUnit.name}
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto p-2">
                        {hoveredUnitNotes.stats.length > 0 ? (
                            renderNoteSection(hoveredUnitNotes.stats)
                        ) : (
                            <div className="rounded-md border border-zinc-800 px-2 py-1 text-[9px] leading-tight text-zinc-500 bg-black/20">
                                No battle parameter changes
                            </div>
                        )}
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
