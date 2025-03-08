let {queue} = require("./play");
const { SlashCommandBuilder } = require('discord.js');
const {EmbedBuilder} = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('See the current queue'),
	async execute(interaction) {
        await interaction.deferReply();
		if (!queue) return interaction.reply("Nothing is playing");
		const serverQueue = queue.get(interaction.guild.id);
        let EmbedFields = [];
        EmbedFields.push({name: 'Now Playing', value: `**${serverQueue.songs[0].title}** (${serverQueue.songs[0].url})`});
        if(serverQueue.songs[1]) {
            EmbedFields.push({name: 'Next', value: '\u200B'});
            for (let i=1;i<=5;i++) {
                if (serverQueue.songs[i]) EmbedFields.push({name: `**${i})** ${serverQueue.songs[i].title}`, value: `(${serverQueue.songs[i].url})`});
                else break;
            }
            if (serverQueue.songs.length>6)
                EmbedFields.push({name: '....', value: `And ${serverQueue.songs.length-6} more...`});
        }

        
        const Embed = new EmbedBuilder().setColor('#ff00ff').setTitle(`Queue`).setTimestamp().addFields(EmbedFields);
        interaction.editReply({ embeds: [Embed]});
	},
};