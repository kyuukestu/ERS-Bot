// src/canvas/renderSpeciesCardCanvas.ts
import { createCanvas } from '@napi-rs/canvas';
// or: import { createCanvas, loadImage } from 'canvas';

export async function renderSpeciesCardCanvas(speciesInfo) {
	const width = 900;
	const height = 550;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	// Background
	ctx.fillStyle = '#1e1e1e';
	ctx.fillRect(0, 0, width, height);

	// Header
	ctx.fillStyle = '#ffffff';
	ctx.font = 'bold 48px Orbitron';
	ctx.fillText(
		`#${speciesInfo.pokedex_numbers} — ${speciesInfo.generation.toUpperCase()}`,
		40,
		70
	);

	// Gen emoji
	ctx.font = '36px sans-serif';
	ctx.fillText(speciesInfo.gen_emoji, 40, 120);

	// Evolves from
	ctx.font = '28px sans-serif';
	ctx.fillText(speciesInfo.evolves_from_species, 40, 180);

	// Habitat
	ctx.fillText(`Habitat: ${speciesInfo.habitat}`, 40, 230);

	// Egg groups
	ctx.fillText(`Egg Groups: ${speciesInfo.egg_groups}`, 40, 280);

	// Growth rate + capture rate
	ctx.fillText(`Growth: ${speciesInfo.growth_rate}`, 40, 330);
	ctx.fillText(
		`Capture Rate: ${speciesInfo.capture_rate} (${speciesInfo.capture_percentage}%)`,
		40,
		380
	);

	// Flavor text (wrapped)
	const flavor = speciesInfo.flavor_text_entries?.[0]?.flavor_text
		.replace(/\f/g, ' ')
		.replace(/\n/g, ' ');

	wrapText(ctx, flavor, 40, 440, 820, 28);

	return canvas.toBuffer('image/png');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
	const words = text.split(' ');
	let line = '';

	for (let i = 0; i < words.length; i++) {
		const testLine = line + words[i] + ' ';
		const { width } = ctx.measureText(testLine);                    

		if (width > maxWidth && i > 0) {
			ctx.fillText(line, x, y);
			line = words[i] + ' ';
			y += lineHeight;
		} else {
			line = testLine;
		}
	}
	ctx.fillText(line, x, y);
}
