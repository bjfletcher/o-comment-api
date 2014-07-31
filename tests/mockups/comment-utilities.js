/* global mockupReset */
"use strict";

var commentUtilitiesMockup = {
    reset: function () {
        commentUtilitiesMockup.log = {
            jsonp: {
                options: null,
                callback: null
            },
            storageWrapper: {
                sessionStorage: {}
            }
        };

        commentUtilitiesMockup.returnValue = {
            storageWrapper: {
                sessionStorage: {}
            }
        };
    },
    mockup: {
        jsonp: function (options, callback) {
            commentUtilitiesMockup.log.jsonp.options = options;
            commentUtilitiesMockup.log.jsonp.callback = callback;
        },
        storageWrapper: {
            sessionStorage: {
                hasItem: function (key) {
                    return !!commentUtilitiesMockup.returnValue.storageWrapper.sessionStorage[key];
                },
                getItem: function (key) {
                    commentUtilitiesMockup.log.storageWrapper.sessionStorage.getItem = {
                        called: true,
                        key: key
                    };
                    return commentUtilitiesMockup.returnValue.storageWrapper.sessionStorage[key];
                },
                setItem: function (key, value) {
                    commentUtilitiesMockup.log.storageWrapper.sessionStorage.setItem = {
                        called: true,
                        key: key,
                        value: value
                    };
                },
                removeItem: function (key) {
                    commentUtilitiesMockup.log.storageWrapper.sessionStorage.removeItem = {
                        called: true,
                        key: key
                    };
                }
            }
        },
        logger: {
            debug: function () {
                
            },
            log: function () {

            }
        }
    }
};
commentUtilitiesMockup.reset();

if (mockupReset) {
    mockupReset.add(commentUtilitiesMockup.reset);
}