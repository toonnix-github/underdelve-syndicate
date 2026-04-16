"""
Underdelve Syndicate - Gambit System
====================================
The 'Brain' of the auto-battler. Prioritized logic for unit decision-making.
"""

from typing import List, Callable, Optional, TYPE_CHECKING
if TYPE_CHECKING:
    from combatants import Unit

class Gambit:
    def __init__(self, condition: Callable, action: Callable, target_selector: Callable, priority: int = 100):
        self.condition = condition  # Returns True/False
        self.action = action        # Executed on target
        self.target_selector = target_selector # Returns target unit
        self.priority = priority

class Conditions:
    """Library of reusable condition checks."""
    
    @staticmethod
    def always(unit: 'Unit', allies: List['Unit'], enemies: List['Unit']):
        return True

    @staticmethod
    def ally_hp_below(threshold: float):
        """Returns True if any ally is below X% health."""
        def check(unit: 'Unit', allies: List['Unit'], enemies: List['Unit']):
            return any((a.hp / a.max_hp) < threshold for a in allies if not a.is_dead)
        return check

    @staticmethod
    def enemy_any(unit: 'Unit', allies: List['Unit'], enemies: List['Unit']):
        return any(not e.is_dead for e in enemies)

class TargetSelectors:
    """Library of logic to find the 'best' target for a gambit."""

    @staticmethod
    def self(unit: 'Unit', allies: List['Unit'], enemies: List['Unit']):
        return unit

    @staticmethod
    def lowest_hp_ally(unit: 'Unit', allies: List['Unit'], enemies: List['Unit']):
        living_allies = [a for a in allies if not a.is_dead]
        if not living_allies: return None
        return min(living_allies, key=lambda a: a.hp / a.max_hp)

    @staticmethod
    def random_enemy(unit: 'Unit', allies: List['Unit'], enemies: List['Unit']):
        import random
        living_enemies = [e for e in enemies if not e.is_dead]
        return random.choice(living_enemies) if living_enemies else None

class Actions:
    """Library of core combat actions."""

    @staticmethod
    def basic_attack(actor: 'Unit', target: 'Unit'):
        damage = actor.power
        target.take_damage(damage)
        return f"Attacks {target.name} for {damage} dmg"

    @staticmethod
    def heal(actor: 'Unit', target: 'Unit'):
        amount = int(actor.power * 1.5)
        target.heal(amount)
        return f"Heals {target.name} for {amount} hp"

    @staticmethod
    def guard(actor: 'Unit', target: 'Unit'):
        # In a real game, this would add a status effect. Simplified for now.
        return f"Guards and prepares for impact"

class GambitEngine:
    @staticmethod
    def get_best_action(actor: 'Unit', allies: List['Unit'], enemies: List['Unit']):
        """
        Iterates through actor's gambits in order.
        Returns (action_func, target) for the first one that matches its condition.
        """
        for gambit in actor.gambits:
            if gambit.condition(actor, allies, enemies):
                target = gambit.target_selector(actor, allies, enemies)
                if target:
                    return gambit.action, target
        return None, None
