import { useState, useCallback } from 'react';
import {
    generateFloor,
    GRID_SIZE,
    MAX_FLOOR,
    TilePos,
    Interactable,
    FloorSpawnRates,
    DungeonFloorData,
    findLootChestSpawnTile,
    getNextLootKillThreshold,
    getAdjacentFloor
} from '../utils/dungeonGenerator';
import { Combatant } from '../models/Combatant';

interface LootProgress {
    killsSinceLastLoot: number;
    nextLootKillThreshold: number;
}

interface FloorCacheEntry {
    dungeonData: DungeonFloorData;
    exploredCells: Set<string>;
    lootProgress: LootProgress;
}

const getInitialLootProgress = (lootRate: number): LootProgress => ({
    killsSinceLastLoot: 0,
    nextLootKillThreshold: getNextLootKillThreshold(lootRate)
});

export const useDungeon = (initialFloor: number, heroes: Combatant[], spawnRates: FloorSpawnRates) => {
    const [floor, setFloor] = useState(initialFloor);
    const [playerPos, setPlayerPos] = useState<TilePos>({ x: 4, y: 4 });
    const [exploredCells, setExploredCells] = useState<Set<string>>(new Set(['4,4']));
    const [dungeonData, setDungeonData] = useState(() => generateFloor(initialFloor, GRID_SIZE, spawnRates));
    const [lootProgress, setLootProgress] = useState<LootProgress>(() => getInitialLootProgress(spawnRates.lootRate));
    const [floorCache, setFloorCache] = useState<Record<number, FloorCacheEntry>>({});

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
            [floor]: { dungeonData, exploredCells, lootProgress }
        }));

        const nf = getAdjacentFloor(floor, direction);
        setFloor(nf);

        // Restore from cache or generate fresh
        if (floorCache[nf]) {
            setDungeonData(floorCache[nf].dungeonData);
            setExploredCells(floorCache[nf].exploredCells);
            setLootProgress(floorCache[nf].lootProgress);
        } else {
            setDungeonData(generateFloor(nf, GRID_SIZE, spawnRates));
            setExploredCells(new Set(['4,4']));
            setLootProgress(getInitialLootProgress(spawnRates.lootRate));
        }
        
        setPlayerPos({ x: 4, y: 4 });
    }, [floor, dungeonData, exploredCells, floorCache, lootProgress, spawnRates]);

    const resetDungeon = useCallback((newFloor = 1) => {
        const boundedFloor = Math.max(1, Math.min(MAX_FLOOR, newFloor));
        setFloor(boundedFloor);
        setPlayerPos({ x: 4, y: 4 });
        setExploredCells(new Set(['4,4']));
        setDungeonData(generateFloor(boundedFloor, GRID_SIZE, spawnRates));
        setLootProgress(getInitialLootProgress(spawnRates.lootRate));
        setFloorCache({});
    }, [spawnRates]);

    const updateInteractable = useCallback((id: string, updates: Partial<Interactable>) => {
        setDungeonData(prev => ({
            ...prev,
            interactables: prev.interactables.map(i => i.id === id ? { ...i, ...updates } : i)
        }));
    }, []);

    const registerEnemyDefeat = useCallback((defeatedPos: TilePos) => {
        let nextLootProgress: LootProgress | null = null;

        setDungeonData(prev => {
            let defeatedEnemyFound = false;
            const updatedInteractables = prev.interactables.map(interactable => {
                const isDefeatedEnemy =
                    interactable.type === 'ENEMY' &&
                    interactable.x === defeatedPos.x &&
                    interactable.y === defeatedPos.y &&
                    interactable.status === 'ACTIVE';

                if (isDefeatedEnemy) {
                    defeatedEnemyFound = true;
                    return { ...interactable, status: 'DISARMED' as const };
                }

                return interactable;
            });

            if (!defeatedEnemyFound) {
                return prev;
            }

            const killCount = lootProgress.killsSinceLastLoot + 1;
            if (killCount < lootProgress.nextLootKillThreshold) {
                nextLootProgress = { ...lootProgress, killsSinceLastLoot: killCount };
                return { ...prev, interactables: updatedInteractables };
            }

            const spawnTile = findLootChestSpawnTile(prev.layout, updatedInteractables, playerPos);
            if (!spawnTile) {
                nextLootProgress = { ...lootProgress, killsSinceLastLoot: killCount };
                return { ...prev, interactables: updatedInteractables };
            }

            nextLootProgress = {
                killsSinceLastLoot: 0,
                nextLootKillThreshold: getNextLootKillThreshold(spawnRates.lootRate)
            };

            return {
                ...prev,
                interactables: [
                    ...updatedInteractables,
                    {
                        id: `c${floor}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
                        x: spawnTile.x,
                        y: spawnTile.y,
                        type: 'CHEST',
                        status: 'ACTIVE'
                    }
                ]
            };
        });

        if (nextLootProgress) {
            setLootProgress(nextLootProgress);
        }
    }, [floor, lootProgress, playerPos, spawnRates.lootRate]);

    return {
        floor,
        playerPos,
        exploredCells,
        dungeonData,
        movePlayer,
        getScoutedCells,
        changeFloor,
        updateInteractable,
        registerEnemyDefeat,
        resetDungeon
    };
};
