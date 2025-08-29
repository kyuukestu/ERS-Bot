const calculateMoveCost = (
	basePower: number,
	statChanges: number,
	secondaryEffects: number,
	fieldEffects: number
) => {
	if (typeof basePower !== 'number') {
		basePower = 0;
	}

	const stat_multi = 3;
	const secondary_multi = 3;
	const field_multi = 5;

	const cost =
		Math.round(basePower / 20) +
		statChanges * stat_multi +
		secondaryEffects * secondary_multi +
		fieldEffects * field_multi;

	return cost;
};

export { calculateMoveCost };
