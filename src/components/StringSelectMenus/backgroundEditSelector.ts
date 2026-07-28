import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

export function createBackgroundEditMenu() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("character-edit-background-field")
    .setPlaceholder("Select a field to edit")
    .addOptions([
      {
        label: "Origin Region",
        value: "origin_region_id",
      },
      {
        label: "Associated Region",
        value: "associated_region_id",
      },
      {
        label: "Age",
        value: "age",
      },
      {
        label: "Date of Birth",
        value: "dob",
      },
      {
        label: "Gender",
        value: "gender",
      },
    ]);

  return new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(menu);
}
