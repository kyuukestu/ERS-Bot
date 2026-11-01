import {
  AutocompleteInteraction,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import {
  buildSearchMoveSubcommand,
  executeSearchMove,
} from "~/services/dex/search-criteria/search-moves";
import { autocompleteAbility } from "~/services/dex/entries/abilities";
import { autocompleteMove } from "~/services/dex/entries/moves";
import { buildSearchPokemonSubcommand, executeSearchPokemon } from "~/services/dex/search-criteria/search-pokmon";

export default {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search PokeAPI Database via the provided criteria.")
    .addSubcommand(buildSearchMoveSubcommand)
    .addSubcommand(buildSearchPokemonSubcommand),

  async autocomplete(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "pokemon":
        switch (focused.name) {
          case "ability":
            await autocompleteAbility(interaction);
            break;

          case "move":
            await autocompleteMove(interaction);
            break;

          default:
            await interaction.respond([]);
        }
        break;
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "move":
        await executeSearchMove(interaction);
        break;

      case "pokemon":
        await executeSearchPokemon(interaction);
        break;
    }
  },
};
