var commentUtilities = require('comment-utilities');
var envConfig = require('./config.js');
var cache = require('./cache.js');
var stream = require('./stream.js');
var request = require('./request.js');



var pageUrlPerArticleId = {};
function getCommentsByPage (url, page, callback) {
    "use strict";

    request.get(url + page + ".json", {
        success: function (response) {
            if (response && response.content) {
                var listOfComments = [];
                var item;
                var authorData;
                var i;

                for (i = 0; i < response.content.length; i++) {
                    item = response.content[i];
                    authorData = response.authors[item.content.authorId];

                    if (item.vis === 1 && item.type === 0) {
                        listOfComments.push({
                            parentId: item.content.parentId,
                            author: {
                                displayName: authorData.displayName,
                                tags: authorData.tags,
                                type: authorData.type
                            },
                            content: item.content.bodyHtml,
                            timestamp: item.content.createdAt,
                            commentId: item.content.id,
                            visibility: item.vis
                        });
                    }
                }

                callback(null, listOfComments);
            } else {
                callback(new Error("No more page available."));
            }
        },
        error: function () {
            callback(new Error("No more page available."));
        }
    });
}

/**
 * Uses CCS.getComments endpoint, but it also embeds an optional caching layer for the authentication info.
 * 
 * ### Configuration
 * #### Mandatory fields:
 * - articleId: ID of the article, any string
 * - url: canonical URL of the page
 * - title: Title of the page
 *
 * #### Optional fields:
 * - stream: enable streaming of new comments
 * - page: the page number to be fetched. By default it is 0.
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


    if (!conf.hasOwnProperty('articleId')) {
        callback(new Error("Article ID not provided."));
        return;
    }

    if (conf.page > 0 && pageUrlPerArticleId[conf.articleId]) {
        getCommentsByPage(pageUrlPerArticleId[conf.articleId], conf.page, callback);

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

                if (data.collection.bootStrapUrl) {
                    pageUrlPerArticleId[conf.articleId] = "http://"+ envConfig.get().livefyre.networkName +".bootstrap.fyre.co/bs3" + data.collection.bootStrapUrl.replace('head.json', '');
                }


                if (conf.page > 0) {
                    getCommentsByPage(pageUrlPerArticleId[conf.articleId], conf.page, callback);

                    return;
                }

                callback(null, {
                    collection: data.collection
                });

                if (conf.stream === true) {
                    stream.init(data.collection.collectionId, data.collection.lastEvent, function (comment) {
                        callback(null, {
                            comment: comment
                        });
                    });
                }
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
 * - commentBody: actual content of the comment.
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

    if (!conf.commentBody) {
        callback(new Error("Content not provided."));
        return;
    }

    if (!conf.collectionId) {
        callback(new Error("Collection ID not provided."));
        return;
    }


    var dataToBeSent = {
        collectionId: conf.collectionId,
        commentBody: conf.commentBody
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