import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

export function createCharacterNameModal() {
	const input = new TextInputBuilder()
		.setCustomId('character-name')
		.setLabel('Character Name')
		.setPlaceholder('Enter the character full name')
		.setStyle(TextInputStyle.Short)
		.setRequired(true)
		.setMaxLength(80);

	const row = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(input);

	return new ModalBuilder()
		.setCustomId('character-name-modal')
		.setTitle('Create Character')
		.addComponents(row);
}
