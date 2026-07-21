import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';

import { GENDERS } from '~/constants/genders';


export function createGenderSelector() {
	const menu = new StringSelectMenuBuilder()
		.setCustomId('character-gender')
		.setPlaceholder('Select gender')
		.setMinValues(1)
		.setMaxValues(1)
		.addOptions(
			GENDERS.map((gender) => ({
				label: gender,
				value: gender,
			})),
		);

	return new ActionRowBuilder<StringSelectMenuBuilder>()
		.addComponents(menu);
}
