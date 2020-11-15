var ServerAuthenErrorMessage = require('../exceptions/serverAuthenException');
var fs = require('fs');

var clientAuthenValidation = {
	validationClientConfigParameter : (_objJSON,_fieldlistParent,_fieldlist) =>{
		var errorParentCount = 0;
		var keyClientId;
		var errorCount = 0;
		_fieldlistParent.forEach(function(element){
			if(!(element in _objJSON)){
				errorParentCount++;
			}else if(_objJSON[element]==null){
				errorParentCount++;
			}
		});
		if(errorParentCount==0){
			// check keys clientId
			keyClientId = Object.keys(_objJSON.partnerIdentities);
			var max = keyClientId.length;
			var idx;
			// check keys and value clientId 
			if(max>0){
				for(idx=0;idx<max;idx++){
					_fieldlist.forEach(function(element){
						if(!(element in _objJSON.partnerIdentities[keyClientId[idx]])){
							errorCount++;
						}else if(_objJSON.partnerIdentities[keyClientId[idx]][element]==null){
							errorCount++;
						}
					});
				}
				if(errorCount!=0){
					throw new ServerAuthenErrorMessage(80000,'[Hummus] Missing Configuration File');
				}
			}else{
				throw new ServerAuthenErrorMessage(80000,'[Hummus] Missing Configuration File');	
			}
		}else{
			throw new ServerAuthenErrorMessage(80000,'[Hummus] Missing Configuration File');	
		}
	},
	validationRequestParameters : (_paramRequest,_fieldlist) => {
		var errorList = []; 
		var errorParam;
		// validation parameters
		_fieldlist.forEach(function(element){
			if(!(element in _paramRequest)){
				errorList.push(element);
				errorParam++;
			}else if(_paramRequest[element]==null){
				errorList.push(element);
				errorParam++;
			}
		});
		if(errorList.length > 0){
			errorResponse = errorList.join(', ');
			throw new ServerAuthenErrorMessage(90003,'[Hummus] ('+errorResponse+') Missing');
		}
	},
	validationClientResponseApi : (_resHeader,_resBody,_fieldlistHeader,_fieldlistBody,_version) =>{
		var errorList = [];
		var errorResponse;
		var errorBody = 0;
		const fieldcheck = ['resultCode','developerMessage'];
		// validation resultCode,developerMessage
		fieldcheck.forEach(function(element){
			if(!(element in _resBody)){
				errorList.push(element);
			    errorBody++;
			}else if(_resBody[element]==null){
				errorList.push(element);
				errorBody++;
			}
		});

		// validation body header
		if(errorBody==0){
			if(_resBody.resultCode=='20000'){
				switch (_version){
					case "v1":
						_fieldlistBody.forEach(function(element){
							if(!(element in _resBody)){
								errorList.push(element);
							}else if(_resBody[element]==null){
								errorList.push(element);
							}
						});
						
						_fieldlistHeader.forEach(function(element){
							if(!(element.toLowerCase() in _resHeader)){
								errorList.push(element);
							}else if(_resHeader[element]==null){
								errorList.push(element);
							}
						});
						break;
					case "v2":
						_fieldlistBody.forEach(function(element){
							if(!(element in _resBody)){
								errorList.push(element);
							}else if(_resBody[element]==null){
								errorList.push(element);
							}
						});
						break;
				}
			}
		}

		if(errorList.length > 0){
			errorResponse = errorList.join(', ');
		}
		return errorResponse;
	},
	validationRequestParametersToJson : (_requestBody) =>{
		try{
			var _body = {};
			if(typeof(_requestBody)=="string"){
				_body = JSON.parse(_requestBody);
			}else{
				_body = _requestBody;
			}
			return _body;
		}catch (e){
			throw new ServerAuthenErrorMessage(90011, 'Request Unknown Format');
		}
	}
}

module.exports = clientAuthenValidation;
