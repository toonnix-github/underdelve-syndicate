import { Combatant } from '../../src/models/Combatant';
import type { Ability, Job, Position, Race, Role, Trait } from '../../src/types';

const defaultAbility: Ability = {
  id: 'basic',
  name: 'Basic Attack',
  description: 'Default test attack.',
  val: 100,
  type: 'damage',
  actionType: 'melee',
  targetType: 'single'
};

interface MakeCombatantOptions {
  name?: string;
  role?: Role;
  hp?: number;
  spd?: number;
  atk?: number;
  def?: number;
  imageId?: string;
  abilities?: Ability[];
  positionLine?: Position;
  isHero?: boolean;
  trait?: Trait | null;
  job?: Job;
  race?: Race;
}

export const makeCombatant = (options: MakeCombatantOptions = {}) => {
  return new Combatant(
    options.name ?? 'Test Unit',
    options.role ?? 'DPS',
    options.hp ?? 100,
    options.spd ?? 10,
    options.atk ?? 10,
    options.def ?? 5,
    options.imageId ?? 'hero_test',
    options.abilities ?? [defaultAbility],
    options.positionLine ?? 'VANGUARD',
    options.isHero ?? true,
    options.trait ?? null,
    options.job ?? 'Swordsman',
    options.race ?? 'Human'
  );
};
