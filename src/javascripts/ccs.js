var jsonp = require('js-jsonp'),
    envConfig = require('./config.js'),
    utils = require('./utils.js'),
    cache = require('./cache.js');

/**
 * Uses CCS.getComments endpoint, but it also embeds an optional caching layer for the authentication info.
 * 
 * ### Configuration
 * #### Mandatory fields:
 *        - articleId: ID of the article, any string
 *        - url: canonical URL of the page
 *        - title: Title of the page
 *
 * #### Optional fields:
 *        - cache: if true, cache content is considered and the response is also cached. Default is false.
 *        - force: has effect in combination with cache set to true. If force set to true, it doesn't read the data from cache (call is forced), but it overwrites the cache that already exists.
 *
 * If cache is set to true, a new field should be added as well:
 *        - user: User object which has the following utilities:
 *            + isLoggedIn: function which returns true or false based on the user's logged in status
 *            + getSession: function which returns the user's session if he's logged in
 */
function getComments (conf, callback) {
    "use strict";

    if (typeof callback !== 'function') {
        throw new Error("Callback not provided");
    }


    if (!conf || typeof conf !== 'object') {
        callback(new Error("Configuration is not provided."));
        return;
    }

    if (!conf.title) {
        callback(new Error("Article title not provided."));
        return;
    }

    if (!conf.url) {
        callback(new Error("Article url not provided."));
        return;
    }

    if (!conf.articleId) {
        callback(new Error("Article ID not provided."));
        return;
    }

    var cacheEnabled = utils.validateCacheEnabled(conf);

    var dataToBeSent = {
        title: conf.title,
        url: conf.url,
        articleId: conf.articleId
    };
    if (conf.limit) {
        dataToBeSent.limit = conf.limit;
    }

    jsonp(
        {
            url: envConfig.get().ccs.baseUrl + envConfig.get().ccs.endpoints.getComments,
            data: dataToBeSent
        },
        function (err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            
            if (data && data.init) {
                if (data.init.unclassifiedArticle !== true && cacheEnabled) {
                    if (data.auth && data.auth.token) {
                        cache.cacheAuth(conf.user.getSession(), data.auth);
                    }
                }

                callback(null, data);
            } else {
                callback(new Error("No data received from CCS."), null);
            }
        }
    );
}

/**
 * Posts a comment into a given collection using the user's auth token.
 *
 * ### Configuration
 * #### Mandatory fields
 *         - collectionId: ID of the collection to post the comment.
 *         - content: actual content of the comment.
 *         - token: a valid JWT auth token
 * 
 * @param  {Object}   conf     Configuration object
 * @param  {Function} callback function (err, data)
 */
function postComment (conf, callback) {
    "use strict";

    if (typeof callback !== 'function') {
        throw new Error("Callback not provided");
    }

    if (!conf || typeof conf !== 'object') {
        callback(new Error("Configuration is not provided."));
        return;
    }

    if (!conf.content) {
        callback(new Error("Content not provided."));
        return;
    }

    if (!conf.token) {
        callback(new Error("User token not provided."));
        return;
    }

    if (!conf.collectionId) {
        callback(new Error("Collection ID not provided."));
        return;
    }


    var dataToBeSent = {
        network: envConfig.get().livefyre.network,
        collectionId: conf.collectionId,
        lftoken: conf.token,
        body: conf.content
    };


    jsonp({
        url: envConfig.get().baseUrl + envConfig.get().ccs.endpoints.postComment,
        data: dataToBeSent
    }, function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, data);
    });
}

/**
 * Export all endpoints.
 * @type {Object}
 */
module.exports = {
    getComments: getComments,
    postComment: postComment
};