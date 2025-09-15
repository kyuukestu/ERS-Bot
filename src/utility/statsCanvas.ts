// First, install the required packages:
// npm install canvas @types/canvas

import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import {
	type PokemonStats,
	type ProgressBarConfig,
} from '../interface/canvasData';
export class PokemonStatsCanvas {
	private static readonly DEFAULT_CONFIG: ProgressBarConfig = {
		width: 400,
		height: 300,
		backgroundColor: '#2C2F33',
		borderColor: '#99AAB5',
		textColor: '#fff',
		fontSize: 14,
		barHeight: 20,
		barSpacing: 35,
		maxStatValue: 255,
		padding: 20,
	};

	private static readonly STAT_COLORS = {
		hp: '#FF5959',
		attack: '#F5AC78',
		defense: '#FAE078',
		specialAttack: '#9DB7F5',
		specialDefense: '#A7DB8D',
		speed: '#FA92B2',
	};

	private static readonly STAT_LABELS = {
		hp: 'HP',
		attack: 'Attack',
		defense: 'Defense',
		specialAttack: 'Sp. Attack',
		specialDefense: 'Sp. Defense',
		speed: 'Speed',
	};

	/**
	 * Creates a progress bar image for Pokemon stats with dynamic height
	 */
	static createStatsImage(
		stats: PokemonStats,
		config: Partial<ProgressBarConfig> = {}
	): AttachmentBuilder {
		const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

		// Calculate dynamic height for vertical layout
		const statsCount = Object.keys(stats).length;
		const dynamicHeight = this.calculateVerticalHeight(statsCount, finalConfig);

		const canvas = createCanvas(finalConfig.width, dynamicHeight);
		const ctx = canvas.getContext('2d');

		// Set up the canvas with dynamic height
		this.setupCanvas(ctx, finalConfig, dynamicHeight);

		// Draw the stats bars
		this.drawStatsBars(ctx, stats, finalConfig);

		// Convert to buffer and create attachment
		const buffer = canvas.toBuffer('image/png');
		return new AttachmentBuilder(buffer, { name: 'pokemon-stats.png' });
	}

	/**
	 * Creates a single stat progress bar with appropriate height
	 */
	static createSingleStatBar(
		statName: keyof PokemonStats,
		value: number,
		config: Partial<ProgressBarConfig> = {}
	): AttachmentBuilder {
		const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

		// Calculate height for single stat
		const singleStatHeight = this.calculateVerticalHeight(1, finalConfig);

		const canvas = createCanvas(finalConfig.width, singleStatHeight);
		const ctx = canvas.getContext('2d');

		this.setupCanvas(ctx, finalConfig, singleStatHeight);
		this.drawSingleStatBar(
			ctx,
			statName,
			value,
			finalConfig,
			finalConfig.padding + finalConfig.barHeight
		);

		const buffer = canvas.toBuffer('image/png');
		return new AttachmentBuilder(buffer, { name: `${statName}-stat.png` });
	}

	/**
	 * Calculate required height for vertical layout
	 */
	private static calculateVerticalHeight(
		statsCount: number,
		config: ProgressBarConfig
	): number {
		const topPadding = config.padding;
		const bottomPadding = config.padding;
		const statsHeight = (statsCount - 1) * config.barSpacing + config.barHeight;

		return topPadding + statsHeight + bottomPadding;
	}

	private static setupCanvas(
		ctx: CanvasRenderingContext2D,
		config: ProgressBarConfig,
		height: number
	): void {
		// Fill background with dynamic height
		ctx.fillStyle = config.backgroundColor;
		ctx.fillRect(0, 0, config.width, height);

		// Set font
		ctx.font = `${config.fontSize}px Arial, sans-serif`;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
	}

	private static drawStatsBars(
		ctx: CanvasRenderingContext2D,
		stats: PokemonStats,
		config: ProgressBarConfig
	): void {
		let yPosition = config.padding + config.barHeight;

		Object.entries(stats).forEach(([statKey, value]) => {
			const statName = statKey as keyof PokemonStats;
			this.drawSingleStatBar(ctx, statName, value, config, yPosition);
			yPosition += config.barSpacing;
		});
	}

	private static drawSingleStatBar(
		ctx: CanvasRenderingContext2D,
		statName: keyof PokemonStats,
		value: number,
		config: ProgressBarConfig,
		yPosition: number,
		xOffset: number = 20
	): void {
		const barWidth = 200;
		const percentage = Math.min(value / config.maxStatValue, 1);
		const fillWidth = barWidth * percentage;

		// Draw stat label
		ctx.fillStyle = config.textColor;
		ctx.fillText(this.STAT_LABELS[statName], xOffset, yPosition);

		// Draw stat value
		ctx.fillText(value.toString(), xOffset + 85, yPosition);

		// Draw background bar
		const barX = xOffset + 125;
		ctx.fillStyle = '#404040';
		ctx.fillRect(
			barX,
			yPosition - config.barHeight / 2,
			barWidth,
			config.barHeight
		);

		// Draw border
		ctx.strokeStyle = config.borderColor;
		ctx.lineWidth = 1;
		ctx.strokeRect(
			barX,
			yPosition - config.barHeight / 2,
			barWidth,
			config.barHeight
		);

		// Draw filled portion
		if (fillWidth > 0) {
			ctx.fillStyle = this.STAT_COLORS[statName];
			ctx.fillRect(
				barX + 1,
				yPosition - config.barHeight / 2 + 1,
				fillWidth - 2,
				config.barHeight - 2
			);

			// Add gradient effect
			const gradient = ctx.createLinearGradient(
				barX,
				yPosition - config.barHeight / 2,
				barX,
				yPosition + config.barHeight / 2
			);
			gradient.addColorStop(
				0,
				this.lightenColor(this.STAT_COLORS[statName], 0.3)
			);
			gradient.addColorStop(1, this.STAT_COLORS[statName]);

			ctx.fillStyle = gradient;
			ctx.fillRect(
				barX + 1,
				yPosition - config.barHeight / 2 + 1,
				fillWidth - 2,
				config.barHeight - 2
			);
		}
	}

	private static lightenColor(color: string, amount: number): string {
		// Simple color lightening function
		const hex = color.replace('#', '');
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);

		return `#${Math.min(255, Math.floor(r + (255 - r) * amount))
			.toString(16)
			.padStart(2, '0')}${Math.min(255, Math.floor(g + (255 - g) * amount))
			.toString(16)
			.padStart(2, '0')}${Math.min(255, Math.floor(b + (255 - b) * amount))
			.toString(16)
			.padStart(2, '0')}`;
	}
}

// Usage example in your embed:
export class PokemonEmbedBuilder {
	static async createPokemonEmbed(pokemonData: any) {
		const stats: PokemonStats = {
			hp: pokemonData.stats.hp,
			attack: pokemonData.stats.attack,
			defense: pokemonData.stats.defense,
			specialAttack: pokemonData.stats.special_attack,
			specialDefense: pokemonData.stats.special_defense,
			speed: pokemonData.stats.speed,
		};

		// Create the stats image with dynamic height
		const statsImage = PokemonStatsCanvas.createStatsImage(stats, {
			backgroundColor: '#36393F', // Discord dark theme color
			width: 450,
			padding: 25, // Increased padding for better appearance
		});

		const embed = new EmbedBuilder()
			.setTitle(`${pokemonData.name} Stats`)
			.setColor(0x3498db)
			.setImage('attachment://pokemon-stats.png')
			.setDescription('Base stats with visual progress bars');

		return {
			embeds: [embed],
			files: [statsImage],
		};
	}
}
