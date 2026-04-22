import { useState, useCallback, useEffect, useRef } from 'react';
import { Combatant } from '../models/Combatant';
import { calculateDamage, calculateHeal, getSkillActionType, rollHitCheck, RowActionType } from '../utils/combatMath';
import { Ability } from '../types';

export interface ActiveAction {
    id: string;
    actorId: string;
    targetIds: string[];
    type: 'damage' | 'heal' | 'magic';
    icon: 'sword' | 'bow' | 'fang' | 'fire' | 'heart' | 'zap' | 'note' | 'skull';
    geometry: 'melee' | 'range' | 'magic';
    isSpecial?: boolean;
    skillName?: string;
}

const getActionVisuals = (
    unit: Combatant,
    skillActionType: RowActionType,
    selectedSkillType: 'damage' | 'heal',
    targetType: 'single' | 'row' | 'all',
    isHero: boolean
) => {
    let icon: 'sword' | 'bow' | 'fang' | 'fire' | 'heart' | 'zap' | 'note' | 'skull' = 'sword';
    let geometry: 'melee' | 'range' | 'magic' = 'melee';
    let hitType: 'slash' | 'broken' | 'burn' = 'slash';

    if (skillActionType === 'support' || selectedSkillType === 'heal' || selectedSkillType === 'buff' || selectedSkillType === 'debuff') {
        icon = (selectedSkillType === 'debuff') ? 'skull' : (unit.job === 'Bard') ? 'note' : (unit.name === 'Thok' || unit.name === 'Zarek') ? 'zap' : 'heart';
        geometry = 'magic';
        hitType = (selectedSkillType === 'debuff') ? 'broken' : 'slash';
    } else if (skillActionType === 'ranged') {
        icon = 'bow';
        geometry = 'range';
        hitType = 'slash';
    } else if (skillActionType === 'magic') {
        icon = (unit.name === 'Zarek') ? 'zap' : 'fire';
        geometry = 'magic';
        hitType = (unit.name === 'Zarek') ? 'broken' : 'burn';
    } else if (unit.role === 'TANK') {
        icon = isHero ? 'sword' : 'fang';
        geometry = 'melee';
        hitType = 'broken';
    } else {
        icon = targetType !== 'single' ? 'fang' : 'sword';
        geometry = 'melee';
        hitType = 'slash';
    }

    return { icon, geometry, hitType };
};

export interface UnitIntent {
    actorId: string;
    targetId: string;
    atb: number;
    geometry: 'melee' | 'range' | 'magic';
}

export interface BattleLogEntry {
    id: string;
    message: string;
    tone: 'special' | 'support' | 'miss' | 'combat';
}

interface TargetSelectionParams {
    currentUnit: Combatant;
    isHero: boolean;
    selectedSkill: Ability;
    currentHeroes: Combatant[];
    currentEnemies: Combatant[];
}

export const selectTargetsForSkill = ({
    currentUnit,
    isHero,
    selectedSkill,
    currentHeroes,
    currentEnemies
}: TargetSelectionParams): Combatant[] => {
    const opponents = isHero ? currentEnemies : currentHeroes;
    const teammates = isHero ? currentHeroes : currentEnemies;
    const aliveOpponents = opponents.filter(o => o.hp > 0);
    const aliveTeammates = teammates.filter(t => t.hp > 0);
    const frontlineOpponents = aliveOpponents.filter(o => o.positionLine === 'VANGUARD');
    const canBypassFrontline =
        currentUnit.trait?.id === 'infiltrator' ||
        currentUnit.job === 'Archer' ||
        currentUnit.job === 'Thief' ||
        selectedSkill.actionType === 'ranged' ||
        selectedSkill.actionType === 'magic';

    const selectableOpponents =
        frontlineOpponents.length > 0 && !canBypassFrontline
            ? frontlineOpponents
            : aliveOpponents;

    const allyTargeting = selectedSkill.type === 'heal' || selectedSkill.type === 'buff';

    if (selectedSkill.targetType === 'all') {
        return allyTargeting ? aliveTeammates : aliveOpponents;
    }

    if (selectedSkill.targetType === 'row') {
        if (allyTargeting) {
            const frontlineTeammates = aliveTeammates.filter(t => t.positionLine === 'VANGUARD');
            return frontlineTeammates.length > 0 ? frontlineTeammates : aliveTeammates;
        }
        return frontlineOpponents.length > 0 ? frontlineOpponents : aliveOpponents;
    }

    if (selectedSkill.type === 'heal') {
        const lowestHpTarget = aliveTeammates
            .slice()
            .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
        return lowestHpTarget ? [lowestHpTarget] : [];
    }

    if (selectedSkill.type === 'buff') {
        const ally = aliveTeammates[Math.floor(Math.random() * aliveTeammates.length)];
        return ally ? [ally] : [];
    }

    const target = selectableOpponents[Math.floor(Math.random() * selectableOpponents.length)];
    return target ? [target] : [];
};

const prepareForBattle = (unit: Combatant): Combatant => {
    const copy = unit.clone();
    copy.vfx = [];
    copy.atb = 0;
    copy.isActing = false;
    copy.attackPhase = 'idle';
    copy.impactPulse = false;
    copy.hitShake = false;
    copy.hitType = null;
    copy.showImpact = false;
    copy.healSparkle = false;
    copy.traitGlow = false;
    copy.isCharging = false;
    copy.activeSigil = null;
    copy.isPopping = false;
    copy.activeChant = null;
    return copy;
};

export const useBattle = (initialHeroes: Combatant[], initialEnemies: Combatant[]) => {
    const [heroes, setHeroes] = useState<Combatant[]>(initialHeroes.map(h => {
        const copy = prepareForBattle(h);
        // Skill: Quick Start (+20% ATB at start)
        if (Object.values(copy.equipment).some(i => i?.skillName === 'Quick Start')) {
            copy.atb = 20;
        }
        return copy;
    }));
    const [enemies, setEnemies] = useState<Combatant[]>(initialEnemies.map(e => prepareForBattle(e)));
    const [isPaused, setIsPaused] = useState(true);
    const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
    const [winner, setWinner] = useState<'heros' | 'enemies' | null>(null);
    const [activeActions, setActiveActions] = useState<ActiveAction[]>([]);
    const [intents, setIntents] = useState<UnitIntent[]>([]);

    const log = useCallback((message: string, tone: BattleLogEntry['tone'] = 'combat') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setBattleLog(prev => [{ id, message, tone }, ...prev].slice(0, 8));
    }, []);

    const processAction = useCallback(async (unitId: string) => {
        // Initial state grab to check if valid, but we will use functional updates thereafter
        const all = [...heroesRef.current, ...enemiesRef.current];
        const unit = all.find(u => u.id === unitId);
        if (!unit || unit.hp <= 0 || unit.isActing) return;

        const isHero = unit.isHero;
        let selectedSkill = unit.abilities[0];
        if (unit.abilities[1] && Math.random() < (unit.abilities[1].procChance || 0)) {
            selectedSkill = unit.abilities[1];
            log(`!!! ${unit.name} triggers ${selectedSkill.name.toUpperCase()} !!!`, 'special');
        }

        const initialTargets = selectTargetsForSkill({
            currentUnit: unit,
            isHero,
            selectedSkill,
            currentHeroes: heroesRef.current,
            currentEnemies: enemiesRef.current
        });
        if (initialTargets.length === 0) {
            setHeroes(prev => prev.map(u => u.id === unitId ? (u.atb = 0, u.isActing = false, u) : u));
            setEnemies(prev => prev.map(u => u.id === unitId ? (u.atb = 0, u.isActing = false, u) : u));
            return;
        }

        const actionId = Math.random().toString(36).substr(2, 9);
        const skillVisuals = getActionVisuals(unit, getSkillActionType(selectedSkill), selectedSkill.type as any, selectedSkill.targetType, isHero);

        // --- PHASE: ADVANCE ---
        const startTurn = (prev: Combatant[]) => prev.map(u => {
            const instance = Combatant.rehydrate(u);
            if (instance.id === unitId) {
                instance.atb = 0;
                instance.isActing = true;
                instance.attackPhase = 'advance';
            }
            return instance;
        });
        setHeroes(prev => startTurn(prev));
        setEnemies(prev => startTurn(prev));

        // Sync refs immediately for the interval logic
        const refUnit = [...heroesRef.current, ...enemiesRef.current].find(u => u.id === unitId);
        if (refUnit) {
            refUnit.atb = 0;
            refUnit.isActing = true;
        }

        setActiveActions(prev => [...prev, {
            id: actionId,
            actorId: unitId,
            targetIds: initialTargets.map(t => t.id),
            type: selectedSkill.type as any,
            icon: skillVisuals.icon,
            geometry: skillVisuals.geometry,
            isSpecial: selectedSkill === unit.abilities[1],
            skillName: selectedSkill.name
        }]);

        await new Promise(r => setTimeout(r, 120));

        // --- PHASE: STRIKE ---
        const executeStrike = (prev: Combatant[], allies: Combatant[], opponents: Combatant[]) => prev.map(raw => {
            const target = Combatant.rehydrate(raw);
            const allInstances = [...allies, ...opponents].map(a => Combatant.rehydrate(a));
            const actor = allInstances.find(u => u.id === unitId);
            if (!actor) return target;

            const isTarget = initialTargets.some(t => t.id === target.id);
            if (isTarget && target.hp > 0) {
                if (selectedSkill.type === 'damage') {
                    const skillType = getSkillActionType(selectedSkill);
                    const damageType = (skillType === 'support') ? 'magic' : skillType;
                    const hit = rollHitCheck(actor, target, allInstances.filter(i => i.isHero === actor.isHero), allInstances.filter(i => i.isHero !== actor.isHero), damageType as any);
                    if (!hit.hit) {
                        target.addVfx('MISS', 'miss');
                    } else {
                        const dmg = calculateDamage(actor, target, allInstances.filter(i => i.isHero === actor.isHero), allInstances.filter(i => i.isHero !== actor.isHero), damageType as any, selectedSkill.val);
                        target.hp = Math.max(0, target.hp - dmg);
                        target.addVfx(`-${dmg}`, 'damage');
                        target.triggerHit(skillVisuals.hitType);
                    }
                } else if (selectedSkill.type === 'heal') {
                    const heal = calculateHeal(actor, selectedSkill.val, allInstances.filter(i => i.isHero === actor.isHero));
                    target.hp = Math.min(target.maxHp, target.hp + heal);
                    target.addVfx(`+${heal}`, 'heal');
                    target.triggerHeal();
                } else if (selectedSkill.type === 'buff' || selectedSkill.type === 'debuff') {
                    const val = selectedSkill.val;
                    const stat = selectedSkill.stat || 'ATK';
                    target.addBattleBuff(stat, val);
                    target.addVfx(`${val > 0 ? '+' : ''}${val}% ${stat}`, val > 0 ? 'heal' : 'miss');
                    if (val > 0) target.triggerHeal(); else target.triggerHit('burn');
                }
            }
            if (target.id === unitId) target.attackPhase = 'strike';
            return target;
        });

        setHeroes(prev => executeStrike(prev, isHero ? heroesRef.current : enemiesRef.current, isHero ? enemiesRef.current : heroesRef.current));
        setEnemies(prev => executeStrike(prev, isHero ? enemiesRef.current : heroesRef.current, isHero ? heroesRef.current : enemiesRef.current));
        log(`${unit.name} uses ${selectedSkill.name.toUpperCase()}!`, selectedSkill.type === 'heal' ? 'support' : 'combat');

        await new Promise(r => setTimeout(r, 200));

        // --- PHASE: RETURN ---
        const endTurn = (prev: Combatant[]) => prev.map(u => {
            const instance = Combatant.rehydrate(u);
            if (instance.id === unitId) {
                instance.attackPhase = 'return';
            }
            return instance;
        });
        setHeroes(prev => endTurn(prev));
        setEnemies(prev => endTurn(prev));

        await new Promise(r => setTimeout(r, 120));

        // --- PHASE: IDLE (CLEANUP) ---
        const finalizeTurn = (prev: Combatant[]) => prev.map(u => {
            const instance = Combatant.rehydrate(u);
            if (instance.id === unitId) {
                instance.attackPhase = 'idle';
                instance.isActing = false;
            }
            return instance;
        });
        setHeroes(prev => finalizeTurn(prev));
        setEnemies(prev => finalizeTurn(prev));

        if (refUnit) {
            refUnit.isActing = false;
            refUnit.attackPhase = 'idle';
        }

        setActiveActions(prev => prev.filter(a => a.id !== actionId));

        // Victory Check
        const checkWin = () => {
            const h = heroesRef.current;
            const e = enemiesRef.current;
            const hWin = e.every(unit => unit.hp <= 0);
            const eWin = h.every(unit => unit.hp <= 0);
            if (hWin || eWin) {
                [...h, ...e].forEach(c => c.clearBattleBuffs());
                setWinner(hWin ? 'heros' : 'enemies');
            }
        };
        checkWin();
    }, [log]);

    const heroesRef = useRef(heroes);
    const enemiesRef = useRef(enemies);
    const isPausedRef = useRef(isPaused);
    const winnerRef = useRef(winner);

    useEffect(() => { heroesRef.current = heroes; }, [heroes]);
    useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    useEffect(() => { winnerRef.current = winner; }, [winner]);

    useEffect(() => {
        if (winnerRef.current) return;

        const interval = setInterval(() => {
            if (isPausedRef.current || winnerRef.current) return;

            const currentHeroes = heroesRef.current;
            const currentEnemies = enemiesRef.current;
            const allAlive = [...currentHeroes, ...currentEnemies].filter(u => u.hp > 0);
            
            allAlive.forEach(u => {
                const instance = Combatant.rehydrate(u);
                if (!instance.isActing) instance.updateAtb(0.05);
            });

            const newIntents: UnitIntent[] = allAlive.map(u => {
                let tid = "";
                let geom: 'melee' | 'range' | 'magic' = 'melee';
                const primarySkill = u.abilities[0];
                const primaryActionType = getSkillActionType(primarySkill);
                if (primarySkill.type === 'heal') {
                    const teammates = u.isHero ? currentHeroes : currentEnemies;
                    tid = teammates.filter(t => t.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0]?.id || "";
                    geom = 'magic';
                } else {
                    const opponents = u.isHero ? currentEnemies : currentHeroes;
                    const front = opponents.filter(t => t.positionLine === 'VANGUARD' && t.hp > 0);
                    const canBypassFront = u.trait?.id === 'infiltrator' || u.job === 'Archer' || u.job === 'Thief' || primaryActionType === 'ranged' || primaryActionType === 'magic';
                    const validTargets = front.length > 0 && !canBypassFront ? front : opponents.filter(t => t.hp > 0);
                    tid = validTargets[0]?.id || "";
                    geom = primaryActionType === 'ranged' ? 'range' : primaryActionType === 'magic' || primaryActionType === 'support' ? 'magic' : 'melee';
                }
                return { actorId: u.id, targetId: tid, atb: u.atb, geometry: geom };
            });
            setIntents(newIntents);

            const actors = allAlive.filter(u => u.atb >= 100 && !u.isActing);
            actors.forEach(actor => processAction(actor.id));

            setHeroes([...currentHeroes]);
            setEnemies([...currentEnemies]);
        }, 50);

        return () => clearInterval(interval);
    }, [processAction]);

    return {
        heroes,
        enemies,
        isPaused,
        setIsPaused,
        battleLog,
        winner,
        activeActions,
        intents,
        setHeroes,
        setEnemies
    };
};
