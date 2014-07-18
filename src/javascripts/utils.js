/**
 * Wrapper and polyfill for String.prototype.trim
 * @param  {string} string The string to be trimmed.
 * @return {string} The trimmed string.
 */
exports.trim = function (string) {
    "use strict";

    if (!String.prototype.trim) {
        return string.replace(/^\s+|\s+$/g, '');
    } else {
        return string.trim();
    }
};

exports.validateCacheEnabled = function (conf) {
    "use strict";

    if (conf && typeof conf === 'object' && conf.cache === true) {
        if (conf.user &&
            typeof conf.user === 'object' &&
            typeof conf.user.getSession === 'function' &&
            typeof conf.user.isLoggedIn === 'function' &&
            conf.user.isLoggedIn() === true &&
            typeof conf.user.getSession() === 'string' &&
            conf.user.getSession() !== '') {
                return true;
        }
    }

    return false;
};