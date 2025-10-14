import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	MessageFlags,
	EmbedBuilder,
} from 'discord.js';
import OC from '../../../models/OCSchema';
import Pokemon from '../../../models/PokemonSchema';
import { Types } from 'mongoose';
import { isDBConnected } from '../../../mongoose/connection';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-show-moves')
		.setDescription("Displays a Pokemon's moves in a paginated list.")
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription("Your registered OC's name")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('poke-nickname')
				.setDescription("Target Pokemon's nickname")
				.setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName('in-box')
				.setDescription('Is this Pokemon in the box? (Defaults to false).')
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const OCName = interaction.options.getString('oc-name', true);
		const pokeNickname = interaction.options.getString('poke-nickname', true);
		const isInBox = interaction.options.getBoolean('in-box') || false;

		if (!isDBConnected()) {
			return interaction.followUp({
				content:
					'⚠️ Database is currently unavailable. Please try again later.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const targetOC = await OC.findOne({ name: OCName });
		if (!targetOC) {
			return interaction.editReply(`${OCName} does not exist.`);
		}

		// Find the target Pokemon
		const targetPokemon = isInBox
			? targetOC.storage.find((p) => p.nickname === pokeNickname)
			: targetOC.party.find((p) => p.nickname === pokeNickname);

		if (!targetPokemon || !targetPokemon.pokemon) {
			return interaction.editReply(`${pokeNickname} was not found.`);
		}

		const pokemon = await Pokemon.findById(
			targetPokemon.pokemon as Types.ObjectId
		);
		if (!pokemon) {
			return interaction.editReply(`Pokemon data could not be retrieved.`);
		}

		const moves = pokemon.moves.map((move) => `${move}`);
		if (moves.length === 0) {
			return interaction.editReply(`${pokeNickname} has no moves.`);
		}

		// Pagination
		const movesPerPage = 10;
		let currentPage = 0;
		const totalPages = Math.ceil(moves.length / movesPerPage);

		const getPageEmbed = (page: number) => {
			const start = page * movesPerPage;
			const end = start + movesPerPage;
			const pageMoves = moves.slice(start, end);

			return new EmbedBuilder()
				.setTitle(`📝 Moves — ${pokeNickname}`)
				.setDescription(`\\- ${pageMoves.join('\n\\- ')}`)
				.setFooter({ text: `Page ${page + 1}/${totalPages}` })
				.setColor(0x1e90ff);
		};

		const getButtons = (page: number) =>
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('prev')
					.setLabel('⬅️ Previous')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page === 0),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next ➡️')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page === totalPages - 1)
			);

		const message = await interaction.editReply({
			embeds: [getPageEmbed(currentPage)],
			components: [getButtons(currentPage)],
		});

		// Collector
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60_000,
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: "You can't control this view.",
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'next' && currentPage < totalPages - 1) currentPage++;
			if (i.customId === 'prev' && currentPage > 0) currentPage--;

			await i.update({
				embeds: [getPageEmbed(currentPage)],
				components: [getButtons(currentPage)],
			});
		});

		collector.on('end', async () => {
			await message.edit({
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId('expired')
							.setLabel('Session Expired')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true)
					),
				],
			});
		});
	},
};
