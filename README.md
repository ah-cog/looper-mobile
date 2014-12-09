## Looper (App) ##

# Install HTTP Web Server:

    sudo phonegap plugin add https://github.com/floatinghotpot/cordova-httpd.git

# Install UDP Plugin:

    sudo phonegap plugin add https://github.com/applejacko/cordova-plugin-uic-udp

# Install Accelerometer Plugin:

    sudo phonegap plugin add org.apache.cordova.device-motion

# Configure environment for Android:

    export ANDROID_HOME=/Applications/android-sdk-macosx/

    export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Run Android Applicaiton:

Plug in an Android phone and enter the following command:

    sudo phonegap run android