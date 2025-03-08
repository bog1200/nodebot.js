const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, MessageFlags } = require("discord.js");
const db = require('../utils/db');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('todo')
        .setDescription('Create a todo list')
        .addSubcommand(subcommand => subcommand
            .setName('create')
            .setDescription('Add a todo')
            .addStringOption(option => option.setName('title').setDescription('The todo').setRequired(true))
            .addStringOption(option => option.setName('description').setDescription('The description').setRequired(false))
        )
        .addSubcommand(subcommand => subcommand
            .setName('clear')
            .setDescription('Remove a todo list (⚠️ The entire list)')
        )
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('Add item to todo')
            .addStringOption(option => option.setName('title').setDescription('The todo').setRequired(true))
            .addStringOption(option => option.setName('description').setDescription('The description').setRequired(false))
            .addIntegerOption(option => option.setName('index').setDescription('The index of the item (0-indexed)').setRequired(false)
            ))
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove item from todo')
            .addIntegerOption(option => option.setName('index').setDescription('The index of the item (0-indexed)').setRequired(true)
            ))
        .addSubcommand(subcommand => subcommand
            .setName('mark')
            .setDescription('Mark item status')
            .addIntegerOption(option => option.setName('index').setDescription('The index of the item (0-indexed)').setRequired(true))
            .addStringOption(option => option.setName('status').setDescription('The status of the item').setRequired(true)
                //allow choices between 3 options
                .addChoices(
                    { 'name': 'Done ✅', 'value': 'done' },
                    { 'name': 'In Progress ⚠️ ', 'value': 'inprogress' },
                    { 'name': 'Not Started❗', 'value': 'notstarted' }
                )
            ))
        .addSubcommand(subcommand => subcommand
            .setName('assign')
            .setDescription('Assign a todo to a user')
            .addIntegerOption(option => option.setName('index').setDescription('The index of the item (0-indexed)').setRequired(true))
            .addUserOption(option => option.setName('user').setDescription('The user').setRequired(false))
            .addRoleOption(option => option.setName('role').setDescription('The role').setRequired(false))
        )
        .addSubcommand(subcommand => subcommand
            .setName('unassign')
            .setDescription('Unassign a todo from a user')
            .addIntegerOption(option => option.setName('index').setDescription('The index of the item (0-indexed)').setRequired(true))
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'create') {
            const todo = await db.query(`SELECT * FROM todo WHERE channel_id = ${interaction.channel.id}`);
            if (todo.length > 0) {
                // Ephemeral reply
                await interaction.editReply('⚠️ ToDo already exists!');
            }
            else {
                const title = interaction.options.getString('title');
                const description = interaction.options.getString('description') || '';
                const embed = new EmbedBuilder().setTitle(title).setDescription(description);
                const message = await interaction.channel.send({ embeds: [embed] });
                // pin the message
                await message.pin();
                await interaction.editReply({ content: '✅ ToDo created', flags: MessageFlags.Ephemeral });
                // insert into db
                await db.query(`INSERT INTO todo (snowflake, channel_id, server_id, title, description)
                                VALUES (${message.id}, ${interaction.channel.id}, ${interaction.guild.id}, "${title}",
                                        "${description}")`);

            }
        }
        else if (subcommand === 'clear') {
            const todo = await db.query(`SELECT * FROM todo WHERE channel_id = ${interaction.channel.id}`);
            if (todo.length === 0) {
                // Ephemeral reply
                await interaction.editReply('⚠️ No ToDo list exists in this channel!');
            }
            else {
                // unpin the message
                await interaction.channel.messages.fetch(`${todo[0].snowflake}`).then(
                    message => { message.unpin(); message.delete(); });
                await interaction.editReply({ content: '✅ ToDo cleared', flags: MessageFlags.Ephemeral });
                await db.query(`DELETE
                                FROM todo_items
                                WHERE todo_id = ${todo[0].id}`);
                // delete from db
                await db.query(`DELETE
                                FROM todo
                                WHERE channel_id = ${interaction.channel.id}`);

            }

        }
        else if (subcommand === 'add') {
            const todo = await db.query(`SELECT * FROM todo WHERE channel_id = ${interaction.channel.id}`);
            if (todo.length === 0) {
                // Ephemeral reply
                await interaction.editReply('⚠️ No ToDo list exists in this channel!');
            }

            else {
                const items = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);
                if (items.length >= 9) {
                    // Ephemeral reply
                    await interaction.editReply('⚠️ ToDo list is full!');

                }
                else {
                    const ToDoTitle = todo[0].title;
                    const ToDoDescription = todo[0].description;
                    const title = interaction.options.getString('title');
                    const description = interaction.options.getString('description') || '';
                    let index = interaction.options.getInteger('index');
                    if (index < 0 || index > items.length || index == null) {
                        index = items.length;
                    }
                    let embedList = [];
                    embedList.push(new EmbedBuilder().setTitle(ToDoTitle).setDescription(ToDoDescription));
                    for (let i = 0; i < index; i++) {
                        let embed = new EmbedBuilder().setTitle(items[i].title).setDescription(items[i].description);
                        let embedFields = [];
                        if (items[i].status === 'done') {
                            embed.setColor('GREEN');
                            embedFields.push({ name: 'Status', value: '✅ Done ', inline: true });
                        }
                        else if (items[i].status === 'inprogress') {
                            embed.setColor('YELLOW');
                            embedFields.push({ name: 'Status', value: '⚠️ In Progress ', inline: true });
                        }
                        else {
                            embed.setColor('DARK_RED');
                            embedFields.push({ name: 'Status', value: '❗Not Started ', inline: true });
                        }
                        if (items[i].asignee != null) {
                            const user = await interaction.guild.members.fetch(`${items[i].asignee}`);
                            embedFields.push({ name: 'Assigned To', value: `${user}`, inline: true });
                        }
                        else {
                            embedFields.push({ name: 'Assigned To', value: 'none', inline: true });
                        }
                        embedFields.push({ name: 'Last Update', value: `<t:${new Date(items[i].last_update).getTime() / 1000}:R>`, inline: true })
                        embed.addFields(embedFields);
                        embedList.push(embed);
                    }

                    let newTask = new EmbedBuilder().setTitle(title).setDescription(description).setColor('DARK_RED');
                    newTask.addFields({ name: 'Status', value: '❗ Not Started', inline: true }, { name: 'Assigned To', value: 'none', inline: true }, { name: 'Last Update', value: `<t:${Math.floor(new Date().getTime() / 1000)}:R>`, inline: true });
                    newTask.setFooter({ text: `Index: ${index}` });
                    embedList.push(newTask);

                    for (let i = index + 1; i <= items.length; i++) {
                        let embed = new EmbedBuilder().setTitle(items[i - 1].title).setDescription(items[i - 1].description);
                        let embedFields = [];
                        if (items[i - 1].status === 'done') {
                            embed.setColor('GREEN');
                            embedFields.push({ name: 'Status', value: '✅ Done ', inline: true });
                        }
                        else if (items[i - 1].status === 'inprogress') {
                            embed.setColor('YELLOW');
                            embedFields.push({ name: 'Status', value: '⚠️ In Progress ', inline: true });
                        }
                        else {
                            embed.setColor('DARK_RED');
                            embedFields.push({ name: 'Status', value: '❗Not Started ', inline: true });
                        }
                        if (items[i - 1].asignee != null) {
                            const user = await interaction.guild.members.fetch(`${items[i - 1].asignee}`);
                            embedFields.push({ name: 'Assigned To', value: `${user}`, inline: true });
                        }
                        else if (items[i - 1].role != null) {
                            const role = `<@&${items[i].role}>`
                            embedFields.push({ name: 'Assigned To', value: `${role}`, inline: true });
                        }
                        else {
                            embedFields.push({ name: 'Assigned To', value: 'none', inline: true });
                        }
                        embedFields.push({ name: 'Last Update', value: `<t:${new Date(items[i - 1].last_update).getTime() / 1000}:R>`, inline: true })
                        embed.addFields(embedFields);
                        embed.setFooter({ text: `Index: ${i}` });
                        embedList.push(embed);
                        db.query(`UPDATE todo_items SET item_number = ${i} WHERE id = ${items[i - 1].id}`);

                    }

                    const message = await interaction.channel.messages.fetch(`${todo[0].snowflake}`);
                    await message.edit({ embeds: embedList });

                    // insert into db
                    db.query(`INSERT INTO todo_items (todo_id, title, description, item_number) VALUES (${todo[0].id}, "${title}", "${description}", ${index})`);


                    await interaction.editReply({ content: '✅ ToDo item added', flags: MessageFlags.Ephemeral });
                }
            }
        }
        else if (subcommand === 'remove') {
            const todo = await db.query(`SELECT * FROM todo WHERE channel_id = ${interaction.channel.id}`);
            if (todo.length === 0) {
                // Ephemeral reply
                await interaction.editReply('⚠️ No ToDo list exists in this channel!');
            }

            else {
                const index = interaction.options.getInteger('index');
                const toDelete = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);
                await db.query(`DELETE FROM todo_items WHERE id = ${toDelete[index].id}`);
                const items = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);

                const ToDoTitle = todo[0].title;
                const ToDoDescription = todo[0].description;
                let embedList = [];
                embedList.push(new EmbedBuilder().setTitle(ToDoTitle).setDescription(ToDoDescription));
                for (let i = 0; i < items.length; i++) {
                    let embed = new EmbedBuilder().setTitle(items[i].title).setDescription(items[i].description);
                    let embedFields = [];
                    if (items[i].status === 'done') {
                        embed.setColor('GREEN');
                        embedFields.push({ name: 'Status', value: '✅ Done ', inline: true });
                    }
                    else if (items[i].status === 'inprogress') {
                        embed.setColor('YELLOW');
                        embedFields.push({ name: 'Status', value: '⚠️ In Progress ', inline: true });
                    }
                    else {
                        embed.setColor('DARK_RED');
                        embedFields.push({ name: 'Status', value: '❗Not Started ', inline: true });
                    }
                    if (items[i].asignee != null) {
                        const user = await interaction.guild.members.fetch(`${items[i].asignee}`);
                        embedFields.push({ name: 'Assigned To', value: `${user}`, inline: true });
                    }
                    else if (items[i].role != null) {
                        const role = `<@&${items[i].role}>`
                        embedFields.push({ name: 'Assigned To', value: `${role}`, inline: true });
                    }
                    else {
                        embedFields.push({ name: 'Assigned To', value: 'none', inline: true });
                    }
                    embedFields.push({ name: 'Last Update', value: `<t:${new Date(items[i].last_update).getTime() / 1000}:R>`, inline: true })
                    embed.setFooter({ text: `Index: ${i}` });
                    embed.addFields(embedFields);
                    embedList.push(embed);
                }


                const message = await interaction.channel.messages.fetch(`${todo[0].snowflake}`);
                await message.edit({ embeds: embedList });

                await interaction.editReply('✅ ToDo list entry deleted!');



            }


        } else if (subcommand === 'mark') {
            const todo = await db.query(`SELECT * FROM todo WHERE channel_id = ${interaction.channel.id}`);
            if (todo.length === 0) {
                // Ephemeral reply
                await interaction.editReply('⚠️ No ToDo list exists in this channel!');
            }

            else {
                const index = interaction.options.getInteger('index');
                const status = interaction.options.getString('status');
                const toMark = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);
                await db.query(`UPDATE todo_items SET status = "${status}" WHERE id = ${toMark[index].id}`);
                const items = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);

                const ToDoTitle = todo[0].title;
                const ToDoDescription = todo[0].description;
                let embedList = [];
                embedList.push(new EmbedBuilder().setTitle(ToDoTitle).setDescription(ToDoDescription));
                for (let i = 0; i < items.length; i++) {
                    let embed = new EmbedBuilder().setTitle(items[i].title).setDescription(items[i].description);
                    let embedFields = [];
                    if (items[i].status === 'done') {
                        embed.setColor('GREEN');
                        embedFields.push({ name: 'Status', value: '✅ Done ', inline: true });
                    }
                    else if (items[i].status === 'inprogress') {
                        embed.setColor('YELLOW');
                        embedFields.push({ name: 'Status', value: '⚠️ In Progress ', inline: true });
                    }
                    else {
                        embed.setColor('DARK_RED');
                        embedFields.push({ name: 'Status', value: '❗Not Started ', inline: true });
                    }
                    if (items[i].asignee != null) {
                        const user = await interaction.guild.members.fetch(`${items[i].asignee}`);
                        embedFields.push({ name: 'Assigned To', value: `${user}`, inline: true });
                    }
                    else if (items[i].role != null) {
                        const role = `<@&${items[i].role}>`
                        embedFields.push({ name: 'Assigned To', value: `${role}`, inline: true });
                    }
                    else {
                        embedFields.push({ name: 'Assigned To', value: 'none', inline: true });
                    }
                    embedFields.push({ name: 'Last Update', value: `<t:${new Date(items[i].last_update).getTime() / 1000}:R>`, inline: true })
                    embed.setFooter({ text: `Index: ${i}` });
                    embed.addFields(embedFields);
                    embedList.push(embed);
                }

                const message = await interaction.channel.messages.fetch(`${todo[0].snowflake}`);
                await message.edit({ embeds: embedList });
                await interaction.editReply('✅ ToDo list entry updated!');
            }

        }
        else if (subcommand === 'assign') {
            const todo = await db.query(`SELECT * FROM todo WHERE channel_id = ${interaction.channel.id}`);
            if (todo.length === 0) {
                // Ephemeral reply
                await interaction.editReply('⚠️ No ToDo list exists in this channel!');
            }

            else {
                const index = interaction.options.getInteger('index');
                const user = interaction.options.getUser('user');
                const role = interaction.options.getRole('role');
                if (user == null && role == null) {
                    await interaction.editReply('⚠️ No user or role specified!');
                }
                else {
                    const toAssign = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);
                    {
                        if (user != null) {
                            await db.query(`UPDATE todo_items SET asignee = ${user.id},role = null WHERE id = ${toAssign[index].id}`);
                        }
                        else {
                            await db.query(`UPDATE todo_items SET asignee = null ,role = ${role.id} WHERE id = ${toAssign[index].id}`);
                        }
                    }
                    const items = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);

                    const ToDoTitle = todo[0].title;
                    const ToDoDescription = todo[0].description;
                    let embedList = [];
                    embedList.push(new EmbedBuilder().setTitle(ToDoTitle).setDescription(ToDoDescription));
                    for (let i = 0; i < items.length; i++) {
                        let embed = new EmbedBuilder().setTitle(items[i].title).setDescription(items[i].description);
                        let embedFields = [];
                        if (items[i].status === 'done') {
                            embed.setColor('GREEN');
                            embedFields.push({ name: 'Status', value: '✅ Done ', inline: true });
                        }
                        else if (items[i].status === 'inprogress') {
                            embed.setColor('YELLOW');
                            embedFields.push({ name: 'Status', value: '⚠️ In Progress ', inline: true });
                        }
                        else {
                            embed.setColor('DARK_RED');
                            embedFields.push({ name: 'Status', value: '❗Not Started ', inline: true });
                        }
                        if (items[i].asignee != null) {
                            const user = `<@${items[i].asignee}>`
                            embedFields.push({ name: 'Assigned To', value: `${user}`, inline: true });
                        }
                        else if (items[i].role != null) {
                            const role = `<@&${items[i].role}>`
                            embedFields.push({ name: 'Assigned To', value: `${role}`, inline: true });
                        }
                        else {
                            embedFields.push({ name: 'Assigned To', value: 'none', inline: true });
                        }
                        embedFields.push({ name: 'Last Update', value: `<t:${new Date(items[i].last_update).getTime() / 1000}:R>`, inline: true })
                        embed.setFooter({ text: `Index: ${i}` });
                        embed.addFields(embedFields);
                        embedList.push(embed);
                    }

                    const message = await interaction.channel.messages.fetch(`${todo[0].snowflake}`);
                    await message.edit({ embeds: embedList });
                    await interaction.editReply('✅ ToDo list entry updated!');
                }
            }

        }
        else if (subcommand === 'unassign') {
            const todo = await db.query(`SELECT * FROM todo WHERE channel_id = ${interaction.channel.id}`);
            if (todo.length === 0) {
                // Ephemeral reply
                await interaction.editReply('⚠️ No ToDo list exists in this channel!');
            }

            else {
                const index = interaction.options.getInteger('index');
                const toAssign = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);
                await db.query(`UPDATE todo_items SET asignee = null WHERE id = ${toAssign[index].id}`);
                const items = await db.query(`SELECT * FROM todo_items WHERE todo_id = ${todo[0].id} ORDER BY item_number ASC`);

                const ToDoTitle = todo[0].title;
                const ToDoDescription = todo[0].description;
                let embedList = [];
                embedList.push(new EmbedBuilder().setTitle(ToDoTitle).setDescription(ToDoDescription));
                for (let i = 0; i < items.length; i++) {
                    let embed = new EmbedBuilder().setTitle(items[i].title).setDescription(items[i].description);
                    let embedFields = [];
                    if (items[i].status === 'done') {
                        embed.setColor('GREEN');
                        embedFields.push({ name: 'Status', value: '✅ Done ', inline: true });
                    }
                    else if (items[i].status === 'inprogress') {
                        embed.setColor('YELLOW');
                        embedFields.push({ name: 'Status', value: '⚠️ In Progress ', inline: true });
                    }
                    else {
                        embed.setColor('DARK_RED');
                        embedFields.push({ name: 'Status', value: '❗Not Started ', inline: true });
                    }
                    if (items[i].asignee != null) {
                        const user = await interaction.guild.members.fetch(`${items[i].asignee}`);
                        embedFields.push({ name: 'Assigned To', value: `${user}`, inline: true });
                    }
                    else if (items[i].role != null) {
                        const role = `<@&${items[i].role}>`
                        embedFields.push({ name: 'Assigned To', value: `${role}`, inline: true });
                    }
                    else {
                        embedFields.push({ name: 'Assigned To', value: 'none', inline: true });
                    }
                    embedFields.push({ name: 'Last Update', value: `<t:${new Date(items[i].last_update).getTime() / 1000}:R>`, inline: true })
                    embed.setFooter({ text: `Index: ${i}` });
                    embed.addFields(embedFields);
                    embedList.push(embed);
                }

                const message = await interaction.channel.messages.fetch(`${todo[0].snowflake}`);
                await message.edit({ embeds: embedList });
                await interaction.editReply('✅ ToDo list entry updated!');
            }

        }
    }
}
