export const formatUserInput = (input?: string) => {
	if (!input) {
		return '';
	}
	// Format the name (lowercase, replace spaces with hyphens, remove apostrophes)
	const formatted = input
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/'/g, '')
		.replace(/$-/g, '');

	return formatted;
};
