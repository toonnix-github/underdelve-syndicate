import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TilePos, Interactable, GRID_SIZE } from '../utils/dungeonGenerator';
import { useDungeon } from '../hooks/useDungeon';
import { Combatant } from '../models/Combatant';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { clsx } from 'clsx';

interface DungeonViewProps {
    heroes: Combatant[];
    dungeonState: ReturnType<typeof useDungeon>;
    onEncounter: (pos: TilePos) => void;
    onStairs: (direction: 'UP' | 'DOWN') => void;
    onTrap: (trap: Interactable) => void;
}

export const DungeonView: React.FC<DungeonViewProps> = ({ heroes, dungeonState, onEncounter, onStairs, onTrap }) => {
    const { floor, playerPos, exploredCells, dungeonData, movePlayer, getScoutedCells } = dungeonState;
    const scoutedCells = getScoutedCells();
    const mapFrameRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const TILE_SIZE = 160;

    const handleMove = useCallback((dx: number, dy: number) => {
        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
        if (dungeonData.layout[newY][newX] === 0) return;

        movePlayer(dx, dy);

        // Hazards like TRAPS remain automatic, but transitions are now manual
        const interactable = dungeonData.interactables.find(i => i.x === newX && i.y === newY);
        if (interactable && interactable.type === 'TRAP') {
            onTrap(interactable);
        } else {
            if (Math.random() < 0.1) onEncounter({ x: newX, y: newY });
        }
    }, [playerPos, dungeonData, movePlayer, onEncounter, onStairs, onTrap]);

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
        <div className="w-full h-full flex flex-col relative overflow-hidden bg-zinc-950">
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
                <div 
                    className="absolute transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center"
                    style={{ 
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                        display: 'grid',
                        width: `${GRID_SIZE * TILE_SIZE}px`,
                        height: `${GRID_SIZE * TILE_SIZE}px`,
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
                        const isPlayer = playerPos.x === x && playerPos.y === y;
                        const interactable = dungeonData.interactables.find(int => int.x === x && int.y === y);

                        if (isWall) return <div key={i} className="w-full h-full" />;

                        return (
                            <div 
                                key={i}
                                className={clsx(
                                    "relative w-full aspect-square transition-all duration-700 overflow-hidden bg-zinc-950",
                                    (isExplored || isScouted) ? "scale-100 opacity-100" : "opacity-0 scale-90",
                                    isPlayer && "z-10"
                                )}
                            >
                                {/* Room Art (Conditional) */}
                                <div className={clsx(
                                    "absolute inset-0 transition-opacity duration-1000",
                                    isExplored ? "opacity-60" : "opacity-0"
                                )}>
                                    <img 
                                        src={
                                            interactable?.type === 'STAIRS' ? 'assets/tiles/tile_stairs_down.png' :
                                            interactable?.type === 'PREV_FLOOR' ? 'assets/tiles/tile_stairs_up.png' :
                                            `assets/tiles/tile_${(dungeonData.bgs[cellKey] % 9) + 1}.${((dungeonData.bgs[cellKey] % 9) + 1) <= 4 ? 'png' : 'jpg'}`
                                        } 
                                        className="w-full h-full object-cover scale-110"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-black/50" />
                                </div>

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
                                        <div className="w-8 h-8 bg-white rounded-full animate-ping opacity-50" />
                                        <div className="absolute w-6 h-6 bg-white rounded-sm rotate-45 border-2 border-zinc-900" />
                                    </div>
                                )}

                                {/* Interactable Overlays */}
                                {isExplored && interactable && (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                                        {interactable.type === 'STAIRS' && <div className="text-emerald-500 font-black text-xs uppercase bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/50">Stairs</div>}
                                        {interactable.type === 'CHEST' && <div className="text-amber-500 font-black text-xs uppercase bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/50">Loot</div>}
                                        {interactable.type === 'TRAP' && <div className="text-red-500 font-black text-xs uppercase bg-red-950/50 px-3 py-1 rounded-full border border-red-500/50">Trap</div>}
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
            <div className="absolute bottom-12 right-12 z-50 grid grid-cols-3 gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div />
                <button onClick={() => movePlayer(0, -1)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronUp size={24} /></button>
                <div />
                <button onClick={() => movePlayer(-1, 0)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronLeft size={24} /></button>
                <button onClick={() => movePlayer(0, 1)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronDown size={24} /></button>
                <button onClick={() => movePlayer(1, 0)} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800"><ChevronRight size={24} /></button>
            </div>
        </div>
    );
};
