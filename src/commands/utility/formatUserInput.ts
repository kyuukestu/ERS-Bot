const formatUserInput = (input: string) => {
	// Format the move name (lowercase, replace spaces with hyphens, remove apostrophes)
	const formatted = input.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');

	return formatted;
};

export { formatUserInput };
