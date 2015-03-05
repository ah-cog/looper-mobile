## Looper (App) ##

# Install Cordova/PhoneGap Development Environment

## Install HTTP Web Server:

    sudo phonegap plugin add https://github.com/floatinghotpot/cordova-httpd.git

## Install UDP Plugin:

    sudo phonegap plugin add https://github.com/applejacko/cordova-plugin-uic-udp

## Install Accelerometer Plugin:

    sudo phonegap plugin add org.apache.cordova.device-motion

## Verify plugins are installed:

	sudo cordova plugin

The system should respond with a list of plugins similar to the following. The versions and formatting may vary.

	com.rjfun.cordova.httpd 0.9.2 "CorHttpd"
	edu.uic.travelmidwest.cordova.udptransmit 0.0.1 "UDPTransmit"
	org.apache.cordova.device-motion 0.2.10 "Device Motion"

# Configure Development Environment

## Configure environment for Android:

    export ANDROID_HOME=/Applications/android-sdk-macosx/

    export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

## Run Android Applicaiton:

Plug in an Android phone and enter the following command:

    sudo phonegap run android