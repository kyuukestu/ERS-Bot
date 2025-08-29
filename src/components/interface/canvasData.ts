// Types for Pokemon stats
interface PokemonStats {
	hp: number;
	attack: number;
	defense: number;
	specialAttack: number;
	specialDefense: number;
	speed: number;
}

// Configuration for the progress bar appearance
interface ProgressBarConfig {
	width: number;
	height: number;
	backgroundColor: string;
	borderColor: string;
	textColor: string;
	fontSize: number;
	barHeight: number;
	barSpacing: number;
	maxStatValue: number; // Usually 255 for Pokemon stats
	padding: number; // Padding around the canvas
}

export type { PokemonStats, ProgressBarConfig };
