const calculateUpkeep = (
	bst: number,
	isAlpha = false,
	additionalAbilities = 0,
	inBox = false
): number => {
	if (bst === 0) return 0;

	const base_cost = 2;
	const alphaModifier = 0.25;
	const additionalAbilitiesModifier = 0.1;

	const final_base =
		base_cost +
		(isAlpha ? alphaModifier : 0) +
		additionalAbilities * additionalAbilitiesModifier;

	let upkeep = inBox
		? Math.round(Math.pow(final_base, bst / 100) / 4)
		: Math.round(Math.pow(final_base, bst / 100));

	return upkeep;
};

export { calculateUpkeep };
