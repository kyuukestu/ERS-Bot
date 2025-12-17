import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ALL_TYPES, type PokemonType } from '~/database/pokemonTypes';
import { getTypeIcon } from '~/ui/typeIcons';

type CombinedCanvasOptions = {
	title: string;
	offense: Record<PokemonType, number>;
	defense: Record<PokemonType, number>;
};

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
			function multiplierColor(mult: number) {
				if (mult === 0) return '#444'; // immune
				if (mult < 1) return '#4caf50'; // resist
				if (mult === 1) return '#9e9e9e'; // neutral
				if (mult === 2) return '#ff9800'; // super effective
				if (mult >= 4) return '#f44336'; // very effective
				return '#fff';
			}

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
