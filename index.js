'use strict';

const [bluebird, LastfmAPI, TelegramBotAPI, redisAPI] = [
  require('bluebird'), require('lastfmapi'),
  require('node-telegram-bot-api'), require('redis')
];

const [User, TelegramBot, config] = [
  require('./user'), require('./telegram-bot'), require('rc')('lfmbot')
];

const lfm = new LastfmAPI({
  api_key: config.lastfmKey,
  secret: config.lastfmSecret
});

bluebird.promisifyAll(lfm.user);
bluebird.promisifyAll(redisAPI.RedisClient.prototype);

new TelegramBot(() => console.log('Starting Last.fm Telegram Bot...'),
  lfm, config, TelegramBotAPI, new User(redisAPI));
