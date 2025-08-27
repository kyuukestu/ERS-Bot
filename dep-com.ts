// deploy-commands.ts
import { REST, Routes } from 'discord.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { clientId, guildId, outbackguildId, token } from './config.json';

const commands: any[] = [];

// Grab all the command folders from the commands directory
const foldersPath = path.join(__dirname, './src/commands'); // Align with index.ts
const commandFolders = await fs.readdir(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = (await fs.readdir(commandsPath)).filter((file: string) =>
		file.endsWith('.ts')
	);

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		try {
			const command = await import(filePath); // Use dynamic import for ES Modules
			if ('data' in command.default && 'execute' in command.default) {
				commands.push(command.default.data.toJSON());
				console.log(`Prepared command: ${command.default.data.name}`);
			} else {
				console.warn(
					`[WARNING] The command at ${filePath} is missing "data" or "execute".`
				);
			}
		} catch (error) {
			console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy commands
(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		);

		// Deploy to first guild
		const data: any = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{
				body: commands,
			}
		);

		// Deploy to second guild (outbackguildId)
		const dataO: any = await rest.put(
			Routes.applicationGuildCommands(clientId, outbackguildId),
			{ body: commands }
		);

		console.log(
			`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.\n` +
				`Successfully reloaded ${dataO.length} application (/) commands for guild ${outbackguildId}.`
		);
	} catch (error) {
		console.error('Error deploying commands:', error);
	}
})();
