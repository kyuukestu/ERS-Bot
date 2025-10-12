import { ItemDataSchema, type ItemData } from '../../schemas/apiSchemas';
import { formatName } from '../formatting/formatName';
import { itemEmojis } from '../../ui/emojis';

export const extractItemInfo = (rawData: unknown) => {
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
