var envConfig = require('./config.js'),
    commentUtilities = require('comment-utilities');

/**
 * Verifies if there's a valid auth token (not expired) attached to the session ID provided.
 * @return {string|undefined}
 */
exports.getAuth = function() {
    "use strict";

    if (!envConfig.get('sessionId')) {
        throw "Session ID is not set.";
    }

    var authCache = commentUtilities.storageWrapper.sessionStorage.getItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'));
    if (authCache) {
        if (new Date() < new Date(authCache.expires)) {
            return authCache;
        } else {
            commentUtilities.storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'));
        }
    }

    return undefined;
};

/**
 * Removes the auth token from the local cache.
 */
exports.removeAuth = function () {
    "use strict";

    if (!envConfig.get('sessionId')) {
        throw "Session ID is not set.";
    }
    

    commentUtilities.storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'));
};

/**
 * Saves the auth token into the local cache.
 * @param  {object} authObject Object which contains the following:
 * - JWT token
 * - displayName
 * - settings (e.g. email preferences)
 * - expires (timestamp like Date.getTime())
 * @return {boolean} True if successfully saved or false if not.
 */
exports.cacheAuth = function (authObject) {
    "use strict";

    if (!envConfig.get('sessionId')) {
        throw "Session ID is not set.";
    }
    
    if (authObject.token) {
        try {
            if (commentUtilities.storageWrapper.sessionStorage.hasItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'))) {
                commentUtilities.storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'));
            }
            commentUtilities.storageWrapper.sessionStorage.setItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'), authObject);

            return true;
        } catch (e) {
            commentUtilities.logger.debug("Failed to save to the storage.", "authObject:", authObject, "sessionId:", envConfig.get('sessionId'), "Error:", e);
        }
    }

    return false;
};

/**
 * Returns the SUDS init object saved into the local cache.
 * @param  {string|number} articleId The ID of the article
 * @return {object|undefined}
 */
exports.getInit = function (articleId) {
    "use strict";
    
    return commentUtilities.storageWrapper.sessionStorage.getItem(envConfig.get().cacheConfig.initBaseName + articleId);
};

/**
 * Saves the SUDS init object into the local cache.
 * @param  {string|number} articleId The ID of the article
 * @param  {object} initObj SUDS init
 */
exports.cacheInit = function (articleId, initObj) {
    "use strict";
    
    try {
        commentUtilities.storageWrapper.sessionStorage.setItem(envConfig.get().cacheConfig.initBaseName + articleId, initObj);

        return true;
    } catch (e) {
        commentUtilities.logger.debug("Failed to save to the storage.", "articleId:", articleId, "initObj:", initObj, "Error:", e);
    }

    return false;
};

/**
 * Removes the SUDS init object from the local cache.
 * @param  {string|number} articleId The ID of the article
 */
exports.removeInit = function (articleId) {
    "use strict";
    
    commentUtilities.storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.initBaseName + articleId);
};

/**
 * Clears all entries created by the cache.
 */
exports.clear = function () {
    "use strict";
    
    if (commentUtilities.storageWrapper.sessionStorage.native) {
        for (var key in commentUtilities.storageWrapper.sessionStorage.native) {
            if (commentUtilities.storageWrapper.sessionStorage.native.hasOwnProperty(key)) {
                var matchInit = key.match(new RegExp(envConfig.get().cacheConfig.initBaseName + '(.*)'));
                if (matchInit && matchInit.length) {
                    commentUtilities.storageWrapper.sessionStorage.removeItem(key);
                }

                var matchAuth = key.match(new RegExp(envConfig.get().cacheConfig.authBaseName + '(.*)'));
                if (matchAuth && matchAuth.length) {
                    commentUtilities.storageWrapper.sessionStorage.removeItem(key);
                }
            }
        }
    }
};