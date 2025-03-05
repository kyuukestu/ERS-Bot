import { REST, Routes } from 'discord.js';
import { token, clientId, guildId } from './config.json';

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		console.log('Removing all commands...');
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: [],
		});
		console.log('Successfully removed commands.');
	} catch (error) {
		console.error(error);
	}
})();
