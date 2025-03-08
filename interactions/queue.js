let {queue} = require("./play");
const { SlashCommandBuilder } = require('discord.js');
const {MessageEmbed} = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('See the current queue'),
	async execute(interaction) {
        await interaction.deferReply();
		if (!queue) return interaction.reply("Nothing is playing");
		const serverQueue = queue.get(interaction.guild.id);
        
        const Embed = new MessageEmbed().setColor('#ff00ff').setTitle(`Queue`).addField(`**Now playing:**`,`[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`);
        if (serverQueue.songs[1]) {
            Embed.addField('Next:','\u200B');
            for (let i=1;i<=5;i++) {
                if (serverQueue.songs[i]) Embed.addField(`**${i})** ${serverQueue.songs[i].title}`,`(${serverQueue.songs[i].url})`);
                else break;
            }
            if (serverQueue.songs.length>6) 
                Embed.addField(`....`,`And ${serverQueue.songs.length-6} more...`);
        }
        interaction.editReply({ embeds: [Embed]});
	},
};