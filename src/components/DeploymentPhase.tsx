import React, { useState } from 'react';
import { Combatant } from '../models/Combatant';
import { Button } from './UI';
import { ArrowRightLeft, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface DeploymentPhaseProps {
    heroes: Combatant[];
    onFinalize: (deployed: Combatant[]) => void;
}

export const DeploymentPhase: React.FC<DeploymentPhaseProps> = ({ heroes: initialHeroes, onFinalize }) => {
    const [heroes, setHeroes] = useState([...initialHeroes]);

    const togglePosition = (name: string) => {
        setHeroes(prev => prev.map(h => {
            if (h.name === name) {
                const next = h.clone();
                const newPos = h.positionLine === 'VANGUARD' ? 'REARGUARD' : 'VANGUARD';
                next.positionLine = newPos;
                return next;
            }
            return h;
        }));
    };

    const vanguard = heroes.filter(h => h.positionLine === 'VANGUARD');
    const rearguard = heroes.filter(h => h.positionLine === 'REARGUARD');
    const isFormationValid = vanguard.length <= 2 && rearguard.length <= 2;
    const formationWarning = !isFormationValid ? 'Deployment requires at most 2 units in each row' : null;

    return (
        <div className="h-screen w-full bg-zinc-950 flex flex-col items-center pt-8 p-4 text-white animate-in fade-in duration-700 overflow-hidden font-sans relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-red-900/10 blur-[150px] rounded-full -translate-y-1/2" />
            <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-blue-900/10 blur-[150px] rounded-full -translate-y-1/2" />

            {/* Standardized Title (No sub-label) */}
            <div className="text-center mb-8 z-10 animate-in slide-in-from-top-4 duration-700">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Squad <span className="text-emerald-500">Formation</span>
                </h2>
                <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.3em]">Operational 2x2 Tactical Grid</p>
                <p className="mt-2 text-zinc-600 text-[9px] uppercase font-bold tracking-[0.2em]">You can adjust freely, but deployment needs a 2 x 2 split</p>
                {formationWarning && (
                    <p className="mt-2 text-rose-400 text-[9px] uppercase font-black tracking-[0.2em]">
                        {formationWarning}
                    </p>
                )}
            </div>

            <div className="flex gap-10 items-center justify-center z-10 scale-100 mb-24">
                
                {/* VANGUARD SECTION */}
                <div className="flex flex-col items-center gap-3 group animate-in slide-in-from-left-10 duration-1000">
                    <div className="text-[9px] font-black uppercase tracking-widest text-red-500/60 pb-1">Vanguard (+10% DEF)</div>
                    <div className="grid grid-cols-1 gap-3 w-[160px] p-2 bg-zinc-900/20 border border-zinc-800 rounded-3xl transition-all duration-500 hover:border-red-900/30">
                        {vanguard.map(hero => (
                            <CompactCard key={hero.name} hero={hero} onClick={() => togglePosition(hero.name)} color="red" />
                        ))}
                        {Array.from({ length: Math.max(0, 2 - vanguard.length) }).map((_, i) => (
                            <EmptySlot key={i} />
                        ))}
                    </div>
                </div>

                {/* Animated Vertical Divider */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-px bg-zinc-800" />
                    <Zap size={10} className="text-zinc-800 animate-pulse" />
                    <div className="h-16 w-px bg-zinc-800" />
                </div>

                {/* REARGUARD SECTION */}
                <div className="flex flex-col items-center gap-3 group animate-in slide-in-from-right-10 duration-1000">
                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 pb-1">Rearguard (+15% SPD)</div>
                    <div className="grid grid-cols-1 gap-3 w-[160px] p-2 bg-zinc-900/20 border border-zinc-800 rounded-3xl transition-all duration-500 hover:border-blue-900/30">
                        {rearguard.map(hero => (
                            <CompactCard key={hero.name} hero={hero} onClick={() => togglePosition(hero.name)} color="blue" />
                        ))}
                        {Array.from({ length: Math.max(0, 2 - rearguard.length) }).map((_, i) => (
                            <EmptySlot key={i} />
                        ))}
                    </div>
                </div>

            </div>

            {/* Standardized Bottom Button */}
            <div className="absolute bottom-10 z-30 animate-in slide-in-from-bottom-6 duration-1000">
                <Button 
                    disabled={!isFormationValid}
                    onClick={() => onFinalize(heroes)}
                    className={clsx(
                        "px-16 py-4 text-xl tracking-[0.2em]",
                        isFormationValid
                            ? "bg-emerald-600 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                            : "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-50"
                    )}
                >
                    INITIALIZE MISSION
                </Button>
            </div>
        </div>
    );
};

const CompactCard = ({ hero, onClick, color }: { hero: Combatant, onClick: () => void, color: 'red' | 'blue' }) => (
    <div 
        onClick={onClick}
        className={clsx(
            "w-full h-24 relative rounded-2xl border-2 overflow-hidden cursor-pointer group/item transition-all duration-500 hover:z-20",
            color === 'red' ? "border-zinc-800 hover:border-red-500" : "border-zinc-800 hover:border-blue-500"
        )}
    >
        <img 
            src={`/assets/${hero.imageId}.png`} 
            className="absolute inset-0 w-full h-full object-cover object-[center_20%] opacity-80 brightness-90 group-hover/item:scale-110 transition-all duration-700" 
            alt={hero.name}
        />
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/60 to-transparent">
            <p className="text-[10px] font-black uppercase leading-tight text-white mb-0.5">{hero.name}</p>
            <div className="flex justify-between items-center">
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">{hero.role}</p>
                {hero.isLeader && <span className="text-[7px] bg-amber-500 text-black px-1 rounded-sm font-black shadow-sm">LEAD</span>}
            </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 bg-black/40 backdrop-blur-[2px] transition-all duration-300">
            <div className="p-2 bg-white/10 rounded-full border border-white/20 scale-50 group-hover/item:scale-100 transition-transform duration-500">
                <ArrowRightLeft className="text-white" size={16} />
            </div>
        </div>
    </div>
);

const EmptySlot = () => (
    <div className="w-full h-24 rounded-2xl border border-zinc-900/30 bg-zinc-900/10 flex items-center justify-center overflow-hidden">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
    </div>
);
