import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { characterWizardService } from '~/services/character/characterWizardService';

export default {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('Manage characters.')
		.addSubcommand((sub) =>
			sub.setName('create').setDescription('Create a new character.'),
		),
	
  async execute(interaction: ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
					case 'create':
						await characterWizardService.start(interaction);
						break;
				}
	},
};
