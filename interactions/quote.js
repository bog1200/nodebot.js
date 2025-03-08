const { SlashCommandBuilder } = require('discord.js');
const {EmbedBuilder} = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Shows quote-formatted message')
        .addStringOption(option => option.setName("quote").setDescription("The text to quote").setRequired(true)),
	async execute(interaction) { 
        interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff00ff').setTitle('Quote').setDescription(interaction.options.getString('quote')).setTimestamp()]});
    }
}