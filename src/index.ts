// index.ts
import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
	type Interaction,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { token } from './config.json';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { initializeSQLDB } from './database/SQL/database';
import { RSSService } from './services/rss/rssSevice';

// --------------------------------------------------------
// Process-level guards — prevent crash loops from
// hammering the Discord gateway and triggering shard limits
// --------------------------------------------------------

process.on('unhandledRejection', (err) => {
	console.error('Unhandled rejection:', err);
	// Log but do NOT exit — keep the bot alive
});

process.on('uncaughtException', (err) => {
	console.error('Uncaught exception:', err);
	// Log but do NOT exit — keep the bot alive
});

process.on('SIGTERM', async () => {
	console.log('SIGTERM received — shutting down gracefully');
	await client.destroy();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('SIGINT received — shutting down gracefully');
	await client.destroy();
	process.exit(0);
});

// --------------------------------------------------------
// Database
// --------------------------------------------------------

const connectDB = async () => {
	try {
		await initializeSQLDB();
	} catch (error) {
		console.error('❌ SQL Initializing Failed:', error);
	}
};

try {
	await connectDB();
} catch (error) {
	console.error('❌ Error connecting to database:', error);
}

// --------------------------------------------------------
// Client
// --------------------------------------------------------

interface CommandModule {
	data: { name: string };
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

class ExtendedClient extends Client {
	commands: Collection<string, CommandModule>;

	constructor() {
		super({
			intents: [GatewayIntentBits.Guilds],
			rest: {
				retries: 3,
				timeout: 15_000,
			},
			failIfNotExists: false,
		});
		this.commands = new Collection<string, CommandModule>();
	}
}

const client = new ExtendedClient();

// --------------------------------------------------------
// Shard event logging
// --------------------------------------------------------

client.on('shardDisconnect', (event, shardID) => {
	console.warn(`⚠️ Shard ${shardID} disconnected:`, event);
});

client.on('shardReconnecting', (shardID) => {
	console.log(`🔄 Shard ${shardID} reconnecting...`);
});

client.on('shardResume', (shardID, replayedEvents) => {
	console.log(
		`✅ Shard ${shardID} resumed — replayed ${replayedEvents} events`,
	);
});

client.on('shardError', (err, shardID) => {
	console.error(`❌ Shard ${shardID} error:`, err);
});

// --------------------------------------------------------
// Command loader
// --------------------------------------------------------

export async function loadCommands(
	client: ExtendedClient,
	baseDir = path.join(__dirname, 'commands'),
) {
	const entries = await fs.readdir(baseDir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(baseDir, entry.name);

		if (entry.isDirectory()) {
			const helperFolders = ['common', 'embeds', 'handlers'];
			if (!helperFolders.includes(entry.name)) {
				console.log(`📁 Entering folder: ${fullPath}`);
				await loadCommands(client, fullPath);
			} else {
				console.log(`📂 Skipping helper folder: ${fullPath}`);
			}
		} else if (entry.isFile() && entry.name.endsWith('.ts')) {
			console.log(`📄 Processing file: ${fullPath}`);
			try {
				const commandImport = await import(fullPath);
				const commandModule: CommandModule = commandImport.default;
				if ('data' in commandModule && 'execute' in commandModule) {
					client.commands.set(commandModule.data.name, commandModule);
					console.log(`✅ Loaded command: ${commandModule.data.name}`);
				} else {
					console.warn(`⚠️ Skipped file (not a command): ${fullPath}`);
				}
			} catch (error) {
				console.error(`❌ Failed to load file: ${fullPath}`, error);
			}
		}
	}
}

// --------------------------------------------------------
// Ready — only fires once, guards against duplicate RSS
// service initialisation on reconnect
// --------------------------------------------------------

let rssService: RSSService | null = null;

client.once(Events.ClientReady, async (readyClient: Client<true>) => {
	console.log(`✅ Ready! Logged in as ${readyClient.user.tag}`);

	await loadCommands(client);

	// Guard: only ever start one RSS service instance
	// regardless of how many times the bot reconnects
	if (!rssService) {
		rssService = new RSSService(client);
		await rssService.start();
	}
});

// --------------------------------------------------------
// Interaction handler
// --------------------------------------------------------

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const extendedClient = interaction.client as ExtendedClient;
	const command = extendedClient.commands.get(interaction.commandName);

	if (!command) {
		console.error(`Command ${interaction.commandName} not found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}:`, error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

// --------------------------------------------------------
// Login
// --------------------------------------------------------

client.login(token || import.meta.env.token);
