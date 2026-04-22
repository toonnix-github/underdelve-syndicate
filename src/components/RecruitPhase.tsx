import React, { useState, useMemo } from 'react';
import { Combatant } from '../models/Combatant';
import { CombatantCard } from './CombatantCard';
import { Button } from './UI';
import { Brain, Sword, Target, Flame, Sparkles, Music, Skull } from 'lucide-react';
import { clsx } from 'clsx';

interface RecruitPhaseProps {
    pool: any[];
    onFinalize: (selected: any[]) => void;
    draftBg: string | null;
}

const DraftCard: React.FC<{ hero: any; isSelected: boolean; onClick: () => void }> = ({ hero, isSelected, onClick }) => {
    const dummy = useMemo(() => new Combatant(
        hero.name, hero.role, hero.hp, hero.spd, hero.atk, hero.def, hero.imageId, hero.skills, 'VANGUARD', true, hero.trait, hero.job, hero.race
    ), [hero]);
    // Removed manual secondarySkill extraction, mapping through all hero.skills now

    return (
        <div 
            onClick={onClick}
            className={clsx(
                "group relative cursor-pointer transition-all duration-500 ease-out select-none",
                isSelected 
                    ? "scale-110 z-20 -translate-y-4 -rotate-1" 
                    : "scale-95 opacity-50 hover:opacity-100 hover:scale-100 hover:-translate-y-2"
            )}
        >
            <CombatantCard 
                unit={dummy}
                hideAtb
                className={clsx(
                    "w-48 aspect-[5/7] transition-all duration-500",
                    isSelected 
                        ? "border-[4px] border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.6),inset_0_0_20px_rgba(245,158,11,0.4)] bg-zinc-900 brightness-125" 
                        : "border-zinc-800"
                )}
                footer={
                    <div className="space-y-2 mt-0.5">
                        {hero.skills.slice(1).map((skill: any, sIdx: number) => {
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
                                <div key={`draft-skill-${sIdx}`} className="flex gap-2 items-start">
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

                        {/* Trait */}
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
            {isSelected && (
                <div className="absolute -top-3 -right-3 bg-amber-500 text-black w-8 h-8 rounded-full flex items-center justify-center text-xl font-black shadow-[0_0_20px_rgba(245,158,11,0.8)] border-4 border-black animate-in zoom-in spin-in-90 duration-500 z-50">
                    ✓
                </div>
            )}
            
            {/* Flashy Ember Aura for selection */}
            {isSelected && (
                <div className="absolute -inset-2 border-2 border-amber-400/50 rounded-2xl animate-pulse blur-[3px] pointer-events-none z-0" />
            )}
            {isSelected && (
                <div className="absolute -inset-4 border border-amber-600/20 rounded-3xl animate-ping pointer-events-none z-0" />
            )}
        </div>
    );
};

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

    const selectedHeroes = useMemo(() => pool.filter(h => selectedNames.has(h.name)), [pool, selectedNames]);
    const isReady = selectedNames.size === 3;

    return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center pt-10 p-4 text-white animate-in fade-in duration-1000 overflow-hidden relative">
            {draftBg && (
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-15 blur-sm brightness-10 grayscale transition-all duration-1000" 
                    style={{ backgroundImage: `url(${draftBg})` }} 
                />
            )}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent z-0" />

            <div className="text-center mb-10 z-10 relative">
                <h2 className="text-5xl font-black italic text-white mb-2 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    Muster <span className="text-amber-500">Syndicate</span>
                </h2>
                <div className={clsx(
                    "h-1 w-32 mx-auto rounded-full transition-all duration-700",
                    isReady ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" : "bg-zinc-800"
                )} />
            </div>

            <div className="flex-1 w-full max-w-[1600px] z-10 flex justify-center items-center gap-14 overflow-visible mb-24 px-12">
                {pool.map((hero) => (
                    <DraftCard 
                        key={hero.name} 
                        hero={hero} 
                        isSelected={selectedNames.has(hero.name)} 
                        onClick={() => toggleHero(hero)} 
                    />
                ))}
            </div>

            <div className="absolute bottom-10 z-30">
                <Button
                    disabled={!isReady}
                    onClick={() => onFinalize(selectedHeroes)}
                    className={clsx(
                        "px-24 py-5 text-2xl tracking-[0.3em] font-black uppercase transition-all duration-500",
                        isReady 
                            ? "bg-amber-600 border-amber-400 text-white shadow-[0_0_60px_rgba(245,158,11,0.4)] hover:bg-amber-500 hover:scale-110 active:scale-95 translate-y-0" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 translate-y-10"
                    )}
                >
                    {isReady ? "RATIFY SQUAD" : "AWAITING MERCENARIES"}
                </Button>
            </div>
        </div>
    );
};
