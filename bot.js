const Discord = require("discord.js");
const bot = new Discord.Client({ disableEveryone: true });
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//var Trello = require('trello-node-api')("", "");
const serverMe = require("./server.js");
const db = require("quick.db");
var request = require("request");


const status = {
  0: "Waiting for approval",
  1: "Marked as Bug",
  2: "Verified Bug",
  3: "Not a Bug",
  4: "Bug already reported",
}

const toReport = 3;

async function sendTrello(number, user_tag, service, description, reproduce, result, settings) {
var yourApiKey = "af793d0fe43f9667ae39338dd0daea90";
var yourApiToken = "b431ef9d21972cebcf918fde843e6a07797d4ffb6bd8e6324dc1aa6ba8d8fabc";
var listID = "5e08850bebdced3f4addef9f";
var bug_all = `*Reported by ${user_tag}*\n`.replace("#", "") +
`\n` +
`**Service:**\n` +
`${service}\n` +
`\n` +
`**Description:**\n` +
`${description}\n` +
`\n` +
`**How To Reproduce:**\n` +
`${reproduce}\n` +
`\n` +
`**Result:**\n` +
`${result}\n` +
`\n` +
`**Client Settings:**\n` +
`${settings}\n` +
`\n` +
`\n` +
"*Report ID: ``" + number +"``*";
  
bug_all = bug_all.replace("#", "");
  
var data = null;

var xhr = new XMLHttpRequest();

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === this.DONE) {
    var thisJSON = JSON.parse(this.responseText);
    db.set(`reports.${number}.trello`, thisJSON.shortUrl);

      var options = {
        method: 'POST',
        url: `https://api.trello.com/1/cards/${thisJSON.id}/idLabels`,
        qs: {value: '5e163616e8ff40552aa51990', key: 'af793d0fe43f9667ae39338dd0daea90', token: 'b431ef9d21972cebcf918fde843e6a07797d4ffb6bd8e6324dc1aa6ba8d8fabc'}
      };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
      });
      
      
    
  }
});
console.log(`https://api.trello.com/1/cards?name=${description}&desc=${bug_all}&pos=top&idList=${listID}&keepFromSource=all&key=${yourApiKey}&token=${yourApiToken}`);
xhr.open("POST", `https://api.trello.com/1/cards?name=${description}&desc=${bug_all}&pos=top&idList=${listID}&keepFromSource=all&key=${yourApiKey}&token=${yourApiToken}`);

xhr.send(data);
  
};

bot.on("ready", () => {
  console.log(`${bot.user.username} is ready on ${bot.guilds.size} servers!`);
});


bot.on("ready", () => {
  bot.user
    .setStatus("idle")
    //.then(bot.user.setActivity("https://ssum.ga/", { type: "Playing" }))
    //.then(console.log)
    //.catch(console.error);
});




bot.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;

  let messageArray = message.content.split(" ");
  let command = messageArray[0].toLowerCase();
  let args = messageArray.slice(1);
  var server = bot.guilds.get(message.guild.id).id;
  let prefix = db.get(`main.prefix`) || "!";
  const approvalChannel = bot.channels.get("659492976204054528");
  const reportsChannel = bot.channels.get("663720167171424257");
  const bugsChannel = bot.channels.get("660244477583163423");
  const logsChannel = bot.channels.get("663776905870311433");
  
  
  
  

  if (command === `${prefix}prefix`) {
    if (!message.member.hasPermission("ADMINISTRATOR")) return;

    if (!args[0])
      return message.channel.send(
        "**An argument is missing!**\n*Usage:* ``" +
          prefix +
          "prefix <prefix>``"
      );
    
    
    let prefixNew = args[0];

    db.set(`nprefix_${server}`, prefixNew);

    message.channel.send("Updated prefix to ``" + prefixNew + "``");
    return;
  }
  
  
  
  
  
  

  if (command === `${prefix}report`) {
    
    let bugArgs = message.content.split(" | ");
    if(message.channel.id !== reportsChannel.id) return message.reply("**Please use " + reportsChannel + " channel.**")


    if(bugArgs.length !== 5) {
      const r = await message.reply("Your bug report is not valid.\n\n**Please use our Bug-Tool (<https://ssum.ga/bug-tool/>)**");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    let reportPer = bugArgs[0].replace(prefix + "report", "");
    reportPer = reportPer.replace(" ", "");
    let reproArgs = bugArgs[2].split(" - ");
    let reproList = "\n";
    reproArgs.forEach(function(entry, index) {
    reproList = reproList + "- " + entry + "\n"

    });

    if(reportPer == "Website" || reportPer == "Game" || reportPer == "Other") {} else {
      const r = await message.reply("``Bug Report per`` is not valid in your Bug-Report.\n\n**Please use our Bug-Tool (<https://ssum.ga/bug-tool/>)**");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    db.add(`reports.count`, 1);
    let number = db.fetch(`reports.count`);
    var str = "" + number
    var pad = "0000"
    var ans = pad.substring(0, pad.length - str.length) + str;
    
    number = ans;
    
    
    approvalChannel.send(
      "───────────────────\n" +
      "**" + message.author.tag + "** reported:\n\n" +
      "**Service:** " + reportPer + "\n" +
      "**Description:** " + bugArgs[1] + "\n" +
      "**How To Reproduce:** " + reproList +
      "**Result:** " + bugArgs[3] + "\n" +
      "**Client Settings:** " + bugArgs[4] + "\n" +
      `**Bug Report ID:** *#${number}*\n\n`
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
    

    
    const r = await message.reply("Your report has been successfully added.");
    setTimeout(function(){ 
      r.delete()
      message.delete()
    }, 5000);
    return;
  }
  
  
  
  if (command === `${prefix}about`) {
    let number = args[0];
    
    if(!number) {
      const r = await message.reply("You must provide the **Report Number**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    //if(bugArgs.length !== 5) return message.reply("Report is not valid.\n**Please use our Bug-Tool (<https://ssum.ga/bug-tool/>)**");
    
    var report = db.fetch(`reports.${number}`);
    if(!report) {
      const r = await message.channel.send(`**Report** *#${number}* **not found!**`);
      
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    
    var user = db.fetch(`reports.${number}.user`);
    var user_tag = db.fetch(`reports.${number}.user_tag`);
    var message_id = db.fetch(`reports.${number}.message_id`);
    var service = db.fetch(`reports.${number}.service`);
    var description = db.fetch(`reports.${number}.description`);
    var reproduce = db.fetch(`reports.${number}.reproduce`);
    var result = db.fetch(`reports.${number}.result`);
    var settings = db.fetch(`reports.${number}.settings`);
    var creationTimestamp = db.fetch(`reports.${number}.creationTimestamp`);
    
    
    
    
    message.channel.send(
      "**About report *#" + number + "* by " + user_tag + ":**\n\n" +
      "**Service:** " + service + "\n" +
      "**Description:** " + description + "\n" +
      "**How To Reproduce:** " + reproduce +
      "**Result:** " + result + "\n" +
      "**Client Settings:** " + settings
    );
    
    
    
    //console.log(db.fetch(`reports.${number}`));
    
    return;
  }
  
  
  
  if (command === `${prefix}approve`) {
    
    let number = args[0];
    let reason = message.content.split(" | ");
    
    if(!number) {
      const r = await message.reply("You must provide the **Report Number**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    if(!reason[1]) {
      const r = await message.reply("You must provide your **Client Settings**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    var report = db.fetch(`reports.${number}`);
    
    if(!report) {
      const r = await message.reply(`**Report** *#${number}* **not found!**`);
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    if(db.fetch(`reports.${number}.status`) !== 0) { 
      const r = await message.reply("That report was already **approved/denied**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    var message_id = db.fetch(`reports.${number}.message_id`);
    try{
    var msg = await message.channel.fetchMessage(message_id);
    var reportCount = db.fetch(`reports.${number}.reports.count`);
    var reporter = db.fetch(`reports.${number}.reports.reported.${message.author.id}`);
      
    if(reporter) {
      const r = await message.reply("You already **approved/denied** this report.");
      setTimeout(function(){ 
        r.delete();
        message.delete();  
    }, 5000);
      return;
    }
    
    
    if(reportCount == 0) {
      msg.edit(msg.content + "\n\n" +
              "<:yes:663699857651007498> **" + message.author.tag + "**:" +
               "``" + reason[1] + "``"

              );
    } else {
      msg.edit(msg.content + "\n" +
              "<:yes:663699857651007498> **" + message.author.tag + "**:" +
               "``" + reason[1] + "``"

              );
    }
    var selfCount = db.fetch(`reports.${number}.rep.count`) || 0;
      
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
      
      
      
      const r = await message.reply("You **successfully aproved** that report!");
      setTimeout(function(){ 
        r.delete()
        message.delete();
    }, 5000);
      
      
    
    var approveCount = db.fetch(`reports.${number}.reports.approve.count`);
    var reportStatus = db.fetch(`reports.${number}.status`);
    
    if(approveCount >= toReport && reportStatus == 0) {
      db.set(`reports.${number}.status`, 1);
      var bugOwner = db.fetch(`reports.${number}.user`);
      var bugDescription = db.fetch(`reports.${number}.description`);
      
    var user = db.fetch(`reports.${number}.user`);
    var user_tag = db.fetch(`reports.${number}.user_tag`);
    var message_id = db.fetch(`reports.${number}.message_id`);
    var service = db.fetch(`reports.${number}.service`);
    var description = db.fetch(`reports.${number}.description`);
    var reproduce = db.fetch(`reports.${number}.reproduce`);
    var result = db.fetch(`reports.${number}.result`);
    var settings = db.fetch(`reports.${number}.settings`);
    var creationTimestamp = db.fetch(`reports.${number}.creationTimestamp`);
    var argTo = Object.keys(db.fetch(`reports.${number}.reports.approve`));
    
      
    sendTrello(number, user_tag, service, description, reproduce, result, settings);
      
      
      
    const msg = await message.channel.fetchMessage(message_id);
    const delMsg = await message.channel.send("**Bug-Report *#" + number + "* has been approved:** ```" +
        db.fetch(`reports.${number}.reports.approve.${argTo[0]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.approve.${argTo[0]}.content`) + "\n" +
        db.fetch(`reports.${number}.reports.approve.${argTo[1]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.approve.${argTo[1]}.content`) + "\n" +
        message.author.tag + ": " + reason[1] + "\n```"
        )
    setTimeout(function(){ 
        msg.delete();
        delMsg.delete();
    }, 7500);
      
      
      
    
    const mess = await bugsChannel.send(
      "───────────────────\n" +
      "**About Confirmed Report *#" + number + "* by " + user_tag + ":**\n\n" +
      "**Service:** " + service + "\n" +
      "**Description:** " + description + "\n" +
      "**How To Reproduce:** " + reproduce +
      "**Result:** " + result + "\n" +
      "**Client Settings:** " + settings
    );

      
    var reactMessage = await bugsChannel.fetchMessage(mess.id);
      
      
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
      var trelloLink = db.fetch(`reports.${number}.trello`) || "http://trello.com/b/O8zbzuZg/";
      
      
      message.guild.members.get(bugOwner).send(
        "Your bug **" + bugDescription + "** ``" + `(#${number})` +
        "`` has been approved! Thank you for your report." +
        "🖇️ **Trello Link: <" + trelloLink + ">**"
      )
      
      var role = message.guild.roles.find(role => role.name === "Bug Hunter");
      if(!message.guild.members.get(user)) return;
      message.guild.members.get(user).addRole(role.id);
      
      
      
      
    console.log(message_id);
        
    }, 7500);
    }
      
    
    
    console.log(db.fetch(`reports.${number}.reports`));
    }catch(error) {
      console.error(error);
      const msg = await message.reply("**Something went wrong!** Contact ``IamSushi#0001``.");
      setTimeout(function(){ 
        msg.delete();
        message.delete();
    }, 5000);
    }
    
    return;
  }
  
  
  
  
  
    if (command === `${prefix}deny`) {
    
    let number = args[0];
    let reason = message.content.split(" | ");
    
    if(!number) {
      const r = await message.reply("You must provide the **Report Number**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    if(!reason[1]) {
      const r = await message.reply("You must provide your **Client Settings**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    var report = db.fetch(`reports.${number}`);
    
    if(!report) {
      const r = await message.reply(`**Report** *#${number}* **not found!**`);
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    if(db.fetch(`reports.${number}.status`) !== 0) { 
      const r = await message.reply("That report was already **approved/denied**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    var message_id = db.fetch(`reports.${number}.message_id`);
    try{
    var msg = await message.channel.fetchMessage(message_id);
    var reportCount = db.fetch(`reports.${number}.reports.count`);
    var reporter = db.fetch(`reports.${number}.reports.reported.${message.author.id}`);
      
    if(reporter) {
      const r = await message.reply("You already **approved/denied** this report.");
      setTimeout(function(){ 
        r.delete();
    }, 5000);
      return;
    }
    
    
    if(reportCount == 0) {
      msg.edit(msg.content + "\n\n" +
              "<:no:663699857663328292> **" + message.author.tag + "**:" +
               "``" + reason[1] + "``"

              );
    } else {
      msg.edit(msg.content + "\n" +
              "<:no:663699857663328292> **" + message.author.tag + "**:" +
               "``" + reason[1] + "``"

              );
    }
      
    var selfCount = db.fetch(`reports.${number}.rep.count`) || 0;
    
    db.add(`reports.${number}.rep.count`, 1);
    db.add(`reports.${number}.reports.count`, 1);
    db.add(`reports.${number}.reports.deny.count`, 1);
    db.set(`reports.${number}.reports.deny.${selfCount+1}.user`, message.author.id);
    db.set(`reports.${number}.reports.deny.${selfCount+1}.user_tag`, message.author.tag);
    db.set(`reports.${number}.reports.deny.${selfCount+1}.content`, reason[1]);
    db.set(`reports.${number}.reports.${message.author.id}.content`, reason[1]);
    db.set(`reports.${number}.reports.${message.author.id}.rep`, selfCount+1);
    db.set(`reports.${number}.reports.reported.${message.author.id}`, "deny");
      
      
      
      const r = await message.reply("You **successfully denied** that report!");
      setTimeout(function(){ 
        r.delete()
        message.delete();
    }, 5000);
      
      
    
    var denyCount = db.fetch(`reports.${number}.reports.deny.count`);
    var reportStatus = db.fetch(`reports.${number}.status`);
    var argTo = Object.keys(db.fetch(`reports.${number}.reports.deny`));
    
    if(denyCount >= toReport && reportStatus == 0) {
      db.set(`reports.${number}.status`, 1);
      var bugOwner = db.fetch(`reports.${number}.user`);
      var bugDescription = db.fetch(`reports.${number}.description`);
      
      
      var content = db.fetch(`reports.${number}.content`);
      message.guild.members.get(bugOwner).send(
        "Your bug **" + bugDescription + "** ``" + `(#${number})` +
        "`` has been denied! If you think thats an error, please provide as many information in your report." + "\n\n```" +
        db.fetch(`reports.${number}.reports.deny.${argTo[0]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.deny.${argTo[0]}.content`) + "\n" +
        db.fetch(`reports.${number}.reports.deny.${argTo[1]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.deny.${argTo[1]}.content`) + "\n" +
        message.author.tag + ": " + reason[1] + "\n```\n\nYour Report:```" +
        content + "```"
      )
      
    var user = db.fetch(`reports.${number}.user`);
    var user_tag = db.fetch(`reports.${number}.user_tag`);
    var message_id = db.fetch(`reports.${number}.message_id`);
    var service = db.fetch(`reports.${number}.service`);
    var description = db.fetch(`reports.${number}.description`);
    var reproduce = db.fetch(`reports.${number}.reproduce`);
    var result = db.fetch(`reports.${number}.result`);
    var settings = db.fetch(`reports.${number}.settings`);
    var creationTimestamp = db.fetch(`reports.${number}.creationTimestamp`);
    
    
    
    
    const mess = await logsChannel.send(
      "───────────────────\n" +
      "**About Denied Report *#" + number + "* by " + user_tag + ":**\n\n" +
      "**Service:** " + service + "\n" +
      "**Description:** " + description + "\n" +
      "**How To Reproduce:** " + reproduce +
      "**Result:** " + result + "\n" +
      "**Client Settings:** " + settings
    );

    console.log(message_id);
    const msg = await message.channel.fetchMessage(message_id);
    setTimeout(async function () { 
        msg.delete();
        const ms = await message.channel.send("**Bug-Report *#" + number + "* has been denied:** ```" +
        db.fetch(`reports.${number}.reports.deny.${argTo[0]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.deny.${argTo[0]}.content`) + "\n" +
        db.fetch(`reports.${number}.reports.deny.${argTo[1]}.user_tag`) + ": " + db.fetch(`reports.${number}.reports.deny.${argTo[1]}.content`) + "\n" +
        message.author.tag + ": " + reason[1] + "\n```")
        setTimeout(function(){
          ms.delete();
        }, 10000)
    }, 5000);

      
      
      
    }
      
    
    
    console.log(db.fetch(`reports.${number}.reports`));
    }catch(error) {
      const msg = await message.reply("**Something went wrong!** Contact ``IamSushi#0001``.");
      setTimeout(function(){ 
        msg.delete();
        message.delete();
    }, 5000);
    }
    
    return;
  }
  
  
  
  
  
  
  
  
  
    
      if (command === `${prefix}revoke`) {
    
    let number = args[0];
    
    if(!number) {
      const r = await message.reply("You must provide the **Report Number**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    var report = db.fetch(`reports.${number}`);
    
    if(!report) {
      const r = await message.reply(`**Report** *#${number}* **not found!**`);
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
        
    if(!db.fetch(`reports.${number}.reports.reported.${message.author.id}`)) {
      const r = await message.reply(`**There is nothing to revoke!**`);
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    if(db.fetch(`reports.${number}.status`) !== 0) { 
      const r = await message.reply("That report was already **approved/denied**. You can not edit it!");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    var msgContent = db.fetch(`reports.${number}.reports.${message.author.id}.content`)
    var message_id = db.fetch(`reports.${number}.message_id`);
    try{
    var msg = await message.channel.fetchMessage(message_id);
    var reportCount = db.fetch(`reports.${number}.reports.${message.author.id}.rep`)
    console.log(reportCount);
    var app = db.fetch(`reports.${number}.reports.approve`) || {1: 1};
    var den = db.fetch(`reports.${number}.reports.deny`) || {1: 1};
      
    if(reportCount == Object.keys(app)[0] || reportCount == Object.keys(den)[0])  {
      msg.edit(msg.content.replace(msgContent, "").replace("<:yes:663699857651007498> **" + message.author.tag + "**:", "").replace("\n\n<:no:663699857663328292> **" + message.author.tag + "**:", "").replace("````", ""));
    } else {
      msg.edit(msg.content.replace(msgContent, "").replace("<:yes:663699857651007498> **" + message.author.tag + "**:", "").replace("\n<:no:663699857663328292> **" + message.author.tag + "**:", ""));
    }
      
    if(db.fetch(`reports.${number}.reports.reported.${message.author.id}`) == "approve") {
      var fData = await db.fetch(`reports.${number}.reports.${message.author.id}.rep`);
      console.log(fData);
      
      db.delete(`reports.${number}.reports.approve.${fData}`);
      db.delete(`reports.${number}.reports.approve.${fData}.user`);
      db.delete(`reports.${number}.reports.approve.${fData}.user_tag`);
      db.delete(`reports.${number}.reports.approve.${fData}.content`);
      
      db.add(`reports.${number}.reports.approve.count`, -1);
    } else if(db.fetch(`reports.${number}.reports.reported.${message.author.id}`) == "deny") {
      var fData = await db.fetch(`reports.${number}.reports.${message.author.id}.rep`);
      
      db.delete(`reports.${number}.reports.deny.${fData}`);
      db.delete(`reports.${number}.reports.deny.${fData}.user`);
      db.delete(`reports.${number}.reports.deny.${fData}.user_tag`);
      db.delete(`reports.${number}.reports.deny.${fData}.content`);
      
      db.add(`reports.${number}.reports.deny.count`, -1);
    }
      
    db.add(`reports.${number}.reports.count`, -1);
    db.delete(`reports.${number}.reports.reported.${message.author.id}`);
      
    const messa = await message.reply("**I succesfully revoked the report approve/deny.**");
      setTimeout(function(){ 
        messa.delete();
        message.delete();
    }, 5000);
      
    }catch(error) {
      console.log(error);
      const msg = await message.reply("**Something went wrong!** Contact ``IamSushi#0001``.");
      setTimeout(function(){ 
        msg.delete();
        message.delete();
    }, 5000);
    }
    
    return;
  }
  
  
      if (command === `${prefix}trello`) {
    
    let number = args[0];
    let reason = message.content.split(" | ");
    
    if(!number) {
      const r = await message.reply("You must provide the **Report Number**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    if(!reason[1]) {
      const r = await message.reply("You must provide your **Client Settings**.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    var report = db.fetch(`reports.${number}`);
    
    if(!report) {
      const r = await message.reply(`**Report** *#${number}* **not found!**`);
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    if(db.fetch(`reports.${number}.status`) == 0) { 
      const r = await message.reply("That report is waiting in the **approval queue!*.");
      setTimeout(function(){ 
        r.delete()
        message.delete()
    }, 5000);
      return;
    }
    
    var message_id = db.fetch(`reports.${number}.message_id`);
    try{
    var msg = await message.channel.fetchMessage(message_id);
    
      msg.edit(msg.content + "\n\n" +
              "🖇️ **Trello: <" + reason[1] + ">**"

              );
      
      
    db.set(`reports.${number}.trello`, reason[1]);
      
      
      
      const r = await message.reply("You **successfully added** and Trello link!");
      setTimeout(function(){ 
        r.delete()
        message.delete();
    }, 5000);
      
      
    
      
    console.log(db.fetch(`reports.${number}.reports`));
    }catch(error) {
      const msg = await message.reply("**Something went wrong!** Contact ``IamSushi#0001``.");
      setTimeout(function(){ 
        msg.delete();
        message.delete();
    }, 5000);
    }
    
    return;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  if(message.channel.id == "659492976204054528" || message.channel.id == "660244477583163423") {
    
    if(message.content.startsWith("/")) return;
    const msg = await message.reply("Please use only commands here.");
      setTimeout(function(){ 
        msg.delete();
        message.delete();
    }, 5000);
  }
});












bot.login("NjYwMjY2NTAzOTgzMjAyMzA1.XhNpQw.DskHSutcpVwYY4Yy1v8SP3meaJc");