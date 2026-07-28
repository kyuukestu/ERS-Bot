import { createReviewButtons } from "~/components/buttons/reviewButtons";
import type { CharacterCreationWizard } from "~/wizards/CharacterCreationWizard";
import {
  type ModalSubmitInteraction,
  type ButtonInteraction,
  type StringSelectMenuInteraction,
  MessageFlags,
} from "discord.js";

export class CharacterReviewService {
  private createReviewMessage(wizard: CharacterCreationWizard) {
    const data = wizard.data;

    return [
      `**Name:** ${data.fullName}`,
      `**Origin:** ${data.originRegion}`,
      `**Associated Region:** ${data.associatedRegion}`,
      `**Gender:** ${data.gender}`,
    ].join("\n");
  }

  async replyReview(
    interaction: ModalSubmitInteraction,
    wizard: CharacterCreationWizard,
  ) {
    await interaction.reply({
      content:
        "Please review your character:\n\n" + this.createReviewMessage(wizard),
      components: createReviewButtons(),
      flags: MessageFlags.Ephemeral,
    });
  }

  async showReview(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    wizard: CharacterCreationWizard,
  ) {
    await interaction.update({
      content:
        "Please review your character:\n\n" + this.createReviewMessage(wizard),
      components: createReviewButtons(),
    });
  }
}

export const characterReviewService = new CharacterReviewService();
