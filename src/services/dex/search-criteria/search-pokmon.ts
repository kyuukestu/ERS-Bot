import {
  type SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction,
  type SlashCommandStringOption,
} from "discord.js";
import { typeChoices } from "~/database/typeChoices";
import { handlePokemonSearchCriteria } from "./search-handlers/handlePokemonSearchCriteria";

export const buildSearchPokemonSubcommand = (
  subcommand: SlashCommandSubcommandBuilder,
) =>
  subcommand
    .setName("pokemon")
    .setDescription("Proves one or more pokemon based on the chosen criteria.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("type_1")
        .setDescription("Enter a type.")
        .addChoices(...typeChoices)
        .setRequired(false),
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("type_2")
        .setDescription("Enter a type.")
        .addChoices(...typeChoices)
        .setRequired(false),
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("ability")
        .setDescription("Enter an ability.")
        .setAutocomplete(true)
        .setRequired(false),
  )
  .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("move")
        .setDescription("Enter a move.")
        .setAutocomplete(true)
        .setRequired(false),
    );

export async function executeSearchPokemon(interaction: ChatInputCommandInteraction) {
  await handlePokemonSearchCriteria(interaction)
}
