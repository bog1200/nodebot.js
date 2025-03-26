
const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const axios = require('axios');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const xml2js = require('xml2js');
const db = require('../utils/db');
const { queue } = require('./play');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pstart')
        .setDescription('Start a podcast stream')
        .addStringOption(option => option.setName('name').setDescription('Podcast name').setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.reply('You need to be in a voice channel to start a podcast!');
        }
        await interaction.deferReply();

        try {
            let results = await db.query(`SELECT uri FROM podcasts WHERE name = ${db.escape(name)}`);
            if (results.length === 0) {
                return interaction.editReply(`No podcast found with the name: ${name}`);
            }
            const player = createAudioPlayer();
            const url = results[0].uri;
            const response = await axios.get(url);
            const text = response.data;
            const result = await xml2js.parseStringPromise(text);
            const items = result.rss.channel[0].item;
            const lastEpisode = items[0];
            const enclosureUrl = lastEpisode['enclosure'][0].$.url;
            const thumbnail = lastEpisode['itunes:image'][0].$.href;

            let serverQueue = queue.get(interaction.guild.id);
            if (!serverQueue) {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });


                serverQueue = {
                    textChannel: interaction.channel,
                    voiceChannel: channel,
                    player: player,
                    connection: connection,
                    songs: [],
                };
                queue.set(interaction.guild.id, serverQueue);
                connection.subscribe(player);
            }

            const podcast = {
                title: lastEpisode.title[0],
                url: enclosureUrl,
                thumbnail: thumbnail, // You can add a thumbnail if available
            };

            serverQueue.songs.push(podcast);
            if (serverQueue.songs.length === 1) {
                player.play(createAudioResource(serverQueue.songs[0].url));
            }
            player.on('error', error => {
                console.error(`${error}`);
            });
            const embedFields = [ { name: '\u200b', value: `Podcast added to queue`,inline: true }];
            const embed = new EmbedBuilder().setTitle(podcast.title).setColor(65280).setThumbnail(podcast.thumbnail).addFields(embedFields).setTimestamp(new Date());
            await interaction.editReply({embeds:[embed] });
        } catch (error) {
            console.error(error);
            interaction.editReply('Failed to fetch the podcast.');
        }
    }
};