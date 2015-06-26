var config = require('../javascripts/config');
var utils= require('../javascripts/utils');
var sqlite3 = require('sqlite3').verbose();


module.exports = {
    db: new sqlite3.Database(config.tsdbPath),
    warps: [],
    users: [],
    groups: [],
    initialize: function () {
        this.loadGroups();
        this.loadWarps();

    },
    loadGroups: function () {
        this.db.all("SELECT * FROM GroupList", function (err, rows) {
            if (err) {
                console.log(err);
                return;
            }
            this.groups = [];
            for (var i = 0; i < rows.length; i++) {
                this.groups[rows[i].Usergroup] = rows[i];
            }
        });
    },
    loadWarps: function () {
        this.db.all("SELECT * FROM Warps", function (err, rows) {
            if (err) {
                console.log(err);
                return;
            }
            this.warps = [];
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                
                if (!row.Private || row.Private == 0 || !row.WarpName) {
                    this.warps[i] = { name: row.WarpName, x: row.X, y: row.Y };
                }
            }
        });
    },
    getUser: function (name, callback) {
        this.db.all("SELECT * FROM Users WHERE Username = @0", name, function (err, rows) {
            if (err || rows.length <= 0)
                callback(null);
            else callback(rows[0]);
        });
    },
    setUser: function (uid, user) {
        this.users[uid] = user;
    }
}