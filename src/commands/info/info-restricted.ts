import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type SlashCommandStringOption,
} from 'discord.js';
import Fuse from 'fuse.js';

type RestrictionType = 'pokemon' | 'move' | 'ability';
type RestrictionEntry = {
	name: string;
	type: RestrictionType;
	status: 'Restricted' | 'Banned';
	group?: string;
};

export const restrictedRegistry: RestrictionEntry[] = [
	// Paradox Duo
	{
		name: 'Koraidon',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Paradox Duo',
	},
	{
		name: 'Orichalcum Pulse',
		type: 'ability',
		status: 'Restricted',
		group: 'Paradox Duo',
	},
	{
		name: 'Collision Course',
		type: 'move',
		status: 'Restricted',
		group: 'Paradox Duo',
	},
	{
		name: 'Miraidon',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Paradox Duo',
	},
	{
		name: 'Hadron Engine',
		type: 'ability',
		status: 'Restricted',
		group: 'Paradox Duo',
	},
	{
		name: 'Electro Drift',
		type: 'move',
		status: 'Restricted',
		group: 'Paradox Duo',
	},

	// Treasures of Ruin
	{
		name: 'Wo-Chien',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},
	{
		name: 'Tablets of Ruin',
		type: 'ability',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},
	{
		name: 'Chien-Pao',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},
	{
		name: 'Sword of Ruin',
		type: 'ability',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},
	{
		name: 'Ting-Lu',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},
	{
		name: 'Vessel of Ruin',
		type: 'ability',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},
	{
		name: 'Chi-Yu',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},
	{
		name: 'Beads of Ruin',
		type: 'ability',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},
	{
		name: 'Ruination',
		type: 'move',
		status: 'Restricted',
		group: 'Treasures of Ruin',
	},

	// Legendary Birds
	{
		name: 'Articuno',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Birds',
	},
	{
		name: 'Zapdos',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Birds',
	},
	{
		name: 'Moltres',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Birds',
	},

	// Weather Trio
	{ name: 'Kyogre', type: 'pokemon', status: 'Banned', group: 'Weather Trio' },
	{ name: 'Groudon', type: 'pokemon', status: 'Banned', group: 'Weather Trio' },
	{
		name: 'Rayquaza',
		type: 'pokemon',
		status: 'Banned',
		group: 'Weather Trio',
	},

	// Creation Myths
	{
		name: 'Arceus',
		type: 'pokemon',
		status: 'Banned',
		group: 'Creation Myths',
	},
	{
		name: 'Dialga',
		type: 'pokemon',
		status: 'Banned',
		group: 'Creation Myths',
	},
	{
		name: 'Palkia',
		type: 'pokemon',
		status: 'Banned',
		group: 'Creation Myths',
	},
	{
		name: 'Giratina',
		type: 'pokemon',
		status: 'Banned',
		group: 'Creation Myths',
	},

	// Legendary Beasts
	{
		name: 'Raikou',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Beasts',
	},
	{
		name: 'Entei',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Beasts',
	},
	{
		name: 'Suicune',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Beasts',
	},

	// Legendary Giants
	{
		name: 'Regirock',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Giants',
	},
	{
		name: 'Regice',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Giants',
	},
	{
		name: 'Registeel',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Giants',
	},
	{
		name: 'Regieleki',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Giants',
	},
	{
		name: 'Regidrago',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Giants',
	},

	// Lord of Giants
	{
		name: 'Regigigas',
		type: 'pokemon',
		status: 'Banned',
		group: 'Lord of Giants',
	},

	// Eon Duo
	{ name: 'Latios', type: 'pokemon', status: 'Restricted', group: 'Eon Duo' },
	{ name: 'Latias', type: 'pokemon', status: 'Restricted', group: 'Eon Duo' },

	// Tower Duo
	{ name: 'Lugia', type: 'pokemon', status: 'Banned', group: 'Tower Duo' },
	{ name: 'Ho-oh', type: 'pokemon', status: 'Banned', group: 'Tower Duo' },

	// Lunar Duo
	{
		name: 'Cresselia',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Lunar Duo',
	},
	{
		name: 'Darkrai',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Lunar Duo',
	},

	// Swords of Justice
	{
		name: 'Cobalion',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Swords of Justice',
	},
	{
		name: 'Terrakion',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Swords of Justice',
	},
	{
		name: 'Virizion',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Swords of Justice',
	},
	{
		name: 'Keldeo',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Swords of Justice',
	},

	// Lake Guardians
	{
		name: 'Azelf',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Lake Guardians',
	},
	{
		name: 'Mesprit',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Lake Guardians',
	},
	{
		name: 'Uxie',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Lake Guardians',
	},

	// Tao Trio
	{ name: 'Reshiram', type: 'pokemon', status: 'Banned', group: 'Tao Trio' },
	{ name: 'Zekrom', type: 'pokemon', status: 'Banned', group: 'Tao Trio' },
	{ name: 'Kyurem', type: 'pokemon', status: 'Banned', group: 'Tao Trio' },

	// Aura Trio
	{ name: 'Yveltal', type: 'pokemon', status: 'Banned', group: 'Aura Trio' },
	{ name: 'Xerneas', type: 'pokemon', status: 'Banned', group: 'Aura Trio' },
	{ name: 'Zygarde', type: 'pokemon', status: 'Banned', group: 'Aura Trio' },

	// Guardian Deities
	{
		name: 'Tapu Koko',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Guardian Deities',
	},
	{
		name: 'Tapu Lele',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Guardian Deities',
	},
	{
		name: 'Tapu Bulu',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Guardian Deities',
	},
	{
		name: 'Tapu Fini',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Guardian Deities',
	},

	// Celestial
	{ name: 'Cosmog', type: 'pokemon', status: 'Banned', group: 'Celestial Duo' },
	{
		name: 'Cosmoem',
		type: 'pokemon',
		status: 'Banned',
		group: 'Celestial Duo',
	},
	{
		name: 'Solgaleo',
		type: 'pokemon',
		status: 'Banned',
		group: 'Celestial Duo',
	},
	{ name: 'Lunala', type: 'pokemon', status: 'Banned', group: 'Celestial Duo' },

	// Singular entities
	{ name: 'Necrozma', type: 'pokemon', status: 'Banned', group: 'Light' },
	{ name: 'Eternatus', type: 'pokemon', status: 'Banned', group: 'Space' },
	{ name: 'Terapagos', type: 'pokemon', status: 'Banned', group: 'Terastal' },

	// Legendary Heroes
	{
		name: 'Zacian',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Heroes',
	},
	{
		name: 'Zamazenta',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Legendary Heroes',
	},

	// Forces of Nature
	{
		name: 'Enamorus',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Forces of Nature',
	},
	{
		name: 'Tornadus',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Forces of Nature',
	},
	{
		name: 'Thundurus',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Forces of Nature',
	},
	{
		name: 'Landorus',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Forces of Nature',
	},

	// Loyal Three
	{
		name: 'Okidogi',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Loyal Three',
	},
	{
		name: 'Munkidori',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Loyal Three',
	},
	{
		name: 'Fezandipiti',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Loyal Three',
	},

	// Beast Killer Project
	{
		name: 'Type: Null',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Beast Killer Project',
	},
	{
		name: 'Silvally',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Beast Killer Project',
	},

	// Arthurian
	{
		name: 'Spectrier',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Arthurian',
	},
	{
		name: 'Glastrier',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Arthurian',
	},
	{
		name: 'Calyrex',
		type: 'pokemon',
		status: 'Restricted',
		group: 'Arthurian',
	},

	// Other
	{ name: 'Zeraora', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Meltan', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Melmetal', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Kubfu', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Urshifu', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Zarude', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Genesect', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Magearna', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Marshadow', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Ogerpon', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Meloetta', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Diancie', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Volcanion', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Deoxys', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Phione', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Manaphy', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Heatran', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Shaymin', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Mew', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Mewtwo', type: 'pokemon', status: 'Restricted', group: 'Other' },
	{ name: 'Pecharunt', type: 'pokemon', status: 'Restricted', group: 'Other' },

	// Mythicals (Banned)
	{ name: 'Celebi', type: 'pokemon', status: 'Banned', group: 'Mythicals' },
	{ name: 'Jirachi', type: 'pokemon', status: 'Banned', group: 'Mythicals' },
	{ name: 'Victini', type: 'pokemon', status: 'Banned', group: 'Mythicals' },
	{ name: 'Hoopa', type: 'pokemon', status: 'Banned', group: 'Mythicals' },
];

const fuse = new Fuse(restrictedRegistry, {
	keys: ['name'],
	includeScore: true,
	threshold: 0.3,
});

const groupByType = (entries: RestrictionEntry[]) => {
	return entries.reduce<Record<RestrictionType, RestrictionEntry[]>>(
		(acc, entry) => {
			acc[entry.type].push(entry);
			return acc;
		},
		{ pokemon: [], move: [], ability: [] }
	);
};

const sortAlphabetically = (a: RestrictionEntry, b: RestrictionEntry) =>
	a.name.localeCompare(b.name);

const buildPaginatedEmbeds = (entries: RestrictionEntry[]) => {
	const ITEMS_PER_PAGE = 20;

	const grouped = groupByType(entries);

	const sections = Object.entries(grouped).flatMap(([type, items]) => {
		if (items.length === 0) return [];

		const sorted = [...items].sort(sortAlphabetically);
		const pages: EmbedBuilder[] = [];

		for (let i = 0; i < sorted.length; i += ITEMS_PER_PAGE) {
			const chunk = sorted.slice(i, i + ITEMS_PER_PAGE);

			const description = chunk
				.map(
					(e) =>
						`• **${e.name}** — *${e.status}${e.group ? ` (${e.group})` : ''}*`
				)
				.join('\n');

			pages.push(
				new EmbedBuilder()
					.setTitle(
						`Restricted Registry: ${
							type.charAt(0).toUpperCase() + type.slice(1)
						}`
					)
					.setDescription(description)
					.setColor(0x5865f2)
			);
		}

		return pages;
	});

	return sections;
};

const getPaginationRow = (page: number, total: number) =>
	new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('prev')
			.setLabel('◀')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(page === 0),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('▶')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(page === total - 1)
	);

export default {
	data: new SlashCommandBuilder()
		.setName('info-restricted')
		.setDescription(
			'Enter a Pokemon, Ability or Move to check its restricted stats. (e.g. Restricted or Banned)'
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName('name').setDescription('Name').setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const query = interaction.options.getString('name', false) ?? null;

		try {
			await interaction.deferReply();

			if (query) {
				const results = fuse.search(query);

				if (results.length === 0) {
					await interaction.editReply(
						`❌ No Pokémon, Move, or Ability found for **${query}**.
					\n\n The Restricted list is predominantly composed of Pokemon, Moves, and Abilities which are related to the following groups: Legendary, Mythical, Mega, Battle Bond, or Paradox.`
					);
					return;
				}

				const best = results[0].item;

				const replyEmbed = new EmbedBuilder()
					.setColor(best.status === 'Restricted' ? 0x4ecdc4 : 0xff0000)
					.setTitle(`Restriction Status: ${best.name}`)
					.setDescription(
						`Status: ${best.status}\nType: ${best.type}\nGroup: ${best.group}
					\n\nPlease remember all Mega Pokemon & Battle Bond are **RESTRICTED**`
					);

				await interaction.editReply({
					embeds: [replyEmbed],
				});
			} else {
				const embeds = buildPaginatedEmbeds(restrictedRegistry);

				let page = 0;
				
				if (embeds.length === 0) {
	await interaction.editReply('No restricted entries available.');
	return;
}


				const message = await interaction.editReply({
					embeds: [embeds[page]],
					components: [getPaginationRow(page, embeds.length)],
				});

				const collector = message.createMessageComponentCollector({
					time: 5 * 60_000,
				});

				collector.on('collect', async (i) => {
					if (i.user.id !== interaction.user.id) {
						await i.reply({ content: 'Not for you.', ephemeral: true });
						return;
					}

					if (i.customId === 'prev') page--;
					if (i.customId === 'next') page++;

					await i.update({
						embeds: [embeds[page]],
						components: [getPaginationRow(page, embeds.length)],
					});
				});

				collector.on('end', async () => {
					await message.edit({ components: [] });
				});
			}
		} catch (error) {
			console.error(error);

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Query Not Found')
				.setDescription(
					`An error occurred while searching for "${query}". Please @kyuukestu.`
				)
				.addFields({
					name: '💡 Error Details',
					value: error instanceof Error ? error.message : String(error),
				});

			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ embeds: [errorEmbed] });
			} else {
				await interaction.reply({ embeds: [errorEmbed] });
			}
		}
	},
};
