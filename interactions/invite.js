const { SlashCommandBuilder, MessageFlags} = require('discord.js');
const {EmbedBuilder} = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Shows link to invite bot'),
	async execute(interaction) {
        interaction.reply({
            embeds: [new EmbedBuilder().setColor(`#e87a13`).setTitle('Invite').setDescription('[Click here to invite bot](https://bot.romail.ml/invite)').setTimestamp()],
            flags: MessageFlags.Ephemeral
    });
}}