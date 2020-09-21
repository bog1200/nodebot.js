//
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const googleAuth = require('google-auth-library');
const privatekey = require("./privatekey.json");
const wait = require('util').promisify(setTimeout);

///
///

const Discord = require('discord.js');
require('dotenv').config();
let prefix = process.env.DISCORD_PREFIX;
const client = new Discord.Client();
console.log(`Prefix: ${prefix}`);

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}
let start_time = Date.now();
let start_time_gmt = new Date(start_time);

let stream_link=process.env.DISCORD_STREAM_LINK;
let status_type="PLAYING"; 
let stream_status=`Now with ${Math.floor(Math.random()*100)}% more bananas...`;
let invites = {};


client.on('ready', () => {
 client.user.setActivity(stream_status);
console.log("[Discord] API Successfully connected!");
});
wait(2000);

 exports.update = ((arg1,arg2='PLAYING',arg3='null',arg4='active') => {console.log(`${arg1},${arg2},${arg3}`);
if (arg3!=='null') {client.user.setPresence({ activity: { name: `${arg1}`,type: `${arg2}`,url:`${arg3}` }, status: `${arg4}` });}
else {client.user.setPresence({ activity: { name: `${arg1}`,type: `${arg2}`}, status: `${arg4}` });}

});

function loginDiscord()
{
const login = new Promise ((resolve,reject) =>
{
	client.login(process.env.DISCORD_KEY).then(res => resolve(res)).catch(error => reject(error));
})
}
///
let google_token;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/google-apis-nodejs-quickstart.json
let jwtClient = new google.auth.JWT(
	privatekey.client_email,
	null,
	privatekey.private_key,
	['https://www.googleapis.com/auth/youtube.readonly']);
function getkey()
{
//authenticate request
const token = new Promise ((resolve,reject) =>
{
	jwtClient.authorize((err, tokens) => {
 	if (err) {
   	console.log(err);
   	reject(err);
 } else {
	resolve(tokens.access_token);
    }
 })})
 return token;
}
 function refreshKey(){

 jwtClient.refreshAccessToken((err, tokens) => {
 if (err) {console.error(err);}
 else{
google_token=tokens.access_token;
console.log("[Google] API Key refreshed!");
}
});
}

let axios = require('axios');
let cov_str, c_out, alm_msg, alm_subs=-1; c_api=true;
function update(){
	axios.all([
	  axios.get(`https://www.googleapis.com/youtube/v3/channels?id=UC73wv11MF_jm6v7iz3kuO8Q&part=statistics&fields=items/statistics/subscriberCount&access_token=${google_token}`),
	  axios.get('https://covid19-api.org/api/timeline/ro')
	]).then(axios.spread((response1, response2) => {
	  alm_subs=response1.data.items[0].statistics.subscriberCount;
	  c_out=response2.data;
	})).catch(error => {
		console.error(error);
	  refreshKey();
	});
	
	setTimeout(lol,5000);
	}
	let cdf=0;
	function lol(){
		try{
		alm_msg="Abonati: "+`${alm_subs}`;
		//console.log("Alm: "+`${alm_subs}`);
		//console.log(c_out[0]['cases']);
		
		let i=0;
		do
		{
			i=i+1;
			cdf=c_out[0]['cases']-c_out[i]['cases']
		}while (cdf==0);
		console.log(`Czr: ${c_out[0]['cases']}`);
		console.log(`Cdf: ${cdf}`);
		//cdf=(Object.entries(c_out[c_out.length-1])[7][1])-(Object.entries(c_out[c_out.length-2])[7][1]);
	cov_str=`Cazuri: ${c_out[0]['cases']}`;
}
	catch(error){
		cdf="-1";
		cov_str="Cazuri: -1"
		c_api=false;
	}
	
	setTimeout(UpdateStatus, 3000);
	//
	}
	async function load()
	{
		google_token= await getkey();
		const D_Log_out = await loginDiscord();
		console.log("[Google] Token: "+`${google_token}`);
		console.log("[Google] API Successfully connected!");
		exports.g_token = google_token;
		update();
	}
	load();

	const queue = new Map();
	client.on('message', async message => {
		const date = new Date;
		const args = message.content.slice(prefix.length).split(/ +/);
		let command = args.shift().toLowerCase();
		if (command==='2fa') command='validate';
		//client.channels.resolve(message.channel.id.toString()).messages.fetch(message.content.toString()).then((message => {message.delete()}));
		if (!client.commands.has(command)) return;

try {
	
	if (message.content.substr(0,1)!==prefix) {return;};
	if(command==='status'){args[98]=start_time; args[99]=start_time_gmt;};
	if  (message.guild!==null){
		if (command==='covid') args[99]=c_api;
		if (command === 'play' || command === 'skip' ||command === 'stop' ) {client.commands.get(command).execute(message, queue, args, google_token);}
		else {client.commands.get(command).execute(message,args,google_token);}
	console.log(`Bot triggered with "${message.content}" by ${message.author.username}#${message.author.discriminator} (#${message.channel.name} on ${message.guild.name}) at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
}
	else {message.reply('Bot commands are unavailable on DMs').then(msg => {
		msg.delete({ timeout: 7000 });
	  })
	.catch(error => console.err(error));
	 console.log(`Bot triggered with "${message.content}" by ${message.author.username}#${message.author.discriminator} (DM) at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);}
} catch (error) {
	console.error(error);
	message.reply('there was an error trying to execute that command!');
}
});

function UpdateStatus(){

	//Romail.ml
	client.channels.fetch("702248585991028776").then(channel => channel.setName(cov_str)).catch(error => console.error(error));
	client.channels.fetch("733602475436802058").then(channel => channel.setName(`Noi: ${cdf}`)).catch(error => console.error(error));
	///AlmostIce
	client.channels.fetch("700813443111977021").then(channel => channel.setName(alm_msg)).catch(error => console.error(error));
	//client.channels.find(channel => channel.id === "693109405696262164").setName(dro);
	
	  setTimeout(update, 1200000);
	
	}
        //Romail.ml
		client.on('guildMemberAdd', member => {
			// To compare, we need to load the current invite list.
			member.guild.fetchInvites().then(guildInvites => {
				// This is the *existing* invites for the guild.
				const ei = invites[member.guild.id];
		
				// Update the cached invites
				invites[member.guild.id] = guildInvites;
		
				// Look through the invites, find the one for which the uses went up.
				const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
		
				console.log(invite.code)
		
				if (invite.code === "xg44stZ") {
					return member.addRole(member.guild.roles.find(role => role.name === "bog1200"));
				}
			})});

	process.on('SIGINT',function(){
	client.destroy();
});
	process.on('SIGUSR1',function (){
		console.log('Goodbye!');
		client.destroy();
	});
	process.on('SIGUSR2',function (){
		console.log('Goodbye!');
		client.destroy();
	});
	process.on('exit', function (){
		console.log('Goodbye!');
		client.destroy();
	});