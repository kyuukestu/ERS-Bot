import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createCharacterEditBackButton() {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("character-edit-back-sections")
        .setLabel("Back to Sections")
        .setStyle(ButtonStyle.Secondary),
    );
}
