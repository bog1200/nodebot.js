const { SlashCommandBuilder } = require('discord.js');
const {MessageActionRow, MessageButton, MessageEmbed} = require("discord.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Ask a question')
    .addStringOption(option => option.setName("time").setDescription("The duration of the poll").setRequired(true))
    .addStringOption(option => option.setName("question").setDescription("The question of the poll").setRequired(true)),
	async execute(interaction) {
    let time=interaction.options.getString('time');
    const question=interaction.options.getString('question');
    let countdown=30;
    if (time.slice(-1).toLowerCase()==='s')  countdown= time.substring(0,2);
    else if (time.slice(-1).toLowerCase()==='m') countdown=parseInt(time.substring(0,2))*60;
    else if (time.slice(-1).toLowerCase()==='h') countdown=parseInt(time.substring(0,2))*3600;
    else {
      interaction.reply({ embeds: [new MessageEmbed().setTitle("Error").setColor("#ff0000").setDescription("Invalid arguments").setTimestamp()]});
      return;
    }
        const id=interaction.id;
        let yes=0;
        let no=0;
        let countdown_format;      
        let init_countdown=countdown/1800;
        if (countdown<60) countdown_format=`${countdown}s`
        else if (countdown<3600) countdown_format=`${Math.floor(countdown/60)}m`
        else if (countdown%3600==0) countdown_format=countdown_format=`${Math.floor(countdown/3600)}h`
        else countdown_format=countdown_format=`${Math.floor(countdown/3600)}h ${Math.floor(countdown/60)-Math.floor(countdown/3600)*60}m`
          
        console.log(`[Bot] Poll started | Poll ID: ${id} | time: ${countdown_format}`);
              // const row = new MessageActionRow()
              // .addComponents(
              //   new MessageButton()
              //     .setCustomId('yes')
              //     .setLabel('✅')
              //     .setStyle('SUCCESS'),
              //     new MessageButton()
              //     .setCustomId('no')
              //     .setLabel('❌')
              //     .setStyle('DANGER'),
              // );





          
      await interaction.reply({ 
          embeds: [
            new MessageEmbed({title:`Poll`,color: '#fff000',description: `${question}`, fields: [
          { name: 'Yes', value: `✅`,inline: true },{name: "\u200B",value: '\u200B',inline: true},{name: "No",value: '❌',inline: true},],
        timestamp: new Date(),footer: { text: `${countdown_format}`},})
                  ], //components: [row]
         })
      const response = await interaction.fetchReply();
          
      response.react('✅').then(() => response.react('❌'))
        const filter = (reaction) => {return reaction.emoji.name};
        const collector = response.createReactionCollector({filter,  time: countdown*1000-1,dispose: true })
        const votes=[];
        collector.on('collect', (reaction, reactionCollector) => {
            //do stuff
            const user_id=`${reactionCollector.username}#${reactionCollector.discriminator} (${reactionCollector.id})`;
            if (reactionCollector.id===response.author.id)  return;
            if (reaction.emoji.name!=='✅' && reaction.emoji.name!=='❌' ) {reaction.users.remove(reactionCollector.id); return;}
            if (votes.includes(reactionCollector.id)) {reaction.users.remove(reactionCollector.id); vote_status='blocked'}
            else {votes.push(reactionCollector.id); vote_status='received'}
            console.log(`[Bot] Poll Vote ${vote_status} | PID: ${id} | UID: ${user_id} | Timestamp: ${Date.now()}`);
        });
        
        let timer = setInterval(() =>
            {
              if (countdown<=5) clearInterval(timer);
              countdown=countdown-1;
                    if ((countdown%5==0 && countdown<=60) || (countdown%60==0 && countdown>60 && countdown<=300)|| (countdown%300==0 && countdown>300 && countdown<=3600) ||(countdown%1800==0 && countdown > 3600))
               {
                 if (countdown<60 && init_countdown<1) countdown_format=`${countdown}s`
                 else if (countdown<3600) countdown_format=`${Math.floor(countdown/60)}m`
                 else if (countdown%3600==0) countdown_format=countdown_format=`${Math.floor(countdown/3600)}h`
                 else  countdown_format=`${Math.floor(countdown/3600)}h ${Math.floor(countdown/60)-Math.floor(countdown/3600)*60}m`
          response.edit({embeds: [new MessageEmbed({title:`Poll`,color: '#fff000',description: `${question}`, fields: [
            { name: 'Yes', value: `✅`,inline: true },{name: "\u200B",value: '\u200B',inline: true},{name: "No",value: '❌',inline: true},],
              timestamp: new Date(),footer: { text: `${countdown_format}`}})]});
        }},1000)

        collector.on('end', collected =>
        {
        clearInterval(timer);
        let votes = Array.from(collected.entries());
        yes=votes[0][1]['count']-1;
        no=votes[1][1]['count']-1;
        let result="Draw";
        if (yes>no) {result = "✅"; color="#00FF00"}
        else if (yes==no) {result = "Draw"; color="FFF000"}
        else {result="❌"; color="#FF0000"}
        console.log(`[Bot] Poll finished | PID: ${id} | Y: ${yes} | N: ${no} | result: ${result}`)
        
        response.edit({embeds: [new MessageEmbed({title:`Poll`,color: color, description: `${question}`, fields: [
          { name: 'Winner', value: `${result} (${yes} - ${no})`,inline: true },],
            timestamp: new Date()})]}); response.reactions.removeAll();
        });
	},
};











     