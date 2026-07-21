export const REGIONS = [
	'kanto',
	'johto',
	'hoenn',
	'sinnoh',
	'unova',
	'kalos',
	'alola',
	'galar',
  'paldea',
	'oblivia'
] as const;

export type Region = (typeof REGIONS)[number];
