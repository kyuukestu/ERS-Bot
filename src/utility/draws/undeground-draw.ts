type Outcome = {
	weight: number;
	label: string;
};

const rawlist = `1,(Unobtainable) Bulging Wall - Thunder Stone
2,(Unobtainable) Bulging Wall - Red Shard
5,Pokémon Encounter - Silver
2,Bulging Wall - Rare Bone
2,Bulging Wall - Heart Scale
1,(Unobtainable) Bulging Wall - Fire Stone
1,Misc Item - Dusk Stone
1,(Unobtainable) Bulging Wall - Odd Keystone
1,(Unobtainable) Bulging Wall - Dome Fossil
1,Misc Item - Dawn Stone
1,(Unobtainable) Bulging Wall - Skull Fossil
1,(Unobtainable) Bulging Wall - Oval Stone
1,Bulging Wall - Max Revive
1,(Unobtainable) Bulging Wall - Everstone
1,Bulging Wall - Skull Fossil
1,(Unobtainable) Bulging Wall - Icy Rock
2,Bulging Wall - Star Piece
1,Bulging Wall - Iron Ball
1,(Unobtainable) Bulging Wall - Root Fossil
1,(Unobtainable) Bulging Wall - Old Amber
1,Misc Item - PP Up
1,Bulging Wall - Armor Fossil
1,(Unobtainable) Bulging Wall - Star Piece
1,Bulging Wall - Moon Stone
1,(Unobtainable) Bulging Wall - Sun Stone
5,Misc Item - Big Mushroom
1,Bulging Wall - Dome Fossil
4,(Unobtainable) Bulging Wall - Blue Shard
1,(Unobtainable) Bulging Wall - Claw Fossil
1,Bulging Wall - Helix Fossil
1,Bulging Wall - Old Amber
1,(Unobtainable) Bulging Wall - Heat Rock
1,(Unobtainable) Bulging Wall - Hard Stone
3,Bulging Wall - Red Shard
1,Bulging Wall - Sun Stone
1,(Unobtainable) Bulging Wall - Revive
3,Bulging Wall - Yellow
3,Misc Item - Sharp Beak
1,Bulging Wall - Oval Stone
1,(Unobtainable) Bulging Wall - Iron Ball
1,Misc Item - PP Max
1,(Unobtainable) Bulging Wall - Max Revive
1,Bulging Wall - Odd Keystone
1,(Unobtainable) Bulging Wall - Helix Fossil
1,Bulging Wall - Hard Stone
1,(Unobtainable) Bulging Wall - Damp Rock
1,Bulging Wall - Everstone
2,Misc Item - Dragon Fang
25,Pokémon Encounter - Bronze
1,Bulging Wall - Revive
15,Nothing
1,(Unobtainable) Bulging Wall - Moon Stone
1,(Unobtainable) Bulging Wall - Light Clay
2,(Unobtainable) Bulging Wall - Rare Bone
1,Misc Item - Nugget
1,Bulging Wall - Damp Rock
3,Bulging Wall - Blue Shard
1,Misc Item - Charcoal
1,Bulging Wall - Light Clay
1,Bulging Wall - Leaf Stone
3,(Unobtainable) Bulging Wall - Green Shard
1,Bulging Wall - Thunder Stone
1,Bulging Wall - Water Stone
1,Bulging Wall - Smooth Rock
1,Misc Item - Leftovers
3,Bulging Wall - Green Shard
1,(Unobtainable) Bulging Wall - Water Stone
1,(Unobtainable) Bulging Wall - Smooth Rock
1,Bulging Wall - Heat Rock
3,Misc Item - Deep Sea Tooth
1,Bulging Wall - Claw Fossil
1,(Unobtainable) Bulging Wall - Armor Fossil
1,Misc Item - Shiny Stone
1,Bulging Wall - Root Fossil
1,Bulging Wall - Icy Rock
3,(Unobtainable) Bulging Wall - Yellow
1,(Unobtainable) Bulging Wall - Leaf Stone
3,Misc Item - Deep Sea Scale
1,Bulging Wall - Fire Stone
2,(Unobtainable) Bulging Wall - Heart Scale
4,(Unobtainable) Bulging Wall - Thunder Stone
17,(Unobtainable) Bulging Wall - Red Shard
50,Pokémon Encounter - Silver
2,Bulging Wall - Rare Bone
30,Bulging Wall - Heart Scale
4,(Unobtainable) Bulging Wall - Fire Stone
3,Misc Item - Dusk Stone
2,(Unobtainable) Bulging Wall - Odd Keystone
13,(Unobtainable) Bulging Wall - Dome Fossil
3,Misc Item - Dawn Stone
12,(Unobtainable) Bulging Wall - Skull Fossil
1,(Unobtainable) Bulging Wall - Oval Stone
1,Bulging Wall - Max Revive
4,(Unobtainable) Bulging Wall - Everstone
12,Bulging Wall - Skull Fossil
11,(Unobtainable) Bulging Wall - Icy Rock
2,Bulging Wall - Star Piece
5,Bulging Wall - Iron Ball
12,(Unobtainable) Bulging Wall - Root Fossil
5,(Unobtainable) Bulging Wall - Old Amber
10,Misc Item - PP Up
12,Bulging Wall - Armor Fossil
2,(Unobtainable) Bulging Wall - Star Piece
3,Bulging Wall - Moon Stone
3,(Unobtainable) Bulging Wall - Sun Stone
25,Misc Item - Big Mushroom
13,Bulging Wall - Dome Fossil
17,(Unobtainable) Bulging Wall - Blue Shard
12,(Unobtainable) Bulging Wall - Claw Fossil
12,Bulging Wall - Helix Fossil
5,Bulging Wall - Old Amber
11,(Unobtainable) Bulging Wall - Heat Rock
4,(Unobtainable) Bulging Wall - Hard Stone
17,Bulging Wall - Red Shard
3,Bulging Wall - Sun Stone
3,(Unobtainable) Bulging Wall - Revive
17,Bulging Wall - Yellow Shard
5,Misc Item - Sharp Beak
1,Bulging Wall - Oval Stone
5,(Unobtainable) Bulging Wall - Iron Ball
1,Misc Item - PP Max
1,(Unobtainable) Bulging Wall - Max Revive
2,Bulging Wall - Odd Keystone
12,(Unobtainable) Bulging Wall - Helix Fossil
4,Bulging Wall - Hard Stone
11,(Unobtainable) Bulging Wall - Damp Rock
4,Bulging Wall - Everstone
5,Misc Item - Dragon Fang
250,Pokémon Encounter - Bronze
3,Bulging Wall - Revive
150,Nothing
3,(Unobtainable) Bulging Wall - Moon Stone
5,(Unobtainable) Bulging Wall - Light Clay
2,(Unobtainable) Bulging Wall - Rare Bone
2,Misc Item - Nugget
11,Bulging Wall - Damp Rock
17,Bulging Wall - Blue Shard
5,Misc Item - Charcoal
5,Bulging Wall - Light Clay
4,Bulging Wall - Leaf Stone
17,(Unobtainable) Bulging Wall - Green Shard
4,Bulging Wall - Thunder Stone
4,Bulging Wall - Water Stone
11,Bulging Wall - Smooth Rock
5,Misc Item - Leftovers
17,Bulging Wall - Green Shard
4,(Unobtainable) Bulging Wall - Water Stone
11,(Unobtainable) Bulging Wall - Smooth Rock
11,Bulging Wall - Heat Rock
5,Misc Item - Deep Sea Tooth
12,Bulging Wall - Claw Fossil
12,(Unobtainable) Bulging Wall - Armor Fossil
3,Misc Item - Shiny Stone
12,Bulging Wall - Root Fossil
11,Bulging Wall - Icy Rock
17,(Unobtainable) Bulging Wall - Yellow Shard
4,(Unobtainable) Bulging Wall - Leaf Stone
6,Misc Item - Deep Sea Scale
4,Bulging Wall - Fire Stone
30,(Unobtainable) Bulging Wall - Heart Scale
27,Bulging Wall - Small Prism Sphere
27,(Unobtainable) Bulging Wall - Small Prism Sphere
27,Bulging Wall - Small Pale Sphere
27,(Unobtainable) Bulging Wall - Small Pale Sphere
167,Bulging Wall - Small Red Sphere
167,(Unobtainable) Bulging Wall - Small Red Sphere
167,Bulging Wall - Small Blue Sphere
167,(Unobtainable) Bulging Wall - Small Blue Sphere
107,Bulging Wall - Small Green Sphere
107,(Unobtainable) Bulging Wall - Small Green Sphere
12,Bulging Wall - Large Prism Sphere
13,(Unobtainable) Bulging Wall - Large Prism Sphere
13,Bulging Wall - Large Pale Sphere
13,(Unobtainable) Bulging Wall - Large Pale Sphere
84,Bulging Wall - Large Red Sphere
83,(Unobtainable) Bulging Wall - Large Red Sphere
83,Bulging Wall - Large Blue Sphere
83,(Unobtainable) Bulging Wall - Large Blue Sphere
53,Bulging Wall - Large Green Sphere
53,(Unobtainable) Bulging Wall - Large Green Sphere
1,(Unobtainable) Bulging Wall - Oval Stone
`;

const parseOutcomes = (raw: string): { weight: number; label: string }[] => {
	return raw
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => {
			const [weightStr, ...labelParts] = line.split(',');
			const weight = parseInt(weightStr, 10);
			const label = labelParts.join(',').trim(); // in case label itself has commas
			return { weight, label };
		});
};

const outcomes = parseOutcomes(rawlist);

const spinWheel = (outcomeList: Outcome[]): Outcome => {
	// Total weight
	const total = outcomeList.reduce((acc, o) => acc + o.weight, 0);

	// Random threshold
	const roll = Math.random() * total;

	// Walk through the list until threshold is crossed
	let cumulative = 0;
	for (const o of outcomeList) {
		cumulative += o.weight;
		if (roll < cumulative) {
			return o;
		}
	}

	// fallback (should never happen if weights > 0)
	return outcomeList[outcomeList.length - 1];
};

// Example usage:
const underground_draw = () => {
	const result = spinWheel(outcomes);
	return result.label;
};

export { underground_draw };
