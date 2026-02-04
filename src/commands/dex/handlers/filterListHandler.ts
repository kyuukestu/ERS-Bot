import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { sendFilteredPaginatedMoveEmbed } from '~/components/pagination/movePaginationFiltered.ts';
import movesList from '~/../public/json/moves-list.json';
import type { MoveType, MoveListType } from '~/types/dexTypes';

export async function handleFilterList(
	interaction: ChatInputCommandInteraction,
) {
	try {
		const type = interaction.options.getString('type');
		const max = interaction.options.getInteger('max_power');
		const min = interaction.options.getInteger('min_power');
		const min_acc = interaction.options.getInteger('min_accuracy');
		const max_acc = interaction.options.getInteger('max_accuracy');
		const priority = interaction.options.getInteger('priority');
		const category = interaction.options.getString('category');

		await interaction.deferReply();

		const filters = {
			type,
			maxPower: max,
			minPower: min,
			minAcc: min_acc,
			maxAcc: max_acc,
			priority,
			category,
		};

		const predicates: Record<
			string,
			(move: MoveType, value: string | number) => boolean
		> = {
			type: (move, value) =>
				typeof value === 'string' ? move.type === value : false,

			minPower: (move, value) =>
				typeof value === 'number'
					? move.power !== null && (move.power ?? 0) >= value
					: false,

			maxPower: (move: MoveType, value) =>
				typeof value === 'number'
					? move.power !== null && (move.power ?? 0) <= value
					: false,
			minAcc: (move: MoveType, value) =>
				typeof value === 'number'
					? move.accuracy !== null && (move.accuracy ?? 101) >= value
					: false,

			maxAcc: (move: MoveType, value) =>
				typeof value === 'number'
					? move.accuracy !== null && (move.accuracy ?? 101) <= value
					: false,

			priority: (move: MoveType, value) =>
				typeof value === 'number'
					? move.priority != null && move.priority === value
					: false,
			category: (move: MoveType, value) =>
				typeof value === 'string'
					? move.category != null && move.category === value
					: false,
		};

		const isDeclared = (value: string | number | null) =>
			value !== null && value !== undefined;

		const filteredList = movesList.filter((move) => {
			return Object.entries(filters).every(([key, value]) => {
				if (!isDeclared(value)) return true;
				return predicates[key](move, value);
			});
		});

		const activeFilters = Object.fromEntries(
			Object.entries(filters).filter(([, value]) => isDeclared(value)),
		);

		if (!filteredList.length) {
			return interaction.followUp({
				content: 'No moves matched your filters.',
				flags: MessageFlags.Ephemeral,
			});
		}

		await sendFilteredPaginatedMoveEmbed({
			interaction,
			moves: filteredList as MoveListType,
			activeFilters,
		});
	} catch (err) {
		interaction.editReply(`${err}`);
	}
}
