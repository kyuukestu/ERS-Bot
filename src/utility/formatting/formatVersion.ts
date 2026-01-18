const versionMap: Record<string, string> = {};

// Generation I
['red-blue', 'yellow'].forEach((v) => (versionMap[v] = 'I (1)'));

// Generation II
['gold-silver', 'crystal'].forEach((v) => (versionMap[v] = 'II (2)'));

// Generation III
['ruby-sapphire', 'emerald', 'firered-leafgreen', 'xd', 'colosseum'].forEach(
	(v) => (versionMap[v] = 'III (3)'),
);

// Generation IV
['platinum', 'heartgold-soulsilver', 'diamond-pearl'].forEach(
	(v) => (versionMap[v] = 'IV (4)'),
);

// Generation V
['black-white', 'black-2-white-2'].forEach((v) => (versionMap[v] = 'V (5)'));

// Generation VI
['x-y', 'omega-ruby-alpha-sapphire'].forEach((v) => (versionMap[v] = 'VI (6)'));

// Generation VII
['sun-moon', 'ultra-sun-ultra-moon'].forEach(
	(v) => (versionMap[v] = 'VII (7)'),
);

// Generation VIII
[
	'lets-go-pikachu-lets-go-eevee',
	'sword-shield',
	'brilliant-diamond-shining-pearl',
].forEach((v) => (versionMap[v] = 'VIII (8)'));

// Generation IX
['scarlet-violet'].forEach((v) => (versionMap[v] = 'IX (9)'));

export const version_convert = (gen: string): string =>
	versionMap[gen] ?? '??? Ping Kyuu';
