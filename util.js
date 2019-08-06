/* Copyright (C) 2016-2017 churuxu 
 * https://github.com/churuxu/gmp
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const crypto = require('crypto');
const path = require('path').posix;
const cp = require('child_process');
const os = require('os');

function uuid(seed){
    const hash = crypto.createHash('md5');
    if(seed){
        hash.update(seed);        
    }else{
        hash.update(Math.random().toString());   
    }
    return hash.digest('hex');
}


function guid(seed){
    var ret = "{";
    var orn = uuid(seed);
    for(var i=0; i <orn.length; i++){        
        if(i == 8||i==12||i==16||i==20){
            ret += "-";
        }
        ret += orn[i];
    }
    ret+="}";
    return ret.toUpperCase();
}

function xcid(seed){
    var orn = uuid(seed);    
    return orn.substr(0, 24).toUpperCase();
}

function xcrefid(seed){
    var orn = uuid(seed+"FR");    
    return orn.substr(0, 24).toUpperCase();
}

function xctype(file){
    var ext = path.extname(file);
    if(ext == ".c")return "sourcecode.c.c";
    if(ext == ".cpp")return "sourcecode.cpp.cpp"; 
	if(ext == ".m")return "sourcecode.c.objc";
	if(ext == ".mm")return "sourcecode.cpp.objc";
	if(ext == ".h")return "sourcecode.c.h";
    return "unknown";
}

function xcbuildfile(srcs){
    var out = "";
    for(i in srcs){
        out += "\t\t" + xcid(srcs[i]) +  " = {isa = PBXBuildFile; fileRef = " + xcid(srcs[i]+"FR") + "; };\n";
    }  
    return out;    
}

function xcfileref(srcs){
    var out = "";
    for(i in srcs){
        out += "\t\t" + xcid(srcs[i]+"FR") +  " = {isa = PBXFileReference; fileEncoding = 4; lastKnownFileType = " 
        + xctype(srcs[i]) + "; name = " + path.basename(srcs[i]) + "; path = ../"
        + srcs[i] + "; sourceTree = \"<group>\"; };\n";
    }  
    return out;    
}


function getWindowSDKVesion(){
	if (os.platform() != "win32") return "";
	var cmd = "cmd /c " + __dirname + "/findwinsdk.bat -v";
	try{
		var out = cp.execSync(cmd);
		var str = out.toString();		
		if(str.indexOf("10.") == 0){
			var r = str.indexOf("\r");
			if(r > 0)str = str.substr(0, r);			
			return str;
		}
	}catch(e){		
	}
	return "";
}


var mod = {
    uuid:uuid,
    guid:guid,
    xcid:xcid,
    xcrefid:xcrefid,
    xctype:xctype,
    xcbuildfile:xcbuildfile,
    xcfileref:xcfileref,
	getWindowSDKVesion:getWindowSDKVesion
}
module.exports = mod;


