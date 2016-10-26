'use strict';

const TelegramBotAPI = require('node-telegram-bot-api');

class TelegramBot {
    constructor(init, lfm, cfg) {
        init();
        this.lfm = lfm;
        this.cfg = cfg;
        this.bot = new TelegramBotAPI(cfg.telegramToken, {polling: true});
        this.events(this.bot);
        console.log('Ready');
    }

    events(bot) {
        bot.on('message', (msg) => this.cmdNowPlaying(msg));

        bot.on('inline_query', (query) => {
            this.lfm.user.getRecentTracks({user: 'avidori', limit: 1}, (err, res) => {
                if (err) throw err;
                let track = this.getNowPlaying(res);
                let thumbnails = this.getThumbnails(track, 1);
                bot.answerInlineQuery(query.id, [{
                    type: 'article',
                    id: track.mbid || 'mbid', // hacky fix for lastfm issue
                    title: track.artist,
                    description: track.name,
                    thumb_url: thumbnails,
                    input_message_content: {
                        message_text: `Now playing <b>${track.name}</b> by <b>${track.artist}</b> via ${track.url}`,
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    }
                }], { cache_time: 0 });
            });
        });
    }

    cmdNowPlaying(msg) {
        this.lfm.user.getRecentTracks({user: 'avidori', limit: 1}, (err, res) => {
            if (err) throw err;
            let track = this.getNowPlaying(res);
            this.bot.sendMessage(msg.from.id, `Now playing: ${track.name} by ${track.artist}`);
        });
    }

    getNowPlaying(recentTracks) {
        let track = recentTracks.track[0];
        track.artist = Object.keys(track.artist).map((a) => track.artist[a])[0];
        return track;
    }

    getThumbnails(track, size) {
        let thumbnails = Object.keys(track.image).map((t) => track.image[t])[size];
        return Object.keys(thumbnails).map((t) => thumbnails[t])[0];
    }
}

module.exports = TelegramBot;
