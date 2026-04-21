import React, { useMemo, useState } from 'react';
import { Combatant } from '../models/Combatant';
import { Item } from '../types';
import { StatLine } from './UI';
import { X, Sword, Shield, Zap, Heart, Package, Crown, Shirt, HardHat, Footprints, AlertTriangle, Wind, Music } from 'lucide-react';
import { clsx } from 'clsx';
import { getHeroPortraitUrl } from '../utils/heroPortraits';

interface SyndicateArsenalProps {
    isOpen: boolean;
    onClose: () => void;
    heroes: Combatant[];
    vault: Item[];
    onEquip: (heroId: string, item: Item, slot: string) => void;
    onUnequip: (heroId: string, slot: string) => void;
}

type EquipmentSlot = 'weapon1' | 'weapon2' | 'hat' | 'chest' | 'shoes';
type EquipmentEntry = Item & { isPlaceholder?: boolean; parentSlot?: string };

const rarityClasses: Record<string, string> = {
    Common: 'border-zinc-700/70 bg-zinc-900/70',
    Uncommon: 'border-emerald-500/35 bg-emerald-950/20',
    Rare: 'border-cyan-500/35 bg-cyan-950/20',
    Epic: 'border-fuchsia-500/35 bg-fuchsia-950/20',
    Legendary: 'border-amber-500/40 bg-amber-950/20'
};

export const SyndicateArsenal: React.FC<SyndicateArsenalProps> = ({
    isOpen,
    onClose,
    heroes,
    vault,
    onEquip,
    onUnequip
}) => {
    const displayHeroes = useMemo(() => heroes.slice(0, 3), [heroes]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const selectedInventoryItem = selectedItemId ? vault.find(item => item.id === selectedItemId) ?? null : null;

    if (!isOpen) return null;

    const getSlotItem = (hero: Combatant, slot: EquipmentSlot): EquipmentEntry | null => {
        const rawItem = hero.equipment[slot] as EquipmentEntry | undefined;
        return rawItem ?? null;
    };

    const isSlotLocked = (hero: Combatant, slot: EquipmentSlot): boolean =>
        slot === 'weapon2' && Boolean(hero.equipment.weapon1?.isTwoHanded);

    const canUseItem = (hero: Combatant, item: Item): boolean => {
        const raceBlocked = item.allowedRaces && !item.allowedRaces.includes(hero.race);
        const jobBlocked = item.allowedJobs && !item.allowedJobs.includes(hero.job);
        return !(raceBlocked || jobBlocked);
    };

    const pickSlot = (hero: Combatant, item: Item): EquipmentSlot => {
        if (item.type === 'HAT') return 'hat';
        if (item.type === 'CHEST') return 'chest';
        if (item.type === 'SHOES') return 'shoes';
        if (item.type === 'WEAPON') return hero.equipment.weapon1 ? 'weapon2' : 'weapon1';
        return 'weapon1';
    };

    const getItemTypeIcon = (item: Item) => {
        if (item.type === 'WEAPON') return <Sword className="w-6 h-6 text-amber-300" />;
        if (item.type === 'HAT') return <HardHat className="w-6 h-6 text-zinc-200" />;
        if (item.type === 'CHEST') return <Shirt className="w-6 h-6 text-sky-300" />;
        if (item.type === 'SHOES') return <Footprints className="w-6 h-6 text-emerald-300" />;
        return <Heart className="w-6 h-6 text-rose-300" />;
    };

    const renderItemVisual = (item: Item, className: string) => {
        if (item.imagePath) {
            return (
                <img
                    src={item.imagePath}
                    alt={item.name}
                    className={clsx(className, 'object-cover')}
                />
            );
        }
        return (
            <div className={clsx(className, 'flex items-center justify-center')}>
                {getItemTypeIcon(item)}
            </div>
        );
    };

    const slotMatchesItem = (slot: EquipmentSlot, item: Item): boolean => {
        if (item.type === 'WEAPON') return slot === 'weapon1' || slot === 'weapon2';
        if (item.type === 'HAT') return slot === 'hat';
        if (item.type === 'CHEST') return slot === 'chest';
        if (item.type === 'SHOES') return slot === 'shoes';
        return false;
    };

    const formatBoosts = (item: Item): string => {
        if (!item.statBoost) return 'No stat boosts';
        const entries = Object.entries(item.statBoost);
        if (entries.length === 0) return 'No stat boosts';
        return entries
            .map(([key, value]) => `${key.toUpperCase()} ${value >= 0 ? '+' : ''}${value}`)
            .join(' • ');
    };

    return (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-2 bg-black/35 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-[90vw] h-[84vh] bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col">
                <div className="absolute inset-0 pointer-events-none">
                    <img src="/assets/bg_inventory_modal.png" alt="" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/45 via-zinc-950/30 to-zinc-950/55" />
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 z-30 w-8 h-8 rounded-md border border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                    aria-label="Close inventory"
                >
                    <X className="w-4 h-4 mx-auto" />
                </button>
                <div
                    className="relative z-10 flex-1 min-h-0 grid gap-0 p-2"
                    style={{ gridTemplateColumns: '40% 60%' }}
                >
                    <div className="relative border-r border-zinc-800 p-2 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300">Items</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{vault.length} total</span>
                        </div>
                        <div className="relative flex-1 min-h-0">
                            <div className="h-full overflow-y-auto overflow-x-visible custom-scrollbar pr-1">
                                {vault.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-600">
                                        <Package className="w-10 h-10" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest">No items in inventory</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3 p-2">
                                        {vault.map(item => {
                                            const isSelected = selectedItemId === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedItemId(prev => (prev === item.id ? null : item.id));
                                                    }}
                                                    className={clsx(
                                                        'group relative w-full aspect-square rounded-xl border text-left overflow-hidden transition will-change-transform',
                                                        rarityClasses[item.rarity] ?? rarityClasses.Common,
                                                        isSelected
                                                            ? 'border-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.35)]'
                                                            : 'hover:border-cyan-400/60'
                                                    )}
                                                >
                                                    <div className="absolute inset-0">
                                                        {renderItemVisual(item, 'w-full h-full')}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/50 to-zinc-950/10 group-hover:from-zinc-950/90 group-hover:via-zinc-950/35 transition" />
                                                    </div>
                                                    <div className="absolute inset-x-2 bottom-2">
                                                        <div className="text-[10px] font-black uppercase leading-tight text-zinc-100 mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-[8px] font-bold uppercase text-cyan-300 leading-tight mb-1">{formatBoosts(item)}</div>
                                                        <div className="text-[8px] font-bold text-zinc-300 normal-case leading-tight">
                                                            Jobs: {item.allowedJobs?.join(', ') ?? 'Any'}
                                                        </div>
                                                        <div className="text-[8px] font-bold text-zinc-300 normal-case leading-tight">
                                                            Races: {item.allowedRaces?.join(', ') ?? 'Any'}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            {selectedInventoryItem && (
                                <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm rounded-md border border-zinc-700/80 p-3">
                                    <div className="h-full flex items-center justify-center">
                                        <div className="relative w-56 h-[360px] rounded-xl border border-zinc-600 bg-zinc-900/90 overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedItemId(null)}
                                                className="absolute top-2 right-2 z-40 w-7 h-7 rounded-md border border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:text-rose-400 hover:border-rose-500/50 transition"
                                                aria-label="Cancel selected item"
                                            >
                                                <X className="w-4 h-4 mx-auto" />
                                            </button>
                                            <div className="absolute inset-0">
                                                {renderItemVisual(selectedInventoryItem, 'w-full h-full')}
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/45 to-zinc-950/10" />
                                            </div>
                                            <div className="absolute inset-x-3 bottom-3">
                                                <div className="text-[9px] font-black uppercase tracking-wide text-zinc-300">
                                                    {selectedInventoryItem.type} | {selectedInventoryItem.rarity}
                                                </div>
                                                <div className="text-[13px] font-black uppercase text-white leading-tight mt-0.5">
                                                    {selectedInventoryItem.name}
                                                </div>
                                                <div className="mt-1 text-[9px] font-bold uppercase text-cyan-300">
                                                    {formatBoosts(selectedInventoryItem)}
                                                </div>
                                                {selectedInventoryItem.skillName && (
                                                    <div className="mt-1.5 p-1.5 rounded border border-cyan-500/30 bg-cyan-950/40">
                                                        <div className="text-[9px] font-black uppercase text-cyan-200 leading-none mb-1 flex items-center gap-1">
                                                            <Zap className="w-2.5 h-2.5" /> {selectedInventoryItem.skillName}
                                                        </div>
                                                        <div className="text-[8px] font-bold text-cyan-100/80 leading-tight normal-case">
                                                            {selectedInventoryItem.skillDesc}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-1.5 text-[9px] text-zinc-300 normal-case leading-snug">
                                                    {selectedInventoryItem.description}
                                                </div>
                                                <div className="mt-2 text-[8px] font-black uppercase text-zinc-500">Requirements</div>
                                                <div className="text-[9px] font-bold text-zinc-300 normal-case">
                                                    Jobs: {selectedInventoryItem.allowedJobs?.join(', ') ?? 'Any'}
                                                </div>
                                                <div className="text-[9px] font-bold text-zinc-300 normal-case">
                                                    Races: {selectedInventoryItem.allowedRaces?.join(', ') ?? 'Any'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-2 min-h-0 flex flex-col gap-2">
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 3 }).map((_, idx) => {
                                const hero = displayHeroes[idx];
                                if (!hero) {
                                    return (
                                        <div key={`empty-${idx}`} className="h-[320px] rounded-xl border border-zinc-800/60 bg-zinc-900/40" />
                                    );
                                }

                                return (
                                    <div key={hero.id} className="space-y-1.5">
                                        <div className="flex items-start gap-2 px-1">
                                            <div className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 mt-0.5">
                                                <img
                                                    src={`/assets/icon_${hero.role.toLowerCase()}.png`}
                                                    className="w-full h-full object-cover grayscale brightness-125"
                                                    alt={hero.role}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-[11px] font-black uppercase tracking-tight text-white leading-none">{hero.name}</h3>
                                                    {hero.isLeader && <Crown className="w-3 h-3 text-amber-400" fill="currentColor" />}
                                                </div>
                                                <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{hero.race} • {hero.job}</p>
                                            </div>
                                        </div>
                                        <div className={clsx(
                                            'h-[312px] w-full rounded-xl border text-left overflow-hidden transition relative',
                                            hero.isLeader
                                                ? 'border-amber-400/70'
                                                : 'border-zinc-800'
                                        )}>
                                            <img
                                                src={getHeroPortraitUrl(hero.imageId)}
                                                alt={hero.name}
                                                className="absolute inset-0 w-full h-full object-cover object-top"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                            <div className="absolute inset-0 pointer-events-none">
                                                {[
                                                    { slot: 'hat' as EquipmentSlot, label: 'Hat', position: 'top-2 left-1/2 -translate-x-1/2', placeholder: <HardHat className="w-3 h-3" /> },
                                                    { slot: 'chest' as EquipmentSlot, label: 'Armor', position: 'top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2', placeholder: <Shirt className="w-3 h-3" /> },
                                                    { slot: 'weapon2' as EquipmentSlot, label: 'Left Hand', position: 'top-[60%] right-2 -translate-y-1/2', placeholder: <Sword className="w-3 h-3" /> },
                                                    { slot: 'weapon1' as EquipmentSlot, label: 'Right Hand', position: 'top-[60%] left-2 -translate-y-1/2', placeholder: <Sword className="w-3 h-3" /> },
                                                    { slot: 'shoes' as EquipmentSlot, label: 'Shoes', position: 'bottom-8 left-1/2 -translate-x-1/2', placeholder: <Footprints className="w-3 h-3" /> }
                                                ].map(({ slot, label, position, placeholder }) => {
                                                    const item = getSlotItem(hero, slot);
                                                    const locked = isSlotLocked(hero, slot);
                                                    const incompatible = Boolean(item && !locked && !canUseItem(hero, item));
                                                    const relevantForSelected = Boolean(selectedInventoryItem && slotMatchesItem(slot, selectedInventoryItem));
                                                    const selectedCompatible = Boolean(relevantForSelected && selectedInventoryItem && canUseItem(hero, selectedInventoryItem));
                                                    const selectedIncompatible = Boolean(relevantForSelected && selectedInventoryItem && !canUseItem(hero, selectedInventoryItem));
                                                    const hasActiveSelection = Boolean(selectedInventoryItem && selectedInventoryItem.type !== 'CONSUMABLE');
                                                    const disableSlot = hasActiveSelection && !selectedCompatible;
                                                    const itemLabel = locked
                                                        ? 'Locked'
                                                        : item?.isTwoHanded && slot === 'weapon2'
                                                            ? '2H'
                                                            : item?.name ?? 'Empty';

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={`${hero.id}-${slot}`}
                                                            disabled={disableSlot}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                if (!selectedInventoryItem || selectedInventoryItem.type === 'CONSUMABLE') return;
                                                                if (!slotMatchesItem(slot, selectedInventoryItem)) return;
                                                                if (!canUseItem(hero, selectedInventoryItem)) return;
                                                                if (locked) return;
                                                                onEquip(hero.id, selectedInventoryItem, slot);
                                                                setSelectedItemId(null);
                                                            }}
                                                            className={clsx(
                                                                'absolute pointer-events-auto rounded-md border px-2 py-1 w-[96px] h-[40px] text-left',
                                                                position,
                                                                selectedCompatible && 'border-emerald-300 bg-emerald-900/65 shadow-[0_0_16px_rgba(74,222,128,0.6)] ring-1 ring-emerald-200/50 hover:bg-emerald-800/80 hover:scale-[1.03] hover:shadow-[0_0_22px_rgba(74,222,128,0.75)]',
                                                                selectedIncompatible && 'border-rose-300 bg-rose-900/70 shadow-[0_0_16px_rgba(251,113,133,0.6)] ring-1 ring-rose-200/50',
                                                                locked
                                                                    ? 'border-rose-500/30 bg-black/45 backdrop-blur-sm text-rose-300'
                                                                    : incompatible
                                                                        ? 'border-amber-500/70 bg-black/55 backdrop-blur-sm text-amber-200'
                                                                    : item
                                                                        ? 'border-cyan-500/40 bg-black/45 backdrop-blur-sm text-cyan-200'
                                                                        : 'border-dashed border-zinc-500/60 bg-black/50 text-zinc-300',
                                                                disableSlot && 'cursor-not-allowed opacity-55 saturate-75'
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="text-[8px] font-black uppercase tracking-wider">{label}</span>
                                                                {item && !locked && !item.isPlaceholder && (
                                                                    <span
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            onUnequip(hero.id, slot);
                                                                        }}
                                                                        className="text-[8px] font-black uppercase text-rose-400 hover:text-rose-300"
                                                                    >
                                                                        X
                                                                    </span>
                                                                )}
                                                                {incompatible && (
                                                                    <AlertTriangle className="w-3 h-3 text-amber-300" />
                                                                )}
                                                                {selectedIncompatible && (
                                                                    <span className="text-[9px] font-black text-rose-200">!</span>
                                                                )}
                                                                {selectedCompatible && (
                                                                    <span className="text-[8px] font-black text-emerald-100">OK</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[9px] font-bold uppercase truncate">
                                                                {!item && !locked && <span className="text-zinc-400">{placeholder}</span>}
                                                                <span className="truncate">{itemLabel}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {(() => {
                                                const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
                                                return (
                                                    <div className="absolute inset-x-2 bottom-1.5 z-20">
                                                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wide text-zinc-200 mb-1">
                                                            <span>Hp</span>
                                                            <span className="text-white">{Math.floor(hero.hp)}/{hero.maxHp}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-zinc-900/90 rounded-full overflow-hidden border border-zinc-800/70">
                                                            <div className="h-full bg-rose-600 transition-all duration-300" style={{ width: `${hpPercent}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="px-1 py-1.5 space-y-1">
                                            <StatLine 
                                                label="Atk" 
                                                current={hero.getATK(heroes)} 
                                                base={hero.power} 
                                                icon={hero.job === 'Bard' ? <Music className="w-3 h-3 text-pink-500" /> : <Sword className="w-3 h-3 text-emerald-500" />}
                                                breakdown={hero.getStatBreakdown?.('ATK', heroes)}
                                            />
                                            <StatLine 
                                                label="Def" 
                                                current={hero.getDEF(heroes)} 
                                                base={hero.def} 
                                                icon={<Shield className="w-3 h-3 text-blue-500" />}
                                                breakdown={hero.getStatBreakdown?.('DEF', heroes)}
                                            />
                                            <StatLine 
                                                label="Spd" 
                                                current={hero.getSPD(heroes)} 
                                                base={hero.speed} 
                                                icon={<Wind className="w-3 h-3 text-cyan-500" />}
                                                breakdown={hero.getStatBreakdown?.('SPD', heroes)}
                                            />
                                            <div className="mt-2">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Skills</div>
                                                <div className="text-[9px] font-bold text-zinc-300 leading-tight flex flex-wrap gap-x-1.5 gap-y-1">
                                                    {hero.abilities.length > 1 ? (
                                                        hero.abilities.slice(1).map((ability, index, arr) => (
                                                            <span key={`${hero.id}-${ability.id}`} className="relative group">
                                                                <span className="cursor-help underline decoration-dotted decoration-zinc-500/70 hover:text-cyan-300 transition-colors">
                                                                    {ability.name}{index < arr.length - 1 ? ',' : ''}
                                                                </span>
                                                                <span className="pointer-events-none absolute left-0 bottom-full mb-1 z-30 w-48 rounded-md border border-zinc-700 bg-zinc-950/95 px-2 py-1 text-[8px] font-semibold normal-case text-zinc-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition">
                                                                    {ability.description}
                                                                </span>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span>No special skills</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
