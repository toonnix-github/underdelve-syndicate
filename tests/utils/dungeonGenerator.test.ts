import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FLOOR_SPAWN_RATES,
  findLootChestSpawnTile,
  generateFloor,
  getNextLootKillThreshold,
  GRID_SIZE,
  MAX_FLOOR,
  getAdjacentFloor
} from '../../src/utils/dungeonGenerator';

describe('dungeonGenerator', () => {
  it('creates a grid with correct dimensions', () => {
    const floor = generateFloor(1, GRID_SIZE, DEFAULT_FLOOR_SPAWN_RATES);
    expect(floor.layout.length).toBe(GRID_SIZE);
    expect(floor.layout.every(row => row.length === GRID_SIZE)).toBe(true);
  });

  it('creates stairs on every floor', () => {
    const floor = generateFloor(1);
    expect(floor.interactables.some(item => item.type === 'STAIRS')).toBe(true);
  });

  it('does not create descend stairs on the final floor', () => {
    const floor = generateFloor(MAX_FLOOR);
    expect(floor.interactables.some(item => item.type === 'STAIRS')).toBe(false);
    expect(floor.interactables.some(item => item.type === 'PREV_FLOOR')).toBe(true);
  });

  it('does not pre-spawn chest interactables (chests are kill-driven random spawns)', () => {
    const floor = generateFloor(1, GRID_SIZE, { enemyRate: 80, trapRate: 20, lootRate: 100 });
    expect(floor.interactables.some(item => item.type === 'CHEST')).toBe(false);
  });

  it('creates previous-floor interactable on floors above 1 at map center', () => {
    const floor = generateFloor(3);
    const prev = floor.interactables.find(item => item.type === 'PREV_FLOOR');
    expect(prev).toBeDefined();
    expect(prev?.x).toBe(Math.floor(GRID_SIZE / 2));
    expect(prev?.y).toBe(Math.floor(GRID_SIZE / 2));
  });

  it('spawns only mandatory interactables when all spawn rates are zero', () => {
    const floor1 = generateFloor(1, GRID_SIZE, { enemyRate: 0, trapRate: 0, lootRate: 0 });
    expect(floor1.interactables.every(item => item.type === 'STAIRS')).toBe(true);

    const floor2 = generateFloor(2, GRID_SIZE, { enemyRate: 0, trapRate: 0, lootRate: 0 });
    const types = new Set(floor2.interactables.map(item => item.type));
    expect(types.has('STAIRS')).toBe(true);
    expect(types.has('PREV_FLOOR')).toBe(true);
    expect(types.has('TRADER')).toBe(true);
    expect(types.size).toBe(3);
  });

  it('spawns trap interactables with full trap metadata when trap rate is 100%', () => {
    const floor = generateFloor(4, GRID_SIZE, { enemyRate: 0, trapRate: 100, lootRate: 0 });
    const traps = floor.interactables.filter(item => item.type === 'TRAP');

    expect(traps.length).toBeGreaterThan(0);
    traps.forEach(trap => {
      expect(trap.status).toBe('ACTIVE');
      expect(trap.trapType).toMatch(/SPIKES|ACID|BLADES/);
      expect(trap.resolution).toBeDefined();
      expect(trap.resolution?.avoidanceDC).toBeGreaterThan(0);
      expect(trap.resolution?.disarmDC).toBeGreaterThan(0);
      expect(trap.resolution?.scripReward).toBeGreaterThan(0);
    });
  });

  it('spawns only enemies (besides stairs metadata) when enemy rate is 100%', () => {
    const floor = generateFloor(1, GRID_SIZE, { enemyRate: 100, trapRate: 0, lootRate: 0 });
    const content = floor.interactables.filter(item => item.type !== 'STAIRS' && item.type !== 'PREV_FLOOR');
    expect(content.length).toBeGreaterThan(0);
    expect(content.every(item => item.type === 'ENEMY')).toBe(true);
  });

  it('spawns trader on floor 2 adjacent to the stairs-up tile', () => {
    const floor2 = generateFloor(2, GRID_SIZE, { enemyRate: 0, trapRate: 0, lootRate: 0 });
    const stairsUp = floor2.interactables.find(item => item.type === 'PREV_FLOOR');
    const trader = floor2.interactables.find(item => item.type === 'TRADER');

    expect(stairsUp).toBeDefined();
    expect(trader).toBeDefined();
    if (stairsUp && trader) {
      const manhattan = Math.abs(stairsUp.x - trader.x) + Math.abs(stairsUp.y - trader.y);
      expect(manhattan).toBe(1);
    }
  });

  it('calculates loot kill threshold ranges from loot rate', () => {
    expect(getNextLootKillThreshold(0)).toBeGreaterThanOrEqual(4);
    expect(getNextLootKillThreshold(100)).toBeLessThanOrEqual(2);
  });

  it('caps floor traversal between floor 1 and the final floor', () => {
    expect(getAdjacentFloor(1, 'UP')).toBe(1);
    expect(getAdjacentFloor(1, 'DOWN')).toBe(2);
    expect(getAdjacentFloor(MAX_FLOOR, 'DOWN')).toBe(MAX_FLOOR);
    expect(getAdjacentFloor(MAX_FLOOR, 'UP')).toBe(MAX_FLOOR - 1);
  });

  it('finds random chest spawn tile that is walkable and not blocked', () => {
    const layout = [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ];
    const interactables = [
      { id: 's1', x: 1, y: 1, type: 'STAIRS', status: 'ACTIVE' as const },
      { id: 'e1', x: 2, y: 1, type: 'ENEMY', status: 'ACTIVE' as const },
      { id: 't1', x: 3, y: 1, type: 'TRAP', status: 'ACTIVE' as const }
    ];

    const tile = findLootChestSpawnTile(layout, interactables, { x: 2, y: 2 });
    expect(tile).not.toBeNull();
    if (tile) {
      expect(layout[tile.y][tile.x]).toBe(1);
      expect(tile.x === 2 && tile.y === 2).toBe(false);
      const occupied = interactables.some(i => i.x === tile.x && i.y === tile.y && i.status === 'ACTIVE');
      expect(occupied).toBe(false);
    }
  });

  it('returns null when no valid chest spawn tile exists', () => {
    const layout = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ];
    const interactables = [
      { id: 's1', x: 1, y: 1, type: 'STAIRS', status: 'ACTIVE' as const }
    ];
    const tile = findLootChestSpawnTile(layout, interactables, { x: 1, y: 1 });
    expect(tile).toBeNull();
  });
});
