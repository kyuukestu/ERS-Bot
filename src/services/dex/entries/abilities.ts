import {
	SlashCommandStringOption,
	type SlashCommandSubcommandBuilder,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { abilityEndPoint } from '~/api/endpoints.ts';
import { extractAbilityInfo } from '~/api/dataExtraction/extractAbilityInfo.ts';
import { createAbilityEmbed } from '~/components/embeds/createAbilityEmbed.ts';
import { abilityPaginationList } from '~/components/pagination/abilityPagination.ts';
import { abilitySearchService } from '~/services/dex/search/abilitySearchService.ts';

export const buildAbilitySubcommand = (
	subcommand: SlashCommandSubcommandBuilder,
) =>
	subcommand
		.setName('ability')
		.setDescription(
			'Provides information about a Pokémon ability.',
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('name')
				.setDescription("The ability's name.")
				.setAutocomplete(true)
				.setRequired(true),
		);

export async function autocompleteAbility(
	interaction: AutocompleteInteraction,
) {
	const query = interaction.options.getFocused();

	const results = abilitySearchService.search(query);

	await interaction.respond(
		results.map((ability) => ({
			name: ability.name,
			value: ability.name,
		})),
	);
}

export async function executeAbility(
	interaction: ChatInputCommandInteraction,
) {
	const abilityName = interaction.options.getString('name', true);

	try {
		await interaction.deferReply();

		const abilityInfo = extractAbilityInfo(
			await abilityEndPoint(abilityName),
		);

		const embed = createAbilityEmbed(interaction, abilityInfo);

		await interaction.editReply({
			embeds: [embed],
		});

		await abilityPaginationList(
			interaction,
			abilityInfo.name,
			abilityInfo.pokemon ?? [],
		);
	} catch (error) {
		console.error('Error fetching ability data:', error);
	}
}
