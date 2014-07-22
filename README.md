# o-comments-data

A JavaScript module which provides an API for the various web services that allow commenting for the FT.

Web services with which this module communicates:

- Session User Data Service (SUDS) - A service which provides the authentication and metadata required to create and use Livefyre comment collections.
- Comment Creation Service (CCS) - A service which allows the creation, and retrieval of comments from the Livefyre APIs

## How to use it
There are two ways of using this module:

### Standalone
Run `grunt`, then insert the JS found in the dist folder:

```javascript
<script src="dist/javascripts/oCommentsData.min.js"></script>
```

The module's API can be accessed using `oCommentsData` in the global scope.

### Bower and browserify
With bower, simply require the module:

```javascript
var oCommentsData = require('o-comments-data');
```

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
       - cache: if true, cache content is considered and the response is also cached. Default is false.
       - force: has effect in combination with cache set to true. If force set to true, it doesn't read the data from cache (call is forced), but it overwrites the cache that already exists.

If cache is set to true, a new field should be added as well:

       - user: User object which has the following utilities:
           + isLoggedIn: function which returns true or false based on the user's logged in status
           + getSession: function which returns the user's session if he's logged in


##### Example

```javascript
oCommentsData.api.init({
    elId: 'dom-id',
    articleId: 'art15123',
    url: 'http://example.com/article/art15123',
    title: 'Article title',
    cache: true,
    user: {
        isLoggedIn: function () {
            return cookieExists('loggedIn');
        },
        getSession: function () {
            return getCookie('SESSID')
        }
    }
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
            "pseudonym": "Dave",
            "emailcomments": "hourly"
            "emailreplies": "immediately"
            "emaillikes": "never"
            "emailautofollow": "off"
        }
    }
}
```


For more information on the possible init fields of Livefyre, please visit: http://docs.livefyre.com/developers/reference/livefyre-js/#conv-config-object

For more information on auth tokens, please visit: http://docs.livefyre.com/developers/user-auth/remote-profiles/ and http://docs.livefyre.com/developers/getting-started/tokens/auth/

For more information on user settings, please visit: http://docs.livefyre.com/product/features/user-options/email-notifications/#UserEmailOptions and http://docs.livefyre.com/developers/user-auth/remote-profiles/#ping-for-pull



### api.getAuth
This method gets the authentication data and user settings. This data is needed for actions that require the user to be authenticated.

##### Configuration
###### Optional fields:
       - cache: if true, cache content is considered and the response is also cached. Default is false.
       - force: has effect in combination with cache set to true. If force set to true, it doesn't read the data from cache (call is forced), but it overwrites the cache that already exists.

If cache is set to true, a new field should be added as well:

       - user: User object which has the following utilities:
           + isLoggedIn: function which returns true or false based on the user's logged in status
           + getSession: function which returns the user's session if he's logged in


##### Example

Without cache:

```javascript
oCommentsData.api.getAuth(function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```


With cache:

```javascript
oCommentsData.api.getAuth({
    cache: true,
    user: {
        isLoggedIn: function () {
            return cookieExists('loggedIn');
        },
        getSession: function () {
            return getCookie('SESSID')
        }
    }
},
function (err, data) {
    if (err) {
        throw err;
    }

    // do something with the data
});
```


##### Sample response

```javascript
{
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJkb21haW4iOiJmdC1pbnQtMC5meXJlLmNvIiwiZXhwaXJlcyI6MTQwMTgxMDI3NDI2MywidXNlcl9pZCI6Ijg5NDg3NDM5IiwiZGlzcGxheV9uYW1lIjoicm9saSJ9.u2ko_UkQkkFwL20RvfMnGmi9ZPXxsnUuxWH5MnAoeyI",
    "expires": 1401810274263,
    "displayName": "pseudonym",
    "settings": {
        "pseudonym": "Dave",
        "emailcomments": "hourly"
        "emailreplies": "immediately"
        "emaillikes": "never"
        "emailautofollow": "off"
    }
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

```javascript
{
    status: "ok"
}
```

### api.getComments
Gets the comments of an article together with collection ID, max event ID (used in Livefyre's system when streaming new data) and authentication data.

##### Configuration
###### Mandatory fields:
       - articleId: ID of the article, any string
       - url: canonical URL of the page
       - title: Title of the page

###### Optional fields:
       - cache: if true, cache content is considered and the response is also cached. Default is false.
       - force: has effect in combination with cache set to true. If force set to true, it doesn't read the data from cache (call is forced), but it overwrites the cache that already exists.

If cache is set to true, a new field should be added as well:

       - user: User object which has the following utilities:
           + isLoggedIn: function which returns true or false based on the user's logged in status
           + getSession: function which returns the user's session if he's logged in

Please note that only the authentication part is cached.

##### Example

```javascript
oCommentsData.api.getComments({
    articleId: 'art15123',
    url: 'http://example.com/article/art15123',
    title: 'Article title',
    cache: true,
    user: {
        isLoggedIn: function () {
            return cookieExists('loggedIn');
        },
        getSession: function () {
            return getCookie('SESSID')
        }
    }
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
        "collectionId": 12512,
        "maxEventId": 51612321,
        "comments": [
            {
                id: 125123,
                author: "author name 1",
                content: "This is a comment."
                timestamp: 1405687488230
            },
            {
                id: 6234123,
                author: "author name 2",
                content: "This is another comment."
                timestamp: 1405625288230
            }
        ]
    },
    "auth": {
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJkb21haW4iOiJmdC1pbnQtMC5meXJlLmNvIiwiZXhwaXJlcyI6MTQwMTgxMDI3NDI2MywidXNlcl9pZCI6Ijg5NDg3NDM5IiwiZGlzcGxheV9uYW1lIjoicm9saSJ9.u2ko_UkQkkFwL20RvfMnGmi9ZPXxsnUuxWH5MnAoeyI",
        "expires": 1401810274263,
        "displayName": "pseudonym",
        "settings": {
            "pseudonym": "Dave",
            "emailcomments": "hourly"
            "emailreplies": "immediately"
            "emaillikes": "never"
            "emailautofollow": "off"
        }
    }
}
```


### api.postComment

This is a method with which a comment can be posted to an article's collection.

##### Configuration
###### Mandatory fields
    - collectionId: ID of the collection. It can be obtained using the getComments function.
    - token: a valid user token.
    - content: Content of the comment.


```javascript
oCommentsData.api.getComments({
    collectionId: 1525234,
    token: "eyJhbGciOiJIUzI1NiJ9.eyJkb21haW4iOiJmdC1pbnQtMC5meXJlLmNvIiwiZXhwaXJlcyI6MTQwMTgxMDI3NDI2MywidXNlcl9pZCI6Ijg5NDg3NDM5IiwiZGlzcGxheV9uYW1lIjoicm9saSJ9.u2ko_UkQkkFwL20RvfMnGmi9ZPXxsnUuxWH5MnAoeyI",
    content: "This is a comment"
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
    status: "ok",
    commentId: 51251232
}
```

### cache
This is a direct entry point to access the caching layer. Using this layer you can obtain auth and init objects if they have a valid entry in the cache and attached to the provided identifier (articleId in case of init, sessionId in case of auth).

The caching layer has several methods:
    
    - cacheAuth: function (sessionId, authObject)
    - getAuth: function(sessionId)
    - removeAuth

    - cacheInit: function (articleId, initObj)
    - getInit: function (articleId)
    - removeInit: function (articleId)



___


<strong>The methods which are meant to configure the module are the following:</strong>

### init
This method is responsible for changing the default configuration used by this module. Calling this method with an object will merge the default configuration with the object specified.

### enableLogging
This method enables logging of the module. It logs using the global 'console' if available (if not, nothing happens).

### disableLogging
This method disables logging of the module.

### setLoggingLevel
This method sets the logging level. This could be a number from 0 to 4 (where 0 is debug, 4 is error), or a string from the available methods of 'console' (debug, log, info, warn, error).
Default is 3 (warn).

## Default configuration

```javascript
{
    "livefyre": {
        "network": "ft.fyre.co"
    },
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
            "getComments": "/v1/getcomments",
            "postComment": "/v1/postcomment"
        }
    },
    "cache": {
        "authName": "comments-prod-auth",
        "initBaseName": "comments-prod-init-"
    }
}
```

## Change the environment
In order to change to the TEST environment, use the following code:

```javascript
oCommentsData.changeConfiguration({
    "livefyre": {
        "network": "ft-1.fyre.co"
    },
    "suds": {
        "baseUrl": "http://test.session-user-data.webservices.ft.com"
    },
    "ccs": {
        "baseUrl": "http://test.comment-creation-service.webservices.ft.com"
    },
    "cache": {
        "authName": "comments-test-auth",
        "initBaseName": "comments-test-init-"
    }
);
```