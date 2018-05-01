var request = require('request');


function Uber(userOBJ)
{
    this.clientID = userOBJ.clientID || "No Client ID found";
    this.clientSecret = userOBJ.clientSecret || "No Client Secret found";
    this.redirectURI = userOBJ.redirectURI || "No Redirect URL found";
    this.access_token = "No Access Token Found";   
    this.refresh_token = "No Refresh Token Found";
    this.selfScopes = [];  
}

module.exports = Uber;

var baseURLv2 = "https://login.uber.com/oauth/v2";
var baseURLv1_2 = "https://api.uber.com/v1.2";

// Requests Functions -------------------------------

function requestURL(urlpath,params,token,callback)
{   
    var url = params.length!=0 ? baseURLv1_2+urlpath+'?'+params : baseURLv1_2+urlpath;
    //console.log(url);
    var headers = {'Accept-Language':'en_US','Authorization':'Bearer '+token}
    var options = {
        url: url,
        method: 'GET',
        headers: headers
    };
    //console.log(options);
    request(options,function(error,response,body)
    {
        if(response.statusCode == 404)
        {
            return callback('Erro 404',null);
        }
        var jsonRes = JSON.parse(body);
        if(error)
        {
            //console.log(error);
            return callback("Error: "+error,null);
        }
        if(jsonRes["message"] == 'Invalid OAuth 2.0 credentials provided.')
        {
            //console.log('Invalid OAuth 2.0 credentials provided.');
            return callback("Error: "+'Invalid OAuth 2.0 credentials provided.',null);
        }
        //console.log(jsonRes);
        return callback(null,jsonRes);
    });
}

function postRequestURL(urlpath,bodyData,token,callback)
{   
    var url = baseURLv1_2+urlpath;
    //console.log(url);
    var postBodyData = bodyData;
    var headers = {'Accept-Language':'en_US','Authorization':'Bearer '+token}
    var options = {
        url: url,
        method: 'POST',
        json:true,
        headers: headers,
        body:postBodyData
    };
    //console.log(options);
    request.post(options,function(error,response,body)
    {
        if(response.statusCode == 404)
        {
            return callback('Erro 404',null);
        }
        //console.log(JSON.stringify(body));
        var jsonStringfy = JSON.stringify(body);
        var jsonRes = JSON.parse(jsonStringfy);
        if(error)
        {
            return callback("Error: "+error,null);
        }
        if(jsonRes["message"] == 'Invalid OAuth 2.0 credentials provided.')
        {
            return callback("Error: "+'Invalid OAuth 2.0 credentials provided.',null);
        }
        return callback(null,jsonRes);
    });
}

function patchPutRequestURL(urlpath,bodyData,method,token,callback)
{   
    var url = baseURLv1_2+urlpath;
    //console.log(url);
    var postBodyData = bodyData;
    var headers = {'Accept-Language':'en_US','Authorization':'Bearer '+token}
    var options = {
        url: url,
        method: method,
        json:true,
        headers: headers,
        body:postBodyData
    };
    //console.log(options);
    request(options,function(error,response,body)
    {
        var jsonRes = JSON.stringify(body);
        var Json = JSON.parse(jsonRes);
        if(error)
        {
            return callback("Error: "+error,null);
        }
    
        return callback(null,Json);
    });
}

//Authentication ---------------------------------------

//endpoint: GET /authorize
Uber.prototype.getUserCode = function(scopes)
{
    if(!Array.isArray(scopes))
    {
        return callback("Scope is not an Array",null);
    }
    if(scopes.length == 0)
    {
        return new Error("Scope is empty")
    }

    var params = "/authorize?response_type=code&client_id="+this.clientID+"&scope="+scopes.join('+')+"&redirect_uri="+this.redirectURI;
    
    return baseURLv2+params;
}

//endpoint: POST /token
Uber.prototype.getUserToken = function(code,scope,callback)
{
    var self = this;

    var postData = {
        'client_secret': this.clientSecret,
        'client_id': this.clientID,
        'grant_type':'authorization_code', 
        'redirect_uri': this.redirectURI, 
        'scope': scope.join(','), 
        'code':code
    }
    var headers = {'Accept-Language':'en_US','Content-Type':'application/x-www-form-urlencoded'}
    var options = {
        url: 'https://login.uber.com/oauth/v2/token',
        method: 'POST',
        headers: headers,
        form:postData
    };
    
    request(options, function (error, response, body) {
        
        if(error)
        {
            console.log(error);
        }
        if(response.body == '{"error": "invalid_grant"}')
        {
            console.log("Invalid Grant");
            return new Error("Invalid Grant");
        }

        var response = JSON.parse(body);

        self.access_token = response["access_token"];
        self.refresh_token = response["refresh_token"];
        self.selfScopes = response["scope"].split(' ');

        return callback(null,response["access_token"]);
    })
    
}

// Riders ---------------------------------------

//endpoint: GET /me
Uber.prototype.me = function(callback)
{
    requestURL('/me','',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });

}

//endpoint: GET /history
Uber.prototype.history = function(limit,offset,callback)
{
    if(typeof(limit) != 'number' || typeof(offset) != 'number')
    {
        console.log("The paramaters has to be an number.");
        return new Error("The paramaters has to be an number.");
    }
    params = 'limit='+limit+'&'+'offset='+offset;
    requestURL('/history',params,this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });

}

//endpoint: GET /payment-methods
Uber.prototype.paymentMethods = function(callback)
{
    requestURL('/payment-methods','',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: GET /places/{place_id}
Uber.prototype.getPlaceByPlaceId = function(placeId,callback)
{
    requestURL('/palces/'+placeId,'',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: PATCH /me
Uber.prototype.applyPromotion = function(code,callback)
{
    var data = {"applied_promotion_codes": code};
    patchPutRequestURL('/me',data,'PATCH',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    })
}

//endpoint: PUT /places/{place_id}
Uber.prototype.updateHomeOrWork = function(place,placeAddress,callback)
{
    var data = {"address": placeAddress};
    patchPutRequestURL('/places/'+place,data,'PUT',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    })
}


// Ride Products ---------------------------------------

//endpoint: GET /products
Uber.prototype.products = function(coordinates,callback)
{
    if(!Array.isArray(coordinates))
    {
        return callback("Coordinates are not an Array", null)
    }
    var lat = coordinates[0];
    var lon = coordinates[1];
    params = 'latitude='+lat+"&"+'longitude='+lon;
    requestURL('/products',params,this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: GET /products/{product_id}
Uber.prototype.getProductByProductId = function(productId,callback)
{
    requestURL('/products/'+productId,'',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

// Ride Estimates ---------------------------------------

//endpoit: GET /estimates/price
Uber.prototype.estimatePrice = function(coordinates,callback)
{   
    if(!Array.isArray(coordinates))
    {
        return callback("Coordinates are not an Array", null)
    }
    var start_lon = coordinates[1];
    var start_lat = coordinates[0];
    var end_lat = coordinates[2];
    var end_lon = coordinates[3];

    params = 'start_latitude='+start_lat+'&'+'start_longitude='+start_lon+'&'+'end_latitude='+end_lat+'&'+'end_longitude='+end_lon;

    requestURL('/estimates/price',params,this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: GET /estimates/time
Uber.prototype.estimateTime = function(coordinates,callback)
{
    if(!Array.isArray(coordinates))
    {
        return callback("Coordinates are not an Array", null)
    }
    var start_latitude = coordinates[0];
    var start_longitude = coordinates[1];
    params = 'start_latitude='+start_latitude+"&"+'start_longitude='+start_longitude;
    
    requestURL('/estimates/time',params,this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

// Ride Requests ---------------------------------------

//endpoint: POST /requests/estimate
Uber.prototype.requestEstimate = function(infos,callback)
{
    var product_id = infos.product_id;
    var start_latitude = infos.start_latitude;
    var start_longitude = infos.start_longitude;
    var end_latitude = infos.end_latitude;
    var end_longitude = infos.end_longitude;
    
    var postData = {
        'start_latitude':start_latitude,
        'start_longitude':start_longitude,
        'end_latitude':end_latitude,
        'end_longitude':end_longitude,
        'product_id':product_id
    }

    postRequestURL('/requests/estimate',postData,this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: POST /requests
Uber.prototype.createRequest = function(infos,callback)
{
    var product_id = infos.product_id;
    var start_latitude = infos.start_latitude;
    var start_longitude = infos.start_longitude;
    var end_latitude = infos.end_latitude;
    var end_longitude = infos.end_longitude;
    var fare_id = infos.fare_id;
    var postData = {
        'start_latitude':start_latitude,
        'start_longitude':start_longitude,
        'end_latitude':end_latitude,
        'end_longitude':end_longitude,
        'product_id':product_id,
        'fare_id':fare_id
    }
    postRequestURL('/requests',postData,this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endoint: GET /requests/current
Uber.prototype.currentRequest = function(callback)
{
    requestURL('/requests/current','',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: GET /requests/{request_id}
Uber.prototype.getRequestDetails = function(request_id,callback)
{
    requestURL('/requests/'+request_id,'',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: GET /requests/{request_id}/map
Uber.prototype.getRequestMap = function(request_id,callback)
{
    requestURL('/requests/'+request_id+'/map','',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: GET /requests/{request_id}/receipt
Uber.prototype.getRequestReceipt = function(request_id,callback)
{
    requestURL('/requests/'+request_id+'/receipt','',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    });
}

//endpoint: PATCH /requests/current
Uber.prototype.updateOngoingDestination = function(end_coordinates,callback)
{
    
    if(!Array.isArray(end_coordinates))
    {
        return callback("Scope is not an Array",null);
    }
    
    var end_latitude = end_coordinates[0];
    var end_longitude = end_coordinates[1];

    var data = {
        "end_latitude": end_latitude,
        "end_longitude": end_longitude
    };

    patchPutRequestURL('/requests/current',data,'PATCH',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    })
}

//endpoint: DELETE /requests/current
Uber.prototype.cancelCurrentRequest = function(callback)
{
    patchPutRequestURL('/requests/current','','DELETE',this.access_token,function(err,data){
        if(err){
            return callback('There was an error: '+err,null);
        }
        return callback(null,data);
    })
}

/*
//User Test ---------------------------------------
var myUber = new Uber({
    clientID: "xxGekEDpyD4rvqs8L5GXm2s9P4J0FD4Y",
    clientSecret: "O85AMGixD9kmhaU_F1Ay0hY2YKYAxibcW0s2f4Xs",
    redirectURI:"http://localhost:3000/getCode"
})

myUber.access_token = "KA.eyJ2ZXJzaW9uIjoyLCJpZCI6ImNMK0FqNmFaU082aVdnRVRXSWx3OVE9PSIsImV4cGlyZXNfYXQiOjE1Mjc0MjcxMzIsInBpcGVsaW5lX2tleV9pZCI6Ik1RPT0iLCJwaXBlbGluZV9pZCI6MX0.jnz3_tjDrolhSeiqXCs2OAEckV96T2S5lZhXIzslCCE";

myUber.cancelCurrentRequest(function(err,data){
    if(err){console.log(err)}
    console.log(data);
});
*/