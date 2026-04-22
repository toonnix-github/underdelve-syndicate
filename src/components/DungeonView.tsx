import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TilePos, Interactable, GRID_SIZE } from '../utils/dungeonGenerator';
import { useDungeon } from '../hooks/useDungeon';
import { Combatant } from '../models/Combatant';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass, Crown, Sword, Shield, Zap, Coins, Package, X, Wind, Music } from 'lucide-react';
import { Button, StatLine } from './UI';
import { clsx } from 'clsx';
import { getHeroPortraitUrl } from '../utils/heroPortraits';
import { ITEM_DATABASE } from '../data/items';
import { Item } from '../types';
import { SyndicateArsenal } from './SyndicateArsenal';

interface DungeonViewProps {
    heroes: Combatant[];
    dungeonState: ReturnType<typeof useDungeon>;
    scrip: number;
    vault: Item[];
    onEncounter: (pos: TilePos) => void;
    onStairs: (direction: 'UP' | 'DOWN') => void;
    onTrap: (trap: Interactable) => void;
    onReward: (amount: number) => void;
    onVaultReward: (item: Item) => void;
    onEquip: (heroId: string, item: Item, slot: string) => void;
    onUnequip: (heroId: string, slot: string) => void;
}

const Minimap: React.FC<{ 
    layout: number[][], 
    playerPos: TilePos, 
    explored: Set<string>,
    scouted: Set<string>,
    interactables: Interactable[],
    floor: number,
    tokenUrls: string[],
    leaderName: string | null
}> = ({ layout, playerPos, explored, scouted, interactables, floor, tokenUrls, leaderName }) => {
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
                            {isPlayer && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-100 shadow-[0_0_4px_rgba(34,211,238,0.95)]" />
                                </div>
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

const DETRITUS_SHEETS = [
    { url: '/assets/detritus_sheet_1.png', rows: 3, cols: 3, count: 9 },
    { url: '/assets/detritus_sheet_2.png', rows: 4, cols: 4, count: 16 },
    { url: '/assets/detritus_sheet_3.png', rows: 4, cols: 4, count: 16 },
    { url: '/assets/detritus_sheet_4.png', rows: 4, cols: 4, count: 16 }
];

const getDeterministicDetritus = (x: number, y: number, floor: number) => {
    const seed = (x * 1337 + y * 73 + floor * 31);
    const seededRandom = (s: number) => {
        const value = Math.sin(s) * 10000;
        return value - Math.floor(value);
    };

    const count = 1 + Math.floor(seededRandom(seed) * 2); 
    const items = [];
    
    for (let i = 0; i < count; i++) {
        const itemSeed = seed + (i + 1) * 777;
        const sheetIdx = Math.floor(seededRandom(itemSeed) * DETRITUS_SHEETS.length);
        const sheet = DETRITUS_SHEETS[sheetIdx];
        const spriteIdx = Math.floor(seededRandom(itemSeed + 1) * sheet.count);
        
        const colIdx = spriteIdx % sheet.cols;
        const rowIdx = Math.floor(spriteIdx / sheet.cols);
        const bgPosX = sheet.cols > 1 ? (colIdx / (sheet.cols - 1)) * 100 : 0;
        const bgPosY = sheet.rows > 1 ? (rowIdx / (sheet.rows - 1)) * 100 : 0;

        let offsetX = (seededRandom(itemSeed + 2) * 90) + 5;
        let offsetY = (seededRandom(itemSeed + 3) * 90) + 5;
        
        if (offsetX > 30 && offsetX < 70) offsetX += (offsetX > 50 ? 25 : -25);
        if (offsetY > 30 && offsetY < 70) offsetY += (offsetY > 50 ? 25 : -25);

        items.push({
            id: i,
            url: sheet.url,
            bgPos: `${bgPosX}% ${bgPosY}%`,
            bgSize: `${sheet.cols * 100}%`,
            offsetX,
            offsetY,
            rotate: seededRandom(itemSeed + 4) * 360,
            scale: 0.3 + seededRandom(itemSeed + 5) * 0.2
        });
    }
    return items;
};

const DetritusLayer: React.FC<{ x: number; y: number; floor: number }> = ({ x, y, floor }) => {
    const items = React.useMemo(() => getDeterministicDetritus(x, y, floor), [x, y, floor]);
    
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none opacity-65">
            {items.map(item => (
                <div 
                    key={item.id}
                    className="absolute w-24 h-24 bg-no-repeat transition-all duration-1000 pointer-events-none"
                    style={{
                        backgroundImage: `url(${item.url})`,
                        backgroundPosition: item.bgPos,
                        backgroundSize: item.bgSize,
                        left: `${item.offsetX}%`,
                        top: `${item.offsetY}%`,
                        transform: `translate(-50%, -50%) rotate(${item.rotate}deg) scale(${item.scale})`,
                        WebkitMaskImage: `url(${item.url})`,
                        maskImage: `url(${item.url})`,
                        WebkitMaskPosition: item.bgPos,
                        maskPosition: item.bgPos,
                        WebkitMaskSize: item.bgSize,
                        maskSize: item.bgSize,
                        maskMode: 'luminance' as any,
                        WebkitMaskMode: 'luminance' as any,
                        filter: 'contrast(2.5) brightness(1.4) drop-shadow(0 4px 6px rgba(0,0,0,0.8))',
                        opacity: 1,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

export const DungeonView: React.FC<DungeonViewProps> = ({ heroes, dungeonState, scrip, vault, onEncounter, onStairs, onTrap, onReward, onVaultReward, onEquip, onUnequip }) => {
    const { floor, playerPos, exploredCells, dungeonData, movePlayer, getScoutedCells, updateInteractable } = dungeonState;
    const scoutedCells = getScoutedCells();
    const leadHero = heroes.find(hero => hero.isLeader) ?? heroes[0] ?? null;
    const vanguardHeroes = heroes.filter(hero => hero.positionLine === 'VANGUARD');
    const tokenHeroes = [
        ...(leadHero ? [leadHero] : []),
        ...vanguardHeroes.filter(hero => hero.id !== leadHero?.id)
    ].slice(0, 3);
    const tokenUrls = tokenHeroes.map(hero => getHeroPortraitUrl(String(hero.imageId || 'unknown')));
    const mapFrameRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [showVault, setShowVault] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [activeEvent, setActiveEvent] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [triggeredEvents, setTriggeredEvents] = useState<Set<string>>(new Set());
    const [activeTrap, setActiveTrap] = useState<Interactable | null>(null);
    const [showArsenal, setShowArsenal] = useState(false);
    const eventTimeoutRef = useRef<any>(null);

    const TILE_SIZE = 160;

    const pushEvent = (msg: string) => {
        setLog(prev => [msg, ...prev].slice(0, 10));
        setActiveEvent(msg);
        if (eventTimeoutRef.current) clearTimeout(eventTimeoutRef.current);
        eventTimeoutRef.current = setTimeout(() => setActiveEvent(null), 3000);
    };

    const handleMove = useCallback((dx: number, dy: number) => {
        if (activeEvent === "ROLL FOR INITIATIVE!" || activeEvent === "A DEADLY SNARE!" || activeTrap) return;
        
        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
        if (dungeonData.layout[newY][newX] === 0) return;

        setIsMoving(true);
        setTimeout(() => setIsMoving(false), 250);
        movePlayer(dx, dy);

        const interactable = dungeonData.interactables.find(i => i.x === newX && i.y === newY);
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
                const randomItem = ITEM_DATABASE[Math.floor(Math.random() * ITEM_DATABASE.length)];
                pushEvent(`UNLOCKED: ${randomItem.name}`);
                onVaultReward(randomItem);
                updateInteractable(interactable.id, { status: 'DISARMED' });
                setTriggeredEvents(prev => new Set(prev).add(interactable.id));
            } else if (interactable.type === 'STAIRS') {
                pushEvent("THE WAY DEEPER IS REVEALED!");
                setTriggeredEvents(prev => new Set(prev).add(interactable.id));
            }
        }
    }, [playerPos, dungeonData, movePlayer, onEncounter, onStairs, onTrap, triggeredEvents, onVaultReward, activeTrap, activeEvent, updateInteractable]);

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

    const centerOnPlayer = useCallback(() => {
        const gridCenter = (GRID_SIZE * TILE_SIZE) / 2;
        const playerCenterX = (playerPos.x * TILE_SIZE) + (TILE_SIZE / 2);
        const playerCenterY = (playerPos.y * TILE_SIZE) + (TILE_SIZE / 2);
        setOffset({
            x: gridCenter - playerCenterX,
            y: gridCenter - playerCenterY
        });
    }, [playerPos, TILE_SIZE]);

    useEffect(() => {
        centerOnPlayer();
    }, [centerOnPlayer]);

    const activeInteractable = dungeonData.interactables.find(i => i.x === playerPos.x && i.y === playerPos.y);
    const isMovementLocked = activeEvent === "ROLL FOR INITIATIVE!" || activeEvent === "A DEADLY SNARE!" || Boolean(activeTrap);

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-black selection:bg-cyan-500/30">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img src="assets/dungeon_main_backdrop.png" className="w-full h-full object-cover opacity-45 blur-[2px] scale-105" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" />
            </div>

            <Minimap
                layout={dungeonData.layout}
                playerPos={playerPos}
                explored={exploredCells}
                scouted={scoutedCells}
                interactables={dungeonData.interactables}
                floor={floor}
                tokenUrls={tokenUrls}
                leaderName={leadHero?.name ?? null}
            />
            
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 bg-black/60 backdrop-blur-md border border-zinc-800/50 px-6 py-3 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800"><Compass className="text-zinc-400" size={18} /></div>
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

            {activeInteractable && (activeInteractable.type === 'STAIRS' || activeInteractable.type === 'PREV_FLOOR') && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <button onClick={() => { if (activeInteractable.type === 'STAIRS') onStairs('DOWN'); if (activeInteractable.type === 'PREV_FLOOR') onStairs('UP'); }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-8 py-4 rounded-xl shadow-[0_0_40px_rgba(8,145,178,0.4)] border-2 border-cyan-400/50 transition-all flex items-center gap-3 uppercase tracking-tighter">
                        {activeInteractable.type === 'STAIRS' ? 'DESCEND TO NEXT FLOOR' : 'ASCEND TO PREVIOUS FLOOR'}
                    </button>
                </div>
            )}

            <div ref={mapFrameRef} className="flex-1 relative overflow-hidden flex items-center justify-center">
                <div className={clsx("relative flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]", isShaking && "animate-shake")} style={{ width: `${GRID_SIZE * TILE_SIZE}px`, height: `${GRID_SIZE * TILE_SIZE}px`, transform: `translate(${offset.x}px, ${offset.y}px)`, display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`, gridTemplateRows: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)` }}>
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const cellKey = `${x},${y}`;
                        const isWall = dungeonData.layout[y][x] === 0;
                        const isExplored = exploredCells.has(cellKey);
                        const isScouted = scoutedCells.has(cellKey);
                        const isFogTile = isScouted && !isExplored;
                        const isNewlyExplored = isExplored && x === playerPos.x && y === playerPos.y;
                        const isPlayer = playerPos.x === x && playerPos.y === y;
                        const interactable = dungeonData.interactables.find(int => int.x === x && int.y === y);
                        const hasTopPassage = y > 0 && dungeonData.layout[y - 1][x] === 1;
                        const hasBottomPassage = y < GRID_SIZE - 1 && dungeonData.layout[y + 1][x] === 1;
                        const hasLeftPassage = x > 0 && dungeonData.layout[y][x - 1] === 1;
                        const hasRightPassage = x < GRID_SIZE - 1 && dungeonData.layout[y][x + 1] === 1;
                        const dx = x - playerPos.x;
                        const dy = y - playerPos.y;
                        const isAdjacentMove = Math.abs(dx) + Math.abs(dy) === 1;
                        const isReachableByClick = isAdjacentMove && !isWall && (isExplored || isScouted) && !isMovementLocked;
                        const MoveArrowIcon = dy === -1 ? ChevronUp : dy === 1 ? ChevronDown : dx === -1 ? ChevronLeft : ChevronRight;
                        const moveArrowAnchorClass =
                            dy === -1 ? "absolute bottom-1 left-1/2 -translate-x-1/2" :
                            dy === 1 ? "absolute top-1 left-1/2 -translate-x-1/2" :
                            dx === -1 ? "absolute right-1 top-1/2 -translate-y-1/2" :
                            "absolute left-1 top-1/2 -translate-y-1/2";
                        const moveArrowNudgeClass =
                            dy === -1 ? "group-hover/move:-translate-y-0.5" :
                            dy === 1 ? "group-hover/move:translate-y-0.5" :
                            dx === -1 ? "group-hover/move:-translate-x-0.5" :
                            "group-hover/move:translate-x-0.5";
                        const caveWallHorizontal = "h-[3px] bg-[linear-gradient(to_right,rgba(9,9,11,0.98),rgba(39,39,42,0.9),rgba(9,9,11,0.98))] shadow-[0_0_10px_rgba(0,0,0,0.9)]";
                        const caveWallVertical = "w-[3px] bg-[linear-gradient(to_bottom,rgba(9,9,11,0.98),rgba(39,39,42,0.9),rgba(9,9,11,0.98))] shadow-[0_0_10px_rgba(0,0,0,0.9)]";
                        const fogWallHorizontal = "h-[3px] bg-[linear-gradient(to_right,rgba(82,82,91,0.8),rgba(161,161,170,0.75),rgba(82,82,91,0.8))] shadow-[0_0_6px_rgba(39,39,42,0.35)]";
                        const fogWallVertical = "w-[3px] bg-[linear-gradient(to_bottom,rgba(82,82,91,0.8),rgba(161,161,170,0.75),rgba(82,82,91,0.8))] shadow-[0_0_6px_rgba(39,39,42,0.35)]";
                        const activeHorizontalWall = isFogTile ? fogWallHorizontal : caveWallHorizontal;
                        const activeVerticalWall = isFogTile ? fogWallVertical : caveWallVertical;

                        let bgIndex = (dungeonData.bgs[cellKey] % 9) + 1;
                        if (bgIndex === 2) bgIndex = 1; 
                        const tileRotation = (interactable?.type === 'STAIRS' || interactable?.type === 'PREV_FLOOR') ? 0 : (dungeonData.bgs[cellKey] % 4) * 90;

                        if (isWall) return <div key={i} className="w-full h-full" />;

                        return (
                            <div
                                key={i}
                                onClick={() => {
                                    if (!isReachableByClick) return;
                                    handleMove(dx, dy);
                                }}
                                className={clsx(
                                    "relative w-full aspect-square transition-all duration-700 overflow-hidden bg-zinc-950 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]",
                                    (isExplored || isScouted) ? "scale-100 opacity-100" : "opacity-0 scale-90",
                                    isNewlyExplored && "animate-glitch-in",
                                    isPlayer && "z-10",
                                    isReachableByClick && "group/move cursor-pointer"
                                )}
                            >
                                {isReachableByClick && (
                                    <div className={clsx("z-30 pointer-events-none", moveArrowAnchorClass)}>
                                        <div className="w-8 h-8 rounded-full border border-cyan-300/35 bg-black/35 backdrop-blur-[1px] flex items-center justify-center transition-all duration-100 ease-out group-hover/move:scale-125 group-hover/move:border-cyan-200/90 group-hover/move:bg-cyan-500/20 group-hover/move:shadow-[0_0_20px_rgba(34,211,238,0.35)]">
                                            <MoveArrowIcon
                                                size={18}
                                                className={clsx(
                                                    "text-cyan-300/80 drop-shadow-[0_0_8px_rgba(34,211,238,0.35)] transition-all duration-100 ease-out",
                                                    moveArrowNudgeClass,
                                                    "group-hover/move:text-cyan-100 group-hover/move:drop-shadow-[0_0_12px_rgba(34,211,238,0.65)]"
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className={clsx("absolute inset-0 transition-opacity duration-1000", isExplored ? "opacity-90" : "opacity-0")}>
                                    <img src={interactable?.type === 'STAIRS' ? 'assets/tiles/tile_stairs_down.png' : interactable?.type === 'PREV_FLOOR' ? 'assets/tiles/tile_stairs_up.png' : `assets/tiles/tile_${bgIndex}.${bgIndex <= 4 ? 'png' : 'jpg'}`} className="w-full h-full object-cover" style={{ transform: `rotate(${tileRotation}deg) scale(1.1)` }} alt="" />
                                    <div className="absolute inset-0 bg-black/20" />
                                </div>
                                {isExplored && !isWall && interactable?.type !== 'STAIRS' && interactable?.type !== 'PREV_FLOOR' && <DetritusLayer x={x} y={y} floor={floor} />}
                                <div className={clsx("absolute inset-0 transition-opacity duration-700", (isScouted && !isExplored) ? "opacity-100" : "opacity-0")}>
                                    <img
                                        src="assets/tiles/unrevealed.jpg"
                                        className="w-full h-full object-cover scale-110 rotate-90 grayscale contrast-90 brightness-95"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-zinc-700/25 flex items-center justify-center">
                                        <div className="text-zinc-300/70 drop-shadow-[0_0_6px_rgba(212,212,216,0.35)]">
                                            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className={clsx("absolute inset-0 pointer-events-none z-20 transition-opacity duration-700", isExplored ? "opacity-100" : "opacity-30")}>
                                    {hasTopPassage ? (
                                        <>
                                            <div className={clsx("absolute top-0 left-0 w-[24%]", activeHorizontalWall)} />
                                            <div className={clsx("absolute top-0 right-0 w-[24%]", activeHorizontalWall)} />
                                        </>
                                    ) : (
                                        <div className={clsx("absolute top-0 inset-x-0", activeHorizontalWall)} />
                                    )}

                                    {hasBottomPassage ? (
                                        <>
                                            <div className={clsx("absolute bottom-0 left-0 w-[24%]", activeHorizontalWall)} />
                                            <div className={clsx("absolute bottom-0 right-0 w-[24%]", activeHorizontalWall)} />
                                        </>
                                    ) : (
                                        <div className={clsx("absolute bottom-0 inset-x-0", activeHorizontalWall)} />
                                    )}

                                    {hasLeftPassage ? (
                                        <>
                                            <div className={clsx("absolute left-0 top-0 h-[24%]", activeVerticalWall)} />
                                            <div className={clsx("absolute left-0 bottom-0 h-[24%]", activeVerticalWall)} />
                                        </>
                                    ) : (
                                        <div className={clsx("absolute left-0 inset-y-0", activeVerticalWall)} />
                                    )}

                                    {hasRightPassage ? (
                                        <>
                                            <div className={clsx("absolute right-0 top-0 h-[24%]", activeVerticalWall)} />
                                            <div className={clsx("absolute right-0 bottom-0 h-[24%]", activeVerticalWall)} />
                                        </>
                                    ) : (
                                        <div className={clsx("absolute right-0 inset-y-0", activeVerticalWall)} />
                                    )}
                                </div>
                                {isExplored && interactable && (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                                        {interactable.type === 'STAIRS' && <div className="text-emerald-500 font-black text-xs uppercase bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">Stairs</div>}
                                        {interactable.type === 'CHEST' && <div className="text-amber-500 font-black text-xs uppercase bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">Loot</div>}
                                        {interactable.type === 'TRAP' && interactable.status !== 'DISARMED' && ( <div className="text-red-500 font-black text-xs uppercase bg-red-950/50 px-3 py-1 rounded-full border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">Trap</div> )}
                                        {interactable.type === 'TRAP' && interactable.status === 'DISARMED' && ( <div className="text-zinc-600 font-bold text-[8px] uppercase tracking-tighter italic">Neutralized</div> )}
                                        {interactable.type === 'ENEMY' && ( <div className="flex flex-col items-center gap-1 animate-pulse"><div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/50 flex items-center justify-center"><Zap size={16} className="text-red-500" /></div><span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">Hostile</span></div> )}
                                    </div>
                                )}
                                {isPlayer && tokenUrls.length > 0 && (
                                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                                        <div className="relative w-16 h-16">
                                            {tokenUrls[2] && (
                                                <div className="absolute left-1 top-8 w-8 h-8 rounded-full overflow-hidden border border-cyan-200/60 shadow-[0_0_10px_rgba(34,211,238,0.35)]">
                                                    <img src={tokenUrls[2]} alt="Ally token" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            {tokenUrls[1] && (
                                                <div className="absolute right-1 top-8 w-8 h-8 rounded-full overflow-hidden border border-cyan-200/60 shadow-[0_0_10px_rgba(34,211,238,0.35)]">
                                                    <img src={tokenUrls[1]} alt="Ally token" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="absolute left-1/2 top-1 -translate-x-1/2 w-11 h-11 rounded-full overflow-hidden border-2 border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.75)] bg-black">
                                                <img src={tokenUrls[0]} alt={leadHero?.name ?? 'Leader'} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                                            </div>
                                            <div className="absolute left-1/2 -top-1 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                                                <Crown size={12} fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="absolute w-20 h-20 rounded-full border border-cyan-400/60 animate-ping" />
                                    </div>
                                )}
                                <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/60 to-transparent" />
                                <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/60 to-transparent" />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="absolute bottom-12 left-12 z-50 grid grid-cols-3 gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div /><button onClick={() => handleMove(0, -1)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronUp size={24} /></button><div />
                <button onClick={() => handleMove(-1, 0)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronLeft size={24} /></button>
                <button onClick={() => handleMove(0, 1)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronDown size={24} /></button>
                <button onClick={() => handleMove(1, 0)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronRight size={24} /></button>
            </div>

            {activeEvent && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[200] pointer-events-none flex flex-col items-center">
                    <div className="absolute inset-0 bg-cyan-500/10 animate-pulse mix-blend-overlay" />
                    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 flex justify-center opacity-20">{[...Array(10)].map((_, i) => ( <div key={i} className="w-[1px] h-full bg-cyan-400 mx-10 animate-out fade-out slide-out-to-right-full duration-1000 ease-in infinite" style={{ animationDelay: `${i * 100}ms` }} /> ))}</div>
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-in slide-in-from-left duration-300" />
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-in slide-in-from-right duration-300" />
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md skew-y-[-1deg] border-y-2 border-cyan-500/30" />
                        <div className="relative flex flex-col items-center animate-in zoom-in-150 duration-300 ease-out">
                            <span className="text-[10px] font-black tracking-[1em] text-cyan-500/80 mb-1 animate-pulse">{activeEvent === 'ROLL FOR INITIATIVE!' ? 'THE SHADOWS STIR' : 'FATE INTERVENES'}</span>
                            <h1 className="text-6xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] flex items-center gap-6 scale-y-110"><ChevronRight className="text-cyan-500" size={48} strokeWidth={4} />{activeEvent}<ChevronLeft className="text-cyan-500" size={48} strokeWidth={4} /></h1>
                            <div className="mt-2 flex gap-4 text-[8px] font-bold text-zinc-500 uppercase tracking-widest"><span>Underdelve Chronicles</span><span>•</span><span>Dungeon Master v1.0</span></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute right-0 top-0 bottom-0 w-56 bg-gradient-to-l from-black/80 via-black/40 to-transparent backdrop-blur-md border-l border-zinc-800/30 p-4 flex flex-col gap-6 z-40">
                <div className="flex flex-col gap-1 px-1"><h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Syndicate</h2><div className="h-0.5 w-8 bg-cyan-600/50" /></div>
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-1">
                    <div className="flex flex-col gap-2"><div className="flex items-center gap-2 px-1"><div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" /><h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Vanguard</h3></div><div className="flex flex-col gap-2">{heroes.filter(h => h.positionLine === 'VANGUARD').map(hero => ( <HeroStatusCard key={hero.name} hero={hero} party={heroes} /> ))}</div></div>
                    <div className="flex flex-col gap-2"><div className="flex items-center gap-2 px-1"><div className="w-1 h-1 rounded-full bg-indigo-500/50" /><h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Rearguard</h3></div><div className="flex flex-col gap-2">{heroes.filter(h => h.positionLine === 'REARGUARD').map(hero => ( <HeroStatusCard key={hero.name} hero={hero} party={heroes} /> ))}</div></div>
                </div>
                <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-zinc-800/20">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1"><div className="flex items-center gap-2"><Coins className="text-amber-600" size={12} /><p className="text-[10px] font-black text-amber-500 tabular-nums">{scrip.toLocaleString()}</p></div><button onClick={() => setShowVault(true)} className="text-[9px] font-bold text-zinc-600 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-1"><Package size={10} /> Vault ({vault.length})</button></div>
                        <Button onClick={() => setShowArsenal(true)} className="w-full bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border-cyan-500/30 flex items-center justify-center gap-2 py-3 group"><Package className="w-4 h-4 group-hover:rotate-12 transition-transform" /><span className="text-xs font-black tracking-widest uppercase">INVENTORY</span></Button>
                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-800 px-1"><span>Sector V.1</span><span className="text-cyan-900/40 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-cyan-900/60" /> Live</span></div>
                    </div>
                </div>
            </div>

            {showVault && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowVault(false)} />
                    <div className="relative w-full max-w-4xl bg-zinc-900 border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950/50"><div><h3 className="text-2xl font-black italic tracking-tighter uppercase text-white flex items-center gap-3"><Package className="text-cyan-500" /> Syndicate <span className="text-cyan-500">Vault</span></h3><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Recovered assets & logistical inventory</p></div><button onClick={() => setShowVault(false)} className="w-12 h-12 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors"><X className="text-zinc-400" /></button></div>
                        <div className="flex-1 overflow-y-auto p-12 grid grid-cols-4 gap-6 relative z-10">{vault.length === 0 ? ( <div className="col-span-4 h-64 flex flex-col items-center justify-center space-y-4 opacity-50"><Package size={64} className="text-zinc-800" /><p className="text-zinc-600 font-black uppercase tracking-tighter italic text-xl">The Vault is currently empty</p></div> ) : ( vault.map((item, i) => ( <div key={item.id || i} className="aspect-square bg-zinc-950/60 border border-zinc-800 rounded-2xl flex items-center justify-center hover:border-zinc-500 transition-all hover:scale-105 group relative cursor-pointer"><div className="text-[40px] grayscale group-hover:grayscale-0 transition-all">📦</div><div className="absolute bottom-2 inset-x-2 text-center text-[8px] font-black uppercase text-zinc-500">{item.name}</div></div> )) )}</div>
                        <div className="p-8 border-t border-zinc-800 bg-zinc-950/50 flex justify-between items-center"><div className="flex items-center gap-4"><Coins className="text-amber-500" size={24} /><div><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Credit</p><p className="text-2xl font-black text-amber-500 tabular-nums">{scrip.toLocaleString()}</p></div></div><Button onClick={() => setShowVault(false)} variant="primary" className="px-12">DISMISS</Button></div>
                    </div>
                </div>
            )}

            {activeTrap && (
                <TrapResolutionOverlay 
                    trap={activeTrap}
                    heroes={heroes}
                    onResolve={(newStatus, avoided) => {
                        updateInteractable(activeTrap.id, { status: newStatus });
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

            <SyndicateArsenal 
                isOpen={showArsenal}
                onClose={() => setShowArsenal(false)}
                heroes={heroes}
                vault={vault}
                onEquip={onEquip}
                onUnequip={onUnequip}
            />
        </div>
    );
};

export const HeroStatusCard: React.FC<{ hero: Combatant, party: Combatant[] }> = ({ hero, party }) => {
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
        <div className={clsx("group relative w-full h-24 rounded-xl border overflow-hidden bg-zinc-950/20 transition-all duration-300 hover:bg-zinc-900/40 hover:border-zinc-700/50", isHit ? "border-rose-500 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-hit-shake" : "border-zinc-800/50")}>
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-all duration-500"><img src={getHeroPortraitUrl(hero.imageId)} className="w-full h-full object-cover object-[center_10%]" alt={hero.name} /></div>
            <div className="absolute inset-0 z-10 p-2 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-zinc-950/20 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="text-[11px] font-black uppercase tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{hero.name}</p>
                            {hero.isLeader && ( <Crown className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" size={9} fill="currentColor" /> )}
                        </div>
                        <p className="text-[7px] font-bold text-zinc-400/80 uppercase tracking-[0.2em] -mt-0.5">{hero.race} • {hero.job}</p>
                    </div>
                    <div className="w-3.5 h-3.5 opacity-80 pt-0.5">
                        <img src={`/assets/icon_${hero.role.toLowerCase()}.png`} className="w-full h-full object-contain brightness-125" alt={hero.role} />
                    </div>
                </div>
                <div className="space-y-1.5 px-0.5">
                    <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden border border-white/5"><div className={clsx("h-full transition-all duration-1000 bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]", hpPercent < 25 && "animate-pulse brightness-125")} style={{ width: `${hpPercent}%` }} /></div>
                    <div className="flex flex-col gap-1">
                        <StatLine 
                            label="Atk" 
                            current={hero.getATK(party)} 
                            base={hero.power} 
                            icon={hero.job === 'Bard' ? <Music size={8} className="text-pink-500" /> : <Sword size={8} className="text-amber-500" />} 
                            breakdown={hero.getStatBreakdown?.('ATK', party)} 
                            hideTooltip
                        />
                        <StatLine label="Def" current={hero.getDEF(party)} base={hero.def} icon={<Shield size={8} className="text-blue-500" />} breakdown={hero.getStatBreakdown?.('DEF', party)} hideTooltip />
                        <StatLine label="Spd" current={hero.getSPD(party)} base={hero.speed} icon={<Wind size={8} className="text-cyan-500" />} breakdown={hero.getStatBreakdown?.('SPD', party)} hideTooltip />
                    </div>
                </div>
            </div>
            <div className="absolute right-2 bottom-2 text-[10px] font-black text-white drop-shadow-md z-20">{Math.floor(hero.hp)}<span className="opacity-40 text-[8px] ml-0.5">/ {hero.maxHp}</span></div>
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

    const trapConfig = {
        BLADES: { title: "PENDULUM BLADES", stat: "SPD", color: "text-rose-500", icon: <Zap size={14} /> },
        SPIKES: { title: "RISING SPIKES", stat: "POW", color: "text-amber-500", icon: <Sword size={14} /> },
        ACID: { title: "CORROSIVE ACID", stat: "DEF", color: "text-emerald-500", icon: <Shield size={14} /> }
    };
    const config = trapConfig[trap.trapType || 'BLADES'];

    const getStat = (h: Combatant) => {
        if (trap.trapType === 'ACID') return h.getDEF(heroes);
        if (trap.trapType === 'BLADES') return h.getSPD(heroes);
        return h.getATK(heroes);
    };

    const avgStat = Math.floor(heroes.reduce((sum, h) => sum + getStat(h), 0) / heroes.length);
    const scaledBonus = Math.floor(avgStat / 5);

    const targetDC = (phase === 'AVOIDANCE' || phase === 'AVOID_RESULT') ? (trap.resolution?.avoidanceDC || 14) : (trap.resolution?.disarmDC || 16);

    const activeBg = (type?: string) => {
        if (type === 'BLADES' || type === 'SPIKES') return '/assets/trap_bg_kinetic.png';
        if (type === 'ACID') return '/assets/trap_bg_chemical.png';
        return '/assets/trap_bg_kinetic.png';
    };

    useEffect(() => {
        if (phase === 'DISARM_RESULT') {
            const timer = setTimeout(() => {
                onResolve(resultMsg === 'DISARMED!' ? 'DISARMED' : 'FAILED', avoided);
            }, 1800); 
            return () => clearTimeout(timer);
        }
    }, [phase, resultMsg, avoided, onResolve]);

    useEffect(() => {
        if (phase === 'AVOID_RESULT') {
            if (!avoided) {
                const timer = setTimeout(() => onResolve('FAILED', false), 2500);
                return () => clearTimeout(timer);
            } else {
                const timer = setTimeout(() => {
                    setPhase('CHOICE');
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

                const finalValue = roll + scaledBonus;
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
                <div className="absolute inset-0 z-0 opacity-100 pointer-events-none overflow-hidden">
                    <img src={activeBg(trap.trapType)} className="w-full h-full object-cover scale-105" alt="" />
                    <div className="absolute inset-0 bg-black/60 animate-crt-flicker" />
                    <div className="absolute inset-x-0 h-1/2 animate-scanline pointer-events-none opacity-40" />
                </div>

                <div className="relative z-10 flex flex-col h-full overflow-hidden">
                    <div className="p-3 border-b border-zinc-900/50 flex flex-col items-center justify-center bg-black/60">
                        <h1 className={clsx("text-2xl font-black italic tracking-tighter uppercase", config.color)}>{config.title}</h1>
                    </div>
                    <div className="px-6 py-3 flex justify-center">
                        <div className="grid grid-cols-2 gap-px bg-zinc-700/50 border border-zinc-700/50 rounded-xl overflow-hidden w-full max-w-xs shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <div className="bg-zinc-950/80 backdrop-blur-sm px-4 py-2 flex flex-col items-center"><div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">DODGE DC</div><div className="text-2xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">#{Math.ceil(targetDC)}</div></div>
                            <div className="bg-zinc-950/80 backdrop-blur-sm px-4 py-2 flex flex-col items-center"><div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">PARTY BONUS</div><div className="text-2xl font-black text-amber-500 italic tracking-tighter leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">+{scaledBonus}</div></div>
                        </div>
                    </div>
                    <div className="px-10 mb-2 flex justify-center gap-8">
                        <div className="flex items-center gap-2"><span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">RISK:</span><span className="text-[10px] font-bold text-zinc-300">{phase.includes('AVOID') ? '20 HP' : '10 HP'}</span></div>
                        <div className="flex items-center gap-2"><span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">BOUNTY:</span><span className="text-[10px] font-bold text-zinc-300">{phase.includes('AVOID') ? 'PASS' : `${trap.resolution?.scripReward || 75}S`}</span></div>
                    </div>
                    <div className="flex flex-col items-center px-10 space-y-3 mb-4">
                        <p className="text-[10px] font-bold text-zinc-500 text-center leading-relaxed h-8">{phase.includes('AVOID') ? "Hazard area triggered. Synchronize equipment for avoidance." : phase === 'CHOICE' ? "Primary impact avoided. Evaluate risk for disarm bounty." : "Focusing on core circuitry. Accuracy required for extraction."}</p>
                        <div className="relative flex flex-col items-center gap-2">
                            <div className="relative">
                                <div className={clsx("w-24 h-24 relative flex items-center justify-center transition-all duration-300", isRolling && "animate-bounce", rollValue !== null && (rollValue + scaledBonus >= targetDC ? "drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "drop-shadow-[0_0_20_rgba(244,63,94,0.3)]"))}>
                                    <div className={clsx("absolute inset-0 border-[2px]", isRolling ? "border-white animate-dice-glow" : (rollValue === null ? "border-zinc-800" : (rollValue + scaledBonus >= targetDC ? "border-emerald-500" : "border-rose-500")))} style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} />
                                    <div className="flex flex-col items-center"><span className={clsx("text-4xl font-black italic", isRolling ? "text-white scale-125" : (rollValue !== null && (rollValue + scaledBonus >= targetDC ? "text-emerald-400" : "text-rose-400")))}>{isRolling ? visualRoll : rollValue || 'D20'}</span></div>
                                </div>
                            </div>
                            <div className="w-64">
                                {(phase === 'AVOIDANCE' || phase === 'DISARM') && ( <button disabled={isRolling} onClick={() => handleRoll()} className={clsx("w-full py-3 text-xl font-black uppercase tracking-tighter transition-all border-b-6 group relative overflow-hidden", isRolling ? "bg-zinc-800 text-zinc-600 border-zinc-900" : "bg-white text-black hover:bg-zinc-100 border-zinc-400")}><span className="relative z-10">{isRolling ? "ROLLING..." : (phase === 'AVOIDANCE' ? "EXECUTE EVASION" : "EXECUTE DISARM")}</span></button> )}
                                {phase === 'CHOICE' && (
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleRoll('DISARM')} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-tight border-b-4 border-emerald-800 animate-in slide-in-from-bottom-2 duration-300">ATTEMPT DISARM (RISK: 10HP)</button>
                                        <button onClick={() => onResolve('DISARMED', true)} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold uppercase text-[10px] tracking-widest animate-in slide-in-from-bottom-4 duration-500">WITHDRAW (STAY SAFE)</button>
                                    </div>
                                )}
                                {(phase === 'AVOID_RESULT' || phase === 'DISARM_RESULT') && ( <div className={clsx("w-full py-4 text-3xl font-black italic text-center uppercase tracking-tighter animate-in zoom-in duration-300", resultMsg.includes('!') ? "text-emerald-500" : "text-rose-500")}>{resultMsg}</div> )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
