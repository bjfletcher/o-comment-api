var request = require('./request.js');
var envConfig = require('./config.js');

exports.init = function (collectionId, lastEventId, callback) {
    "use strict";

    var lastTime = new Date();
    var timeToWait = 0;

    var lfStreamUrl = "http://"+ envConfig.get().livefyre.networkName +".stream1.fyre.co/v3.0/collection/"+ collectionId +"/"+ lastEventId +"/";

    request.get(lfStreamUrl, {
        success: function (response) {
            timeToWait = 10000 - (new Date() - lastTime);

            if (response.timeout === true) {
                setTimeout(function () {
                    exports.init(collectionId, lastEventId, callback);
                }, (timeToWait < 0 ? 0 : timeToWait));
                return;
            }

            if (response.data && response.data.states) {
                var eventCollection = response.data.states;

                for (var key in eventCollection) {
                    if (eventCollection.hasOwnProperty(key)) {
                        var item = eventCollection[key];

                        // visible and type: comment
                        if (item.vis === 1 && item.type === 0) {
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

                            callback(comment);
                        }
                    }
                }
            }

            setTimeout(function () {
                exports.init(collectionId, response.data && response.data.maxEventId ? response.data.maxEventId : lastEventId, callback);
            }, 0);
        },
        error: function () {
            timeToWait = 10000 - (new Date() - lastTime);

            setTimeout(function () {
                exports.init(collectionId, lastEventId, callback);
            }, (timeToWait < 0 ? 0 : timeToWait));
        }
    });
};