// deploy-commands.ts
import { REST, Routes } from 'discord.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
	clientId,
	guildId,
	outbackguildId,
	KalosId,
	syncId,
	token,
	mhapokeId,
} from './src/config.json';

const commands: any[] = [];

// Grab all the command folders from the commands directory
const foldersPath = path.join(__dirname, './src/commands'); // Align with index.ts
const commandFolders = await fs.readdir(foldersPath);
async function loadCommands(dirPath = path.join(__dirname, './src/commands')) {
	const entries = await fs.readdir(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			// Recursively process subfolders
			await loadCommands(fullPath);
		} else if (entry.isFile() && entry.name.endsWith('.ts')) {
			try {
				const imported = await import(fullPath);
				const commandModule = imported.default;

				if ('data' in commandModule && 'execute' in commandModule) {
					commands.push(commandModule.data.toJSON());
					console.log(`Prepared command: ${commandModule.data.name}`);
				} else {
					console.warn(
						`[WARNING] The command at ${fullPath} is missing "data" or "execute".`
					);
				}
			} catch (error) {
				console.error(`[ERROR] Failed to load command at ${fullPath}:`, error);
			}
		}
	}
}

await loadCommands();

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

		// Deploy to third guild (syncId)
		const data1: any = await rest.put(
			Routes.applicationGuildCommands(clientId, syncId),
			{ body: commands }
		);

		// Deploy to foruth guild (syncId)
		const data2: any = await rest.put(
			Routes.applicationGuildCommands(clientId, KalosId),
			{ body: commands }
		);

		// Deploy to fifth guild (mhapokeid)
		const data3: any = await rest.put(
			Routes.applicationGuildCommands(clientId, mhapokeId),
			{ body: commands }
		);

		console.log(
			`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.\n` +
				`Successfully reloaded ${dataO.length} application (/) commands for guild ${outbackguildId}.` +
				`\nSuccessfully reloaded ${data1.length} application (/) commands for guild ${syncId}.` +
				`\nSuccessfully reloaded ${data2.length} application (/) commands for guild ${KalosId}.` +
				`\nSuccessfully reloaded ${data3.length} application (/) commands for guild ${mhapokeId}.`
		);
	} catch (error) {
		console.error('Error deploying commands:', error);
	}
})();
