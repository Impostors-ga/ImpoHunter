const Discord = require('discord.js');
const db = require("quick.db");
exports.run = async (bot, message, args) => {
    let number = args[0];
    let reason = message.content.split(" | ");

    if(!number) {
        const r = await message.reply("Musisz podać **ID zgłoszenia**.");
        setTimeout(function(){
            r.delete()
            message.delete()
        }, 10000);
        return;
    }

    if(!reason[1]) {
        const r = await message.reply("Podaj informacje systemowe oraz aplikacji.");
        setTimeout(function(){
            r.delete()
            message.delete()
        }, 10000);
        return;
    }

    let report = db.fetch(`reports.${number}`);

    if(!report) {
        const r = await message.reply(`**Nie znaleziono zgłoszenia** *#${number}* **!**`);
        setTimeout(function(){
            r.delete()
            message.delete()
        }, 10000);
        return;
    }

    if(db.fetch(`reports.${number}.status`) !== 0) {
        const r = await message.reply("To zgłoszenie zostało już **zaakceptowane/odrzucone**.");
        setTimeout(function(){
            r.delete()
            message.delete()
        }, 10000);
        return;
    }

    let message_id = db.fetch(`reports.${number}.message_id`);
    try{
        let msg = await bot.guilds.cache.get(process.env.GUILDID).channels.cache.get(api.channels.approvalChannel).messages.fetch(message_id);
        let reportCount = db.fetch(`reports.${number}.reports.count`);
        let reporter = db.fetch(`reports.${number}.reports.reported.${message.author.id}`);

        if(reporter) {
            const r = await message.reply("Już **zaakceptowałeś/odrzuciłeś** to zgłoszenie.");
            setTimeout(function(){
                r.delete();
                message.delete();
            }, 10000);
            return;
        }

        if(reportCount === 0) {
            msg.edit(msg.content + "\n\n" +
                ":+1: **" + message.author.tag + "**:" +
                "`" + reason[1] + "`"

            );
        } else {
            msg.edit(msg.content + "\n" +
                ":+1: **" + message.author.tag + "**:" +
                "`" + reason[1] + "`"

            );
        }
        let selfCount = db.fetch(`reports.${number}.rep.count`) || 0;

        db.add(`reports.${number}.rep.count`, 1);
        db.add(`reports.${number}.reports.count`, 1);
        db.add(`reports.${number}.reports.approve.count`, 1);
        db.set(`reports.${number}.reports.${message.author.id}.reportCount`, reportCount+1);
        db.set(`reports.${number}.reports.approve.${selfCount+1}.user`, message.author.id);
        db.set(`reports.${number}.reports.approve.${selfCount+1}.user_tag`, message.author.tag);
        db.set(`reports.${number}.reports.approve.${selfCount+1}.content`, reason[1]);
        db.set(`reports.${number}.reports.${message.author.id}.content`, reason[1]);
        db.set(`reports.${number}.reports.${message.author.id}.rep`, selfCount+1);
        db.set(`reports.${number}.reports.reported.${message.author.id}`, "approve");

        const r = await message.reply("**Zaakceptowałeś** to zgłoszenie!");
        setTimeout(function(){
            r.delete()
            message.delete();
        }, 10000);

        let approveCount = db.fetch(`reports.${number}.reports.approve.count`);
        let reportStatus = db.fetch(`reports.${number}.status`);

        if(approveCount >= api.toReport && reportStatus === 0) {
            db.set(`reports.${number}.status`, 1);
            let bugOwner = db.fetch(`reports.${number}.user`);
            let bugDescription = db.fetch(`reports.${number}.description`);

            let user = db.fetch(`reports.${number}.user`);
            let user_tag = db.fetch(`reports.${number}.user_tag`);
            let message_id = db.fetch(`reports.${number}.message_id`);
            let service = db.fetch(`reports.${number}.service`);
            let description = db.fetch(`reports.${number}.description`);
            let reproduce = db.fetch(`reports.${number}.reproduce`);
            let result = db.fetch(`reports.${number}.result`);
            let settings = db.fetch(`reports.${number}.settings`);
            let creationTimestamp = db.fetch(`reports.${number}.creationTimestamp`);
            let argTo = Object.keys(db.fetch(`reports.${number}.reports.approve`));

            await api.sendTrello(number, user_tag, service, description, reproduce, result, settings);

            const msg = await message.channel.messages.fetch(message_id);
            const delMsg = await message.channel.send("**Zgłoszenie *#" + number + "* zostało zaakceptowane:** ```" +
                db.fetch(`reports.${number}.reports.approve.${argTo[0]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.approve.${argTo[0]}.content`) + "\n" +
                db.fetch(`reports.${number}.reports.approve.${argTo[1]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.approve.${argTo[1]}.content`) + "\n" +
                message.author.tag + ": " + reason[1] + "\n```"
            )
            setTimeout(function(){
                msg.delete();
                delMsg.delete();
            }, 10000);

            const mess = await bot.guilds.cache.get(process.env.GUILDID).channels.cache.get(api.channels.logsChannel).send(
                "───────────────────\n" +
                "**O potwierdzonym zgłoszeniu *#" + number + "* zgłoszonym przez " + user_tag + ":**\n\n" +
                "**Usługa:** " + service + "\n" +
                "**Opis:** " + description + "\n" +
                "**Jak powtórzyć błąd:** " + reproduce +
                "**Końcowy wynik:** " + result + "\n" +
                "**Informacje systemowe oraz aplikacji:** " + settings
            );

            let reactMessage = await bot.guilds.cache.get(process.env.GUILDID).channels.cache.get(api.channels.approvalChannel).messages.fetch(mess.id);

            setTimeout(function(){

                db.set(`reports.${number}.message_id`, mess.id);
                mess.react('1️⃣')
                    .then(() => mess.react('2️⃣'))
                    .then(() => mess.react('3️⃣'))
                    .then(() => mess.react('4️⃣'))
                    .then(() => mess.react('5️⃣'))
                    .then(() => mess.edit(mess.content + "\n\n" +
                        "🖇️ **Trello: <" + db.fetch(`reports.${number}.trello`) + ">**"
                    ));
                let trelloLink = db.fetch(`reports.${number}.trello`) || "https://trello.com/b/1SH81YNK/";


                message.guild.members.cache.get(bugOwner).send(
                    "Twój błąd **" + bugDescription + "** ``" + `(#${number})` +
                    "`` został zaakceptowany! Dziękujemy za twoje zgłoszenie." +
                    "🖇️ **Trello Link: <" + trelloLink + ">**"
                )

                let role = message.guild.roles.find(role => role.name === "Bug Hunter");
                if(!message.guild.members.get(user)) return;
                message.guild.members.cache.get(user).roles.add(role.id);
            }, 10000);
        }
    }catch(error) {
        console.error(error);
        const msg = await message.reply("**Coś poszło nie tak!** Skontaktuj się z administracją.");
        setTimeout(function(){
            msg.delete();
            message.delete();
        }, 5000);
    }
}

module.exports.help = {name: "approve"}
