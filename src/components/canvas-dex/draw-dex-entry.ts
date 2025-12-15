// src/canvas/renderSpeciesCardCanvas.ts
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { getTypeIcon } from '~/ui/typeIcons';
import type { PokemonInfo } from '~/api/dataExtraction/extractPokemonInfo';
import type { SpeciesInfo } from '~/api/dataExtraction/extractSpeciesInfo';

export async function renderSpeciesCardCanvas(
	speciesInfo: SpeciesInfo,
	pokemonInfo: PokemonInfo
) {
	const width = 900;
	const height = 1100;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	/* ───────────────────────── Background ───────────────────────── */
	ctx.fillStyle = '#1e1e1e';
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = '#ffffff';

	/* ───────────────────────── Header ───────────────────────── */
	ctx.font = 'bold 42px Orbitron';
	ctx.fillText(
		`#${String(speciesInfo.pokedex_numbers).padStart(4, '0')} ${capitalize(
			pokemonInfo.name
		)}`,
		40,
		60
	);

	/* ───────────────────────── Artwork ───────────────────────── */
	const artwork =
		pokemonInfo.sprites.other['official-artwork'].front_default ??
		pokemonInfo.sprites.front_default;

	if (artwork) {
		const img = await loadImage(artwork);
		ctx.drawImage(img, 40, 90, 360, 360);
	}

	/* ───────────────────────── Right Column (Combat Info) ───────────────────────── */
	let rightY = 120; // initial Y for column
	const gap = 16;

	ctx.font = 'bold 18px Orbitron';
	ctx.fillText('TYPES', 440, rightY);

	const typeIconsHeight = 36; // match iconHeight from drawTypeIcons
	const typePadding = 3; // match padding used in drawTypeIcons

	// Draw the icons and get the max height including padding
	const iconsDrawHeight = typeIconsHeight + typePadding * 2;
	await drawTypeIcons(ctx, pokemonInfo.types, 440, rightY + 26); // 26px below sub-header

	// Move rightY below the icons plus gap
	rightY += 26 + iconsDrawHeight + gap;

	rightY +=
		drawLabelValue(
			ctx,
			'ABILITIES',
			pokemonInfo.abilities.map(capitalize).join(', '),
			440,
			rightY,
			420
		) +
		gap * 2;

	rightY +=
		drawLabelValue(ctx, 'HEIGHT', pokemonInfo.height + ' m', 440, rightY) + gap;
	rightY +=
		drawLabelValue(ctx, 'WEIGHT', pokemonInfo.weight + ' kg', 440, rightY) +
		gap;

	/* ───────────────────────── Species Info (Two Columns) ───────────────────────── */
	let speciesY = 480;
	const colLeftX = 40;
	const colRightX = 260;
	const rowGap = 20;

	const rowHeight = Math.max(
		drawLabelValue(ctx, 'HABITAT', speciesInfo.habitat, colLeftX, speciesY),
		drawLabelValue(
			ctx,
			'EGG GROUPS',
			speciesInfo.egg_groups,
			colRightX,
			speciesY,
			260
		)
	);

	speciesY += rowHeight + rowGap;

	const rowHeight2 = Math.max(
		drawLabelValue(
			ctx,
			'GROWTH RATE',
			speciesInfo.growth_rate,
			colLeftX,
			speciesY
		),
		drawLabelValue(
			ctx,
			'CAPTURE RATE',
			`${speciesInfo.capture_rate} (${speciesInfo.capture_percentage}%)`,
			colRightX,
			speciesY
		)
	);

	speciesY += rowHeight2 + rowGap;

	/* ───────────────────────── Evolution (Full Width) ───────────────────────── */
	speciesY +=
		drawLabelValue(
			ctx,
			'EVOLUTION',
			speciesInfo.evolves_from_species,
			40,
			speciesY,
			820
		) +
		gap * 2;

	/* ───────────────────────── Base Stats ───────────────────────── */
	const statsStartY = Math.max(speciesY, rightY) + 30;

	ctx.font = 'bold 26px Orbitron';
	ctx.fillText('BASE STATS', 40, statsStartY - 16);

	const statsHeight = drawStats(ctx, pokemonInfo.stats, 40, statsStartY);

	/* ───────────────────────── Flavor Text (Always Below Stats) ───────────────────────── */
	const flavorStartY = statsStartY + statsHeight + 40;

	const englishEntries = speciesInfo.flavor_text_entries.filter(
		(e) => e.language.name === 'en'
	);

	const pool =
		englishEntries.length > 0
			? englishEntries
			: speciesInfo.flavor_text_entries;

	if (pool.length > 0) {
		const entry = pool[Math.floor(Math.random() * pool.length)];

		const flavorText =
			entry.flavor_text.replace(/\n|\f/g, ' ').replace(/\s+/g, ' ').trim() +
			` — ${entry.version.name.toUpperCase()}`;

		ctx.font = '20px serif';
		wrapText(ctx, flavorText, 40, flavorStartY, 820, 28);
	}

	return canvas.toBuffer('image/png');
}

/* ───────────────────────── Helpers ───────────────────────── */

function drawLabelValue(
	ctx,
	label: string,
	value: string,
	x: number,
	y: number,
	maxWidth = 300
) {
	ctx.font = 'bold 18px Orbitron';
	ctx.fillText(label, x, y);

	ctx.font = '22px sans-serif';
	const height = wrapText(ctx, value, x, y + 26, maxWidth, 26);
	return height + 26;
}

function drawStats(ctx, stats, x, y) {
	const barWidth = 260;
	const barHeight = 18;
	const lineHeight = 36;

	stats.forEach((s, i) => {
		const offsetY = y + i * lineHeight;
		const name = s.stat.name.replace('-', ' ').toUpperCase();
		const value = s.base_stat;

		ctx.font = '18px sans-serif';
		ctx.fillText(name, x, offsetY);

		ctx.fillStyle = '#333';
		ctx.fillRect(x + 160, offsetY - 14, barWidth, barHeight);

		ctx.fillStyle = '#4ecdc4';
		ctx.fillRect(
			x + 160,
			offsetY - 14,
			Math.min(barWidth, value * 1.5),
			barHeight
		);

		ctx.fillStyle = '#fff';
		ctx.fillText(value.toString(), x + 430, offsetY);
	});

	return stats.length * lineHeight;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
	const words = text.split(' ');
	let line = '';
	let lines = 1;

	for (const word of words) {
		const test = line + word + ' ';
		if (ctx.measureText(test).width > maxWidth) {
			ctx.fillText(line, x, y);
			line = word + ' ';
			y += lineHeight;
			lines++;
		} else {
			line = test;
		}
	}
	ctx.fillText(line, x, y);
	return lines * lineHeight;
}

function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function drawTypeIcons(
	ctx: CanvasRenderingContext2D,
	types: string[],
	startX: number,
	startY: number
) {
	const iconHeight = 36; // height for icon
	const padding = 3; // padding around icon
	const gap = 10;
	let currentX = startX;

	for (let i = 0; i < types.length; i++) {
		const typeName = types[i].toLowerCase().trim();

		try {
			const sprite = await getTypeIcon(typeName);
			const img = await loadImage(sprite.sprite);

			// Maintain aspect ratio
			const aspectRatio = img.width / img.height;
			const drawWidth = iconHeight * aspectRatio;

			ctx.drawImage(
				img,
				currentX + padding,
				startY + padding,
				drawWidth,
				iconHeight
			);

			// Move X for next type
			currentX += drawWidth + padding * 2 + gap;
		} catch (err) {
			console.error(`Failed to load type icon for ${typeName}:`, err);
			ctx.fillStyle = '#ffffff';
			ctx.font = '18px sans-serif';
			ctx.fillText(typeName, currentX, startY + iconHeight / 2 + 6);
			currentX += ctx.measureText(typeName).width + gap;
		}
	}

	return iconHeight + padding * 2;
}
