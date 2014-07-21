var cache = require('./cache.js'),
    utils = require('./utils.js'),
    envConfig = require('./config.js'),
    jsonp = require('js-jsonp');


/**
 * Livefyre related SUDS endpoints.
 * @type {Object}
 */
var livefyre = {};

/**
 * Uses SUDS.livefyre.init endpoint, but it also embeds an optional caching layer.
 * 
 * ### Configuration
 * #### Mandatory fields:
 *        - elId: ID of the HTML element in which the widget should be loaded
 *        - articleId: ID of the article, any string
 *        - url: canonical URL of the page
 *        - title: Title of the page
 *
 * #### Optional fields:
 *        - stream_type: livecomments, livechat, liveblog
 *        - cache: if true, cache content is considered and the response is also cached. Default is false.
 *        - force: has effect in combination with cache set to true. If force set to true, it doesn't read the data from cache (call is forced), but it overwrites the cache that already exists.
 *
 * If cache is set to true, a new field should be added as well:
 *        - user: User object which has the following utilities:
 *            + isLoggedIn: function which returns true or false based on the user's logged in status
 *            + getSession: function which returns the user's session if he's logged in
 */
livefyre.getInitConfig = function (conf, callback) {
    "use strict";

    if (typeof callback !== 'function') {
        throw "Callbacks not provided";
    }

    if (!conf) {
        throw "No configuration parameters provided";
    }
    if (!conf.hasOwnProperty('articleId')) {
        throw "Article ID not provided";
    }
    if (!conf.hasOwnProperty('url')) {
        throw "Article URL not provided";
    }
    if (!conf.hasOwnProperty('elId')) {
        throw "Element ID not provided";
    }
    if (!conf.hasOwnProperty('title')) {
        throw "Article title not provided";
    }


    var cacheEnabled = utils.validateCacheEnabled(conf);


    // actually make the request to SUDS
    var makeCall = function () {
            var dataToBeSent = {
                    title: conf.title,
                    url: conf.url,
                    articleId: conf.articleId,
                    el: conf.elId
                };
            if (conf.stream_type) {
                dataToBeSent.stream_type = conf.stream_type;
            }

            // makes the actual call to the SUDS service
            jsonp(
                {
                    url: envConfig.get().suds.baseUrl + envConfig.get().suds.endpoints.livefyre.init,
                    data: dataToBeSent
                },
                function(err, data) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    
                    if (data && data.init) {
                        if (data.init.unclassifiedArticle !== true && cacheEnabled) {
                            cache.cacheInit(conf.articleId, data.init);
                            if (data.auth && data.auth.token) {
                                cache.cacheAuth(conf.user.getSession(), data.auth);
                            }
                        }

                        callback(null, data);
                    } else {
                        callback(new Error("No data received from SUDS."), null);
                    }
                }
            );
        };


    if (!cacheEnabled) {
        makeCall();
    } else {
        var initCache = cache.getInit(conf.articleId),
            authCache;

        if (conf.force === true || !initCache) {
            makeCall();
        } else {
            if (conf.user.isLoggedIn()) {
                authCache = cache.getAuth(conf.user.getSession());

                if (authCache && authCache !== "expired") {
                    callback(null, {
                        init: initCache,
                        auth: authCache
                    });
                } else {
                    makeCall();
                }
            } else {
                callback(null, {
                    init: initCache,
                    auth: null
                });
            }
        }
    }
};


/**
 * User related SUDS endpoints.
 * @type {Object}
 */
var user = {};


/**
 * Uses SUDS.user.getauth endpoint, but it also embeds an optional caching layer.
 * 
 * ### Configuration
 * #### Optional fields:
 *        - cache: if true, cache content is considered and the response is also cached. Default is false.
 *        - force: has effect in combination with cache set to true. If force set to true, it doesn't read the data from cache (call is forced), but it overwrites the cache that already exists.
 *
 * If cache is set to true, a new field should be added as well:
 *        - user: User object which has the following utilities:
 *            + isLoggedIn: function which returns true or false based on the user's logged in status
 *            + getSession: function which returns the user's session if he's logged in
 *
 * @param  {Object|Function}   confOrCallback Configuration object following the fields from the description, or if it isn't relevant, callback function.
 * @param  {Function}          callback       Callback function if configuration is provided as well.
 */
user.getAuth = function (confOrCallback, callback) {
    "use strict";

    if (typeof confOrCallback === 'function') {
        callback = confOrCallback;
    }

    if (typeof callback !== 'function') {
        throw new Error('Callback not provided.');
    }

    var cacheEnabled = false;
    if (confOrCallback && typeof confOrCallback === 'object') {
        cacheEnabled = utils.validateCacheEnabled(confOrCallback);
    }

    var makeCall = function () {
        jsonp(
            {
                url: envConfig.get().suds.baseUrl + envConfig.get().suds.endpoints.user.getAuth
            },
            function (err, data) {
                if (err) {
                    callback(err, null);
                    return;
                }
                
                if (data && data.token) {
                    if (cacheEnabled) {
                        cache.cacheAuth(confOrCallback.user.getSession(), data);
                    }

                    callback(null, data);
                } else {
                    callback(new Error("No data received from SUDS."), null);
                }
            }
        );
    };


    if (!cacheEnabled) {
        makeCall();
    } else {
        var authCache;

        if (confOrCallback.user.isLoggedIn()) {
            authCache = cache.getAuth(confOrCallback.user.getSession());

            if (!authCache || authCache === "expired" || confOrCallback.force === true) {
                makeCall();
            } else {
                callback(null, authCache);
            }
        } else {
            callback(new Error("User is not logged in"), null);
        }
    }
};



/**
 * Saves the user's settings by making a call to SUDS.user.updateuser endpoint.
 * @param {Object} userSettings Fields: pseudonym, emailcomments, emailreplies, emaillikes, emailautofollow
 * @param {Function} callback function (err, data)
 */
user.updateUser = function (userSettings, callback) {
    "use strict";

    if (typeof callback !== 'function') {
        throw new Error("Callback not provided.");
    }

    if (!userSettings || typeof userSettings !== 'object') {
        callback(new Error("Settings not provided."));
        return;
    }

    if (userSettings.hasOwnProperty('pseudonym')) {
        userSettings.pseudonym = utils.trim(userSettings.pseudonym);
    }

    if (!userSettings.hasOwnProperty('pseudonym') || (userSettings.hasOwnProperty('pseudonym') && userSettings.pseudonym)) {
        jsonp({
                url: envConfig.get().suds.baseUrl + envConfig.get().suds.endpoints.user.updateUser,
                data: userSettings
            },
            function(err, data) {
                if (err) {
                    callback(err, null);
                    return;
                }
                 
                if (!data) {
                    callback(new Error("No data received."), null);
                } else {
                    if (data.status === "ok") {
                        callback(null, data);
                    } else {
                        if (data.error) {
                            callback(data.error, data);
                        } else {
                            callback(new Error("An error occured."), null);
                        }
                    }
                }
            });
    } else {
        callback(new Error("Pseudonym is blank."), {
            error: "Pseudonym is blank."
        });
    }
};



/**
 * Export all endpoints.
 * @type {Object}
 */
module.exports = {
    livefyre: livefyre,
    user: user
};