import React from 'react';
import { Combatant } from '../models/Combatant';
import { ProgressBar } from './UI';
import { Shield, Sword, Zap, Heart } from 'lucide-react';
import { clsx } from 'clsx';

interface CombatantCardProps {
    unit: Combatant;
    isEnemy?: boolean;
    className?: string;
    party?: Combatant[];
}

export const CombatantCard: React.FC<CombatantCardProps> = ({ unit, isEnemy = false, className, party = [] }) => {
    // Determine movement offset based on battlefield orientation (Enemies LEFT, Syndicate RIGHT)
    const getTranslateX = () => {
        if (unit.attackPhase === 'idle') return '0px';
        
        // Enemies move Right (+), Syndicate moves Left (-)
        const direction = isEnemy ? 1 : -1;
        const amount = unit.attackPhase === 'strike' ? 60 : 30;
        
        return `${direction * amount}px`;
    };

    return (
        <div 
            className={clsx(
                "relative w-48 h-64 rounded-xl border-2 transition-all duration-300 overflow-hidden",
                isEnemy ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-700 bg-zinc-900/90",
                unit.isActing && "scale-105 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
                unit.hp <= 0 && "grayscale opacity-50",
                className
            )}
            style={{ 
                transform: `translateX(${getTranslateX()}) ${unit.isActing ? 'scale(1.05)' : 'scale(1)'}`,
                zIndex: unit.isActing ? 30 : 10
            }}
        >
            {/* Background Image / Placeholder */}
            <div className="absolute inset-0 z-0 opacity-40">
                <img 
                    src={`/assets/${unit.imageId}.png`} 
                    alt={unit.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300/111/444?text=' + unit.role;
                    }}
                />
            </div>

            {/* Header / Info */}
            <div className="relative z-10 p-3 flex flex-col h-full bg-gradient-to-t from-zinc-950 via-transparent to-transparent">
                <div className="flex justify-between items-start">
                    <div className="text-left">
                        <h3 className="text-sm font-bold uppercase tracking-tighter text-zinc-100">{unit.name}</h3>
                        <span className="text-[10px] text-zinc-500 font-medium">{unit.role}</span>
                    </div>
                    <div className="p-1 rounded bg-zinc-900/80 border border-zinc-800">
                        {unit.role === 'TANK' && <Shield size={12} className="text-blue-400" />}
                        {unit.role === 'DPS' && <Sword size={12} className="text-red-400" />}
                        {unit.role === 'HEALER' && <Heart size={12} className="text-green-400" />}
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    {/* Stats Summary */}
                    <div className="flex gap-2 text-[10px] items-center text-zinc-400 font-mono">
                        <span className="flex items-center gap-1"><Sword size={10} /> {unit.getATK(party)}</span>
                        <span className="flex items-center gap-1"><Shield size={10} /> {unit.getDEF(party)}</span>
                        <span className="flex items-center gap-1"><Zap size={10} /> {unit.getSPD(party)}</span>
                    </div>

                    {/* Bars */}
                    <ProgressBar 
                        value={unit.hp} 
                        max={unit.maxHp} 
                        color="bg-rose-600" 
                        label="VIT" 
                        showValues 
                    />
                    <ProgressBar 
                        value={unit.atb} 
                        max={100} 
                        color="bg-cyan-500" 
                        label="ATB" 
                    />
                </div>
            </div>

            {/* Floating VFX */}
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                {unit.vfx.map(v => (
                    <div 
                        key={v.id} 
                        className={clsx(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 font-black text-2xl animate-impact-pop",
                            v.type === 'damage' ? "text-rose-500" : "text-green-400"
                        )}
                    >
                        {v.text}
                    </div>
                ))}
            </div>
        </div>
    );
};
