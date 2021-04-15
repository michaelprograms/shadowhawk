const { Client } = require('discord.js');
const Config = require('./config.json');

const client = new Client({ partials: ['CHANNEL', 'MESSAGE', 'REACTION'] });
client.login(Config.DISCORD_TOKEN);

let Voice = {
  channel: undefined,
  messages: [],
};
let Reactions = {
  channel: undefined,
  messages: [],
};

/* -------------------------------------------------------------------------- */

client.on('ready', async () => {
  console.info(`Logged in as ${client.user.tag}!`);
  Voice.channel = client.channels.cache.find(i => i.name === Config.VOICE_MESSAGE_CHANNEL);
  Reactions.channel = client.channels.cache.find(i => i.name === Config.REACTION_MESSAGE_CHANNEL);
  await pruneMessages();
});

client.on('voiceStateUpdate', voiceStateUpdate);
client.on('messageReactionAdd', async (reaction, user) => await messageReaction('add', reaction, user));
client.on('messageReactionRemove', async (reaction, user) => await messageReaction('remove', reaction, user));

client.setInterval(sendMessages, 5000);                           // 5 seconds
client.setInterval(async () => await pruneMessages(), 3600000);   // 1 hour

/* -------------------------------------------------------------------------- */

function voiceStateUpdate(oldState, newState) {
  if (oldState.member.user.bot) return;

  let message;
  if (newState.channelID === null) {
    message = `**${newState.member.displayName}** disconnected from \`${oldState.channel.name}\``;
  } else if (oldState.channelID === null) {
    message = `**${newState.member.displayName}** connected to \`${newState.channel.name}\``;
  } else if (oldState.channelID !== newState.channelID) {
    message = `**${newState.member.displayName}** moved to \`${newState.channel.name}\` from \`${oldState.channel.name}\``;
  } else {
    return;
  }
  Voice.messages.push(message);
}

async function messageReaction(action, reaction, user) {
  if (Config.REACTION_WATCH_CHANNELS.indexOf(reaction.message.channel.name) < 0) {
    return;
  }
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the reaction:', error);
      return;
    }
  }
  let displayName = reaction.message.guild.member(user).displayName;
  let verb = action + (action === 'add' ? 'ed' : 'd');
  let preposition = (action === 'add' ? 'to' : 'from');
  let message = `**${displayName}** ${verb} ${reaction.emoji.name} (${reaction.count}) ${preposition} \`\`\`\n${reaction.message.content}\n\`\`\``;
  Reactions.messages.push(message);
}

function sendMessages() {
  if (Voice.messages.length) {
    Voice.channel.send(Voice.messages.join('\n'));
    Voice.messages = [];
  }
  if (Reactions.messages.length) {
    Reactions.channel.send(Reactions.messages.join('\n'));
    Reactions.messages = [];
  }
}

async function pruneMessages() {
  let threshold = Date.now() - (3600000 * 6);                     // 6 hours
  await Voice.channel.messages.fetch({ limit: 100 }).then(messages => {
    messages.sweep(message => message.createdTimestamp >= threshold);
    if (messages.size) Voice.channel.bulkDelete(messages, true);
  });
}