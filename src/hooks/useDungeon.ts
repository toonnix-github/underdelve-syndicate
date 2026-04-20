import { useState, useCallback } from 'react';
import { generateFloor, GRID_SIZE, TilePos, Interactable, FloorSpawnRates } from '../utils/dungeonGenerator';
import { Combatant } from '../models/Combatant';

export const useDungeon = (initialFloor: number, heroes: Combatant[], spawnRates: FloorSpawnRates) => {
    const [floor, setFloor] = useState(initialFloor);
    const [playerPos, setPlayerPos] = useState<TilePos>({ x: 4, y: 4 });
    const [exploredCells, setExploredCells] = useState<Set<string>>(new Set(['4,4']));
    const [dungeonData, setDungeonData] = useState(() => generateFloor(initialFloor, GRID_SIZE, spawnRates));
    const [floorCache, setFloorCache] = useState<Record<number, { dungeonData: any, exploredCells: Set<string> }>>({});

    const movePlayer = useCallback((dx: number, dy: number) => {
        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
        if (dungeonData.layout[newY][newX] === 0) return;

        setPlayerPos({ x: newX, y: newY });
        
        const cellKey = `${newX},${newY}`;
        if (!exploredCells.has(cellKey)) {
            setExploredCells(prev => new Set(prev).add(cellKey));
        }

        // Logic for encounter/interactable checks would go here or in a separate handler
    }, [playerPos, dungeonData, exploredCells]);

    const getScoutedCells = useCallback(() => {
        const scouted = new Set<string>();
        
        exploredCells.forEach(cell => {
            const [cx, cy] = cell.split(',').map(Number);
            const adjacents = [
                { nx: cx, ny: cy - 1 }, // Top
                { nx: cx, ny: cy + 1 }, // Bottom
                { nx: cx - 1, ny: cy }, // Left
                { nx: cx + 1, ny: cy }  // Right
            ];

            adjacents.forEach(({ nx, ny }) => {
                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                    // It's scouted if it's a floor tile (connected by doorway)
                    if (dungeonData.layout[ny][nx] === 1) {
                        scouted.add(`${nx},${ny}`);
                    }
                }
            });
        });
        return scouted;
    }, [exploredCells, dungeonData]);

    const changeFloor = useCallback((direction: 'UP' | 'DOWN') => {
        // Persistence: Cache current floor before transition
        setFloorCache(prev => ({
            ...prev,
            [floor]: { dungeonData, exploredCells }
        }));

        const nf = direction === 'UP' ? Math.max(1, floor - 1) : floor + 1;
        setFloor(nf);

        // Restore from cache or generate fresh
        if (floorCache[nf]) {
            setDungeonData(floorCache[nf].dungeonData);
            setExploredCells(floorCache[nf].exploredCells);
        } else {
            setDungeonData(generateFloor(nf, GRID_SIZE, spawnRates));
            setExploredCells(new Set(['4,4']));
        }
        
        setPlayerPos({ x: 4, y: 4 });
    }, [floor, dungeonData, exploredCells, floorCache, spawnRates]);

    const resetDungeon = useCallback((newFloor = 1) => {
        setFloor(newFloor);
        setPlayerPos({ x: 4, y: 4 });
        setExploredCells(new Set(['4,4']));
        setDungeonData(generateFloor(newFloor, GRID_SIZE, spawnRates));
        setFloorCache({});
    }, [spawnRates]);

    const updateInteractable = useCallback((id: string, updates: Partial<Interactable>) => {
        setDungeonData(prev => ({
            ...prev,
            interactables: prev.interactables.map(i => i.id === id ? { ...i, ...updates } : i)
        }));
    }, []);

    return {
        floor,
        playerPos,
        exploredCells,
        dungeonData,
        movePlayer,
        getScoutedCells,
        changeFloor,
        updateInteractable,
        resetDungeon
    };
};
