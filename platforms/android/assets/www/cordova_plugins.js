cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.rjfun.cordova.httpd/www/CorHttpd.js",
        "id": "com.rjfun.cordova.httpd.CorHttpd",
        "clobbers": [
            "cordova.plugins.CorHttpd"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device-motion/www/Acceleration.js",
        "id": "org.apache.cordova.device-motion.Acceleration",
        "clobbers": [
            "Acceleration"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device-motion/www/accelerometer.js",
        "id": "org.apache.cordova.device-motion.accelerometer",
        "clobbers": [
            "navigator.accelerometer"
        ]
    },
    {
        "file": "plugins/cordova-plugin-dgram/www/dgram.js",
        "id": "cordova-plugin-dgram.dgram",
        "clobbers": [
            "dgram"
        ]
    },
    {
        "file": "plugins/in.girish.datagram/www/datagram.js",
        "id": "in.girish.datagram.datagram"
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.rjfun.cordova.httpd": "0.9.2",
    "org.apache.cordova.device-motion": "0.2.10",
    "cordova-plugin-dgram": "0.1.2",
    "in.girish.datagram": "0.1.0"
}
// BOTTOM OF METADATA
});