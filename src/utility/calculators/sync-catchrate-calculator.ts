const calculateCatchRate = (
	catch_rate: number = 0,
	pokeball: string = 'pokeball',
	status: string = 'none',
	health: number = 100,
	target_level?: number | null,
	user_level?: number | null,
	target_speed?: number | null,
	target_weight?: number | null,
	isFishing?: boolean | null,
	isWater?: boolean | null,
	isOppositeGenderAndSameSpecies?: boolean | null,
	moonstoneEvolution?: boolean | null,
	isWaterOrBugType?: boolean | null,
	previouslyCaught?: boolean | null,
	turns?: number | null,
	isNightOrCave?: boolean | null,
	isFlying?: boolean | null
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
		case 'safariball':
			pokeball_multi = 1;
			pokeball_max_roll = 2000;
			break;
		case 'fastball':
			if (!target_speed) {
				pokeball_multi = 1;
				pokeball_max_roll = 2000;
				break;
			}
			pokeball_multi = target_speed >= 100 ? 4 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'levelball':
			if (!target_level || !user_level) {
				pokeball_multi = 1;
				pokeball_max_roll = 2000;
				break;
			}

			pokeball_multi =
				user_level > 4 * target_level
					? 8
					: user_level > 2 * target_level
					? 4
					: user_level > target_level
					? 2
					: 1;
			pokeball_max_roll = 2000;
			break;
		case 'lureball':
			pokeball_multi = isFishing ? 4 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'heavyball':
			if (!target_weight) {
				pokeball_multi = 1;
				pokeball_max_roll = 2000;
				break;
			}
			pokeball_multi =
				target_weight >= 300
					? 1.5
					: target_weight >= 200
					? 1.35
					: target_weight == 100
					? 1.2
					: 0.8;
			pokeball_max_roll = 2000;
			break;
		case 'loveball':
			pokeball_multi = isOppositeGenderAndSameSpecies ? 8 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'moonball':
			pokeball_multi = moonstoneEvolution ? 4 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'sportball':
			pokeball_multi = 1;
			pokeball_max_roll = 2000;
			break;
		case 'netball':
			pokeball_multi = isWaterOrBugType ? 3.5 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'diveball':
			pokeball_multi = isWater ? 3.5 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'nestball':
			if (!target_level) {
				pokeball_multi = 1;
				pokeball_max_roll = 2000;
				break;
			}
			pokeball_multi = target_level <= 29 ? (41 - target_level) / 10 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'repeatball':
			pokeball_multi = previouslyCaught ? 3.5 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'timerball':
			if (!turns) {
				pokeball_multi = 1;
				pokeball_max_roll = 2000;
				break;
			}
			pokeball_multi = Math.min(4, 1 + (turns * 1229) / 4096);
			pokeball_max_roll = 2000;
			break;
		case 'luxuryball':
			pokeball_multi = 1;
			pokeball_max_roll = 2000;
			break;
		case 'premierball':
			pokeball_multi = 1;
			pokeball_max_roll = 2000;
			break;
		case 'duskball':
			pokeball_multi = isNightOrCave ? 3 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'healball':
			pokeball_multi = 1;
			pokeball_max_roll = 2000;
			break;
		case 'quickball':
			pokeball_multi = turns === 1 ? 5 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'cherishball':
			pokeball_multi = 1;
			pokeball_max_roll = 2000;
			break;
		case 'parkball':
			pokeball_multi = 1;
			pokeball_max_roll = 2000;
			break;
		case 'dreamball':
			pokeball_multi = status === 'sleep' ? 4 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'strangeball':
			pokeball_multi = 0.75;
			pokeball_max_roll = 2000;
			break;
		case 'featherball':
			if (!isFlying) {
				pokeball_multi = 1;
				pokeball_max_roll = 2000;
				break;
			}
			pokeball_multi = isFlying ? 1.25 : 1;
			pokeball_max_roll = 2000;
			break;
		case 'wingball':
			if (!isFlying) {
				pokeball_multi = 1;
				pokeball_max_roll = 2000;
				break;
			}
			pokeball_multi = isFlying ? 1.75 : 1.5;
			pokeball_max_roll = 2000;
			break;
		case 'jetball':
			if (!isFlying) {
				pokeball_multi = 1;
				pokeball_max_roll = 2000;
				break;
			}
			pokeball_multi = isFlying ? 2.75 : 2;
			pokeball_max_roll = 2000;
			break;
		case 'ultraball':
			pokeball_multi = 2;
			pokeball_max_roll = 1500;
			break;
		case 'ultraball-hisui':
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

	return { catch_roll, catch_rate, caught, chance, pokeball, pokeball_multi };
};

export { calculateCatchRate };
