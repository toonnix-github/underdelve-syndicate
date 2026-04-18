import { HeroDefinition, LeaderPerk } from '../types/game';

export const HERO_ROSTER: HeroDefinition[] = [
    { name: 'Valerius', hp: 140, atk: 8, def: 18, spd: 10, role: 'TANK', imageId: 'hero_valerius', trait: {id: 'iron_aura', name: 'Aura of Iron', description: 'Global 10% damage reduction for party'}, skills: [{name: 'Shield Slam', val: 12, type: 'damage'}, {name: 'Fortify', val: 15, type: 'heal'}] },
    { name: 'Slyn', hp: 75, atk: 22, def: 6, spd: 28, role: 'DPS', imageId: 'hero_slyn', trait: {id: 'infiltrator', name: 'Infiltrator', description: 'Can target any enemy, ignoring Vanguard'}, skills: [{name: 'Backstab', val: 35, type: 'damage'}, {name: 'Shadow Dash', val: 20, type: 'damage'}] },
    { name: 'Morgra', hp: 110, atk: 12, def: 14, spd: 14, role: 'HEALER', imageId: 'hero_morgra', trait: {id: 'blood_rite', name: 'Blood Rite', description: 'Heals 5 HP to party after killing an enemy'}, skills: [{name: 'Mend', val: 25, type: 'heal'}, {name: 'Siphon', val: 15, type: 'damage'}] },
    { name: 'Krix', hp: 90, atk: 18, def: 10, spd: 20, role: 'DPS', imageId: 'hero_krix', trait: {id: 'clockwork', name: 'Clockwork', description: '+5 Speed for 2 turns after using a skill'}, skills: [{name: 'Sonic Blast', val: 28, type: 'damage'}, {name: 'Overcharge', val: 40, type: 'damage'}] },
    { name: 'Draka', hp: 160, atk: 10, def: 20, spd: 6, role: 'TANK', imageId: 'hero_draka', trait: {id: 'dragon_scale', name: 'Dragon Scale', description: 'Immune to Burn and Acid status effects'}, skills: [{name: 'Fire Breath', val: 20, type: 'damage'}, {name: 'Taunt', val: 0, type: 'damage'}] },
    { name: 'Vex', hp: 80, atk: 24, def: 4, spd: 26, role: 'DPS', imageId: 'hero_vex', trait: {id: 'soul_collector', name: 'Soul Collector', description: '+2 Attack for each enemy killed this run'}, skills: [{name: 'Reap', val: 45, type: 'damage'}, {name: 'Death Mark', val: 0, type: 'damage'}] },
    { name: 'Leora', hp: 100, atk: 16, def: 12, spd: 18, role: 'DPS', imageId: 'hero_leora', trait: {id: 'eagle_eye', name: 'Eagle Eye', description: 'Basic attacks ignore 50% of target defense'}, skills: [{name: 'Snipe', val: 38, type: 'damage'}, {name: 'Scout', val: 0, type: 'damage'}] },
    { name: 'Lira', hp: 95, atk: 10, def: 10, spd: 24, role: 'HEALER', imageId: 'hero_lira', trait: {id: 'harmony', name: 'Harmony', description: '+15% Speed to all allies while Lira is above 50% HP'}, skills: [{name: 'Song of Hope', val: 30, type: 'heal'}, {name: 'Dazzle', val: 10, type: 'damage'}] },
    { name: 'Borum', hp: 130, atk: 14, def: 15, spd: 12, role: 'TANK', imageId: 'hero_borum', trait: {id: 'unyielding', name: 'Unyielding', description: 'Gain 5 Defense when HP drops below 40%'}, skills: [{name: 'Hammer Crash', val: 22, type: 'damage'}, {name: 'Endure', val: 20, type: 'heal'}] },
    { name: 'Valthea', hp: 115, atk: 18, def: 16, spd: 16, role: 'DPS', imageId: 'hero_valthea', trait: {id: 'vanguard_stance', name: 'Vanguard Stance', description: '+20% Defense when in Vanguard position'}, skills: [{name: 'Justice Strike', val: 32, type: 'damage'}, {name: 'Aura of Zeal', val: 20, type: 'heal'}] },
    { name: 'Elara', hp: 90, atk: 14, def: 20, spd: 12, role: 'HEALER', imageId: 'hero_elara', trait: {id: 'divine_shield', name: 'Divine Shield', description: 'Start each battle with a 15 HP temporary shield'}, skills: [{name: 'Sanctify', val: 35, type: 'heal'}, {name: 'Smite', val: 20, type: 'damage'}] },
    { name: 'Grimm', hp: 125, atk: 20, def: 12, spd: 14, role: 'DPS', imageId: 'hero_grimm', trait: {id: 'lucky_find', name: 'Lucky Find', description: '+10% chance to find double credits'}, skills: [{name: 'Cleave', val: 28, type: 'damage'}, {name: 'Berserk', val: 50, type: 'damage'}] },
    { name: 'Kael', hp: 85, atk: 18, def: 22, spd: 10, role: 'DPS', imageId: 'hero_kael', trait: {id: 'steady_aim', name: 'Steady Aim', description: '+25% damage to Rearguard targets'}, skills: [{name: 'Twin Arrow', val: 30, type: 'damage'}, {name: 'Steady Aim', val: 35, type: 'damage'}] }
];

export const LEADER_PERKS: Record<string, LeaderPerk> = {
    'Valerius': { id: 'tactician', name: 'Tactician', perk: '+15% Party DEF' },
    'Slyn': { id: 'navigator', name: 'Navigator', perk: 'Reveals path to Sector Exit' },
    'Morgra': { id: 'blood_priest', name: 'Blood Priest', perk: 'Party heals 5% HP per turn in battle' },
    'Krix': { id: 'engineer', name: 'Engineer', perk: '+100 Credits per trap disarm' },
    'Draka': { id: 'warden', name: 'Warden', perk: '20% Trap Damage Resistance' },
    'Vex': { id: 'soul_harvester', name: 'Soul Harvester', perk: '+10% ATK for floor after Elites' },
    'Leora': { id: 'scout', name: 'Scout', perk: 'Advanced Scouting (2-tile radius)' },
    'Lira': { id: 'bard', name: 'Bard', perk: '+10% Party Speed' },
    'Borum': { id: 'quartermaster', name: 'Quartermaster', perk: '+25% Rare+ Loot chance' },
    'Valthea': { id: 'commander', name: 'Commander', perk: '+15% Vanguard ATK' },
    'Elara': { id: 'oracle', name: 'Oracle', perk: 'Reveals Boss location on floor start' },
    'Kael': { id: 'marksman', name: 'Marksman', perk: 'Ignore 15% DEF vs Rearguard' },
    'Grimm': { id: 'wealth_seeker', name: 'Wealth Seeker', perk: '+20% Credits found' }
};
