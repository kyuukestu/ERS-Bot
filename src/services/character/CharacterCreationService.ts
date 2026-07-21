import { supabase } from "~/database/supabase/supabase";
import type { CharacterDraft } from "~/types/character";
import { type ButtonInteraction, MessageFlags } from "discord.js";
import { characterSessionStore } from "./CharacterSessionStore";

type CreatedCharacter = {
  id: string;
  full_name: string;
};

class CharacterCreationService {
  async create(data: CharacterDraft): Promise<CreatedCharacter> {
    const { data: character, error } = await supabase
      .from("characters")
      .insert({
        full_name: data.fullName ?? "Unknown",
        category: "oc",
        origin_region_id: data.originRegion,
        current_region_id: data.associatedRegion,
        gender: data.gender,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return character;
  }

  async confirm(interaction: ButtonInteraction) {
    const session = characterSessionStore.get(interaction.user.id);

    if (!session) {
      await interaction.reply({
        content: "Character creation session expired.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const { wizard } = session;

    if (!wizard.isComplete()) {
      await interaction.reply({
        content: "Character information is incomplete.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    await interaction.deferUpdate();

    try {
      const character = await characterCreationService.create(wizard.data);

      characterSessionStore.delete(interaction.user.id);

      await interaction.editReply({
        content:
          `Character created successfully.\n\n` +
          `**${character.full_name}** has been added.`,
        components: [],
      });

      await interaction.followUp({
        content: `**New Character:** ${character.full_name}\n`,
      });
    } catch (error) {
      console.error("Character creation failed:", error);

      await interaction.editReply({
        content: "Failed to create character.",
        components: [],
      });
    }
  }

  async cancel(interaction: ButtonInteraction) {
    characterSessionStore.delete(interaction.user.id);

    await interaction.update({
      content: "Character creation cancelled.",
      components: [],
    });
  }
}

export const characterCreationService = new CharacterCreationService();
