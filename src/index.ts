// index.ts
import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
	type Interaction,
} from 'discord.js';
import { token, mongoURI, adminURI } from './config.json';
import * as fs from 'node:fs/promises'; // Use promises for async
import * as path from 'node:path';
import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		await mongoose.connect(mongoURI || adminURI);
		console.log('✅ Connected to MongoDB');
	} catch (error) {
		console.error('❌ Error connecting to MongoDB:', error);
		process.exit(1); // Exit with failure status code
	}
};

try {
	await connectDB();
} catch (error) {
	console.error('❌ Error connecting to MongoDB:', error);
}

class ExtendedClient extends Client {
	commands: Collection<string, any>;

	constructor() {
		super({ intents: [GatewayIntentBits.Guilds] });
		this.commands = new Collection();
	}
}

// Create a new client instance
const client = new ExtendedClient();

// Load commands dynamically
async function loadCommands(dirPath = path.join(__dirname, 'commands')) {
	const entries = await fs.readdir(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			// Recursively load commands from subfolders
			await loadCommands(fullPath);
		} else if (entry.isFile() && entry.name.endsWith('.ts')) {
			try {
				const commandImport = await import(fullPath);
				const commandModule = commandImport.default;

				if ('data' in commandModule && 'execute' in commandModule) {
					client.commands.set(commandModule.data.name, commandModule);
					console.log(`Loaded command: ${commandModule.data.name}`);
				} else {
					console.warn(
						`[WARNING] The command at ${fullPath} is missing a required "data" or "execute" property.`
					);
				}
			} catch (error) {
				console.error(`[ERROR] Failed to load command at ${fullPath}:`, error);
			}
		}
	}
}

// Load commands when the client is ready
client.once(Events.ClientReady, async (readyClient: Client<true>) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
	await loadCommands(); // Load commands after client is ready
});

// Handle interactions
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = (interaction.client as any).commands.get(
		interaction.commandName
	);

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
