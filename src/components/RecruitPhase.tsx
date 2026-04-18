import React, { useState, useMemo } from 'react';
import { Combatant } from '../models/Combatant';
import { CombatantCard } from './CombatantCard';
import { Button } from './UI';
import { CheckCircle2 } from 'lucide-react';

interface RecruitPhaseProps {
    pool: any[];
    onFinalize: (selected: any[]) => void;
    draftBg: string | null;
}

export const RecruitPhase: React.FC<RecruitPhaseProps> = ({ pool, onFinalize, draftBg }) => {
    const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

    const toggleHero = (hero: any) => {
        const next = new Set(selectedNames);
        if (next.has(hero.name)) {
            next.delete(hero.name);
        } else if (next.size < 3) {
            next.add(hero.name);
        } else {
            const first = next.values().next().value;
            if (first) next.delete(first);
            next.add(hero.name);
        }
        setSelectedNames(next);
    };

    const selectedHeroes = useMemo(() => {
        return pool.filter(h => selectedNames.has(h.name));
    }, [pool, selectedNames]);

    const draftTiltMap = useMemo(() => {
        return Object.fromEntries(pool.map(h => [h.name, `${(Math.random() * 8 - 4).toFixed(2)}deg`]));
    }, [pool]);

    return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center pt-8 p-4 text-white animate-in slide-in-from-bottom-8 duration-700 overflow-hidden relative">
            {draftBg && (
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40 blur-sm brightness-50 transition-all duration-1000 scale-105" 
                    style={{ backgroundImage: `url(${draftBg})` }} 
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/95 z-0" />

            {/* Reduced Title Size & Removed Sub-label */}
            <div className="text-center mb-6 z-10 animate-in zoom-in fade-in duration-1000 delay-300">
                <h2 className="text-4xl font-black italic text-white mb-1 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    Muster <span className="text-amber-500">Syndicate</span>
                </h2>
                <p className="text-zinc-500 text-[9px] tracking-[0.3em] uppercase font-bold">Forge an elite three-man squad</p>
            </div>

            <div className="flex-1 w-full max-w-[1400px] z-10 flex flex-wrap justify-center items-center gap-6 overflow-visible mb-20">
                {pool.map((hero, idx) => {
                    const isSelected = selectedNames.has(hero.name);
                    return (
                        <div 
                            key={hero.name} 
                            className={`relative cursor-pointer transition-all duration-500 transform hover:rotate-0 hover:z-50
                                ${isSelected ? 'scale-105 z-20 translate-y-[-5px]' : 'scale-90 z-10 hover:scale-95'}`}
                            style={{ 
                                rotate: draftTiltMap[hero.name],
                                animationDelay: `${idx * 150}ms`,
                            }}
                            onClick={() => toggleHero(hero)}
                        >
                            <div className={`transition-all duration-700 ${isSelected ? '' : 'grayscale-[30%] hover:grayscale-0'}`}>
                                <CombatantCard 
                                    unit={new Combatant(hero.name, hero.role, hero.hp, hero.spd, hero.atk, hero.def, hero.imageId, hero.skills, 'VANGUARD', true, hero.trait)} 
                                    className={isSelected ? 'border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)]' : 'border-zinc-800'}
                                />
                            </div>
                            
                            <div className={`absolute -top-2 -right-2 transition-all duration-500 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                                <div className="bg-amber-500 text-black w-8 h-8 rounded-full flex items-center justify-center font-black shadow-[0_0_20px_rgba(245,158,11,1)] border-2 border-black">
                                    <CheckCircle2 size={18} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-10 z-30 animate-in slide-in-from-bottom-6 duration-1000">
                <Button
                    disabled={selectedNames.size !== 3}
                    onClick={() => onFinalize(selectedHeroes)}
                    className="px-16 py-4 text-xl tracking-[0.2em] bg-amber-600 border-amber-400"
                >
                    CONFIRM {selectedNames.size}/3
                </Button>
            </div>
        </div>
    );
};
