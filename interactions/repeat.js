const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");
let { queue } = require("./play");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('repeat')
		.setDescription('Toggle repeat'),
	async execute(interaction) {
		await interaction.deferReply();
		if (!queue) return interaction.reply("Nothing is playing");
		const serverQueue = queue.get(interaction.guild.id);
		if (!serverQueue) return interaction.reply("Nothing is playing");
		if (!serverQueue.repeat) {
			serverQueue.repeat = true;
			await interaction.editReply({ embeds: [new MessageEmbed().setColor('#00ff00').setTitle('Repeat').setDescription("Repeat enabled 🔂").setTimestamp()] });
		}
		else {
			serverQueue.repeat = false;
			await interaction.editReply({ embeds: [new MessageEmbed().setColor('#ff0000').setTitle('Repeat').setDescription("Repeat disabled ⏯️").setTimestamp()] });
		}
	}
}