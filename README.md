# o-comment-api

A JavaScript API that provides a simple abstraction of the FT's commenting APIs.

This modules uses:

- Session User Data Service (SUDS) - Provides the authentication and metadata required to create and use Livefyre comment collections. Also allows a user's preferences to be modified
- Comment Creation Service (CCS) - Allows the creation and retrieval of comments for FT content

---

## How to use it
There are two ways of using this module:

### Standalone
Run `grunt`, then insert the JS found in the dist folder:

```javascript
<script src="dist/javascripts/oCommentApi.min.js"></script>
```

The module's API can be accessed using `oCommentApi` in the global scope.

### Bower and browserify
With bower, simply require the module:

```javascript
var oCommentApi = require('o-comment-api');
```

The module should be built using `browserify` (with `debowerify` transform).

---

## Configuration
<strong>The methods which are meant to configure the module are the following:</strong>

### init
This method is responsible for changing the default configuration used by this module. Calling this method with an object will merge the default configuration with the object specified (deep merge, primitive type values of the same key will be overwritten).

##### Default configuration

```javascript
{
    "suds": {
        "baseUrl": "http://session-user-data.webservices.ft.com",
        "endpoints": {
            "livefyre": {
                "init": "/v1/livefyre/init",
            },
            "user": {
                "updateUser": "/v1/user/updateuser",
                "getAuth": "/v1/user/getauth"
            }
        }
    },
    "ccs": {
        "baseUrl": "http://comment-creation-service.webservices.ft.com",
        "endpoints": {
            "getComments": "/v1/getComments",
            "postComment": "/v1/postComment"
        }
    },
    "cacheConfig": {
        "authBaseName": "comments-prod-auth-",
        "initBaseName": "comments-prod-init-"
    }
}
```


##### Change the environment
In order to change to the TEST environment, use the following code:

```javascript
oCommentsData.init({
    "suds": {
        "baseUrl": "http://test.session-user-data.webservices.ft.com"
    },
    "ccs": {
        "baseUrl": "http://test.comment-creation-service.webservices.ft.com"
    },
    "cacheConfig": {
        "authBaseName": "comments-test-auth-",
        "initBaseName": "comments-test-init-"
    }
});
```

---

## Caching

### Enable caching
In order to enable caching within the module, you should set some module level configuration:

Example:

```javascript
oCommentsData.init({
    "cache": true,
    "sessionId": 15231
});
```

Where `sessionId` is a unique identifier of the current user's session (e.g. JSESSIONID for Java systems, PHPSESSID for PHP systems, etc.).

### Clear the cache
The cache layer uses sessionStorage API to store data. While this is cleared automatically each time the browser is closed, there could be some situations the cache should be cleared explicity.

The cache layer provides a public clear method which will delete all o-comments-data related cache entries from the sessionStorage.

```javascript
oCommentsData.cache.clear();
```

---

## Logging
Logging can be enabled for debugging purposes. It logs using the global 'console' if available (if not, nothing happens and it degrades gracefully).
By default logging is disabled.

### enableLogging
This method enables logging of the module.

### disableLogging
This method disables logging of the module.

### setLoggingLevel
This method sets the logging level. This could be a number from 0 to 4 (where 0 is debug, 4 is error), or a string from the available methods of 'console' (debug, log, info, warn, error).
Default is 3 (warn).

---

## API

### api.getLivefyreInitConfig
This method communicates directly with the 'livefyre/init' endpoint of SUDS. It accepts a configuration object and a callback as paramaters. A Livefyre object is passed into the callback (both init and auth fields).

##### Configuration
###### Mandatory fields:

- elId: ID of the HTML element in which the widget should be loaded
- articleId: ID of the article, any string
- url: canonical URL of the page
- title: Title of the page

###### Optional fields:

- stream_type: livecomments, livechat, liveblog
- force: has effect in combination with cache enabled. If force set to true, the data won't be readed from the cache even if a valid entry exists, but it will force the call to the webservice to happen.


##### Example

```javascript
oCommentsData.api.init({
    elId: 'dom-id',
    articleId: 'art15123',
    url: 'http://example.com/article/art15123',
    title: 'Article title'
}, function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```

##### Sample response

Successful request:

```javascript
{
    "init": {
        "app": "main",
        "articleId": "4ec7810a-797f-11e1-8fad-00144feab49a",
        "el": "livefyre-app-ft-4ec7810a-797f-11e1-8fad-00144feab49a",
        "siteId": "304428",
        "collectionMeta": "eyJhbGciOiJIUzI1NiJ9.eyJjaGVja3N1bSI6ImYyYjViZDgyNjIxMWQ1ZDg4ZmI1ZjllYWUyZTI1NDcxIiwiYXJ0aWNsZUlkIjoiNGVjNzgxMGEtNzk3Zi0xMWUxLThmYWQtMDAxNDRmZWFiNDlhIiwidGl0bGUiOiJMaXZlZnlyZSB0ZXN0IHBhZ2UgLSBGVC5jb20iLCJ1cmwiOiJodHRwOi8vd3d3LmZ0LmNvbS9jbXMvcy8wLzRlYzc4MTBhLTc5N2YtMTFlMS04ZmFkLTAwMTQ0ZmVhYjQ5YS5odG1sIiwidHlwZSI6ImxpdmVjb21tZW50cyIsInN0cmVhbV90eXBlIjoibGl2ZWNvbW1lbnRzIiwidGFncyI6WyJzZWN0aW9ucy5Db21wYW5pZXMiLCJzZWN0aW9ucy5GaW5hbmNpYWxzIiwic2VjdGlvbnMuRmluYW5jaWFsIFNlcnZpY2VzIiwic2VjdGlvbnMuVVMgXHUwMDI2IENhbmFkaWFuIENvbXBhbmllcyJdfQ.VexpwSe72aPB-CEDxiyFT4QDjFEh3PGHgkkVjiHXhXY",
        "checksum": "f2b5bd826211d5d88fb5f9eae2e25471",
        "disableAvatars":true
    },
    "auth": {
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJkb21haW4iOiJmdC1pbnQtMC5meXJlLmNvIiwiZXhwaXJlcyI6MTQwMTgxMDI3NDI2MywidXNlcl9pZCI6Ijg5NDg3NDM5IiwiZGlzcGxheV9uYW1lIjoicm9saSJ9.u2ko_UkQkkFwL20RvfMnGmi9ZPXxsnUuxWH5MnAoeyI",
        "expires": 1401810274263,
        "displayName": "pseudonym",
        "settings": {
            "emailcomments": "hourly"
            "emailreplies": "immediately"
            "emaillikes": "never"
            "emailautofollow": "off"
        }
    }
}
```


The article based on the articleId and the article's metadata cannot be classified into an internal site (section) of Livefyre:

```javascript
{
    "init": {
        "unclassifiedArticle": true
    }
}
```



<strong>For examples of the auth object please see the `getUserData` method.</strong>


For more information on the possible init fields of Livefyre, please visit: http://docs.livefyre.com/developers/reference/livefyre-js/#conv-config-object

For more information on auth tokens, please visit: http://docs.livefyre.com/developers/user-auth/remote-profiles/ and http://docs.livefyre.com/developers/getting-started/tokens/auth/

For more information on user settings, please visit: http://docs.livefyre.com/product/features/user-options/email-notifications/#UserEmailOptions and http://docs.livefyre.com/developers/user-auth/remote-profiles/#ping-for-pull



### api.getUserData
This method gets the authentication data and user settings. This data is needed for actions that require the user to be authenticated.

##### Configuration
###### Optional fields:

- force: has effect in combination with cache enabled. If force set to true, the data won't be readed from the cache even if a valid entry exists, but it will force the call to the webservice to happen.


##### Example

Normal access, without forcing:

```javascript
oCommentsData.api.getAuth(function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```


With force set to true:

```javascript
oCommentsData.api.getAuth({
    force: true
},
function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```


##### Sample response

User is logged in, successful request:

```javascript
{
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJkb21haW4iOiJmdC1pbnQtMC5meXJlLmNvIiwiZXhwaXJlcyI6MTQwMTgxMDI3NDI2MywidXNlcl9pZCI6Ijg5NDg3NDM5IiwiZGlzcGxheV9uYW1lIjoicm9saSJ9.u2ko_UkQkkFwL20RvfMnGmi9ZPXxsnUuxWH5MnAoeyI",
    "expires": 1401810274263,
    "displayName": "pseudonym",
    "settings": {
        "emailcomments": "hourly"
        "emailreplies": "immediately"
        "emaillikes": "never"
        "emailautofollow": "off"
    }
}
```


User is not logged in or the user's session is expired:

```javascript
null
```


User is logged in, but doesn't have a pseudonym set:

```javascript
{
    pseudonym: false
}
```


The authentication service that SUDS is using is down:

```javascript
{
    serviceUp: false
}
```

### api.updateUser
Updates the user's details in both Livefyre and FT Membership systems (DAM).

##### Data needed

- pseudonym: user's display name. This name is displayed on each comment the user posts.
- emailcomments, emailreplies, emaillikes: available values that this service uses: 'never', 'immediately', 'hourly'.
- emailautofollow: available values: 'on' and 'off'.

For more details on the email options visit http://answers.livefyre.com/product/features/user-options/email-notifications/#UserEmailOptions

All fields are optional, but there should be provided at least one.

##### Example

```javascript
oCommentsData.api.updateUser({
    pseudonym: 'my name',
    emailcomments: 'hourly',
    emailreplies: 'immediately',
    emaillikes: 'never'
},
function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```


##### Sample response

Successful response:

```javascript
{
    status: "ok"
}
```


Response with an error:

```javascript
{
    status: "error",
    error: "Error message."
}
```

### api.getComments
Gets the comments of an article together with collection ID, max event ID (used in Livefyre's system when streaming new data) and authentication data.

##### Configuration
###### Mandatory fields:

- articleId: ID of the article, any string
- url: canonical URL of the page
- title: Title of the page

##### Example

```javascript
oCommentsData.api.getComments({
    articleId: 'art15123',
    url: 'http://example.com/article/art15123',
    title: 'Article title'
}, function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```

##### Sample response

```javascript
{
    "collection": {
        "unclassified": false,
        "collectionId": "91440735",
        "lastEvent": 1411541039265900,
        "comments": [{
            "parentId": "",
            "author": {
                "displayName": "roli main",
                "tags": ["FT"],
                "type": 1
            },
            "content": "<p>comment</p>",
            "timestamp": 1411541039,
            "commentId": "216743299",
            "visibility": 1
        }],
        "totalPages": "6"
    }
}
```


### api.postComment
This is a method with which a comment can be posted to an article's collection.

##### Configuration
###### Mandatory fields

- collectionId: ID of the collection. It can be obtained using the getComments function.
- commentBody: Content of the comment.


```javascript
oCommentsData.api.postComment({
    collectionId: 1525234,
    commentBody: "This is a comment"
}, function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```

##### Sample response

Successful response:

```javascript
{
    "success": true,
    "status": "ok",
    "code": "200",
    "invalidSession": false,
    "errorMessage": null,
    "bodyHtml": "<p>post comment</p>",
    "commentId": "215819761",
    "createdAt": 1411370210
}
```

Response with an error:

```javascript
{
    "success": false,
    "status": null,
    "code": null,
    "invalidSession": false,
    "errorMessage": "As good as it may be, you can't post the same comment twice.",
    "bodyHtml": null,
    "commentId": null,
    "createdAt": 0
}
```


### api.deleteComment

This is a method with which a comment can be posted to an article's collection.

##### Configuration
###### Mandatory fields

- collectionId: ID of the collection. It can be obtained using the getComments function.
- commentId: ID of the comment.


```javascript
oCommentsData.api.postComment({
    collectionId: 1525234,
    commentId: 16482
}, function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```

##### Sample response

Successful response:

```javascript
{
    "success": true,
    "invalidSession": false,
    "errorMessage": null
}
```

Response with an error:

```javascript
{
    "success": false,
    "invalidSession": false,
    "errorMessage": "You don't have permission to delete this comment."
}
```
