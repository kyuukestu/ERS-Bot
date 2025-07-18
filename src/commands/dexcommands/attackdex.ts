const { moveEndPoint } = require('../../components/api/PokeApi.ts');
const {
	formatUserInput,
} = require('../../components/utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { MoveData } from '../../components/interface/moveData.ts';

// Move type colors for aesthetic enhancement
const typeColors: { [key: string]: number } = {
	normal: 0xa8a878,
	fire: 0xf08030,
	water: 0x6890f0,
	electric: 0xf8d030,
	grass: 0x78c850,
	ice: 0x98d8d8,
	fighting: 0xc03028,
	poison: 0xa040a0,
	ground: 0xe0c068,
	flying: 0xa890f0,
	psychic: 0xf85888,
	bug: 0xa8b820,
	rock: 0xb8a038,
	ghost: 0x705898,
	dragon: 0x7038f8,
	dark: 0x705848,
	steel: 0xb8b8d0,
	fairy: 0xee99ac,
};

// Emojis for visual appeal
const moveEmojis: { [key: string]: string } = {
	physical: '⚔️',
	special: '✨',
	status: '🔮',
};
module.exports = {
	data: new SlashCommandBuilder()
		.setName('attackdex')
		.setDescription('Search for a move by name and get its information.')
		.addStringOption((option: any) =>
			option
				.setName('move')
				.setDescription('Enter the move name.')
				.setRequired(true)
		),

	async execute(interaction: CommandInteraction) {
		const moveName = formatUserInput(
			interaction.options.get('move', true).value as string
		);

		try {
			await interaction.deferReply();

			const response = await moveEndPoint(moveName);
			const data: MoveData = response as MoveData;

			// Extract key info with fallback values from PokeAPI move endpoint
			const name = data.name
				.split('-')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');
			const type = data.type.name;
			const accuracy =
				data.accuracy !== null && data.accuracy !== undefined
					? `${data.accuracy}%`
					: 'N/A';
			const effectChance =
				data.effect_chance !== null && data.effect_chance !== undefined
					? `${data.effect_chance}%`
					: 'N/A';
			const priority = data.priority.toString();
			const power =
				data.power !== null && data.power !== undefined
					? data.power.toString()
					: 'N/A';
			const pp =
				data.pp !== null && data.pp !== undefined ? data.pp.toString() : 'N/A';
			const damageClass = data.damage_class.name;
			const target = data.target?.name
				? data.target.name.charAt(0).toUpperCase() + data.target.name.slice(1)
				: 'N/A';
			const generation =
				data.generation?.name.replace('generation-', '') || 'Unknown';
			const flavorText =
				data.flavor_text_entries.filter((ft) => ft.language.name === 'en').pop()
					?.flavor_text || 'No English description available';
			const flavorTextVer =
				data.flavor_text_entries.filter((ft) => ft.language.name === 'en').pop()
					?.version_group.name || 'Unknown';
			const learnedBy = Array.isArray(data.learned_by_pokemon)
				? data.learned_by_pokemon.map(
						(p) => p.name.charAt(0).toUpperCase() + p.name.slice(1)
				  )
				: [];

			// Create an embed with enhanced layout
			const embed = new EmbedBuilder()
				.setColor(typeColors[type] || typeColors['normal'])
				.setTitle(`${moveEmojis[damageClass] || '❓'} **${name}**`)
				.setDescription(flavorText.replace(/\r?\n|\r/g, ' '))
				.addFields(
					{
						name: '📌 Type',
						value: type.charAt(0).toUpperCase() + type.slice(1),
						inline: true,
					},
					{
						name: '🏹 Damage Class',
						value: damageClass.charAt(0).toUpperCase() + damageClass.slice(1),
						inline: true,
					},
					{ name: '💪 Power', value: power, inline: true },
					{ name: '🎯 Accuracy', value: accuracy, inline: true },
					{ name: '🎲 Effect Chance', value: effectChance, inline: true },
					{ name: '⏱️ Priority', value: priority, inline: true },
					{ name: '🔋 PP', value: pp, inline: true },
					{ name: '🎯 Target', value: target, inline: true },
					{ name: '🌍 Generation', value: generation, inline: true },
					{
						name: '📅 Version',
						value:
							flavorTextVer.charAt(0).toUpperCase() + flavorTextVer.slice(1),
						inline: true,
					}
				)
				.setFooter({
					text: `Requested by ${interaction.user.username} • Powered by PokeAPI`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });

			// Send the paginated list of Pokémon
			await sendPaginatedList(interaction, name, learnedBy);
		} catch (error) {
			console.error('Error fetching move data:', error);

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Move Not Found')
				.setDescription(
					`Could not find a move named "${moveName}". Please check the spelling and try again.`
				)
				.addFields({
					name: '💡 Tips',
					value:
						'• Use the exact move name\n• Check for typos\n• Example: "tackle" or "hyper-beam"',
				})
				.setTimestamp();

			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ embeds: [errorEmbed] });
			} else {
				await interaction.reply({ embeds: [errorEmbed] });
			}
		}
	},
};

async function sendPaginatedList(
	interaction: CommandInteraction,
	moveName: string,
	learnedBy: string[]
) {
	const monsPerPage = 10;
	let currentPage = 0;

	// Sort the Pokémon names alphabetically
	const sortedLearnedBy = [...learnedBy].sort((a, b) =>
		a.localeCompare(b, undefined, { sensitivity: 'base' })
	);

	const totalPages = Math.ceil(sortedLearnedBy.length / monsPerPage);

	const formattedMoveName = moveName
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	const generateEmbed = (page: number) => {
		const start = page * monsPerPage;
		const end = start + monsPerPage;
		const currentMons =
			sortedLearnedBy
				.slice(start, end)
				.map((name) => `• ${name}`)
				.join('\n') || 'No Pokémon found.';

		return new EmbedBuilder()
			.setTitle(`${formattedMoveName} is learned by:`)
			.setDescription(currentMons)
			.setFooter({
				text: `Page ${page + 1}/${totalPages} | Total: ${
					sortedLearnedBy.length
				} Pokémon`,
			})
			.setColor(typeColors['normal']);
	};

	// Create buttons
	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('previous')
			.setLabel('⬅️ Previous')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(currentPage === 0),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('➡️ Next')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(currentPage >= totalPages - 1)
	);

	const message = await interaction.followUp({
		embeds: [generateEmbed(currentPage)],
		components: [row],
		fetchReply: true,
	});

	// Create a collector for button interactions
	const collector = message.createMessageComponentCollector({
		time: 60000, // 1 minute timeout
	});

	collector.on('collect', async (buttonInteraction) => {
		if (buttonInteraction.customId === 'previous') currentPage--;
		if (buttonInteraction.customId === 'next') currentPage++;
		collector.resetTimer();

		// Update the buttons
		const updatedRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('previous')
				.setLabel('⬅️ Previous')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage === 0),
			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('➡️ Next')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage >= totalPages - 1)
		);

		await buttonInteraction.update({
			embeds: [generateEmbed(currentPage)],
			components: [updatedRow],
		});
	});

	collector.on('end', () => {
		const disabledRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('previous')
				.setLabel('⬅️ Previous')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('➡️ Next')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true)
		);

		message.edit({ components: [disabledRow] }).catch(console.error);
	});
}
