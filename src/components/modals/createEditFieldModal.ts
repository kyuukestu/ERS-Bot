import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export type EditFieldModalOptions = {
  customId: string;
  title: string;

  fieldId: string;
  label: string;

  value?: string;

  placeholder?: string;

  required?: boolean;

  style?: TextInputStyle;

  maxLength?: number;
};


export function createEditFieldModal(
  options: EditFieldModalOptions,
) {
  const input = new TextInputBuilder()
    .setCustomId(options.fieldId)
    .setLabel(options.label)
    .setStyle(
      options.style ?? TextInputStyle.Short,
    )
    .setRequired(
      options.required ?? true,
    );

  if (options.value) {
    input.setValue(options.value);
  }

  if (options.placeholder) {
    input.setPlaceholder(options.placeholder);
  }

  if (options.maxLength) {
    input.setMaxLength(options.maxLength);
  }

  return new ModalBuilder()
    .setCustomId(options.customId)
    .setTitle(options.title)
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>()
        .addComponents(input),
    );
}
