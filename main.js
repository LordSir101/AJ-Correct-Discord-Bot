//import { createRequire } from 'module';
//const require = createRequire(import.meta.url);

//****To use require, run npx browserify index.js -o bundle.js in cmd***


// let form  = document.getElementById('send');
// var pos = require('pos');

const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = '!';

client.commands = new Discord.Collection();

const fs = require('fs');

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', ()=>{
  console.log("Online");
})

client.on('message', handleCommand);

async function handleCommand(message) {
  if(!message.content.startsWith(prefix) || message.author.bot) return;

  //split command by whitespace
  const args = message.content.slice(prefix.length).split(/ +/);
  //get first entry in new substring array
  //This will allow parsing of multi word commands EX: !get x and !get y
  const command = args.shift().toLowerCase();

  /*--------COMMANDS--------*/
  if(command === 'ajify'){
    //check if message is a reply
    if(message.reference != null){
      // try{
        const repliedText = await message.channel.messages.fetch(message.reference.messageID)
        let content = repliedText.content;
        client.commands.get('ajify').execute(message, content);
      // }
      // catch(err){
      //   message.channel.send('There was an issue converting the message you requested :(');
      // }
    }
    //not a reply
    else{
      message.channel.send('Please reply to the message you would like to AJ-ify');
    }
  }
}

client.login('token');
