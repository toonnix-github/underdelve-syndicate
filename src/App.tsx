import React, { useState, useCallback } from 'react';
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
import { Flame, Compass } from 'lucide-react';

type GamePhase = 'MAIN_MENU' | 'RECRUIT' | 'LEADERSHIP' | 'DEPLOYMENT' | 'EXPLORATION' | 'BATTLE' | 'GAME_OVER';

const App: React.FC = () => {
    const [phase, setPhase] = useState<GamePhase>('MAIN_MENU');
    const [party, setParty] = useState<Combatant[]>([]);
    const [enemies, setEnemies] = useState<Combatant[]>([]);
    const [draftPool, setDraftPool] = useState<any[]>([]);
    const [draftBg, setDraftBg] = useState<string | null>(null);
    const [scrip, setScrip] = useState(2500);
    const [vault, setVault] = useState<string[]>([]);
    const [lastEncounterId, setLastEncounterId] = useState<string | null>(null);

    const startRun = () => {
        // Old Mechanism: Pick 3 from pool of 5
        const pool = [...HERO_ROSTER].sort(() => 0.5 - Math.random()).slice(0, 5);
        setDraftPool(pool);
        
        // Randomize background
        const bgIdx = Math.floor(Math.random() * 3) + 1;
        setDraftBg(`assets/bg_draft_${bgIdx}.png`);
        
        setParty([]);
        setScrip(2500);
        setVault([]);
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

    const { floor, playerPos, exploredCells, dungeonData, movePlayer, getScoutedCells, nextFloor, updateInteractable } = useDungeon(1, party);

    const handleEncounter = useCallback((pos: any) => {
        // Find encounter ID to persist victory
        const encounter = dungeonData.interactables.find(i => i.x === pos.x && i.y === pos.y);
        if (encounter) setLastEncounterId(encounter.id);

        const numEnemies = Math.floor(Math.random() * 2) + 1;
        const newEnemies = Array.from({ length: numEnemies }).map((_, i) => {
            const proto = ENEMY_POOL[Math.floor(Math.random() * ENEMY_POOL.length)];
            return new Combatant(
                proto.name,
                'DPS',
                proto.hp,
                proto.spd,
                proto.pwr,
                proto.def,
                proto.img,
                [{ id: 'e_strike', name: 'Strike', description: 'Basic physical attack.', val: 12, type: 'damage', targetType: 'single' }],
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

    return (
        <div className="w-full h-full bg-black text-zinc-100 flex flex-col items-center justify-center relative overflow-hidden font-sans">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
                {phase === 'MAIN_MENU' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-12">
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
                            movePlayer, getScoutedCells, nextFloor, 
                            updateInteractable 
                        }}
                        scrip={scrip}
                        vault={vault}
                        onEncounter={handleEncounter} 
                        onStairs={nextFloor} 
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
