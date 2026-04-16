/**
 * UNIT TESTS FOR HERO DRAFTING LOGIC (TICKET-41)
 * Run this with: node scripts/test_hero_logic.js
 */

const assert = require('assert');

// --- DATA DEFINITION (Mocked from stats table) ---
const HERO_ROSTER = [
    { name: 'Valerius', hp: 140, atk: 8, def: 18, spd: 10, role: 'TANK' },
    { name: 'Slyn', hp: 75, atk: 22, def: 6, spd: 28, role: 'DPS' },
    { name: 'Morgra', hp: 95, atk: 12, def: 12, spd: 15, role: 'HEALER' },
    { name: 'Krix', hp: 80, atk: 18, def: 10, spd: 22, role: 'DPS' },
    { name: 'Draka', hp: 160, atk: 12, def: 20, spd: 6, role: 'TANK' },
    { name: 'Vex', hp: 85, atk: 24, def: 8, spd: 18, role: 'DPS' },
    { name: 'Leora', hp: 70, atk: 26, def: 5, spd: 25, role: 'DPS' },
    { name: 'Grimm', hp: 110, atk: 14, def: 15, spd: 12, role: 'TANK' },
    { name: 'Lira', hp: 85, atk: 10, def: 10, spd: 20, role: 'HEALER' },
    { name: 'Borum', hp: 100, atk: 20, def: 12, spd: 8, role: 'DPS' },
    { name: 'Valthea', hp: 120, atk: 10, def: 15, spd: 12, role: 'TANK' },
    { name: 'Elara', hp: 70, atk: 14, def: 15, spd: 6, role: 'HEALER' },
    { name: 'Kael', hp: 85, atk: 18, def: 22, spd: 10, role: 'DPS' }
];

// --- LOGIC TO TEST ---
const HeroDraftEngine = {
    generateDraftPool(roster, poolSize = 5) {
        if (roster.length < poolSize) throw new Error("Not enough heroes in roster");
        return [...roster].sort(() => Math.random() - 0.5).slice(0, poolSize);
    },

    validateSelection(selectedIds) {
        return selectedIds.length === 3;
    },

    initializeHero(heroDef, position) {
        return {
            ...heroDef,
            maxHp: heroDef.hp,
            hp: heroDef.hp,
            atb: 0,
            positionLine: position || 'VANGUARD'
        };
    }
};

// --- TEST SUITE ---
function runTests() {
    console.log("🧪 Running HeroDraftEngine Tests...");

    // Test 1: Pool Generation
    const pool = HeroDraftEngine.generateDraftPool(HERO_ROSTER);
    assert.strictEqual(pool.length, 5, "Pool size must be exactly 5");
    assert.strictEqual(new Set(pool.map(p => p.name)).size, 5, "Pool should contain unique heroes");
    console.log("✅ Pool Generation Passed");

    // Test 2: Randomized Pool
    const pool2 = HeroDraftEngine.generateDraftPool(HERO_ROSTER);
    const names1 = pool.map(p => p.name).sort().join(',');
    const names2 = pool2.map(p => p.name).sort().join(',');
    // Note: statistically could be the same, but very unlikely (C(13,5) = 1287)
    assert.notStrictEqual(names1, names2, "Pools should be randomized (Statistically unlikely to be identical)");
    console.log("✅ Pool Randomization Passed");

    // Test 3: Selection Validation
    assert.strictEqual(HeroDraftEngine.validateSelection(['h1', 'h2', 'h3']), true, "3 heroes is valid");
    assert.strictEqual(HeroDraftEngine.validateSelection(['h1', 'h2']), false, "< 3 is invalid");
    assert.strictEqual(HeroDraftEngine.validateSelection(['h1', 'h2', 'h3', 'h4']), false, "> 3 is invalid");
    console.log("✅ Selection Validation Passed");

    // Test 4: Stat Initialization
    const valeriusDef = HERO_ROSTER[0];
    const unit = HeroDraftEngine.initializeHero(valeriusDef, 'REARGUARD');
    assert.strictEqual(unit.hp, 140, "HP should match base stat");
    assert.strictEqual(unit.maxHp, 140, "maxHp should be set");
    assert.strictEqual(unit.positionLine, 'REARGUARD', "Position should be correctly assigned");
    console.log("✅ Stat Initialization Passed");

    console.log("\n⭐️ ALL TESTS PASSED SUCCESSFULLY");
}

try {
    runTests();
} catch (err) {
    console.error("❌ TEST FAILED:", err.message);
    process.exit(1);
}
