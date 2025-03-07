"use strict";
require('dotenv').config();
const db = require("./utils/db");
const google = require("./utils/google");
const fs = require('fs');
let axios = require('axios');
///
///
const { Client, Collection, Intents } = require('discord.js');
const intents = new Intents([Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]);
const client = new Client({ intents: intents });
client.interactions = new Collection();
const interactionFiles = fs.readdirSync('./interactions').filter(file => file.endsWith('.js'));

for (const file of interactionFiles) {
	const interaction = require(`./interactions/${file}`);

	// set a new item in the Collection
	// with the key as the interaction name and the value as the exported module
	client.interactions.set(interaction.data.name, interaction);
}
let stream_status = `Now with ${Math.floor(Math.random() * 100)}% more bananas...`;

client.once('ready', () => {
	client.user.setActivity(stream_status);
	console.log("[Discord] API Successfully connected!");
});
//wait(2000);



async function loginDiscord() {
	return new Promise((resolve, reject) => {
		client.login(process.env.DISCORD_KEY).then(res => resolve(res)).catch(error => reject(error));
	})
}
///

async function updateElection(){
	const myHeaders = new Headers();
	myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0");
	myHeaders.append("Referer", "https://prezenta.roaep.ro/europarlamentare09062024/");
	myHeaders.append("Priority", "u=1. i");
	myHeaders.append("Cookie", "route=f735d29b12152c7fef44cc24f12a28bf");
	
	const requestOptions = {
	  method: "GET",
	  headers: myHeaders,
	  redirect: "follow"
	};
	console.log("ELECTION QUERY")
	fetch("https://prezenta.roaep.ro/europarlamentare09062024/data/json/simpv/presence/activity.json?_="+new Date().getTime(), requestOptions)
	  .then((response) => response.json())
	  .then(async (result) => {
		const activity = result[0].activity;
		const sum = Object.values(activity).reduce((acc, value) => acc + value, 0);
		console.log(sum);
        const channel = await client.channels.fetch("1249124976515354655");
		await channel.send(`EU 2024: <t:${Math.floor(new Date().getTime()/1000)}:R> ${sum} (${(sum/18016674)*100} %)`);
		await channel.setName(`EU 2024: ${sum} (${((sum/18016674) * 100).toLocaleString("ro-RO", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} %)`);
	}
	  )
	  .catch((error) => console.error(error));
}

async function load() {
	await loginDiscord();
	await google.getkey();
	// await updateElection();
	// setInterval( async ()=>{
	// 	await updateElection();
	// },10*60*1000)
	
}
load();






client.on('interactionCreate', interaction => {
	if (interaction.isButton()) console.log(interaction);
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	const date = new Date;
	console.log(`[Bot] "${commandName}" interaction triggered by ${interaction.user.username}#${interaction.user.discriminator} (#${interaction.channel.name} on ${interaction.guild.name}) at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `);
	client.interactions.get(commandName).execute(interaction);
});

// client.on('interactionCreate', interaction => {
// 	if (!interaction.isButton()) return;
// 	console.log(interaction);
// });

client.on('guildCreate', guild => {
	db.query(`INSERT INTO bot (SERVERID, SERVERNAME, JOINTIME) VALUES (${guild.id}, ${db.escape(guild.name)},${Date.now()})`);
	console.log(`[Bot] Joined ${guild.name} (${guild.id})`);
});


client.on('guildUpdate', (oldGuild, newGuild) => {
	if (oldGuild.name != newGuild.name) {
		db.query(`UPDATE bot SET SERVERNAME = ${db.escape(newGuild.name)} WHERE bot.SERVERID = ${oldGuild.id};`);
		console.log(`[Bot] Server name changed: \nOld: ${oldGuild.name} \nNew: ${newGuild.name} \nID: ${oldGuild.id}`);
	}
});

client.on('guildDelete', guild => {
	db.query(`DELETE FROM bot WHERE bot.SERVERID = ${guild.id}`);
	console.log(`[Bot] Left ${guild.name} (${guild.id})`);
});

process.on('unhandledRejection', error => console.error('Caught Promise Rejection', error));

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => process.on(signal, () => {
	console.log('Goodbye!');
	db.end();
	client.destroy();
	process.exit();
}));
