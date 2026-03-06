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
import * as fs from 'node:fs/promises'; // Use promises for async
import * as path from 'node:path';
import { initializeSQLDB } from './database/SQL/database';
import { RSSService } from './services/rss/rssSevice';

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
	console.error('❌ Error connecting to MySQL:', error);
}

class ExtendedClient extends Client {
	commands: Collection<string, CommandModule>;

	constructor() {
		super({ intents: [GatewayIntentBits.Guilds] });
		this.commands = new Collection<string, CommandModule>();
	}
}

// Create a new client instance
const client = new ExtendedClient();

interface CommandModule {
	data: { name: string };
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Recursively loads Discord command files from nested folders.
 * Only loads folders named "commands" as command collections.
 * Logs every file processed.
 */
export async function loadCommands(
	client: ExtendedClient,
	baseDir = path.join(__dirname, 'commands'),
) {
	const entries = await fs.readdir(baseDir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(baseDir, entry.name);

		if (entry.isDirectory()) {
			const helperFolders = ['common', 'embeds', 'handlers'];

			if (entry.isDirectory()) {
				if (!helperFolders.includes(entry.name)) {
					console.log(`📁 Entering folder: ${fullPath}`);
					await loadCommands(client, fullPath); // recurse
				} else {
					console.log(`📂 Skipping helper folder: ${fullPath}`);
				}
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

// Load commands when the client is ready
client.once(Events.ClientReady, async (readyClient: Client<true>) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	await loadCommands(client); // Load commands after client is ready

	const rssService = new RSSService(client);
	rssService.start();
});

// Handle interactions
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

// Log in to Discord
client.login(token || import.meta.env.token);
