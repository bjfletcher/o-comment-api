/* global mockupReset */
"use strict";

var jsonpMockup = {
    reset: function () {
        jsonpMockup.log = {
            options: null,
            callback: null
        };
    },
    mockup: function (options, callback) {
        jsonpMockup.log.options = options;
        jsonpMockup.log.callback = callback;
    }
};
jsonpMockup.reset();

if (mockupReset) {
    mockupReset.add(jsonpMockup.reset);
}