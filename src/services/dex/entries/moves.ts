import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	type SlashCommandStringOption,
	type SlashCommandSubcommandBuilder,
} from 'discord.js';
import { moveSearchService } from '~/services/dex/search/moveSearchService';
import { getMoveInfo } from '~/components/handlers/getMoveInfo';

export const buildMoveSubcommand = (
	subcommand: SlashCommandSubcommandBuilder,
) =>
	subcommand
		.setName('move')
		.setDescription('Provides information about a Pokémon move.')
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('name')
				.setDescription('The move name.')
				.setAutocomplete(true)
				.setRequired(true),
		);

export async function autocompleteMove(
	interaction: AutocompleteInteraction,
) {
	const query = interaction.options.getFocused();

	const results = moveSearchService.search(query);

	await interaction.respond(
		results.map((move) => ({
			name: move.name,
			value: move.name,
		})),
	);
}

export async function executeMove(
	interaction: ChatInputCommandInteraction,
) {
	await getMoveInfo(interaction);
}
