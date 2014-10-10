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
        },
        dateHelper: {
            toTimestamp: function (timestampOrDate) {
                if (timestampOrDate instanceof Date) {
                    return timestampOrDate.getTime();
                }

                if (typeof timestampOrDate === "string") {
                    return new Date(timestampOrDate).getTime();
                }

                if (typeof timestampOrDate === "number" && parseInt(timestampOrDate, 10).toString().length < 13) {
                    return timestampOrDate * 1000;
                }

                return timestampOrDate;
            },

            /**
             * Converts a date in any format to a JS Date Object.
             * @param  {Date|String|Number} timestampOrDate Can be Date, string which is compatible with the constructor of Date, or a timestamp.
             * @return {Date} Date object
             */
            toDateObject: function (timestampOrDate) {
                if (timestampOrDate instanceof Date) {
                    return timestampOrDate;
                }

                return new Date(commentUtilitiesMockup.mockup.dateHelper.toTimestamp(timestampOrDate));
            }
        }
    }
};
commentUtilitiesMockup.reset();

if (mockupReset) {
    mockupReset.add(commentUtilitiesMockup.reset);
}