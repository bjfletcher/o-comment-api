/* global XDomainRequest:false, ActiveXObject:false */

var commentUtilities = require('comment-utilities');

exports.get = function (url, callback) {
    "use strict";

    var xhr = getXhrForUrl(url);
    var aborted = false;

    if (!xhr) {
        return;
    }

    if (xhr instanceof XMLHttpRequest) {
        xhr.open("get", url, true);
    } else {
        xhr.open("get", url);
        if (typeof xhr.hasOwnProperty !== 'function') {
            xhr.timeout = 9000;
        }
    }


    if (xhr.onload !== 'undefined') {
        xhr.onload = function () {
            if (!aborted) {
                var responseText = xhr.responseText;
                try {
                    responseText = JSON.parse(responseText);
                } catch (e) {}

                commentUtilities.logger.debug('stream', 'xhr onload', 'responseText:', responseText);
                callback.success(responseText);
            }
        };

        xhr.onerror = function () {
            if (!aborted) {
                commentUtilities.logger.debug('stream', 'xhr onerror', 'xhr error');
                callback.error();
            }
        };

        xhr.ontimeout = function () {
            if (!aborted) {
                commentUtilities.logger.debug('stream', 'xhr ontimeout', 'xhr timeout');

                aborted = true;
                try {
                    xhr.abort();
                } catch (e) {}
                callback.error();
            }
        };

        xhr.onprogress = function () {}; // do nothing, we are not interested in the progress
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

    setTimeout(function () {
        xhr.send();
    }, 0);
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