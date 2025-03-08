const {MessageEmbed, Permissions} = require('discord.js');
const db = require("../utils/db");

  const { SlashCommandBuilder } = require('discord.js');
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('settings')
      .setDescription('Change bot settings')
      .addSubcommandGroup(group => group.setName('reset').setDescription('Reset settings')
        .addSubcommand(subcommand => subcommand.setName('all').setDescription('Reset all settings')))
      .addSubcommandGroup(group => group.setName("covid").setDescription("Chage covid settings")
        .addSubcommand(subcommand =>subcommand.setName('county').setDescription('Change Covid19 County (RO)')
          .addChannelOption(option => option.setName('county_channel').setDescription('The channel for county incidence').setRequired(true))
          .addStringOption(option => option.setName('county').setDescription('The county to change to').setRequired(true)))
        .addSubcommand(subcommand =>subcommand.setName('vaccine').setDescription('Change Covid19 Vaccine channels (RO)')
          .addChannelOption(option => option.setName('channel').setDescription('The channel for full dose').setRequired(true)))
        .addSubcommand(subcommand =>subcommand.setName('cases').setDescription('Change Covid19 Cases channels (RO)')
          .addChannelOption(option => option.setName('new').setDescription('The channel for new daily cases').setRequired(true))
          .addChannelOption(option => option.setName('total').setDescription('The channel for all cases').setRequired(true)))
        .addSubcommand(subcommand =>subcommand.setName('incidence').setDescription('Change Covid19 Incidence channels (RO)')
          .addStringOption(option => option.setName('town').setDescription('The place to get data').setRequired(true))
          .addStringOption(option => option.setName('county').setDescription('The county to change to').setRequired(true))
          .addChannelOption(option => option.setName('channel').setDescription('The channel for incidence').setRequired(true)))
        ),
    async execute(interaction) {
      await interaction.deferReply();
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) 
          {interaction.reply({ embeds: [new MessageEmbed().setTitle('Settings').setTimestamp().setColor('ff0000').setDescription('Missing permissions')]});
            return;
          }
        const Embed=new MessageEmbed().setTitle('Settings').setTimestamp();
        let sql;
        const command=interaction.options.getSubcommand();
        switch(command)
        {
          case 'all': 
            {
              sql=`UPDATE bot SET COVCHID = NULL ,COVNEWID = NULL, COVJUDID = NULL, COVJUD = NULL WHERE bot.SERVERID = '${interaction.guild.id}'`; 
              Embed.setColor('#00ff00').setDescription('Settings Cleared');
              break;
            }
          case 'county':
            {
              sql=`UPDATE bot SET  COVJUDID = '${interaction.options.getChannel('county_channel').id}', COVJUD = '${interaction.options.getString('county').id}' WHERE bot.SERVERID = '${interaction.guild.id}'`;
            Embed.setColor('#00ff00').setDescription(`COVID incidence for ${interaction.options.getString('county')} set to ${interaction.options.getChannel('county_channel')}`);
            break;
            }
          case 'vaccine':
            {
              sql=`UPDATE bot SET COVVAC2ID = '${interaction.options.getChannel('channel2').id}' WHERE bot.SERVERID = '${interaction.guild.id}'`;
              Embed.setColor('#00ff00').setDescription(`COVID vaccines`).addField(`Channel set to:`, `${interaction.options.getChannel('channel')}`, true);
              break;
            }
          case 'cases':
            {
              sql=`UPDATE bot SET COVCHID = '${interaction.options.getChannel('total').id}',COVNEWID = '${interaction.options.getChannel('new').id}' WHERE bot.SERVERID = '${interaction.guild.id}'`;
              Embed.setColor('#00ff00').setDescription('COVID:').addField(`Total count set to:`, `${interaction.options.getChannel('total')}`, true).addField("\u200b","\u200b",true).addField(`Total new set to:`, `${interaction.options.getChannel('new')}`, true);
              break;
            }
          case 'incidence':
            {
              sql=`UPDATE bot SET COVLOCID = '${interaction.options.getChannel('channel').id}',COVLOC = '${interaction.options.getString('town').toUpperCase()}', COVLOCJUD = '${interaction.options.getString('county').toUpperCase()}' WHERE bot.SERVERID = '${interaction.guild.id}'`;
              Embed.setColor('#00ff00').setDescription('COVID Incidence').addField(`Channel set to:`, `${interaction.options.getChannel('channel')}`, true).addField("Place set to:",`${interaction.options.getString('town')}`,true).addField(`County set to:`, `${interaction.options.getString('county')}`, true);
              break;
            }
          }
        await db.query(sql, function (err) {
          if (err) console.error(err);
        });
        interaction.editReply({ embeds: [Embed]})
        .catch(error => console.error(error));
    }
}