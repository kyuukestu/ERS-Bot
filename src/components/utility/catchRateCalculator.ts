const calculateCatchRate = (
	catch_rate: number,
	pokeball: string,
	status: string,
	health: number
) => {
	let pokeball_multi = 0;
	let pokeball_max_roll = 0;

	if (!['Burn', 'Poison', 'Paralysis', 'Sleep', 'Freeze'].includes(status)) {
		status = 'None';
	}

	const status_bonus = {
		None: 0,
		Burn: 120,
		Poison: 120,
		Paralysis: 120,
		Sleep: 250,
		Freeze: 250,
	};

	// Catch rate/Threshold, the number to beat
	catch_rate = catch_rate / 2;

	const health_bonus = Math.round(
		-1 * (pokeball_max_roll / 10) * (-1 + health / 100)
	);

	switch (pokeball) {
		case 'Pokeball':
			pokeball_multi = 1;
			pokeball_max_roll = 2500;
			break;
		case 'Greatball':
			pokeball_multi = 1.5;
			pokeball_max_roll = 2000;
			break;
		case 'Ultraball':
			pokeball_multi = 2;
			pokeball_max_roll = 1500;
			break;
	}

	catch_rate = catch_rate * pokeball_multi;

	catch_rate = catch_rate + status_bonus[status];

	catch_rate = catch_rate + health_bonus;

	const catch_roll = Math.floor(Math.random() * (pokeball_max_roll + 1));

	const caught = catch_roll <= catch_rate ? true : false;

	return { catch_roll, catch_rate, caught };
};

export { calculateCatchRate };
