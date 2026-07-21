export const GENDERS = [
	'male',
	'female',
	'undetermined',
	'non-binary',
	'other',
] as const;

export type Gender = (typeof GENDERS)[number];
