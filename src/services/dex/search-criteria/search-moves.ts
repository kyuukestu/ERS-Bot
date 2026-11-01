import {
  type ChatInputCommandInteraction,
  type SlashCommandSubcommandBuilder,
  type SlashCommandStringOption,
  type SlashCommandIntegerOption,
} from "discord.js";
import { typeChoices } from "~/database/typeChoices.ts";
import { handleMoveSearchCriteria } from "./search-handlers/handleMoveSearchCriteria";

export const buildSearchMoveSubcommand = (
  subcommand: SlashCommandSubcommandBuilder,
) =>
  subcommand
    .setName("move")
    .setDescription("Provides one or more moves based on the chosen criteria.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("type")
        .setDescription("Enter the move type.")
        .addChoices(...typeChoices)
        .setRequired(false),
    )
    .addIntegerOption((option: SlashCommandIntegerOption) =>
      option
        .setName("min_power")
        .setDescription("Enter the minimum base power.")
        .setMinValue(0)
        .setMaxValue(500)
        .setRequired(false),
    )
    .addIntegerOption((option: SlashCommandIntegerOption) =>
      option
        .setName("max_power")
        .setDescription("Enter the maximum base power.")
        .setMinValue(0)
        .setMaxValue(500)
        .setRequired(false),
    )
    .addIntegerOption((option: SlashCommandIntegerOption) =>
      option
        .setName("min_accuracy")
        .setDescription("Enter minimum accuracy. (101 represents never-miss moves)")
        .setMinValue(0)
        .setMaxValue(101)
        .setRequired(false),
    )
    .addIntegerOption((option: SlashCommandIntegerOption) =>
      option
        .setName("max_accuracy")
        .setDescription("Enter maximum accuracy. (101 represents never-miss moves)")
        .setMinValue(0)
        .setMaxValue(101)
        .setRequired(false),
    )

    .addIntegerOption((option: SlashCommandIntegerOption) =>
      option
        .setName("priority")
        .setDescription("Enter move proirity. (Between +5 and -7)")
        .setMinValue(-7)
        .setMaxValue(5)
        .setRequired(false),
    )
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("category")
        .setDescription("Physical, Special, Status?")
        .addChoices(
          { name: "Physical", value: "physical" },
          { name: "Special", value: "special" },
          { name: "Status", value: "status" },
        )
        .setRequired(false),
    );



export async function executeSearchMove(interaction: ChatInputCommandInteraction) {
  await handleMoveSearchCriteria(interaction);
}
