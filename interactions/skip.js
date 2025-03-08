let {queue} = require("./play");
let {createAudioResource} = require('@discordjs/voice');
let ytdl=require("@distube/ytdl-core");
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current song'),
	async execute(interaction) {
		if (!queue) return interaction.reply("Nothing is playing");
		const serverQueue = queue.get(interaction.guild.id);
            if (serverQueue.songs[1])
            {     serverQueue.songs.shift();
				  serverQueue.player.stop();
                  serverQueue.player.play(createAudioResource(ytdl(serverQueue.songs[0].url,{filter: 'audioonly',quality: 'lowestaudio',highWaterMark: 1<<25})));
				  return interaction.reply("Song skipped");
            }
			else return interaction.reply("No song to skip to!");

	},
};
