import { useState, useCallback } from 'react';
import { generateFloor, GRID_SIZE, TilePos, Interactable } from '../utils/dungeonGenerator';
import { Combatant } from '../models/Combatant';

export const useDungeon = (initialFloor: number, heroes: Combatant[]) => {
    const [floor, setFloor] = useState(initialFloor);
    const [playerPos, setPlayerPos] = useState<TilePos>({ x: 4, y: 4 });
    const [exploredCells, setExploredCells] = useState<Set<string>>(new Set(['4,4']));
    const [dungeonData, setDungeonData] = useState(() => generateFloor(initialFloor));

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
        const leader = heroes.find(h => h.isLeader);
        const scoutRadius = leader?.name === 'Leora' ? 2 : 1;

        exploredCells.forEach(cell => {
            const [cx, cy] = cell.split(',').map(Number);
            for (let dy = -scoutRadius; dy <= scoutRadius; dy++) {
                for (let dx = -scoutRadius; dx <= scoutRadius; dx++) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                        if (dungeonData.layout[ny][nx] === 1) {
                            scouted.add(`${nx},${ny}`);
                        }
                    }
                }
            }
        });
        return scouted;
    }, [exploredCells, heroes, dungeonData]);

    const nextFloor = useCallback(() => {
        const nf = floor + 1;
        setFloor(nf);
        setDungeonData(generateFloor(nf));
        setPlayerPos({ x: 4, y: 4 });
        setExploredCells(new Set(['4,4']));
    }, [floor]);

    return {
        floor,
        playerPos,
        exploredCells,
        dungeonData,
        movePlayer,
        getScoutedCells,
        nextFloor
    };
};
