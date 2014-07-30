/* global mockupReset */
"use strict";

var storageWrapperMockup = {
    reset: function () {
        storageWrapperMockup.log = {
            sessionStorage: {}
        };

        storageWrapperMockup.returnValue = {
            sessionStorage: {}
        };
    },
    mockup: {
        sessionStorage: {
            hasItem: function (key) {
                return !!storageWrapperMockup.returnValue.sessionStorage[key];
            },
            getItem: function (key) {
                storageWrapperMockup.log.sessionStorage.getItem = {
                    called: true,
                    key: key
                };
                return storageWrapperMockup.returnValue.sessionStorage[key];
            },
            setItem: function (key, value) {
                storageWrapperMockup.log.sessionStorage.setItem = {
                    called: true,
                    key: key,
                    value: value
                };
            },
            removeItem: function (key) {
                storageWrapperMockup.log.sessionStorage.removeItem = {
                    called: true,
                    key: key
                };
            }
        }
    }
};
storageWrapperMockup.reset();

if (mockupReset) {
    mockupReset.add(storageWrapperMockup.reset);
}