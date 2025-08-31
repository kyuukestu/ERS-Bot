/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	calculate,
	Pokemon,
	Move,
	Field,
	type GenerationNum,
} from '@smogon/calc';
import {
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ButtonInteraction,
	StringSelectMenuInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
} from 'discord.js';

// Store user selections
interface UserSelections {
	generation: string;
	move: string;
	format: string;
	weather: string;
	terrain: string;
	fieldConditions: string[];
	pokemon: {
		name: string;
		level: number;
		ability: string;
		nature: string;
		item: string;
		status: string;
		evs: {
			hp: number;
			atk: number;
			def: number;
			spa: number;
			spd: number;
			spe: number;
		};
		boosts: {
			hp: number;
			atk: number;
			def: number;
			spa: number;
			spd: number;
			spe: number;
		};
	}[];
}

// Helper function to clean item names
const cleanItemName = (itemName: string | undefined): string | undefined => {
	if (!itemName || itemName === '(none)' || itemName === '') {
		return undefined;
	}
	return itemName;
};

// Helper function to clean ability names
const cleanAbilityName = (
	abilityName: string | undefined
): string | undefined => {
	if (
		!abilityName ||
		abilityName === '(other)' ||
		abilityName === '(none)' ||
		abilityName === ''
	) {
		return undefined;
	}
	return abilityName;
};

// Helper function to parse stat modifiers
const parseStatModifiers = (statsString: string) => {
	const boosts = {
		hp: 0,
		atk: 0,
		def: 0,
		spa: 0,
		spd: 0,
		spe: 0,
	};

	if (!statsString) return boosts;

	statsString.split('/').forEach((stat) => {
		const parts = stat.trim().toLowerCase().split(' ');
		if (parts.length < 2) return;

		const value = parseInt(parts[0]);
		const statName = parts.slice(1).join('').replace(/\s+/g, '');

		// Map common stat name variations
		const statMap: { [key: string]: keyof typeof boosts } = {
			atk: 'atk',
			attack: 'atk',
			def: 'def',
			defense: 'def',
			spa: 'spa',
			specialattack: 'spa',
			spd: 'spd',
			specialdefense: 'spd',
			spe: 'spe',
			speed: 'spe',
			hp: 'hp',
		};

		if (statMap[statName] && !isNaN(value)) {
			boosts[statMap[statName]] = value;
		}
	});

	return boosts;
};

// Helper function to parse EVs
const parseEVs = (evsString: string) => {
	const evs = {
		hp: 0,
		atk: 0,
		def: 0,
		spa: 0,
		spd: 0,
		spe: 0,
	};

	if (!evsString) return evs;

	evsString.split('/').forEach((ev) => {
		const parts = ev.trim().toLowerCase().split(' ');
		if (parts.length < 2) return;

		const value = parseInt(parts[0]);
		const statName = parts.slice(1).join('').replace(/\s+/g, '');

		// Map common stat name variations
		const statMap: { [key: string]: keyof typeof evs } = {
			hp: 'hp',
			atk: 'atk',
			attack: 'atk',
			def: 'def',
			defense: 'def',
			spa: 'spa',
			specialattack: 'spa',
			spd: 'spd',
			specialdefense: 'spd',
			spe: 'spe',
			speed: 'spe',
		};

		if (statMap[statName] && !isNaN(value)) {
			evs[statMap[statName]] = value;
		}
	});

	return evs;
};

const introReply = (stepIndex: number) => {
	const introEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Damage Calculator')
		.setDescription('Please follow the steps to perform a damage calculation.');

	return {
		embeds: [introEmbed],
		components: [handleButtons(stepIndex)],
	};
};

const genReply = (stepIndex: number, selectedGeneration?: string) => {
	const genSelectMenu = new StringSelectMenuBuilder()
		.setCustomId('generation')
		.setPlaceholder(
			selectedGeneration
				? `Selected: Gen ${selectedGeneration}`
				: 'Select a generation'
		)
		.addOptions(
			{ label: 'Gen 1 (RBY)', value: '1' },
			{ label: 'Gen 2 (GSC)', value: '2' },
			{ label: 'Gen 3 (RSE)', value: '3' },
			{ label: 'Gen 4 (DPPt)', value: '4' },
			{ label: 'Gen 5 (BW-B2W2)', value: '5' },
			{ label: 'Gen 6 (XY)', value: '6' },
			{ label: 'Gen 7 (SM-USUM)', value: '7' },
			{ label: 'Gen 8 (SwSh)', value: '8' },
			{ label: 'Gen 9 (SV)', value: '9' }
		);

	const description = selectedGeneration
		? `Generation ${selectedGeneration} selected. You can change your selection or proceed to the next step.`
		: 'Please select the generation of the pokemon.';

	const genEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Generation')
		.setDescription(description);

	return {
		embeds: [genEmbed],
		components: [
			new ActionRowBuilder().addComponents(genSelectMenu),
			handleButtons(stepIndex),
		],
	};
};

const pokemonReply = (
	stepIndex: number,
	attacker?: string,
	defender?: string,
	userSelections?: UserSelections
) => {
	const attackerStatus = userSelections?.pokemon[0]?.status || 'None';
	const defenderStatus = userSelections?.pokemon[1]?.status || 'None';

	const pokemonEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Pokemon Setup')
		.setDescription('Configure your Pokemon and their status conditions.')
		.addFields(
			{
				name: 'Attacker',
				value: `**Pokemon:** ${
					attacker || 'Not selected'
				}\n**Status:** ${attackerStatus}`,
				inline: true,
			},
			{
				name: 'Defender',
				value: `**Pokemon:** ${
					defender || 'Not selected'
				}\n**Status:** ${defenderStatus}`,
				inline: true,
			}
		);

	const pokemonButtons = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('add_attacker')
			.setLabel('Configure Attacker')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('add_defender')
			.setLabel('Configure Defender')
			.setStyle(ButtonStyle.Secondary)
	);

	const statusSelect = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('attacker_status')
			.setPlaceholder('Set attacker status condition')
			.addOptions(
				{ label: 'None', value: 'none' },
				{ label: 'Burn', value: 'burn' },
				{ label: 'Freeze', value: 'freeze' },
				{ label: 'Paralysis', value: 'paralysis' },
				{ label: 'Poison', value: 'poison' },
				{ label: 'Bad Poison', value: 'bad poison' },
				{ label: 'Sleep', value: 'sleep' }
			)
	);

	const defenderStatusSelect = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('defender_status')
			.setPlaceholder('Set defender status condition')
			.addOptions(
				{ label: 'None', value: 'none' },
				{ label: 'Burn', value: 'burn' },
				{ label: 'Freeze', value: 'freeze' },
				{ label: 'Paralysis', value: 'paralysis' },
				{ label: 'Poison', value: 'poison' },
				{ label: 'Bad Poison', value: 'bad poison' },
				{ label: 'Sleep', value: 'sleep' }
			)
	);

	return {
		embeds: [pokemonEmbed],
		components: [
			handleButtons(stepIndex),
			pokemonButtons,
			statusSelect,
			defenderStatusSelect,
		],
	};
};

const formatReply = (stepIndex: number, userSelections: UserSelections) => {
	const formatEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Battle Format')
		.setDescription('Please select the battle format.')
		.addFields({
			name: 'Format',
			value: userSelections.format || 'Not selected',
			inline: true,
		});

	const setFormat = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('format')
			.setPlaceholder('Select a format')
			.addOptions(
				{
					label: 'Singles',
					value: 'singles',
				},
				{
					label: 'Doubles',
					value: 'doubles',
				}
			)
	);

	return {
		embeds: [formatEmbed],
		components: [handleButtons(stepIndex), setFormat],
	};
};

const weatherReply = (stepIndex: number, userSelections: UserSelections) => {
	const weatherEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Weather & Field Conditions')
		.setDescription('Set weather, terrain, and other field conditions.')
		.addFields(
			{
				name: 'Weather',
				value: userSelections.weather || 'None',
				inline: true,
			},
			{
				name: 'Terrain',
				value: userSelections.terrain || 'None',
				inline: true,
			},
			{
				name: 'Field Conditions',
				value:
					userSelections.fieldConditions.length > 0
						? userSelections.fieldConditions.join(', ')
						: 'None',
				inline: false,
			}
		);

	const weatherSelect = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('weather')
			.setPlaceholder(
				userSelections.weather
					? `Selected: ${userSelections.weather}`
					: 'Select weather'
			)
			.addOptions(
				{ label: 'None', value: 'none' },
				{ label: 'Sun', value: 'sun' },
				{ label: 'Rain', value: 'rain' },
				{ label: 'Sandstorm', value: 'sandstorm' },
				{ label: 'Hail', value: 'hail' },
				{ label: 'Snow', value: 'snow' },
				{ label: 'Harsh Sun', value: 'harsh sun' },
				{ label: 'Heavy Rain', value: 'heavy rain' },
				{ label: 'Strong Winds', value: 'strong winds' }
			)
	);

	const terrainSelect = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('terrain')
			.setPlaceholder(
				userSelections.terrain
					? `Selected: ${userSelections.terrain}`
					: 'Select terrain'
			)
			.addOptions(
				{ label: 'None', value: 'none' },
				{ label: 'Electric Terrain', value: 'electric' },
				{ label: 'Grassy Terrain', value: 'grassy' },
				{ label: 'Misty Terrain', value: 'misty' },
				{ label: 'Psychic Terrain', value: 'psychic' }
			)
	);

	const fieldConditionsSelect = new ActionRowBuilder().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('field_conditions')
			.setPlaceholder('Select field conditions (optional)')
			.setMaxValues(5)
			.addOptions(
				{ label: 'Reflect', value: 'reflect' },
				{ label: 'Light Screen', value: 'light screen' },
				{ label: 'Aurora Veil', value: 'aurora veil' },
				{ label: 'Stealth Rock', value: 'stealth rock' },
				{ label: 'Spikes', value: 'spikes' },
				{ label: 'Toxic Spikes', value: 'toxic spikes' },
				{ label: 'Sticky Web', value: 'sticky web' },
				{ label: 'Tailwind', value: 'tailwind' },
				{ label: 'Trick Room', value: 'trick room' },
				{ label: 'Magic Room', value: 'magic room' },
				{ label: 'Wonder Room', value: 'wonder room' },
				{ label: 'Gravity', value: 'gravity' }
			)
	);

	return {
		embeds: [weatherEmbed],
		components: [
			handleButtons(stepIndex),
			weatherSelect,
			terrainSelect,
			fieldConditionsSelect,
		],
	};
};

const moveReply = (stepIndex: number) => {
	const moveEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Move')
		.setDescription('Please select the move.');

	const setMove = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('set_move')
			.setLabel('Set Move')
			.setStyle(ButtonStyle.Secondary)
	);

	return {
		embeds: [moveEmbed],
		components: [handleButtons(stepIndex), setMove],
	};
};

const calcReply = (stepIndex: number, userSelections: UserSelections) => {
	const gen = parseInt(userSelections.generation) as GenerationNum;

	try {
		// Create attacker Pokemon with cleaned data
		const attackerOptions: any = {
			level: userSelections.pokemon[0].level,
			nature: userSelections.pokemon[0].nature,
			evs: userSelections.pokemon[0].evs,
			boosts: userSelections.pokemon[0].boosts,
		};

		// Only add item and ability if they're valid
		const cleanedItem = cleanItemName(userSelections.pokemon[0].item);
		const cleanedAbility = cleanAbilityName(userSelections.pokemon[0].ability);

		if (cleanedItem) {
			attackerOptions.item = cleanedItem;
		}
		if (cleanedAbility) {
			attackerOptions.ability = cleanedAbility;
		}

		// Add status condition if set
		if (
			userSelections.pokemon[0].status &&
			userSelections.pokemon[0].status !== 'none'
		) {
			attackerOptions.status = userSelections.pokemon[0].status;
		}

		const attacker = new Pokemon(
			gen,
			userSelections.pokemon[0].name,
			attackerOptions
		);

		// Create defender Pokemon with cleaned data
		const defenderOptions: any = {
			level: userSelections.pokemon[1].level,
			nature: userSelections.pokemon[1].nature,
			evs: userSelections.pokemon[1].evs,
			boosts: userSelections.pokemon[1].boosts,
		};

		const cleanedDefenderItem = cleanItemName(userSelections.pokemon[1].item);
		const cleanedDefenderAbility = cleanAbilityName(
			userSelections.pokemon[1].ability
		);

		if (cleanedDefenderItem) {
			defenderOptions.item = cleanedDefenderItem;
		}
		if (cleanedDefenderAbility) {
			defenderOptions.ability = cleanedDefenderAbility;
		}

		// Add status condition if set
		if (
			userSelections.pokemon[1].status &&
			userSelections.pokemon[1].status !== 'none'
		) {
			defenderOptions.status = userSelections.pokemon[1].status;
		}

		const defender = new Pokemon(
			gen,
			userSelections.pokemon[1].name,
			defenderOptions
		);

		// Create move
		const move = new Move(gen, userSelections.move);

		type Weather =
			| 'Sun'
			| 'Rain'
			| 'Sand'
			| 'Snow'
			| 'Harsh Sunshine'
			| 'Heavy Rain'
			| 'Strong Winds'
			| undefined;

		type Terrain = 'Electric' | 'Grassy' | 'Misty' | 'Psychic' | undefined;

		// Create Field instance
		const field = new Field({
			gameType: userSelections.format === 'doubles' ? 'Doubles' : 'Singles',
			weather:
				userSelections.weather && userSelections.weather !== 'none'
					? (userSelections.weather as Weather)
					: undefined,
			terrain:
				userSelections.terrain && userSelections.terrain !== 'none'
					? (userSelections.terrain as Terrain)
					: undefined,
			isGravity: userSelections.fieldConditions.includes('gravity'),
			isMagicRoom: userSelections.fieldConditions.includes('magic room'),
			isWonderRoom: userSelections.fieldConditions.includes('wonder room'),
			// Handle Stealth Rock and Spikes per side
			attackerSide: {
				isSR: userSelections.fieldConditions.includes('stealth rock'),
				spikes: userSelections.fieldConditions.includes('spikes') ? 1 : 0,
				isTailwind: userSelections.fieldConditions.includes('tailwind'),
				isReflect: userSelections.fieldConditions.includes('reflect'),
				isLightScreen: userSelections.fieldConditions.includes('lightscreen'),
				isFlowerGift: userSelections.fieldConditions.includes('flower gift'),
				isSeeded: userSelections.fieldConditions.includes('seeded'),
				isAuroraVeil: userSelections.fieldConditions.includes('aurora veil'),
				isBattery: userSelections.fieldConditions.includes('battery'),
				isFriendGuard: userSelections.fieldConditions.includes('friend guard'),
				isHelpingHand: userSelections.fieldConditions.includes('helping hand'),
				isPowerSpot: userSelections.fieldConditions.includes('power spot'),
				isForesight: userSelections.fieldConditions.includes('foresight'),
				isProtected: userSelections.fieldConditions.includes('protected'),
			},
			defenderSide: {
				isSR: userSelections.fieldConditions.includes('stealth rock'),
				spikes: userSelections.fieldConditions.includes('spikes') ? 1 : 0,
				isTailwind: userSelections.fieldConditions.includes('tailwind'),
				isReflect: userSelections.fieldConditions.includes('reflect'),
				isLightScreen: userSelections.fieldConditions.includes('lightscreen'),
				isFlowerGift: userSelections.fieldConditions.includes('flower gift'),
				isSeeded: userSelections.fieldConditions.includes('seeded'),
				isAuroraVeil: userSelections.fieldConditions.includes('aurora veil'),
				isBattery: userSelections.fieldConditions.includes('battery'),
				isFriendGuard: userSelections.fieldConditions.includes('friend guard'),
				isHelpingHand: userSelections.fieldConditions.includes('helping hand'),
				isPowerSpot: userSelections.fieldConditions.includes('power spot'),
				isForesight: userSelections.fieldConditions.includes('foresight'),
				isProtected: userSelections.fieldConditions.includes('protected'),
			},
		});

		// Calculate damage
		const result = calculate(gen, attacker, defender, move, field);

		// Format the result properly
		const formatResult = (result: any) => {
			// Get damage range
			const damage = result.damage;
			let damageText = '';

			if (Array.isArray(damage)) {
				const minDamage = Math.min(...damage);
				const maxDamage = Math.max(...damage);
				damageText = `${minDamage}-${maxDamage}`;
			} else {
				damageText = `${damage}`;
			}

			// Calculate percentage
			const defenderHP = result.defender.rawStats.hp;
			const minPercent = Array.isArray(damage)
				? ((Math.min(...damage) / defenderHP) * 100).toFixed(1)
				: ((damage / defenderHP) * 100).toFixed(1);
			const maxPercent = Array.isArray(damage)
				? ((Math.max(...damage) / defenderHP) * 100).toFixed(1)
				: minPercent;

			const percentText =
				minPercent === maxPercent
					? `${minPercent}%`
					: `${minPercent}-${maxPercent}%`;

			// Create formatted description
			const attackerName = result.attacker.name;
			const defenderName = result.defender.name;
			const moveName = result.move.name;

			let description = `**${attackerName}** ${moveName} vs **${defenderName}**\n\n`;
			description += `**Damage:** ${damageText} (${percentText})\n`;
			description += `**Defender HP:** ${defenderHP}\n`;

			// Add conditions info
			const conditions = [];
			if (userSelections.weather && userSelections.weather !== 'none') {
				conditions.push(`Weather: ${userSelections.weather}`);
			}
			if (userSelections.terrain && userSelections.terrain !== 'none') {
				conditions.push(`Terrain: ${userSelections.terrain}`);
			}
			if (
				userSelections.pokemon[0].status &&
				userSelections.pokemon[0].status !== 'none'
			) {
				conditions.push(`Attacker: ${userSelections.pokemon[0].status}`);
			}
			if (
				userSelections.pokemon[1].status &&
				userSelections.pokemon[1].status !== 'none'
			) {
				conditions.push(`Defender: ${userSelections.pokemon[1].status}`);
			}
			if (userSelections.fieldConditions.length > 0) {
				conditions.push(`Field: ${userSelections.fieldConditions.join(', ')}`);
			}

			if (conditions.length > 0) {
				description += `\n**Conditions:** ${conditions.join(' • ')}\n`;
			}

			return description;
		};

		const calcEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle('Damage Calculator Results')
			.setDescription(formatResult(result));

		return {
			embeds: [calcEmbed],
			components: [handleButtons(stepIndex)],
		};
	} catch (error) {
		console.error('Calculation error:', error);

		const errorEmbed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('Calculation Error')
			.setDescription(`Error calculating damage: ${error}`);

		return {
			embeds: [errorEmbed],
			components: [handleButtons(stepIndex)],
		};
	}
};

const replyArray = (userSelections: UserSelections) => {
	const replyArray: any = [];
	replyArray.push(introReply(replyArray.length));
	replyArray.push(genReply(replyArray.length, userSelections.generation));
	replyArray.push(
		pokemonReply(
			replyArray.length,
			userSelections.pokemon[0].name,
			userSelections.pokemon[1].name,
			userSelections
		)
	);
	replyArray.push(formatReply(replyArray.length, userSelections));
	replyArray.push(weatherReply(replyArray.length, userSelections));
	replyArray.push(moveReply(replyArray.length));
	replyArray.push(calcReply(replyArray.length, userSelections));
	return replyArray;
};

const handleButtons = (stepIndex: number) => {
	const steps = 7; // Updated to include weather step
	const canGoNext = stepIndex < steps - 1;
	const canGoPrevious = stepIndex > 0;

	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('previous')
			.setLabel('◀ Previous')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(!canGoPrevious),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Next ▶')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(!canGoNext)
	);
};

const createMoveModal = (customId: string, title: string) => {
	const modal = new ModalBuilder().setCustomId(customId).setTitle(title);

	const moveNameInput = new TextInputBuilder()
		.setCustomId('move_name')
		.setLabel('Move Name')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., Fire Punch')
		.setRequired(true)
		.setMaxLength(50);

	const modalActionRow1 = new ActionRowBuilder().addComponents(
		moveNameInput as TextInputBuilder
	);

	return modal.addComponents(
		modalActionRow1 as ActionRowBuilder<TextInputBuilder>
	);
};

const createPokemonModal = (customId: string, title: string) => {
	const modal = new ModalBuilder().setCustomId(customId).setTitle(title);

	const pokemonNameInput = new TextInputBuilder()
		.setCustomId('pokemon_name')
		.setLabel('Pokemon Name')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., Pikachu')
		.setRequired(true)
		.setMaxLength(50);

	const statModifierInput = new TextInputBuilder()
		.setCustomId('pokemon_stat_modifier')
		.setLabel('Stat Modifier')
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('e.g. +2 Atk / -3 Def / +2 SpA / +1 SpD / +6 Spe')
		.setRequired(false)
		.setMaxLength(200);

	const abilityInput = new TextInputBuilder()
		.setCustomId('pokemon_ability')
		.setLabel('Ability (Optional)')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., Static')
		.setRequired(false)
		.setMaxLength(50);

	const itemInput = new TextInputBuilder()
		.setCustomId('pokemon_item')
		.setLabel('Item (Optional)')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., Light Ball')
		.setRequired(false)
		.setMaxLength(50);

	const evsInput = new TextInputBuilder()
		.setCustomId('pokemon_evs')
		.setLabel('EVs (Optional)')
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('e.g., 0 HP / 252 Atk / 0 Def / 252 SpD / 252 SpA / 0 Spe')
		.setRequired(false)
		.setMaxLength(200);

	// Create action rows for each input
	const firstActionRow = new ActionRowBuilder().addComponents(
		pokemonNameInput as TextInputBuilder
	);
	const secondActionRow = new ActionRowBuilder().addComponents(
		abilityInput as TextInputBuilder
	);
	const thirdActionRow = new ActionRowBuilder().addComponents(
		itemInput as TextInputBuilder
	);
	const fourthActionRow = new ActionRowBuilder().addComponents(
		statModifierInput as TextInputBuilder
	);
	const fifthActionRow = new ActionRowBuilder().addComponents(
		evsInput as TextInputBuilder
	);

	modal.addComponents(
		firstActionRow as ActionRowBuilder<TextInputBuilder>,
		secondActionRow as ActionRowBuilder<TextInputBuilder>,
		thirdActionRow as ActionRowBuilder<TextInputBuilder>,
		fourthActionRow as ActionRowBuilder<TextInputBuilder>,
		fifthActionRow as ActionRowBuilder<TextInputBuilder>
	);

	return modal;
};

export default {
	data: new SlashCommandBuilder()
		.setName('damage-calc')
		.setDescription('Calculates the damage of a move.'),

	async execute(interaction: any) {
		try {
			await interaction.deferReply();

			// Store user selections with proper defaults
			const userSelections: UserSelections = {
				generation: '9',
				move: 'Tackle', // Use a valid move name instead of "(no move)"
				format: 'singles',
				weather: 'none',
				terrain: 'none',
				fieldConditions: [],
				pokemon: [
					{
						name: 'Abomasnow',
						level: 100,
						ability: 'Snow Warning',
						nature: 'Hardy',
						item: '(none)',
						status: 'none',
						evs: {
							hp: 0,
							atk: 0,
							def: 0,
							spa: 0,
							spd: 0,
							spe: 0,
						},
						boosts: {
							hp: 0,
							atk: 0,
							def: 0,
							spa: 0,
							spd: 0,
							spe: 0,
						},
					},
					{
						name: 'Abomasnow',
						level: 100,
						ability: 'Snow Warning',
						nature: 'Hardy',
						item: '(none)',
						status: 'none',
						evs: {
							hp: 0,
							atk: 0,
							def: 0,
							spa: 0,
							spd: 0,
							spe: 0,
						},
						boosts: {
							hp: 0,
							atk: 0,
							def: 0,
							spa: 0,
							spd: 0,
							spe: 0,
						},
					},
				],
			};

			let stepIndex = 0;

			const updateMessage = async () => {
				const replies = replyArray(userSelections);
				await interaction.editReply(replies[stepIndex]);
			};

			await updateMessage();

			const message = await interaction.fetchReply();
			const collector = message.createMessageComponentCollector({
				time: 300000, // 5 minutes timeout
			});

			collector.on('collect', async (componentInteraction: any) => {
				collector.resetTimer();

				// Handle button interactions
				if (componentInteraction.isButton()) {
					const buttonInteraction = componentInteraction as ButtonInteraction;

					if (buttonInteraction.customId === 'previous' && stepIndex > 0) {
						stepIndex--;
						await updateMessage();
						await buttonInteraction.deferUpdate();
					}

					if (
						buttonInteraction.customId === 'next' &&
						stepIndex < replyArray(userSelections).length - 1
					) {
						stepIndex++;
						await updateMessage();
						await buttonInteraction.deferUpdate();
					}

					if (buttonInteraction.customId === 'set_move') {
						await buttonInteraction.showModal(
							createMoveModal('select_move', 'Select Move')
						);

						try {
							const modalInteraction = await buttonInteraction.awaitModalSubmit(
								{
									time: 60000,
									filter: (i) =>
										i.customId === 'select_move' &&
										i.user.id === buttonInteraction.user.id,
								}
							);

							const moveName =
								modalInteraction.fields.getTextInputValue('move_name');
							userSelections.move = moveName;

							await modalInteraction.reply({
								content: 'Move updated successfully!',
								flags: MessageFlags.Ephemeral,
							});
							await updateMessage();
						} catch (error) {
							console.error('Move modal error:', error);
						}
					}

					if (
						buttonInteraction.customId === 'add_attacker' ||
						buttonInteraction.customId === 'add_defender'
					) {
						const role = buttonInteraction.customId.split('_')[1];

						await buttonInteraction.showModal(
							createPokemonModal(role, role.toUpperCase())
						);

						try {
							const modalInteraction = await buttonInteraction.awaitModalSubmit(
								{
									time: 60000,
									filter: (i) =>
										i.customId === role &&
										i.user.id === buttonInteraction.user.id,
								}
							);

							// Extract the submitted data
							const pokemonName =
								modalInteraction.fields.getTextInputValue('pokemon_name');
							const statsString = modalInteraction.fields.getTextInputValue(
								'pokemon_stat_modifier'
							);
							const ability =
								modalInteraction.fields.getTextInputValue('pokemon_ability') ||
								'(none)';
							const item =
								modalInteraction.fields.getTextInputValue('pokemon_item') ||
								'(none)';
							const evsString =
								modalInteraction.fields.getTextInputValue('pokemon_evs') || '';

							// Parse EVs and boosts using helper functions
							const evsData = parseEVs(evsString);
							const boostData = parseStatModifiers(statsString);

							const pokemonIndex = role === 'attacker' ? 0 : 1;

							userSelections.pokemon[pokemonIndex] = {
								name: pokemonName,
								level: 100,
								nature: 'Hardy',
								ability: ability,
								item: item,
								status: 'none',
								evs: evsData,
								boosts: boostData,
							};

							console.log(
								`${role} data:`,
								JSON.stringify(userSelections.pokemon[pokemonIndex], null, 2)
							);

							await modalInteraction.reply({
								content: 'Pokemon updated successfully!',
								flags: MessageFlags.Ephemeral,
							});
							await updateMessage();
						} catch (error) {
							console.error('Pokemon modal error:', error);
						}
					}
				}

				// Handle string select menu interactions
				if (componentInteraction.isStringSelectMenu()) {
					const selectInteraction =
						componentInteraction as StringSelectMenuInteraction;

					if (selectInteraction.customId === 'generation') {
						userSelections.generation = selectInteraction.values[0];
						console.log(
							`User selected generation: ${userSelections.generation}`
						);
						await updateMessage();
						await selectInteraction.deferUpdate();
					}

					if (selectInteraction.customId === 'format') {
						userSelections.format = selectInteraction.values[0];
						console.log(`User selected format: ${userSelections.format}`);
						await updateMessage();
						await selectInteraction.deferUpdate();
					}

					if (selectInteraction.customId === 'weather') {
						userSelections.weather = selectInteraction.values[0];
						console.log(`User selected weather: ${userSelections.weather}`);
						await updateMessage();
						await selectInteraction.deferUpdate();
					}

					if (selectInteraction.customId === 'terrain') {
						userSelections.terrain = selectInteraction.values[0];
						console.log(`User selected terrain: ${userSelections.terrain}`);
						await updateMessage();
						await selectInteraction.deferUpdate();
					}

					if (selectInteraction.customId === 'field_conditions') {
						userSelections.fieldConditions = selectInteraction.values;
						console.log(
							`User selected field conditions: ${userSelections.fieldConditions}`
						);
						await updateMessage();
						await selectInteraction.deferUpdate();
					}

					if (selectInteraction.customId === 'attacker_status') {
						userSelections.pokemon[0].status = selectInteraction.values[0];
						console.log(
							`User selected attacker status: ${userSelections.pokemon[0].status}`
						);
						await updateMessage();
						await selectInteraction.deferUpdate();
					}

					if (selectInteraction.customId === 'defender_status') {
						userSelections.pokemon[1].status = selectInteraction.values[0];
						console.log(
							`User selected defender status: ${userSelections.pokemon[1].status}`
						);
						await updateMessage();
						await selectInteraction.deferUpdate();
					}
				}
			});

			collector.on('end', async () => {
				// Disable all components when collector ends
				const replies = replyArray(userSelections);
				const finalReply = replies[stepIndex];

				// Disable all components
				const disabledComponents = finalReply.components?.map((row: any) => {
					const newRow = ActionRowBuilder.from(row);
					newRow.components.forEach((component: any) => {
						component.setDisabled(true);
					});
					return newRow;
				});

				await interaction.editReply({
					embeds: finalReply.embeds,
					components: disabledComponents || [],
				});

				console.log('Final user selections:', userSelections);
			});
		} catch (error) {
			console.error('Main execution error:', error);
		}
	},
};
