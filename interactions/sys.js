const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('sys')
		.setDescription('Show system info'),
	async execute(interaction) {
    
      if (interaction.user.id !== "239136395665342474") interaction.deferReply({ephemeral: true});
      else {const used = process.memoryUsage();
      interaction.reply({content: `System info:`, ephemeral: true});
      for (let key in used) {
        interaction.followUp({content: `[RAM] ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`, ephemeral: true});
      }
    }
  } 
}