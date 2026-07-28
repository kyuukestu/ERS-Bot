import type {
  StringSelectMenuInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
} from "discord.js";

import { characterEditSessionStore } from "./CharacterEditSessionStore";
import { createCharacterEditBackButton } from "~/components/buttons/characterEditBackButton";
import { createEditFieldModal } from "~/components/modals/createEditFieldModal";
import { createCharacterLinksEditButton } from "~/components/buttons/characterLinksEditButton";

class CharacterLinksEditService {
  async show(
    interaction:
      | StringSelectMenuInteraction
      | ButtonInteraction
      | ModalSubmitInteraction,
  ) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) return;

    const character = session.character;

    const payload = {
      content:
        `Editing links for **${character.full_name}**\n\n` +
        `Current character sheet:\n` +
        `${character.external_sheet_url ?? "*None*"}`,
      components: [createCharacterLinksEditButton(), createCharacterEditBackButton()],
    };

    if (interaction.isModalSubmit()) {
      await interaction.reply({
        ...payload,
        ephemeral: true,
      });
    } else {
      await interaction.update(payload);
    }
  }

  async edit(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) return;

    await interaction.showModal(
      createEditFieldModal({
        customId: "character-edit-sheet-url-modal",
        title: "Edit Character Sheet",
        fieldId: "external_sheet_url",
        label: "Character Sheet URL",
        value: session.character.external_sheet_url ?? "",
        placeholder: "https://...",
      }),
    );
  }
}

export const characterLinksEditService =
  new CharacterLinksEditService();
