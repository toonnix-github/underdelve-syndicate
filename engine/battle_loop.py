"""
Underdelve Syndicate - Battle Loop
==================================
Manages the flow of combat, time (ATB), and victory conditions.
"""

from typing import List
from engine.combatants import Unit
from engine.gambits import GambitEngine

class BattleManager:
    def __init__(self, heroes: List[Unit], enemies: List[Unit]):
        self.heroes = heroes
        self.enemies = enemies
        self.all_units = heroes + enemies
        self.time = 0.0
        self.battle_log = []
        self.is_finished = False
        self.winner = None

    def update(self, delta_time: float):
        """
        Advance the battle state by delta_time (in seconds).
        Returns a list of messages for any actions taken during this tick.
        """
        if self.is_finished:
            return []

        tick_messages = []
        self.time += delta_time

        # 1. Update ATB for all living units
        for unit in self.all_units:
            if not unit.is_dead:
                unit.update_atb(delta_time)

        # 2. Check for turns (prioritize those who hit 100 first)
        ready_units = sorted([u for u in self.all_units if u.is_ready()], key=lambda u: u.atb, reverse=True)

        for unit in ready_units:
            if unit.is_dead: continue
            
            # Execute one turn at a time to keep it sequential and fair
            action_msg = self.execute_turn(unit)
            if action_msg:
                tick_messages.append(action_msg)
            
            # Reset this unit's ATB
            unit.reset_atb()
            
            # Check win condition after every action
            self.check_win_condition()
            if self.is_finished:
                break

        return tick_messages

    def execute_turn(self, unit: Unit):
        """Finds the best action for a unit and executes it."""
        allies = self.heroes if unit in self.heroes else self.enemies
        foes = self.enemies if unit in self.heroes else self.heroes
        
        action_func, target = GambitEngine.get_best_action(unit, allies, foes)
        
        if action_func and target:
            result = action_func(unit, target)
            msg = f"[{unit.name}] -> {result}"
            self.battle_log.append(msg)
            return msg
        
        return f"[{unit.name}] -> Waiting for opportunity..."

    def check_win_condition(self):
        """Check if one side is wiped out."""
        heroes_alive = any(not h.is_dead for h in self.heroes)
        enemies_alive = any(not e.is_dead for e in self.enemies)

        if not heroes_alive:
            self.is_finished = True
            self.winner = "ENEMIES"
        elif not enemies_alive:
            self.is_finished = True
            self.winner = "HEROES"

    def get_state(self):
        """Returns simplified status for display."""
        return {
            "heroes": [(h.name, h.hp, h.atb) for h in self.heroes],
            "enemies": [(e.name, e.hp, e.atb) for e in self.enemies]
        }
