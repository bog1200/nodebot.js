// "use strict";
// require('dotenv').config();
// const db = require("./utils/db");
// const google = require("./utils/google");
// const fs = require('fs');
// ///
// ///
// const { Client, Collection, GatewayIntentBits } = require('discord.js');
// //const intents = new Intents([GatewayIntentBits.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]);
// const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.
// 		GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages]  });
// client.interactions = new Collection();
// const interactionFiles = fs.readdirSync('./interactions').filter(file => file.endsWith('.js'));
//
// for (const file of interactionFiles) {
// 	const interaction = require(`./interactions/${file}`);
//
// 	// set a new item in the Collection
// 	// with the key as the interaction name and the value as the exported module
// 	client.interactions.set(interaction.data.name, interaction);
// }
// let stream_status = `Now with ${Math.floor(Math.random() * 100)}% more bananas...`;
//
// client.once('ready', () => {
// 	client.user.setActivity(stream_status);
// 	console.log("[Discord] API Successfully connected!");
// });
// //wait(2000);
//
//
//
// async function loginDiscord() {
// 	return new Promise((resolve, reject) => {
// 		client.login(process.env.DISCORD_KEY).then(res => resolve(res)).catch(error => reject(error));
// 	})
// }
// ///
//
//
// async function load() {
// 	await loginDiscord();
// 	await google.getkey();
//
// }
// load();
//
//
//
//
//
//
// client.on('interactionCreate', interaction => {
// 	if (interaction.isButton()) console.log(interaction);
// 	if (!interaction.isCommand()) return;
//
// 	const { commandName } = interaction;
// 	const date = new Date;
// 	console.log(`[Bot] "${commandName}" interaction triggered by ${interaction.user.username}#${interaction.user.discriminator} (#${interaction.channel.name} on ${interaction.guild.name}) at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `);
// 	client.interactions.get(commandName).execute(interaction);
// });
//
// // client.on('interactionCreate', interaction => {
// // 	if (!interaction.isButton()) return;
// // 	console.log(interaction);
// // });
//
// client.on('guildCreate', guild => {
// 	db.query(`INSERT INTO bot (SERVERID, SERVERNAME, JOINTIME)
// 			  VALUES (${guild.id}, ${db.escape(guild.name)}, ${Date.now()})`)
// 		.then(() => console.log(`[Bot] Joined ${guild.name} (${guild.id})`))
// 		.catch(error => console.error(error));
// });
//
//
// client.on('guildUpdate', (oldGuild, newGuild) => {
// 	if (oldGuild.name !== newGuild.name) {
// 		db.query(`UPDATE bot
// 				  SET SERVERNAME = ${db.escape(newGuild.name)}
// 				  WHERE bot.SERVERID = ${oldGuild.id}; `)
// 			.then(() => console.log(`[Bot] Server name changed: \nOld: ${oldGuild.name} \nNew: ${newGuild.name} \nID: ${oldGuild.id}`))
// 			.catch(error => console.error(error));
// 	}
// });
//
// client.on('guildDelete', guild => {
// 	db.query(`DELETE
// 			  FROM bot
// 			  WHERE bot.SERVERID = ${guild.id}`)
// 		.then(() =>
// 			console.log(`[Bot] Left ${guild.name} (${guild.id})`))
// 		.catch(error => console.error(error));
// });
//
// process.on('unhandledRejection', error => console.error('Caught Promise Rejection', error));
//
// ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => process.on(signal, () => {
// 	console.log('Goodbye!');
// 	db.end();
// 	client.destroy().then(() => process.exit(0));
//
// }));
