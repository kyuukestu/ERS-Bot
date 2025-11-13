import {
	type StringSelectMenuInteraction,
	EmbedBuilder,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	MessageFlags,
} from 'discord.js';

interface PokemonSprites {
	default: string | null;
	shiny: string | null;
	back: string | null;
	backShiny: string | null;
	officialArtwork: string | null;
	shinyArtwork: string | null;
	dreamWorld: string | null;
}

export const handleSpriteGallery = async (
	interaction: StringSelectMenuInteraction,
	sprites: PokemonSprites,
	name: string,
	currentlyShiny: boolean
) => {
	const spriteOptions = [
		{ label: 'Default Front', value: 'default', sprite: sprites.default },
		{ label: 'Shiny Front', value: 'shiny', sprite: sprites.shiny },
		{ label: 'Default Back', value: 'back', sprite: sprites.back },
		{ label: 'Shiny Back', value: 'backShiny', sprite: sprites.backShiny },
		{
			label: 'Official Artwork',
			value: 'artwork',
			sprite: sprites.officialArtwork,
		},
		{
			label: 'Shiny Artwork',
			value: 'shinyArtwork',
			sprite: sprites.shinyArtwork,
		},
		{ label: 'Dream World', value: 'dreamWorld', sprite: sprites.dreamWorld },
	].filter((option) => option.sprite); // Only include available sprites

	let currentSprite = currentlyShiny ? 'shiny' : 'default';

	const createSpriteEmbed = (spriteKey: string) => {
		const option = spriteOptions.find((opt) => opt.value === spriteKey);
		return new EmbedBuilder()
			.setColor(0xff9999)
			.setTitle(`🎨 ${name} - ${option?.label || 'Sprite Gallery'}`)
			.setImage(option?.sprite || sprites.default)
			.setFooter({
				text: `Viewing: ${option?.label || 'Unknown'} • ${
					spriteOptions.length
				} sprites available`,
			});
	};

	const spriteSelect = new StringSelectMenuBuilder()
		.setCustomId('sprite_select')
		.setPlaceholder('Choose a sprite to view...')
		.addOptions(
			spriteOptions.map((option) => ({
				label: option.label,
				value: option.value,
				description: `View ${option.label.toLowerCase()}`,
				default: option.value === currentSprite,
			}))
		);

	const spriteRow = new ActionRowBuilder().addComponents(spriteSelect);

	const spriteMessage = await interaction.followUp({
		embeds: [createSpriteEmbed(currentSprite)],
		components: [spriteRow.toJSON()],
		flags: MessageFlags.Ephemeral,
	});

	const spriteCollector = spriteMessage.createMessageComponentCollector({
		time: 120000,
	});

	spriteCollector.on(
		'collect',
		async (selectInteraction: StringSelectMenuInteraction) => {
			currentSprite = selectInteraction.values[0];

			// Update select menu defaults
			spriteSelect.options.forEach((option) => {
				option.setDefault(option.data.value === currentSprite);
			});

			await selectInteraction.update({
				embeds: [createSpriteEmbed(currentSprite)],
				components: [
					new ActionRowBuilder().addComponents(spriteSelect).toJSON(),
				],
			});
		}
	);

	spriteCollector.on('end', () => {
		spriteMessage.edit({ components: [] }).catch(console.error);
	});
};
