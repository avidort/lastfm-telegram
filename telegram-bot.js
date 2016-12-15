'use strict';

class TelegramBot {
  constructor(init, lfm, config, bot, user) {
    init();
    this.lfm = lfm;
    this.config = config;
    this.bot = new bot(config.telegramToken, {polling: true});
    this.user = user;
    this.registerEvents(this.bot);
    console.log('[bot] Ready');
  }

  registerEvents(bot) {
    bot.on('message', (msg) => this.cmdNowPlaying(msg));

    bot.onText(/\/set (.+)/, (msg, match) => {
      let user = match[1];
      this.user.set(msg.from.id, user);
      bot.sendMessage(msg.from.id, `Tracking username set to ${user}`);
    });

    bot.on('inline_query', async (query) => {
      try {
        let user = await this.user.get(query.from.id);
        if (user !== null) {
          let res = await this.lfm.user.getRecentTracksAsync({user: user, limit: 1});
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
          }], {cache_time: 0});
        } else {
          this.bot.sendMessage(query.from.id, 'User not recognised, /set your username');
        }
      } catch (err) {
        throw err;
      }
    });
  }

  async cmdNowPlaying(msg) {
    try {
      let user = await this.user.get(msg.from.id);
      if (user !== null) {
        let recentTracks = await this.lfm.user.getRecentTracksAsync({user: user, limit: 1});
        let track = this.getNowPlaying(recentTracks);
        this.bot.sendMessage(msg.from.id, `${user} is now playing: ${track.name} by ${track.artist}`);
      } else {
        this.bot.sendMessage(msg.from.id, 'User not recognised, /set your username');
      }
    } catch (err) {
      throw err;
    }
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
