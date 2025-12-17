import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ALL_TYPES, type PokemonType } from '~/database/pokemonTypes';
import { getTypeIcon } from '~/ui/typeIcons';

type CombinedCanvasOptions = {
	title: string;
	offense: Record<PokemonType, number>;
	defense: Record<PokemonType, number>;
};

export type SummaryBlockOptions = Pick<
	CombinedCanvasOptions,
	'offense' | 'defense'
>;

function multiplierColor(mult: number) {
	if (mult === 0) return '#444'; // immune
	if (mult < 1) return '#4caf50'; // resist
	if (mult === 1) return '#9e9e9e'; // neutral
	if (mult === 2) return '#ff9800'; // super effective
	if (mult >= 4) return '#f44336'; // very effective
	return '#fff';
}

function chunkArray<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}

export async function renderCombinedTypeEffectivenessCanvas({
	title,
	offense,
	defense,
}: CombinedCanvasOptions) {
	const cellSize = 80;
	const cols = 6;
	const rows = Math.ceil(ALL_TYPES.length / cols);
	const width = cols * cellSize + 32; // padding for text
	const height = rows * cellSize * 2 + 225; // space for title + gap between charts

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	// Background
	ctx.fillStyle = '#1e1e1e';
	ctx.fillRect(0, 0, width, height);

	// Common title font
	const titleFont = 'bold 24px Orbitron';
	const labelFont = 'bold 18px sans-serif';

	ctx.font = titleFont;
	ctx.fillStyle = '#fff';
	ctx.fillText(title, 16, 40);

	// Helper to draw a chart
	async function drawChart(
		data: Record<PokemonType, number>,
		offsetY: number,
		chartTitle: string
	) {
		ctx.font = titleFont;
		ctx.fillStyle = '#fff';
		ctx.fillText(chartTitle, 16, offsetY);

		const startY = offsetY + 32; // space for chart title

		for (let i = 0; i < ALL_TYPES.length; i++) {
			const type = ALL_TYPES[i];
			const x = (i % cols) * cellSize;
			const y = Math.floor(i / cols) * cellSize + startY;

			const mult = data[type];

			// Background color

			ctx.fillStyle = multiplierColor(mult);
			ctx.fillRect(x, y, cellSize, cellSize);

			// Load icon and maintain aspect ratio
			const icon = await getTypeIcon(type);
			const img = await loadImage(icon.sprite);

			// Reduce icon size

			const iconHeight = 16;

			const aspectRatio = 50 / 11;

			const iconWidth = iconHeight * aspectRatio;

			const iconX = x + (cellSize - iconWidth) / 2;
			const iconY = y + (cellSize - iconHeight - 16) / 2;

			ctx.drawImage(img, iconX, iconY, iconWidth, iconHeight);

			// Multiplier text
			ctx.font = labelFont;
			ctx.fillStyle = '#fff';
			const text = `${mult}×`;
			const textWidth = ctx.measureText(text).width;
			ctx.fillText(text, x + (cellSize - textWidth) / 2, y + cellSize - 8);
		}
	}

	await drawChart(offense, 80, 'Offense');
	await drawChart(defense, rows * cellSize + 160, 'Defense');

	return canvas.toBuffer('image/png');
}

export async function renderSummaryBlock({
	offense,
	defense,
}: SummaryBlockOptions) {
	const cellSize = 48; // icon height
	const maxIconsPerRow = 3;
	const gap = 12; // horizontal gap
	const rowGap = 32; // vertical gap between rows
	const sidePadding = 16;
	const headerHeight = 28;

	// Only include non-neutral relationships
	const filteredOffense = Object.fromEntries(
		Object.entries(offense).filter(([, v]) => v !== 1)
	) as Record<PokemonType, number>;
	const filteredDefense = Object.fromEntries(
		Object.entries(defense).filter(([, v]) => v !== 1)
	) as Record<PokemonType, number>;

	const offenseRows = buildMultiplierRows(filteredOffense, maxIconsPerRow);
	const defenseRows = buildMultiplierRows(filteredDefense, maxIconsPerRow);

	const totalRows =
		offenseRows.reduce((sum, r) => sum + r.length, 0) +
		defenseRows.reduce((sum, r) => sum + r.length, 0);

	const canvasWidth = (sidePadding + maxIconsPerRow * cellSize) * 5;
	const canvasHeight =
		totalRows * cellSize + (offenseRows.length + defenseRows.length) * rowGap;

	const canvas = createCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	// Background
	ctx.fillStyle = '#1e1e1e';
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	ctx.font = 'bold 24px Orbitron';
	ctx.fillStyle = '#fff';

	let cursorY = 20;

	// Draw offense section
	ctx.fillText('OFFENSE (Best Multiplier)', sidePadding, cursorY);
	cursorY += headerHeight;

	for (const row of offenseRows) {
		cursorY += await drawMultiplierRow(
			ctx,
			row,
			sidePadding,
			cursorY,
			cellSize,
			gap
		);
		cursorY += rowGap;
	}

	ctx.font = 'bold 24px Orbitron';
	ctx.fillStyle = '#fff';

	// Draw defense section
	ctx.fillText('DEFENSE (Combined)', sidePadding * 8, cursorY);
	cursorY += headerHeight;

	for (const row of defenseRows) {
		cursorY += await drawMultiplierRow(
			ctx,
			row,
			sidePadding,
			cursorY,
			cellSize,
			gap
		);
		cursorY += rowGap;
	}

	return canvas.toBuffer('image/png');
}

/**
 * Groups types by multiplier, each multiplier starts a new array of rows with up to maxPerRow items
 */
function buildMultiplierRows(
	data: Record<PokemonType, number>,
	maxPerRow: number
) {
	const grouped: Record<number, PokemonType[]> = {};

	for (const [type, mult] of Object.entries(data) as [PokemonType, number][]) {
		if (!grouped[mult]) grouped[mult] = [];
		grouped[mult].push(type);
	}

	const sortedMultipliers = Object.keys(grouped)
		.map(Number)
		.sort((a, b) => b - a); // descending multiplier

	const rows: [PokemonType, number][][] = [];

	for (const mult of sortedMultipliers) {
		const types = grouped[mult];
		for (let i = 0; i < types.length; i += maxPerRow) {
			const chunk = types
				.slice(i, i + maxPerRow)
				.map((t) => [t, mult] as [PokemonType, number]);
			rows.push(chunk);
		}
	}

	return rows;
}

async function drawMultiplierRow(
	ctx: CanvasRenderingContext2D,
	row: [PokemonType, number][],
	startX: number,
	startY: number,
	cellSize: number,
	gap: number
) {
	let currentX = startX;

	for (const [type, mult] of row) {
		try {
			const icon = await getTypeIcon(type);
			const img = await loadImage(icon.sprite);

			// Maintain aspect ratio
			const aspectRatio = img.width / img.height;
			const drawWidth = cellSize * aspectRatio;
			const drawHeight = cellSize;

			ctx.drawImage(img, currentX, startY, drawWidth, drawHeight);

			// Draw multiplier below icon
			ctx.font = 'bold 16px sans-serif';
			ctx.fillStyle = multiplierColor(mult);
			ctx.textAlign = 'center';
			ctx.fillText(
				`${mult}×`,
				currentX + drawWidth / 2,
				startY + drawHeight + 14
			);

			currentX += drawWidth + gap;
		} catch (err) {
			console.error(`Failed to load icon for ${type}:`, err);
		}
	}

	return cellSize + 20; // height used by this row
}

export async function drawSummaryBlock(
	ctx: CanvasRenderingContext2D,
	label: string,
	data: Record<PokemonType, number>,
	x: number,
	y: number
) {
	const cellSize = 32;
	const gap = 8;

	// Draw the label
	ctx.font = 'bold 18px Orbitron';
	ctx.fillStyle = '#fff';
	ctx.fillText(label, x, y);

	// Only include non-neutral types
	const entries = Object.entries(data)
		.filter(([, mult]) => mult !== 1)
		.sort((a, b) => b[1] - a[1]); // sort by multiplier descending

	const rows = chunkArray(entries, 3);
	let currentY = y + 28;

	for (const row of rows) {
		// calculate starting X to center row
		const rowWidth = row.length * cellSize + (row.length - 1) * gap;
		let currentX = x + (ctx.canvas.width - x - rowWidth) / 2;

		for (const [type, mult] of row) {
			try {
				const icon = await getTypeIcon(type as PokemonType);
				const img = await loadImage(icon.sprite);

				// Maintain aspect ratio
				const aspectRatio = img.width / img.height;
				const drawHeight = cellSize;
				const drawWidth = cellSize * aspectRatio;

				// Draw icon centered vertically
				ctx.drawImage(img, currentX, currentY, drawWidth, drawHeight);

				// Draw multiplier below icon
				ctx.font = 'bold 24px sans-serif';
				ctx.fillStyle = multiplierColor(mult);
				ctx.fillText(
					`${mult}×`,
					currentX + drawWidth / 2 - 8,
					currentY + drawHeight + 14
				);

				currentX += cellSize + gap;
			} catch (err) {
				console.error(`Failed to load icon for ${type}:`, err);
			}
		}

		currentY += cellSize + 24; // move to next row
	}
}
