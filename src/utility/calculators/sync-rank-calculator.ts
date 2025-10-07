export type Rank =
	| 'Bronze'
	| 'Silver'
	| 'Gold'
	| 'Platinum'
	| 'Master'
	| 'High Master'
	| 'Grand Master'
	| 'Legendary';

export type SubRank = 1 | 2 | 3 | 4 | 5;

const rankOrder: Rank[] = [
	'Bronze',
	'Silver',
	'Gold',
	'Platinum',
	'Master',
	'High Master',
	'Grand Master',
	'Legendary',
];

interface EnergyConfig {
	base: number; // Base energy for the first rank/subrank
	withinBase: number; // Base multiplier for within-rank exponential growth
	withinAccel: number; // Incremental boost for higher ranks (sharpness inside rank)
	crossBase: number; // Multiplier for cross-rank jump
	linearPerSub: number; // Linear smoothing for subranks
}

const defaultConfig: EnergyConfig = {
	base: 40,
	withinBase: 1.25,
	withinAccel: 1.15,
	crossBase: 6,
	linearPerSub: 21,
};

/**
 * Returns energy pool for a given rank and subrank.
 */
export const calculateEnergyPool = (
	rank: Rank,
	subRank: SubRank,
	config: EnergyConfig = defaultConfig
) => {
	const rankIndex = rankOrder.indexOf(rank);
	if (rankIndex === -1) throw new Error('Invalid rank');

	const { base, withinBase, withinAccel, crossBase, linearPerSub } = config;

	// Base energy for this rank (cross-rank growth)
	const crossRankEnergy = base * Math.pow(crossBase, rankIndex);

	// Exponential growth within the rank
	const withinRankMultiplier = Math.pow(
		withinBase + rankIndex * withinAccel,
		subRank - 1
	);

	// Linear smoothing inside the rank
	const linearBoost = (subRank - 1) * linearPerSub;

	// Final energy pool
	const energy = Math.round(
		crossRankEnergy * withinRankMultiplier + linearBoost
	);

	return energy;
};
