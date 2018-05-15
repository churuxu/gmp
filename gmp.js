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

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const child_process = require('child_process');


const buildfile = "BUILD.gmp";
const sign1 = "##{";
const sign2 = "}##";

var template = ""
var verbose = false;
var gmpdir = "";
var tag = "";
// process command line
process.argv.forEach((val, index, array) => {    
    if(index == 1)gmpdir = path.dirname(val);
    if(index == 2)template = val;
    if(index == 3)tag = val;
});

if(tag.length == 0){
	if(tag.indexOf("vs20")){
		tag = "win32";
	}
}

//load utility functions
const util = require(gmpdir + '/util.js');

//load config
var configstr = "";
if(fs.existsSync(buildfile)){
    configstr = fs.readFileSync(buildfile);   
}else{
    configstr = '{}';
}
var config = JSON.parse(configstr);
var gmp = config;

if (template == "") {
    console.log("usage: gmp <project_template> [tag]");
    return;    
}


function evalScriptValue(jscode){
    var out = "";
    var i = 0;
    var ret = eval(jscode); //return string or append string to "out" 
    if(ret && out.length==0)out = ret;
    return out;
}

//将一个对象的key-value合并到另一个对象
//字符串合并方式: 替换
//数组合并方式: 追加
function mergerObject(toobj, fromobj){
    for(var key in fromobj){        
        if(toobj[key] instanceof Array){
            toobj[key] = toobj[key].concat(fromobj[key]);  
        }else{
            toobj[key] = fromobj[key];
        }
    }
}


function pushFilesToArray(arr, dir, extnames, curdir){ 
    if (!fs.existsSync(dir))return;
    if (curdir == null)curdir = dir;
	fs.readdirSync(dir).forEach(function (filename) {        
		var pathname = path.posix.join(dir, filename);
        var newcur = path.posix.join(curdir, filename);
        if (fs.statSync(pathname).isDirectory()) {
            pushFilesToArray(arr, pathname, extnames, newcur);
        } else {
            var ext = path.extname(filename);
            if(ext.length >0 && extnames.indexOf(ext)>=0){               
                arr.push(newcur);
            }
        }		 
	});    
}

function exludeByNameFromArray(filelist, namelist){
    var i = 0;
    var j = 0; 
    var finded = false;    
    while(i<filelist.length){
        finded = false;
        for(j=0;j<namelist.length;j++){
            //console.log("test exlude "+ filelist[i] +" "+namelist[j]);             
            if(filelist[i].indexOf(namelist[j])>=0){
                filelist.splice(i,1);
                finded = true;
                break;
            }            
        }
        if(!finded){
            i++;
        }
    }
}

function getTargetName(dir){
	var target = null;
	try{
		var data = fs.readFileSync(dir + "/BUILD.gmp");
		var obj = JSON.parse(data);
		target = obj.target;
	}catch(e){
		
	}
	if(!target){
		target = path.basename(dir);
	}
	return target;
}

function evalConfigs(){    

    if(!gmp.target){        
        gmp.target = path.basename(process.cwd());
    }
    
    if(!gmp.package){
        gmp.package = "com." + gmp.target;
    } 
    
    if(!gmp.guid){
        gmp.guid = util.guid(gmp.target);
    }  
    if(!gmp.uuid){
        gmp.uuid = util.uuid(gmp.target);
    }            
    if(!gmp.srcext){
        gmp.srcext=".c .cpp .cc";
    }    
    
    if(!gmp.headerext){
        gmp.headerext=".h .hpp";
    }
    
    if(!gmp.srcdirs){
        gmp.srcdirs=["."];
    }

	if(tag.length && gmp[tag]){
		mergerObject(gmp, gmp[tag]);	
	}  
  
    if(!gmp.srcs){
        gmp.srcs = new Array();
        for(var i=0;i<gmp.srcdirs.length;i++){
            pushFilesToArray(gmp.srcs,  gmp.srcdirs[i], gmp.srcext, null);
        }
    }
        
    if(!gmp.headers){
        gmp.headers = new Array();
        for(var i=0;i<gmp.srcdirs.length;i++){
            pushFilesToArray(gmp.headers, gmp.srcdirs[i], gmp.headerext,  null);
        }
    }
    

    if(gmp.exludes){ 
        exludeByNameFromArray(gmp.srcs, gmp.exludes);
    }
	
	if(gmp.precompile){
		if(!gmp.defines)gmp.defines = new Array();
		gmp.defines.push('PRECOMPILE_HEADER="' + gmp.precompile+'"');
	}
}


function processFile(file, to){
    var filedata = fs.readFileSync(file);
    var filestr = filedata.toString();
    var outdata = "";
    var inproc = false;
    var scdata = "";
    var fromidx = 0;
    var idx1 = 0;
    var idx2 = 0;
    var finded = false;
    console.log(file + "\t-->\t" + to);
    while(true){
        idx1 = filestr.indexOf(sign1, fromidx);
        if(idx1>=0){
            outdata += filestr.substr(fromidx, idx1 - fromidx);
            fromidx = idx1 + 3;            
            idx2 = filestr.indexOf(sign2, fromidx);
            if(idx2>=0){
                scdata = filestr.substr(fromidx, idx2 - fromidx);
                if(verbose)console.log("eval "+scdata);
                fromidx = idx2 + 3;
                outdata += evalScriptValue(scdata);
                finded = true;
            }else{
                outdata += filestr.substr(fromidx - 3);
                break;
            }
        }else{
            outdata += filestr.substr(fromidx);
            break;
        }
    }
    
    if(!finded){
        //console.log(to +" is added");   
        fs.writeFileSync(to, filedata);
        return;
    }

   // console.log(file +" -> " + to);
    var olddata = "";
    if(fs.existsSync(to)){    
        olddata = fs.readFileSync(to);
    }
    if(olddata != outdata){
        //console.log(to+ " is modified");       
        fs.writeFileSync(to, outdata);
    }else{
        //console.log(to + " is no change");
    }
}

function processDir(dir, to){
    var files = fs.readdirSync(dir); 
    if (!fs.existsSync(to))fs.mkdirSync(to);
	files.forEach(function (filename) {
		var pathname = path.join(dir, filename);
        var newto = path.join(to, filename);
        if(newto.indexOf("gmp.target")>=0){
            newto = newto.replace("gmp.target", gmp.target);
        }        
        if (fs.statSync(pathname).isDirectory()) {
            if(verbose)console.log("dir "+pathname+" -> "+newto);            
            processDir(pathname, newto);
        } else {
            if(verbose)console.log("file "+pathname+" -> "+newto);
            processFile(pathname, newto);
        }		 
	});
}


function hashCode(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        ch = str.charCodeAt(i);
        hash = ((hash<<5)-hash) + ch;
        hash = hash & hash; 
    }
    return hash;
}

function execCommand(cmd, cwd){		
	var opt = {};
	if(cwd){	
		opt.cwd = cwd;
	}
	opt.stdio = "inherit";	
	console.log(cmd);
	child_process.execSync(cmd, opt);
	
}

function processDepends(){
	if(!gmp.depends){
		return ;
	}
	
	for(var i=0;i<gmp.depends.length;i++){
		//生成依赖文件
		var dependdir = gmp.depends[i];
		var cmd = "gmp " + template + " " + tag;
		execCommand(cmd, dependdir);
		
		//依赖文件的include合并到当前文件中		
		var dependfile = dependdir + "/" + buildfile;
		if(fs.existsSync(dependfile)){
			var dependgmpdata = fs.readFileSync(dependfile);
			var dependgmp = JSON.parse(dependgmpdata);
			if(dependgmp.exports && dependgmp.exports.includes){
				for(var j =0;j<dependgmp.exports.includes.length;j++){
					var include = dependgmp.exports.includes[j];
					gmp.includes.push(dependdir + "/" + include);
				}
			}
		}		
	}
}

//下载文件
function processDownload(){
	if(gmp.download){
		var statusfile = ".gmp.status";
		var status = {};
		try{
			status = JSON.parse(fs.readFileSync(statusfile));
		}catch(e){}
		var filename = path.basename(gmp.download);
		if(status.downloaded != gmp.download){
			//上次下载的不一样，则重新下载
			var url = gmp.download;		
			var cmd = `curl -fsSL -o "${filename}" ${url}`;
			execCommand(cmd);
			status.downloaded = gmp.download;
			fs.writeFileSync(statusfile, JSON.stringify(status));			
		}
		if(status.unpacked != gmp.download){
			var cmd = `unzip -o "${filename}"`;
			execCommand(cmd);
			status.unpacked = gmp.download;
			fs.writeFileSync(statusfile, JSON.stringify(status));
			return 1000;
		}
	}
	return 0;
}


processDownload();

evalConfigs();
var templateto = path.basename(template);
var templatedir = path.join(gmpdir, "template", template);
if(templateto != template && fs.existsSync(template))templatedir = template;



processDepends();

console.log(templatedir);
console.log(gmp);


processDir(templatedir, templateto);




