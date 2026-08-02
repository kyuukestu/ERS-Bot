import { type MoveInfo } from "~/api/dataExtraction/extractMoveInfo";


function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

const TR_BASE = 350;

const CRIT_RATE_VALUE = 1500;

const POWER_VALUES = {
  STATUS: 500,
  NON_STANDARD_DAMAGE: 7500,
};

const ACCURACY = {
  BASE_THRESHOLD: 80,
  PER_POINT: 20,
  NEVER_MISS: 1500,
};

const STATUS_VALUES: Record<string, number> = {
  burn: 3000,
  paralysis: 3500,
  freeze: 6000,
  sleep: 5000,
  poison: 2500,
  badly_poisoned: 4500,
  confusion: 2500,
  flinch: 2500,
  infatuation: 2000,
  trap: 2000,
  nightmare: 1500,
  disable: 2500,
  encore: 3000,
  taunt: 3000,
  torment: 2500,
  heal_block: 2500,
};

const STAT_VALUES: Record<string, number> = {
  attack: 1000,
  defense: 1000,
  "special-attack": 1000,
  "special-defense": 1000,
  speed: 1500,
  accuracy: 1500,
  evasion: 2000,
};

const STAT_STAGE_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.75,
  3: 2.5,
  4: 3.25,
  5: 4,
  6: 5,
};

function calculateStageMultiplier(stage: number): number {
  return STAT_STAGE_MULTIPLIERS[Math.abs(stage)] ?? 5;
}

function multiStatBonus(
  statChanges: StatChange[] | null
): number {
  if (!statChanges || statChanges.length <= 1) {
    return 0;
  }

  return (statChanges.length - 1) * 1500;
}

const UNIQUE_EFFECT_VALUE = 2500;

const MULTI_HIT_VALUES = {
  PER_ADDITIONAL_HIT: 750,
};

const PRIORITY_VALUE = 2000;

const TARGET_VALUES: Record<string, number> = {
  "selected-pokemon": 0,

  user: 0,

  "random-opponent": 250,

  "all-opponents": 1000,

  "all-other-pokemon": 1500, // e.g. Earthquake

  "user-and-allies": 1500, // e.g. Heal bell

  "all-pokemon": 2000, // e.g. Perish Song

  "entire-field": 2500, // e.g. Electric Terrain
};

const SELF_TARGETS = ["user", "user-and-allies"];

function calculateBasePowerBonus(power:number):number {
  if (power <= 100) {
    return power * 35;
  }

  return (
    100 * 35 +
    (power - 100) * 15
  );
}

function calculatePowerBonus(move: MoveInfo): number {
  if (move.damage_class === "status") {
    return POWER_VALUES.STATUS;
  }

  if (move.power !== null && move.power !== undefined) {
      return calculateBasePowerBonus(toNumberOrNull(move.power) ?? 0);
    }

  return POWER_VALUES.NON_STANDARD_DAMAGE;
}

export function calculateTargetBonus(target: string | null): number {
  if (!target) {
    return 0;
  }

  return TARGET_VALUES[target] ?? 0;
}

export function calculatePriorityBonus(priority: number | null): number {
  if (!priority || priority <= 0) {
    return 0;
  }

  return priority * PRIORITY_VALUE;
}

export function calculateUniqueBonus(category: string | null): number {
  if (category !== "unique") {
    return 0;
  }

  return UNIQUE_EFFECT_VALUE;
}

function calculateCritBonus(critRate: number | null): number {
  if (!critRate || critRate <= 0) {
    return 0;
  }

  return critRate * CRIT_RATE_VALUE;
}

function accuracyBonus(accuracy: number | null, target: string | null): number {
  console.log('AccuracyBonus Recieves: ', accuracy)
  
  if (target && SELF_TARGETS.includes(target)) {
    return 0;
  }

  if (accuracy === null) {
    return ACCURACY.NEVER_MISS;
  }

  if (accuracy <= ACCURACY.BASE_THRESHOLD) {
    return 0;
  }

  return (accuracy - ACCURACY.BASE_THRESHOLD) * ACCURACY.PER_POINT;
}

function calculateMultiHitBonus(
  minHits: number | null,
  maxHits: number | null,
): number {
  if (!minHits || !maxHits || maxHits <= 1) {
    return 0;
  }

  const averageHits = (minHits + maxHits) / 2;

  return (averageHits - 1) * MULTI_HIT_VALUES.PER_ADDITIONAL_HIT;
}

function statusBonus(ailment: string | null, chance: number | null): number {
  if (!ailment || !chance) {
    return 0;
  }

  const baseValue = STATUS_VALUES[ailment];

  if (!baseValue) {
    return 0;
  }

  return baseValue * (chance / 100);
}

function flinchBonus(chance: number | null): number {
  if (chance === null) {
    return 0;
  }
  return STATUS_VALUES.flinch * (chance / 100);
}

interface StatChange {
  change: number;
  stat: {
    name: string;
  };
}

function getStatEffectChance(
  statChanges: StatChange[] | null,
  statChance: number | null | undefined
): number {
  if (!statChanges || statChanges.length === 0) {
    return 0;
  }

  // No chance means the effect is guaranteed
  if (statChance === null || statChance === undefined || statChance === 0) {
    return 100;
  }

  return statChance;
}

function statBonus(
  statChanges: StatChange[] | null,
  effectChance: number = 100,
): number {
  if (!statChanges || statChanges.length === 0) {
    return 0;
  }
  
  const statValue = statChanges.reduce((total, change) => {
    const value = STAT_VALUES[change.stat.name] ?? 1000;
  
    return total + value * calculateStageMultiplier(change.change);
  }, 0);

  return statValue * (effectChance / 100);
}

export function recoveryBonus(
  recoveryAmount: number | null,
  effectChance: number = 100,
): number {
  if (!recoveryAmount || recoveryAmount <= 0) {
    return 0;
  }

  const baseValue = recoveryAmount * 100;

  return baseValue * (effectChance / 100);
}

interface TRPriceBreakdown {
  base: number;
  power: number;
  accuracy: number;
  status: number;
  flinch: number;
  stats: number;
  multi_stat: number;
  multi_hit: number;
  recovery: number;
  unique: number;
  priority: number;
  target: number;
  crit: number;
  total: number;
  rounded: number;
}

interface TRPricing {
  breakdown: TRPriceBreakdown;
  total: number;
  rounded: number;
}

export function calculateTRBreakdown(
  move: MoveInfo
): TRPriceBreakdown {
  console.log('Move Accuracy: ', move.accuracy)
  console.log("Move:", move.name);
  console.log("Stat changes:", move.stat_changes);
  console.log('Stat Chance: ', move.meta?.stat_chance)
  
  const breakdown = {
    base: TR_BASE,

    power: calculatePowerBonus(move),

    accuracy: accuracyBonus(
      toNumberOrNull(move.accuracy ?? null),
      move.target ?? null
    ),

    status: statusBonus(
      move.meta?.ailment?.name ?? null,
      move.meta?.ailment_chance ?? 0,
    ),

    multi_stat: multiStatBonus(
      move.stat_changes,
    ),

    multi_hit: calculateMultiHitBonus(
      move.meta?.min_hits ?? null,
      move.meta?.max_hits ?? null,
    ),

    flinch: flinchBonus(
      move.meta?.flinch_chance ?? null
    ),

    stats: statBonus(
      move.stat_changes,
      getStatEffectChance(move.stat_changes, move.meta?.stat_chance)
    ),

    recovery: recoveryBonus(
      (move.meta?.healing ?? 0) +
      (move.meta?.drain ?? 0)
    ),

    unique: calculateUniqueBonus(
      move.meta?.category?.name ?? null
    ),

    priority: calculatePriorityBonus(
      toNumberOrNull(move.priority ?? null)
    ),

    target: calculateTargetBonus(
      move.target ?? null
    ),

    crit: calculateCritBonus(
      move.meta?.crit_rate ?? null
    ),

    total: 0,

    rounded: 0,
  };

  breakdown.total =
    breakdown.base +
    breakdown.power +
    breakdown.accuracy +
    breakdown.status +
    breakdown.flinch +
    breakdown.stats +
    breakdown.multi_stat +
    breakdown.multi_hit +
    breakdown.recovery +
    breakdown.unique +
    breakdown.priority +
    breakdown.target +
    breakdown.crit;

  breakdown.rounded = Math.round(
    breakdown.total / 500
  ) * 500;
  
  return breakdown;
}

export function calculateTRPrice(move: MoveInfo): TRPricing {
  const breakdown = calculateTRBreakdown(move);

  console.log('Accuracy: ', breakdown.accuracy)

  return {
    breakdown,
    total: breakdown.total,
    rounded: breakdown.rounded,
  }
}
