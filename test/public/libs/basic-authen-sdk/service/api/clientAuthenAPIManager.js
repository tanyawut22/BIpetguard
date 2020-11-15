var ServerAuthenUtility = require('../../utility/serverAuthenUtility');
var HttpClientConnection = require('../../connection/httpClientConnection');
var HttpStringClientConnection = require('../../connection/httpStringClientConnection');
var ClientAuthenValidation = require('../../validation/clientAuthenValidation');
var ServerAuthenErrorMessage = require('../../exceptions/serverAuthenException');
var AppAuthenResponseV1 = require('../../models/appAuthenResponseV1');
var AppAuthenResponseV2 = require('../../models/appAuthenResponseV2');
var CommonResponse = require('../../models/common/commonResponse');
var ServerAuthenSecurity = require('../../security/serverAuthenSecurity');

var httpClientConn = new HttpClientConnection();
var httpStringClientCon = new HttpStringClientConnection();
const fieldlistCommon = ["userMessage","moreInfo"];
const fieldlistAuthenV1 = ["userMessage","moreInfo","accessToken","expireIn","idType","idValue","gupAuthenLevel","ptsListOfAPI","gupRegistrationLevel","openIdFlag","ptsAppId","ptsAppEnvironmentType"];
const fieldlistAuthenV2 = ["userMessage","moreInfo","accessToken","expireIn","privateId","ptsListOfAPI","pwrtcAddress","stunServer","turnServer","idType","idValue","partnerSession","ptsWindowTime","ol4","operatorId"];
const xRequester = "Hummus";
const x_sdk_name = "B2C Basic Authen|1.0.0|nodejs";

class clientAuthenAPIManager{
	obtainAuthorityListV1(req,res,_authenCallBack){
		if(!global.clientConfigParameter.urlObtain.hasOwnProperty('version1')||global.clientConfigParameter.urlObtain.version1==null){
			throw new ServerAuthenErrorMessage(90007, '[Hummus] Can\'t Connect Backend');
		}
		var urlParams = ServerAuthenUtility.splitUrl(global.clientConfigParameter.urlObtain.version1);
		var _body = JSON.stringify({
			authCode : req.authCode,
			clientId : req.clientId,
			grantType : req.grantType,
			timeStamp : req.timeStamp,
			redirectURL : req.redirectURL,
			signature : req.signature,
			commandId : req.commandId
		});
		var _bodyBase64 = new Buffer(_body,'utf8').toString('base64');
		var _requestHeader = {};
		_requestHeader['Cookie'] = req.headers['cookie'];
		_requestHeader['x-session-id'] = req.headers['x-session-id'];
		_requestHeader['x-app'] = req.headers['x-app'];
		_requestHeader['x-user-id'] = req.headers['x-user-id'];
		_requestHeader['x-requester'] = xRequester;
		_requestHeader['x-sdk-name'] = x_sdk_name;
		if(req.headers['x-access-token']!=undefined&&req.headers['x-access-token']!=null){_requestHeader['x-access-token'] = req.headers['x-access-token'];}
		if(req.headers['x-private-id']!=undefined&&req.headers['x-private-id']!=null){_requestHeader['x-private-id'] = req.headers['x-private-id'];}
		_requestHeader['x-orderRef'] = ServerAuthenUtility.autoGenerate();
		var _requestParameter = {
			url : urlParams.host,
			path : urlParams.uri,
			headers : _requestHeader,
			timeout : 30000,
			method : 'POST',
			body : _bodyBase64
		};
		httpStringClientCon.sendRequest(_requestParameter, function(apiBackendResponse)
			{
				var _bodyResponse;
				var _errResponse;
				var _apiResponse;
				// check error
				if(!apiBackendResponse.hummusError){
					// check decode base 64
					if(ServerAuthenSecurity.isDecodeBase64(apiBackendResponse.body)===true){
						var _base64ApiResponse = new Buffer(apiBackendResponse.body,'base64').toString('utf8');
						// decode json format
						if(ServerAuthenSecurity.isJsonString(_base64ApiResponse)===true&&_base64ApiResponse!='null'&&_base64ApiResponse!=null){
							var _responseBody = JSON.parse(_base64ApiResponse);
							// http status 200 or 201
							if(apiBackendResponse.status=='200'||apiBackendResponse.status=='201'){
								var _fieldlistHeader = ["set-cookie","x-session-id","x-app","x-user-id"];
								var _fieldlistBody = ["accessToken","expireIn","gupAuthenLevel","ptsListOfAPI","gupRegistrationLevel","openIdFlag","ptsAppId","ptsAppEnvironmentType"];
								var _validationParam = ClientAuthenValidation.validationClientResponseApi(apiBackendResponse.headers,_responseBody,_fieldlistHeader,_fieldlistBody,'v1');
								if(!_validationParam){
									if(_responseBody.resultCode=='20000'){
										// header
										var _headerResponse = ServerAuthenUtility.setHeadersClientAuthen(apiBackendResponse.rawHeaders,'v1');
										for(var prop in _headerResponse){
										    res.set(prop, _headerResponse[prop]);
										}
										_bodyResponse = ServerAuthenUtility.backendResponseParse(_responseBody,fieldlistAuthenV1);
										_apiResponse = new AppAuthenResponseV1(_bodyResponse);
										_authenCallBack(_apiResponse);
									}else{
										// header
										var _headerResponse = ServerAuthenUtility.setHeadersClientAuthen(apiBackendResponse.rawHeaders,'v1');
										for(var prop in _headerResponse){
										    res.set(prop, _headerResponse[prop]);
										}
										_bodyResponse = ServerAuthenUtility.backendResponseParse(_responseBody,fieldlistAuthenV1);
										_bodyResponse.developerMessage = '(' + (apiBackendResponse.headers['x-orderref']?apiBackendResponse.headers['x-orderref']:"") + ') ' + _bodyResponse.developerMessage;
										_apiResponse = new AppAuthenResponseV1(_bodyResponse);
										_authenCallBack(_apiResponse);
									}
								}else{
									_bodyResponse = new ServerAuthenErrorMessage(90005, '(' + (apiBackendResponse.headers['x-orderref']?apiBackendResponse.headers['x-orderref']:"") + ') (' + _validationParam + ') Missing');
									_errResponse = new CommonResponse(_bodyResponse);
									_authenCallBack(_errResponse);
								}
							}else{
								var _fieldlistHeader = [];
								var _fieldlistBody = [];
								var _validationParam = ClientAuthenValidation.validationClientResponseApi(apiBackendResponse.headers,_responseBody,_fieldlistHeader,_fieldlistBody,'v1');
								if(!_validationParam){
									var _headerResponse = ServerAuthenUtility.setHeadersClientAuthen(apiBackendResponse.rawHeaders,'v1');
									for(var prop in _headerResponse){
									    res.set(prop, _headerResponse[prop]);
									}
									_bodyResponse = ServerAuthenUtility.backendResponseParse(_responseBody,fieldlistAuthenV1);
									_bodyResponse.developerMessage = "("+ (apiBackendResponse.headers['x-orderref']?apiBackendResponse.headers['x-orderref']:"") +") "+ _bodyResponse.developerMessage +" and HTTP status code was not 200 and 201";
									_apiResponse = new AppAuthenResponseV1(_bodyResponse);
									_authenCallBack(_apiResponse);
								}else{
									_bodyResponse = new ServerAuthenErrorMessage(90005, '(' + (apiBackendResponse.headers['x-orderref']?apiBackendResponse.headers['x-orderref']:"") + ') (' + _validationParam + ') Missing and HTTP status code was not 200 and 201');
									_errResponse = new CommonResponse(_bodyResponse);
									_authenCallBack(_errResponse);
								}
							}
						}else{
							var hummusError = new ServerAuthenErrorMessage(90011, '(' + (apiBackendResponse.headers['x-orderref']?apiBackendResponse.headers['x-orderref']:"") + ') Response Unknown Format');
							_bodyResponse = ServerAuthenUtility.backendResponseParse(hummusError,fieldlistCommon);
							var _errResponse = new CommonResponse(_bodyResponse);
							_authenCallBack(_errResponse);
						}
					}else{
						var hummusError = new ServerAuthenErrorMessage(90009, '(' + (apiBackendResponse.headers['x-orderref']?apiBackendResponse.headers['x-orderref']:"") + ') Unknow Encoding');
						_bodyResponse = ServerAuthenUtility.backendResponseParse(hummusError,fieldlistCommon);
						var _errResponse = new CommonResponse(_bodyResponse);
						_authenCallBack(_errResponse);
					}
				}else{
					_bodyResponse = ServerAuthenUtility.backendResponseParse(apiBackendResponse.hummusError,fieldlistCommon);
					var _errResponse = new CommonResponse(_bodyResponse);
					_authenCallBack(_errResponse);
				}
			});
	}
	obtainAuthorityListV2(req,res,_authenCallBack){
		if(!global.clientConfigParameter.urlObtain.hasOwnProperty('version2')||global.clientConfigParameter.urlObtain.version2==null){
			throw new ServerAuthenErrorMessage(90007, '[Hummus] Can\'t Connect Backend');
		}
		var urlParams = ServerAuthenUtility.splitUrl(global.clientConfigParameter.urlObtain.version2);

		var _requestParameter = {
			url : urlParams.host,
			path : urlParams.uri,
			headers : {
				"Content-Type" : "application/json",
				"Accept" : "application/json",
				"x-sdk-name": x_sdk_name
			},
			timeout : 30000,
			method : 'POST',
			body : {
				authCode : req.authCode,
				clientId : req.clientId,
				grantType : req.grantType,
				timeStamp : req.timeStamp,
				redirectURL : req.redirectURL,
				signature : req.signature,
				ol4 : req.ol4,
				privateId : req.privateId
			}
		};
		httpClientConn.sendRequest(_requestParameter, function(apiBackendResponse)
			{
				var _bodyResponse;
				var _errResponse;
				var _apiResponse;
				// check hummus error
				if(!apiBackendResponse.hummusError){
					// http status 200 or 201
					if(apiBackendResponse.status=='200'||apiBackendResponse.status=='201'){
						var _fieldlistBody = ['accessToken','expireIn','privateId','ptsListOfAPI'];
						var _fieldlistHeader = [];
						var _validationParam = ClientAuthenValidation.validationClientResponseApi(apiBackendResponse.headers,apiBackendResponse.body,_fieldlistHeader,_fieldlistBody,'v2');
						// validation
						if(!_validationParam){
							// header
							var _headerResponse = ServerAuthenUtility.setHeadersClientAuthen(apiBackendResponse.rawHeaders,'v2');
							for(var prop in _headerResponse){
							    res.set(prop, _headerResponse[prop]);
							}
							_bodyResponse = ServerAuthenUtility.backendResponseParse(apiBackendResponse.body,fieldlistAuthenV2);
							_apiResponse = new AppAuthenResponseV2(_bodyResponse);
							_authenCallBack(_apiResponse);
						}else{
							_bodyResponse = new ServerAuthenErrorMessage(90005, '(' + _validationParam + ') Missing');
							_errResponse = new CommonResponse(_bodyResponse);
							_authenCallBack(_errResponse);
						}
					}else{
						var _fieldlistHeader = [];
						var _fieldlistBody = [];
						var _validationParam = ClientAuthenValidation.validationClientResponseApi(apiBackendResponse.headers,apiBackendResponse.body,_fieldlistHeader,_fieldlistBody,'v2');
						if(!_validationParam){
							// header
							var _headerResponse = ServerAuthenUtility.setHeadersClientAuthen(apiBackendResponse.rawHeaders,'v2');
							for(var prop in _headerResponse){
							    res.set(prop, _headerResponse[prop]);
							}
							_bodyResponse = ServerAuthenUtility.backendResponseParse(apiBackendResponse.body,fieldlistAuthenV2);
							_bodyResponse.developerMessage = _bodyResponse.developerMessage +" and HTTP status code was not 200 and 201";
							_apiResponse = new AppAuthenResponseV2(_bodyResponse);
							_authenCallBack(_apiResponse);
						}else{
							_bodyResponse = new ServerAuthenErrorMessage(90005, '(' + _validationParam + ') Missing and HTTP status code was not 200 and 201');
							_errResponse = new CommonResponse(_bodyResponse);
							_authenCallBack(_errResponse);
						}
					}
				}else{
					
					if(apiBackendResponse.hummusError.resultCode=='90011'){
						apiBackendResponse.hummusError.developerMessage = "Response Unknown Format";
					}
					_bodyResponse = ServerAuthenUtility.backendResponseParse(apiBackendResponse.hummusError,fieldlistCommon);
					_errResponse = new CommonResponse(_bodyResponse);
					_authenCallBack(_errResponse);
				}
			});
	}
}

module.exports = clientAuthenAPIManager;
