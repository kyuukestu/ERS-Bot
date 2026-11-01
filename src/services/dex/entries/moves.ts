import {
  EmbedBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type SlashCommandStringOption,
  type SlashCommandSubcommandBuilder,
} from "discord.js";
import { moveSearchService } from "~/services/dex/fuzzy-search/moveSearchService";
import { moveEndPoint } from "~/api/endpoints";
import type { MoveData } from "~/interface/apiData";
import { extractMoveInfo } from "~/api/dataExtraction/extractMoveInfo";
import { createAttackEmbed } from "~/components/embeds/createAttackEmbed";

export const buildMoveSubcommand = (
  subcommand: SlashCommandSubcommandBuilder,
) =>
  subcommand
    .setName("move")
    .setDescription("Provides information about a Pokémon move.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("name")
        .setDescription("The move name.")
        .setAutocomplete(true)
        .setRequired(true),
    );

export async function autocompleteMove(interaction: AutocompleteInteraction) {
  const query = interaction.options.getFocused();

  const results = moveSearchService.search(query);

  await interaction.respond(
    results.map((move) => ({
      name: move.name,
      value: move.name,
    })),
  );
}

export async function executeMove(interaction: ChatInputCommandInteraction) {
  const moveName = interaction.options.getString("name", true);

  try {
    await interaction.deferReply();

    const response = await moveEndPoint(moveName);
    const data: MoveData = response as MoveData;
    const moveInfo = extractMoveInfo(data);

    const embed = createAttackEmbed(interaction, moveInfo);

    await interaction.editReply({
      embeds: [embed],
    });
  } catch (error) {
    console.error("Error faetching move data:", error);

    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("Move Not Found")
      .setDescription(
        `Cound not find a move named "${moveName}". Please double-check the spelling and try again.`,
      )
      .addFields({
        name: "💡 Tips",
        value:
          "• Select an item from the autocomplete results\n" +
          "• Check for typos\n" +
          "• Examples: `potion`, `master-ball`",
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
