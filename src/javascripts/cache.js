var storageWrapper = require('js-storage-wrapper'),
    envConfig = require('./config.js'),
    logger = require('js-logger');

/**
 * Verifies if there's a valid auth token (not expired) attached to the session ID provided.
 * @return {string|undefined}
 */
exports.getAuth = function() {
    "use strict";

    if (!envConfig.get('sessionId')) {
        throw "Session ID is not set.";
    }

    var authCache = storageWrapper.sessionStorage.getItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'));
    if (authCache) {
        if (new Date() < new Date(authCache.expires)) {
            return authCache;
        } else {
            storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'));
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
    

    storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'));
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
            storageWrapper.sessionStorage.setItem(envConfig.get().cacheConfig.authBaseName + envConfig.get('sessionId'), authObject);

            return true;
        } catch (e) {
            logger.debug("Failed to save to the storage.", "authObject:", authObject, "sessionId:", envConfig.get('sessionId'), "Error:", e);
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
    
    return storageWrapper.sessionStorage.getItem(envConfig.get().cacheConfig.initBaseName + articleId);
};

/**
 * Saves the SUDS init object into the local cache.
 * @param  {string|number} articleId The ID of the article
 * @param  {object} initObj SUDS init
 */
exports.cacheInit = function (articleId, initObj) {
    "use strict";
    
    try {
        storageWrapper.sessionStorage.setItem(envConfig.get().cacheConfig.initBaseName + articleId, initObj);

        return true;
    } catch (e) {
        logger.debug("Failed to save to the storage.", "articleId:", articleId, "initObj:", initObj, "Error:", e);
    }

    return false;
};

/**
 * Removes the SUDS init object from the local cache.
 * @param  {string|number} articleId The ID of the article
 */
exports.removeInit = function (articleId) {
    "use strict";
    
    storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.initBaseName + articleId);
};

/**
 * Clears all entries created by the cache.
 */
exports.clear = function () {
    "use strict";
    
    if (storageWrapper.sessionStorage.native) {
        for (var key in storageWrapper.sessionStorage.native) {
            if (storageWrapper.sessionStorage.native.hasOwnProperty(key)) {
                var matchInit = key.match(new RegExp(envConfig.get().cacheConfig.initBaseName + '(.*)'));
                if (matchInit && matchInit.length) {
                    storageWrapper.sessionStorage.removeItem(key);
                }

                var matchAuth = key.match(new RegExp(envConfig.get().cacheConfig.authBaseName + '(.*)'));
                if (matchAuth && matchAuth.length) {
                    storageWrapper.sessionStorage.removeItem(key);
                }
            }
        }
    }
};