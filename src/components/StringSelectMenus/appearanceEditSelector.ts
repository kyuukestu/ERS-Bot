import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export function createAppearanceEditMenu() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("character-edit-appearance-field")
    .setPlaceholder("Select a field to edit")
    .addOptions([
      {
        label: "Height",
        value: "height",
      },
      {
        label: "Color",
        value: "color",
      },
      {
        label: "Image",
        value: "image_src",
      },
    ]);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}
