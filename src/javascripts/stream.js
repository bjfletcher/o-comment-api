"use strict";

var events = require('./events.js');

var request = require('./request.js');
var envConfig = require('./config.js');
var oCommentUtilities = require('o-comment-utilities');

exports.init = function (collectionId, lastEventId, callback) {
	var lastTime = new Date();
	var timeToWait = 0;
	var aborted = false;

	var restartConnection = function (force) {
		oCommentUtilities.logger.debug('oCommentApi', 'stream', 'restart');
		clearTimeout(safetyTimeout);

		if (!aborted || force === true) {
			aborted = true;

			timeToWait = 10000 - (new Date() - lastTime);

			setTimeout(function () {
				exports.init(collectionId, lastEventId, callback);
			}, (timeToWait < 0 ? 0 : timeToWait));
		}
		return;
	};

	var safetyTimeout = setTimeout(function () {
		aborted = true;

		oCommentUtilities.logger.debug('oCommentApi', 'stream', 'safety restart');
		restartConnection(true);
	}, 30000);

	var lfStreamUrl = "http://"+ envConfig.get().livefyre.networkName +".stream1.fyre.co/v3.0/collection/"+ collectionId +"/"+ lastEventId +"/";

	try {
		request.get(lfStreamUrl, {
			success: function (response) {
				try {
					if (response.timeout === true) {
						oCommentUtilities.logger.debug('oCommentApi', 'stream', 'success, timeout');
						restartConnection();
						return;
					}

					if (response.data) {
						if (response.data.states) {
							var eventCollection = response.data.states;

							for (var key in eventCollection) {
								if (eventCollection.hasOwnProperty(key)) {
									var item = eventCollection[key];

									// type: comment
									if (item.type === 0) {
										if (item.vis === 1) {
											if (item.content.updatedBy) {
												// update

												callback({
													comment: {
														updated: true,
														commentId: item.content.id,
														content: item.content.bodyHtml
													}
												});
											} else {
												// new comment

												var comment = {};
												var authorData = response.data.authors[item.content.authorId];

												comment = {
													parentId: item.content.parentId,
													author: {
														displayName: authorData.displayName,
														tags: authorData.tags,
														type: authorData.type
													},
													content: item.content.bodyHtml,
													timestamp: item.content.createdAt,
													commentId: item.content.id,
													visibility: item.vis
												};

												callback({
													comment: comment
												});
											}
										} else if (item.vis === 0) {
											// comment deleted

											callback({
												comment: {
													deleted: true,
													commentId: item.content.id
												}
											});
										}
									}
								}
							}
						}

						if (response.data.settings && response.data.settings.length) {
							var i = 0;
							var setting;

							for (i = 0; i < response.data.settings.length; i++) {
								setting = response.data.settings[i];

								if (setting.name === 'commentsEnabled') {
									callback({
										collection: {
											commentsEnabled: setting.value
										}
									});
								}
							}
						}
					}

					clearTimeout(safetyTimeout);
					setTimeout(function () {
						oCommentUtilities.logger.debug('oCommentApi', 'stream', 'success, new call');
						exports.init(collectionId, response.data && response.data.maxEventId ? response.data.maxEventId : lastEventId, callback);
					}, 0);
				} catch (e) {
					events.emit('streamingEvent', {
						type: 'error',
						message: 'connection dropped'
					});

					oCommentUtilities.logger.debug('oCommentApi', 'stream', 'exception', e);

					restartConnection();
				}
			},
			error: function (err) {
				events.emit('streamingEvent', {
					type: 'error',
					message: 'connection dropped'
				});

				oCommentUtilities.logger.debug('oCommentApi', 'stream', 'error', err);

				restartConnection();
			},
			timeout: function () {
				oCommentUtilities.logger.debug('oCommentApi', 'stream', 'timeout');
				restartConnection();
			}
		});
	} catch (e) {
		events.emit('streamingEvent', {
			type: 'error',
			message: 'connection dropped'
		});

		oCommentUtilities.logger.debug('oCommentApi', 'stream', 'exception', e);

		restartConnection();
	}
};
