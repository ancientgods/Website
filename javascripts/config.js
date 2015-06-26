var fs = require('fs');

try {
    module.exports = require('../config');
}
catch (e) {
    console.log('Config file not found, creating new one...');
    module.exports = {
        port: 3000,
        MongoDB: {
            user: 'Guest',
            pwd: '123'
        },
        tsdbPath: 'C:/CubiV/Server/tshock/tshock.sqlite',
        groupList: ['superadmin', 'barman', 'Slayer'],      
    }
    fs.writeFile('./config.json', JSON.stringify(module.exports, null, 4));
}
