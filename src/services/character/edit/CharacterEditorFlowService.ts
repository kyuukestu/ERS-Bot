import {
  type StringSelectMenuInteraction,
  type ButtonInteraction,
  type ModalSubmitInteraction,
  MessageFlags,
} from "discord.js";
import { characterQueryService } from "./CharacterQueryService";
import { createCharacterEditMenu } from "~/components/StringSelectMenus/characterEditSelector";
import { characterEditSessionStore } from "./CharacterEditSessionStore";
import {
  CharacterEditSection,
  type EditableCharacterDTO,
} from "~/types/character";
import { characterIdentityEditService } from "./CharacterIdentityEditService";
import { characterAppearanceEditService } from "./CharacterAppearanceEditService";
import { characterBackgroundEditService } from "./CharacterBackgroundEditService";
import { characterLinksEditService } from "./CharacterLinksEditService";
import { characterUpdateService } from "./CharacterUpdateService";
import { createCharacterEditSaveButtons } from "~/components/buttons/characterEditSaveButton";

class CharacterEditorFlowService {
  async start(interaction: StringSelectMenuInteraction, characterId: string) {
    const character =
      await characterQueryService.getCharacterForEdit(characterId);

    characterEditSessionStore.create(interaction.user.id, character);

    await this.showSectionMenu(interaction, character);
  }

  async showSectionMenu(
    interaction: StringSelectMenuInteraction,
    character: EditableCharacterDTO,
  ) {
    
    await interaction.update({
      content: `Editing **${character.full_name}**\n\nSelect what you want to edit.`,
      components: [createCharacterEditMenu(character)],
    });
  }

  async handleSectionSelection(interaction: StringSelectMenuInteraction) {
    const section = interaction.values[0];

    switch (section) {
      case CharacterEditSection.Identity:
        await characterIdentityEditService.show(interaction);
        break;

      case CharacterEditSection.Appearance:
        await characterAppearanceEditService.show(interaction);
        break;

      case CharacterEditSection.Background:
        await characterBackgroundEditService.show(interaction);
        break;

      case CharacterEditSection.Links:
        await characterLinksEditService.show(interaction);
        break;

      default:
        console.warn(`Unknown character edit section: ${section}`);
    }
  }

  async showSections(interaction: ButtonInteraction | ModalSubmitInteraction) {
    const session = characterEditSessionStore.get(interaction.user.id);

    if (!session) return;

    const hasChanges =
      session.dirtyFields.size > 0;

    const payload = {
      content:
        `Editing **${session.character.full_name}**\n\n` +
        "Choose a section to edit.",
      components: [createCharacterEditMenu(session.character), ...createCharacterEditSaveButtons(hasChanges)],
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

  async save(interaction: ButtonInteraction) {
    const session =
      characterEditSessionStore.get(interaction.user.id);
  
    if (!session) return;
  
    await characterUpdateService.updateCharacter(
      session.character,
      session.dirtyFields,
    );
  
    characterEditSessionStore.delete(
      interaction.user.id,
    );
  
    await interaction.update({
      content:
        `Successfully saved changes to **${session.character.full_name}**.`,
      components: [],
    });
  }

  async discard(interaction: ButtonInteraction) {
    characterEditSessionStore.delete(
      interaction.user.id,
    );
  
    await interaction.update({
      content: "Character edits discarded.",
      components: [],
    });
  }

  
}

export const characterEditorFlowService = new CharacterEditorFlowService();
