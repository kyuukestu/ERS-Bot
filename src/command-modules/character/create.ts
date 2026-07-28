import {
  SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { characterWizardService } from "~/services/character/creation/characterWizardService";

export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Create or Register a new characters."),
  async execute(interaction: ChatInputCommandInteraction) {
    await characterWizardService.start(interaction);
  },
};
