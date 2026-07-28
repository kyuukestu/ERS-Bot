import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import type { CharacterSummaryDTO } from "~/services/character/edit/CharacterQueryService";

export function createCharacterSelector(characters: CharacterSummaryDTO[]) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("character-edit-select")
    .setPlaceholder("Select character")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      characters.map((character) => ({
        label: character.full_name,
        value: character.id,
      })),
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}
