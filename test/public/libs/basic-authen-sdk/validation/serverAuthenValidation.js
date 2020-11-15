var ServerAuthenErrorMessage = require('../exceptions/serverAuthenException');
var fs = require('fs');

var serverAuthenValidation = {
	validationConfigParameter : (_objJSON,_fieldlist) =>{
		var errorCount = 0;
		_fieldlist.forEach(function(element){
			if(!(element in _objJSON)){
				errorCount++;
			}else if(_objJSON[element]==null){
				errorCount++;
			}
		});
		if(errorCount!=0){
			throw new ServerAuthenErrorMessage(80000,'[Hummus] Missing Configuration File');	
		}
	},
	validationResponseApi : (_resHeader,_resBody,_fieldlistHeader,_fieldlistBody) =>{
		var errorList = [];
		var errorResponse;
		var errorBody = 0;
		// validation body
		_fieldlistBody.forEach(function(element){
			if(!(element in _resBody)){
				errorList.push(element);
			    errorBody++;
			}else if(_resBody[element]==null){
				errorList.push(element);
				errorBody++;
			}
		});
		// validation header resultCode = 20000
		if(errorBody==0){
			if(_resBody.resultCode=='20000'){
				_fieldlistHeader.forEach(function(element){
					if(!(element in _resHeader)){
						errorList.push(element);
					}else if(_resHeader[element]==null){
						errorList.push(element);
					}
				});
			}
		}

		if(errorList.length > 0){
			errorResponse = errorList.join(', ');
		}
		return errorResponse;
	}
}

module.exports = serverAuthenValidation;
