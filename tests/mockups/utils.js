/* global mockupReset */
"use strict";

var utilsMockup = {
    reset: function () {

    },
    mockup: {
        trim: function (string) {
            return string;
        }
    }
};

if (mockupReset) {
    mockupReset.add(utilsMockup.reset);
}