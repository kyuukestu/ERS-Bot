import {
  MessageFlags,
  type ChatInputCommandInteraction,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
  type ButtonInteraction,
} from "discord.js";
import { CharacterCreationWizard } from "~/wizards/CharacterCreationWizard";
import { createRegionSelector } from "~/components/selectors/regionSelector";
import { createGenderSelector } from "~/components/selectors/genderSelector";
import { createCharacterNameModal } from "~/components/modals/createCharacterNameModal";
import { characterSessionStore } from "./CharacterSessionStore";
import { CharacterEditField } from "~/types/character";

class CharacterFlowService {
  async showNameModal(interaction: ChatInputCommandInteraction) {
    await interaction.showModal(createCharacterNameModal());
  }

  async editName(interaction: ButtonInteraction) {
    const session = characterSessionStore.get(interaction.user.id);

    if (!session) return;

    session.editing = CharacterEditField.Name;

    await interaction.showModal(createCharacterNameModal());
  }

  async showOriginSelector(
    interaction: StringSelectMenuInteraction | ModalSubmitInteraction,
    wizard: CharacterCreationWizard,
  ) {
    await interaction.reply({
      content:
        `Name saved: ${wizard.data.fullName}\n\n` +
        "Select the character's region of origin.",
      components: [createRegionSelector("character-origin-region")],
      flags: MessageFlags.Ephemeral,
    });
  }

  async editOrigin(interaction: ButtonInteraction) {
    const session = characterSessionStore.get(interaction.user.id);

    if (!session) return;

    session.editing = CharacterEditField.Origin;

    await interaction.update({
      content: "Select the character's region of origin.",
      components: [createRegionSelector("character-origin-region")],
    });
  }

  async showAssociatedRegionSelector(
    interaction: StringSelectMenuInteraction,
    wizard: CharacterCreationWizard,
  ) {
    await interaction.update({
      content:
        `Origin region: ${wizard.data.originRegion}\n\n` +
        "Now select the associated region.",
      components: [createRegionSelector("character-associated-region")],
    });
  }

  async editAssociatedRegion(interaction: ButtonInteraction) {
    const session = characterSessionStore.get(interaction.user.id);

    if (!session) return;

    session.editing = CharacterEditField.AssociatedRegion;

    await interaction.update({
      content: "Select the character's associated region.",
      components: [createRegionSelector("character-associated-region")],
    });
  }

  async showGenderSelector(
    interaction: StringSelectMenuInteraction,
    wizard: CharacterCreationWizard,
  ) {
    const selector = createGenderSelector();
    
      console.log(
        JSON.stringify(selector.toJSON(), null, 2),
      );
    
    await interaction.update({
      content:
        `Associated region: ${wizard.data.associatedRegion}\n\n` +
        "Select gender.",
      components: [createGenderSelector()],
    });
  }

  async editGender(interaction: ButtonInteraction) {
    const session = characterSessionStore.get(interaction.user.id);

    if (!session) return;

    session.editing = CharacterEditField.Gender;

    await interaction.update({
      content: "Select gender.",
      components: [createGenderSelector()],
    });
  }

  async showCancelled(interaction: ButtonInteraction) {
    await interaction.update({
      content: "Character creation cancelled.",
      components: [],
    });
  }
}

export const characterFlowService = new CharacterFlowService();
