const commonResponse = require('./common/commonResponse');

class loginResponse extends commonResponse {
	constructor(param){
		super(param)
		this.headers = param.headers;
		this.expireIn = param.expireIn;
	}
}
module.exports = loginResponse;