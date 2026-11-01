import { type ChatInputCommandInteraction } from "discord.js";
import { sendPaginatedPokemonEmbed } from "~/components/pagination/pokemonPagination";
import moveLearnList from "~/../public/json/moves-learn-list.json";
import pokemonList from "~/../public/json/pokemon-list.json";
import type { PokemonList } from "~/types/dexTypes";

export async function handlePokemonSearchCriteria(
  interaction: ChatInputCommandInteraction,
) {
  const type1 = interaction.options.getString("type_1");
  const type2 = interaction.options.getString("type_2");
  const moveName = interaction.options.getString("move");
  const abilityName = interaction.options.getString("ability");

  try {
    await interaction.deferReply();

    let learners: Set<string> | undefined;

    if (moveName) {
      learners = new Set(
        moveLearnList.find((move) => move.name === moveName)
          ?.learned_by_pokemon ?? [],
      );

      if (learners.size === 0) {
        await interaction.editReply(
          `No Pokémon were found that can learn ${moveName}.`,
        );
        return;
      }
    }

    const matches = pokemonList.filter((pokemon) => {
      if (learners && !learners.has(pokemon.name)) return false;

      if (
        (type1 || type2) &&
        !(
          (type1 && pokemon.types.includes(type1)) ||
          (type2 && pokemon.types.includes(type2))
        )
      ) {
        return false;
      }

      if (abilityName && !pokemon.abilities.includes(abilityName)) {
        return false;
      }

      return true;
    });

    await sendPaginatedPokemonEmbed({
      interaction,
      matches: matches as PokemonList,
      moveName,
      abilityName,
      type1,
      type2,
    });

    // Search pokemonlist for each learner then check if the types match
  } catch (err) {
    interaction.editReply(`${err}`);
  }
}
