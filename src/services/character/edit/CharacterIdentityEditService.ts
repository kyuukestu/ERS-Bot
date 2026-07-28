import {
  StringSelectMenuInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  MessageFlags,
} from "discord.js";
import { characterEditSessionStore } from "./CharacterEditSessionStore";
import { createIdentityEditMenu } from "../../../components/StringSelectMenus/identityEditSelector";
import { listEditorService } from "./ListEditorService";
import { createEditFieldModal } from "~/components/modals/createEditFieldModal";
import { createCharacterEditBackButton } from "~/components/buttons/characterEditBackButton";

class CharacterIdentityEditService {
  async show(
    interaction:
      StringSelectMenuInteraction | ButtonInteraction | ModalSubmitInteraction,
  ) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) return;

    const character = session.character;

    const payload = {
      content:
        `Editing identity for **${character.full_name}**\n\n` +
        `Current name: ${character.full_name}\n` +
        `Category: ${character.category}`,
      components: [createIdentityEditMenu(), createCharacterEditBackButton()],
    
    }

    if (interaction.isModalSubmit()) {
      await interaction.reply({
        ...payload,
        flags: MessageFlags.Ephemeral
      })

      return;
    }

    await interaction.update(payload);
  }

  async handleIdentityField(interaction: StringSelectMenuInteraction) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) return;

    switch (interaction.values[0]) {
      case "full_name":
        await interaction.showModal(
          createEditFieldModal({
            customId: "character-edit-full-name-modal",
            title: "Edit Full Name",
            fieldId: "full_name",
            label: "Full Name",
            value: session.character.full_name ?? "",
            placeholder: "Example: John Doe",
          }),
        );
        break;

      case "short_names":
        await listEditorService.start(interaction, session, {
          title: "Short Names",
          values: session.character.short_names,
          onSave: (values) => {
            session.character.short_names = values;
            session.dirtyFields.add("short_names");
          },
          onBack: async (interaction) => {
            await characterIdentityEditService.show(interaction);
          },
        });
        break;

      case "nicknames":
        await listEditorService.start(interaction, session, {
          title: "Nicknames",
          values: session.character.nicknames,
          onSave: (values) => {
            session.character.nicknames = values;
            session.dirtyFields.add("nicknames");
          },
          onBack: async (interaction) => {
            await characterIdentityEditService.show(interaction);
          },
        });
        break;
    }
  }
}

export const characterIdentityEditService = new CharacterIdentityEditService();
