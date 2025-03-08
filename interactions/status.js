const { SlashCommandBuilder } = require('discord.js');
const {MessageEmbed} = require("discord.js");
const path = require("path");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Check the bot current status'),
	async execute(interaction) {
        const start = new Date();
        const client = interaction.client;
        const version = require(path.resolve(__dirname,"../package.json")).version;
          let alive_string, alive=((client.uptime)/1000).toFixed(0);
          if (alive <=60) 
          (alive_string=`${(alive)} s`)
          else if (alive > 60 && alive < 3600)
          (alive_string=`${parseInt(alive/60)} min, ${parseInt(alive%60)} s`)
          else if (alive > 3600 && alive < 86400)
          (alive_string=`${parseInt(alive/3600)} h, ${parseInt((alive/60)%60)} min, ${parseInt((alive/3600)%60)} s`)
          else (alive_string=`${parseInt(alive/86400)} d, ${parseInt((alive/3600)%24)} h, ${parseInt((alive/60)%60)} min, ${parseInt((alive/3600)%60)} s`)
          
          ///
          
          ///
        let EmbedText = {
            title: `Bot Status`, color: '#ffff00', fields: [
                {name: 'Start time', value: `${client.readyAt}`, inline: true}, {
                    name: '\u200b',
                    value: '\u200b',
                    inline: true
                }, {name: 'Response time', value: `${Date.now() - interaction.createdTimestamp} ms`, inline: true},
                {name: 'Uptime', value: alive_string, inline: true}, {
                    name: 'Ping',
                    value: `${client.ws.ping} ms | ${new Date() - start} ms`,
                    inline: true
                }, {name: 'Version', value: `${version}`, inline: true},
            ], timestamp: new Date()
        };
          const Embed = new MessageEmbed(EmbedText);  
          interaction.reply({ embeds: [Embed]})
          .catch(error => console.error(error));
          console.log(`${interaction.createdTimestamp} | ${Date.now()}`) 
	},
};