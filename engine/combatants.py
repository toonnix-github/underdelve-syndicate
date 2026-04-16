"""
Underdelve Syndicate - Combatant Model
======================================
Defines the base units (Heroes and Enemies) and their core stats.
"""

from typing import List, Optional, Dict
from enum import Enum
import uuid

class Role(Enum):
    TANK = "Tank"
    HEALER = "Healer"
    DPS = "DPS"
    SUPPORT = "Support"

class Unit:
    def __init__(self, name: str, role: Role, max_hp: int, speed: int, power: int):
        self.id = str(uuid.uuid4())
        self.name = name
        self.role = role
        
        # Stats
        self.max_hp = max_hp
        self.hp = max_hp
        self.speed = speed
        self.power = power
        
        # ATB Logic
        self.atb = 0.0  # 0 to 100
        self.is_dead = False
        
        # Gambit Logic (to be populated by gambits.py)
        self.gambits = []
        
        # Visual/State tracking
        self.current_action = None
        self.last_result = ""

    def update_atb(self, tick_rate: float):
        """
        Increments the ATB bar. 
        Higher speed = faster bar filling.
        """
        if self.is_dead:
            return
            
        # Base multiplier to make speed values (e.g., 10-20) feel balanced
        increment = (self.speed * tick_rate) * 5 
        self.atb = min(100.0, self.atb + increment)

    def is_ready(self) -> bool:
        """Returns True if the unit is ready to act."""
        return self.atb >= 100.0 and not self.is_dead

    def take_damage(self, amount: int):
        """Reduces HP and handles death."""
        self.hp = max(0, self.hp - amount)
        if self.hp == 0:
            self.die()

    def die(self):
        self.is_dead = True
        self.atb = 0
        self.last_result = "DEAD"

    def heal(self, amount: int):
        """Restores HP."""
        if self.is_dead:
            return
        self.hp = min(self.max_hp, self.hp + amount)

    def reset_atb(self):
        """Resets ATB bar after an action."""
        self.atb = 0.0

    def __repr__(self):
        return f"[{self.role.value}] {self.name} | HP: {self.hp}/{self.max_hp} | ATB: {self.atb:.1f}%"
