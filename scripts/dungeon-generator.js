(function (root) {
  const TRAP_TYPES = ['SPIKES', 'ACID', 'BLADES'];

  const weightedDoorCount = () => {
    const roll = Math.random() * 100;
    if (roll < 70) return 4;
    if (roll < 90) return 3;
    if (roll < 98) return 2;
    return 1;
  };

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const makeId = (prefix, idx) => `${prefix}_${idx}`;

  function generateFloor({ size, centerTile, floor }) {
    const layout = Array(size).fill().map(() => Array(size).fill(0));
    const inBounds = (x, y) => x >= 1 && x < size - 1 && y >= 1 && y < size - 1;
    const key = (x, y) => `${x},${y}`;
    const dirs = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];

    const targetRooms = Math.min((size - 2) * (size - 2), 18 + (floor * 4));
    const carved = new Set([key(centerTile, centerTile)]);
    const frontier = [{ x: centerTile, y: centerTile }];
    const desiredDoors = { [key(centerTile, centerTile)]: 4 };
    const currentDoors = { [key(centerTile, centerTile)]: 0 };

    layout[centerTile][centerTile] = 1;

    while (carved.size < targetRooms && frontier.length > 0) {
      const room = frontier[Math.floor(Math.random() * frontier.length)];
      const roomKey = key(room.x, room.y);
      if (!desiredDoors[roomKey]) desiredDoors[roomKey] = weightedDoorCount();
      if (!currentDoors[roomKey]) currentDoors[roomKey] = 0;

      const possible = shuffle(dirs)
        .map(d => ({ x: room.x + d.x, y: room.y + d.y }))
        .filter(n => inBounds(n.x, n.y));

      let expanded = false;
      for (const n of possible) {
        if (currentDoors[roomKey] >= desiredDoors[roomKey] || carved.size >= targetRooms) break;
        const nKey = key(n.x, n.y);

        if (!carved.has(nKey)) {
          carved.add(nKey);
          layout[n.y][n.x] = 1;
          frontier.push({ x: n.x, y: n.y });
          desiredDoors[nKey] = weightedDoorCount();
          currentDoors[nKey] = 1;
          currentDoors[roomKey] += 1;
          expanded = true;
        } else if ((currentDoors[nKey] || 0) < (desiredDoors[nKey] || 1)) {
          currentDoors[nKey] += 1;
          currentDoors[roomKey] += 1;
          expanded = true;
        }
      }

      const shouldRetire = !expanded || currentDoors[roomKey] >= desiredDoors[roomKey];
      if (shouldRetire) {
        const idx = frontier.findIndex(f => f.x === room.x && f.y === room.y);
        if (idx >= 0) frontier.splice(idx, 1);
      }

      if (frontier.length === 0 && carved.size < targetRooms) {
        // Safety valve: restart growth from an existing carved room
        const any = Array.from(carved)[Math.floor(Math.random() * carved.size)].split(',').map(Number);
        frontier.push({ x: any[0], y: any[1] });
      }
    }

    // Reachability pass from spawn
    const queue = [{ x: centerTile, y: centerTile }];
    const seen = new Set([key(centerTile, centerTile)]);
    const reachable = [];

    while (queue.length > 0) {
      const cur = queue.shift();
      for (const d of dirs) {
        const nx = cur.x + d.x;
        const ny = cur.y + d.y;
        const nKey = key(nx, ny);
        if (!inBounds(nx, ny) || seen.has(nKey) || layout[ny][nx] !== 1) continue;
        seen.add(nKey);
        reachable.push({ x: nx, y: ny });
        queue.push({ x: nx, y: ny });
      }
    }

    const openTiles = shuffle(reachable);
    const pullTile = () => openTiles.length > 0 ? openTiles.pop() : { x: centerTile, y: centerTile };
    const pullClosestTile = (maxDistance = 2) => {
      const idx = openTiles.findIndex(tile => (Math.abs(tile.x - centerTile) + Math.abs(tile.y - centerTile)) <= maxDistance);
      if (idx < 0) return pullTile();
      const [picked] = openTiles.splice(idx, 1);
      return picked;
    };

    const trapQuota = Math.min(1 + floor, 4);
    const treasureQuota = floor >= 3 ? 2 : 1;
    const interactables = [];

    interactables.push({ id: 'stairs_down', ...(floor === 1 ? pullClosestTile(1) : pullTile()), type: 'STAIRS' });

    for (let i = 0; i < trapQuota; i++) {
      interactables.push({
        id: makeId('trap', i + 1),
        ...(floor === 1 ? pullClosestTile(2) : pullTile()),
        type: 'TRAP',
        trapType: TRAP_TYPES[Math.floor(Math.random() * TRAP_TYPES.length)],
        status: 'ACTIVE'
      });
    }

    for (let i = 0; i < treasureQuota; i++) {
      interactables.push({ id: makeId('chest', i + 1), ...(floor === 1 ? pullClosestTile(3) : pullTile()), type: 'CHEST' });
    }

    if (floor > 1) {
      interactables.push({ id: 'stairs_up', x: centerTile, y: centerTile, type: 'PREV_FLOOR' });
    }

    return {
      layout,
      interactables,
      availableTiles: openTiles
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateFloor };
  }

  if (root && typeof root === 'object') {
    root.DungeonGenerator = { generateFloor };
  }
})(typeof window !== 'undefined' ? window : globalThis);
