import {
  type StringSelectMenuInteraction,
  type ModalSubmitInteraction,
} from "discord.js";
import type { ValidationResult } from "~/wizards/CharacterCreationWizard";
import { characterReviewService } from "./CharacterReviewService";
import { CharacterEditField } from "~/types/character";
import { type CharacterSession } from "~/types/character";
import { replyError } from "~/utils/interactionReply";
import { characterSessionStore } from "./CharacterSessionStore";

type CharacterFieldUpdateOptions = {
  field: CharacterEditField;
  value: string;
  setter: (value: string) => ValidationResult;
  onContinue?: () => Promise<void>;
};

type FieldUpdateResult = "review" | "continue";

export class CharacterFieldService {
  async updateField(
    interaction: StringSelectMenuInteraction | ModalSubmitInteraction,
    session: CharacterSession,
    options: CharacterFieldUpdateOptions,
  ): Promise<FieldUpdateResult> {
    const result = options.setter(options.value);

    if (await replyError(interaction, result)) {
      return "continue";
    }

    if (session.editing === options.field) {
      characterSessionStore.clearEditing(session);

      if (interaction.isModalSubmit()) {
        await characterReviewService.replyReview(interaction, session.wizard);
      } else {
        await characterReviewService.showReview(interaction, session.wizard);
      }

      return "review";
    }

    if (options.onContinue) {
      await options.onContinue();
    }

    return "continue";
  }
}

export const characterFieldService = new CharacterFieldService();
