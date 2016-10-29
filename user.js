'use strict';

class User {
    constructor(redis) {
        this.redis = redis.createClient();
        this.redis.on('ready', () => console.log('[redis] Ready'));
        this.redis.on('error', (err) => console.log('[redis] %s', err));
    }

    get(userid) {
        return new Promise((resolve, reject) => {
            this.redis.getAsync(userid)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    set(userid, lastfm_user) {
        this.redis.set(userid, lastfm_user);
    }
}

module.exports = User;
