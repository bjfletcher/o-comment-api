"use strict";

var events = require('./events.js');

var request = require('./request.js');
var envConfig = require('./config.js');
var logger = require('o-comment-utilities').logger;

exports.init = function (collectionId, lastEventId, callback) {
	var lastTime = new Date();
	var timeToWait = 0;
	var aborted = false;

	var restartConnection = function (options) {
		options = options || {};

		logger.debug('oCommentApi', 'stream', 'restart');
		clearTimeout(safetyRestart);

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

				exports.init(collectionId, lastEventId, callback);
			}, (timeToWait < 0 ? 0 : timeToWait));
		}
		return;
	};

	var safetyRestart = setTimeout(function () {
		aborted = true;

		logger.debug('oCommentApi', 'stream', 'safety restart');
		restartConnection({
			force: true
		});
	}, 30000);


	var handleNewComment = function (data, authorData) {
		setTimeout(function () {
			callback({
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
		}, 0);
	};

	var handleUpdateComment = function (data) {
		setTimeout(function () {
			callback({
				comment: {
					updated: true,
					commentId: data.content.id,
					content: data.content.bodyHtml
				}
			});
		}, 0);
	};

	var handleDeleteComment = function (data) {
		setTimeout(function () {
			callback({
				comment: {
					deleted: true,
					commentId: data.content.id
				}
			});
		}, 0);
	};

	var handleCommentsEnabled = function (data) {
		setTimeout(function () {
			callback({
				collection: {
					commentsEnabled: data.value
				}
			});
		}, 0);
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


	var lfStreamUrl = "http://"+ envConfig.get().livefyre.networkName +".stream1.fyre.co/v3.0/collection/"+ collectionId +"/"+ lastEventId +"/";

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
						clearTimeout(safetyRestart);
						setTimeout(function () {
							logger.debug('oCommentApi', 'stream', 'success, new call');
							exports.init(collectionId, response.data && response.data.maxEventId ? response.data.maxEventId : lastEventId, callback);
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
};
