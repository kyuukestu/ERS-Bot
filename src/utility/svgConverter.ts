// utilities/svgConverter.ts
import * as fs from 'fs';
import * as path from 'path';
// You'll need to install: npm install sharp
import sharp from 'sharp';

export class SVGConverter {
	/**
	 * Convert SVG files to PNG
	 * @param svgFolderPath Path to folder containing SVG files
	 * @param outputFolderPath Path where PNG files will be saved
	 * @param size Size of output PNG (default 64x64)
	 */
	static async convertSVGsToPNG(
		svgFolderPath: string,
		outputFolderPath: string,
		size: number = 64
	): Promise<void> {
		// Create output directory if it doesn't exist
		if (!fs.existsSync(outputFolderPath)) {
			fs.mkdirSync(outputFolderPath, { recursive: true });
		}

		const files = fs.readdirSync(svgFolderPath);
		const svgFiles = files.filter((file) => file.endsWith('.svg'));

		console.log(`Converting ${svgFiles.length} SVG files to PNG...`);

		for (const file of svgFiles) {
			try {
				const inputPath = path.join(svgFolderPath, file);
				const outputFileName = path.parse(file).name + '.png';
				const outputPath = path.join(outputFolderPath, outputFileName);

				await sharp(inputPath).resize(size, size).png().toFile(outputPath);

				console.log(`✅ Converted ${file} → ${outputFileName}`);
			} catch (error) {
				console.error(`❌ Failed to convert ${file}:`, error);
			}
		}

		console.log('🎉 Conversion complete!');
	}
}

// Usage example:
await SVGConverter.convertSVGsToPNG(
	'../../typeSVG', // Input folder with SVGs
	'../../typePNG', // Output folder for PNGs
	64 // Size in pixels
);
