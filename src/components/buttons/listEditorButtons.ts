import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export function createListEditorButtons() {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("list-editor-add")
        .setLabel("Add")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("list-editor-edit")
        .setLabel("Edit")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("list-editor-delete")
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("list-editor-back")
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary),
    );
}
