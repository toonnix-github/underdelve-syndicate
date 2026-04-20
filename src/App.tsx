import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HeroTemplate, HERO_ROSTER } from './data/heroes';
import { ENEMY_POOL } from './data/enemies';
import { Item } from './types';
import { Button } from './components/UI';
import { RecruitPhase } from './components/RecruitPhase';
import { LeadershipPhase } from './components/LeadershipPhase';
import { DeploymentPhase } from './components/DeploymentPhase';
import { DungeonView } from './components/DungeonView';
import { BattleView } from './components/BattleView';
import { useDungeon } from './hooks/useDungeon';
import { Combatant } from './models/Combatant';
import { Settings } from 'lucide-react';
import { DEFAULT_FLOOR_SPAWN_RATES } from './utils/dungeonGenerator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { clsx } from 'clsx';

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
    const [vault, setVault] = useState<Item[]>([]);
    const [lastEncounterId, setLastEncounterId] = useState<string | null>(null);
    const [showAdminTools, setShowAdminTools] = useState(false);
    const [heroSearch, setHeroSearch] = useState('');
    const [showHeroDropdown, setShowHeroDropdown] = useState(false);
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
        dungeon.resetDungeon(1);
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
        
        setPhase('RECRUIT');
    };

    const handleRecruitComplete = (selectedTemplates: any[]) => {
        const fullParty = selectedTemplates.map(template => {
            const h = Combatant.fromTemplate(template, true);
            return sanitizeHero(h);
        });
        setParty(fullParty);
        setPhase('LEADERSHIP');
    };

    const handleLeadershipComplete = (leaderName: string) => {
        const updatedParty = party.map(h => {
            const next = sanitizeHero(h.clone());
            next.isLeader = (h.name === leaderName);
            return next;
        });
        setParty(updatedParty);
        setPhase('DEPLOYMENT');
    };

    const handleDeploymentComplete = (deployed: Combatant[]) => {
        const normalized = deployed.map(hero => sanitizeHero(hero.clone()));
        setParty(normalized);
        setPhase('EXPLORATION');
    };

    const handleDungeonEncounter = (pos: { x: number, y: number }) => {
        const floorMultiplier = 1 + (dungeon.floor - 1) * 0.2;
        const enemyCount = 1 + Math.floor(Math.random() * 3);
        const spawnableEnemies = ENEMY_POOL.filter(e => {
            const minFloor = (e as any).minFloor;
            return typeof minFloor === 'number' ? minFloor <= dungeon.floor : true;
        });
        const enemyPool = spawnableEnemies.length > 0 ? spawnableEnemies : ENEMY_POOL;
        const encounterEnemies = Array.from({ length: enemyCount }).map((_, idx) => {
            const template = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            const position = idx < Math.ceil(enemyCount / 2) ? 'VANGUARD' : 'REARGUARD';
            const enemy = Combatant.fromTemplate(template, false, position);
            enemy.maxHp = Math.floor(enemy.maxHp * floorMultiplier);
            enemy.hp = enemy.maxHp;
            enemy.power = Math.floor(enemy.power * floorMultiplier);
            enemy.def = Math.floor(enemy.def * floorMultiplier);
            enemy.speed = Math.floor(enemy.speed * floorMultiplier);
            return enemy;
        });
        setEnemies(encounterEnemies);
        setLastEncounterId(`${pos.x},${pos.y}`);
        setPhase('BATTLE');
    };

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

    const sanitizeHero = (hero: Combatant): Combatant => {
        // Ensure all rendered fields are primitives
        hero.name = String(hero.name || 'Unknown');
        const normalizedRole = String(hero.role || '').toUpperCase();
        hero.role = (normalizedRole === 'TANK' || normalizedRole === 'HEALER' || normalizedRole === 'DPS')
            ? normalizedRole
            : 'DPS';
        hero.imageId = String(hero.imageId || 'unknown');
        hero.job = String(hero.job || 'N/A');
        hero.race = String(hero.race || 'N/A');
        hero.hp = typeof hero.hp === 'number' ? hero.hp : hero.maxHp;
        return hero;
    };

    const handleBattleComplete = (victory: boolean, remainingHeroes?: Combatant[]) => {
        if (victory) {
            if (remainingHeroes) {
                // Sync HP and state from battle back to party
                const updatedParty = party.map(hp => {
                    const matched = remainingHeroes.find(rh => rh.name === hp.name);
                    return matched ? matched : hp;
                });
                setParty(updatedParty);
            }
            if (lastEncounterId) {
                dungeon.updateInteractable(lastEncounterId, { status: 'DISARMED' });
            }
            setPhase('EXPLORATION');
        } else {
            setPhase('GAME_OVER');
        }
    };

    const dungeon = useDungeon(1, party, adminSpawnRates);

    return (
        <ErrorBoundary>
            <div className="w-screen h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-cyan-500/30">
                {phase === 'MAIN_MENU' && (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <div className="absolute inset-0 z-0">
                            <img src="assets/bg_main_menu.png" className="w-full h-full object-cover opacity-60 grayscale-[0.8] contrast-125" alt="Background" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                        </div>
                        <div className="absolute top-5 right-5 z-20">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 px-2.5 text-[10px] text-zinc-400 border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md"
                                onClick={() => setShowAdminTools(true)}
                            >
                                <Settings className="w-3 h-3 mr-1.5" />
                                ADMIN
                            </Button>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-12 max-w-4xl w-full px-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                                    <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-cyan-500" />
                                    <span className="text-[10px] font-black tracking-[0.5em] text-cyan-500 uppercase italic">Established 2026</span>
                                    <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-cyan-500" />
                                </div>
                                <h1 className="text-8xl font-black italic tracking-tighter uppercase text-white animate-in zoom-in-95 duration-1000 leading-none flex flex-col items-center drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">Underdelve</span>
                                    <span className="text-4xl tracking-[0.25em] text-cyan-600 -mt-2 drop-shadow-[0_0_15px_rgba(8,145,178,0.5)]">Syndicate</span>
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 w-full max-w-xs gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                                <Button variant="primary" size="lg" className="w-full group relative overflow-hidden" onClick={startRun}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <span className="relative z-10 tracking-widest italic font-black">INITIALIZE EXPEDITION</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {phase === 'RECRUIT' && (
                    <RecruitPhase 
                        pool={draftPool} 
                        onFinalize={handleRecruitComplete} 
                        draftBg={draftBg}
                    />
                )}

                {phase === 'LEADERSHIP' && (
                    <LeadershipPhase 
                        draftHeroes={party} 
                        onFinalize={handleLeadershipComplete} 
                        draftBg={draftBg}
                    />
                )}

                {phase === 'DEPLOYMENT' && (
                    <DeploymentPhase 
                        heroes={party} 
                        onFinalize={handleDeploymentComplete} 
                    />
                )}

                {phase === 'EXPLORATION' && (
                    <DungeonView 
                        heroes={party} 
                        dungeonState={dungeon}
                        scrip={scrip}
                        vault={vault}
                        onEncounter={handleDungeonEncounter}
                        onStairs={(dir) => {
                            dungeon.changeFloor(dir);
                        }}
                        onTrap={(trap) => {
                            setParty(prev => prev.map(h => {
                                h.hp = Math.max(1, h.hp - 20);
                                return h;
                            }));
                        }}
                        onReward={(amount) => setScrip(s => s + amount)}
                        onVaultReward={(item) => {
                            const vItem = { ...item, id: `${item.name}-${Date.now()}` };
                            setVault(v => [...v, vItem]);
                        }}
                        onEquip={(heroId, item, slot) => {
                            const hero = party.find(h => h.id === heroId);
                            if (!hero) return;
                            hero.equip(item, slot);
                            setVault(v => v.filter(iv => iv.id !== item.id));
                            setParty([...party]);
                        }}
                        onUnequip={(heroId, slot) => {
                            const hero = party.find(h => h.id === heroId);
                            if (!hero) return;
                            const item = hero.equipment[slot];
                            if (!item) return;
                            hero.unequip(slot);
                            setVault(v => [...v, { ...item, id: `${item.name}-${Date.now()}` }]);
                            setParty([...party]);
                        }}
                    />
                )}

                {phase === 'BATTLE' && (
                    <BattleView 
                        heroes={party} 
                        enemies={enemies} 
                        onVictory={(rh) => handleBattleComplete(true, rh)}
                        onDefeat={() => handleBattleComplete(false)} 
                    />
                )}

                {phase === 'GAME_OVER' && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-zinc-950 animate-in fade-in duration-1000">
                        <div className="text-center space-y-2">
                            <h2 className="text-6xl font-black text-rose-600 uppercase italic tracking-tighter">Expedition Failed</h2>
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em]">All assets compromised in Sector V.1</p>
                        </div>
                        <Button variant="primary" size="lg" onClick={() => window.location.reload()}>REBOOT SYNDICATION</Button>
                    </div>
                )}

                {/* Admin Tools Overlay */}
                {showAdminTools && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
                        <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center p-5 border-b border-zinc-800 bg-zinc-950/50">
                                <div>
                                    <h3 className="text-lg font-black italic tracking-tight uppercase text-white flex items-center gap-2.5">
                                        <Settings className="text-cyan-500" /> Admin <span className="text-cyan-500">Protocols</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">System level overrides & debugging state</p>
                                </div>
                                <button onClick={() => setShowAdminTools(false)} className="w-10 h-10 rounded-full hover:bg-zinc-800 flex items-center justify-center transition-colors">
                                    <X className="text-zinc-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest italic">Expedition Forcing</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                Forced Heroes In Recruit Pool
                                            </label>
                                            <span className="text-[10px] font-black text-zinc-300">
                                                {adminSettings.forcedHeroNames.length}/5
                                            </span>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="SEARCH ASSET DATABASE..."
                                            value={heroSearch}
                                            onChange={(e) => {
                                                setHeroSearch(e.target.value);
                                                setShowHeroDropdown(true);
                                            }}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold uppercase focus:border-cyan-500 outline-none"
                                        />
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {adminSettings.forcedHeroNames.map(name => (
                                                <button 
                                                    key={String(name)}
                                                    onClick={() => setAdminSettings(prev => ({
                                                        ...prev,
                                                        forcedHeroNames: prev.forcedHeroNames.filter(n => n !== name)
                                                    }))}
                                                    className="bg-cyan-600/10 border border-cyan-500/30 text-cyan-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"
                                                >
                                                    {String(name)} <X size={10} />
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowHeroDropdown(prev => !prev)}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950/60 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition"
                                        >
                                            <span>Hero List</span>
                                            <span>{showHeroDropdown ? '▲' : '▼'}</span>
                                        </button>
                                        {showHeroDropdown && (
                                            <div className="max-h-40 overflow-y-auto border border-zinc-800 rounded-lg bg-zinc-950/60 p-2 space-y-1">
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
                                                            className={clsx(
                                                                "w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold tracking-wide transition uppercase",
                                                                selected
                                                                    ? "bg-cyan-600/15 border border-cyan-500/40 text-cyan-300"
                                                                    : "bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 border border-transparent",
                                                                !selected && atLimit && "opacity-40 cursor-not-allowed"
                                                            )}
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
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest italic">Encounter Percentages</h4>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                    Enemy Rate
                                                </label>
                                                <span className="text-[10px] font-black text-cyan-300">
                                                    {adminSettings.enemyRate}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={adminSettings.enemyRate}
                                                onChange={(e) => {
                                                    const value = clampRate(Number(e.target.value));
                                                    setAdminSettings(prev => ({ ...prev, enemyRate: value }));
                                                }}
                                                className="w-full accent-cyan-500"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                    Trap Rate
                                                </label>
                                                <span className="text-[10px] font-black text-amber-300">
                                                    {adminSettings.trapRate}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={adminSettings.trapRate}
                                                onChange={(e) => {
                                                    const value = clampRate(Number(e.target.value));
                                                    setAdminSettings(prev => ({ ...prev, trapRate: value }));
                                                }}
                                                className="w-full accent-amber-500"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                                    Loot Rate
                                                </label>
                                                <span className="text-[10px] font-black text-emerald-300">
                                                    {adminSettings.lootRate}%
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={1}
                                                value={adminSettings.lootRate}
                                                onChange={(e) => {
                                                    const value = clampRate(Number(e.target.value));
                                                    setAdminSettings(prev => ({ ...prev, lootRate: value }));
                                                }}
                                                className="w-full accent-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                                <button onClick={() => { localStorage.removeItem(ADMIN_SETTINGS_KEY); setAdminSettings(DEFAULT_ADMIN_SETTINGS); }} className="text-[10px] font-black text-rose-500 uppercase">RESET DEFAULTS</button>
                                <Button onClick={() => setShowAdminTools(false)} variant="primary" size="sm" className="px-7">UPDATE</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

const X = ({ className, size }: { className?: string; size?: number }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

export default App;
