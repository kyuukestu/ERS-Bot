const { moveEndPoint } = require('../../components/api/PokeApi.ts');
const {
	formatUserInput,
} = require('../../components/utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
} = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { MoveData } from '../components/interface/MoveData';

const typeConfig = {
	Normal: { icon: '', color: 'hsl(208.24deg 8.37% 60.2%)' },
	Fire: { icon: '', color: 'hsl(359.68deg 79.17% 52.94%)' },
	Water: { icon: '', color: 'hsl(213.64deg 86.09% 54.9%)' },
	Electric: { icon: '', color: 'hsl(46.08deg 100% 49.02%)' },
	Grass: { icon: '', color: 'hsl(109deg 59.41% 39.61%)' },
	Ice: { icon: '', color: 'hsl(192.19deg 100% 62.35%)' },
	Fighting: { icon: '', color: 'hsl(342.21deg 60.17% 52.75%)' },
	Poison: { icon: '', color: 'hsl(281.68deg 46.8% 60.2%)' },
	Ground: { icon: '', color: 'hsl(20.8deg 66.96% 56.08%)' },
	Flying: { icon: '', color: 'hsl(220deg 54.17% 71.76%)' },
	Psychic: { icon: '', color: 'hsl(340.69deg 84.47% 59.61%)' },
	Bug: { icon: '', color: 'hsl(67.06deg 73.12% 36.47%)' },
	Rock: { icon: '', color: 'hsl(52.17deg 22.33% 59.61%)' },
	Ghost: { icon: '', color: 'hsl(300deg 26.55% 34.71%)' },
	Dragon: { icon: '', color: 'hsl(233.38deg 70.73% 59.8%' },
	Dark: { icon: '', color: 'hsl(233.38deg 70.73% 59.8%' },
	Steel: { icon: '', color: 'hsl(195.68deg 38.26% 54.9%)' },
	Fairy: { icon: '', color: 'hsl(300deg 79.87% 68.82%)' },
};

const getTypeConfig = (type: string) => {
	const normalizeType = type.toLowerCase();
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('TMTRDex')
		.setDescription('Obtain a list of all TMs and TRs; Grouped by Type.')
		.setStringOption((option: any) =>
			option
				.setName('type')
				.setDescription('Filter to one type.')
				.setRequired(false)
		),

	async execute(interaction: CommandInteraction) {
		const type = formatUserInput(
			interaction.options.get('type', false)?.value as string
		);
	},
};
