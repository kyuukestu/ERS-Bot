import {
  type StringSelectMenuInteraction,
  type ButtonInteraction,
  type ModalSubmitInteraction,
  MessageFlags,
} from "discord.js";

import { characterEditSessionStore } from "./CharacterEditSessionStore";
import { createBackgroundEditMenu } from "~/components/StringSelectMenus/backgroundEditSelector";
import { createCharacterEditBackButton } from "~/components/buttons/characterEditBackButton";
import type { EditableCharacterDTO } from "~/types/character";
import { createEditFieldModal } from "~/components/modals/createEditFieldModal";

const BACKGROUND_FIELDS = {
  origin_region_id: {
    customId: "character-edit-origin-region-modal",
    title: "Edit Origin Region",
    fieldId: "origin_region_id",
    label: "Origin Region",
    placeholder: "Example: Kanto",
    value: (character: EditableCharacterDTO) =>
      character.origin_region_id ?? "",
  },

  associated_region_id: {
    customId: "character-edit-associated-region-modal",
    title: "Edit Associated Region",
    fieldId: "associated_region_id",
    label: "Associated Region",
    placeholder: "Example: Johto",
    value: (character: EditableCharacterDTO) =>
      character.associated_region_id ?? "",
  },

  age: {
    customId: "character-edit-age-modal",
    title: "Edit Age",
    fieldId: "age",
    label: "Age",
    placeholder: "Example: 18",
    value: (character: EditableCharacterDTO) => character.age?.toString() ?? "",
  },

  dob: {
    customId: "character-edit-dob-modal",
    title: "Edit Date of Birth",
    fieldId: "dob",
    label: "Date of Birth",
    placeholder: "Example: January 1st, 2000",
    value: (character: EditableCharacterDTO) => character.dob ?? "",
  },

  gender: {
    customId: "character-edit-gender-modal",
    title: "Edit Gender",
    fieldId: "gender",
    label: "Gender",
    placeholder: "Example: Female",
    value: (character: EditableCharacterDTO) => character.gender ?? "",
  },

 
};

class CharacterBackgroundEditService {
  async show(
    interaction:
      StringSelectMenuInteraction | ButtonInteraction | ModalSubmitInteraction,
  ) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) return;

    const character = session.character;

    const payload = {
      content:
        `Editing background for **${character.full_name}**\n\n` +
        `Age: ${character.age ?? "Not set"}\n` +
        `DOB: ${character.dob ?? "Not set"}\n` +
        `Gender: ${character.gender ?? "Not set"}\n` +
        `Origin region:: ${character.origin_region_id ?? "Not set"}\n` +
        `Associated region: ${character.associated_region_id ?? "Not set"}\n`,
      components: [createBackgroundEditMenu(), createCharacterEditBackButton()],
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

  async handleBackgroundField(interaction: StringSelectMenuInteraction) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) return;

    const field =
      BACKGROUND_FIELDS[
        interaction.values[0] as keyof typeof BACKGROUND_FIELDS
      ];

    if (!field) return;

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

export const characterBackgroundEditService =
  new CharacterBackgroundEditService();
