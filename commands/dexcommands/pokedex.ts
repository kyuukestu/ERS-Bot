const { PokemonClient } = require('pokenode-ts');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pokedex')
		.setDescription('Search for a Pokémon by name and get its information.')
		.addStringOption((option: any) =>
			option
				.setName('pokemon')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		),

	async execute(interaction: any) {
		const api = new PokemonClient();
		const pokemonName = interaction.options.getString('pokemon');

		// Ensure the user provided a valid name
		if (!pokemonName) {
			return interaction.reply({
				content: '❌ You must provide a Pokémon name!',
				ephemeral: true,
			});
		}

		function wait(ms: number) {
			return new Promise((resolve) => setTimeout(resolve, ms));
		}

		try {
			console.log(interaction.options.data);

			await interaction.deferReply(); // Acknowledge first

			await wait(500); // Wait 500ms before calling the API
			const data = await api.getPokemonByName(pokemonName.toLowerCase());
			await interaction.editReply(`Pokémon found: ${data.name}`);

			// Extract key info
			const name = data.name.toUpperCase();
			const types = data.types.map((t: any) => `\`${t.type.name}\``).join(', ');
			const abilities = data.abilities
				.map((a: any) => `\`${a.ability.name}\``)
				.join(', ');
			const height = (data.height / 10).toFixed(1); // Convert decimeters to meters
			const weight = (data.weight / 10).toFixed(1); // Convert hectograms to kg
			const stats = data.stats
				.map((s: any) => `**${s.stat.name}**: ${s.base_stat}`)
				.join('\n');

			// Pokémon sprite (official front default)
			const sprite =
				data.sprites.other['official-artwork'].front_default ||
				data.sprites.front_default;

			// Create an embed
			const embed = new EmbedBuilder()
				.setColor('#FFCC00')
				.setTitle(`Pokédex Entry: ${name}`)
				.setThumbnail(sprite)
				.addFields(
					{ name: 'Type(s)', value: types, inline: true },
					{ name: 'Abilities', value: abilities, inline: true },
					{ name: 'Height', value: `${height} m`, inline: true },
					{ name: 'Weight', value: `${weight} kg`, inline: true },
					{ name: 'Base Stats', value: stats }
				)
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL(),
				});

			// Reply with the embed
			await interaction.reply({ embeds: [embed] });
		} catch (error) {
			await interaction.reply(
				`❌ Error: Pokémon not found. Please check the name.`
			);
		}
	},
};
