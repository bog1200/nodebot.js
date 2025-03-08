const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, PermissionsBitField, MessageFlags } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete Messages')
        .addIntegerOption(option => option.setName("number").setDescription("The number of messages").setRequired(true)),
    async execute(interaction) {
        const Embed = new EmbedBuilder().setTitle("Delete Messages").setTimestamp();
        const count = interaction.options.getInteger('number');
        if (count <= 0 || count > 99) {
            Embed.setDescription("Invalid Number").setColor(`#ff0000`);
        } else if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (botMember.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.ManageMessages)) {
                await interaction.channel.bulkDelete(count);
                Embed.setDescription(`${count} messages deleted`).setColor(`#0f3c6c`);
            } else {
                Embed.setDescription(`I don't have permission to delete messages here!`).setColor(`#ff0000`);
            }
        } else {
            Embed.setDescription("You do not have permission to use this command!").setColor(`#ff0000`);
        }
        interaction.reply({ embeds: [Embed], flags: MessageFlags.Ephemeral });
    }
}