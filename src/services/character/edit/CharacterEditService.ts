import { ChatInputCommandInteraction, MessageFlags, StringSelectMenuInteraction } from "discord.js";
import { characterQueryService } from "./CharacterQueryService";
import { createCharacterSelector } from "~/components/StringSelectMenus/characterSelector";
import { characterEditorFlowService } from "./CharacterEditorFlowService";

class CharacterEditService {
  async start(interaction: ChatInputCommandInteraction) {
    const characters = await characterQueryService.getUserCharacters(
      interaction.user.id,
    );

    if (characters.length === 0) {
      await interaction.reply({
        content: "You have no characters to edit.",
        flags: MessageFlags.Ephemeral,
      });
      
      return;
    }

    await interaction.reply({
      content: "Select a character to edit.",
      components: [createCharacterSelector(characters),],
      flags: MessageFlags.Ephemeral,
    })
  }

  async handleSelection(interaction: StringSelectMenuInteraction) {
    const characterId = interaction.values[0];

    await characterEditorFlowService.start(
      interaction,
      characterId
    )
  }
}

export const characterEditService = new CharacterEditService();
