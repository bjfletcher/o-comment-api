/* global XDomainRequest:false, ActiveXObject:false */

var commentUtilities = require('comment-utilities');

exports.get = function (url, callback) {
    "use strict";

    var xhr = getXhrForUrl(url);

    if (!xhr) {
        return;
    }

    xhr.open("GET", url, true);

    if (xhr.hasOwnProperty('onload')) {
        xhr.onload = function () {
            var responseText = xhr.responseText;
            try {
                responseText = JSON.parse(responseText);
            } catch (e) {}

            commentUtilities.logger.debug('stream', 'xhr onload', 'responseText:', responseText);
            callback.success(responseText);
        };

        xhr.onerror = function () {
            commentUtilities.logger.debug('stream', 'xhr onerror', 'xhr error');
            callback.error();
        };

        xhr.ontimeout = function () {
            commentUtilities.logger.debug('stream', 'xhr ontimeout', 'xhr timeout');
            callback.error();
        };
    } else {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.responseText) {
                    var responseText = xhr.responseText;
                    try {
                        responseText = JSON.parse(responseText);
                    } catch (e) {}

                    commentUtilities.logger.debug('stream', 'xhr onreadystatechange', 'responseText:', responseText);
                    callback.success(responseText);
                } else {
                    commentUtilities.logger.debug('stream', 'xhr onreadystatechange', 'xhr error');
                    callback.error();
                }
            }
        };
    }

    xhr.send();
};

/**
 * Determine XHR.
 */

function getXhrForUrl (requestUrl) {
    "use strict";

    var isXDomainRequest = false;

    if (typeof window.location !== 'undefined') {
        var hostnameMatch = requestUrl.match(/http[s]?:\/\/([^\/]*)/);

        if (hostnameMatch && hostnameMatch[1] !== window.location.hostname) {
            isXDomainRequest = true;
        }
    }

    if (isXDomainRequest === true) {
        if (typeof new XMLHttpRequest().withCredentials !== 'undefined') {
            // Check if the XMLHttpRequest object has a "withCredentials" property.
            // "withCredentials" only exists on XMLHTTPRequest2 objects.

            return new XMLHttpRequest();
        } else if (typeof XDomainRequest !== "undefined") {
            // Otherwise, check if XDomainRequest.
            // XDomainRequest only exists in IE, and is IE's way of making CORS requests.

            return new XDomainRequest();
        } else {
            return false;
        }
    } else {
        if (window.XMLHttpRequest && ('file:' !== window.location.protocol || !window.ActiveXObject)) {
            return new XMLHttpRequest();
        } else {
            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {}
            try {
                return new ActiveXObject('Msxml2.XMLHTTP.6.0');
            } catch (e) {}
            try {
                return new ActiveXObject('Msxml2.XMLHTTP.3.0');
            } catch (e) {}
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {}
        }
    }

    return false;
}