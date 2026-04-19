/**
 * Underdelve Syndicate - Dungeon & Hazard Generator (Modernized)
 */

export const GRID_SIZE = 9;

export interface TilePos {
    x: number;
    y: number;
}

export interface Interactable extends TilePos {
    id: string;
    type: 'TRAP' | 'CHEST' | 'STAIRS' | 'PREV_FLOOR' | 'ENEMY';
    trapType?: 'SPIKES' | 'ACID' | 'BLADES';
    status: 'ACTIVE' | 'TRIGGERED' | 'DISARMED' | 'FAILED';
    resolution?: {
        avoided: boolean;
        disarmed: boolean;
        scripReward: number;
        avoidanceDC: number;
        disarmDC: number;
    };
}

export const generateFloor = (floor: number, size = GRID_SIZE) => {
    let layout = Array(size).fill(0).map(() => Array(size).fill(0));
    let validTiles: TilePos[] = [];

    const centerX = Math.floor(size / 2);
    const centerY = Math.floor(size / 2);

    layout[centerY][centerX] = 1;

    // Randomly generate 3 distinct rooms
    for (let r = 0; r < 3; r++) {
        const rx = Math.floor(Math.random() * (size - 4)) + 1;
        const ry = Math.floor(Math.random() * (size - 4)) + 1;
        for (let y = ry; y < ry + 2; y++) {
            for (let x = rx; x < rx + 3; x++) {
                if (y < size && x < size) layout[y][x] = 1;
            }
        }
    }

    // Primary structural cross
    for (let i = 1; i < size - 1; i++) {
        layout[centerY][i] = 1;
        layout[i][centerX] = 1;
    }

    // Extra chaos paths
    for (let i = 0; i < 8; i++) {
        const cx = Math.floor(Math.random() * (size - 2)) + 1;
        const cy = Math.floor(Math.random() * (size - 2)) + 1;
        layout[cy][cx] = 1;
        if (Math.random() > 0.5 && cx + 1 < size) layout[cy][cx + 1] = 1;
        else if (cy + 1 < size) layout[cy + 1][cx] = 1;
    }

    // Walls
    for (let i = 0; i < size; i++) {
        layout[0][i] = 0;
        layout[size - 1][i] = 0;
        layout[i][0] = 0;
        layout[i][size - 1] = 0;
    }

    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            if (layout[y][x] === 1 && !(x === centerX && y === centerY)) {
                validTiles.push({ x, y });
            }
        }
    }

    validTiles.sort(() => Math.random() - 0.5);

    const bgs: Record<string, number> = {};
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            bgs[`${x},${y}`] = Math.floor(Math.random() * 5);
        }
    }

    const getLoc = () => validTiles.length > 0 ? validTiles.pop()! : { x: centerX, y: centerY };

    const TRAP_TYPES = ['SPIKES', 'ACID', 'BLADES'] as const;
    const getTrap = (id: string, floorLevel: number): Interactable => ({
        id,
        ...getLoc(),
        type: 'TRAP',
        trapType: TRAP_TYPES[Math.floor(Math.random() * TRAP_TYPES.length)],
        status: 'ACTIVE',
        resolution: {
            avoided: false,
            disarmed: false,
            scripReward: 25 + (floorLevel * 10),
            avoidanceDC: 8 + (floorLevel * 1.5),
            disarmDC: 10 + (floorLevel * 2)
        }
    });

    let interactables: Interactable[] = [];
    if (floor === 1) {
        interactables = [
            getTrap('t1', floor),
            { id: 'e1', ...getLoc(), type: 'ENEMY', status: 'ACTIVE' },
            { id: 'c1', ...getLoc(), type: 'CHEST', status: 'ACTIVE' },
            { id: 's1', ...getLoc(), type: 'STAIRS', status: 'ACTIVE' }
        ];
    } else {
        interactables = [
            getTrap(`t${floor}`, floor),
            { id: `e${floor}_1`, ...getLoc(), type: 'ENEMY', status: 'ACTIVE' },
            { id: `e${floor}_2`, ...getLoc(), type: 'ENEMY', status: 'ACTIVE' },
            { id: `c${floor}`, ...getLoc(), type: 'CHEST', status: 'ACTIVE' },
            { id: `s${floor}`, ...getLoc(), type: 'STAIRS', status: 'ACTIVE' },
            { id: `p${floor}`, x: centerX, y: centerY, type: 'PREV_FLOOR', status: 'ACTIVE' }
        ];
    }

    return {
        layout,
        bgs,
        interactables,
        validTiles
    };
};
