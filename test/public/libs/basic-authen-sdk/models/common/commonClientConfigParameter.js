class commonClientConfigParameter{
	constructor(clientConfig){
		return {
			partnerIdentities : clientConfig.partnerIdentities,
			urlObtain : clientConfig.urlObtain
		}
	}
}

module.exports = commonClientConfigParameter;