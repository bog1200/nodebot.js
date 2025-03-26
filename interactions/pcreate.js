// iau queueul si adaug in q mp3-ul de la xml

// iau linkul
//link + nume ca parametrii, dupa iau astea si le salvez in baza de date

const { SlashCommandBuilder } = require('discord.js');
const db = require("../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pcreate')
        .setDescription('Add a new podcast to the database')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the podcast')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('uri')
                .setDescription('The URL of the podcast')
                .setRequired(true)),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const uri = interaction.options.getString('uri');


        try {
            const results = await db.query(
                `SELECT * FROM podcasts WHERE name = ${db.escape(name)} OR uri = ${db.escape(uri)}`
            );

            if (results.length === 0) {
                await db.query(
                    `INSERT INTO podcasts (name, uri) VALUES (${db.escape(name)}, ${db.escape(uri)})`
                );
                await interaction.reply(`✅ Podcast **${name}** added with uri: ${uri}`);
            } else {
                await interaction.reply(`❌ Podcast **${name}** with uri: ${uri} already exists!`);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('❌ Database error occurred.');
        }


    }
};

