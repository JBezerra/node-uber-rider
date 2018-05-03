var Uber = require('../lib/node-uber-rider.js');
var config = {
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    redirectURI:process.env.redirectURI,
    access_token: process.env.access_token
};

var myUber = new Uber({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    redirectURI: config.redirectURI,
    access_token: config.access_token
});

module.exports = myUber;