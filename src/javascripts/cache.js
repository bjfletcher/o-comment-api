const envConfig = require('./config.js');
const oCommentUtilities = require('o-comment-utilities');

/**
 * Verifies if there's a valid auth token (not expired) attached to the session ID provided.
 * @return {String} Auth token
 */
exports.getAuth = function() {
	const sessionId = oCommentUtilities.ftUser.getSession();
	if (!sessionId) {
		return undefined;
	}

	const authCache = oCommentUtilities.storageWrapper.sessionStorage.getItem(envConfig.get().cacheConfig.authBaseName + sessionId);
	if (authCache) {
		if (new Date() < oCommentUtilities.dateHelper.toDateObject(authCache.expires)) {
			return authCache;
		} else {
			oCommentUtilities.storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.authBaseName + sessionId);
		}
	}

	return undefined;
};

/**
 * Removes the auth token from the local cache.
 * @return {undefined}
 */
exports.removeAuth = function () {
	const sessionId = oCommentUtilities.ftUser.getSession();
	if (!sessionId) {
		return;
	}

	oCommentUtilities.storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.authBaseName + sessionId);
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
	const sessionId = oCommentUtilities.ftUser.getSession();
	if (!sessionId) {
		return false;
	}

	if (authObject.token) {
		try {
			let oldObj = {};
			if (oCommentUtilities.storageWrapper.sessionStorage.hasItem(envConfig.get().cacheConfig.authBaseName + sessionId)) {
				oldObj = oCommentUtilities.storageWrapper.sessionStorage.getItem(envConfig.get().cacheConfig.authBaseName + sessionId);
			}

			const mergedObj = oCommentUtilities.merge({}, oldObj, authObject);
			oCommentUtilities.storageWrapper.sessionStorage.setItem(envConfig.get().cacheConfig.authBaseName + sessionId, mergedObj);

			return true;
		} catch (e) {
			oCommentUtilities.logger.debug("Failed to save to the storage.", "authObject:", authObject, "sessionId:", sessionId, "Error:", e);
		}
	}

	return false;
};

/**
 * Returns the SUDS init object saved into the local cache.
 * @param  {string|number} articleId The ID of the article
 * @return {object} Livefyre init object
 */
exports.getInit = function (articleId) {
	return oCommentUtilities.storageWrapper.sessionStorage.getItem(envConfig.get().cacheConfig.initBaseName + articleId);
};

/**
 * Saves the SUDS init object into the local cache.
 * @param  {string|number} articleId The ID of the article
 * @param  {object} initObj SUDS init
 * @return {undefined}
 */
exports.cacheInit = function (articleId, initObj) {
	try {
		oCommentUtilities.storageWrapper.sessionStorage.setItem(envConfig.get().cacheConfig.initBaseName + articleId, initObj);

		return true;
	} catch (e) {
		oCommentUtilities.logger.debug("Failed to save to the storage.", "articleId:", articleId, "initObj:", initObj, "Error:", e);
	}

	return false;
};

/**
 * Removes the SUDS init object from the local cache.
 * @param  {string|number} articleId The ID of the article
 * @return {undefined}
 */
exports.removeInit = function (articleId) {
	oCommentUtilities.storageWrapper.sessionStorage.removeItem(envConfig.get().cacheConfig.initBaseName + articleId);
};



exports.clearAuth = function () {
	if (oCommentUtilities.storageWrapper.sessionStorage.native) {
		for (const key in oCommentUtilities.storageWrapper.sessionStorage.native) {
			if (oCommentUtilities.storageWrapper.sessionStorage.hasItem(key)) {
				const matchAuth = key.match(new RegExp(envConfig.get().cacheConfig.authBaseName + '(.*)'));
				if (matchAuth && matchAuth.length) {
					oCommentUtilities.storageWrapper.sessionStorage.removeItem(key);
				}
			}
		}
	}
};

exports.clearLivefyreInit = function () {
	if (oCommentUtilities.storageWrapper.sessionStorage.native) {
		for (const key in oCommentUtilities.storageWrapper.sessionStorage.native) {
			if (oCommentUtilities.storageWrapper.sessionStorage.hasItem(key)) {
				const matchInit = key.match(new RegExp(envConfig.get().cacheConfig.initBaseName + '(.*)'));
				if (matchInit && matchInit.length) {
					oCommentUtilities.storageWrapper.sessionStorage.removeItem(key);
				}
			}
		}
	}
};

/**
 * Clears all entries created by the cache.
 * @return {undefined}
 */
exports.clear = function () {
	exports.clearAuth();
	exports.clearInit();
};
