package com.rjfun.cordova.httpd;

import java.util.Hashtable;
import java.util.Set;
import java.io.IOException;
import java.net.InetSocketAddress;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.URLEncoder;
import java.util.Date;
import java.util.Enumeration;
import java.util.Vector;
import java.util.Hashtable;
import java.util.Locale;
import java.util.Properties;
import java.util.StringTokenizer;
import java.util.TimeZone;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;

import java.util.Map;
import android.util.Log;


public class WebServer extends NanoHTTPD
{
	public WebServer(InetSocketAddress localAddr, AndroidFile wwwroot) throws IOException {
		super(localAddr, wwwroot);
	}

	public WebServer(int port, AndroidFile wwwroot ) throws IOException {
		super(port, wwwroot);
	}
}
