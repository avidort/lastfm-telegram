'use strict';

const Promise = require('bluebird');
const LastfmAPI = require('lastfmapi');
let TelegramBot = require('./telegram-bot');

const lfm = new LastfmAPI({
    api_key: '',
    secret: ''
});

const cfg = {
    telegramToken: ''
};

TelegramBot = new TelegramBot(function() {
    console.log('Starting Last.fm Telegram Bot...');
    Promise.promisifyAll(lfm.user);
}, lfm, cfg);