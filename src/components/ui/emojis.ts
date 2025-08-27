// Emojis for visual appeal
const abilityEmojis: { [key: string]: string } = {
	offensive: '⚔️',
	defensive: '🛡️',
	utility: '🔧',
	other: '❓',
};

// Emojis for visual appeal
const moveEmojis: { [key: string]: string } = {
	physical: '⚔️',
	special: '✨',
	status: '🔮',
};

// Emojis for visual appeal
const itemEmojis: { [key: string]: string } = {
	healing: '❤️‍🩹', // Restores HP
	medicine: '💊', // Status curing
	'stat-boosts': '📈', // X-Attack, X-Defense, etc.
	'key-items': '🗝️', // Key storyline items
	'technical-machines': '📀', // TMs / HMs / TRs
	'battle-items': '⚔️', // Battle-only items
	evolution: '⬆️', // Evolution stones, items
	'effort-drop': '🧃', // EV-reducing berries
	other: '🎲', // Miscellaneous items
	'in-a-pinch': '😬', // Berries that activate in low HP
	'picky-healing': '🥤', // Healing with conditions (e.g. Lemonade, Moomoo Milk)
	'type-protection': '🛡️', // Protective items (e.g. berries reducing type damage)
	'baking-only': '🧁', // Poffin ingredients
	collectibles: '📿', // Shards, Pearls, Nuggets
	spelunking: '⛏️', // Fossils, underground treasures
	choice: '🎯', // Choice Band, Specs, Scarf
	'effort-training': '🏋️', // Power items for EV training
	'bad-held-items': '☠️', // Items that hinder the holder (e.g. Sticky Barb)
	'held-items': '🎒', // General held items
	training: '📚', // Exp. Share, Macho Brace
	'species-specific': '🐉', // Light Ball, Thick Club, etc.
	plates: '🍽️', // Arceus Plates
	'type-enhancement': '🔥', // Charcoal, Mystic Water, etc.
	'event-items': '🎟️', // Tickets, Member Card, etc.
};

// Stat emojis for better visual appeal
const statEmojis: { [key: string]: string } = {
	hp: '❤️',
	attack: '⚔️',
	defense: '🛡️',
	'special-attack': '✨',
	'special-defense': '🔮',
	speed: '💨',
};

// Generation emojis
const getGenerationEmoji = (generation: number) => {
	const generationEmojis: { [key: number]: string } = {
		1: '1️⃣',
		2: '2️⃣',
		3: '3️⃣',
		4: '4️⃣',
		5: '5️⃣',
		6: '6️⃣',
		7: '7️⃣',
		8: '8️⃣',
		9: '9️⃣',
	};
	return generationEmojis[generation] || '❓';
};

const getTypeEmoji = (type: string) => {
	const typeEmojis: { [key: string]: string } = {
		normal: '⚪',
		fire: '🔥',
		water: '💧',
		electric: '⚡',
		grass: '🌿',
		ice: '❄️',
		fighting: '👊',
		poison: '☠️',
		ground: '🌍',
		flying: '🌪️',
		psychic: '🔮',
		bug: '🐛',
		rock: '🗿',
		ghost: '👻',
		dragon: '🐉',
		dark: '🌑',
		steel: '⚙️',
		fairy: '🧚',
	};
	return typeEmojis[type] || '❓';
};

export {
	abilityEmojis,
	moveEmojis,
	itemEmojis,
	statEmojis,
	getGenerationEmoji,
	getTypeEmoji,
};
