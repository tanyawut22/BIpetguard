var serverAuthenUtility = {
	backendResponseParse : (_response,_fieldlist) =>{
		var _responseBackend = _response;
		_fieldlist.forEach(function(element){
			if(!(element in _responseBackend)){
				_responseBackend[element] = null;
			}else if(_responseBackend[element]==undefined){
				_responseBackend[element] = null;
			}
		});
		return _responseBackend;
	},
	autoGenerate : () =>{
		Number.prototype.padLeft = function(base,chr){
		    var  len = (String(base || 10).length - String(this).length)+1;
		    return len > 0? new Array(len).join(chr || '0')+this : this;
		}
		var _mathRandom = Math.floor((Math.random() * 9999) + 1).padLeft(9999,'0'); 
		var d = new Date;
		var _autoGenerate = [d.getFullYear(),(d.getMonth()+1).padLeft(),d.getDate().padLeft()].join("")+[d.getHours().padLeft(),d.getMinutes().padLeft(),d.getSeconds().padLeft()].join("")+_mathRandom;
		return _autoGenerate;
	},
	splitUrl : (urlPantry) =>{
		var tmpStr = urlPantry.replace('https://','').replace('http://','');
		var strArray = tmpStr.split('/');
		var uri = tmpStr.replace(strArray[0], '');
		var host = urlPantry.replace(uri, '');
		return { "host" : host, "uri" : uri };
	},
	setHeaders : (_responseRawHeader) =>{
		var header = {};
		var max = _responseRawHeader.length;
		var idx;
		var countHeader = 0;
		for (idx=0;idx<max;idx+=2) {
			switch (_responseRawHeader[idx].toLowerCase()){
				case "set-cookie":
					if(!header[_responseRawHeader[idx]]){
						header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];	
					}
					else{
						header[_responseRawHeader[idx]] += ';'+_responseRawHeader[idx+1];
					}
					countHeader++;
					break;
				case "x-session-id":
					header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
					countHeader++;
					break;
				case "x-user-id":
					header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
					countHeader++;
					break;
				case "x-app":
					header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
					countHeader++;
					break;
				case "x-access-token":
					header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
					countHeader++;
					break;
			}
		}
		if(countHeader==0){
			header = null;
		}
		return header;
	},
	setHeadersClientAuthen : (_responseRawHeader,_version) =>{
		var header = {};
		var max = _responseRawHeader.length;
		var idx;
		var countHeader = 0;
		for (idx=0;idx<max;idx+=2) {
			switch (_version){
				case "v1" :
					switch (_responseRawHeader[idx].toLowerCase()){
						case "set-cookie":
							if(!header[_responseRawHeader[idx]]){
								header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];	
							}
							else{
								header[_responseRawHeader[idx]] += ';'+_responseRawHeader[idx+1];
							}
							countHeader++;
							break;
						case "x-session-id":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;
						case "x-user-id":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;
						case "x-app":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;
						case "x-access-token":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;
						case "x-private-id":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;
						case "x-orderref":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;			
						}
					break;
				case "v2" :
					switch (_responseRawHeader[idx].toLowerCase()){
						case "x-session-id":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;
						case "x-app":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;
						case "x-orderref":
							header[_responseRawHeader[idx]] = _responseRawHeader[idx+1];
							countHeader++;
							break;			
						}
					break;
			}
		}
		if(countHeader==0){
			header = null;
		}
		return header;
	}
}

module.exports = serverAuthenUtility;