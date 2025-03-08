const { SlashCommandBuilder } = require('discord.js');
const {EmbedBuilder} = require("discord.js");
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
          (alive_string=`${Math.floor(alive/60)} min, ${Math.floor(alive%60)} s`)
          else if (alive > 3600 && alive < 86400)
          (alive_string=`${Math.floor(alive/3600)} h, ${Math.floor((alive/60)%60)} min, ${Math.floor((alive/3600)%60)} s`)
          else (alive_string=`${Math.floor(alive/86400)} d, ${Math.floor((alive/3600)%24)} h, ${Math.floor((alive/60)%60)} min, ${Math.floor((alive/3600)%60)} s`)
          
          ///
          
        const EmbedFields = [
                    {name: 'Start time', value: `${client.readyAt}`, inline: true},
                    {name: '\u200b', value: '\u200b', inline: true},
                    {name: 'Response time', value: `${Date.now() - interaction.createdTimestamp} ms`, inline: true},
                    {name: 'Uptime', value: alive_string, inline: true},
                    {name: 'Ping', value: `${client.ws.ping} ms | ${new Date() - start} ms`, inline: true},
                    {name: 'Version', value: `${version}`, inline: true},
        ];
        const Embed = new EmbedBuilder().setTitle("Bot Status").setColor("#ffff00").addFields(EmbedFields).setTimestamp(new Date());

        // let EmbedText = {
        //     title: `Bot Status`, color: 16776960, fields: [
        //         {name: 'Start time', value: `${client.readyAt}`, inline: true},
        //         {name: '\u200b', value: '\u200b', inline: true},
        //         {name: 'Response time', value: `${Date.now() - interaction.createdTimestamp} ms`, inline: true},
        //         {name: 'Uptime', value: alive_string, inline: true},
        //         {name: 'Ping', value: `${client.ws.ping} ms | ${new Date() - start} ms`, inline: true},
        //         {name: 'Version', value: `${version}`, inline: true},
        //     ], timestamp: new Date()
        // };
        //   const Embed = new EmbedBuilder(EmbedText);
          interaction.reply({ embeds: [Embed]})
          .catch(error => console.error(error));
          console.log(`${interaction.createdTimestamp} | ${Date.now()}`) 
	},
};