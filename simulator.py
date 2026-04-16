"""
Underdelve Syndicate - Terminal Simulator
=========================================
Runs a simulated auto-battle in the console to demonstrate the logic.
"""

import time
import os
import sys

# Ensure the engine directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from engine.combatants import Unit, Role
from engine.gambits import Gambit, Conditions, TargetSelectors, Actions
from engine.battle_loop import BattleManager

def setup_hero_party():
    # 1. JAX (Tank)
    jax = Unit("Jax", Role.TANK, max_hp=100, speed=10, power=8)
    jax.gambits = [
        # Protect self if HP is really low
        Gambit(Conditions.always, Actions.guard, TargetSelectors.self),
        # Attack anyone
        Gambit(Conditions.enemy_any, Actions.basic_attack, TargetSelectors.random_enemy)
    ]

    # 2. ELARA (Healer)
    elara = Unit("Elara", Role.HEALER, max_hp=60, speed=12, power=15)
    elara.gambits = [
        # Heal anyone below 70% 
        Gambit(Conditions.ally_hp_below(0.7), Actions.heal, TargetSelectors.lowest_hp_ally),
        # Otherwise, basic attack
        Gambit(Conditions.enemy_any, Actions.basic_attack, TargetSelectors.random_enemy)
    ]

    # 3. KAEL (DPS)
    kael = Unit("Kael", Role.DPS, max_hp=70, speed=15, power=20)
    kael.gambits = [
        # All-out attack
        Gambit(Conditions.enemy_any, Actions.basic_attack, TargetSelectors.random_enemy)
    ]

    return [jax, elara, kael]

def setup_enemy_party():
    slime = Unit("Slime A", Role.DPS, max_hp=50, speed=8, power=5)
    slime.gambits = [Gambit(Conditions.always, Actions.basic_attack, TargetSelectors.random_enemy)]
    
    skeleton = Unit("Skeleton B", Role.DPS, max_hp=40, speed=12, power=10)
    skeleton.gambits = [Gambit(Conditions.always, Actions.basic_attack, TargetSelectors.random_enemy)]
    
    ogre = Unit("Ogre C", Role.TANK, max_hp=150, speed=6, power=15)
    ogre.gambits = [Gambit(Conditions.always, Actions.basic_attack, TargetSelectors.random_enemy)]
    
    return [slime, skeleton, ogre]

def draw_ui(manager: BattleManager):
    """Prints a clear terminal view of the battle."""
    # Clear terminal
    os.system('cls' if os.name == 'nt' else 'clear')
    
    print("=" * 60)
    print(f"  UNDERDELVE SYNDICATE - BATTLE SIMULATOR (Time: {manager.time:.1f}s)")
    print("=" * 60)
    
    print("\n[ HERO PARTY ]")
    for h in manager.heroes:
        status = " ALIVE " if not h.is_dead else " DEAD  "
        bar = "#" * int(h.atb / 5) + "-" * (20 - int(h.atb / 5))
        hp_str = f"{h.hp}/{h.max_hp}".ljust(8)
        print(f" {status} {h.name.ljust(8)} | HP: {hp_str} | ATB: [{bar}] {h.atb:4.1f}%")

    print("\n" + "-" * 30)
    
    print("\n[ ENEMY HORDE ]")
    for e in manager.enemies:
        status = " ALIVE " if not e.is_dead else " DEAD  "
        bar = "#" * int(e.atb / 5) + "-" * (20 - int(e.atb / 5))
        hp_str = f"{e.hp}/{e.max_hp}".ljust(8)
        print(f" {status} {e.name.ljust(8)} | HP: {hp_str} | ATB: [{bar}] {e.atb:4.1f}%")

    print("\n" + "=" * 60)
    print("  LATEST ACTIONS:")
    for log in manager.battle_log[-5:]:
        print(f"  > {log}")
    print("=" * 60)

def main():
    heroes = setup_hero_party()
    enemies = setup_enemy_party()
    manager = BattleManager(heroes, enemies)
    
    tick_rate = 0.1 # Real-time tick duration
    
    try:
        while not manager.is_finished:
            messages = manager.update(tick_rate)
            draw_ui(manager)
            time.sleep(0.05) # Speed up simulation for better viewing
        
        # Final Screen
        draw_ui(manager)
        print(f"\n   !!! BATTLE OVER !!!   WINNER: {manager.winner}")
        print("\nPress Ctrl+C to exit.")
        while True: time.sleep(1)
        
    except KeyboardInterrupt:
        print("\nSimulation aborted.")

if __name__ == "__main__":
    main()
