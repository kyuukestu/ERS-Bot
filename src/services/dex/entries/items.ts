import {
	SlashCommandStringOption,
	type SlashCommandSubcommandBuilder,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	EmbedBuilder,
} from 'discord.js';
import { itemEndPoint } from '~/api/endpoints';
import type { ItemData } from '~/interface/apiData';
import { extractItemInfo } from '~/api/dataExtraction/extractItemInfo.ts';
import { createItemEmbed } from '~/components/embeds/createItemEmbed.ts';
import { itemSearchService } from '~/services/dex/search/itemSearchService.ts';

export const buildItemSubcommand = (
	subcommand: SlashCommandSubcommandBuilder,
) =>
	subcommand
		.setName('item')
		.setDescription(
			'Provides information about a Pokémon item.',
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('name')
				.setDescription('The item name.')
				.setAutocomplete(true)
				.setRequired(true),
		);

export async function autocompleteItem(
	interaction: AutocompleteInteraction,
) {
	const query = interaction.options.getFocused();

	const results = itemSearchService.search(query);

	await interaction.respond(
		results.map((item) => ({
			name: item.name,
			value: item.name,
		})),
	);
}

export async function executeItem(
	interaction: ChatInputCommandInteraction,
) {
	const itemName = interaction.options.getString('name', true);

	try {
		await interaction.deferReply();

		const response = await itemEndPoint(itemName);
		const data: ItemData = response as ItemData;
		const itemInfo = extractItemInfo(data);

		const embed = createItemEmbed(interaction, itemInfo);

		await interaction.editReply({
			embeds: [embed],
		});
	} catch (error) {
		console.error('Error fetching item data:', error);

		const errorEmbed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('❌ Item Not Found')
			.setDescription(
				`Could not find an item named "${itemName}". Please check the spelling or try selecting an item from the autocomplete results.`,
			)
			.addFields({
				name: '💡 Tips',
				value:
					'• Select an item from the autocomplete results\n' +
					'• Check for typos\n' +
					'• Examples: `potion`, `master-ball`',
			});

		if (interaction.replied || interaction.deferred) {
			await interaction.editReply({
				embeds: [errorEmbed],
			});
		} else {
			await interaction.reply({
				embeds: [errorEmbed],
			});
		}
	}
}
