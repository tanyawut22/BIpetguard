var ServerAuthenErrorMessage = require('../exceptions/serverAuthenException');
var ServerAuthenSecurity = require('../security/serverAuthenSecurity');
var clients = require('restify-clients');
class httpClientConnection{
	sendRequest(options, _senderCallback){
		var data = {};
		try{
			var client = clients.createJsonClient({
				url : options.url,
				headers : options.headers,
				requestTimeout : options.timeout,
				connectTimeout : options.timeout,
				rejectUnauthorized : false, // comment this line if running on production
				retry: false
			});

			switch(options.method){
				case "POST":
					client.post(options.path, options.body, function(err, req, res, obj){ //err, req, res, obj
						data = mappingResponse(err, req, res, obj, options.timeout);
						_senderCallback(data);						
					});
					break;
				case "PUT":
					client.put(options.path, options.body, function(err, req, res, obj){ //err, req, res, obj
						data = mappingResponse(err, req, res, obj, options.timeout);
						_senderCallback(data);
					});
					break;
				case "DELETE":
					client.del(options.path, function(err, req, res){ //err, req, res
						data = mappingResponse(err, req, res, undefined, options.timeout);
						_senderCallback(data);
					});
					break;
				case "GET":
					client.get(options.path, function(err, req, res, obj){ //err, req, res, obj
						data = mappingResponse(err, req, res, obj, options.timeout);
						_senderCallback(data);
					});
					break;
			}
			return data;
		}catch(ex){
			// console.log(ex)
			var resError = {};
			resError.hummusError = new ServerAuthenErrorMessage(90007, '[Hummus] Can\'t Connect Backend');
			_senderCallback(resError);
			//errorCallback(ex);
		}
	}
};

function mappingResponse(err, req, res, obj, cTimeout){ //err, req, res, obj	
	var resObj = {};
	if(!err){
		if(typeof(obj)=="string"){
			obj = JSON.parse(obj);
		}
		resObj.status = res.statusCode;
		resObj.headers = res.headers;
		resObj.rawBody = res.body;
		resObj.body = obj;
		resObj.rawHeaders  = res.rawHeaders;
	}else{
		resObj = mappingErrorResponse(err,res,obj,cTimeout);
	}
	return resObj;		
}

function mappingErrorResponse(err,res,obj,cTimeout){
	var resError = {};
	if(err.name == 'RequestTimeoutError' || err.code == 'ECONNRESET'){
		resError.hummusError = new ServerAuthenErrorMessage(90008, '[Hummus] Timeout SDK { ' + cTimeout/1000 + ' Second }');
		resError.rawBody = null;
	}else if (err.code == 'ECONNREFUSED' || err.code == 'ENOTFOUND' || err.code == 'MethodNotAllowed' || err.message == 'BadDigest'){
		resError.hummusError = new ServerAuthenErrorMessage(90007, '[Hummus] Can\'t Connect Backend');
		resError.rawBody = null;
	}else if (err.message == 'Invalid JSON in response'){
		resError.status = res.statusCode;			
		resError.headers = res.headers;
		resError.rawBody = res.body;
		resError.rawHeaders  = res.rawHeaders;
		resError.body = res.body;
		//need to check x-orderRef
		resError.hummusError = new ServerAuthenErrorMessage(90011, '(' + (res.headers['x-orderref']?res.headers['x-orderref']:"") + ') Unknown Format');
	}else{
		if(res){
			resError.status = res.statusCode;			
			resError.headers = res.headers;
			resError.rawBody = res.body;
			resError.body = res.body;
			resError.rawHeaders = res.rawHeaders;
		}else{
			resError.hummusError = new ServerAuthenErrorMessage(90099);
		}
		// check onj to json
		if(typeof(obj)=="string"&&ServerAuthenSecurity.isJsonString(obj)==false){
			resError.hummusError = new ServerAuthenErrorMessage(90011, '(' + (res.headers['x-orderref']?res.headers['x-orderref']:"") + ') Unknown Format');
			resError.rawBody = res.body;
			resError.body = res.body;
		}else{
			resError.status = res.statusCode;
			resError.body = obj;
			resError.error = err;
			resError.rawBody = obj;
		}
	}
	return resError;
}
module.exports = httpClientConnection;