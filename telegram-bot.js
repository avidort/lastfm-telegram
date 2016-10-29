'use strict';

class TelegramBot {
    constructor(init, lfm, cfg, bot, usr) {
        init();
        this.lfm = lfm;
        this.cfg = cfg;
        this.bot = new bot(cfg.telegramToken, { polling: true });
        this.usr = usr;
        this.events(this.bot);
        console.log('[bot] Ready');
    }

    events(bot) {
        bot.on('message', (msg) => this.cmdNowPlaying(msg));

        bot.onText(/\/set (.+)/, (msg, match) => {
            let user = match[1];
            this.usr.set(msg.from.id, user);
            bot.sendMessage(msg.from.id, `Tracking username set to ${user}`);
        });

        bot.on('inline_query', async (query) => {
            try {
                let res = await this.lfm.user.getRecentTracksAsync({user: await this.usr.get(query.from.id), limit: 1});
                let track = this.getNowPlaying(res);
                let thumbnails = this.getThumbnails(track, 1);
                bot.answerInlineQuery(query.id, [{
                    type: 'article',
                    id: track.mbid || 'mbid', // hacky fix for lastfm issue
                    title: track.artist,
                    description: track.name,
                    thumb_url: thumbnails,
                    input_message_content: {
                        message_text: `Now playing <b>${track.name}</b> by <b>${track.artist}</b>\n${track.url}`,
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    }
                }], { cache_time: 0 });
            }
            catch (err) { throw err; }
        });
    }

    async cmdNowPlaying(msg) {
        try {
            let user = await this.usr.get(msg.from.id);
            let recentTracks = await this.lfm.user.getRecentTracksAsync({user: user, limit: 1});
            let track = this.getNowPlaying(recentTracks);
            this.bot.sendMessage(msg.from.id, `${user} is now playing: ${track.name} by ${track.artist}`); 
        }
        catch (err) { throw err; }
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
