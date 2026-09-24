import { EmbedBuilder } from "discord.js";
import { CharacterCreationDTO } from "~/types/character";

export function createCharacterCreationEmbed(
  character: CharacterCreationDTO,
) {
  return new EmbedBuilder()
    .setTitle("Create Character")
    .addFields(
      {
        name: "Full Name",
        value: character.full_name || "Not provided",
        inline: false,
      },
      {
        name: "Short Names",
        value: character.short_names.length
          ? character.short_names.join(", ")
          : "Not provided",
        inline: false,
      },
      {
        name: "Nicknames",
        value: character.nicknames.length
          ? character.nicknames.join(", ")
          : "Not provided",
        inline: false,
      },
      {
        name: "Origin Region",
        value: character.origin_region_id || "Not provided",
        inline: true,
      },
      // ...
    );
}
