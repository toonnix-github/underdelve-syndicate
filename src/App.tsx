import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HeroTemplate, HERO_ROSTER } from './data/heroes';
import { ENEMY_POOL, getEnemyPoolForFloor, getEncounterEnemyCountRange, scaleEnemyStatsForFloor } from './data/enemies';
import { Item, Job, Race } from './types';
import { Button } from './components/UI';
import { RecruitPhase } from './components/RecruitPhase';
import { LeadershipPhase } from './components/LeadershipPhase';
import { DeploymentPhase } from './components/DeploymentPhase';
import { DungeonView } from './components/DungeonView';
import { BattleView } from './components/BattleView';
import { CombatantCard } from './components/CombatantCard';
import { useDungeon } from './hooks/useDungeon';
import { Combatant } from './models/Combatant';
import { Settings, X as XIcon, Users, Brain, Sword, Target, Flame, Sparkles, Music, Skull, Coins, Package, ShieldCheck } from 'lucide-react';
import { DEFAULT_FLOOR_SPAWN_RATES, TilePos } from './utils/dungeonGenerator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { clsx } from 'clsx';
import { getHeroPortraitUrl } from './utils/heroPortraits';
import { BattleRewardSummary, buildBattleRewardSummary, rollEncounterRewards } from './utils/battleRewards';

type GamePhase = 'MAIN_MENU' | 'RECRUIT' | 'LEADERSHIP' | 'DEPLOYMENT' | 'EXPLORATION' | 'BATTLE' | 'BATTLE_REWARDS' | 'GAME_OVER';

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

const VALID_JOBS: Job[] = ['Swordsman', 'Archer', 'Priest', 'Knight', 'Thief', 'Mage', 'Berserker', 'Guardian', 'Scout', 'Paladin', 'Bard'];
const VALID_RACES: Race[] = ['Human', 'Elf', 'Night-Elf', 'Dwarf', 'Orc', 'Undead', 'Beastman', 'Demon', 'Dragon', 'Titan'];

const isJob = (value: unknown): value is Job => typeof value === 'string' && VALID_JOBS.includes(value as Job);
const isRace = (value: unknown): value is Race => typeof value === 'string' && VALID_RACES.includes(value as Race);

const HeroArchiveCard: React.FC<{ hero: HeroTemplate; className?: string; interactive?: boolean }> = ({ hero, className, interactive = false }) => {
    const dummy = useMemo(
        () => new Combatant(
            hero.name,
            hero.role,
            hero.hp,
            hero.spd,
            hero.atk,
            hero.def,
            hero.imageId,
            hero.skills,
            'VANGUARD',
            true,
            hero.trait,
            hero.job,
            hero.race
        ),
        [hero]
    );

    return (
        <div className={clsx(
            "relative select-none",
            interactive && "group cursor-pointer transition-all duration-500 ease-out scale-95 hover:scale-100 hover:-translate-y-2"
        )}>
            <CombatantCard
                unit={dummy}
                hideAtb
                className={clsx("transition-all duration-500 border-zinc-800", className ?? "w-48 h-[340px]")}
                footer={
                    <div className="space-y-2 mt-0.5">
                        {hero.skills.slice(1).map((skill, sIdx) => {
                            const isBard = hero.job === 'Bard';
                            const skillIcon = (isBard && (skill.actionType === 'support' || skill.actionType === 'ranged'))
                                ? <Music size={9} className="text-pink-500 mt-0.5 shrink-0" />
                                : skill.type === 'debuff'
                                    ? <Skull size={9} className="text-rose-500 mt-0.5 shrink-0" />
                                    : skill.actionType === 'support'
                                        ? <Sparkles size={9} className="text-emerald-500 mt-0.5 shrink-0" />
                                        : skill.actionType === 'ranged'
                                            ? <Target size={9} className="text-amber-400 mt-0.5 shrink-0" />
                                            : skill.actionType === 'magic'
                                                ? <Flame size={9} className="text-fuchsia-400 mt-0.5 shrink-0" />
                                                : <Sword size={9} className="text-amber-500 mt-0.5 shrink-0" />;

                            return (
                                <div key={`archive-skill-${hero.name}-${sIdx}`} className="flex gap-2 items-start">
                                    {skillIcon}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 leading-none mb-0.5">
                                            <span className="text-[9px] font-black text-white uppercase tracking-tighter">{skill.name}</span>
                                            {skill.procChance && <span className="text-[8px] font-black text-amber-600">{Math.round(skill.procChance * 100)}%</span>}
                                        </div>
                                        <p className="text-[8px] text-zinc-500 leading-tight line-clamp-1">
                                            {skill.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="flex gap-2 items-start">
                            <Brain size={9} className="text-cyan-500 mt-0.5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-none mb-0.5">{hero.trait.name}</span>
                                <p className="text-[8px] text-zinc-500 leading-tight italic line-clamp-2">
                                    {hero.trait.description}
                                </p>
                            </div>
                        </div>
                    </div>
                }
            />
        </div>
    );
};

const App: React.FC = () => {
    const [phase, setPhase] = useState<GamePhase>('MAIN_MENU');
    const [party, setParty] = useState<Combatant[]>([]);
    const [enemies, setEnemies] = useState<Combatant[]>([]);
    const [draftPool, setDraftPool] = useState<any[]>([]);
    const [draftBg, setDraftBg] = useState<string | null>(null);
    const [scrip, setScrip] = useState(2500);
    const [vault, setVault] = useState<Item[]>([]);
    const [lastEncounterPos, setLastEncounterPos] = useState<TilePos | null>(null);
    const [battleRewardSummary, setBattleRewardSummary] = useState<BattleRewardSummary | null>(null);
    const [showAdminTools, setShowAdminTools] = useState(false);
    const [showHeroArchive, setShowHeroArchive] = useState(false);
    const [selectedArchiveHero, setSelectedArchiveHero] = useState<HeroTemplate | null>(null);
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
        const encounterRange = getEncounterEnemyCountRange(dungeon.floor);
        const enemyCount = encounterRange.min + Math.floor(Math.random() * (encounterRange.max - encounterRange.min + 1));
        const spawnableEnemies = getEnemyPoolForFloor(dungeon.floor);
        const enemyPool = spawnableEnemies.length > 0 ? spawnableEnemies : ENEMY_POOL;
        const encounterEnemies = Array.from({ length: enemyCount }).map((_, idx) => {
            const template = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            const position = idx < Math.ceil(enemyCount / 2) ? 'VANGUARD' : 'REARGUARD';
            const enemy = Combatant.fromTemplate(template, false, position);
            const scaledStats = scaleEnemyStatsForFloor(template, dungeon.floor);
            enemy.maxHp = scaledStats.hp;
            enemy.hp = enemy.maxHp;
            enemy.power = scaledStats.pwr;
            enemy.def = scaledStats.def;
            enemy.speed = scaledStats.spd;
            return enemy;
        });
        setEnemies(encounterEnemies);
        setLastEncounterPos(pos);
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
        hero.role = (normalizedRole === 'TANK' || normalizedRole === 'HEALER' || normalizedRole === 'DPS' || normalizedRole === 'SUPPORT')
            ? (normalizedRole as any)
            : 'DPS';
        hero.imageId = String(hero.imageId || 'unknown');
        hero.job = isJob(hero.job) ? hero.job : 'Swordsman';
        hero.race = isRace(hero.race) ? hero.race : 'Human';
        hero.hp = typeof hero.hp === 'number' ? hero.hp : hero.maxHp;
        return hero;
    };

    const handleBattleComplete = (victory: boolean, remainingHeroes?: Combatant[]) => {
        if (victory) {
            let updatedParty = party;
            if (remainingHeroes) {
                const stripBattleVisualState = (hero: Combatant): Combatant => {
                    const clean = hero.clone();
                    clean.vfx = [];
                    clean.atb = 0;
                    clean.isActing = false;
                    clean.attackPhase = 'idle';
                    clean.impactPulse = false;
                    clean.hitShake = false;
                    clean.hitType = null;
                    clean.showImpact = false;
                    clean.healSparkle = false;
                    clean.traitGlow = false;
                    clean.isCharging = false;
                    clean.activeSigil = null;
                    clean.isPopping = false;
                    clean.activeChant = null;
                    return clean;
                };

                // Sync HP and state from battle back to party
                updatedParty = party.map(hp => {
                    const matched = remainingHeroes.find(rh => rh.name === hp.name);
                    return matched ? stripBattleVisualState(matched) : stripBattleVisualState(hp);
                });
                setParty(updatedParty);
            }
            const battleRewards = rollEncounterRewards({ defeatedEnemies: enemies.length });
            const rewardSummary = buildBattleRewardSummary({
                rewards: battleRewards,
                heroes: updatedParty,
                defeatedEnemies: enemies.length
            });
            if (battleRewards.scrip !== 0) {
                setScrip(current => current + battleRewards.scrip);
            }
            if (battleRewards.droppedItem) {
                setVault(current => [...current, battleRewards.droppedItem!]);
            }
            setBattleRewardSummary(rewardSummary);
            if (lastEncounterPos) {
                dungeon.registerEnemyDefeat(lastEncounterPos);
            }
            setEnemies([]);
            setLastEncounterPos(null);
            setPhase('BATTLE_REWARDS');
        } else {
            setBattleRewardSummary(null);
            setEnemies([]);
            setLastEncounterPos(null);
            setPhase('GAME_OVER');
        }
    };

    const handleBattleRewardContinue = () => {
        setBattleRewardSummary(null);
        setPhase('EXPLORATION');
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
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="w-full border-zinc-700/80 bg-black/45 backdrop-blur-md hover:border-cyan-500/60 hover:bg-zinc-950/70"
                                    onClick={() => {
                                        setShowHeroArchive(true);
                                        setSelectedArchiveHero(null);
                                    }}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    <span className="tracking-widest italic font-black">HERO ARCHIVE</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {showHeroArchive && phase === 'MAIN_MENU' && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/65 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="relative w-full max-w-6xl h-[82vh] rounded-2xl border border-zinc-700 bg-zinc-950/88 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                            <div className="absolute inset-0 pointer-events-none">
                                <img src="/assets/bg_draft_2.png" alt="" className="w-full h-full object-cover opacity-15 blur-sm brightness-10 grayscale" />
                                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                                    <div>
                                        <h3 className="text-lg font-black italic uppercase tracking-tight text-white">Hero Archive</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{HERO_ROSTER.length} Registered Heroes</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowHeroArchive(false);
                                            setSelectedArchiveHero(null);
                                        }}
                                        className="w-8 h-8 rounded-md border border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:text-rose-400 hover:border-rose-500/40 transition"
                                        aria-label="Close hero archive"
                                    >
                                        <XIcon className="w-4 h-4 mx-auto" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                                    <div className="grid grid-cols-10 gap-2">
                                        {HERO_ROSTER.map(hero => (
                                            <button
                                                key={hero.name}
                                                type="button"
                                                onClick={() => setSelectedArchiveHero(hero)}
                                                className={clsx(
                                                    "relative aspect-[3/4] rounded-md overflow-hidden border border-zinc-700/70 text-left transition",
                                                    selectedArchiveHero?.name === hero.name
                                                        ? "border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                                                        : "hover:border-cyan-400/70"
                                                )}
                                                aria-label={`Open ${hero.name} details`}
                                            >
                                                <img
                                                    src={getHeroPortraitUrl(hero.imageId)}
                                                    alt={hero.name}
                                                    className="absolute inset-0 w-full h-full object-cover object-top"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                                                <div className="absolute left-1.5 right-1.5 bottom-1.5">
                                                    <div className="text-[9px] font-black uppercase tracking-tight text-white truncate">{hero.name}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {selectedArchiveHero && (
                                <div
                                    className="absolute inset-0 z-30 bg-black/55 backdrop-blur-md flex items-center justify-center p-6 archive-focus-overlay"
                                    onClick={() => setSelectedArchiveHero(null)}
                                >
                                    <div
                                        key={selectedArchiveHero.name}
                                        className="relative drop-shadow-[0_22px_44px_rgba(0,0,0,0.7)] archive-card-pickup"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <div className="pointer-events-none absolute -inset-4 rounded-2xl border border-cyan-300/20 blur-[1px] archive-card-sheen" />
                                        <HeroArchiveCard hero={selectedArchiveHero} className="w-56 h-[390px]" />
                                    </div>
                                </div>
                            )}
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

                {phase === 'BATTLE_REWARDS' && battleRewardSummary && (
                    <div className="w-full h-full relative overflow-hidden bg-black">
                        <div className="absolute inset-0">
                            <img src="assets/bg_inventory_modal.png" className="w-full h-full object-cover opacity-35" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/65 to-black" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_45%)]" />
                        </div>

                        <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                            <div className="w-full max-w-5xl rounded-[2rem] border border-cyan-500/25 bg-zinc-950/75 backdrop-blur-xl shadow-[0_0_90px_rgba(0,0,0,0.75)] overflow-hidden">
                                <div className="px-10 pt-10 pb-6 border-b border-zinc-800/70">
                                    <div className="flex items-center gap-3 text-cyan-400 mb-3">
                                        <ShieldCheck className="w-6 h-6" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.35em]">Battle Glory</span>
                                    </div>
                                    <h2 className="text-6xl font-black italic tracking-tighter uppercase text-white leading-none">Victory Secured</h2>
                                    <p className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-500">
                                        {battleRewardSummary.defeatedEnemies} hostiles neutralized on this floor
                                    </p>
                                </div>

                                <div className="grid grid-cols-[1.1fr_0.9fr] gap-0">
                                    <div className="p-8 border-r border-zinc-800/70">
                                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                                            <Users className="w-4 h-4 text-cyan-500" />
                                            Syndicate Survivors
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            {battleRewardSummary.survivingHeroes.map(hero => (
                                                <div key={hero.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                                                    <div className="relative h-44">
                                                        <img src={getHeroPortraitUrl(hero.imageId)} alt={hero.name} className="w-full h-full object-cover object-top" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                        <div className="absolute left-3 right-3 bottom-3">
                                                            <p className="text-sm font-black uppercase text-white">{hero.name}</p>
                                                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">{hero.job} • {hero.race}</p>
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wide text-zinc-300 flex items-center justify-between">
                                                        <span>HP</span>
                                                        <span className="text-white">{Math.floor(hero.hp)}/{hero.maxHp}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {battleRewardSummary.fallenHeroes.length > 0 && (
                                            <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-950/15 px-4 py-3">
                                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-300">Fallen This Battle</div>
                                                <div className="mt-2 text-sm font-bold text-zinc-300">
                                                    {battleRewardSummary.fallenHeroes.map(hero => hero.name).join(', ')}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 flex flex-col">
                                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                                            <Package className="w-4 h-4 text-amber-400" />
                                            Recovered Rewards
                                        </div>

                                        <div className="rounded-2xl border border-amber-500/25 bg-amber-950/15 px-5 py-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Scrip Recovered</p>
                                                <p className="mt-2 text-4xl font-black text-white tabular-nums">+{battleRewardSummary.scrip}</p>
                                            </div>
                                            <Coins className="w-10 h-10 text-amber-400" />
                                        </div>

                                        <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/15 p-4 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300 mb-3">Item Recovery</p>
                                            {battleRewardSummary.droppedItem ? (
                                                <div className="rounded-xl border border-zinc-800 bg-black/30 overflow-hidden">
                                                    <div className="relative h-48">
                                                        {battleRewardSummary.droppedItem.imagePath ? (
                                                            <img src={battleRewardSummary.droppedItem.imagePath} alt={battleRewardSummary.droppedItem.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800" />
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                                                        <div className="absolute left-4 right-4 bottom-4">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">{battleRewardSummary.droppedItem.rarity} • {battleRewardSummary.droppedItem.type}</p>
                                                            <p className="text-xl font-black uppercase text-white">{battleRewardSummary.droppedItem.name}</p>
                                                            <p className="mt-1 text-[11px] font-bold text-zinc-300 leading-snug">{battleRewardSummary.droppedItem.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full min-h-40 rounded-xl border border-dashed border-zinc-700 bg-black/20 flex items-center justify-center text-center px-6">
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">No item recovered</p>
                                                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600">The monsters yielded scrip, but no usable salvage this time.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <Button variant="primary" size="lg" className="min-w-56 tracking-[0.2em] font-black uppercase" onClick={handleBattleRewardContinue}>
                                                Continue Expedition
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
