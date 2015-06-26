var mongoose = require('mongoose');
var config = require('../javascripts/config');

module.exports = {
    connect : function () {
        console.log(config.MongoDB.user + ':' + config.MongoDB.pwd);
        mongoose.connect('mongodb://' + config.MongoDB.user + +':' + config.MongoDB.pwd + '@geck.tv/geckdb', function (err) {
            if (err) console.log(err);
        });
        gdb = mongoose.connection;
        gdb.on('error', console.error.bind(console, 'connection error:'));
        gdb.once('open', function (callback) {
            console.log('Connected to MongoDB database with user: %s', config.MongoDB.user);
        })
    },
    statsSchema: mongoose.Schema({
        visitorCount: Number,
    }),
    save: function () {
        var User = mongoose.model('User', this.statsSchema);
        var arvind = new User({ visitorCount: 0 });
        arvind.save(function (err, data) {
            if (err) {
                if (err.code == 113) console.log('Not authorized to perform this action with MongoDB account: %s', config.MongoDB.user);
                else console.log(err);
            }
            else console.log(data);
        });
    }
}