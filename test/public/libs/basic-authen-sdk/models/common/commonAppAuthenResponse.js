const commonResponse = require('./commonResponse');

class commonAppAuthenResponse extends commonResponse{
	constructor(param){
		super(param)
		this.accessToken = param.accessToken;
		this.expireIn = param.expireIn;
		this.idType = param.idType;
		this.idValue = param.idValue;
		this.ptsListOfAPI = param.ptsListOfAPI;
	}
}

module.exports = commonAppAuthenResponse;