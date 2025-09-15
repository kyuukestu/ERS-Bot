// Color scheme for aesthetic enhancement (default based on ability utility)
const abilityColors: { [key: string]: number } = {
	offensive: 0xff4444,
	defensive: 0x44ff44,
	utility: 0x4444ff,
	other: 0xcccccc,
};

// Move type colors for aesthetic enhancement
const typeColors: { [key: string]: number } = {
	normal: 0xa8a878,
	fire: 0xf08030,
	water: 0x6890f0,
	electric: 0xf8d030,
	grass: 0x78c850,
	ice: 0x98d8d8,
	fighting: 0xc03028,
	poison: 0xa040a0,
	ground: 0xe0c068,
	flying: 0xa890f0,
	psychic: 0xf85888,
	bug: 0xa8b820,
	rock: 0xb8a038,
	ghost: 0x705898,
	dragon: 0x7038f8,
	dark: 0x705848,
	steel: 0xb8b8d0,
	fairy: 0xee99ac,
};

// Item category colors for aesthetic enhancement
const itemCategoryColors: { [key: string]: number } = {
	medicine: 0x4caf50,
	held_item: 0x2196f3,
	berry: 0x8bc34a,
	tm: 0xff9800,
	other: 0x9e9e9e,
};

export { abilityColors, typeColors, itemCategoryColors };
