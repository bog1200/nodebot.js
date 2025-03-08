let {queue} = require("./play");
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the music'),
	async execute(interaction) {
		if (!queue) return interaction.reply("Nothing is playing");
		const serverQueue = queue.get(interaction.guild.id);
		serverQueue.player.pause();
 		return interaction.reply("Music paused");
	},
};