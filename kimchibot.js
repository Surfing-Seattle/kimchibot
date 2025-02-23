const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GROUP_ID = process.env.GROUP_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Forward messages from the Channel to the Group
bot.on('message', (msg) => {
    if (msg.chat.type === "channel") {
        bot.sendMessage(GROUP_ID, `📢 ${msg.text}`);
    }
});

// Auto-reply when users type /kimchi
bot.onText(/\/kimchi/, (msg) => {
    bot.sendMessage(msg.chat.id, "🔥 Kimchi is life! Glad you made it to the Kimchi Token Community! 👑");
});

// Daily post
setInterval(() => {
    bot.sendMessage(GROUP_ID, "🔥 Stay spicy! #KimchiToTheMoon 🚀 🌕 ");
}, 86400000); // Sends every 24 hours (86400000 ms)

console.log("KimchiBot is running...");
