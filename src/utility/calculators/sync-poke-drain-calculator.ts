const calculateUpkeep = (
	bst: number,
	level: number = 1,
	isAlpha = false,
	additionalAbilities = 0,
	inBox = false,
	isFinalEvo = false
): number => {
	if (bst === 0) return 0;

	const base_cost = 2;
	const alphaModifier = 0.25;
	const additionalAbilitiesModifier = 0.1;
	const levelModifier = 0.01;
	const finalEvoModifier = 0.33;

	const final_base =
		base_cost +
		(isAlpha ? alphaModifier : 0) +
		additionalAbilities * additionalAbilitiesModifier +
		level * levelModifier +
		(isFinalEvo ? finalEvoModifier : 0);

	const upkeep = inBox
		? Math.round(Math.pow(final_base, bst / 100) / 4)
		: Math.round(Math.pow(final_base, bst / 100));

	return upkeep;
};

export { calculateUpkeep };
