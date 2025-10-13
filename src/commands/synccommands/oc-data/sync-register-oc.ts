import OC from '../../../models/OCSchema';
import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-register-oc')
		.setDescription('Register your OC to the database. (PokeSync)')
		.addStringOption((option) =>
			option.setName('name').setDescription('Name of your OC').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('nickname').setDescription('Nickname of your OC')
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const name = interaction.options.getString('name');
		const nickname = interaction.options.getString('nickname') ?? name;

		try {
			const existingOC = await OC.findOne({ name });

			if (existingOC) {
				return interaction.reply({
					content: `${interaction.user.username}, there is already an OC registered with that name.`,
					flags: 'Ephemeral',
				});
			}

			await OC.create({
				name,
				nickname,
				money: 5000,
				inventory: [],
				party: [],
			});

			return interaction.reply(`Successfully registered ${name}.`);
		} catch (err) {
			return interaction.reply(
				`An error occurred while registering your OC: \n\n${err}`
			);
		}
	},
};
