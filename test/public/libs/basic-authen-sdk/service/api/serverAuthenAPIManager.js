var ServerAuthenUtility = require('../../utility/serverAuthenUtility');
var HttpClientConnection = require('../../connection/httpClientConnection');
var ServerAuthenValidation = require('../../validation/serverAuthenValidation');
var ServerAuthenErrorMessage = require('../../exceptions/serverAuthenException');
var httpClientConn = new HttpClientConnection();

const x_sdk_name = "B2B Basic Authen|3.0.0|nodejs";
const fieldlist = ["expireIn","headers","userMessage","moreInfo"];

class serverAuthenAPIManager {
	loginB2B(apiParameter, _serviceMgrCallback){
		var urlParams = ServerAuthenUtility.splitUrl(global.configParameter.urlLoginB2B);
		var _requestParameter = {
			url : urlParams.host,
			path : urlParams.uri,
			headers : { "x-sdk-name": x_sdk_name, "x-orderRef" : ServerAuthenUtility.autoGenerate()},
			timeout : 30000,
			method : 'POST',
			body : {
				clientId : global.configParameter.clientId,
				timeStamp : apiParameter.timeStamp,
				serverId : apiParameter.servierId,
				signature : apiParameter.signature
			}
		};
		httpClientConn.sendRequest(_requestParameter, function(apiBackendResponse)
			{
				// check hummus error
				if(!apiBackendResponse.hummusError){
					var _errorResponse = {};
					// check response backend
					var _fieldlistHeader = ["set-cookie","x-session-id","x-user-id","x-access-token"];
					var _fieldlistBody = ["resultCode","developerMessage"];
					var _validationParam = ServerAuthenValidation.validationResponseApi(apiBackendResponse.headers,apiBackendResponse.body,_fieldlistHeader,_fieldlistBody);
					// check parameters 90005
					if(!_validationParam){
						apiBackendResponse.body.headers = ServerAuthenUtility.setHeaders(apiBackendResponse.rawHeaders);
						var _body = ServerAuthenUtility.backendResponseParse(apiBackendResponse.body,fieldlist);
						_serviceMgrCallback(_body);
					}else{
						_errorResponse = new ServerAuthenErrorMessage(90005, '(' + (apiBackendResponse.headers['x-orderref']?apiBackendResponse.headers['x-orderref']:"") + ') (' + _validationParam + ') Missing');
						_errorResponse = ServerAuthenUtility.backendResponseParse(_errorResponse,fieldlist);
						_serviceMgrCallback(_errorResponse);
					}
				}else{
					var _body = ServerAuthenUtility.backendResponseParse(apiBackendResponse.hummusError,fieldlist);
					_serviceMgrCallback(_body);
				}
			});
	}
}

module.exports = serverAuthenAPIManager;
