var uber = require('../lib/node-uber-rider');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should;
var myUber = require('./configs.js');

var baseURLv2 = "https://login.uber.com/oauth/v2";
var baseURLv1_2 = "https://api.uber.com/v1.2";
var scope = ['history','profile','all_trips','places'];
var coordinates = ['37.7752315','-122.418075'];

describe('node-uber-rider', function(){

    describe('Authentication', function(){
        it('.getAuthorizeUrl', function(){
            var scopes = ['history','profile','all_trips','places'];
            var code = myUber.getAuthorizeUrl(scopes);
            var url = baseURLv2+"/authorize?response_type=code&client_id="+myUber.clientID+"&scope="+scopes.join('+')+"&redirect_uri="+myUber.redirectURI;
            gb_code = code;
            expect(code).to.be.equal(url);
        });
    });

    describe('Riders', function(){
        it('.me', function(done){
            myUber.me(function(err,data){
                if (err) done(err);
                else done();
            });
            

        });

        it('.history', function(done){
            myUber.history(5,0,function(err,data){
                if (err) done(err);
                else done();
            });
        });

        it('.paymentMethods', function(done){
            myUber.paymentMethods(function(err,data){
                if (err) done(err);
                else done();
            });
        });

        it('.getPlaceByPlaceId', function(done){
            myUber.getPlaceByPlaceId('home',function(err,data){
                if (err) done(err);
                else done();
            });
        }); 

        it('.getPlaceByPlaceId', function(done){
            myUber.getPlaceByPlaceId('home',function(err,data){
                if (err) done(err);
                else done();
            });
        }); 
        
    });

    describe('Ride Products', function(){
        it('.products', function(done){
            myUber.products(coordinates,function(err,data){
                if (err) done(err);
                else done();
            });
        }); 

        it('.getProductByProductId', function(done){
            myUber.getProductByProductId('a1111c8c-c720-46c3-8534-2fcdd730040d',function(err,data){
                if (err) done(err);
                else done();
            });
        }); 
    });

    describe('Ride Estimates', function(){
        it('.estimatePrice', function(done){
            myUber.estimatePrice(coordinates,function(err,data){
                if (err) done(err);
                else done();
            });
        }); 

        it('.estimateTime', function(done){
            myUber.estimateTime(coordinates,function(err,data){
                if (err) done(err);
                else done();
            });
        }); 
    });
    
    describe('Ride Requests', function(){
        it('.requestEstimate', function(done){
            myUber.requestEstimate(coordinates,function(err,data){
                if (err) done(err);
                else done();
            });
        }); 

        
    });
});