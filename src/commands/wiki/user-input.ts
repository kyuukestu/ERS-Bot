import {
	SlashCommandBuilder,
	type SlashCommandIntegerOption,
	type ChatInputCommandInteraction,
	type SlashCommandStringOption,
} from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('add-character')
		.setDescription('Generate a JSON entry for the character database')
		.addStringOption((opt: SlashCommandStringOption) =>
			opt
				.setName('id') // Changed from 'name' to 'id' to match execute logic
				.setDescription('Folder ID for the character (e.g. falkner)')
				.setRequired(true),
		)
		.addStringOption((opt: SlashCommandStringOption) =>
			opt
				.setName('category')
				.setDescription('NPC or OC')
				.setRequired(true)
				.addChoices({ name: 'NPC', value: 'npc' }, { name: 'OC', value: 'oc' }),
		)
		.addStringOption((opt: SlashCommandStringOption) =>
			opt
				.setName('full_name')
				.setDescription('Full Character Name')
				.setRequired(true),
		)

		.addStringOption((opt: SlashCommandStringOption) =>
			opt
				.setName('region')
				.setDescription('Associated Region')
				.setRequired(true)
				.addChoices(
					{ name: 'Kanto', value: 'kanto' },
					{ name: 'Johto', value: 'johto' },
					{ name: 'Hoenn', value: 'hoenn' },
					{ name: 'Sinnoh', value: 'sinnoh' },
					{ name: 'Unova', value: 'unova' },
					{ name: 'Kalos', value: 'kalos' },
					{ name: 'Alola', value: 'alola' },
					{ name: 'Galar', value: 'galar' },
					{ name: 'Paldea', value: 'paldea' },
				),
		)
		.addStringOption((opt: SlashCommandStringOption) =>
			opt.setName('short_name').setDescription('Comma-separated nicknames'),
		)
		.addStringOption((opt: SlashCommandStringOption) =>
			opt.setName('color').setDescription('Hex code or Vuetify color'),
		)
		.addIntegerOption((opt: SlashCommandIntegerOption) =>
			opt.setName('badges').setDescription('Number of Badges'),
		)
		.addIntegerOption((opt: SlashCommandIntegerOption) =>
			opt.setName('ribbons').setDescription('Number of Ribbons'),
		)
		.addStringOption((opt: SlashCommandStringOption) =>
			opt
				.setName('wcs_rank')
				.setDescription('World Coronation Series Rank')
				.addChoices(
					{ name: 'Normal', value: 'normal' },
					{ name: 'Great', value: 'great' },
					{ name: 'Ultra', value: 'ultra' },
					{ name: 'Master', value: 'master' },
				),
		)
		.addStringOption((opt: SlashCommandStringOption) =>
			opt
				.setName('trainer_class')
				.setDescription(
					'trainer classes; comma-separated i.e. battler, ranger, coordinator, etc.',
				),
		)
		.addStringOption((opt: SlashCommandStringOption) =>
			opt
				.setName('gender')
				.setDescription('Gender/Sex')
				.addChoices(
					{ name: 'Male', value: 'male' },
					{ name: 'Female', value: 'female' },
					{ name: 'Non-Binary', value: 'non-binary' },
					{ name: 'Other', value: 'other' },
				),
		),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const payload = {
			c: interaction.options.getString('category'),
			r: interaction.options.getString('region'),
			cl: interaction.options.getString('color') ?? '',
			b: interaction.options.getInteger('badges') ?? 0,
			ri: interaction.options.getInteger('ribbons') ?? 0,
			w: interaction.options.getString('wcs_rank') ?? '',
		};

		try {
			const message = `\`\`\`ts\n 
			id: '${interaction.options.getString('id')}',
			category: '${payload.c}',
			name: { 
			full: '${interaction.options.getString('full_name')}',
			short: [${
				interaction.options
					.getString('short_name')
					?.split(',')
					.map((n: string) => `'${n.trim()}'`) ?? ''
			}]},
			badges: ${payload.b},
			ribbons: ${payload.ri},
			color: '${payload.cl}',
			region: '${payload.r}',
			gender: '${interaction.options.getString('gender') ?? ''}',
			trainerClass: [${
				interaction.options
					.getString('trainer_class')
					?.split(',')
					.map((c: string) => `'${c.trim()}'`) ?? ''
			}],
			\`\`\` `;

			await interaction.editReply(message);
			await interaction.followUp(`<@188130519274225664>`);
		} catch (err) {
			console.log(err);
		}
	},
};
