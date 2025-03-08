const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sys')
        .setDescription('Show system info'),
    async execute(interaction) {
        if (interaction.user.id !== "239136395665342474") {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } else {
            const used = process.memoryUsage();
            await interaction.reply({ content: `System info:`, flags: MessageFlags.Ephemeral });
            for (let key in used) {
                await interaction.followUp({ content: `[RAM] ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`, flags: MessageFlags.Ephemeral });
            }
        }
    }
}