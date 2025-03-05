// Require the necessary discord.js classes
import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
	type Interaction,
} from 'discord.js';
import { token } from './tsconfig.json';
import fs from 'node:fs';
import path from 'node:path';

class ExtendedClient extends Client {
	commands: Collection<string, any>;

	constructor() {
		super({ intents: [GatewayIntentBits.Guilds] });
		this.commands = new Collection();
	}
}
// Create a new client instance
const client = new ExtendedClient();

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient: Client<true>) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.ts'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module.
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = (interaction.client as ExtendedClient).commands.get(
		interaction.commandName
	);

	if (!command) {
		console.error(`Command ${interaction.commandName} not found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
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

	console.log(interaction);
});

client.on('interactionCreate', async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'pokedex') {
		const userInput = interaction.options.getString('message', true); // Get required string input
		await interaction.reply(`You searched for: ${userInput}`);
	}
});

// Log in to Discord with your client's token
client.login(token);
