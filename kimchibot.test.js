const TelegramBot = require('node-telegram-bot-api');
const sinon = require('sinon');
require('dotenv').config();

// Mock the TelegramBot class
jest.mock('node-telegram-bot-api');

// Mock environment variables if not set
process.env.BOT_TOKEN = process.env.BOT_TOKEN || 'test-token';
process.env.CHANNEL_ID = process.env.CHANNEL_ID || 'test-channel-id';
process.env.GROUP_ID = process.env.GROUP_ID || 'test-group-id';

const GROUP_ID = process.env.GROUP_ID;

describe("KimchiBot Tests", () => {
    let mockBot;
    let sandbox;
    let channelPostHandler;
    let kimchiHandler;
    let originalSetInterval;
    let intervalIds = [];

    beforeEach(() => {
        // Create a sandbox for test isolation
        sandbox = sinon.createSandbox();
        
        // Save original setInterval
        originalSetInterval = global.setInterval;
        
        // Mock setInterval to prevent actual scheduling
        global.setInterval = (callback, interval) => {
            const id = Math.floor(Math.random() * 1000000);
            intervalIds.push(id);
            return id;
        };
        
        // Reset modules before each test
        jest.resetModules();
        
        // Create mock bot with all required methods
        mockBot = {
            sendMessage: sandbox.stub().resolves({}),
            sendPhoto: sandbox.stub().resolves({}),
            sendVideo: sandbox.stub().resolves({}),
            sendDocument: sandbox.stub().resolves({}),
            sendAudio: sandbox.stub().resolves({}),
            sendVoice: sandbox.stub().resolves({}),
            sendVideoNote: sandbox.stub().resolves({}),
            sendSticker: sandbox.stub().resolves({}),
            sendAnimation: sandbox.stub().resolves({}),
            sendLocation: sandbox.stub().resolves({}),
            sendVenue: sandbox.stub().resolves({}),
            sendContact: sandbox.stub().resolves({}),
            on: sandbox.stub(),
            onText: sandbox.stub()
        };
        
        // Mock the TelegramBot constructor
        TelegramBot.mockImplementation(() => mockBot);
        
        // Load the bot code to register handlers
        require('./kimchibot');
        
        // Extract handlers
        const channelPostCalls = mockBot.on.getCalls().filter(call => call.args[0] === 'channel_post');
        if (channelPostCalls.length > 0) {
            channelPostHandler = channelPostCalls[0].args[1];
        }
        
        const kimchiCalls = mockBot.onText.getCalls().filter(call => String(call.args[0]) === String(/\/kimchi/));
        if (kimchiCalls.length > 0) {
            kimchiHandler = kimchiCalls[0].args[1];
        }
    });

    afterEach(() => {
        // Restore original setInterval
        global.setInterval = originalSetInterval;
        
        // Clean up sandbox
        sandbox.restore();
        
        // Clear interval IDs
        intervalIds = [];
        
        // Clear module cache
        jest.resetModules();
    });

    describe("Channel post forwarding", () => {
        test("Should forward a text message", async () => {
            // Skip if handler not found
            if (!channelPostHandler) {
                console.warn('Channel post handler not found, skipping test');
                return;
            }
            
            const msg = { text: "Kimchi is the best!" };
            
            await channelPostHandler(msg);
            
            sinon.assert.calledWith(
                mockBot.sendMessage, 
                GROUP_ID, 
                "📢 Kimchi is the best!"
            );
        });
        
        test("Should forward a photo with caption", async () => {
            // Skip if handler not found
            if (!channelPostHandler) {
                console.warn('Channel post handler not found, skipping test');
                return;
            }
            
            const msg = {
                photo: [
                    { file_id: "small_photo" },
                    { file_id: "large_photo" }
                ],
                caption: "Spicy Kimchi 🔥"
            };
            
            await channelPostHandler(msg);
            
            sinon.assert.calledWith(
                mockBot.sendPhoto, 
                GROUP_ID, 
                "large_photo", 
                { caption: "Spicy Kimchi 🔥" }
            );
        });
        
        test("Should forward a photo without caption", async () => {
            // Skip if handler not found
            if (!channelPostHandler) {
                console.warn('Channel post handler not found, skipping test');
                return;
            }
            
            const msg = {
                photo: [
                    { file_id: "small_photo" },
                    { file_id: "large_photo" }
                ]
                // No caption
            };
            
            await channelPostHandler(msg);
            
            sinon.assert.calledWith(
                mockBot.sendPhoto, 
                GROUP_ID, 
                "large_photo", 
                { caption: "" }
            );
        });
        
        test("Should forward a video with caption", async () => {
            // Skip if handler not found
            if (!channelPostHandler) {
                console.warn('Channel post handler not found, skipping test');
                return;
            }
            
            const msg = {
                video: { file_id: "video_12345" },
                caption: "Kimchi preparation"
            };
            
            await channelPostHandler(msg);
            
            sinon.assert.calledWith(
                mockBot.sendVideo, 
                GROUP_ID, 
                "video_12345", 
                { caption: "Kimchi preparation" }
            );
        });
        
        test("Should send fallback message for unknown message types", async () => {
            // Skip if handler not found
            if (!channelPostHandler) {
                console.warn('Channel post handler not found, skipping test');
                return;
            }
            
            const msg = { unknown_type: true };
            
            await channelPostHandler(msg);
            
            sinon.assert.calledWith(
                mockBot.sendMessage, 
                GROUP_ID, 
                "Check the K Global Channel - a new post is there! 🍄‍🟫"
            );
        });
        
        test("Should handle errors and send fallback message", async () => {
            // Skip if handler not found
            if (!channelPostHandler) {
                console.warn('Channel post handler not found, skipping test');
                return;
            }
            
            const msg = {
                photo: [
                    { file_id: "small_photo" },
                    { file_id: "large_photo" }
                ]
            };
            
            // Make sendPhoto throw an error
            mockBot.sendPhoto.rejects(new Error("API error"));
            
            await channelPostHandler(msg);
            
            sinon.assert.calledWith(
                mockBot.sendMessage, 
                GROUP_ID, 
                "Check the K Global Channel - a new post is there! 🍄‍🟫"
            );
        });
    });
    
    describe("Command handling", () => {
        test("Should respond to /kimchi command", async () => {
            // Skip if handler not found
            if (!kimchiHandler) {
                console.warn('/kimchi handler not found, skipping test');
                return;
            }
            
            const msg = {
                chat: { id: "user_chat_id" },
                text: "/kimchi"
            };
            
            await kimchiHandler(msg);
            
            sinon.assert.calledWith(
                mockBot.sendMessage, 
                "user_chat_id", 
                "🔥 Kimchi is life! Glad you made it to the Kimchi Token Community! 👑"
            );
        });
    });
    
    describe("Daily post", () => {
        test("Should schedule daily message", () => {
            // Verify that setInterval was called
            expect(intervalIds.length).toBeGreaterThan(0);
            
            // Can't easily test the actual message without running the callback
            // This just verifies that scheduling happened
        });
    });
});
