import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Combatant } from './models/Combatant';
import { HERO_ROSTER } from './data/heroes';
import { ENEMY_POOL } from './data/enemies';
import { Button } from './components/UI';
import { RecruitPhase } from './components/RecruitPhase';
import { LeadershipPhase } from './components/LeadershipPhase';
import { DeploymentPhase } from './components/DeploymentPhase';
import { DungeonView } from './components/DungeonView';
import { BattleView } from './components/BattleView';
import { useDungeon } from './hooks/useDungeon';
import { Settings } from 'lucide-react';
import { DEFAULT_FLOOR_SPAWN_RATES } from './utils/dungeonGenerator';

type GamePhase = 'MAIN_MENU' | 'RECRUIT' | 'LEADERSHIP' | 'DEPLOYMENT' | 'EXPLORATION' | 'BATTLE' | 'GAME_OVER';

type AdminSettings = {
    forcedHeroNames: string[];
    enemyRate: number;
    trapRate: number;
    lootRate: number;
};

const ADMIN_SETTINGS_KEY = 'underdelve_admin_settings_v1';

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
    forcedHeroNames: [],
    enemyRate: DEFAULT_FLOOR_SPAWN_RATES.enemyRate,
    trapRate: DEFAULT_FLOOR_SPAWN_RATES.trapRate,
    lootRate: DEFAULT_FLOOR_SPAWN_RATES.lootRate
};

const clampRate = (value: number) => Math.max(0, Math.min(100, Math.floor(value)));

const App: React.FC = () => {
    const [phase, setPhase] = useState<GamePhase>('MAIN_MENU');
    const [party, setParty] = useState<Combatant[]>([]);
    const [enemies, setEnemies] = useState<Combatant[]>([]);
    const [draftPool, setDraftPool] = useState<any[]>([]);
    const [draftBg, setDraftBg] = useState<string | null>(null);
    const [scrip, setScrip] = useState(2500);
    const [vault, setVault] = useState<string[]>([]);
    const [lastEncounterId, setLastEncounterId] = useState<string | null>(null);
    const [showAdminTools, setShowAdminTools] = useState(false);
    const [heroSearch, setHeroSearch] = useState('');
    const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
        try {
            const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
            if (!raw) return DEFAULT_ADMIN_SETTINGS;
            const parsed = JSON.parse(raw);
            const forcedHeroNames = Array.isArray(parsed.forcedHeroNames)
                ? parsed.forcedHeroNames.filter((name: unknown) => typeof name === 'string').slice(0, 5)
                : [];
            return {
                forcedHeroNames,
                enemyRate: clampRate(Number(parsed.enemyRate ?? DEFAULT_ADMIN_SETTINGS.enemyRate)),
                trapRate: clampRate(Number(parsed.trapRate ?? DEFAULT_ADMIN_SETTINGS.trapRate)),
                lootRate: clampRate(Number(parsed.lootRate ?? DEFAULT_ADMIN_SETTINGS.lootRate))
            };
        } catch {
            return DEFAULT_ADMIN_SETTINGS;
        }
    });

    useEffect(() => {
        localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(adminSettings));
    }, [adminSettings]);

    const adminSpawnRates = useMemo(() => ({
        enemyRate: adminSettings.enemyRate,
        trapRate: adminSettings.trapRate,
        lootRate: adminSettings.lootRate
    }), [adminSettings.enemyRate, adminSettings.trapRate, adminSettings.lootRate]);

    const filteredHeroes = useMemo(() => {
        const q = heroSearch.trim().toLowerCase();
        if (!q) return HERO_ROSTER;
        return HERO_ROSTER.filter(hero => hero.name.toLowerCase().includes(q));
    }, [heroSearch]);

    const selectedForcedHeroes = useMemo(
        () => HERO_ROSTER.filter(hero => adminSettings.forcedHeroNames.includes(hero.name)),
        [adminSettings.forcedHeroNames]
    );

    const startRun = () => {
        const forcedHeroes = HERO_ROSTER
            .filter(h => adminSettings.forcedHeroNames.includes(h.name))
            .slice(0, 5);
        const forcedHeroNamesSet = new Set(forcedHeroes.map(h => h.name));
        const randomPool = [...HERO_ROSTER]
            .filter(h => !forcedHeroNamesSet.has(h.name))
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.max(0, 5 - forcedHeroes.length));
        const pool = [...forcedHeroes, ...randomPool].slice(0, 5).sort(() => 0.5 - Math.random());
        setDraftPool(pool);
        
        // Randomize background
        const bgIdx = Math.floor(Math.random() * 3) + 1;
        setDraftBg(`assets/bg_draft_${bgIdx}.png`);
        
        setParty([]);
        setScrip(2500);
        setVault([]);
        resetDungeon(1);
        setPhase('RECRUIT');
    };

    const handleRecruitFinalize = (selected: any[]) => {
        const combatants = selected.map(h => 
            new Combatant(h.name, h.role, h.hp, h.spd, h.atk, h.def, h.imageId, h.skills, 'VANGUARD', true, h.trait)
        );
        setParty(combatants);
        setPhase('LEADERSHIP');
    };

    const handleLeadershipFinalize = (leaderName: string) => {
        setParty(prev => prev.map(h => {
            const next = h.clone();
            next.isLeader = h.name === leaderName;
            return next;
        }));
        setPhase('DEPLOYMENT');
    };

    const handleDeploymentFinalize = (deployed: Combatant[]) => {
        setParty(deployed);
        setPhase('EXPLORATION');
    };

    const { floor, playerPos, exploredCells, dungeonData, movePlayer, getScoutedCells, changeFloor, updateInteractable, resetDungeon } = useDungeon(1, party, adminSpawnRates);

    const handleEncounter = useCallback((pos: any) => {
        // Find encounter ID to persist victory
        const encounter = dungeonData.interactables.find(i => i.x === pos.x && i.y === pos.y);
        if (encounter) setLastEncounterId(encounter.id);

        const numEnemies = Math.floor(Math.random() * 2) + 1;
        const newEnemies = Array.from({ length: numEnemies }).map((_, i) => {
            const proto = ENEMY_POOL[Math.floor(Math.random() * ENEMY_POOL.length)];
            return new Combatant(
                proto.name,
                proto.role ?? 'DPS',
                proto.hp,
                proto.spd,
                proto.pwr,
                proto.def,
                proto.img,
                proto.skills,
                i === 0 ? 'VANGUARD' : 'REARGUARD',
                false
            );
        });
        setEnemies(newEnemies);
        setPhase('BATTLE');
    }, [dungeonData.interactables]);

    const handleTrap = useCallback((interactable: any) => {
        const trapType = interactable.trapType;
        let damage = 5;
        if (trapType === 'SPIKES') damage = 10;
        if (trapType === 'ACID') damage = 15;
        if (trapType === 'BLADES') damage = 20;

        setParty(prev => prev.map(hero => {
            const nextHero = hero.clone();
            nextHero.hp = Math.max(0, hero.hp - damage);
            return nextHero;
        }));
    }, []);

    const handleReward = useCallback((amount: number) => {
        setScrip(prev => prev + amount);
    }, []);

    const handleToggleForcedHero = (heroName: string) => {
        setAdminSettings(prev => {
            const alreadyPicked = prev.forcedHeroNames.includes(heroName);
            if (alreadyPicked) {
                return { ...prev, forcedHeroNames: prev.forcedHeroNames.filter(name => name !== heroName) };
            }
            if (prev.forcedHeroNames.length >= 5) return prev;
            return { ...prev, forcedHeroNames: [...prev.forcedHeroNames, heroName] };
        });
    };

    const handleResetAdminSettings = () => {
        setAdminSettings(DEFAULT_ADMIN_SETTINGS);
    };

    return (
        <div className="w-full h-full bg-black text-zinc-100 flex flex-col items-center justify-center relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
                {phase === 'MAIN_MENU' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                        <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-3">
                            <Button
                                variant="secondary"
                                className="gap-2"
                                onClick={() => setShowAdminTools(prev => !prev)}
                            >
                                <Settings size={14} />
                                ADMIN TOOLS
                            </Button>
                            {showAdminTools && (
                                <div className="w-[340px] bg-zinc-950/95 border border-zinc-800 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.45)] space-y-3">
                                    <div className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">Recruit Control</div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Forced Heroes In Recruit Pool</label>
                                            <span className="text-[10px] font-black text-zinc-300">{adminSettings.forcedHeroNames.length}/5</span>
                                        </div>
                                        <div className="w-full min-h-8 rounded-md bg-zinc-900 border border-zinc-700 px-2 py-1 flex flex-wrap items-center gap-1 focus-within:border-zinc-500">
                                            {selectedForcedHeroes.map(hero => (
                                                <span
                                                    key={hero.name}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 text-[10px] font-black tracking-wide"
                                                >
                                                    {hero.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleForcedHero(hero.name)}
                                                        className="text-zinc-800 hover:text-black leading-none"
                                                        aria-label={`Remove ${hero.name}`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                value={heroSearch}
                                                onChange={(e) => setHeroSearch(e.target.value)}
                                                placeholder={selectedForcedHeroes.length ? 'Search more...' : 'Search hero...'}
                                                className="flex-1 min-w-[120px] h-6 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="max-h-36 overflow-y-auto border border-zinc-800 rounded-md bg-zinc-900/60 p-2 space-y-1">
                                            {filteredHeroes.map(hero => {
                                                const selected = adminSettings.forcedHeroNames.includes(hero.name);
                                                const atLimit = adminSettings.forcedHeroNames.length >= 5;
                                                return (
                                                    <button
                                                        key={hero.name}
                                                        type="button"
                                                        onClick={() => {
                                                            handleToggleForcedHero(hero.name);
                                                            if (!selected) setHeroSearch('');
                                                        }}
                                                        disabled={!selected && atLimit}
                                                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-bold tracking-wide transition ${
                                                            selected
                                                                ? 'bg-zinc-200 text-zinc-900'
                                                                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700'
                                                        } ${!selected && atLimit ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    >
                                                        {hero.name}
                                                    </button>
                                                );
                                            })}
                                            {filteredHeroes.length === 0 && (
                                                <div className="px-2 py-2 text-[11px] font-semibold text-zinc-500">
                                                    No heroes found.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-2 text-[11px] font-black tracking-widest text-zinc-400 uppercase">Floor Spawn Rates</div>
                                    {[
                                        { key: 'enemyRate', label: 'Enemy %' },
                                        { key: 'trapRate', label: 'Trap %' },
                                        { key: 'lootRate', label: 'Loot %' }
                                    ].map(field => (
                                        <div key={field.key} className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{field.label}</label>
                                                <span className="text-[11px] font-black text-zinc-200">
                                                    {adminSettings[field.key as keyof AdminSettings]}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                value={adminSettings[field.key as keyof AdminSettings] as number}
                                                onChange={(e) => {
                                                    const value = clampRate(Number(e.target.value));
                                                    setAdminSettings(prev => ({ ...prev, [field.key]: value }));
                                                }}
                                                className="w-full accent-zinc-300"
                                            />
                                        </div>
                                    ))}
                                    <div className="pt-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={handleResetAdminSettings}
                                        >
                                            RESET
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-center space-y-4">
                            <h1 className="text-8xl font-black tracking-tighter text-zinc-50 leading-tight">
                                UNDERDELVE<br/>
                                <span className="bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">SYNDICATE</span>
                            </h1>
                            <p className="max-w-md mx-auto text-zinc-500 text-lg font-medium leading-relaxed">
                                Lead your syndicate through the sunless depths.
                            </p>
                        </div>
                        <Button size="lg" className="px-12 py-8 text-2xl tracking-tighter" onClick={startRun}>
                            BEGIN EXPEDITION
                        </Button>
                    </div>
                )}

                {phase === 'RECRUIT' && (
                    <RecruitPhase 
                        pool={draftPool} 
                        onFinalize={handleRecruitFinalize} 
                        draftBg={draftBg} 
                    />
                )}

                {phase === 'LEADERSHIP' && (
                    <LeadershipPhase 
                        draftHeroes={party} 
                        onFinalize={handleLeadershipFinalize} 
                        draftBg={draftBg} 
                    />
                )}

                {phase === 'DEPLOYMENT' && (
                    <DeploymentPhase 
                        heroes={party} 
                        onFinalize={handleDeploymentFinalize} 
                    />
                )}

                {phase === 'EXPLORATION' && (
                    <DungeonView 
                        heroes={party} 
                        dungeonState={{ 
                            floor, playerPos, exploredCells, dungeonData, 
                            movePlayer, getScoutedCells, changeFloor, 
                            updateInteractable 
                        }}
                        scrip={scrip}
                        vault={vault}
                        onEncounter={handleEncounter} 
                        onStairs={changeFloor} 
                        onTrap={handleTrap} 
                        onReward={handleReward}
                    />
                )}

                {phase === 'BATTLE' && (
                    <BattleView 
                        heroes={party} 
                        enemies={enemies} 
                        onVictory={(rem) => { 
                            setParty(rem); 
                            if (lastEncounterId) {
                                updateInteractable(lastEncounterId, { status: 'DISARMED' });
                            }
                            setPhase('EXPLORATION'); 
                        }} 
                        onDefeat={() => setPhase('GAME_OVER')} 
                    />
                )}

                {phase === 'GAME_OVER' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                        <h2 className="text-9xl font-black text-red-600 tracking-tighter italic uppercase">Expedition Terminated</h2>
                        <Button size="lg" onClick={() => setPhase('MAIN_MENU')}>RESTART SYNDICATE</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
