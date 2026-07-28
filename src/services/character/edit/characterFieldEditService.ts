import { type ModalSubmitInteraction, MessageFlags } from "discord.js";
import { characterEditSessionStore } from "./CharacterEditSessionStore";
import { characterFieldRegistry } from "./CharacterFieldRegistry";

class CharacterFieldEditService {
  async handleModal(interaction: ModalSubmitInteraction) {
    const session = characterEditSessionStore.get(interaction.user.id);

    console.log("Received modal:", interaction.customId);

    if (!session) {
      return;
    }

    const config = characterFieldRegistry.get(interaction.customId);

    if (!config) {
      console.warn(`Unknown character edit modal: ${interaction.customId}`);

      return;
    }

    let value = interaction.fields.getTextInputValue(config.inputId);

    if (config.parse) {
      value = config.parse(value) as string;
    }

    session.character[config.field] = value as never;

    session.dirtyFields.add(config.field);

    if (config.onComplete) {
      await config.onComplete(interaction);

      return;
    }

    await interaction.reply({
      content: `${String(config.field)} updated.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export const characterFieldEditService = new CharacterFieldEditService();
