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
	let status_bonus = 0;

	switch (status) {
		case 'None':
			status_bonus = 0;
			break;
		case 'Burn':
			status_bonus = 120;
			break;
		case 'Poison':
			status_bonus = 120;
			break;
		case 'Paralysis':
			status_bonus = 120;
			break;
		case 'Sleep':
			status_bonus = 250;
			break;
		case 'Freeze':
			status_bonus = 250;
			break;
	}

	catch_rate = catch_rate * pokeball_multi;

	catch_rate = catch_rate + status_bonus;

	catch_rate = catch_rate + health_bonus;

	const catch_roll = Math.floor(Math.random() * (pokeball_max_roll + 1));

	const caught = catch_roll <= catch_rate ? true : false;

	const chance = Math.floor((catch_roll / pokeball_max_roll) * 100);

	return { catch_roll, catch_rate, caught, chance };
};

export { calculateCatchRate };
