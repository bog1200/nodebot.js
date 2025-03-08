const {MessageEmbed} = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const yt = require('../utils/google');
let g_token;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('subs')
		.setDescription('Get YouTube channel subscribers')
        .addStringOption(option => option.setName("channel").setDescription("The name of the channel").setRequired(true)),
	async execute(interaction) {	

        g_token=await yt.getkey();
        if(!g_token) interaction.reply({ embeds: [new MessageEmbed().setDescription("Command disabled").setColor("#ff0000")]
    })
        else {
            const channel=interaction.options.getString('channel');
            const Embed = new MessageEmbed().setTitle('Youtube Subscriber Count').setTimestamp();
            let ch_id='undefined';
            let ch_name='undefined';
            let subs=-1;
            let sub;
            const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${channel}&access_token=${g_token}`)
            ch_id=response.data.items[0].id.channelId;
            ch_name=response.data.items[0].snippet.title;
            console.log("Ch_ID: "+`${ch_id}`);
            console.log("Ch_name: "+`${ch_name}`);
            const response2 = await axios.get(`https://www.googleapis.com/youtube/v3/channels?id=${ch_id}&part=statistics&fields=items/statistics/subscriberCount&access_token=${g_token}`)
            subs=response2.data.items[0].statistics.subscriberCount;
            if (subs>=100000 && subs <=999999) sub=(sub/100000) +" K"
            else if (subs>1000000) sub=(subs/1000000)+" M";
            else sub=subs;
            console.log(`Subs: ${sub}`);
            Embed.setColor('#123456')
            .addField("Channel Name",`${ch_name}`)
            .addField("Channel ID",`[${ch_id}](https://www.youtube.com/channel/${ch_id})`)
            .addField("Subscribers",`${sub}`).setThumbnail(response.data.items[0].snippet.thumbnails['medium'].url);
            interaction.reply({ embeds: [Embed]});

        }
    }
}