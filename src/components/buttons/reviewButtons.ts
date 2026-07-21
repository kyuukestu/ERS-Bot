import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createReviewButtons() {
  const editButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("character-edit-name")
      .setLabel("Edit Name")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("character-edit-origin")
      .setLabel("Edit Origin")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("character-edit-associated")
      .setLabel("Edit Associated Region")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("character-edit-gender")
      .setLabel("Edit Gender")
      .setStyle(ButtonStyle.Primary),
  );

  const submitButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("character-confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("character-cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger),
  );

  return [editButtons, submitButtons];
}
