const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const GROUP_ID = process.env.GROUP_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Forward messages from the Channel to the Group
bot.on('channel_post', async (msg) => {
    try {
        const caption = msg.caption || "";
        
        if (msg.photo) {
            // For photos, get the largest size (last in array)
            const photo = msg.photo[msg.photo.length - 1];
            await bot.sendPhoto(GROUP_ID, photo.file_id, { caption });
        } else if (msg.video) {
            await bot.sendVideo(GROUP_ID, msg.video.file_id, { caption });
        } else if (msg.document) {
            await bot.sendDocument(GROUP_ID, msg.document.file_id, { caption });
        } else if (msg.audio) {
            await bot.sendAudio(GROUP_ID, msg.audio.file_id, { caption });
        } else if (msg.voice) {
            await bot.sendVoice(GROUP_ID, msg.voice.file_id, { caption });
        } else if (msg.video_note) {
            await bot.sendVideoNote(GROUP_ID, msg.video_note.file_id);
        } else if (msg.sticker) {
            await bot.sendSticker(GROUP_ID, msg.sticker.file_id);
        } else if (msg.animation) {
            await bot.sendAnimation(GROUP_ID, msg.animation.file_id, { caption });
        } else if (msg.location) {
            await bot.sendLocation(GROUP_ID, msg.location.latitude, msg.location.longitude);
        } else if (msg.venue) {
            await bot.sendVenue(GROUP_ID, msg.venue.location.latitude, msg.venue.location.longitude, msg.venue.title, msg.venue.address);
        } else if (msg.contact) {
            await bot.sendContact(GROUP_ID, msg.contact.phone_number, msg.contact.first_name, {
                last_name: msg.contact.last_name
            });
        } else if (msg.poll) {
            await bot.sendMessage(GROUP_ID, `📊 New poll in channel: "${msg.poll.question}". Check the channel to vote!`);
        } else if (msg.text) {
            await bot.sendMessage(GROUP_ID, `📢 ${msg.text}`);
        } else {
            // For any other message types we don't explicitly handle
            await bot.sendMessage(GROUP_ID, "Check the K Global Channel - a new post is there! 🍄‍🟫");
        }
    } catch (error) {
        console.error('Error forwarding channel post:', error);
        await bot.sendMessage(GROUP_ID, "Check the K Global Channel - a new post is there! 🍄‍🟫");
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
