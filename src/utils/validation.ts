export function isOneOf<T extends readonly string[]>(
	value: string,
	options: T,
): value is T[number] {
	return options.includes(value);
}

export function validateLength(
	value: string,
	min: number,
	max: number,
): boolean {
	return value.length >= min && value.length <= max;
}
