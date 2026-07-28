import {
  SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { characterEditService } from "~/services/character/edit/CharacterEditService";
export default {
  data: new SlashCommandSubcommandBuilder()
    .setName("edit")
    .setDescription("Edit character details."),
  async execute(interaction: ChatInputCommandInteraction) {
    await characterEditService.start(interaction);
  },
};
