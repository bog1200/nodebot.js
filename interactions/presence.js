const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, MessageFlags } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('presence')
        .setDescription('Change bot presence')
        .addStringOption(option => option.setName("message").setDescription("Bot activity message").setRequired(true))
        .addStringOption(option => option.setName("type").setDescription("Bot activity type").addChoices({ name: 'Playing', value: 'PLAYING' }, { name: 'Streaming', value: 'STREAMING' }).setRequired(true))
        .addStringOption(option => option.setName("status").setDescription("Bot status").addChoices({ name: 'Online', value: 'online' }, { name: 'DND', value: 'dnd' }, { name: 'Idle', value: 'idle' }, { name: 'Offline', value: 'offline' }).setRequired(true))
        .addStringOption(option => option.setName("link").setDescription("Twitch live link")),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (interaction.user === "239136395665342474") {
            const message = interaction.options.getString('message');
            const type = interaction.options.getString('type');
            const status = interaction.options.getString('status');
            const link = interaction.options.getString('link');
            if (link) { interaction.client.user.setPresence({ activities: [{ name: message, type: type, url: link, status: status }] }) }
            else { interaction.client.user.setPresence({ activities: [{ name: message, type: type, status: status }] }) }
            const Embed = new EmbedBuilder().setTitle("Bot Presence").setTimestamp()
                .addField("Presence", message);
            if (type) Embed.addField("Type", type);
            if (status) Embed.addField("Status", status);
            if (link) Embed.addField("Link", link);

            interaction.editReply({ embeds: [Embed], flags: MessageFlags.Ephemeral })

        }
    }
}