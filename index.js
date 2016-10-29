'use strict';

const bluebird = require('bluebird');
const LastfmAPI = require('lastfmapi');
const redisAPI = require('redis');
const UserAPI = require('./user');
let TelegramBot = require('./telegram-bot');

const lfm = new LastfmAPI({
    api_key: '',
    secret: ''
});

const cfg = {
    telegramToken: ''
};

bluebird.promisifyAll(lfm.user);
bluebird.promisifyAll(redisAPI.RedisClient.prototype);

TelegramBot = new TelegramBot(function() {
    console.log('Starting Last.fm Telegram Bot...');
}, lfm, cfg, new UserAPI(redisAPI));