const commonAppAuthenResponse = require('./common/commonAppAuthenResponse');

class appAuthenResponseV2 extends commonAppAuthenResponse{
	constructor(param){
		super(param)
		this.privateId = param.privateId;
		this.pwrtcAddress = param.pwrtcAddress;
		this.stunServer = param.stunServer;
		this.turnServer = param.turnServer;
		this.partnerSession = param.partnerSession;
		this.ptsWindowTime = param.ptsWindowTime;
		this.ol4 = param.ol4;
		this.operatorId = param.operatorId;
	}
}

module.exports = appAuthenResponseV2;