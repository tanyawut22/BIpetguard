class commonConfigParameter{
	constructor(serverConfig){
		return {
			clientId : serverConfig.clientId,
			secretKeyPath : serverConfig.secretKeyPath,
			liveKey : serverConfig.liveKey,
			email : serverConfig.email,
			urlLoginB2B : serverConfig.urlLoginB2B,
			apiHost : serverConfig.apiHost
		}
	}
}

module.exports = commonConfigParameter;