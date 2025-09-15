export const gen_num_convert = (gen: string) => {
	switch (gen) {
		case 'i':
			return 1;
		case 'ii':
			return 2;
		case 'iii':
			return 3;
		case 'iv':
			return 4;
		case 'v':
			return 5;
		case 'vi':
			return 6;
		case 'vii':
			return 7;
		case 'viii':
			return 8;
		case 'ix':
			return 9;
		default:
			return 0;
	}
};
