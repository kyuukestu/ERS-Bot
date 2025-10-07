interface PickupItem {
	name: string;
	weight: number;
}

interface PickupLevelRange {
	levelRange: string; // e.g. "1-10"
	items: PickupItem[];
}

// Example JSON loaded into this variable
const pickupTable: PickupLevelRange[] = [
	{
		levelRange: '1-10',
		items: [
			{ name: 'Potion', weight: 30 },
			{ name: 'Antidote', weight: 10 },
			{ name: 'Super Potion', weight: 10 },
			{ name: 'Great Ball', weight: 10 },
			{ name: 'Repel', weight: 10 },
			{ name: 'Escape Rope', weight: 10 },
			{ name: 'Full Heal', weight: 10 },
			{ name: 'Hyper Potion', weight: 4 },
			{ name: 'Ultra Ball', weight: 4 },
			{ name: 'Nugget', weight: 1 },
		],
	},
	{
		levelRange: '11-20',
		items: [
			{ name: 'Antidote', weight: 30 },
			{ name: 'Super Potion', weight: 10 },
			{ name: 'Great Ball', weight: 10 },
			{ name: 'Repel', weight: 10 },
			{ name: 'Escape Rope', weight: 10 },
			{ name: 'Full Heal', weight: 10 },
			{ name: 'Hyper Potion', weight: 10 },
			{ name: 'Ultra Ball', weight: 4 },
			{ name: 'Revive', weight: 4 },
			{ name: 'Nugget', weight: 1 },
			{ name: 'Ether', weight: 1 },
		],
	},
	{
		levelRange: '21-30',
		items: [
			{ name: 'Super Potion', weight: 30 },
			{ name: 'Great Ball', weight: 10 },
			{ name: 'Repel', weight: 10 },
			{ name: 'Escape Rope', weight: 10 },
			{ name: 'Full Heal', weight: 10 },
			{ name: 'Hyper Potion', weight: 10 },
			{ name: 'Revive', weight: 4 },
			{ name: 'Rare Candy', weight: 4 },
			{ name: 'Ether', weight: 1 },
			{ name: 'Destiny Knot', weight: 1 },
		],
	},
	{
		levelRange: '31-40',
		items: [
			{ name: 'Great Ball', weight: 30 },
			{ name: 'Repel', weight: 10 },
			{ name: 'Escape Rope', weight: 10 },
			{ name: 'Full Heal', weight: 10 },
			{ name: 'Hyper Potion', weight: 10 },
			{ name: 'Ultra Ball', weight: 10 },
			{ name: 'Revive', weight: 10 },
			{ name: 'Rare Candy', weight: 4 },
			{ name: 'Shiny Stone', weight: 4 },
			{ name: 'Destiny Knot', weight: 1 },
			{ name: 'Full Restore', weight: 1 },
		],
	},
	{
		levelRange: '41-50',
		items: [
			{ name: 'Repel', weight: 30 },
			{ name: 'Escape Rope', weight: 10 },
			{ name: 'Full Heal', weight: 10 },
			{ name: 'Hyper Potion', weight: 10 },
			{ name: 'Ultra Ball', weight: 10 },
			{ name: 'Revive', weight: 10 },
			{ name: 'Rare Candy', weight: 10 },
			{ name: 'Shiny Stone', weight: 4 },
			{ name: 'Dusk Stone', weight: 4 },
			{ name: 'Full Restore', weight: 1 },
			{ name: 'Elixir', weight: 1 },
		],
	},
	{
		levelRange: '51-60',
		items: [
			{ name: 'Escape Rope', weight: 30 },
			{ name: 'Full Heal', weight: 10 },
			{ name: 'Hyper Potion', weight: 10 },
			{ name: 'Ultra Ball', weight: 10 },
			{ name: 'Revive', weight: 10 },
			{ name: 'Rare Candy', weight: 10 },
			{ name: 'Shiny Stone', weight: 10 },
			{ name: 'Dusk Stone', weight: 4 },
			{ name: 'Heart Scale', weight: 4 },
			{ name: 'Elixir', weight: 1 },
		],
	},
	{
		levelRange: '61-70',
		items: [
			{ name: 'Full Heal', weight: 30 },
			{ name: 'Hyper Potion', weight: 10 },
			{ name: 'Ultra Ball', weight: 10 },
			{ name: 'Revive', weight: 10 },
			{ name: 'Rare Candy', weight: 10 },
			{ name: 'Shiny Stone', weight: 10 },
			{ name: 'Dusk Stone', weight: 4 },
			{ name: 'Heart Scale', weight: 4 },
			{ name: 'Full Restore', weight: 1 },
			{ name: 'Elixir', weight: 1 },
		],
	},
	{
		levelRange: '71-80',
		items: [
			{ name: 'Hyper Potion', weight: 30 },
			{ name: 'Ultra Ball', weight: 10 },
			{ name: 'Revive', weight: 10 },
			{ name: 'Rare Candy', weight: 10 },
			{ name: 'Shiny Stone', weight: 10 },
			{ name: 'Dusk Stone', weight: 4 },
			{ name: 'Heart Scale', weight: 4 },
			{ name: 'Full Restore', weight: 1 },
			{ name: 'Elixir', weight: 1 },
		],
	},
	{
		levelRange: '81-90',
		items: [
			{ name: 'Ultra Ball', weight: 30 },
			{ name: 'Revive', weight: 10 },
			{ name: 'Rare Candy', weight: 10 },
			{ name: 'Shiny Stone', weight: 10 },
			{ name: 'Dusk Stone', weight: 4 },
			{ name: 'Heart Scale', weight: 4 },
			{ name: 'Full Restore', weight: 1 },
			{ name: 'Elixir', weight: 1 },
		],
	},
	{
		levelRange: '91-100',
		items: [
			{ name: 'Revive', weight: 30 },
			{ name: 'Rare Candy', weight: 10 },
			{ name: 'Shiny Stone', weight: 10 },
			{ name: 'Dusk Stone', weight: 4 },
			{ name: 'Heart Scale', weight: 4 },
			{ name: 'Full Restore', weight: 1 },
			{ name: 'Elixir', weight: 1 },
		],
	},
];

export function getRandomItem(level: number) {
	// Step 1: Find the relevant level range
	const range = pickupTable.find((r) => {
		const [min, max] = r.levelRange.split('-').map(Number);
		return level >= min && level <= max;
	});

	if (!range) {
		console.warn(`No pickup data for level ${level}`);
		return null;
	}

	// Step 2: Calculate total weights
	const totalWeight = range.items.reduce((sum, item) => sum + item.weight, 0);
	const activationChance = 0.1; // 10%

	// Step 3: Roll the 10% activation
	if (Math.random() > activationChance) {
		return {
			name: null,
			obtained: false,
			message:
				'Pickup did not activate. Better luck next time! \n\n 90% Odds of this outcome.',
			overallChance: '90%',
		};
	}

	// Step 4: Weighted random selection
	const rand = Math.random() * totalWeight;
	let cumulative = 0;
	let selected: PickupItem | null = null;

	for (const item of range.items) {
		cumulative += item.weight;
		if (rand <= cumulative) {
			selected = item;
			break;
		}
	}

	if (!selected) return null;

	// Step 5: Calculate probabilities
	const relativeChance = selected.weight / totalWeight;
	const overallChance = activationChance * relativeChance;

	return {
		name: selected.name,
		obtained: true,
		relativeChance: (relativeChance * 100).toFixed(2) + '%',
		overallChance: (overallChance * 100).toFixed(3) + '%',
		message: `You picked up a ${selected.name}! \n\n Relative Odds:  ${(
			relativeChance * 100
		).toFixed(2)}% \n\nOverall odds: ${(overallChance * 100).toFixed(3)}%)`,
	};
}
