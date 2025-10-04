import {
	EmbedBuilder,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type SlashCommandStringOption,
} from 'discord.js';
import Fuse from 'fuse.js';

type LegendaryGroup = {
	group: string;
	status: 'Restricted' | 'Banned';
	members: string[];
};

const legendaryGroups: LegendaryGroup[] = [
	{
		group: 'Paradox Duo',
		status: 'Restricted',
		members: ['Koraidon', 'Miraidon'],
	},
	{
		group: 'Treasures of Ruin',
		status: 'Restricted',
		members: ['Wo-Chien', 'Chien-Pao', 'Ting-Lu', 'Chi-Yu'],
	},
	{
		group: 'Legendary Birds',
		status: 'Restricted',
		members: ['Articuno', 'Zapdos', 'Moltres'],
	},
	{
		group: 'Weather Trio',
		status: 'Banned',
		members: ['Kyogre', 'Groudon', 'Rayquaza'],
	},
	{
		group: 'Creation Myths',
		status: 'Banned',
		members: ['Arceus', 'Dialga', 'Palkia', 'Giratina'],
	},
	{
		group: 'Legendary Beasts',
		status: 'Restricted',
		members: ['Raikou', 'Entei', 'Suicune'],
	},
	{
		group: 'Legendary Giants',
		status: 'Restricted',
		members: ['Regirock', 'Regice', 'Registeel', 'Regieleki', 'Regidrago'],
	},
	{
		group: 'Lord of Giants',
		status: 'Banned',
		members: ['Regigigas'],
	},
	{
		group: 'Eon Duo',
		status: 'Restricted',
		members: ['Latios', 'Latias'],
	},
	{
		group: 'Tower Duo',
		status: 'Banned',
		members: ['Lugia', 'Ho-oh'],
	},
	{
		group: 'Lunar Duo',
		status: 'Restricted',
		members: ['Cresselia', 'Darkrai'],
	},
	{
		group: 'Swords of Justice',
		status: 'Restricted',
		members: ['Cobalion', 'Terrakion', 'Virizion', 'Keldeo'],
	},
	{
		group: 'Lake Guardians',
		status: 'Restricted',
		members: ['Azelf', 'Mesprit', 'Uxie'],
	},
	{
		group: 'Tao Trio',
		status: 'Banned',
		members: ['Reshiram', 'Zekrom', 'Kyurem'],
	},
	{
		group: 'Aura Trio',
		status: 'Banned',
		members: ['Yveltal', 'Xerneas', 'Zygarde'],
	},
	{
		group: 'Ultra Beasts',
		status: 'Restricted',
		members: [
			'Nihilego',
			'Buzzwole',
			'Pheromosa',
			'Xurkitree',
			'Celesteela',
			'Kartana',
			'Guzzlord',
			'Poipole',
			'Naganadel',
			'Stakataka',
			'Blacephalon',
		],
	},
	{
		group: 'Paradox',
		status: 'Restricted',
		members: [
			'Great Tusk',
			'Scream Tail',
			'Brute Bonnet',
			'Flutter Mane',
			'Slither Wing',
			'Sandy Shocks',
			'Iron Treads',
			'Iron Bundle',
			'Iron Hands',
			'Iron Jugulis',
			'Iron Moth',
			'Iron Thorns',
			'Roaring Moon',
			'Iron Valiant',
			'Walking Wake',
			'Iron Leaves',
			'Gouging Fire',
			'Raging Bolt',
			'Iron Boulder',
			'Iron Crown',
		],
	},
	{
		group: 'Guardian Deities',
		status: 'Restricted',
		members: ['Tapu Koko', 'Tapu Lele', 'Tapu Bulu', 'Tapu Fini'],
	},
	{
		group: 'Celestial Duo',
		status: 'Restricted',
		members: ['Cosmog', 'Cosmoem', 'Solgaleo', 'Lunala'],
	},
	{ group: 'Light', status: 'Banned', members: ['Necrozma'] },
	{ group: 'Space', status: 'Banned', members: ['Eternatus'] },
	{ group: 'Terastal', status: 'Banned', members: ['Terapagos'] },
	{
		group: 'Legendary Heroes',
		status: 'Restricted',
		members: ['Zacian', 'Zamazenta'],
	},
	{
		group: 'Forces of Nature',
		status: 'Restricted',
		members: ['Enamorus', 'Tornadus', 'Thundurus', 'Landorus'],
	},
	{
		group: 'Loyal Three',
		status: 'Restricted',
		members: ['Okidogi', 'Munkidori', 'Fezandipiti'],
	},
	{
		group: 'Beast Killer Project',
		status: 'Restricted',
		members: ['Type: Null', 'Silvally'],
	},
	{
		group: 'Arthurian',
		status: 'Restricted',
		members: ['Spectrier', 'Glastrier', 'Calyrex'],
	},
	{
		group: 'Other',
		status: 'Restricted',
		members: [
			'Zeraora',
			'Meltan',
			'Melmetal',
			'Kubfu',
			'Urshifu',
			'Zarude',
			'Genesect',
			'Magearna',
			'Marshadow',
			'Ogerpon',
			'Meloetta',
			'Diancie',
			'Volcanion',
			'Deoxys',
			'Phione',
			'Manaphy',
			'Heatran',
			'Shaymin',
			'Mew',
			'Mewtwo',
			'Pecharunt',
		],
	},
	{
		group: 'Mythicals',
		status: 'Banned',
		members: ['Celebi', 'Jirachi', 'Victini', 'Hoopa'],
	},
];

const searchList = legendaryGroups.flatMap((g) =>
	g.members.map((m) => ({ name: m, group: g.group, status: g.status }))
);

const fuse = new Fuse(searchList, {
	keys: ['name'],
	includeScore: true,
	threshold: 0.3,
});

export default {
	data: new SlashCommandBuilder()
		.setName('restricted')
		.setDescription(
			"Enter a Pokemon's name to check its restricted stats. (e.g. Restricted or Banned)"
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName('pokemon').setDescription('Pokemon Name').setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const query = interaction.options.getString('pokemon', true);

		try {
			await interaction.deferReply();

			const results = fuse.search(query);

			if (results.length === 0) {
				await interaction.editReply(
					`❌ No legendary or mythical Pokémon found for **${query}**.\n\n Only Legendary, Mythicals, Megas, Battle Bond, and Paradox are Restricted.`
				);
				return;
			}

			const best = results[0].item;

			const replyEmbed = new EmbedBuilder()
				.setColor(best.status === 'Restricted' ? 0x4ecdc4 : 0xff0000)
				.setTitle(`Restriction Status: ${query}`)
				.setDescription(
					`${best.name} was the closest match and belongs to the **${best.group}** group.\n` +
						`It falls under the category of **${best.status.toLowerCase()}** Pokémon.\n\n` +
						`Please remember all Mega Pokemon & Battle Bond are **RESTRICTED**`
				);

			await interaction.editReply({
				embeds: [replyEmbed],
			});
		} catch (error) {
			console.error(error);

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Pokémon Not Found')
				.setDescription(
					`An error occured while searching for "${query}". Please @kyuukestu.`
				)
				.addFields({
					name: '💡 Error Details',
					value: `${error}`,
				});

			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ embeds: [errorEmbed] });
			} else {
				await interaction.reply({ embeds: [errorEmbed] });
			}
		}
	},
};
