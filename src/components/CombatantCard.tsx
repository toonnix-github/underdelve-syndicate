import React from 'react';
import { Combatant } from '../models/Combatant';
import { ProgressBar, cn } from './UI';
import { Shield, Sword, Zap, Heart, Flame, Target, Sparkles, Skull, Music } from 'lucide-react';
import { clsx } from 'clsx';
import { getSkillActionType } from '../utils/combatMath';
import { getHeroPortraitUrl } from '../utils/heroPortraits';
import { getCombatStatBreakdown } from '../utils/combatStats';

interface CombatantCardProps {
    unit: Combatant;
    isEnemy?: boolean;
    className?: string;
    party?: Combatant[];
    activeIcon?: string | null;
    isSpecialAction?: boolean;
    specialColor?: string;
    showInfoBadge?: boolean;
    onInfoHoverStart?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onInfoHoverEnd?: () => void;
    hideAtb?: boolean;
    footer?: React.ReactNode;
}

export const CombatantCard: React.FC<CombatantCardProps> = ({
    unit,
    isEnemy = false,
    className,
    party = [],
    activeIcon,
    isSpecialAction = false,
    specialColor = '#f59e0b',
    showInfoBadge = false,
    onInfoHoverStart,
    onInfoHoverEnd,
    hideAtb = false,
    footer
}) => {
    const primaryActionType = getSkillActionType(unit.abilities[0]);
    const statBreakdown = getCombatStatBreakdown(unit, party);

    const getTranslateX = () => {
        if (unit.attackPhase === 'idle') return '0px';
        const direction = isEnemy ? 1 : -1;
        const attackKind = activeIcon === 'bow' ? 'range' : (activeIcon === 'fire' || activeIcon === 'heart' || activeIcon === 'zap' ? 'magic' : 'melee');
        const forwardDistance = attackKind === 'range' ? 20 : attackKind === 'magic' ? 42 : 72;
        const overshoot = attackKind === 'range' ? 1 : attackKind === 'magic' ? 6 : 12;
        const amount = unit.attackPhase === 'return'
            ? -overshoot
            : forwardDistance;
        return `${direction * amount}px`;
    };

    const getTransformTransition = () => {
        if (unit.attackPhase === 'idle') {
            return 'transform 210ms cubic-bezier(0.42, 0, 0.58, 1)';
        }
        if (unit.attackPhase === 'return') {
            return 'transform 130ms cubic-bezier(0.16, 1, 0.3, 1)';
        }
        return 'transform 95ms cubic-bezier(0.18, 0.9, 0.28, 1)';
    };

    const specialStyle: React.CSSProperties | undefined = isSpecialAction
        ? {
            borderColor: specialColor,
            boxShadow: `0 0 22px ${specialColor}66, 0 0 44px ${specialColor}22`,
            ['--special-color' as any]: specialColor,
        }
        : undefined;

    const powerIcon = unit.job === 'Bard'
        ? <Music size={8} className="text-pink-500" />
        : primaryActionType === 'support'
            ? <Sparkles size={8} className="text-emerald-500" />
            : primaryActionType === 'ranged'
                ? <Target size={8} className="text-amber-400" />
                : primaryActionType === 'magic'
                    ? <Flame size={8} className="text-fuchsia-400" />
                    : <Sword size={8} className="text-amber-500" />;

    const renderDelta = (delta: number) => {
        if (delta === 0) return null;
        return (
            <span className={clsx("text-[8px] leading-none", delta > 0 ? "text-emerald-300" : "text-rose-300")}>
                {delta > 0 ? `+${delta}` : `${delta}`}
            </span>
        );
    };

    return (
        <div
            id={`unit-${unit.id}`}
            className="relative will-change-transform transform-gpu"
            onMouseEnter={onInfoHoverStart}
            onMouseLeave={onInfoHoverEnd}
            style={{
                transform: `translate3d(${getTranslateX()}, 0, 0)`,
                transition: getTransformTransition(),
                transformOrigin: 'center center',
                backfaceVisibility: 'hidden',
                contain: 'layout paint style',
                zIndex: unit.isActing ? 40 : unit.hitShake ? 35 : 10,
            }}
        >
            <div
                className={cn(
                    "relative rounded-xl border-2 overflow-hidden isolate",
                    isEnemy ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-700 bg-zinc-900/90",
                    unit.isActing && !isSpecialAction && "scale-105 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
                    unit.hp <= 0 && "grayscale opacity-50 translate-y-4 rotate-2",
                    unit.hitShake && !isSpecialAction && "animate-hit-shake",
                    isSpecialAction && "animate-special-surge",
                    className
                )}
                style={specialStyle}
            >
                {isSpecialAction && (
                    <div
                        className="absolute inset-0 z-[5] pointer-events-none animate-special-flash"
                        style={{ backgroundColor: specialColor }}
                    />
                )}

                {showInfoBadge && (
                    <div
                        aria-hidden="true"
                        className={clsx(
                            "absolute top-2 right-2 z-[90] w-5 h-5 rounded-full border text-[10px] font-black leading-none flex items-center justify-center pointer-events-none",
                            isEnemy
                                ? "bg-red-950/60 border-red-400/45 text-red-100"
                                : "bg-cyan-950/60 border-cyan-400/45 text-cyan-100"
                        )}
                    >
                        !
                    </div>
                )}

                <div className="absolute inset-0 z-0 opacity-80 brightness-110 contrast-110">
                    <img
                        src={getHeroPortraitUrl(unit.imageId)}
                        alt={unit.name}
                        className={clsx(
                            "w-full h-full object-cover transition-transform duration-300",
                            unit.hitShake && "scale-110 brightness-150 saturate-150"
                        )}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300/111/444?text=' + unit.role;
                        }}
                    />
                </div>

                {unit.activeChant && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[80] pointer-events-none flex items-center justify-center">
                        <div className="px-4 py-2 bg-black/80 border-y-2 border-amber-500/50 backdrop-blur-md animate-in zoom-in fade-in duration-300">
                            <span className="text-lg font-black italic text-amber-500 uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                                {unit.activeChant}
                            </span>
                        </div>
                    </div>
                )}

                {unit.isActing && activeIcon && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center animate-in zoom-in duration-300 pointer-events-none">
                        <div className="filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                            {activeIcon === 'sword' && <Sword size={84} className="text-amber-500 opacity-90" />}
                            {activeIcon === 'fire' && <Flame size={84} className="text-red-500 opacity-90" />}
                            {activeIcon === 'heart' && <Heart size={84} className="text-emerald-500 opacity-90" />}
                            {activeIcon === 'zap' && <Zap size={84} className="text-blue-400 opacity-90" />}
                            {activeIcon === 'bow' && <Target size={84} className="text-zinc-300 opacity-90" />}
                            {activeIcon === 'skull' && <Skull size={84} className="text-rose-600 opacity-90 filter drop-shadow-[0_0_15px_rgba(225,29,72,0.6)]" />}
                            {activeIcon === 'note' && <Music size={84} className="text-pink-400 opacity-90" />}
                            {activeIcon === 'fang' && <div className="text-4xl font-black italic tracking-tight opacity-90 text-red-300 filter brightness-150">FANG</div>}
                        </div>
                    </div>
                )}

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

                <div className="relative z-10 p-2 flex flex-col h-full bg-gradient-to-t from-black via-black/40 to-transparent">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                            <img
                                src={`/assets/icon_${unit.role.toLowerCase()}.png`}
                                className="w-full h-full object-cover grayscale brightness-125"
                                alt={unit.role}
                            />
                        </div>
                        <div className="text-left">
                            <h3 className="text-[11px] font-black uppercase tracking-tight text-white leading-none">{unit.name}</h3>
                            <div className="flex gap-1 mt-0.5">
                                <span className="text-[6px] font-black px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase tracking-widest">{unit.race}</span>
                                <span className="text-[6px] font-black px-1 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/50 uppercase tracking-widest">{unit.job}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter mb-1">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <div className="flex items-center gap-0.5">
                                    {powerIcon}
                                    <span>{statBreakdown.atk.final}</span>
                                    {renderDelta(statBreakdown.atk.delta)}
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <Shield size={8} className="text-blue-500" />
                                    <span>{statBreakdown.def.final}</span>
                                    {renderDelta(statBreakdown.def.delta)}
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <Zap size={8} className="text-cyan-500" />
                                    <span>{statBreakdown.spd.final}</span>
                                    {renderDelta(statBreakdown.spd.delta)}
                                </div>
                            </div>
                            <span className="text-zinc-100">{Math.floor(unit.hp)}/{unit.maxHp}</span>
                        </div>
                        <ProgressBar
                            value={unit.hp}
                            max={unit.maxHp}
                            color="bg-rose-600"
                            label=""
                            showValues={false}
                            className="space-y-0"
                        />
                        {!hideAtb && (
                            <ProgressBar
                                value={unit.atb}
                                max={100}
                                color="bg-cyan-500"
                                label=""
                                className="space-y-0 mt-1"
                            />
                        )}
                        {statBreakdown.eva.delta > 0 && (
                            <div className="mt-1 text-[8px] font-black uppercase tracking-[0.14em] text-cyan-200">
                                EVA +{statBreakdown.eva.delta}
                            </div>
                        )}
                    </div>
                    {footer && (
                        <div className="mt-1 pt-2 border-t border-zinc-900/50 overflow-visible">
                            {footer}
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 pointer-events-none z-[100] overflow-visible">
                    {unit.vfx.map((v, i) => (
                        <div
                            key={v.id}
                            className={clsx(
                                "absolute top-1/2 left-1/2 font-black text-4xl animate-damage-float-ro tabular-nums",
                                v.type === 'damage' && "text-white outline-text",
                                v.type === 'heal' && "text-green-400 outline-text",
                                v.type === 'miss' && "text-cyan-300 outline-text drop-shadow-[0_0_12px_rgba(34,211,238,0.85)]"
                            )}
                            style={{
                                marginLeft: `${(i % 3 - 1) * 20}px`,
                                animationDelay: `${i * 0.05}s`,
                                textShadow: '2px 2px 0px rgba(0,0,0,1), -2px -2px 0px rgba(0,0,0,1), 2px -2px 0px rgba(0,0,0,1), -2px 2px 0px rgba(0,0,0,1)'
                            }}
                        >
                            {v.text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
