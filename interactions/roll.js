const { SlashCommandBuilder } = require('discord.js');
const {EmbedBuilder} = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll a die')
		.addIntegerOption(option => option.setName("faces").setDescription("The number of faces on the die")),
	async execute(interaction) {
	const faces=interaction.options.getInteger('faces')||6;
    interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff00ff').setTitle(`Roll (${faces} sides die)`).setDescription(`${Math.floor(Math.random()*faces)+1}`).setTimestamp()]})
  }
}