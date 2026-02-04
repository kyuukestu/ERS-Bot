import { type ChatInputCommandInteraction } from 'discord.js';
import { sendPaginatedPokemonEmbed } from '~/components/pagination/pokemonPagination';
import { formatUserInput } from '~/utility/formatting/formatUserInput.ts';
import moveLearnList from '~/../public/json/moves-learn-list.json';
import pokemonList from '~/../public/json/pokemon-list.json';
import type { PokemonList } from '~/types/dexTypes';

export async function handlePokemonList(
	interaction: ChatInputCommandInteraction,
) {
	const type1 = interaction.options.getString('type-1');
	const type2 = interaction.options.getString('type-2');
	const moveName = formatUserInput(interaction.options.getString('move', true));

	try {
		await interaction.deferReply();

		const learners = new Set(
			moveLearnList
				.filter((move) => move.name === moveName)
				.flatMap((move) => move.learned_by_pokemon),
		);

		if (learners.size === 0) {
			return interaction.editReply(`${moveName} was not found.`);
		}

		const matches = pokemonList.filter((p) => {
			if (!learners.has(p.name)) return false;

			if (!type1 && !type2) return true;

			return (
				(type1 && p.types.includes(type1)) || (type2 && p.types.includes(type2))
			);
		});

		await sendPaginatedPokemonEmbed({
			interaction,
			moveName,
			type1,
			type2,
			matches: matches as PokemonList,
		});

		// Search pokemonlist for each learner then check if the types match
	} catch (err) {
		interaction.editReply(`${err}`);
	}
}
