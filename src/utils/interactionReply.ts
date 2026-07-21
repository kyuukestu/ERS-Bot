
import {
	type ModalSubmitInteraction,
	type StringSelectMenuInteraction,
  type ButtonInteraction,
	MessageFlags
} from "discord.js";
import type { ValidationResult } from "~/wizards/CharacterCreationWizard";

export async function replyError(
	interaction:
		| ModalSubmitInteraction
		| StringSelectMenuInteraction
		| ButtonInteraction,
	result: ValidationResult,
): Promise<boolean> {
  if (result.success) {
    return false;
  }
  
	await interaction.reply({
		content: result.message,
		flags: MessageFlags.Ephemeral,
  });

  return true;
}
