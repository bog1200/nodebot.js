// parametru: nume si te lasa sa-l stergi

const { SlashCommandBuilder } = require('discord.js');
const db = require("../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pdelete')
        .setDescription('Delete a podcast from the database')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the podcast to delete')
                .setRequired(true)),

    async execute(interaction) {
        const name = interaction.options.getString('name');

        db.query(`DELETE FROM podcasts WHERE name = ${db.escape(name)}`)
            .then(() => console.log(`Podcast "${name}" deleted successfully.`))
            .catch(error => console.error(error));

        await interaction.reply(`✅ Podcast **${name}** has been succesfully deleted.`);
    }
};