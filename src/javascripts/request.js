/* global XDomainRequest:false, ActiveXObject:false */

exports.get = function (url) {
    "use strict";

    var xhr = getXhrForUrl(url);

    if (!xhr) {
        return;
    }

    xhr.open("GET", url, true);

    if (xhr.onload) {
        xhr.onload = function () {
            var responseText = xhr.responseText;
            console.log('responseText:', responseText);
        };

        xhr.onerror = function () {
            console.log('xhr error');
        };
    } else {
        xhr.onreadystatechange(function () {
            console.log('onreadystatechange', arguments);
        });
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