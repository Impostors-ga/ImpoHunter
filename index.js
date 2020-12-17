const Discord = require('discord.js');
const bot = new Discord.Client({ disableEveryone: true });
const fs = require("fs");

require('dotenv').config();

global.api = {};

api.channels = {};

api.channels.approvalChannel = "788760466830393375";
api.channels.logsChannel = "784426453244182548";

api.enum = {};
api.enum.status = {
    0: "Oczekuje na potwierdzenie",
    1: "Oznaczone jako błąd",
    2: "Zweryfikowany błąd",
    3: "To nie jest Błąd",
    4: "Błąd znany oraz zgłoszony wcześniej",
}

api.toReport = 2;

api.sendTrello = async (number, user_tag, service, description, reproduce, result, settings) =>  {
    const yourApiKey = process.env.APIKEY;
    const yourApiToken = process.env.APITOKEN;
    const listID = process.env.LISTID;
    let bug_all = `*Zgłoszone przez ${user_tag}*\n`.replace("#", "") +
        `\n` +
        `**Usługa:**\n` +
        `${service}\n` +
        `\n` +
        `**Opis:**\n` +
        `${description}\n` +
        `\n` +
        `**Jak powtórzyć błąd:**\n` +
        `${reproduce}\n` +
        `\n` +
        `**Końcowy wynik:**\n` +
        `${result}\n` +
        `\n` +
        `**Informacje systemowe oraz aplikacji:**\n` +
        `${settings}\n` +
        `\n` +
        `\n` +
        "*ID zgłoszenia: ``" + number + "``*";

    bug_all = bug_all.replace("#", "");

    let data = null;

    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            let thisJSON = JSON.parse(this.responseText);
            db.set(`reports.${number}.trello`, thisJSON.shortUrl);

            let options = {
                method: 'POST',
                url: `https://api.trello.com/1/cards/${thisJSON.id}/idLabels`,
                qs: {value: process.env.LISTID, key: process.env.APIKEY, token: process.env.APITOKEN}
            };

            request(options, function (error, response, body) {
                if (error) console.log(error); //throw new Error(error);
                console.log(body);
            });
        }
    });
    console.log(`https://api.trello.com/1/cards?name=${description}&desc=${bug_all}&pos=top&idList=${listID}&keepFromSource=all&key=${yourApiKey}&token=${yourApiToken}`);
    xhr.open("POST", `https://api.trello.com/1/cards?name=${description}&desc=${bug_all}&pos=top&idList=${listID}&keepFromSource=all&key=${yourApiKey}&token=${yourApiToken}`);

    xhr.send(data);
};

bot.config = require("./config.json");
bot.cmds = new Discord.Collection();
const prefix = bot.config.prefix;

const db = require("quick.db");
const request = require("request");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

fs.readdir("./cmds/", (err, files) => {
    if (err) console.log(err);

    let file = files.filter(f => f.split(".").pop() === "js")
    if (file.length <= 0) {
        return;
    }
    file.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        bot.cmds.set(props.help.name, props);
    });
});

bot.on('ready', async () => {
    console.log(`Logged in as ${bot.user.tag}`);//:)
    const stats = [{name: "Szukaniu błędów gry :)", type: "COMPETING"}, {name: "impostors.ga", type: "WATCHING"}];

    const index = Math.floor(Math.random() * (stats.length - 1) + 1);
    await bot.user.setActivity(stats[index].name, {type: stats[index].type});
    await bot.user.setStatus('idle');
    setInterval(async () => {
        const index = Math.floor(Math.random() * (stats.length - 1) + 1);
        await bot.user.setActivity(stats[index].name, {type: stats[index].type});
    }, 1000 * 60 * 3);
});


bot.on("message", msg => {
    if (msg.author.bot) return;
    if (msg.channel.type === "dm") return;

    if(msg.channel.id !== "788739144452931585" && msg.channel.id !== api.channels.approvalChannel && msg.channel.id !== api.channels.logsChannel){ // #boty
        return;
    }

    if (!msg.content.startsWith(prefix)) return;
    let msgArray = msg.content.split(" ");
    let cmd = msgArray[0].toLocaleLowerCase();
    let args = msgArray.slice(1);
    let cmdfile = bot.cmds.get(cmd.slice(prefix.length));

    if (cmdfile) {
        cmdfile.run(bot, msg, args);
    } else return;
});

bot.on('error', console.error);
bot.on('guildMemberRemove', member => {
    // Może zapis roli, albo cuś
});
bot.on('guildMemberAdd', async member => {
    // może nadawanie roli, albo cuś :P
});

bot.login(process.env.BOTTOKEN);
