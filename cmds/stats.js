const Discord = require('discord.js');
const db = require("quick.db");
exports.run = async (bot, message, args) => {
    let reports = db.get(`users.${message.author.id}.reportsCount`);
    let approve = db.get(`users.${message.author.id}.reportApproveCount`);
    let reject = db.get(`users.${message.author.id}.reportRejectCount`);
    const embed = new Discord.MessageEmbed()
        .setAuthor(bot.user.username,bot.user.displayAvatarURL({type: 'png', size: 64}))
        .setTitle("Twoje statystyki")
        .setDescription(`Wszystkie wysłane zgłoszenia:\n**${reports}**\n\nZadelkarował/a występowanie błedu:\n**${approve}**\n\nZadeklarował/a nie występowanie błędu:\n**${reject}**`)
        .setTimestamp()
        .setColor('GREEN');
    await message.channel.send(embed);
};


module.exports.help = {name: "stats"}
