import { createCanvas, CanvasRenderingContext2D } from 'canvas';
import { AttachmentBuilder } from 'discord.js';
import {
	type PokemonStats,
	type ProgressBarConfig,
} from '../interface/canvasData';

export class PokemonStatsCanvas {
	private static readonly DEFAULT_CONFIG: ProgressBarConfig = {
		width: 450,
		height: 300, // fallback only, not trusted anymore
		backgroundColor: '#2C2F33',
		borderColor: '#99AAB5',
		textColor: '#fff',
		fontSize: 14,
		barHeight: 18,
		barSpacing: 34,
		maxStatValue: 255,
		padding: 20,
	};

	private static readonly STAT_COLORS = {
		hp: '#FF5959',
		attack: '#F5AC78',
		defense: '#FAE078',
		spAttack: '#9DB7F5',
		spDefense: '#A7DB8D',
		speed: '#FA92B2',
	};

	private static readonly STAT_LABELS = {
		hp: 'HP',
		attack: 'ATK',
		defense: 'DEF',
		spAttack: 'SP. ATK',
		spDefense: 'SP. DEF',
		speed: 'SPD',
	};

	// -----------------------------
	// PUBLIC API
	// -----------------------------

	static createStatsImage(
		stats: PokemonStats,
		config: Partial<ProgressBarConfig> = {},
	): AttachmentBuilder {
		const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

		const layout = this.buildLayout(stats, finalConfig);

		const canvas = createCanvas(finalConfig.width, layout.height);
		const ctx = canvas.getContext('2d');

		this.setupCanvas(ctx, finalConfig, layout.height);
		this.drawStats(ctx, stats, finalConfig, layout);

		const buffer = canvas.toBuffer('image/png');
		return new AttachmentBuilder(buffer, { name: 'pokemon-stats.png' });
	}

	static createSingleStatBar(
		statName: keyof PokemonStats,
		value: number,
		config: Partial<ProgressBarConfig> = {},
	): AttachmentBuilder {
		const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

		const layout = this.buildLayout(
			{ [statName]: value } as Partial<PokemonStats>,
			finalConfig,
		);

		const canvas = createCanvas(finalConfig.width, layout.height);
		const ctx = canvas.getContext('2d');

		this.setupCanvas(ctx, finalConfig, layout.height);
		this.drawSingleStat(ctx, statName, value, finalConfig, layout.rows[0].y);

		const buffer = canvas.toBuffer('image/png');
		return new AttachmentBuilder(buffer, { name: `${statName}.png` });
	}

	// -----------------------------
	// LAYOUT ENGINE
	// -----------------------------

	private static buildLayout(
		stats: Partial<PokemonStats>,
		config: ProgressBarConfig,
	) {
		const entries = Object.entries(stats) as Array<
			[keyof PokemonStats, number]
		>;

		const rowHeight = config.barHeight + 16;
		const gap = config.barSpacing;

		const rows = entries.map((_, i) => {
			const y = config.padding + i * gap + config.barHeight;
			return { y };
		});

		const height =
			config.padding * 2 +
			entries.length * rowHeight +
			(entries.length - 1) * (gap - rowHeight);

		return {
			rows,
			height,
		};
	}

	// -----------------------------
	// DRAWING
	// -----------------------------

	private static setupCanvas(
		ctx: CanvasRenderingContext2D,
		config: ProgressBarConfig,
		height: number,
	): void {
		ctx.fillStyle = config.backgroundColor;
		ctx.fillRect(0, 0, config.width, height);

		ctx.font = `${config.fontSize}px Arial`;
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'left';
	}

	private static drawStats(
		ctx: CanvasRenderingContext2D,
		stats: PokemonStats,
		config: ProgressBarConfig,
		layout: { rows: { y: number }[] },
	) {
		const entries = Object.entries(stats) as Array<
			[keyof PokemonStats, number]
		>;

		entries.forEach(([key, value], i) => {
			this.drawSingleStat(ctx, key, value, config, layout.rows[i].y);
		});
	}

	private static drawSingleStat(
		ctx: CanvasRenderingContext2D,
		stat: keyof PokemonStats,
		value: number,
		config: ProgressBarConfig,
		y: number,
		xOffset = 20,
	) {
		const barWidth = 240;
		const barX = xOffset + 130;

		const pct = Math.min(value / config.maxStatValue, 1);
		const fillWidth = barWidth * pct;

		// Label
		ctx.fillStyle = config.textColor;
		ctx.fillText(this.STAT_LABELS[stat], xOffset, y);

		// Value
		ctx.fillText(String(value), xOffset + 90, y);

		// Background bar
		ctx.fillStyle = '#404040';
		ctx.fillRect(barX, y - config.barHeight / 2, barWidth, config.barHeight);

		// Border
		ctx.strokeStyle = config.borderColor;
		ctx.strokeRect(barX, y - config.barHeight / 2, barWidth, config.barHeight);

		// Fill
		if (fillWidth > 0) {
			ctx.fillStyle = this.STAT_COLORS[stat];
			ctx.fillRect(
				barX + 1,
				y - config.barHeight / 2 + 1,
				fillWidth - 2,
				config.barHeight - 2,
			);
		}
	}
}
