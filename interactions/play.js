const ytdl = require("@distube/ytdl-core");
const ytpl = require('ytpl');
const axios = require('axios');
const queue = new Map();
const {spotifyApi} = require("../utils/spotify");

const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
const { MessageEmbed } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music from YouTube')
    .addStringOption(option => option.setName("song").setDescription("The name/url of the song/playlist").setRequired(true))
    .addIntegerOption(option => option.setName("limit").setDescription("Playlist number of songs")),
	async execute(interaction) {
        interaction.deferReply();
      let  playlist = null;
    let i = 0;
    let limit = interaction.options.getInteger('limit')|| 100;
    const {getkey} = require("../utils/google");
    let g_token = await getkey();
    const agent = require("../utils/ytcookie");


    async function google (title)
    {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${title}&access_token=${g_token}`)
    console.log(`[Bot] Playing music: [${decodeURI(title)}] -> ${response.data.items[0].id.videoId}`);
      return `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
    }

    async function runCommand()
    {
      //const agent = ytdl.createAgent(cookies);
      let player;
      if (AudioPlayerStatus.Idle) player = createAudioPlayer();
      const song_input=interaction.options.getString('song');
      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) return interaction.editReply("You need to be in a voice channel to play music!");
      const permissions = voiceChannel.permissionsFor(interaction.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) return interaction.editReply("I need the permissions to join and speak in your voice channel!");
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
  
      if (song_input.match(/[\bhttps://open.\b]*spotify[\b.com\b]*[/:]*track[/:]*[A-Za-z0-9?=]+/))
      {
        const {body} = await spotifyApi.getTrack(song_input.slice(31,53));
        const sp_nam= await google(encodeURI(`${body.name} ${body.artists[0].name}`));
        play(await ytdl.getInfo(sp_nam)); 
      }   
      else if ((song_input.match(/(youtu)?\.?be(\.com)?/))) {
        if (ytpl.validateID(song_input)){
          playlist = await ytpl(song_input,{limit: limit});
          if (limit>playlist.estimatedItemCount) limit = playlist.estimatedItemCount;
          for(i=0;i<limit;i++) play(await ytdl.getInfo(playlist.items[i].shortUrl))
        }
        else play(await ytdl.getInfo(song_input));   
      }
      else  {
        const googleparse= await google(song_input);
        play(await ytdl.getInfo(googleparse));
      }

      function play(song_data)
      {
        let serverQueue = queue.get(interaction.guild.id);
        const song = {
          title: song_data.videoDetails.title,
          url: song_data.videoDetails.video_url,
          thumbnail: song_data.videoDetails.thumbnails[2]
        };

        if (!serverQueue) {
          const queueContruct = {
            textChannel: interaction.channel,
            voiceChannel: voiceChannel,
            player: player,
            connection: connection,
            songs: [],
          };
          if (connection.state){ /* empty */ }
          connection.subscribe(player);
          queue.set(interaction.guild.id, queueContruct);
      
          queueContruct.songs.push(song);
          player.play(createAudioResource(ytdl(queueContruct.songs[0].url, {quality: 'lowestaudio',highWaterMark: 1<<25, agent })));
        }
        else {
          serverQueue.songs.push(song);
        }
        if (playlist)
        {
          if (!i) interaction.editReply({embeds: [new MessageEmbed({title: playlist.title ,color: '#00ff00', url: playlist.url, thumbnail: playlist.bestThumbnail ,fields: [
            { name: '\u200b', value: `Added ${limit} songs to queue`,inline: true }],
          timestamp: new Date()})]});
        }
        else interaction.editReply({embeds: [new MessageEmbed({title: song.title ,color: '#00ff00', url: song.url, thumbnail: song.thumbnail ,fields: [
          { name: '\u200b', value: `Song added to queue`,inline: true }],
        timestamp: new Date()})]});

      
      }

      player.on(AudioPlayerStatus.Idle, () =>{
          let serverQueue = queue.get(interaction.guild.id);
        if (serverQueue.songs[1])
        {     serverQueue.songs.shift();
              player.play(createAudioResource(ytdl(serverQueue.songs[0].url,{filter: 'audioonly',quality: 'lowestaudio',highWaterMark: 1<<25})));
            
        }
        else 
        {
        player.stop();
          connection.destroy();
        queue.delete(interaction.guild.id);
        }
      });

      player.on('error', error => {
        console.error(`${error}`);
      })
    }

    async function load()
    {   
      if(g_token) await runCommand();
      else interaction.editReply("Music command is not available");  
    }
    load();
  }
}
module.exports.queue = queue;
