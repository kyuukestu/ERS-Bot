import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export function createIdentityEditMenu() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("character-edit-identity-field")
    .setPlaceholder("Select a field to edit")
    .addOptions([
      {
        label: "Full Name",
        value: "full_name",
      },
      {
        label: "Short Names",
        value: "short_names",
      },
      {
        label: "Nicknames",
        value: "nicknames",
      },
    ]);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}
