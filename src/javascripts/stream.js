var request = require('./request.js');
var envConfig = require('./config.js');

exports.init = function (collectionId, lastEventId) {
    "use strict";

    var lfStreamUrl = "https://"+ envConfig.livefyre.network +".stream1.fyre.co/v3.0/collection/"+ collectionId +"/"+ lastEventId +"/";

    request.get(lfStreamUrl);
};