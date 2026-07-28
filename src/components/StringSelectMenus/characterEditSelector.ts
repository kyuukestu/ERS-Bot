import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { CharacterEditSection, type EditableCharacterDTO } from "~/types/character";
import { formatIdentity, formatAppearance, formatBackground, formatLinks } from "~/components/status-helpers/characterEditStatus";


export function createCharacterEditMenu(character: EditableCharacterDTO) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("character-edit-section")
    .setPlaceholder("Select a section to edit")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      {
        label: "Identity",
        description: formatIdentity(character),
        value: CharacterEditSection.Identity,
      },
      {
        label: "Appearance",
        description: formatAppearance(character),
        value: CharacterEditSection.Appearance,
      },
      {
        label: "Origin & Background",
        description: formatBackground(character),
        value: CharacterEditSection.Background,
      },
      {
        label: "Character Sheet",
        description: formatLinks(character),
        value: CharacterEditSection.Links,
      },
    )

  return new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(menu);
}
