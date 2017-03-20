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
    bot.on('message', async (msg) => {
      // this will be removed at some point as the service is intended to be inline_query based
      const user = await this.user.get(msg.from.id);
      if (user !== null) {
        try {
          const recentTracks = await this.lfm.user.getRecentTracksAsync({user, limit: 1});
          const track = this.getNowPlaying(recentTracks);
          this.bot.sendMessage(msg.from.id,
            `<b>${user}</b> is now playing: <b>${track.name}</b> by <b>${track.artist}</b>`, {parse_mode: 'HTML'});
        } catch (err) {
          this.bot.sendMessage(msg.from.id, `Couldn't reach '${user}' on last.fm. Is the username correct?`);
          console.error(`[lfm api] Couldn't fetch user ${user} from last.fm`);
        }
      } else {
        this.bot.sendMessage(msg.from.id, 'User not recognised, /set your username');
      }
    });

    bot.onText(/\/set (.+)/, (msg, match) => {
      const user = match[1];
      this.user.set(msg.from.id, user);
      bot.sendMessage(msg.from.id, `Tracking username set to ${user}`);
    });

    bot.on('inline_query', async (query) => {
      const user = await this.user.get(query.from.id);
      if (user !== null) {
        try {
          const recent = await this.lfm.user.getRecentTracksAsync({user, limit: 1});
          const track = this.getNowPlaying(recent);
          const thumbnails = this.getThumbnails(track, 1);
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
        } catch (err) { // todo change this to error response in inline_query
          this.bot.sendMessage(query.from.id, `Couldn't reach '${user}' on last.fm. Is the username correct?`);
          console.error(`[lfm api] Couldn't fetch user ${user} from last.fm`);
        }
      } else {
        this.bot.sendMessage(query.from.id, 'User not recognised, /set your username');
      }
    });
  }

  getNowPlaying(recentTracks) {
    const track = recentTracks.track[0];
    track.artist = Object.keys(track.artist).map((a) => track.artist[a])[0];
    return track;
  }

  getThumbnails(track, size) {
    const thumbnails = Object.keys(track.image).map((t) => track.image[t])[size];
    return Object.keys(thumbnails).map((t) => thumbnails[t])[0];
  }
}

module.exports = TelegramBot;
