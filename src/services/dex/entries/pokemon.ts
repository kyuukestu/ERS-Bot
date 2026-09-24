import {
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  type SlashCommandSubcommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type ButtonInteraction,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { formatUserInput } from "~/utility/formatting/formatUserInput.ts";
import { PokemonStatsCanvas } from "~/utility/statsCanvas.ts";
import type { PokemonStats } from "~/interface/canvasData";
import {
  buildBreedingCaptureBlocks,
  buildPokemonSprites,
  buildPokemonStats,
  buildTotalStats,
  fetchPokemonInfo,
  fetchPokemonSpeciesInfo,
  resolvePokemonSpecies,
} from "~/services/dex/pokemonService.ts";
import {
  buildPokemonEmbed,
  buildPokemonViewActionRow,
  handlePokedexEntries,
} from "~/services/dex/pokemonUiService.ts";
import { handleSpriteGallery } from "~/components/handleSpriteGallery";
import { pokemonSearchService } from "~/services/dex/search/pokemonSearchService";

export const buildPokemonSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName("pokemon")
    .setDescription("Provides Pokédex-like information about a Pokémon.")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("name")
        .setDescription("Enter the Pokémon name.")
        .setAutocomplete(true)
        .setRequired(true),
    )
    .addBooleanOption((option: SlashCommandBooleanOption) =>
      option
        .setName("shiny")
        .setDescription("Show shiny variant by default.")
        .setRequired(false),
    );

export async function autocompletePokemon(
  interaction: AutocompleteInteraction,
) {
  const query = interaction.options.getFocused();

  const results = pokemonSearchService.search(query);

  await interaction.respond(
    results.map((pokemon) => ({
      name: pokemon.name,
      value: pokemon.name,
    })),
  );
}

export async function executePokemon(interaction: ChatInputCommandInteraction) {
  const pokemonName = formatUserInput(
    interaction.options.getString("name", true),
  );

  const showShiny = interaction.options.getBoolean("shiny") ?? false;

  try {
    await interaction.deferReply();

    const { speciesName } = await resolvePokemonSpecies(`${pokemonName}`);

    const pokemonInfo = await fetchPokemonInfo(pokemonName);
    const speciesInfo = await fetchPokemonSpeciesInfo(speciesName);

    const { breedingFormatted, captureFormatted } =
      buildBreedingCaptureBlocks(speciesInfo);

    const sprites = buildPokemonSprites(pokemonInfo, showShiny);
    const stats: PokemonStats = buildPokemonStats(pokemonInfo);

    const statsImage = PokemonStatsCanvas.createStatsImage(stats, {
      backgroundColor: "#36393F",
      borderColor: "#72767D",
      width: 500,
      height: 280,
    });

    const totalStats = buildTotalStats(stats);

    const mainEmbed = buildPokemonEmbed(
      pokemonInfo,
      speciesInfo,
      breedingFormatted,
      captureFormatted,
      sprites,
      totalStats,
      showShiny,
      interaction.user.username,
      interaction.user.displayAvatarURL(),
    );

    const hasSpriteGallery = Object.values(sprites).some(Boolean);
    const actionRow = buildPokemonViewActionRow(hasSpriteGallery);

    await interaction.editReply({
      embeds: [mainEmbed],
      components: [actionRow.toJSON()],
      files: [statsImage],
    });

    const collector = interaction.channel?.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 300000,
      componentType: ComponentType.Button,
    });

    collector?.on("collect", async (buttonInteraction: ButtonInteraction) => {
      switch (buttonInteraction.customId) {
        case "pokedex_entries":
          await handlePokedexEntries(
            buttonInteraction,
            speciesInfo,
            pokemonInfo.name,
          );
          break;

        case "sprite_gallery":
          await handleSpriteGallery(
            buttonInteraction,
            sprites,
            pokemonInfo.name,
            showShiny,
          );
          break;
      }
    });

    collector?.on("end", () => {
      interaction.editReply({ components: [] }).catch(console.error);
    });
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);

    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("❌ Pokémon Not Found")
      .setDescription(
        `Could not find a Pokémon named "${pokemonName}". Please check the spelling and try again.`,
      );

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ embeds: [errorEmbed] });
    } else {
      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
}
