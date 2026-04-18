import React, { useState } from 'react';
import { Combatant } from '../models/Combatant';
import { CombatantCard } from './CombatantCard';
import { LEADER_PERKS } from '../data/perks';
import { Button, cn } from './UI';
import { Crown, Star } from 'lucide-react';

interface LeadershipPhaseProps {
    draftHeroes: Combatant[];
    onFinalize: (leaderName: string) => void;
    draftBg: string | null;
}

export const LeadershipPhase: React.FC<LeadershipPhaseProps> = ({ draftHeroes, onFinalize, draftBg }) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center pt-10 p-4 text-white animate-in fade-in duration-1000 overflow-hidden relative">
            {draftBg && (
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-15 blur-sm brightness-10 grayscale transition-all duration-1000" 
                    style={{ backgroundImage: `url(${draftBg})` }} 
                />
            )}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent z-0" />
            
            <div className="relative z-10 text-center mb-10">
                <h2 className="text-5xl font-black italic text-white mb-2 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    Appoint <span className="text-amber-500">Leader</span>
                </h2>
                <div className={cn(
                    "h-1 w-32 mx-auto rounded-full transition-all duration-700",
                    selected ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" : "bg-zinc-800"
                )} />
            </div>

            <div className="relative z-10 flex flex-wrap justify-center gap-14 max-w-5xl w-full px-4 mb-32">
                {draftHeroes.map((hero) => {
                    const perkInfo = LEADER_PERKS[hero.name] || { name: 'Unknown', perk: 'No perk available' };
                    const isSelected = selected === hero.name;

                    return (
                        <div key={hero.name} className="flex flex-col items-center select-none">
                            <div 
                                className={cn(
                                    "group relative cursor-pointer transition-all duration-500 ease-out",
                                    isSelected ? "scale-110 z-20 -translate-y-4 -rotate-1" : "scale-95 opacity-50 hover:opacity-100 hover:scale-100 hover:-translate-y-2"
                                )}
                                onClick={() => setSelected(hero.name)}
                            >
                                {isSelected && (
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce z-30">
                                        <Crown size={48} className="text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" fill="currentColor" />
                                    </div>
                                )}
                                <CombatantCard 
                                    unit={hero} 
                                    hideAtb
                                    className={cn(
                                        "w-48 h-64 transition-all duration-500",
                                        isSelected 
                                            ? "border-[4px] border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.6),inset_0_0_20px_rgba(245,158,11,0.4)] bg-zinc-900 brightness-125" 
                                            : "border-zinc-800"
                                    )}
                                />
                                
                                {/* Flashy selection auras */}
                                {isSelected && <div className="absolute -inset-2 border-2 border-amber-400/50 rounded-2xl animate-pulse blur-[3px] pointer-events-none z-0" />}
                                {isSelected && <div className="absolute -inset-4 border border-amber-600/20 rounded-3xl animate-ping pointer-events-none z-0" />}
                            </div>

                            <div className={cn(
                                "mt-10 p-4 rounded-xl border-2 transition-all duration-500 text-center max-w-[200px]",
                                isSelected ? 'bg-amber-950/40 border-amber-500 shadow-xl scale-105' : 'bg-zinc-900/40 border-zinc-800 opacity-40'
                            )}>
                                <h4 className="text-amber-500 font-black italic text-[11px] tracking-widest uppercase mb-1 flex items-center justify-center gap-1">
                                    {perkInfo.name} {isSelected && <Star size={10} fill="currentColor" />}
                                </h4>
                                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-tighter leading-tight">{perkInfo.perk}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-10 z-30">
                <Button
                    disabled={!selected}
                    onClick={() => onFinalize(selected!)}
                    className={cn(
                        "px-24 py-5 text-2xl tracking-[0.3em] font-black uppercase transition-all duration-500",
                        selected 
                            ? "bg-amber-600 border-amber-400 text-white shadow-[0_0_60px_rgba(245,158,11,0.4)] hover:bg-amber-500 hover:scale-110 active:scale-95 translate-y-0" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50 translate-y-10"
                    )}
                >
                    {selected ? "RATIFY LEADER" : "AWAITING APPOINTMENT"}
                </Button>
            </div>
        </div>
    );
};
