import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TilePos, Interactable, GRID_SIZE } from '../utils/dungeonGenerator';
import { useDungeon } from '../hooks/useDungeon';
import { Combatant } from '../models/Combatant';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { clsx } from 'clsx';

interface DungeonViewProps {
    heroes: Combatant[];
    onEncounter: (pos: TilePos) => void;
    onStairs: (direction: 'UP' | 'DOWN') => void;
    onTrap: (trap: Interactable) => void;
}

export const DungeonView: React.FC<DungeonViewProps> = ({ heroes, onEncounter, onStairs, onTrap }) => {
    const { floor, playerPos, exploredCells, dungeonData, movePlayer, getScoutedCells } = useDungeon(1, heroes);
    const scoutedCells = getScoutedCells();
    const mapFrameRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const TILE_SIZE = 160;
    const GAP = 8;

    const handleMove = useCallback((dx: number, dy: number) => {
        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
        if (dungeonData.layout[newY][newX] === 0) return;

        movePlayer(dx, dy);

        // Check for interactables AFTER movePlayer state update (simplified here by using newX/newY)
        const interactable = dungeonData.interactables.find(i => i.x === newX && i.y === newY);
        if (interactable) {
            if (interactable.type === 'STAIRS') onStairs('DOWN');
            if (interactable.type === 'PREV_FLOOR') onStairs('UP');
            if (interactable.type === 'TRAP') onTrap(interactable);
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

    // Center view on player
    useEffect(() => {
        if (!mapFrameRef.current) return;
        const frame = mapFrameRef.current.getBoundingClientRect();
        const targetX = (playerPos.x * (TILE_SIZE + GAP)) + (TILE_SIZE / 2);
        const targetY = (playerPos.y * (TILE_SIZE + GAP)) + (TILE_SIZE / 2);
        
        setOffset({
            x: (frame.width / 2) - targetX,
            y: (frame.height / 2) - targetY
        });
    }, [playerPos]);

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

            {/* Main Dungeon Grid */}
            <div ref={mapFrameRef} className="flex-1 relative cursor-grab active:cursor-grabbing">
                <div 
                    className="absolute transition-all duration-500 ease-out"
                    style={{ 
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                        display: 'grid',
                        gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`,
                        gap: `${GAP}px`
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
                                    "relative w-full aspect-square rounded-xl border-2 transition-all duration-700 overflow-hidden",
                                    isExplored ? "border-zinc-800 bg-zinc-900" : (isScouted ? "border-zinc-900 bg-zinc-950/40" : "opacity-0 scale-90"),
                                    isPlayer && "border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] z-10"
                                )}
                            >
                                {/* Tile Texture Placeholder */}
                                <div className={clsx(
                                    "absolute inset-0 opacity-20",
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
