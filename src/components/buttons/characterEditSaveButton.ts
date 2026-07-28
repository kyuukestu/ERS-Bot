import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export function createCharacterEditSaveButtons(hasChanges: boolean) {
  const rows = [];

  if (hasChanges) {
    rows.push(
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("character-edit-save")
            .setLabel("Save Changes")
            .setStyle(ButtonStyle.Success),
        ),
    );
  }

  rows.push(
    new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("character-edit-discard")
          .setLabel("Discard Changes")
          .setStyle(ButtonStyle.Danger),
      ),
  );

  return rows;
}
