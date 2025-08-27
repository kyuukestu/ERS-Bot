// index.ts
import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
	type Interaction,
} from 'discord.js';
import { token } from '../config.json';
import * as fs from 'node:fs/promises'; // Use promises for async
import * as path from 'node:path';

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
async function loadCommands() {
	const foldersPath = path.join(__dirname, 'commands');
	const commandFolders = await fs.readdir(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = (await fs.readdir(commandsPath)).filter(
			(file: string) => file.endsWith('.ts')
		);

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			try {
				const command = await import(filePath); // Dynamic import for ES Modules
				// Access the default export
				const commandModule = command.default;
				if ('data' in commandModule && 'execute' in commandModule) {
					client.commands.set(commandModule.data.name, commandModule);
					console.log(`Loaded command: ${commandModule.data.name}`);
				} else {
					console.warn(
						`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
					);
				}
			} catch (error) {
				console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
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
client.login(token);
