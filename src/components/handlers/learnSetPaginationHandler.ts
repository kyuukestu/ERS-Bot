import type {
	Message,
	MessageComponentInteraction,
	ButtonInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import type {
	LearnMethodKey,
	GroupedMoves,
	PaginationState,
} from '~/types/learnSetTypes';

export const handlePreviousPage = (
	state: PaginationState,
	methods: LearnMethodKey[],
	groupedMoves: GroupedMoves,
	movesPerPage: number,
): void => {
	if (state.page > 0) {
		state.page--;
	} else {
		// Loop to last page of previous method
		state.methodIndex =
			(state.methodIndex - 1 + methods.length) % methods.length;
		const newMethod = methods[state.methodIndex];
		state.page = Math.ceil(groupedMoves[newMethod].length / movesPerPage) - 1;
	}
};

export const handleNextPage = (
	state: PaginationState,
	methods: LearnMethodKey[],
	groupedMoves: GroupedMoves,
	movesPerPage: number,
): void => {
	const totalPages = Math.ceil(
		groupedMoves[methods[state.methodIndex]].length / movesPerPage,
	);

	if (state.page < totalPages - 1) {
		state.page++;
	} else {
		// Loop to first page of next method
		state.methodIndex = (state.methodIndex + 1) % methods.length;
		state.page = 0;
	}
};

export const handleCategoryJump = (
	state: PaginationState,
	selectedValue: string,
): void => {
	state.methodIndex = parseInt(selectedValue);
	state.page = 0;
};

export const handleButtonInteraction = (
	interaction: ButtonInteraction,
	state: PaginationState,
	methods: LearnMethodKey[],
	groupedMoves: GroupedMoves,
	movesPerPage: number,
): boolean => {
	if (interaction.customId === 'prev') {
		handlePreviousPage(state, methods, groupedMoves, movesPerPage);
		return true;
	}

	if (interaction.customId === 'next') {
		handleNextPage(state, methods, groupedMoves, movesPerPage);
		return true;
	}

	return false;
};

export const handleSelectMenuInteraction = (
	interaction: StringSelectMenuInteraction,
	state: PaginationState,
): boolean => {
	if (interaction.customId === 'jump_select') {
		handleCategoryJump(state, interaction.values[0]);
		return true;
	}

	return false;
};

export const setupMessageCollector = async (
	message: Message,
	userId: string,
	state: PaginationState,
	methods: LearnMethodKey[],
	groupedMoves: GroupedMoves,
	movesPerPage: number,
	onUpdate: (state: PaginationState) => Promise<void>,
): Promise<void> => {
	const collector = message.createMessageComponentCollector({
		time: 60_000,
	});

	collector.on('collect', async (i: MessageComponentInteraction) => {
		if (i.user.id !== userId) {
			await i.reply({
				content: 'This interaction is not for you.',
				ephemeral: true,
			});
			return;
		}

		let updated = false;

		if (i.isButton()) {
			updated = handleButtonInteraction(
				i,
				state,
				methods,
				groupedMoves,
				movesPerPage,
			);
		} else if (i.isStringSelectMenu()) {
			updated = handleSelectMenuInteraction(i, state);
		}

		if (updated) {
			await onUpdate(state);
			await i.update({});
			collector.resetTimer();
		}
	});

	collector.on('end', async () => {
		try {
			await message.edit({
				components: [],
			});
		} catch (err) {
			console.log(err);
		}
	});
};
