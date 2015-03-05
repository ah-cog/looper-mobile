# Looper

![Preview of Looper](https://raw.githubusercontent.com/mokogobo/looper-app/master/Preview.png)

Looper is a visual programming environment for mobile touchscreen devices including smartphones and tablets.

## Install Development Environment

### Install [PhoneGap](http://phonegap.com/)

Start by installing PhoneGap by following the [Install PhoneGap](http://phonegap.com/install/) tutorial.

### Install [PhoneGap Plugins](http://plugins.cordova.io/#/)

Next, install the needed plugins by following the instructions below.

First, install the HTTP Web Server:

	sudo phonegap plugin add https://github.com/floatinghotpot/cordova-httpd.git

Next, install UDP Plugin:

	sudo phonegap plugin add https://github.com/applejacko/cordova-plugin-uic-udp

Next, install Accelerometer Plugin:

	sudo phonegap plugin add org.apache.cordova.device-motion

Finally, verify plugins are installed:

	sudo phonegap plugin

The system should respond with a list of plugins similar to the following. The versions and formatting may vary.

	com.rjfun.cordova.httpd 0.9.2 "CorHttpd"
	edu.uic.travelmidwest.cordova.udptransmit 0.0.1 "UDPTransmit"
	org.apache.cordova.device-motion 0.2.10 "Device Motion"

### Install [Android](http://phonegap.com/) Development Environment

Follow the article [Install Apache Cordova on OS X Yosemite](http://whatdafox.com/install-apache-cordova-on-os-x-yosemite/) to develop Looper with Android.

## Configure for Development and Testing

### Configure for Android

    export ANDROID_HOME=/Applications/android-sdk-macosx/
    export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

Read the official [Android Platform Guide](https://cordova.apache.org/docs/en/4.0.0/guide_platforms_android_index.md.html) for more detailed and up-to-date instructions.

#### Run on Android

Plug in an Android phone and enter the following command:

    sudo phonegap run android