import {
  type StringSelectMenuInteraction,
  type ModalSubmitInteraction,
  MessageFlags,
} from "discord.js";
import { characterEditSessionStore } from "./CharacterEditSessionStore";
import { createAppearanceEditMenu } from "~/components/StringSelectMenus/appearanceEditSelector";
import { createEditFieldModal } from "~/components/modals/createEditFieldModal";
import type { EditableCharacterDTO } from "~/types/character";

const APPEARANCE_FIELDS = {
  height: {
    customId: "character-edit-height-modal",
    title: "Edit Height",
    fieldId: "height",
    label: "Height",
    placeholder: "Example: 5'10\"",
    value: (character: EditableCharacterDTO) => character.height ?? "",
  },

  color: {
    customId: "character-edit-color-modal",
    title: "Edit Color",
    fieldId: "color",
    label: "Color",
    placeholder: "Example: #FF0000",
    value: (character: EditableCharacterDTO) => character.color ?? "",
  },

  image: {
    customId: "character-edit-image-modal",
    title: "Edit Image",
    fieldId: "image",
    label: "Image",
    placeholder: "Example: https://example.com/image.jpg",
    value: (character: EditableCharacterDTO) => character.image_src ?? "",
  },
};

class CharacterAppearanceEditService {
  async show(
    interaction: StringSelectMenuInteraction | ModalSubmitInteraction,
  ) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) {
      return;
    }

    const character = session.character;

    const payload = {
      content:
        `Editing appearance for **${character.full_name}**\n\n` +
        `Current height: ${character.height}\n` +
        `Current color: ${character.color}\n` +
        `Current image: ${character.image_src}`,
      components: [createAppearanceEditMenu()],
    };

    if (interaction.isModalSubmit()) {
      await interaction.reply({
        ...payload,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.update(payload);
  }

  async handleAppearanceField(interaction: StringSelectMenuInteraction) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) {
      return;
    }

    const field =
      APPEARANCE_FIELDS[
        interaction.values[0] as keyof typeof APPEARANCE_FIELDS
      ];

    if (!field) {
      return;
    }

    await interaction.showModal(
      createEditFieldModal({
        customId: field.customId,
        title: field.title,
        fieldId: field.fieldId,
        label: field.label,
        value: field.value(session.character),
        placeholder: field.placeholder,
      }),
    );
  }
}

export const characterAppearanceEditService =
  new CharacterAppearanceEditService();
