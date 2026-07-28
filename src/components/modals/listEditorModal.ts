import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export function createListEditorModal(title: string, currentValue?: string) {
  const input = new TextInputBuilder()
    .setCustomId("list-editor-value")
    .setLabel(title)
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  if (currentValue) {
    input.setValue(currentValue);
  }

  return new ModalBuilder()
    .setCustomId("list-editor-value-modal")
    .setTitle(title)
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(input),
    );
}
