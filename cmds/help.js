const Discord = require('discord.js');
exports.run = async (bot, message, args) => {
    let space = "\u200B ";
    const embed = new Discord.MessageEmbed()
        .setAuthor(bot.user.username,  bot.user.displayAvatarURL({format: 'jpg', size: 64, dynamic: true}))
        .setTitle("Pomoc")
        .setColor('GREEN')
        .setTimestamp()
        .addField("<:report:784486796774866995> Jak zgłosić błąd?", "!bug <Among Us/Strona internetowa/Inne> | <Opis> | <Co spowodowało błąd krok po kroku> | <Co powoduje błąd> | <Wersja Systemu, [Wersja gry]>\n\nPrzykład poniżej\n`!bug Among Us | Błąd podczas tworzenia serwera | Tworzę nowy serwer - Jestem na nim przez kilka sekund - Wyrzuca mnie z gry | Wyrzucanie z gry | Windows 10, 2020.11.17`", false)
        .addField("<:emergency:784486793621143583> Jak zaakceptować/odrzucić czyiś błąd?", "!approve <id> | <Wersja Systemu, [Wersja gry]>\n\nPrzykład poniżej\n`!approve 0001 | Windows 10, 2020.11.17`\n\n!reject <id> | <Wersja Systemu, [Wersja gry]>\n\nPrzykład poniżej\n`!reject 0001 | Windows 10, 2020.11.17`", false);
    await message.channel.send(embed);
}

module.exports.help = {name: "help"}
