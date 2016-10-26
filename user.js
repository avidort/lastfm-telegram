'use strict';

/* TODO: User Management (currently hardcoded to avidori)
    - based on redis (?)
    - new users need to set their last.fm username
    - users could toggle disable_web_page_preview
    - messaging the bot directly could pop a random song recommendation based on last.fm's database
*/

class User {
    constructor() {
        // prep database
    }

    validate(userid) {
        // return true if registered
    }

    add(userid, lastfm_user) {
        // return true on success
    }

    webview(userid, toggle = -1) {
        // return status if toggle equals -1, otherwise modify according to passed bool
    }
}

module.exports = User;
