import { ItemDataSchema, type ItemData } from '../z-schemas/apiSchemas';
import { formatName } from '~/utility/formatting/formatName';
import { itemEmojis } from '~/ui/emojis';

export interface ItemInfo {
	name: string;
	category: string;
	item_emoji: string;
	cost: number;
	effect: string;
	flavor_text_entries: string;
	flavor_text_ver: string;
	sprites: { default: string | null };
	fling_power: number;
	fling_effect: string;
}

export const extractItemInfo = (rawData: unknown): ItemInfo => {
	const data: ItemData = ItemDataSchema.parse(rawData);

	const {
		name,
		category,
		cost,
		effect_entries,
		flavor_text_entries,
		sprites,
		fling_power,
		fling_effect,
	} = data;

	const formattedName = formatName(name);
	const itemEmoji = itemEmojis[category?.name] ?? itemEmojis['other'];

	return {
		name: formattedName,
		category: category?.name ?? 'other',
		item_emoji: itemEmoji,
		cost: cost ?? 0,
		effect:
			effect_entries.filter((entry) => entry.language.name === 'en').pop()
				?.effect ?? 'No English description available',
		flavor_text_entries:
			flavor_text_entries.filter((entry) => entry.language.name === 'en').pop()
				?.text ?? 'No English description available',
		flavor_text_ver:
			flavor_text_entries.filter((ft) => ft.language.name === 'en').pop()
				?.version_group.name ?? 'Unknown',
		sprites,
		fling_power: fling_power ?? 0,
		fling_effect: fling_effect?.name ?? 'N/A',
	};
};
