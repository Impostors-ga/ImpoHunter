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
        }, 5000);
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
            }, 5000);
            return;
        }


        if(reportCount === 0) {
            const embed = msg.embeds[0];
            embed.spliceFields(0, 1);
            embed.addField("Status", "Odrzucono", true);
            embed.addField("Weryfikator", message.author.tag, true);
            embed.setColor("RED")
            embed.addField("Powód", reason[1]);
            msg.edit(embed);
        } else {
            const embed = msg.embeds[0];
            embed.spliceFields(0, 1);
            embed.addField("Status", "Odrzucono", true);
            embed.addField("Weryfikator", message.author.tag, true);
            embed.setColor("RED")
            embed.addField("Powód", reason[1]);
            msg.edit(embed);
        }

        let selfCount = db.fetch(`reports.${number}.rep.count`) || 0;

        db.add(`reports.${number}.rep.count`, 1);
        db.add(`reports.${number}.reports.count`, 1);
        db.add(`reports.${number}.reports.deny.count`, 1);
        db.set(`reports.${number}.reports.deny.${selfCount+1}.user`, message.author.id);
        db.set(`reports.${number}.reports.deny.${selfCount+1}.user_tag`, message.author.tag);
        db.set(`reports.${number}.reports.deny.${selfCount+1}.content`, reason[1]);
        db.set(`reports.${number}.reports.${message.author.id}.content`, reason[1]);
        db.set(`reports.${number}.reports.${message.author.id}.rep`, selfCount+1);
        db.set(`reports.${number}.reports.reported.${message.author.id}`, "deny");
        let author_id = db.fetch(`reports.${number}.user`);
        db.set(`users.${author_id}.reportRejectCount`, db.get(`users.${author_id}.reportRejectCount`)+1);
        const r = await message.reply("To zgłoszenie zostało **odrzucone**!");
        setTimeout(function(){
            r.delete()
            message.delete();
        }, 5000);

        let denyCount = db.fetch(`reports.${number}.reports.deny.count`);
        let reportStatus = db.fetch(`reports.${number}.status`);
        let argTo = Object.keys(db.fetch(`reports.${number}.reports.deny`));

        if(denyCount >= api.toReport && reportStatus === 0) {
            db.set(`reports.${number}.status`, 1);
            let bugOwner = db.fetch(`reports.${number}.user`);
            let bugDescription = db.fetch(`reports.${number}.description`);


            let content = db.fetch(`reports.${number}.content`);
            await message.guild.members.cache.get(bugOwner).send(
                "Twój błąd **" + bugDescription + "** " + `(#${number})` +
                " został odrzucony! Jeśli uważasz, że tak nie powinno się zdarzyć, podaj jak najwięcej informacji w swoim zgłoszeniu." + "\n\n```" +
                db.fetch(`reports.${number}.reports.deny.${argTo[0]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.deny.${argTo[0]}.content`) + "\n" +
                db.fetch(`reports.${number}.reports.deny.${argTo[1]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.deny.${argTo[1]}.content`) + "\n" +
                message.author.tag + ": " + reason[1] + "\n```\n\nTwoje zgłoszenie:```" +
                content + "```"
            )

            let user = db.fetch(`reports.${number}.user`);
            let user_tag = db.fetch(`reports.${number}.user_tag`);
            let message_id = db.fetch(`reports.${number}.message_id`);
            let service = db.fetch(`reports.${number}.service`);
            let description = db.fetch(`reports.${number}.description`);
            let reproduce = db.fetch(`reports.${number}.reproduce`);
            let result = db.fetch(`reports.${number}.result`);
            let settings = db.fetch(`reports.${number}.settings`);
            let creationTimestamp = db.fetch(`reports.${number}.creationTimestamp`);




            const mess = await bot.guilds.cache.get(process.env.GUILDID).channels.cache.get(api.channels.logsChannel).send(
                "───────────────────\n" +
                "**O odrzuconym zgłoszeniu *#" + number + "* zgłoszonym przez " + user_tag + ":**\n\n" +
                "**Usługa:** " + service + "\n" +
                "**Opis:** " + description + "\n" +
                "**Jak powtórzyć błąd:** " + reproduce +
                "**Końcowy wynik:** " + result + "\n" +
                "**Informacje systemowe oraz aplikacji:** " + settings
            );

            const msg = await message.channel.messages.fetch(message_id);
            setTimeout(async function () {
                msg.delete();
                const ms = await message.channel.send("**Zgłoszenie *#" + number + "* zostało odrzucone:** ```" +
                    db.fetch(`reports.${number}.reports.deny.${argTo[0]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.deny.${argTo[0]}.content`) + "\n" +
                    db.fetch(`reports.${number}.reports.deny.${argTo[1]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.deny.${argTo[1]}.content`) + "\n" +
                    message.author.tag + ": " + reason[1] + "\n```")
                setTimeout(function(){
                    ms.delete();
                }, 10000)
            }, 5000);
        }
    }catch(error) {
        console.log(error);
        const msg = await message.reply("**Coś poszło nie tak!** Skontaktuj się z administracją.");
        setTimeout(function(){
            msg.delete();
            message.delete();
        }, 5000);
    }
}

module.exports.help = {name: "reject"}
