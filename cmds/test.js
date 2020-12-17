const Discord = require('discord.js');
const db = require("quick.db");
exports.run = async (bot, message, args) => {
    // const embed = new Discord.MessageEmbed()
    //     .setAuthor(bot.user.username,bot.user.displayAvatarURL({type: 'png', size: 64}))
    //     .setTitle("Problem ze zgłoszeniem przez komende?")
    //     .setDescription("Kliknij w <a:hajs:787977797633179698> aby utworzyć inteligentne zgłoszenie błędu")
    //     .setTimestamp(new Date())
    //     .setColor('CYAN');
    // await message.channel.send(embed).then(async (a) => await a.react("<a:hajs:787977797633179698>"));
    // db.delete([`users`]);
    // await message.channel.send(`\`\`\`js\n${JSON.stringify(await db.fetch(`users.${message.author.id}`), null, 2)}\n\`\`\``);
};


module.exports.help = {name: "test"}