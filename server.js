// Global vars - sounds like they need to be top :D
var currentdate = new Date();
var datetime = "[ " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds() + " ]";
/// Included JS Files
var utils = require('./javascripts/utils');
var config = require('./javascripts/config');
//We should use TaffyDB instead. Commenting out Mongo, because it produces runtime error, it seems.
//var mongodb = require('./javascripts/mongodb.js');
var tsdb = require('./javascripts/tsdb.js');
// Ends here
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var winston = require('winston');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
initialize();


//Initiate winston logger File tranport. For saving logs from chat to files
winston.add(winston.transports.File, {
    filename: 'Chat.log', //if not set otherwise. Just to avoid server crash because of work with undefined
    handleExceptions: true
 });

function initialize() {
    //mongodb.connect();
    //mongodb.save();
    tsdb.initialize();
}

//Intervals
setInterval(function () {
    tsdb.loadWarps();
    tsdb.loadGroups();
}, 1000 * 60 * 30); //Triggered once every 30 minutes.

setInterval(function() {
    winston.transports.File({ filename: './logs/' + datetime + ' Chat.log' });
}, 1000 * 60 * 60 * 5); //Saves current log from chat every five hours

setInterval(function() {
    utils.resetTimeStamp(currentdate, datetime);
}, 1000) //Resets Date each second. Sets timestamp to new time. Used for synchronisation.

// App-gets :P
app.get('/', function (req, res) {
    res.redirect('/Terraria/');
});


app.get('/Terraria/', function (req , res) {
    utils.ensureCookieExists(req, res);
    var user = tsdb.users[req.cookies.uid];
    
    var info = { url: '/' };
    if (user) {
        info.admin = utils.isAdmin(user);
        info.username = user.Username;
    }
    res.render('index', info);
});



app.get('/Terraria/store', function (req, res) {
    var user = tsdb.users[req.cookies.uid];
    
    if (!user) {
        res.redirect('login');
    } else {
        var info = { url: '/store' };
        if (user) {
            info.admin = utils.isAdmin(user);
            info.username = user.Username;
        }
        res.render('store', info);
    }
});

app.get('/Terraria/map', function (req, res) {
    utils.ensureCookieExists(req, res);
    var user = tsdb.users[req.cookies.uid];
    
    var info = { url: '/map' };
    if (user) {
        info.admin = utils.isAdmin(user);
        info.username = user.Username;
    }
    res.render('map', info);
});

app.get('/Terraria/map/fullscreen', function (req, res) {
    res.render('mapfs', { warps: JSON.stringify(tsdb.warps) });
});

app.get('/Terraria/login', function (req, res) {
    utils.ensureCookieExists(req, res);
     
    res.render('login');
});

app.get('/Terraria/admin', function (req, res) {   
    var user = tsdb.users[req.cookies.uid];
    
    if (!user) {
        res.redirect('/login');

    
    } else if (utils.isAdmin(user)) {
        var info = { url: '/admin' };
        if (user) {
            info.admin = utils.isAdmin(user);
            info.username = user.Username;
        }
        res.render('admin', info);
    } else {
        res.redirect('/Terraria')
    }
});

app.use(function (req, res, next) {
    res.render('error');
});

// SERVER SOCKETS

io.sockets.on('connection', function (socket) {
    //----- LOGIN SOCKETS
    var uid = cookie.parse(socket.handshake.headers['cookie']).uid;
    var user = tsdb.users[uid];

    socket.on('login', function (data, callback) {
        tsdb.getUser(data.name, function (user) {
            if (user) {
                if (utils.isValidLogin(user, data.pass)) {
                    callback(true)
                    tsdb.setUser(uid, user);
                } else callback(false, 'Invalid password');
            }
            else callback(false, 'Username does not exist!\nPlease login to the server first and create an account.');           
        });
    });
    

    //----- CHAT SOCKET   
    socket.on('message', function (message) { 
        if (!user) //user is not logged in
            return;
        socket.broadcast.emit('message', { user: user.Username, message: message });
        console.log(datetime + user.Username + ": " + message);
        logWinston(name + ": " + message, datetime);
    });
});

server.listen(3001);
module.exports = app.listen(config.port);
console.log('Server listening on port %s', config.port)