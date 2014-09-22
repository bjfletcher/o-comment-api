/* global mockupReset */
"use strict";

var mergeMockup = {
    reset: function () {
        mergeMockup.log = {};
    },
    log: {},
    mockup: function () {
        mergeMockup.log = Array.prototype.slice.call(arguments);

        return Array.prototype.slice.call(arguments);
    }
};

if (mockupReset) {
    mockupReset.add(mergeMockup.reset);
}