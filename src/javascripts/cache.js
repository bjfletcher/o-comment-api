var storageWrapper = require('js-storage-wrapper'),
    envConfig = require('./config.js'),
    logger = require('js-logger');

/**
 * Verifies if there's a valid auth token (not expired) attached to the session ID provided.
 * @param  {string} sessionId Session ID of the user.
 * @return {string|undefined}
 */
exports.getAuth = function(sessionId) {
    "use strict";

    var authCache = storageWrapper.sessionStorage.getItem(envConfig.get().cache.authName);
    if (authCache) {
        if (new Date() < new Date(authCache.expires)) {
            if (authCache.sessionId === sessionId) {
                return authCache;
            }
        } else {
            storageWrapper.sessionStorage.removeItem(envConfig.get().cache.authName);

            return "expired";
        }
    }

    return undefined;
};

/**
 * Removes the auth token from the local cache.
 */
exports.removeAuth = function () {
    "use strict";
    
    storageWrapper.sessionStorage.removeItem(envConfig.get().cache.authName);
};

/**
 * Saves the auth token into the local cache.
 * @param  {string} sessionId Session ID of the user.
 * @param  {object} authObject Object which contains the following:
 * - JWT token
 * - displayName
 * - settings (e.g. email preferences)
 * - expires (timestamp like Date.getTime())
 * @return {boolean} True if successfully saved or false if not.
 */
exports.cacheAuth = function (sessionId, authObject) {
    "use strict";
    
    if (authObject.token && sessionId) {
        try {
            authObject.sessionId = sessionId;

            storageWrapper.sessionStorage.setItem(envConfig.get().cache.authName, authObject);

            return true;
        } catch (e) {
            logger.debug("Failed to save to the storage.", "authObject:", authObject, "sessionId:", sessionId, "Error:", e);
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
    
    return storageWrapper.sessionStorage.getItem(envConfig.get().cache.initBaseName + articleId);
};

/**
 * Saves the SUDS init object into the local cache.
 * @param  {string|number} articleId The ID of the article
 * @param  {object} initObj SUDS init
 */
exports.cacheInit = function (articleId, initObj) {
    "use strict";
    
    try {
        storageWrapper.sessionStorage.setItem(envConfig.get().cache.initBaseName + articleId, initObj);

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
    
    storageWrapper.sessionStorage.removeItem(envConfig.get().cache.initBaseName + articleId);
};