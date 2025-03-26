// parametru: nume si te lasa sa-l stergi

const { SlashCommandBuilder } = require('discord.js');
const db = require("../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('plist')
        .setDescription('Get a podcast from the database'),

    async execute(interaction) {
        let message = '';

        try {
            const results = await db.query(
                `SELECT * FROM podcasts`
            );

            for (const result of results) {
                 message += `Podcast **${result.name}** exists with uri: ${result.uri}\n`;

            }
            await interaction.reply(message);

        } catch (error) {
            console.error(error);
            await interaction.reply('❌ Database error occurred.');
        }
    }
};