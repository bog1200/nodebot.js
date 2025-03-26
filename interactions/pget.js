// parametru: nume si te lasa sa-l stergi

const { SlashCommandBuilder } = require('discord.js');
const db = require("../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pget')
        .setDescription('Get a podcast from the database')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the podcast to get')
                .setRequired(true)),

    async execute(interaction) {
        const name = interaction.options.getString('name');

        try {
            const results = await db.query(
                `SELECT * FROM podcasts WHERE name = ${db.escape(name)}`
            );

            await interaction.reply(` Podcast **${name}** exists with uri: ${results[0].uri}`);

        } catch (error) {
            console.error(error);
            await interaction.reply('❌ Database error occurred.');
        }
    }
};