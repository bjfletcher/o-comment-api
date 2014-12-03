"use strict";

var events = require('./events.js');

var request = require('./request.js');
var envConfig = require('./config.js');
var logger = require('o-comment-utilities').logger;

function Stream (collectionId, config) {
	var callbacks = [];
	var lastEventId;

	var initialized = false;
	var destroyed = false;

	if (config.callbacks && config.callbacks instanceof Array) {
		callbacks = config.callbacks;
	}
	if (config.callback && typeof config.callback === 'function') {
		callbacks.push(config.callback);
	}

	if (config.lastEventId) {
		lastEventId = config.lastEventId;
	}


	var callAllCallbacks = function () {
		var i;
		var args = arguments;

		var callCallback = function () {
			callbacks[i].call(this, args);
		};

		for (i = 0; i < callbacks.length; i++) {
			setTimeout(callCallback, 0);
		}
	};

	var handleNewComment = function (data, authorData) {
		callAllCallbacks({
			comment: {
				parentId: data.content.parentId,
				author: {
					displayName: authorData.displayName,
					tags: authorData.tags,
					type: authorData.type
				},
				content: data.content.bodyHtml,
				timestamp: data.content.createdAt,
				commentId: data.content.id,
				visibility: data.vis
			}
		});
	};

	var handleUpdateComment = function (data) {
		callAllCallbacks({
			comment: {
				updated: true,
				commentId: data.content.id,
				content: data.content.bodyHtml
			}
		});
	};

	var handleDeleteComment = function (data) {
		callAllCallbacks({
			comment: {
				deleted: true,
				commentId: data.content.id
			}
		});
	};

	var handleCommentsEnabled = function (data) {
		callAllCallbacks({
			collection: {
				commentsEnabled: data.value
			}
		});
	};

	var handleResponseData = function (data) {
		if (data.states) {
			var eventCollection = data.states;

			for (var key in eventCollection) {
				if (eventCollection.hasOwnProperty(key)) {
					var item = eventCollection[key];

					// type: comment
					if (item.type === 0) {
						if (item.vis === 1) {
							if (item.content.updatedBy) {
								handleUpdateComment(item);
							} else {
								handleNewComment(item, data.authors[item.content.authorId]);
							}
						} else if (item.vis === 0) {
							handleDeleteComment(item);
						}
					}
				}
			}
		}

		if (data.settings && data.settings.length) {
			var i = 0;
			var setting;

			for (i = 0; i < data.settings.length; i++) {
				setting = data.settings[i];

				if (setting.name === 'commentsEnabled') {
					handleCommentsEnabled(setting);
				}
			}
		}
	};





	function connect () {
		if (destroyed) {
			return;
		}

		var lastTime = new Date();
		var timeToWait = 0;
		var aborted = false;

		var lfStreamUrl = "http://"+ envConfig.get().livefyre.networkName +".stream1.fyre.co/v3.0/collection/"+ collectionId +"/"+ lastEventId +"/";

		var backupRestart = setTimeout(function () {
			aborted = true;

			logger.debug('oCommentApi', 'stream', 'backup restart');
			restartConnection({
				force: true
			});
		}, 30000);

		var restartConnection = function (options) {
			options = options || {};

			logger.debug('oCommentApi', 'stream', 'restart');
			clearTimeout(backupRestart);

			if (!aborted || options.force === true) {
				aborted = true;

				timeToWait = 10000 - (new Date() - lastTime);

				setTimeout(function () {
					if (options.report === true) {
						events.emit('streamingEvent', {
							eventType: 'info',
							message: 'connection restored'
						});
					}

					connect();
				}, (timeToWait < 0 ? 0 : timeToWait));
			}
			return;
		};

		try {
			request.get(lfStreamUrl, {
				success: function (response) {
					try {
						if (response.timeout === true) {
							logger.debug('oCommentApi', 'stream', 'success, timeout');
							restartConnection();
							return;
						}

						if (response.data) {
							handleResponseData(response.data);
						}

						if (!aborted) {
							clearTimeout(backupRestart);

							lastEventId = response.data && response.data.maxEventId ? response.data.maxEventId : lastEventId;
							setTimeout(function () {
								logger.debug('oCommentApi', 'stream', 'success, new call');
								connect();
							}, 0);
						}
					} catch (e) {
						events.emit('streamingEvent', {
							eventType: 'error',
							message: 'connection dropped',
							error: e
						});
						logger.debug('oCommentApi', 'stream', 'exception', e);

						restartConnection({
							report: true
						});
					}
				},
				error: function (err) {
					events.emit('streamingEvent', {
						eventType: 'error',
						message: 'connection dropped',
						error: err
					});
					logger.debug('oCommentApi', 'stream', 'error', err);

					restartConnection({
						report: true
					});
				},
				timeout: function () {
					logger.debug('oCommentApi', 'stream', 'timeout');
					restartConnection();
				}
			});
		} catch (e) {
			events.emit('streamingEvent', {
				eventType: 'error',
				message: 'connection dropped',
				error: e
			});
			logger.debug('oCommentApi', 'stream', 'exception', e);

			restartConnection({
				report: true
			});
		}
	}


	this.addCallback = function (callback) {
		if (callback && typeof callback === 'function') {
			callbacks.push(callback);
		}
	};

	this.setLastEventId = function (eventId) {
		lastEventId = eventId;
	};

	this.init = function () {
		if (!initialized && !destroyed && lastEventId && collectionId && callbacks.length) {
			initialized = true;
			connect();

			return true;
		} else {
			return false;
		}
	};

	this.destroy = function () {
		callbacks = null;
		lastEventId = null;

		destroyed = true;
	};
}
module.exports = Stream;
