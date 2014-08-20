var commentUtilities = require('comment-utilities'),
    envConfig = require('./config.js'),
    cache = require('./cache.js');

/**
 * Uses CCS.getComments endpoint, but it also embeds an optional caching layer for the authentication info.
 * 
 * ### Configuration
 * #### Mandatory fields:
 * - articleId: ID of the article, any string
 * - url: canonical URL of the page
 * - title: Title of the page
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

    if (!conf.hasOwnProperty('title')) {
        callback(new Error("Article title not provided."));
        return;
    }

    if (!conf.hasOwnProperty('url')) {
        callback(new Error("Article url not provided."));
        return;
    }

    if (!conf.hasOwnProperty('articleId')) {
        callback(new Error("Article ID not provided."));
        return;
    }

    var cacheEnabled = false;
    if (envConfig.get('cache') === true && envConfig.get('sessionId')) {
        cacheEnabled = true;
    }

    var dataToBeSent = {
        title: conf.title,
        url: conf.url,
        articleId: conf.articleId
    };

    commentUtilities.jsonp(
        {
            url: envConfig.get().ccs.baseUrl + envConfig.get().ccs.endpoints.getComments,
            data: dataToBeSent
        },
        function (err, data) {
            if (err) {
                callback(err, null);
                return;
            }
            
            if (data && data.collection) {
                if (data.collection.unclassifiedArticle !== true && cacheEnabled) {
                    if (data.userDetails && data.userDetails.token) {
                        cache.cacheAuth(data.userDetails);
                    }
                }

                callback(null, data.collection);
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
 * - collectionId: ID of the collection to post the comment.
 * - contentBody: actual content of the comment.
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

    if (!conf.contentBody) {
        callback(new Error("Content not provided."));
        return;
    }

    if (!conf.collectionId) {
        callback(new Error("Collection ID not provided."));
        return;
    }


    var dataToBeSent = {
        collectionId: conf.collectionId,
        contentBody: conf.contentBody
    };


    commentUtilities.jsonp({
        url: envConfig.get().ccs.baseUrl + envConfig.get().ccs.endpoints.postComment,
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