import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

export function createListItemSelector(
  values: string[],
  action: "edit" | "delete",
) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(
      `list-editor-${action}-item`,
    )
    .setPlaceholder("Select an item")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      values.map((value, index) => ({
        label: value.slice(0, 100),
        value: index.toString(),
      })),
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(menu);
}
