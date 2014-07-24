/* global mockupReset */
"use strict";

var storageWrapperMockup = {
    reset: function () {
        storageWrapperMockup.log = {
            sessionStorage: {
                returnValue: null,
                lastOperation: null
            }
        };
    },
    mockup: {
        sessionStorage: {
            getItem: function (key) {
                storageWrapperMockup.log.sessionStorage.lastOperation = {
                    method: "get",
                    key: key
                };
                return storageWrapperMockup.log.sessionStorage.returnValue;
            },
            setItem: function (key, value) {
                storageWrapperMockup.log.sessionStorage.lastOperation = {
                    method: "set",
                    key: key,
                    value: value
                };
            },
            removeItem: function (key) {
                storageWrapperMockup.log.sessionStorage.lastOperation = {
                    method: "remove",
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