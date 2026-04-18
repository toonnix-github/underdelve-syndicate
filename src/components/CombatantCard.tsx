import React from 'react';
import { Combatant } from '../models/Combatant';
import { ProgressBar } from './UI';
import { Shield, Sword, Zap, Heart, Flame, Target, Sparkles, Axe, Skull } from 'lucide-react';
import { clsx } from 'clsx';

interface CombatantCardProps {
    unit: Combatant;
    isEnemy?: boolean;
    className?: string;
    party?: Combatant[];
    activeIcon?: string | null;
}

export const CombatantCard: React.FC<CombatantCardProps> = ({ unit, isEnemy = false, className, party = [], activeIcon }) => {
    const getTranslateX = () => {
        if (unit.attackPhase === 'idle') return '0px';
        const direction = isEnemy ? 1 : -1;
        const amount = unit.attackPhase === 'strike' ? 60 : 30;
        return `${direction * amount}px`;
    };

    return (
        <div 
            id={`unit-${unit.id}`}
            className={clsx(
                "relative w-48 h-64 rounded-xl border-2 transition-all duration-300 overflow-hidden",
                isEnemy ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-700 bg-zinc-900/90",
                unit.isActing && "scale-105 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
                unit.hp <= 0 && "grayscale opacity-50 translate-y-4 rotate-2",
                unit.hitShake && "animate-hit-shake",
                className
            )}
            style={{ 
                transform: `translateX(${getTranslateX()}) ${unit.isActing ? 'scale(1.05)' : 'scale(1)'}`,
                zIndex: unit.isActing ? 40 : unit.hitShake ? 35 : 10
            }}
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0 opacity-40">
                <img 
                    src={`/assets/${unit.imageId}.png`} 
                    alt={unit.name}
                    className={clsx(
                        "w-full h-full object-cover transition-transform duration-300",
                        unit.hitShake && "scale-110 brightness-125"
                    )}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300/111/444?text=' + unit.role;
                    }}
                />
            </div>

            {/* Acting Overlay Icon */}
            {unit.isActing && activeIcon && (
                <div className="absolute inset-0 z-30 flex items-center justify-center animate-in zoom-in duration-300 pointer-events-none">
                    <div className="filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                        {activeIcon === 'sword' && <Sword size={84} className="text-amber-500 opacity-90" />}
                        {activeIcon === 'fire' && <Flame size={84} className="text-red-500 opacity-90" />}
                        {activeIcon === 'heart' && <Heart size={84} className="text-emerald-500 opacity-90" />}
                        {activeIcon === 'zap' && <Zap size={84} className="text-blue-400 opacity-90" />}
                        {activeIcon === 'bow' && <Target size={84} className="text-zinc-300 opacity-90" />}
                        {activeIcon === 'fang' && <div className="text-7xl opacity-90 filter brightness-150">🦷</div>}
                    </div>
                </div>
            )}

            {/* TARGET HIT EFFECTS */}
            <div className="absolute inset-0 z-40 pointer-events-none">
                {unit.hitType === 'slash' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-2 bg-white rotate-45 animate-impact-pop shadow-[0_0_20px_white]" />
                    </div>
                )}
                {unit.hitType === 'burn' && (
                    <div className="absolute inset-0 bg-orange-600/30 animate-pulse mix-blend-overlay">
                        <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 opacity-60 animate-bounce" size={64} />
                    </div>
                )}
                {unit.hitType === 'broken' && (
                    <div className="absolute inset-x-0 top-1/4 flex justify-center">
                        <Skull className="text-red-600 animate-impact-pop opacity-80" size={80} />
                    </div>
                )}
                {unit.healSparkle && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-emerald-400 animate-sigil-appear" size={64} />
                    </div>
                )}
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

            {/* FLOATING DAMAGE NUMBERS (Z-INDEX OVERRIDE FOR VISIBILITY) */}
            <div className="absolute inset-0 pointer-events-none z-[100] overflow-visible">
                {unit.vfx.map((v, i) => (
                    <div 
                        key={v.id} 
                        className={clsx(
                            "absolute top-1/2 left-1/2 font-black text-4xl animate-damage-float-ro tabular-nums",
                            v.type === 'damage' ? "text-white outline-text" : "text-green-400 outline-text"
                        )}
                        style={{ 
                            marginLeft: `${(i % 3 - 1) * 20}px`, // Stagger horizontal overlap
                            animationDelay: `${i * 0.05}s`,
                            textShadow: '2px 2px 0px rgba(0,0,0,1), -2px -2px 0px rgba(0,0,0,1), 2px -2px 0px rgba(0,0,0,1), -2px 2px 0px rgba(0,0,0,1)'
                        }}
                    >
                        {v.text}
                    </div>
                ))}
            </div>
        </div>
    );
};
