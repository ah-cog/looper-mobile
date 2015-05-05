cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
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
        "file": "plugins/com.albahra.plugin.networkinterface/www/networkinterface.js",
        "id": "com.albahra.plugin.networkinterface.networkinterface",
        "clobbers": [
            "window.networkinterface"
        ]
    },
    {
        "file": "plugins/com.rjfun.cordova.httpd/www/CorHttpd.js",
        "id": "com.rjfun.cordova.httpd.CorHttpd",
        "clobbers": [
            "cordova.plugins.CorHttpd"
        ]
    },
    {
        "file": "plugins/cordova-plugin-vibration/www/vibration.js",
        "id": "cordova-plugin-vibration.notification",
        "merges": [
            "navigator.notification",
            "navigator"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.device-motion": "0.2.10",
    "cordova-plugin-dgram": "0.1.2",
    "com.albahra.plugin.networkinterface": "1.0.7",
    "com.rjfun.cordova.httpd": "0.9.2",
    "cordova-plugin-vibration": "1.0.1-dev"
}
// BOTTOM OF METADATA
});