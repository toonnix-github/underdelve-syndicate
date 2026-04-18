/**
 * Underdelve Syndicate - Dungeon & Hazard Generator
 * Handles procedural layout, hazard placement, and enemy generation.
 */

const GRID_SIZE = 9;

const proceduralGenerateLayout = (size = GRID_SIZE) => {
    let layout = Array(size).fill().map(() => Array(size).fill(0));
    let validTiles = [];

    // Center point for 9x9 is (4,4)
    const centerX = Math.floor(size / 2);
    const centerY = Math.floor(size / 2);

    layout[centerY][centerX] = 1;

    // Randomly generate 3 distinct rooms (expanded for 9x9)
    for (let r = 0; r < 3; r++) {
        const rx = Math.floor(Math.random() * (size - 4)) + 1;
        const ry = Math.floor(Math.random() * (size - 4)) + 1;
        for (let y = ry; y < ry + 2; y++) {
            for (let x = rx; x < rx + 3; x++) {
                if (y < size && x < size) layout[y][x] = 1;
            }
        }
    }

    // Primary structural cross (guarantees everything connects to center Spawn)
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

    // Strict Outer Walls
    for (let i = 0; i < size; i++) {
        layout[0][i] = 0;
        layout[size - 1][i] = 0;
        layout[i][0] = 0;
        layout[i][size - 1] = 0;
    }

    // Catalog walkable non-spawn tiles
    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            if (layout[y][x] === 1 && !(x === centerX && y === centerY)) {
                validTiles.push({ x, y });
            }
        }
    }

    // Shuffle valid tiles for placement
    validTiles.sort(() => Math.random() - 0.5);
    return { layout, validTiles };
};

const generateFloorBackgrounds = (size = GRID_SIZE) => {
    const backgrounds = {};
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            backgrounds[`${x},${y}`] = Math.floor(Math.random() * 5);
        }
    }
    return backgrounds;
};

const generate = (floor, size = GRID_SIZE) => {
    const { layout, validTiles } = proceduralGenerateLayout(size);
    const bgs = generateFloorBackgrounds(size);
    const getLoc = () => validTiles.length > 0 ? validTiles.pop() : { x: 4, y: 4 };

    const TRAP_TYPES = ['SPIKES', 'ACID', 'BLADES'];
    const getTrap = (id) => ({
        id,
        ...getLoc(),
        type: 'TRAP',
        trapType: TRAP_TYPES[Math.floor(Math.random() * TRAP_TYPES.length)],
        status: 'ACTIVE'
    });

    let ints = [];
    if (floor === 1) {
        ints = [
            getTrap('t1'),
            { id: 'c1', ...getLoc(), type: 'CHEST' },
            { id: 's1', ...getLoc(), type: 'STAIRS' }
        ];
    } else {
        ints = [
            getTrap(`t${floor}`),
            { id: `c${floor}`, ...getLoc(), type: 'CHEST' },
            { id: `s${floor}`, ...getLoc(), type: 'STAIRS' },
            { id: `p${floor}`, x: 4, y: 4, type: 'PREV_FLOOR' }
        ];
    }

    // Return partial results, enemies should be handled separately since they require Combatant class
    return {
        layout,
        bgs,
        interactables: ints,
        validTiles
    };
};

// Export for browser
if (typeof window !== 'undefined') {
    window.DungeonGenerator = {
        GRID_SIZE,
        proceduralGenerateLayout,
        generateFloorBackgrounds,
        generate
    };
}
