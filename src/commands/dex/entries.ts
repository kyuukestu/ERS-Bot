import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type AutocompleteInteraction,
} from "discord.js";
import {
  buildItemSubcommand,
  executeItem,
  autocompleteItem,
} from "~/services/dex/entries/items";
import {
  buildPokemonSubcommand,
  autocompletePokemon,
  executePokemon,
} from "~/services/dex/entries/pokemon";
import {
  buildAbilitySubcommand,
  executeAbility,
  autocompleteAbility,
} from "~/services/dex/entries/abilities";
import {
  buildMoveSubcommand,
  executeMove,
  autocompleteMove,
} from "~/services/dex/entries/moves";

export default {
  data: new SlashCommandBuilder()
    .setName("dex-entry")
    .setDescription("Query the Pokedex for information!")
    .addSubcommand(buildPokemonSubcommand)
    .addSubcommand(buildAbilitySubcommand)
    .addSubcommand(buildItemSubcommand)
    .addSubcommand(buildMoveSubcommand),

  async autocomplete(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "pokemon":
        await autocompletePokemon(interaction);
        break;
      case "ability":
        await autocompleteAbility(interaction);
        break;
      case "item":
        await autocompleteItem(interaction);
        break;
      case "move":
        await autocompleteMove(interaction);
        break;
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "pokemon":
        await executePokemon(interaction);
        break;
      case "ability":
        await executeAbility(interaction);
        break;
      case "item":
        await executeItem(interaction);
        break;
      case "move":
        await executeMove(interaction);
        break;
    }
  },
};
