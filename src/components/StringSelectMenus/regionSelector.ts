import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
} from 'discord.js';

import { REGIONS } from '~/constants/regions';


export function createRegionSelector(customId: string) {
	const menu = new StringSelectMenuBuilder()
		.setCustomId(customId)
		.setPlaceholder('Select a region')
		.setMinValues(1)
		.setMaxValues(1)
		.addOptions(
			REGIONS.map((region) => ({
				label: region,
				value: region,
			})),
		);

	return new ActionRowBuilder<StringSelectMenuBuilder>()
		.addComponents(menu);
}
