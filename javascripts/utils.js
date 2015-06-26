var crypto = require('crypto');
var cookie = require('cookie');
var config = require('../javascripts/config');
var winston = require('winston');

module.exports = {

    getSha512Hash: function (pass) {
        return crypto.createHash('sha512').update(pass).digest('hex').toUpperCase();
    },
    randomIntInc: function (low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    },
    ensureCookieExists: function (req, res) {
        var uid;
        if (!req.cookies.uid) {
            uid = this.randomIntInc(1111111, 99999999);
            res.cookie('uid', uid, { maxAge: 900000, httpOnly: true });
        }
    },
    isAdmin: function (user) {
        return config.groupList.indexOf(user.Usergroup) != -1;
    }, 
    isValidLogin: function (user, pass) {
        return user.Password == this.getSha512Hash(pass);
    },
    logWinston: function(message, dateAndTime) {
        winston.log(dateAndTime + message);
    },
    resetTimeStamp: function(dateObject, timystamp) {
        dateObject = new Date();
        timystamp = "[ " + dateObject.getDate() + "/"
                + (dateObject.getMonth()+1)  + "/" 
                + dateObject.getFullYear() + " @ "  
                + dateObject.getHours() + ":"  
                + dateObject.getMinutes() + ":" 
                + dateObject.getSeconds() + " ]";
    }
}