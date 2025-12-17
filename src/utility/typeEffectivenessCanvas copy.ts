import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ALL_TYPES, type PokemonType } from '~/database/pokemonTypes';
import { getTypeIcon } from '~/ui/typeIcons';

export function categorizeEffectiveness(data: Record<PokemonType, number>) {
	const result = {
		weak: [] as PokemonType[],
		resist: [] as PokemonType[],
		immune: [] as PokemonType[],
		strong: [] as PokemonType[],
		weakOffense: [] as PokemonType[],
		noEffect: [] as PokemonType[],
	};

	for (const [type, mult] of Object.entries(data) as [PokemonType, number][]) {
		if (mult === 0) result.immune.push(type);
		else if (mult > 1) result.weak.push(type);
		else if (mult < 1) result.resist.push(type);
	}

	return result;
}

export async function renderCombinedTypeEffectivenessCanvas({
	title,
	offense,
	defense,
	detailed = false,
}: {
	title: string;
	offense: Record<PokemonType, number>;
	defense: Record<PokemonType, number>;
	detailed?: boolean;
}) {
	/* ───────────────────────── Layout Config ───────────────────────── */

	const cols = 6;
	const cellSize = detailed ? 80 : 64;
	const iconHeight = detailed ? 36 : 28;
	const headerHeight = 80;
	const sectionGap = 28;

	const rows = Math.ceil(ALL_TYPES.length / cols);

	const gridHeight = rows * cellSize;
	const summaryHeight = 260;

	const width = cols * cellSize;
	const height = headerHeight + summaryHeight + gridHeight * 2 + sectionGap * 3;

	/* ───────────────────────── Canvas Setup ───────────────────────── */

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = '#1e1e1e';
	ctx.fillRect(0, 0, width, height);

	ctx.fillStyle = '#ffffff';

	/* ───────────────────────── Title ───────────────────────── */

	ctx.font = 'bold 30px Orbitron';
	ctx.fillText(title, 16, 48);

	/* ───────────────────────── Summary (Top) ───────────────────────── */

	let cursorY = headerHeight;

	drawSummaryBlock(
		ctx,
		'OFFENSE (Best Multiplier)',
		offense,
		16,
		cursorY,
		width - 32
	);

	cursorY += summaryHeight / 2;

	drawSummaryBlock(ctx, 'DEFENSE (Combined)', defense, 16, cursorY, width - 32);

	cursorY += summaryHeight / 2 + sectionGap;

	/* ───────────────────────── OFFENSE GRID ───────────────────────── */

	ctx.font = 'bold 22px Orbitron';
	ctx.fillText('OFFENSE', 16, cursorY - 8);

	await drawGrid(
		ctx,
		offense,
		0,
		cursorY,
		cellSize,
		iconHeight,
		cols,
		detailed
	);

	cursorY += gridHeight + sectionGap;

	/* ───────────────────────── DEFENSE GRID ───────────────────────── */

	ctx.font = 'bold 22px Orbitron';
	ctx.fillText('DEFENSE', 16, cursorY - 8);

	await drawGrid(
		ctx,
		defense,
		0,
		cursorY,
		cellSize,
		iconHeight,
		cols,
		detailed
	);

	return canvas.toBuffer('image/png');
}

/* ───────────────────────── Helpers ───────────────────────── */

function drawSummaryBlock(
	ctx: CanvasRenderingContext2D,
	label: string,
	data: Record<PokemonType, number>,
	x: number,
	y: number,
	width: number
) {
	ctx.font = 'bold 18px Orbitron';
	ctx.fillText(label, x, y);

	const strong = Object.entries(data)
		.filter(([, v]) => v >= 2)
		.sort((a, b) => b[1] - a[1])
		.map(([k, v]) => `${k.toUpperCase()} (${v}×)`);

	const weak = Object.entries(data)
		.filter(([, v]) => v > 0 && v < 1)
		.sort((a, b) => a[1] - b[1])
		.map(([k, v]) => `${k.toUpperCase()} (${v}×)`);

	ctx.font = '16px sans-serif';

	ctx.fillText(
		`Strong vs: ${strong.length ? strong.join(', ') : 'None'}`,
		x,
		y + 26
	);

	ctx.fillText(`Weak vs: ${weak.length ? weak.join(', ') : 'None'}`, x, y + 48);
}

async function drawGrid(
	ctx: CanvasRenderingContext2D,
	data: Record<PokemonType, number>,
	startX: number,
	startY: number,
	cellSize: number,
	iconHeight: number,
	cols: number,
	detailed: boolean
) {
	for (let i = 0; i < ALL_TYPES.length; i++) {
		const type = ALL_TYPES[i];
		const mult = data[type];

		const x = startX + (i % cols) * cellSize;
		const y = startY + Math.floor(i / cols) * cellSize;

		ctx.fillStyle = multiplierColor(mult);
		ctx.fillRect(x, y, cellSize, cellSize);

		const icon = await getTypeIcon(type);
		const img = await loadImage(icon.sprite);

		const aspect = img.width / img.height;
		const drawWidth = iconHeight * aspect;

		ctx.drawImage(
			img,
			x + (cellSize - drawWidth) / 2,
			y + (cellSize - iconHeight) / 2,
			drawWidth,
			iconHeight
		);

		if (detailed) {
			ctx.font = 'bold 16px sans-serif';
			ctx.fillStyle = '#fff';
			ctx.fillText(`${mult}×`, x + 6, y + cellSize - 6);
		}
	}
}

function multiplierColor(mult: number) {
	if (mult === 0) return '#333'; // immune
	if (mult < 1) return '#1b5e20'; // resist
	if (mult === 1) return '#2b2b2b'; // neutral
	if (mult === 2) return '#ff9800'; // super effective
	return '#b71c1c'; // 4×+
}
