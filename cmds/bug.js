const Discord = require('discord.js');
const db = require("quick.db");
exports.run = async (bot, message, args) => {
    let bugArgs = message.content.split(" | ");

    if(bugArgs.length !== 5) {
        const r = await message.reply("Twoje zgłoszenie nie jest poprawnie sformatowane.\n\n**Użyj generatora zgłoszeń (<https://6t2zrfm6mgr.typeform.com/to/HlR7khnE>)**");
        setTimeout(function(){
            r.delete()
            message.delete()
        }, 10000);
        return;
    }

    let reportPer = bugArgs[0].replace(bot.config.prefix + "bug", "");
    reportPer = reportPer.replace(" ", "");
    reportPer = reportPer.toLowerCase();
    let reproArgs = bugArgs[2].split(" - ");
    let reproList = "\n";
    reproArgs.forEach(function(entry, index) {
        reproList = reproList + "- " + entry + "\n"

    });

    if(reportPer === "strona internetowa" || reportPer === "among us" || reportPer === "inne") {} else {
        const r = await message.reply(reportPer + " | Twoje zgłoszenie nie jest poprawnie sformatowane.\n\n**Użyj generatora zgłoszeń (<https://6t2zrfm6mgr.typeform.com/to/HlR7khnE>)**");
        setTimeout(function(){
            r.delete()
            message.delete()
        }, 10000);
        return;
    }

    db.add(`reports.count`, 1);
    let number = db.fetch(`reports.count`);
    var str = "" + number
    var pad = "0000"
    var ans = pad.substring(0, pad.length - str.length) + str;

    number = ans;


    bot.guilds.cache.get(process.env.GUILDID).channels.cache.get(api.channels.approvalChannel).send(
        "───────────────────\n" +
        "**Zgłoszenie " + message.author.tag + "**:\n\n" +
        "**Usługa:** " + reportPer + "\n" +
        "**Opis:** " + bugArgs[1] + "\n" +
        "**Jak powtórzyć błąd:** " + reproList +
        "**Końcowy wynik:** " + bugArgs[3] + "\n" +
        "**Informacje systemowe oraz aplikacji:** " + bugArgs[4] + "\n" +
        `**ID zgłoszenia:** *#${number}*\n\n`
    ).then(msg => {
        db.set(`reports.${number}.user`, message.author.id);
        db.set(`reports.${number}.user_tag`, message.author.tag);
        db.set(`reports.${number}.message_id`, msg.id);
        db.set(`reports.${number}.service`, reportPer);
        db.set(`reports.${number}.description`, bugArgs[1]);
        db.set(`reports.${number}.reproduce`, reproList);
        db.set(`reports.${number}.result`, bugArgs[3]);
        db.set(`reports.${number}.content`, message.content);
        db.set(`reports.${number}.settings`, bugArgs[4]);
        db.set(`reports.${number}.status`, 0);
        db.set(`reports.${number}.creationTimestamp`, Date.now());


        db.set(`reports.${number}.reports.count`, 0);

        console.log(db.fetch(`reports.${number}`));
    });



    const r = await message.reply("Twoje zgłoszenie zostało pomyślnie dodane!");
    setTimeout(function(){
        r.delete()
        message.delete()
    }, 10000);
    return;
}

module.exports.help = {name: "bug"}
