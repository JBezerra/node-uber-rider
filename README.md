 [![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org) [![build status](https://img.shields.io/travis/JBezerra/node-uber-rider.svg?style=flat-square)](https://travis-ci.org/JBezerra/node-uber-rider) [![semantic-release]( https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/JBezerra/node-uber-rider)

# A library to use Uber Riders' API faster and easily for Node.js
This project contains all endpoints you need to integrate Uber's API in your application

## Installation

Before begin, you need to register your app in the [Uber developer dashboard](https://developer.uber.com/dashboard). Notice that the app gets a **client ID, Client Secret, and Server Token** required for authenticating with the API.
After registering your application, you need to install this module in your Node.js project:

```sh
npm install node-uber-rider
```

## Initialization

So as to use this module, you have to import it in your application first:

```javascript
var Uber = require('node-uber-rider');
```

Next, initialize the Uber object with the keys you obtained from the [Uber developer dashboard](https://developer.uber.com/dashboard):

```javascript
var uber = new Uber({
  clientID: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  redirectURI: 'REDIRECT_URI',
  
  //If you already have the authentication infos (they are all optional)
  access_token: 'SERVER_TOKEN',
  refresh_token: 'REFRESH_TOKEN',
  selfScopes:[scopes]
});
```

## Authenticating

To make calls in the API, you need to create an authenticated session with the API. User-specific operations require you to use a OAuth 2 bearer token with specific [scopes](https://developer.uber.com/docs/scopes). General operations can use a simple server-token authentication.
You do it in two steps. Step One, request the User's Code `uber.getAuthorizeUrl([scopes])` with the scopes you need, step two, request the User's Bearer Token `uber.getUserToken(UserCode,[scopes],callback)` using the User's Code.

### Step one: Authorize to get the Code

To obtain a bearer token, you have to authorize your application with the required scope. Available scopes are: `history`, `history_lite`, `profile`, `request`, `all_trips`, and `places`.

To do so, you are initially required to redirect your user to an authorization URL. You can generate the authorization URL using `uber.getAuthorizeUrl([scopes])`. In case you are using [Express](http://expressjs.com/), your route definition could look as follows:

```javascript
app.get('/getAuth', function(req,res){
    var url = uber.getAuthorizeUrl(['history','profile','all_trips']);
    res.redirect(url);
});
```

The URL will lead to a page where your user will be required to login and approve access to his/her Uber account. In case that step was successful, Uber will issue an HTTP 302 redirect to the redirect_uri defined in the [Uber developer dashboard](https://developer.uber.com/dashboard). On that redirect, you will receive an authorization code, which is single use and expires in 10 minutes.

### Step two: Receive redirect and get an access token

To complete the authorization you now need to receive the callback and convert the given authorization code into an OAuth access token. You can accomplish that using `uber.getUserToken(UserCode,[scopes],callback)`. This method will retrieve and store the access_token, refresh_token and authorized scopes with the uber object for consecutive requests.

Using Express, you could achieve that as follows:

```javascript
app.get('/getCode', function(req, res){
    code = req.query.code;
    var token = uber.getUserToken(code,['history','profile','all_trips'],function(err,data){
        if(err)
        {
            console.log(err);
        }
        res.send("token: "+ data);
    }); 
});
```

## Endpoints

### Authentication

#### Generate Authorize URL

After getting the authorize url, the user will be redirected to the redirect url with authorization code used in the next function.

```javascript
uber.getAuthorizeUrl([scopes]);
```

##### Example

```javascript
uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
```

### Get Bearer Token

#### It gets the authorization you need (Access Token, Refresh Token, Scopes)

```javascript
uber.getUserToken(UserCode,[scopes],callback);
```

##### Example: Just getting access_token

```javascript
uber.getUserToken(code,['history','profile','all_trips'],function(err,token){
  if(err){
    console.log(err);
   }
   console.log("token: "+ token);
}); 
```

##### Example 2: Getting refresh_token

```javascript
uber.getUserToken(code,['history','profile','all_trips'],function(err,token){
  if(err){
    console.log(err);
   }
   var refresh_token = uber.refresh_token;
   console.log("refresh_token: "+ refresh_token);
}); 
```

### Riders

#### GET /me: 

##### Gets User's Informations

```javascript
uber.me(callback);
```

##### Example
```javascript
uber.me(function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /history: 

##### Gets User's Trips

```javascript
uber.history(limit,offset,callback);
```

##### Example
```javascript
uber.history(5,0,function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /payment-methods: 

##### Gets User's Payment Methods

```javascript
uber.paymentMethods(callback);
```

##### Example
```javascript
uber.paymentMethods(function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /places/{place_id}

##### Gets user's address for home/work

```javascript
uber.getPlaceByPlaceId(palceId,callback);
```

##### Example
```javascript
uber.getPlaceByPlaceId('home',function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### PATCH /me

##### It Applys Promotion

```javascript
uber.applyPromotion(promotionCode,callback);
```

##### Example
```javascript
uber.applyPromotion('FREE_RIDEZ',function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### PUT /places/{place_id}

##### Updates User Address for an ID

```javascript
uber.updateHomeOrWork(placeId,newAddress,callback);
```

##### Example
```javascript
uber.updateHomeOrWork('home','New Street St',function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

## Ride Products

#### GET /products

##### Gets Uber's Products availabe near by

```javascript
uber.products([coordinates],callback);
```

##### Example
```javascript
uber.products(['lat','long'],function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /products/{product_id}

##### Gets Information about a Specific Product

```javascript
uber.getProductByProductId(productID,callback);
```

##### Example
```javascript
uber.getProductByProductId('a1111c8c-c720-46c3-8534-2fcdd730040d',function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```
## Ride Estimates

#### GET /estimates/price

##### It Estimates Price between Start Location and End Location

```javascript
uber.estimatePrice([startAndEndCoordinates],callback);
```

##### Example
```javascript
uber.estimatePrice(['startLat','startLon','endLat','endLon'],function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /estimates/time

##### It Estimates Time between Start Location and End Location

```javascript
uber.estimateTime([startAndEndCoordinates],callback);
```

##### Example
```javascript
uber.estimateTime(['startLat','startLon','endLat','endLon'],function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

## Ride Requests

#### POST /requests/estimate

##### The Request Estimate endpoint allows a ride to be estimated given the desired product

```javascript
var infos = {
  'start_latitude':'start_latitude',
  'start_longitude':'start_longitude',
  'end_latitude':'end_latitude',
  'end_longitude':'end_longitude',
  'product_id':'product_id'
};
uber.requestEstimate(infos,callback);
```

##### Example
```javascript
var infos = {
  'start_latitude':'start_latitude',
  'start_longitude':'start_longitude',
  'end_latitude':'end_latitude',
  'end_longitude':'end_longitude',
  'product_id':'product_id'
};

uber.requestEstimate(infos,function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### POST /requests

##### The Ride Request endpoint allows a ride to be requested on behalf of an Uber user

```javascript
var infos = {
  'start_latitude':'start_latitude',
  'start_longitude':'start_longitude',
  'end_latitude':'end_latitude',
  'end_longitude':'end_longitude',
  'product_id':'product_id',
  'fare_id':'fare_id'
};
uber.createRequest(infos,callback);
```

##### Example
```javascript
var infos = {
  'start_latitude':'start_latitude',
  'start_longitude':'start_longitude',
  'end_latitude':'end_latitude',
  'end_longitude':'end_longitude',
  'product_id':'product_id',
  'fare_id':'fare_id'
};

uber.createRequest(infos,function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /requests/current

##### It Returns Real Time Information about the Ongoing Trip

```javascript
uber.currentRequest(callback);
```

##### Example
```javascript
uber.currentRequest(function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /requests/{request_id}

##### The Ride Request endpoint allows retrieving the status of an ongoing or completed trip that was created by your app.

```javascript
uber.getRequestDetails(requestId,callback);
```

##### Example
```javascript
uber.getRequestDetails(requestId,function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /requests/{request_id}/map

##### It Returns a Map Link for a Request Id

```javascript
uber.getRequestMap(requestId,callback);
```

##### Example
```javascript
uber.getRequestMap(requestId,function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### GET /requests/{request_id}/receipt

##### It Returns the Receipt of a Trip

```javascript
uber.getRequestReceipt(requestId,callback);
```

##### Example
```javascript
uber.getRequestReceipt(requestId,function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### PATCH /requests/current

##### It Updates Ongoing Trip's Destiny

```javascript
uber.updateOngoingDestination([endCoordinates],callback);
```

##### Example
```javascript
uber.updateOngoingDestination(['endLat','endLon'],function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### DELETE /requests/current

##### It Cancels the Current Trip

```javascript
uber.cancelCurrentRequest(callback);
```

##### Example
```javascript
uber.updateOngoingDestination(function(err,data){
  if(err){
    console.log(err);
   }
   console.log(data);
}); 
```

#### In case you want to contribute to the project, feel free! 😁
