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
	private Hashtable<String, String> modules2 = new Hashtable<String, String> ();
	// private String modules = "module-list-yeah";

	public WebServer(InetSocketAddress localAddr, AndroidFile wwwroot) throws IOException {
		super(localAddr, wwwroot);
	}

	public WebServer(int port, AndroidFile wwwroot ) throws IOException {
		super(port, wwwroot);
	}

	// public String getModules () {
	// 	modules2.put ("a", "1.2.3.4");
	// 	modules2.put ("2", "1.2.3.4");


	// 	// String response = "{ \"modules\": [ ";

 //  //   	int i = 0;
 //  //   	Set<String> keys = modules.keySet ();
 //  //   	for (String key : keys) {
 //  //   		response += "{ \"ip\": \"" + key + "\" }";
 //  //   		if ((i + 1) < modules.size ()) {
 //  //   			response += ", ";
 //  //   		} else {
 //  //   			response += "";
 //  //   		}
 //  //   		i++;
	//  //    }

 //  //   	response += " ] }";


	// 	return this.modules2.toString();
	// }
}
