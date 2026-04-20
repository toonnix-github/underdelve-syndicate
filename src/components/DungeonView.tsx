import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TilePos, Interactable, GRID_SIZE } from '../utils/dungeonGenerator';
import { useDungeon } from '../hooks/useDungeon';
import { Combatant } from '../models/Combatant';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass, Crown, Sword, Shield, Zap, Coins, Package, X } from 'lucide-react';
import { Button } from './UI';
import { clsx } from 'clsx';
import { getHeroPortraitUrl } from '../utils/heroPortraits';

interface DungeonViewProps {
    heroes: Combatant[];
    dungeonState: ReturnType<typeof useDungeon>;
    scrip: number;
    vault: string[];
    onEncounter: (pos: TilePos) => void;
    onStairs: (direction: 'UP' | 'DOWN') => void;
    onTrap: (trap: Interactable) => void;
    onReward: (amount: number) => void;
}

const Minimap: React.FC<{ 
    layout: number[][], 
    playerPos: TilePos, 
    explored: Set<string>,
    scouted: Set<string>,
    interactables: Interactable[],
    floor: number
}> = ({ layout, playerPos, explored, scouted, interactables, floor }) => {
    return (
        <div className="absolute top-8 left-8 z-[50] flex flex-col gap-1.5 p-1.5 bg-black/60 backdrop-blur-md border border-white/5 rounded-lg animate-in fade-in slide-in-from-top-4 duration-500 group transition-all hover:bg-black/90 hover:border-cyan-500/30">
            <div className="flex items-center justify-between px-0.5 gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-colors">RDR // LVL-0{floor}</span>
                </div>
            </div>
            
            <div 
                className="grid gap-[1px] bg-zinc-900/80 p-[1px] rounded-sm" 
                style={{ 
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    width: 72,
                    height: 72
                }}
            >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                    const x = i % GRID_SIZE;
                    const y = Math.floor(i / GRID_SIZE);
                    const tile = layout[y][x];
                    const isExplored = explored.has(`${x},${y}`);
                    const isScouted = scouted.has(`${x},${y}`);
                    const isPlayer = playerPos.x === x && playerPos.y === y;
                    
                    // Base condition for empty/unrevealed space
                    if (tile === 0 || (!isExplored && !isPlayer && !isScouted)) {
                        return <div key={i} className="w-full aspect-square bg-black/20" />;
                    }
                    
                    const interactable = interactables.find(i => i.x === x && i.y === y && i.status === 'ACTIVE');

                    return (
                        <div 
                            key={i}
                            className={clsx(
                                "w-full aspect-square rounded-[0.5px] transition-all duration-300 flex items-center justify-center relative",
                                isScouted && !isExplored && "bg-zinc-800/80",
                                isExplored && !isPlayer && "bg-zinc-600/90",
                                isPlayer && "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)] z-10"
                            )}
                        >
                            {!isExplored && isScouted && !isPlayer && (
                                <span className="text-[5px] font-black text-zinc-500 leading-none">?</span>
                            )}
                            {isExplored && interactable && !isPlayer && (
                                <div className={clsx(
                                    "w-1.5 h-1.5 rounded-full",
                                    interactable.type === 'ENEMY' && "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.4)]",
                                    interactable.type === 'CHEST' && "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.4)]",
                                    interactable.type === 'STAIRS' && "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Dungeon Detritus Assets & Logic ---
const DETRITUS_SHEETS = [
    { url: '/assets/detritus_sheet_1.png', rows: 3, cols: 3, count: 9 },
    { url: '/assets/detritus_sheet_2.png', rows: 4, cols: 4, count: 16 },
    { url: '/assets/detritus_sheet_3.png', rows: 4, cols: 4, count: 16 },
    { url: '/assets/detritus_sheet_4.png', rows: 4, cols: 4, count: 16 }
];

const getDeterministicDetritus = (x: number, y: number, floor: number) => {
    // Basic LCG / Hash for consistent randomness
    const seed = (x * 1337 + y * 73 + floor * 31);
    const seededRandom = (s: number) => {
        const value = Math.sin(s) * 10000;
        return value - Math.floor(value);
    };

    // Calculate count: 1 to 4 items per explored tile for more density
    const count = 1 + Math.floor(seededRandom(seed) * 2); 
    const items = [];
    
    for (let i = 0; i < count; i++) {
        const itemSeed = seed + (i + 1) * 777;
        const sheetIdx = Math.floor(seededRandom(itemSeed) * DETRITUS_SHEETS.length);
        const sheet = DETRITUS_SHEETS[sheetIdx];
        const spriteIdx = Math.floor(seededRandom(itemSeed + 1) * sheet.count);
        
        // Calculate background position based on sheet grid
        const colIdx = spriteIdx % sheet.cols;
        const rowIdx = Math.floor(spriteIdx / sheet.cols);
        const bgPosX = sheet.cols > 1 ? (colIdx / (sheet.cols - 1)) * 100 : 0;
        const bgPosY = sheet.rows > 1 ? (rowIdx / (sheet.rows - 1)) * 100 : 0;

        // Visual Polish: Bias away from the exact center (40-60% range)
        let offsetX = (seededRandom(itemSeed + 2) * 90) + 5;
        let offsetY = (seededRandom(itemSeed + 3) * 90) + 5;
        
        // Push items out of the center if they land in the "dead zone"
        if (offsetX > 15 && offsetX < 85) offsetX += (offsetX > 50 ? 35 : -35);
        if (offsetY > 15 && offsetY < 85) offsetY += (offsetY > 50 ? 35 : -35);

        items.push({
            id: i,
            url: sheet.url,
            bgPos: `${bgPosX}% ${bgPosY}%`,
            bgSize: `${sheet.cols * 100}%`,
            offsetX,
            offsetY,
            rotate: seededRandom(itemSeed + 4) * 360,
            scale: 0.1 + seededRandom(itemSeed + 5) * 0.15 // 0.1 to 0.25 scale (Micro-leftovers)
        });
    }
    return items;
};

const DetritusLayer: React.FC<{ x: number; y: number; floor: number }> = ({ x, y, floor }) => {
    const items = React.useMemo(() => getDeterministicDetritus(x, y, floor), [x, y, floor]);
    
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-35">
            {items.map(item => (
                <div 
                    key={item.id}
                    className="absolute w-16 h-16 bg-no-repeat transition-all duration-1000 pointer-events-none"
                    style={{
                        backgroundImage: `url(${item.url})`,
                        backgroundPosition: item.bgPos,
                        backgroundSize: item.bgSize,
                        left: `${item.offsetX}%`,
                        top: `${item.offsetY}%`,
                        transform: `translate(-50%, -50%) rotate(${item.rotate}deg) scale(${item.scale})`,
                        
                        // Absolute Occlusion: Use high-contrast luminance mask to force opacity
                        WebkitMaskImage: `url(${item.url})`,
                        maskImage: `url(${item.url})`,
                        WebkitMaskPosition: item.bgPos,
                        maskPosition: item.bgPos,
                        WebkitMaskSize: item.bgSize,
                        maskSize: item.bgSize,
                        maskMode: 'luminance' as any,
                        WebkitMaskMode: 'luminance' as any,
                        
                        // Physical Density: Cranked contrast prevents floor patterns from showing through
                        filter: 'contrast(2.5) brightness(1.4) drop-shadow(0 4px 6px rgba(0,0,0,0.8))',
                        opacity: 1,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};
// --- End Detritus Logic ---

export const DungeonView: React.FC<DungeonViewProps> = ({ heroes, dungeonState, scrip, vault, onEncounter, onStairs, onTrap, onReward }) => {
    const { floor, playerPos, exploredCells, dungeonData, movePlayer, getScoutedCells } = dungeonState;
    const scoutedCells = getScoutedCells();
    const mapFrameRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [showVault, setShowVault] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [activeEvent, setActiveEvent] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [triggeredEvents, setTriggeredEvents] = useState<Set<string>>(new Set());
    const [activeTrap, setActiveTrap] = useState<Interactable | null>(null);
    const eventTimeoutRef = useRef<any>(null);

    const TILE_SIZE = 160;

    const pushEvent = (msg: string) => {
        setLog(prev => [msg, ...prev].slice(0, 10));
        setActiveEvent(msg);
        if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
        eventTimeoutRef.current = setTimeout(() => setActiveEvent(null), 3000);
    };

    const handleMove = useCallback((dx: number, dy: number) => {
        // Tactical Lock: No movement during major events, encounters, or active trap resolution
        if (activeEvent === "ROLL FOR INITIATIVE!" || activeEvent === "A DEADLY SNARE!" || activeTrap) return;
        
        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
        if (dungeonData.layout[newY][newX] === 0) return;

        setIsMoving(true);
        setTimeout(() => setIsMoving(false), 250);
        movePlayer(dx, dy);

        // Tactical Trigger Resolution
        const interactable = dungeonData.interactables.find(i => i.x === newX && i.y === newY);
        // Only trigger if active or failed (still operative)
        if (interactable && (interactable.status === 'ACTIVE' || interactable.status === 'FAILED')) {
            if (interactable.type === 'ENEMY') {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 440);
                pushEvent("ROLL FOR INITIATIVE!");
                setTriggeredEvents(prev => new Set(prev).add(interactable.id));
                setTimeout(() => onEncounter({ x: newX, y: newY }), 1500);
            } else if (interactable.type === 'TRAP') {
                if (interactable.status === 'ACTIVE' || interactable.status === 'FAILED') {
                    setIsShaking(true);
                    setTimeout(() => setIsShaking(false), 440);
                    pushEvent("A DEADLY SNARE!");
                    setActiveTrap(interactable);
                }
            } else if (interactable.type === 'CHEST') {
                pushEvent("TREASURE FOUND!");
                setTriggeredEvents(prev => new Set(prev).add(interactable.id));
            } else if (interactable.type === 'STAIRS') {
                pushEvent("THE WAY DEEPER IS REVEALED!");
                setTriggeredEvents(prev => new Set(prev).add(interactable.id));
            }
        }
    }, [playerPos, dungeonData, movePlayer, onEncounter, onStairs, onTrap, triggeredEvents]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w') handleMove(0, -1);
            if (e.key === 'ArrowDown' || e.key === 's') handleMove(0, 1);
            if (e.key === 'ArrowLeft' || e.key === 'a') handleMove(-1, 0);
            if (e.key === 'ArrowRight' || e.key === 'd') handleMove(1, 0);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMove]);

    // Center view on player using grid-relative pivot logic
    const centerOnPlayer = useCallback(() => {
        // Grid center is half of the total pixel-size
        const gridCenter = (GRID_SIZE * TILE_SIZE) / 2;
        
        // Player center is their tile coordinate + half tile
        const playerCenterX = (playerPos.x * TILE_SIZE) + (TILE_SIZE / 2);
        const playerCenterY = (playerPos.y * TILE_SIZE) + (TILE_SIZE / 2);
        
        // Offset is the difference to drag the player focal point to the grid's pivot
        setOffset({
            x: gridCenter - playerCenterX,
            y: gridCenter - playerCenterY
        });
    }, [playerPos, TILE_SIZE]);

    useEffect(() => {
        centerOnPlayer();
    }, [centerOnPlayer]);

    const activeInteractable = dungeonData.interactables.find(i => i.x === playerPos.x && i.y === playerPos.y);

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-zinc-900">
            <Minimap 
                layout={dungeonData.layout} 
                playerPos={playerPos} 
                explored={exploredCells}
                scouted={scoutedCells}
                interactables={dungeonData.interactables}
                floor={floor}
            />
            {/* Exploration Status Bar */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 bg-black/60 backdrop-blur-md border border-zinc-800/50 px-6 py-3 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                        <Compass className="text-zinc-400 group-hover:text-cyan-400 transition-colors" size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Delve Depth</div>
                        <div className="text-sm font-black text-zinc-100 tracking-tighter">FLOOR {floor}</div>
                    </div>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div className="text-center">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Syndicate Action</div>
                    <div className="text-sm font-black text-cyan-500 tracking-tighter uppercase italic">Ready</div>
                </div>
            </div>

            {/* Manual Interaction Notice */}
            {activeInteractable && (activeInteractable.type === 'STAIRS' || activeInteractable.type === 'PREV_FLOOR') && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <button 
                        onClick={() => {
                            if (activeInteractable.type === 'STAIRS') onStairs('DOWN');
                            if (activeInteractable.type === 'PREV_FLOOR') onStairs('UP');
                        }}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-8 py-4 rounded-xl shadow-[0_0_40px_rgba(8,145,178,0.4)] border-2 border-cyan-400/50 transition-all flex items-center gap-3 uppercase tracking-tighter"
                    >
                        {activeInteractable.type === 'STAIRS' ? 'DESCEND TO NEXT FLOOR' : 'ASCEND TO PREVIOUS FLOOR'}
                    </button>
                </div>
            )}

            {/* Main Dungeon Grid */}
            <div ref={mapFrameRef} className="flex-1 relative overflow-hidden flex items-center justify-center">
                {activeTrap && (
                    <TrapResolutionOverlay 
                        trap={activeTrap}
                        heroes={heroes}
                        onResolve={(newStatus, avoided) => {
                            dungeonState.updateInteractable(activeTrap.id, { status: newStatus });
                            setActiveTrap(null);
                            if (newStatus === 'DISARMED') pushEvent("TRAP DISARMED!");
                            else pushEvent("TRAP STILL ACTIVE!");
                        }}
                        onDamage={(penalty) => onTrap({ ...activeTrap, resolution: { ...activeTrap.resolution!, avoided: false, disarmed: false, scripReward: 0 } })}
                        onReward={(amount) => {
                            onReward(amount);
                            pushEvent(`TREASURE GAINED! +${amount} SCRIP`);
                        }}
                    />
                )}
                <div 
                    className={clsx(
                        "relative flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                        isShaking && "animate-shake"
                    )}
                    style={{
                        width: `${GRID_SIZE * TILE_SIZE}px`,
                        height: `${GRID_SIZE * TILE_SIZE}px`,
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
                        gridTemplateRows: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
                    }}
                >
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const cellKey = `${x},${y}`;
                        const isWall = dungeonData.layout[y][x] === 0;
                        const isExplored = exploredCells.has(cellKey);
                        const isScouted = scoutedCells.has(cellKey);
                        const isNewlyExplored = isExplored && x === playerPos.x && y === playerPos.y;
                        const isPlayer = playerPos.x === x && playerPos.y === y;
                        const interactable = dungeonData.interactables.find(int => int.x === x && int.y === y);

                        // Thematic Filter: Skip tile_2 (purple breaking) as it conflicts with the gritty dungeon aesthetic
                        let bgIndex = (dungeonData.bgs[cellKey] % 9) + 1;
                        if (bgIndex === 2) bgIndex = 1; 

                        if (isWall) return <div key={i} className="w-full h-full" />;

                        return (
                            <div 
                                key={i}
                                className={clsx(
                                    "relative w-full aspect-square transition-all duration-700 overflow-hidden bg-zinc-950 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]",
                                    (isExplored || isScouted) ? "scale-100 opacity-100" : "opacity-0 scale-90",
                                    isNewlyExplored && "animate-glitch-in",
                                    isPlayer && "z-10"
                                )}
                            >
                                {/* Room Art (Conditional) */}
                                <div className={clsx(
                                    "absolute inset-0 transition-opacity duration-1000",
                                    isExplored ? "opacity-90" : "opacity-0"
                                )}>
                                    <img 
                                        src={
                                            interactable?.type === 'STAIRS' ? 'assets/tiles/tile_stairs_down.png' :
                                            interactable?.type === 'PREV_FLOOR' ? 'assets/tiles/tile_stairs_up.png' :
                                            `assets/tiles/tile_${bgIndex}.${bgIndex <= 4 ? 'png' : 'jpg'}`
                                        } 
                                        className="w-full h-full object-cover scale-110"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-black/20" />
                                </div>

                                {/* Detritus Layer (Environmental Clutter) */}
                                {isExplored && !isWall && interactable?.type !== 'STAIRS' && interactable?.type !== 'PREV_FLOOR' && (
                                    <DetritusLayer x={x} y={y} floor={floor} />
                                )}

                                {/* Unrevealed / Fog of War Art */}
                                <div className={clsx(
                                    "absolute inset-0 transition-opacity duration-700",
                                    (isScouted && !isExplored) ? "opacity-100" : "opacity-0"
                                )}>
                                    <img 
                                        src="assets/tiles/unrevealed.jpg" 
                                        className="w-full h-full object-cover scale-110 rotate-90"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="text-zinc-600/50">
                                            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* ARCHITECTURAL BORDER SYSTEM (CORNER-CAGE) */}
                                <div className={clsx(
                                    "absolute inset-0 pointer-events-none z-20 transition-opacity duration-700",
                                    isExplored ? "opacity-100" : "opacity-30"
                                )}>
                                    {/* PERSISTENT L-CORNERS */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-zinc-700/80 rounded-tl-sm" />
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-zinc-700/80 rounded-tr-sm" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-zinc-700/80 rounded-bl-sm" />
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-zinc-700/80 rounded-br-sm" />

                                    {/* DYNAMIC EDGE SEGMENTS (WALLS) */}
                                    {/* TOP EDGE */}
                                    {(!(isExplored && y > 0 && dungeonData.layout[y-1][x] === 1)) ? (
                                        <div className="absolute top-0 left-4 right-4 h-[2px] bg-zinc-700/80" />
                                    ) : (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gradient-to-b from-amber-500/20 to-transparent blur-sm" />
                                    )}

                                    {/* BOTTOM EDGE */}
                                    {(!(isExplored && y < GRID_SIZE - 1 && dungeonData.layout[y+1][x] === 1)) ? (
                                        <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-zinc-700/80" />
                                    ) : (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gradient-to-t from-amber-500/20 to-transparent blur-sm" />
                                    )}

                                    {/* LEFT EDGE */}
                                    {(!(isExplored && x > 0 && dungeonData.layout[y][x-1] === 1)) ? (
                                        <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-zinc-700/80" />
                                    ) : (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-4 bg-gradient-to-r from-amber-500/10 to-transparent blur-sm opacity-50" />
                                    )}

                                    {/* RIGHT EDGE */}
                                    {(!(isExplored && x < GRID_SIZE - 1 && dungeonData.layout[y][x+1] === 1)) ? (
                                        <div className="absolute right-0 top-4 bottom-4 w-[2px] bg-zinc-700/80" />
                                    ) : (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-4 bg-gradient-to-l from-amber-500/10 to-transparent blur-sm opacity-50" />
                                    )}
                                </div>

                                {/* Tile Texture Overlay */}
                                <div className={clsx(
                                    "absolute inset-0 opacity-10 mix-blend-overlay",
                                    isExplored ? "bg-zinc-800" : "bg-black"
                                )} />

                                {/* Player Overlay */}
                                {isPlayer && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="w-10 h-10 bg-white/20 rounded-full animate-ping opacity-30" />
                                        <div className={clsx(
                                            "absolute w-7 h-7 bg-white rounded-md rotate-45 border-4 border-zinc-950 shadow-[0_0_20px_white]",
                                            isMoving && "animate-step-bob"
                                        )} />
                                    </div>
                                )}

                                {/* Interactable Overlays */}
                                {isExplored && interactable && (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                                        {interactable.type === 'STAIRS' && <div className="text-emerald-500 font-black text-xs uppercase bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">Stairs</div>}
                                        {interactable.type === 'CHEST' && <div className="text-amber-500 font-black text-xs uppercase bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">Loot</div>}
                                        {interactable.type === 'TRAP' && interactable.status !== 'DISARMED' && (
                                            <div className="text-red-500 font-black text-xs uppercase bg-red-950/50 px-3 py-1 rounded-full border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">Trap</div>
                                        )}
                                        {interactable.type === 'TRAP' && interactable.status === 'DISARMED' && (
                                            <div className="text-zinc-600 font-bold text-[8px] uppercase tracking-tighter italic">Neutralized</div>
                                        )}
                                        {interactable.type === 'ENEMY' && (
                                            <div className="flex flex-col items-center gap-1 animate-pulse">
                                                <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/50 flex items-center justify-center">
                                                    <Zap size={16} className="text-red-500" />
                                                </div>
                                                <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Hostile</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Wall Shadows / Perspectives */}
                                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/60 to-transparent" />
                                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/60 to-transparent" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* D-Pad Controls for Mobile/Accessibility */}
            <div className="absolute bottom-12 left-12 z-50 grid grid-cols-3 gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div />
                <button onClick={() => handleMove(0, -1)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronUp size={24} /></button>
                <div />
                <button onClick={() => handleMove(-1, 0)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronLeft size={24} /></button>
                <button onClick={() => handleMove(0, 1)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronDown size={24} /></button>
                <button onClick={() => handleMove(1, 0)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronRight size={24} /></button>
            </div>

            {/* ARCADE-STYLE EVENT OVERLAY */}
            {activeEvent && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[200] pointer-events-none flex flex-col items-center">
                    {/* Background Flash */}
                    <div className="absolute inset-0 bg-cyan-500/10 animate-pulse mix-blend-overlay" />
                    
                    {/* Main Banner */}
                    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
                        {/* Kinetic Lines */}
                        <div className="absolute inset-0 flex justify-center opacity-20">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-[1px] h-full bg-cyan-400 mx-10 animate-out fade-out slide-out-to-right-full duration-1000 ease-in infinite" style={{ animationDelay: `${i * 100}ms` }} />
                            ))}
                        </div>
                        
                        {/* Horizontal Bars */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-in slide-in-from-left duration-300" />
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-in slide-in-from-right duration-300" />
                        
                        {/* Dark Backdrop */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md skew-y-[-1deg] border-y-2 border-cyan-500/30" />
                        
                        {/* Text Layer */}
                        <div className="relative flex flex-col items-center animate-in zoom-in-150 duration-300 ease-out">
                            <span className="text-[10px] font-black tracking-[1em] text-cyan-500/80 mb-1 animate-pulse">
                                {activeEvent === 'ROLL FOR INITIATIVE!' ? 'THE SHADOWS STIR' : 'FATE INTERVENES'}
                            </span>
                            <h1 className="text-6xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] flex items-center gap-6 scale-y-110">
                                <ChevronRight className="text-cyan-500" size={48} strokeWidth={4} />
                                {activeEvent}
                                <ChevronLeft className="text-cyan-500" size={48} strokeWidth={4} />
                            </h1>
                            <div className="mt-2 flex gap-4 text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                                <span>Underdelve Chronicles</span>
                                <span>•</span>
                                <span>Dungeon Master v1.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SYNDICATE CONSOLE (MINIMALIST RIGHT SIDEBAR) */}
            <div className="absolute right-0 top-0 bottom-0 w-56 bg-gradient-to-l from-black/80 via-black/40 to-transparent backdrop-blur-md border-l border-zinc-800/30 p-4 flex flex-col gap-6 z-40">
                <div className="flex flex-col gap-1 px-1">
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Syndicate</h2>
                    <div className="h-0.5 w-8 bg-cyan-600/50" />
                </div>

                <div className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-1">
                    {/* VANGUARD SECTION */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                            <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Vanguard</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            {heroes.filter(h => h.positionLine === 'VANGUARD').map(hero => (
                                <HeroStatusCard key={hero.name} hero={hero} />
                            ))}
                        </div>
                    </div>

                    {/* REARGUARD SECTION */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                            <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Rearguard</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            {heroes.filter(h => h.positionLine === 'REARGUARD').map(hero => (
                                <HeroStatusCard key={hero.name} hero={hero} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-zinc-800/20">
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <Coins className="text-amber-600" size={12} />
                                <p className="text-[10px] font-black text-amber-500 tabular-nums">{scrip.toLocaleString()}</p>
                            </div>
                            <button 
                                onClick={() => setShowVault(true)}
                                className="text-[9px] font-bold text-zinc-600 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                                <Package size={10} /> Vault ({vault.length})
                            </button>
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-800 px-1">
                            <span>Sector V.1</span>
                            <span className="text-cyan-900/40 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-cyan-900/60" /> Live
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vault Modal */}
            {showVault && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowVault(false)} />
                    <div className="relative w-full max-w-4xl bg-zinc-900 border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950/50">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3">
                                    <Package className="text-cyan-500" /> Syndicate <span className="text-cyan-500">Vault</span>
                                </h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Recovered assets & logistical inventory</p>
                            </div>
                            <button onClick={() => setShowVault(false)} className="w-12 h-12 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors">
                                <X className="text-zinc-400" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 bg-[url('assets/tiles/unrevealed.jpg')] bg-fixed bg-center opacity-30 mix-blend-overlay pointer-events-none absolute inset-0 z-[-1]" />
                        
                        <div className="flex-1 overflow-y-auto p-12 grid grid-cols-4 gap-6 relative z-10">
                            {vault.length === 0 ? (
                                <div className="col-span-4 h-64 flex flex-col items-center justify-center space-y-4 opacity-50">
                                    <Package size={64} className="text-zinc-800" />
                                    <p className="text-zinc-600 font-black uppercase tracking-tighter italic text-xl">The Vault is currently empty</p>
                                </div>
                            ) : (
                                vault.map((item, i) => (
                                    <div key={i} className="aspect-square bg-zinc-950/60 border border-zinc-800 rounded-2xl flex items-center justify-center hover:border-zinc-500 transition-all hover:scale-105 group relative cursor-pointer">
                                        <div className="text-[40px] grayscale group-hover:grayscale-0 transition-all">📦</div>
                                        <div className="absolute bottom-2 inset-x-2 text-center text-[8px] font-black uppercase text-zinc-500">{item}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 border-t border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <Coins className="text-amber-500" size={24} />
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Credit</p>
                                    <p className="text-2xl font-black text-amber-500 tabular-nums">{scrip.toLocaleString()}</p>
                                </div>
                            </div>
                            <Button onClick={() => setShowVault(false)} variant="primary" className="px-12">DISMISS</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const HeroStatusCard: React.FC<{ hero: Combatant }> = ({ hero }) => {
    const [isHit, setIsHit] = useState(false);
    const prevHp = useRef(hero.hp);
    const hpPercent = (hero.hp / hero.maxHp) * 100;

    useEffect(() => {
        if (hero.hp < prevHp.current) {
            setIsHit(true);
            const timer = setTimeout(() => setIsHit(false), 500);
            return () => clearTimeout(timer);
        }
        prevHp.current = hero.hp;
    }, [hero.hp]);
    
    return (
        <div className={clsx(
            "group relative w-full h-16 rounded-xl border overflow-hidden bg-zinc-950/20 transition-all duration-300 hover:bg-zinc-900/40 hover:border-zinc-700/50",
            isHit ? "border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-hit-shake" : "border-zinc-800/50"
        )}>
            {/* INTENSIFIED HIT FLASH OVERLAY */}
            {isHit && <div className="absolute inset-0 z-50 animate-card-hit-flash pointer-events-none" />}
            {/* Minimal Portrait (Full Color) */}
            <div className="absolute inset-0 z-0 opacity-60 group-hover:opacity-100 transition-all duration-500">
                <img 
                    src={getHeroPortraitUrl(hero.imageId)} 
                    className="w-full h-full object-cover object-[center_10%]" 
                    alt={hero.name}
                />
            </div>
            
            {/* Compact Gradient Overlay */}
            <div className="absolute inset-0 z-10 p-2 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent flex flex-col justify-center">
                <div className="flex justify-between items-center mb-0.5">
                    <div className="flex items-center gap-2">
                        <p className="text-[11px] font-black uppercase tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{hero.name}</p>
                        {hero.isLeader && (
                            <Crown className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" size={9} fill="currentColor" />
                        )}
                    </div>
                    
                    {/* Tiny Role Icon */}
                    <div className="w-3.5 h-3.5 opacity-80">
                        <img 
                            src={`/assets/icon_${hero.role.toLowerCase()}.png`} 
                            className="w-full h-full object-contain brightness-125" 
                            alt={hero.role}
                        />
                    </div>
                </div>

                {/* Micro HP Bar (Standardized Red) */}
                <div className="space-y-1">
                    <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div 
                            className={clsx(
                                "h-full transition-all duration-1000 bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]",
                                hpPercent < 25 && "animate-pulse brightness-125"
                            )}
                            style={{ width: `${hpPercent}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-between items-center text-[7px] font-bold tracking-tight">
                        <div className="flex gap-1.5 tabular-nums text-zinc-400">
                            <span className="flex items-center gap-0.5"><Sword size={6} className="text-amber-500" /> {hero.getATK()}</span>
                            <span className="flex items-center gap-0.5"><Shield size={6} className="text-blue-500" /> {hero.getDEF()}</span>
                            <span className="flex items-center gap-0.5"><Zap size={6} className="text-cyan-500" /> {hero.getSPD()}</span>
                        </div>
                        <span className="text-white font-black drop-shadow-md">{Math.floor(hero.hp)}<span className="opacity-40 ml-0.5">/ {hero.maxHp}</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TrapResolutionProps {
    trap: Interactable;
    heroes: Combatant[];
    onResolve: (status: 'DISARMED' | 'FAILED', avoided: boolean) => void;
    onDamage: (penalty: number) => void;
    onReward: (amount: number) => void;
}

const TrapResolutionOverlay: React.FC<TrapResolutionProps> = ({ trap, heroes, onResolve, onDamage, onReward }) => {
    const [phase, setPhase] = useState<'IDLE' | 'AVOIDANCE' | 'AVOID_RESULT' | 'CHOICE' | 'DISARM' | 'DISARM_RESULT'>('AVOIDANCE');
    const [isRolling, setIsRolling] = useState(false);
    const [rollValue, setRollValue] = useState<number | null>(null);
    const [visualRoll, setVisualRoll] = useState(1);
    const [resultMsg, setResultMsg] = useState('');
    const [avoided, setAvoided] = useState(false);

    // Dynamic Metadata based on Trap Type
    const trapConfig = {
        BLADES: { title: "PENDULUM BLADES", stat: "SPD", color: "text-rose-500", icon: <Zap size={14} /> },
        SPIKES: { title: "RISING SPIKES", stat: "POW", color: "text-amber-500", icon: <Sword size={14} /> },
        ACID: { title: "CORROSIVE ACID", stat: "DEF", color: "text-emerald-500", icon: <Shield size={14} /> }
    };
    const config = trapConfig[trap.trapType || 'BLADES'];

    // Calculate Average Stat and Scaled Bonus (+1 per 5 points)
    const getStat = (h: Combatant) => {
        if (trap.trapType === 'ACID') return h.getDEF(heroes);
        if (trap.trapType === 'BLADES') return h.getSPD(heroes);
        return h.getATK(heroes);
    };

    const avgStat = Math.floor(heroes.reduce((sum, h) => sum + getStat(h), 0) / heroes.length);
    const scaledBonus = Math.floor(avgStat / 5);

    const targetDC = (phase === 'AVOIDANCE' || phase === 'AVOID_RESULT') ? (trap.resolution?.avoidanceDC || 14) : (trap.resolution?.disarmDC || 16);
    const currentModifier = scaledBonus;

    // Dynamic Background Selection based on Trap Type
    const getTrapBg = (type?: string) => {
        if (type === 'BLADES' || type === 'SPIKES') return '/assets/trap_bg_kinetic.png';
        if (type === 'ACID') return '/assets/trap_bg_chemical.png';
        return '/assets/trap_bg_kinetic.png'; // Default to kinetic
    };

    const activeBg = getTrapBg(trap.trapType);

    // Auto-Resolve Final Phase
    useEffect(() => {
        if (phase === 'DISARM_RESULT') {
            const timer = setTimeout(() => {
                onResolve(resultMsg === 'DISARMED!' ? 'DISARMED' : 'FAILED', avoided);
            }, 1800); 
            return () => clearTimeout(timer);
        }
    }, [phase, resultMsg, avoided, onResolve]);

    // Emergency Exit / Auto-Success Transition
    useEffect(() => {
        if (phase === 'AVOID_RESULT') {
            if (!avoided) {
                const timer = setTimeout(() => onResolve('FAILED', false), 2500);
                return () => clearTimeout(timer);
            } else {
                // Auto-transition to CHOICE if success
                const timer = setTimeout(() => {
                    setPhase('CHOICE');
                    // Reset roll info so it doesn't linger into Disarm phase
                    setRollValue(null);
                    setResultMsg('');
                }, 1200);
                return () => clearTimeout(timer);
            }
        }
    }, [phase, avoided, onResolve]);

    const handleRoll = (targetPhase?: string) => {
        if (targetPhase) setPhase(targetPhase as any);
        setIsRolling(true);
        setRollValue(null);
        setResultMsg('');

        // DICE ANIMATION ENGINE
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            setVisualRoll(Math.floor(Math.random() * 20) + 1);
            rollCount++;
            if (rollCount > 15) {
                clearInterval(rollInterval);
                const roll = Math.floor(Math.random() * 20) + 1;
                setRollValue(roll);
                setVisualRoll(roll);
                setIsRolling(false);

                const finalValue = roll + currentModifier;
                const isSuccess = finalValue >= Math.ceil(targetDC);
                const activePhase = targetPhase || phase;

                if (activePhase === 'AVOIDANCE') {
                    if (isSuccess) {
                        setResultMsg("AVOIDED!");
                        setAvoided(true);
                        setPhase('AVOID_RESULT');
                    } else {
                        setResultMsg("HIT!");
                        onDamage(20);
                        setAvoided(false);
                        setPhase('AVOID_RESULT');
                    }
                } else if (activePhase === 'DISARM') {
                    if (isSuccess) {
                        setResultMsg("DISARMED!");
                        onReward(trap.resolution?.scripReward || 75);
                        setPhase('DISARM_RESULT');
                    } else {
                        setResultMsg("FAILED!");
                        onDamage(10);
                        setPhase('DISARM_RESULT');
                    }
                }
            }
        }, 80);
    };

    return (
        <div className="absolute inset-x-0 inset-y-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[4px] animate-in fade-in duration-500 p-8">
            <div className="w-full max-w-lg h-[440px] bg-zinc-950/50 border-2 border-zinc-600/80 rounded-[1.5rem] shadow-[0_0_120px_rgba(0,0,0,1)] flex flex-col font-sans relative ring-1 ring-white/10 overflow-hidden">
                {/* Background Image Overlay - Dynamic Hazard Art */}
                <div className="absolute inset-0 z-0 opacity-100 pointer-events-none overflow-hidden">
                    <img src={activeBg} className="w-full h-full object-cover scale-105" alt="" />
                    <div className="absolute inset-0 bg-black/60 animate-crt-flicker" />
                    <div className="absolute inset-x-0 h-1/2 animate-scanline pointer-events-none opacity-40" />
                </div>

                <div className="relative z-10 flex flex-col h-full overflow-hidden">
                    {/* Header Section - Compact */}
                    <div className="p-3 border-b border-zinc-900/50 flex flex-col items-center justify-center bg-black/60">
                        <h1 className={clsx("text-2xl font-black italic tracking-tighter uppercase", config.color)}>
                            {config.title}
                        </h1>
                    </div>

                    {/* DC & Bonus Box - Compact with Precision Rounding */}
                    <div className="px-6 py-3 flex justify-center">
                        <div className="grid grid-cols-2 gap-px bg-zinc-700/50 border border-zinc-700/50 rounded-xl overflow-hidden w-full max-w-xs shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <div className="bg-zinc-950/80 backdrop-blur-sm px-4 py-2 flex flex-col items-center">
                                <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">DODGE DC</div>
                                <div className="text-2xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">#{Math.ceil(targetDC)}</div>
                            </div>
                            <div className="bg-zinc-950/80 backdrop-blur-sm px-4 py-2 flex flex-col items-center">
                                <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">PARTY BONUS</div>
                                <div className="text-2xl font-black text-amber-500 italic tracking-tighter leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">+{scaledBonus}</div>
                            </div>
                        </div>
                    </div>

                    {/* STAKES - Ultra Minimal */}
                    <div className="px-10 mb-2 flex justify-center gap-8">
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">RISK:</span>
                            <span className="text-[10px] font-bold text-zinc-300">{phase.includes('AVOID') ? '20 HP' : '10 HP'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">BOUNTY:</span>
                            <span className="text-[10px] font-bold text-zinc-300">{phase.includes('AVOID') ? 'PASS' : `${trap.resolution?.scripReward || 75}S`}</span>
                        </div>
                    </div>

                    {/* Interaction Zone - Compressed mb */}
                    <div className="flex flex-col items-center px-10 space-y-3 mb-4">
                        <p className="text-[10px] font-bold text-zinc-500 text-center leading-relaxed h-8">
                            {phase.includes('AVOID')
                                ? "Hazard area triggered. Synchronize equipment for avoidance."
                                : phase === 'CHOICE' 
                                ? "Primary impact avoided. Evaluate risk for disarm bounty."
                                : "Focusing on core circuitry. Accuracy required for extraction."}
                        </p>

                        <div className="relative flex flex-col items-center gap-2">
                            {/* d20 Die Area - Reduced Scale */}
                            <div className="relative">
                                <div className={clsx(
                                    "w-24 h-24 relative flex items-center justify-center transition-all duration-300",
                                    isRolling && "animate-bounce",
                                    rollValue !== null && (rollValue + scaledBonus >= targetDC ? "drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]")
                                )}>
                                    <div className={clsx(
                                        "absolute inset-0 border-[2px] transition-colors duration-500",
                                        isRolling ? "border-white animate-dice-glow" : (rollValue === null ? "border-zinc-800" : (rollValue + scaledBonus >= targetDC ? "border-emerald-500" : "border-rose-500"))
                                    )} style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
                                    
                                    <div className="flex flex-col items-center">
                                        <span className={clsx(
                                            "text-4xl font-black italic transition-all duration-200",
                                            isRolling ? "opacity-100 text-white scale-125" : "opacity-100",
                                            rollValue !== null && (rollValue + scaledBonus >= targetDC ? "text-emerald-400" : "text-rose-400")
                                        )}>
                                            {isRolling ? visualRoll : rollValue || 'D20'}
                                        </span>
                                        {rollValue !== null && (
                                            <div className="text-[8px] font-black text-zinc-500 mt-0.5 uppercase tracking-tighter">
                                                 +{scaledBonus} bonus
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Floating Result Message Overlay */}
                                {rollValue !== null && !isRolling && (
                                    <>
                                        {/* Juicy Success Burst */}
                                        {rollValue + scaledBonus >= targetDC && (
                                            <div className="absolute top-1/2 left-1/2 rounded-full w-20 h-20 animate-success-burst pointer-events-none z-0" />
                                        )}
                                        
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-max animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 z-50">
                                            <div className={clsx(
                                                "px-4 py-1.5 rounded-full border-2 font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2",
                                                rollValue + scaledBonus >= targetDC ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white"
                                            )}>
                                                {rollValue + scaledBonus >= Math.ceil(targetDC) ? "SUCCESS" : "FAILURE"}
                                                {rollValue + scaledBonus >= Math.ceil(targetDC) && phase === 'DISARM_RESULT' && (
                                                    <span className="animate-scrip-float absolute -top-12 left-1/2 -translate-x-1/2 font-black text-amber-400 text-lg">+{trap.resolution?.scripReward || 75}S</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Interaction Area - Compressed button py with Glow */}
                            <div className="w-64">
                                {(phase === 'AVOIDANCE' || phase === 'DISARM') && (
                                    <button 
                                        disabled={isRolling}
                                        onClick={() => handleRoll()}
                                        className={clsx(
                                            "w-full py-3.5 text-xl font-black uppercase tracking-tighter transition-all duration-300 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] border-b-6 group relative overflow-hidden",
                                            isRolling ? "bg-zinc-800 text-zinc-600 border-zinc-900 cursor-wait" : "bg-white text-black hover:bg-zinc-100 border-zinc-400"
                                        )}
                                    >
                                        <span className="relative z-10">{isRolling ? "ROLLING..." : (phase === 'AVOIDANCE' ? "EXECUTE EVASION" : "EXECUTE DISARM")}</span>
                                        {!isRolling && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] pointer-events-none" />}
                                    </button>
                                )}

                                {phase === 'CHOICE' && (
                                    <div className="grid grid-cols-2 gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <button 
                                            onClick={() => handleRoll('DISARM')}
                                            className="py-4 bg-emerald-500 text-white text-lg font-black uppercase tracking-tighter hover:bg-emerald-600 transition-all border-b-4 border-emerald-800 active:scale-95 shadow-lg"
                                        >
                                            DISARM
                                        </button>
                                        <button 
                                            onClick={() => onResolve('FAILED', true)}
                                            className="py-4 bg-zinc-800 text-white text-lg font-black uppercase tracking-tighter hover:bg-zinc-700 transition-all border-b-4 border-zinc-900 active:scale-95"
                                        >
                                            WITHDRAW
                                        </button>
                                    </div>
                                )}

                                {phase === 'AVOID_RESULT' && !avoided && (
                                    <div className="text-center font-black animate-pulse uppercase tracking-[0.2em] text-rose-500 text-[9px] py-2">
                                        SYSTEM BREACH : EMERGENCY SHUTDOWN
                                    </div>
                                )}

                                {phase === 'DISARM_RESULT' && (
                                    <div className="text-center font-black animate-pulse uppercase tracking-[0.2em] text-zinc-500 text-[9px] py-2">
                                        EXTRACTION COMPLETE : CLOSING TERMINAL
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Syndicate Intel Footer - Legend + Action Row */}
                    <div className="mt-auto border-t border-zinc-800 bg-black/40 px-5 pt-2 pb-6">
                        {/* The Requested Formula Legend - Ultra Minimal Row */}
                        <div className="flex justify-center gap-2 text-[7px] font-black uppercase tracking-wider text-zinc-600 mb-2">
                            {[0, 5, 10, 15, 20].map((t, idx) => {
                                const rangeText = t === 20 ? "20+" : `${t}-${t+4}`;
                                const isActive = scaledBonus === idx;
                                return (
                                    <div key={t} className="flex items-center">
                                        <span className={clsx(isActive ? "text-amber-500/80" : "text-zinc-600")}>
                                            AVG {rangeText} = +{idx}
                                        </span>
                                        {idx < 4 && <span className="mx-2 text-zinc-800">|</span>}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={clsx(config.color, "animate-pulse")}>{config.icon}</span>
                                <div className="flex gap-1.5">
                                    {heroes.map(hero => (
                                        <div key={hero.id} className="min-w-[28px] h-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-black text-white italic px-1.5">
                                            {getStat(hero)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="text-[10px] font-black text-amber-500 italic tracking-tighter">
                                    AVG {avgStat} <span className="text-zinc-500 ml-1">|</span> +{scaledBonus} BONUS
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
