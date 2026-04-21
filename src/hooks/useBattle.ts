import { useState, useCallback, useEffect } from 'react';
import { Combatant } from '../models/Combatant';
import { calculateDamage, calculateHeal, getSkillActionType, rollHitCheck, RowActionType } from '../utils/combatMath';

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
    let icon: 'sword' | 'bow' | 'fang' | 'fire' | 'heart' | 'zap' | 'note' = 'sword';
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

export const useBattle = (initialHeroes: Combatant[], initialEnemies: Combatant[]) => {
    const [heroes, setHeroes] = useState<Combatant[]>(initialHeroes.map(h => {
        const copy = h.clone();
        // Skill: Quick Start (+20% ATB at start)
        if (Object.values(copy.equipment).some(i => i?.skillName === 'Quick Start')) {
            copy.atb = 20;
        }
        return copy;
    }));
    const [enemies, setEnemies] = useState<Combatant[]>(initialEnemies.map(e => e.clone()));
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
        const all = [...heroes, ...enemies];
        const unit = all.find(u => u.id === unitId);
        if (!unit || unit.hp <= 0 || unit.isActing) return;

        const isHero = unit.isHero;
        
        // --- SIGNATURE MOVE SELECTION ---
        let selectedSkill = unit.abilities[0]; 
        if (unit.abilities[1] && Math.random() < (unit.abilities[1].procChance || 0)) {
            selectedSkill = unit.abilities[1]; 
            unit.triggerChant(selectedSkill.name);
            log(`!!! ${unit.name} triggers ${selectedSkill.name.toUpperCase()} !!!`, 'special');
        }

        // Skill: Chain Lightning (15% proc to make single-target magic hit row)
        let isChainLightningProc = false;
        if (selectedSkill.actionType === 'magic' && selectedSkill.targetType === 'single') {
            if (Object.values(unit.equipment).some(i => i?.skillName === 'Chain Lightning')) {
                if (Math.random() < 0.15) {
                    isChainLightningProc = true;
                    log(`${unit.name}'S CHAIN LIGHTNING PROCS!`, 'special');
                }
            }
        }
        
        // --- MULTI-TARGET RESOLUTION ---
        let targets: Combatant[] = [];
        const opponents = isHero ? enemies : heroes;
        const teammates = isHero ? heroes : enemies;
        const frontlineOpponents = opponents.filter(o => o.positionLine === 'VANGUARD' && o.hp > 0);
        
        const canBypassFrontline =
            unit.trait?.id === 'infiltrator' ||
            unit.job === 'Archer' ||
            unit.job === 'Thief' ||
            selectedSkill.actionType === 'ranged' ||
            selectedSkill.actionType === 'magic';

        // Filter selectable opponents - handle "Shadow Walk" (ignores single-target magic)
        const selectableOpponents = (frontlineOpponents.length > 0 && !canBypassFrontline
            ? frontlineOpponents
            : opponents.filter(o => o.hp > 0)
        ).filter(o => {
            // Shadow Walk ignore check
            if (selectedSkill.actionType === 'magic' && selectedSkill.targetType === 'single' && !isChainLightningProc) {
                if (Object.values(o.equipment).some(i => i?.skillName === 'Shadow Walk')) {
                    return false; // Can't be targeted by single spells
                }
            }
            return true;
        });

        const fallbackOpponents = opponents.filter(o => o.hp > 0);
        const finalSelectionList = selectableOpponents.length > 0 ? selectableOpponents : fallbackOpponents;

        if (selectedSkill.targetType === 'all') {
            targets = selectedSkill.type === 'heal' 
                ? teammates.filter(t => t.hp > 0)
                : opponents.filter(o => o.hp > 0);
        } else if (selectedSkill.targetType === 'row' || isChainLightningProc) {
            targets = frontlineOpponents.length > 0 ? frontlineOpponents : opponents.filter(o => o.hp > 0);
        } else {
            // Single target
            if (selectedSkill.type === 'heal') {
                const healT = teammates.filter(t => t.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0];
                if (healT) targets = [healT];
            } else {
                if (finalSelectionList.length > 0) {
                    targets = [finalSelectionList[Math.floor(Math.random() * finalSelectionList.length)]];
                }
            }
        }

        if (targets.length === 0) return;

        // Visual Setup
        const actionId = Math.random().toString(36).substr(2, 9);
        const isSpecial = selectedSkill === unit.abilities[1];
        const skillActionType = getSkillActionType(selectedSkill);
        const { icon, geometry, hitType } = getActionVisuals(unit, skillActionType, selectedSkill.type, selectedSkill.targetType, isHero);

        const newAction: ActiveAction = { 
            id: actionId, 
            actorId: unit.id, 
            targetIds: targets.map(t => t.id), 
            type: selectedSkill.type, 
            icon, 
            geometry,
            isSpecial,
            skillName: selectedSkill.name
        };
        
        setActiveActions(prev => [...prev, newAction]);
        unit.isActing = true;
        unit.attackPhase = 'advance';
        setHeroes([...heroes]); setEnemies([...enemies]);
        
        await new Promise(r => setTimeout(r, 90));
        
        unit.attackPhase = 'strike';
        
        // EXECUTE IMPACT ON ALL TARGETS
        let landedHits = 0;
        let missedHits = 0;
        targets.forEach(target => {
            if (selectedSkill.type === 'damage') {
                const damageActionType: Exclude<RowActionType, 'support'> =
                    skillActionType === 'support' ? 'magic' : skillActionType;
                const hitResult = rollHitCheck(
                    unit,
                    target,
                    isHero ? heroes : enemies,
                    isHero ? enemies : heroes,
                    damageActionType
                );

                if (!hitResult.hit) {
                    missedHits += 1;
                    target.addVfx('MISS', 'miss');
                    return;
                }

                const dmg = calculateDamage(
                    unit,
                    target,
                    isHero ? heroes : enemies,
                    isHero ? enemies : heroes,
                    damageActionType,
                    selectedSkill.val
                );
                target.hp = Math.max(0, target.hp - dmg);
                target.addVfx(`-${dmg}`, 'damage');
                target.triggerHit(hitType);
                landedHits += 1;

                // Skill: Soul Feast (Heals 5 HP on every killing blow)
                if (target.hp <= 0 && Object.values(unit.equipment).some(i => i?.skillName === 'Soul Feast')) {
                    unit.hp = Math.min(unit.maxHp, unit.hp + 5);
                    unit.addVfx('+5 SOUL', 'heal');
                }
            } else if (selectedSkill.type === 'heal') {
                const heal = calculateHeal(unit, selectedSkill.val, isHero ? heroes : enemies);
                target.hp = Math.min(target.maxHp, target.hp + heal);
                target.addVfx(`+${heal}`, 'heal');
                target.triggerHeal();
            } else if (selectedSkill.type === 'buff' || selectedSkill.type === 'debuff') {
                const statName = selectedSkill.stat || 'ATK';
                target.addBattleBuff(statName, selectedSkill.val);
                target.addVfx(`${selectedSkill.val > 0 ? '+' : ''}${selectedSkill.val}% ${statName}`, selectedSkill.val > 0 ? 'heal' : 'miss');
                if (selectedSkill.val > 0) target.triggerHeal();
                else target.triggerHit('burn');
            }
        });

        // Logging
        log(`${unit.name} uses ${selectedSkill.name.toUpperCase()}!`, selectedSkill.type === 'heal' ? 'support' : 'combat');

        unit.atb = 0;
        
        // Skill: Time Warp (10% chance to act immediately after their turn ends)
        if (Object.values(unit.equipment).some(i => i?.skillName === 'Time Warp')) {
            if (Math.random() < 0.10) {
                unit.atb = 100;
                log(`${unit.name} WARPS TIME!`, 'special');
            }
        }

        setHeroes([...heroes]); setEnemies([...enemies]);

        await new Promise(r => setTimeout(r, 190));
        unit.attackPhase = 'return';
        setHeroes([...heroes]); setEnemies([...enemies]);

        await new Promise(r => setTimeout(r, 90));
        unit.attackPhase = 'idle';
        unit.isActing = false;
        setActiveActions(prev => prev.filter(a => a.id !== actionId));

        setHeroes([...heroes]); setEnemies([...enemies]);

        const heroWin = enemies.every(e => e.hp <= 0);
        const enemyWin = heroes.every(h => h.hp <= 0);
        if (heroWin || enemyWin) {
            [...heroes, ...enemies].forEach(combatant => combatant.clearBattleBuffs());
            setHeroes([...heroes]);
            setEnemies([...enemies]);
            setWinner(heroWin ? 'heros' : 'enemies');
        }
    }, [heroes, enemies, log]);

    useEffect(() => {
        if (isPaused || winner) return;

        const interval = setInterval(() => {
            const allAlive = [...heroes, ...enemies].filter(u => u.hp > 0);
            allAlive.forEach(u => {
                if (!u.isActing) u.updateAtb(0.05);
            });

            const newIntents: UnitIntent[] = allAlive.map(u => {
                let tid = "";
                let geom: 'melee' | 'range' | 'magic' = 'melee';
                const primarySkill = u.abilities[0];
                const primaryActionType = getSkillActionType(primarySkill);
                if (primarySkill.type === 'heal') {
                    const teammates = u.isHero ? heroes : enemies;
                    tid = teammates.filter(t => t.hp > 0).sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0]?.id || "";
                    geom = 'magic';
                } else {
                    const opponents = u.isHero ? enemies : heroes;
                    const front = opponents.filter(t => t.positionLine === 'VANGUARD' && t.hp > 0);
                    const canBypassFront = u.trait?.id === 'infiltrator' || u.job === 'Archer' || primaryActionType === 'ranged' || primaryActionType === 'magic';
                    const validTargets = front.length > 0 && !canBypassFront ? front : opponents.filter(t => t.hp > 0);
                    tid = validTargets[0]?.id || "";
                    geom = primaryActionType === 'ranged' ? 'range' : primaryActionType === 'magic' || primaryActionType === 'support' ? 'magic' : 'melee';
                }
                return { actorId: u.id, targetId: tid, atb: u.atb, geometry: geom };
            });
            setIntents(newIntents);

            const actors = allAlive.filter(u => u.atb >= 100 && !u.isActing);
            actors.forEach(actor => processAction(actor.id));

            setHeroes([...heroes]);
            setEnemies([...enemies]);
        }, 50);

        return () => clearInterval(interval);
    }, [isPaused, heroes, enemies, winner, processAction]);

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
