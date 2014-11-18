"use strict";

exports.emit = function (eventName, eventDetails) {
	eventDetails = eventDetails || {};
	try {
		document.body.dispatchEvent(new CustomEvent('oCommentApi.' + eventName, {
			detail: {
				eventType: eventDetails.type || 'info',
				message: eventDetails.message
			},
			bubbles: true
		}));
	} catch (e) {
		// do nothing
	}
};
