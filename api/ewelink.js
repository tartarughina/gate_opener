const ewelink = require('ewelink-api');
const os = require('os');
const fs = require('fs');
const Zeroconf = require('ewelink-api/src/classes/Zeroconf');

let connection = null;

//get the current ip, needed for the first setup of zeroconf
const get_local_ip = () => {
    let ifaces = os.networkInterfaces();
    let iface = [];

    for (var dev in ifaces) {
        // ... and find the one that matches the criteria
        iface.push(ifaces[dev].filter((details) => {
            return details.family === 'IPv4' && details.internal === false;
        }));
    }
    let ret;

    iface.forEach(element => {
        if(element.length > 0)
            ret = element[0].address;
    });  

    return ret;
}

const prep_lan_mode = async () => {
    const devicesCache = await Zeroconf.loadCachedDevices();
    const arpTable = await Zeroconf.loadArpTable();

    connection = new ewelink({ devicesCache, arpTable });
}

//creates the connection object required for the service
exports.prep_connection = async () => {
    if (!fs.existsSync('arp-table.json')) {
        let app = new ewelink({
            email: 'riccardo.strina@expresscarservice.it',
            password: 'Psw_ewelink_99',
            region: 'eu',
            APP_ID: 'oeVkj2lYFGnJu5XUtWisfW4utiN4u9Mq',
            APP_SECRET: '6Nz4n0xA8s8qdxQf2GqurZj2Fs55FUvM'
        });

        app.saveDevicesCache();

        const ip = get_local_ip();
        
        if (ip) {
            
            await Zeroconf.saveArpTable({ ip: ip })
        }
        else {
            process.exit();
        }
    }

    await prep_lan_mode();
}

exports.trigger_device = (dev_id) => {
    return new Promise((resolve, reject) => {
        resolve(connection.toggleDevice(dev_id));
    });
}

