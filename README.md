# Looper

Looper is a visual programming environment for mobile touchscreen devices including smartphones and tablets.

## Install Development Environment

### Install [PhoneGap](http://phonegap.com/) and PhoneGap Plugins

Start by installing PhoneGap by following the [Install PhoneGap](http://phonegap.com/install/) tutorial.

Next, install the needed plugins by following these instructions:

1. Install HTTP Web Server

    sudo phonegap plugin add https://github.com/floatinghotpot/cordova-httpd.git

2. Install UDP Plugin

    sudo phonegap plugin add https://github.com/applejacko/cordova-plugin-uic-udp

3. Install Accelerometer Plugin

    sudo phonegap plugin add org.apache.cordova.device-motion

4. Verify plugins are installed

	sudo cordova plugin

The system should respond with a list of plugins similar to the following. The versions and formatting may vary.

	com.rjfun.cordova.httpd 0.9.2 "CorHttpd"
	edu.uic.travelmidwest.cordova.udptransmit 0.0.1 "UDPTransmit"
	org.apache.cordova.device-motion 0.2.10 "Device Motion"

### Install [Android](http://phonegap.com/) Development Environment

Follow the article [Install Apache Cordova on OS X Yosemite](http://whatdafox.com/install-apache-cordova-on-os-x-yosemite/).

## Configure for Development and Testing

### Configure environment for Android

    export ANDROID_HOME=/Applications/android-sdk-macosx/

    export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

### Run Android Applicaiton

Plug in an Android phone and enter the following command:

    sudo phonegap run android