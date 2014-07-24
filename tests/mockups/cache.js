/* global mockupReset */
"use strict";

var cacheMockup = {
    reset: function () {
        cacheMockup.log = {
            init: {
                called: false,
                data: null
            },
            auth: {
                called: false,
                data: null
            }
        };

        cacheMockup.returnValue = {
            init: null,
            auth: null
        };
    },
    mockup: {
        getInit: function () {
            return cacheMockup.returnValue.init;
        },
        cacheInit: function () {
            cacheMockup.log.init.called = true;
            cacheMockup.log.init.data = Array.prototype.slice.call(arguments);
        },
        getAuth: function () {
            return cacheMockup.returnValue.auth;
        },
        cacheAuth: function () {
            cacheMockup.log.auth.called = true;
            cacheMockup.log.auth.data = Array.prototype.slice.call(arguments);
        }
    }
};

if (mockupReset) {
    mockupReset.add(cacheMockup.reset);
}