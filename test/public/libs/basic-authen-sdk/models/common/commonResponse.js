class commonResponse{
	constructor(param){
		return {
			resultCode : param.resultCode,
			developerMessage : param.developerMessage,
			userMessage : param.userMessage,
			moreInfo : param.moreInfo			
		}
	}
}

module.exports = commonResponse