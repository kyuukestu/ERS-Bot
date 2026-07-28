import {
  type ChatInputCommandInteraction,
  type ButtonInteraction,
  MessageFlags,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
} from "discord.js";
import { CharacterEditField } from "~/types/character";
import { characterSessionStore } from "./CharacterSessionStore";
import { characterReviewService } from "./CharacterReviewService";
import { characterFieldService } from "./CharacterFieldService";
import { characterFlowService } from "./CharacterFlowService";
import { characterCreationService } from "./CharacterCreationService";

export type CharacterInteraction =
  ModalSubmitInteraction | StringSelectMenuInteraction | ButtonInteraction;

class CharacterWizardService {
  async start(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    if (characterSessionStore.has(userId)) {
      await interaction.reply({
        content: "You already have a character creation session in progress.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    characterSessionStore.create(userId);

    await characterFlowService.showNameModal(interaction);
  }

  private async requireSession(interaction: CharacterInteraction) {
    const session = characterSessionStore.get(interaction.user.id);

    if (!session) {
      await interaction.reply({
        content: "Character creation session expired.",
        flags: MessageFlags.Ephemeral,
      });

      return null;
    }

    return session;
  }

  async handleModal(interaction: ModalSubmitInteraction) {
    switch (interaction.customId) {
      case "character-name-modal":
        await this.handleName(interaction);
        break;

      default:
        console.warn(`Unknown modal: ${interaction.customId}`);
    }
  }

  private async handleName(interaction: ModalSubmitInteraction) {
    const session = await this.requireSession(interaction);

    if (!session) return;

    await characterFieldService.updateField(interaction, session, {
      field: CharacterEditField.Name,
      value: interaction.fields.getTextInputValue("character-name"),
      setter: (value) => session.wizard.setName(value),
      onContinue: () =>
        characterFlowService.showOriginSelector(interaction, session.wizard),
    });
  }

  async handleSelectMenu(interaction: StringSelectMenuInteraction) {
    switch (interaction.customId) {
      case "character-origin-region":
        await this.handleOrigin(interaction);
        break;

      case "character-associated-region":
        await this.handleAssociatedRegion(interaction);
        break;

      case "character-gender":
        await this.handleGender(interaction);
        break;

      default:
        console.warn(`Unknown menu: ${interaction.customId}`);
    }
  }

  async handleButton(interaction: ButtonInteraction) {
    switch (interaction.customId) {
      case "character-confirm":
        await characterCreationService.confirm(interaction);
        break;

      case "character-edit-name":
        await characterFlowService.editName(interaction);
        break;

      case "character-edit-origin":
        await characterFlowService.editOrigin(interaction);
        break;

      case "character-edit-associated":
        await characterFlowService.editAssociatedRegion(interaction);
        break;

      case "character-edit-gender":
        await characterFlowService.editGender(interaction);
        break;

      case "character-cancel":
        await characterCreationService.cancel(interaction);
        break;

      default:
        console.warn(`Unknown character button: ${interaction.customId}`);
    }
  }

  private async handleOrigin(interaction: StringSelectMenuInteraction) {
    const session = await this.requireSession(interaction);

    if (!session) return;

    await characterFieldService.updateField(interaction, session, {
      field: CharacterEditField.Origin,
      value: interaction.values[0],
      setter: (value) => session.wizard.setOrigin(value),
      onContinue: () =>
        characterFlowService.showAssociatedRegionSelector(
          interaction,
          session.wizard,
        ),
    });
  }

  private async handleAssociatedRegion(
    interaction: StringSelectMenuInteraction,
  ) {
    const session = await this.requireSession(interaction);
    if (!session) return;

    await characterFieldService.updateField(interaction, session, {
      field: CharacterEditField.AssociatedRegion,
      value: interaction.values[0],
      setter: (value) => session.wizard.setAssociatedRegion(value),
      onContinue: () =>
        characterFlowService.showGenderSelector(interaction, session.wizard),
    });
  }

  private async handleGender(interaction: StringSelectMenuInteraction) {
    const session = await this.requireSession(interaction);

    if (!session) return;

    await characterFieldService.updateField(interaction, session, {
      field: CharacterEditField.Gender,
      value: interaction.values[0],
      setter: (value) => session.wizard.setGender(value),
      onContinue: () =>
        characterReviewService.showReview(interaction, session.wizard),
    });
  }
}

export const characterWizardService = new CharacterWizardService();
