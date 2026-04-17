const assert = require('assert');
const { generateFloor } = require('./dungeon-generator.js');

const SIZE = 9;
const CENTER = Math.floor(SIZE / 2);

function reachableSet(layout) {
  const q = [[CENTER, CENTER]];
  const seen = new Set([`${CENTER},${CENTER}`]);
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  while (q.length) {
    const [x,y] = q.shift();
    for (const [dx,dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (nx < 1 || nx >= SIZE-1 || ny < 1 || ny >= SIZE-1) continue;
      if (seen.has(key)) continue;
      if (layout[ny][nx] !== 1) continue;
      seen.add(key);
      q.push([nx,ny]);
    }
  }
  return seen;
}

function quotaForFloor(floor) {
  return {
    stairsDown: 1,
    traps: Math.min(1 + floor, 4),
    chests: floor >= 3 ? 2 : 1,
    stairsUp: floor > 1 ? 1 : 0,
  };
}

for (let floor = 1; floor <= 5; floor++) {
  for (let i = 0; i < 50; i++) {
    const result = generateFloor({ size: SIZE, centerTile: CENTER, floor });
    const { layout, interactables } = result;

    assert.strictEqual(layout.length, SIZE, `layout row size floor ${floor}`);
    assert.strictEqual(layout[0].length, SIZE, `layout col size floor ${floor}`);
    assert.strictEqual(layout[CENTER][CENTER], 1, `center must be walkable floor ${floor}`);

    const reachable = reachableSet(layout);
    const quotas = quotaForFloor(floor);

    const stairsDown = interactables.filter(r => r.type === 'STAIRS');
    const traps = interactables.filter(r => r.type === 'TRAP');
    const chests = interactables.filter(r => r.type === 'CHEST');
    const stairsUp = interactables.filter(r => r.type === 'PREV_FLOOR');

    assert.strictEqual(stairsDown.length, quotas.stairsDown, `stairs down quota floor ${floor}`);
    assert.strictEqual(traps.length, quotas.traps, `trap quota floor ${floor}`);
    assert.strictEqual(chests.length, quotas.chests, `chest quota floor ${floor}`);
    assert.strictEqual(stairsUp.length, quotas.stairsUp, `stairs up quota floor ${floor}`);

    interactables.forEach((room) => {
      if (room.type === 'PREV_FLOOR') {
        assert.strictEqual(room.x, CENTER, `stairs up x at center floor ${floor}`);
        assert.strictEqual(room.y, CENTER, `stairs up y at center floor ${floor}`);
        return;
      }
      assert.strictEqual(layout[room.y][room.x], 1, `special room on walkable tile floor ${floor}`);
      assert.ok(reachable.has(`${room.x},${room.y}`), `special room reachable floor ${floor}`);
    });
  }
}

console.log('Dungeon generator tests passed.');
