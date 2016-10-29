'use strict';

const bluebird = require('bluebird');
const LastfmAPI = require('lastfmapi');
const TelegramBotAPI = require('node-telegram-bot-api');
const redisAPI = require('redis');
const UserAPI = require('./user');
const TelegramBot = require('./telegram-bot');

const lfm = new LastfmAPI({
    api_key: '',
    secret: ''
});

const cfg = {
    telegramToken: ''
};

bluebird.promisifyAll(lfm.user);
bluebird.promisifyAll(redisAPI.RedisClient.prototype);

new TelegramBot(function() {
    console.log('Starting Last.fm Telegram Bot...');
}, lfm, cfg, TelegramBotAPI, new UserAPI(redisAPI));