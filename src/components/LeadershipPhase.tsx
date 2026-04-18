import React, { useState } from 'react';
import { Combatant } from '../models/Combatant';
import { CombatantCard } from './CombatantCard';
import { LEADER_PERKS } from '../data/perks';
import { Button } from './UI';
import { Crown, Star } from 'lucide-react';

interface LeadershipPhaseProps {
    draftHeroes: Combatant[];
    onFinalize: (leaderName: string) => void;
    draftBg: string | null;
}

export const LeadershipPhase: React.FC<LeadershipPhaseProps> = ({ draftHeroes, onFinalize, draftBg }) => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center pt-8 p-4 text-white animate-in fade-in zoom-in duration-1000 overflow-hidden relative">
            {draftBg && (
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-30 blur-md brightness-50 transition-all duration-1000 scale-110" 
                    style={{ backgroundImage: `url(${draftBg})` }} 
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/95 z-0" />
            
            {/* Reduced Title Size & Removed Sub-label */}
            <div className="relative z-10 text-center mb-10 animate-in slide-in-from-top-10 duration-1000 delay-200">
                <h2 className="text-4xl font-black italic text-white mb-1 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Appoint <span className="text-amber-500">Leader</span>
                </h2>
                <p className="text-zinc-500 text-[9px] tracking-[0.3em] uppercase">Delegate absolute authority to one champion</p>
            </div>

            <div className="relative z-10 flex flex-wrap justify-center gap-12 max-w-5xl w-full px-4 mb-32 animate-in slide-in-from-bottom-10 duration-1000 delay-400">
                {draftHeroes.map((hero) => {
                    const perkInfo = LEADER_PERKS[hero.name] || { name: 'Unknown', perk: 'No perk available' };
                    const isSelected = selected === hero.name;

                    return (
                        <div key={hero.name} className="flex flex-col items-center">
                            <div 
                                className={`group relative cursor-pointer transform transition-all duration-500 ease-out
                                    ${isSelected ? 'scale-105 z-20 translate-y-[-10px]' : 'scale-90 opacity-60 hover:opacity-100 hover:scale-95'}`}
                                onClick={() => setSelected(hero.name)}
                            >
                                {isSelected && (
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce z-30">
                                        <Crown size={48} className="text-amber-500" fill="currentColor" />
                                    </div>
                                )}
                                <CombatantCard 
                                    unit={hero} 
                                    className={`transition-all duration-500 ${isSelected ? "border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.2)]" : "border-zinc-800"}`} 
                                />
                            </div>

                            <div className={`mt-6 p-4 rounded-xl border-2 transition-all duration-500 text-center max-w-[180px]
                                ${isSelected ? 'bg-amber-950/40 border-amber-500 shadow-xl' : 'bg-zinc-900/40 border-zinc-800 opacity-40'}`}>
                                <h4 className="text-amber-500 font-black italic text-[11px] tracking-widest uppercase mb-0.5 flex items-center justify-center gap-1">
                                    {perkInfo.name} {isSelected && <Star size={10} fill="currentColor" />}
                                </h4>
                                <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-tighter leading-tight">{perkInfo.perk}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Standardized Bottom Button Position */}
            <div className="absolute bottom-10 z-30 animate-in slide-in-from-bottom-6 duration-1000">
                <Button
                    disabled={!selected}
                    onClick={() => onFinalize(selected!)}
                    className="px-20 py-4 text-xl tracking-[0.2em] bg-amber-600 border-amber-400"
                >
                    RATIFY LEADER
                </Button>
            </div>
        </div>
    );
};
