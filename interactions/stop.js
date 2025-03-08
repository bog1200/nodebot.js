let {queue} = require("./play");
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop all songs in the queue!'),
	async execute(interaction) {
		if (!queue) return interaction.reply("Nothing in queue");
		const serverQueue = queue.get(interaction.guild.id);
		queue.delete(interaction.guild.id);
		serverQueue.player.stop();
 		serverQueue.connection.destroy();
 		return interaction.reply("Music stopped");
	},
};