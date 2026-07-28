import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createCharacterLinksEditButton() {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("character-edit-sheet-url")
        .setLabel("Edit Character Sheet")
        .setStyle(ButtonStyle.Primary),
    );
}
