const commonAppAuthenResponse = require('./common/commonAppAuthenResponse');

class appAuthenResponseV1 extends commonAppAuthenResponse{
	constructor(param){
		super(param)
		this.gupAuthenLevel = param.gupAuthenLevel;
		this.gupRegistrationLevel = param.gupRegistrationLevel;
		this.openIdFlag = param.openIdFlag;
		this.ptsAppId = param.ptsAppId;
		this.ptsAppEnvironmentType = param.ptsAppEnvironmentType;
	}
}

module.exports = appAuthenResponseV1;