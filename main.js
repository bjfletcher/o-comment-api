var config = require('./src/javascripts/config.js'),
    suds = require('./src/javascripts/suds.js'),
    ccs = require('./src/javascripts/ccs.js'),
    cache = require('./src/javascripts/cache.js'),
    defaultConfig = require('./config.json'),
    logger = require('js-logger');


config.set(defaultConfig);

/**
 * Export of the SUDS and CCS APIs.
 * @type {Object}
 */
exports.api = {
    getLivefyreInitConfig: suds.livefyre.getInitConfig,
    getAuth: suds.user.getAuth,
    updateUser: suds.user.updateUser,

    getComments: ccs.getComments,
    postComment: ccs.postComment
};

/**
 * Allows access to the cached values.
 * @type {Object}
 */
exports.cache = {
    clear: cache.clear
};

/**
 * Enables logging.
 * @type {function}
 */
exports.enableLogging = function () {
    "use strict";
    logger.enable.apply(this, arguments);
};

/**
 * Disables logging.
 * @type {function}
 */
exports.disableLogging = function () {
    "use strict";
    logger.disable.apply(this, arguments);
};

/**
 * Sets logging level.
 * @type {number|string}
 */
exports.setLoggingLevel = function () {
    "use strict";
    logger.setLevel.apply(this, arguments);
};

/**
 * Change configuration method sets additional or overrides current configuration options.
 */
exports.changeConfiguration = function () {
    "use strict";
    config.set.apply(this, arguments);
};