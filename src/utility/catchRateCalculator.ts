const calculateCatchRate = (
	catch_rate: number = 0,
	pokeball: string = 'pokeball',
	status: string = 'none',
	health: number = 100
) => {
	let pokeball_multi = 0;
	let pokeball_max_roll = 0;
	// console.log('Catch Rate 0: ' + catch_rate);
	// Catch rate/Threshold, the number to beat
	catch_rate /= 2;
	// console.log('Catch Rate 1: ' + catch_rate);

	const health_bonus = Math.round(
		-1 * (pokeball_max_roll / 10) * (-1 + health / 100)
	);

	switch (pokeball.toLowerCase()) {
		case 'pokeball':
			pokeball_multi = 1;
			pokeball_max_roll = 2500;
			break;
		case 'greatball':
			pokeball_multi = 1.5;
			pokeball_max_roll = 2000;
			break;
		case 'ultraball':
			pokeball_multi = 2;
			pokeball_max_roll = 1500;
			break;
		default:
			pokeball_multi = 1;
			pokeball_max_roll = 2500;
			break;
	}
	let status_bonus = 0;

	switch (status.toLowerCase()) {
		case 'burn':
			status_bonus = 120;
			break;
		case 'poison':
			status_bonus = 120;
			break;
		case 'paralysis':
			status_bonus = 120;
			break;
		case 'sleep':
			status_bonus = 250;
			break;
		case 'freeze':
			status_bonus = 250;
			break;
		default:
			status_bonus = 0;
			break;
	}

	catch_rate *= pokeball_multi;
	// console.log('Catch Rate 2: ' + catch_rate);

	catch_rate += status_bonus;
	// console.log('Catch Rate 3: ' + catch_rate);

	catch_rate += health_bonus;
	// console.log('Catch Rate 4: ' + catch_rate);

	const catch_roll = Math.floor(Math.random() * (pokeball_max_roll + 1));
	// console.log('Catch Roll: ' + catch_roll);

	const caught = catch_roll <= catch_rate ? true : false;
	// console.log('Caught: ' + caught);

	const chance = ((catch_rate / pokeball_max_roll) * 100).toFixed(2);
	// console.log('Catch Chance: ' + chance);

	return { catch_roll, catch_rate, caught, chance };
};

export { calculateCatchRate };
