const { SlashCommandBuilder } = require('discord.js');
const {MessageEmbed} = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Shows link to invite bot'),
	async execute(interaction) {
        interaction.reply({ 
            embeds: [new MessageEmbed().setColor('#e87a13').setTitle('Invite').setDescription('[Click here to invite bot](https://bot.romail.ml/invite)').setTimestamp()],
            ephemeral: true
    });
}}