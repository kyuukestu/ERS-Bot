import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import create from '~/command-modules/character/create';
import edit from '~/command-modules/character/edit';

export default {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('Manage characters.')
    .addSubcommand(create.data)
    .addSubcommand(edit.data),
	
  async execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
      case "create":
        return create.execute(interaction);

      case "edit":
        return edit.execute(interaction);
    }
  },
};
