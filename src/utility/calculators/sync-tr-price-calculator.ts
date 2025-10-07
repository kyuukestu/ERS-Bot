const calculateMovePrice = (
	basePower: number,
	statChanges: number,
	secondaryEffects: number,
	fieldEffects: number
) => {
	const star_modifier = statChanges * 25000;

	const sec_eff_modifier = secondaryEffects * 10000;

	const field_eff_modifier = fieldEffects * 50000;

	return (
		Math.round(basePower * 1000) +
		star_modifier +
		sec_eff_modifier +
		field_eff_modifier
	);
};

export { calculateMovePrice };
