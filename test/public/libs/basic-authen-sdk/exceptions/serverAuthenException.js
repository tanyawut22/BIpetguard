class serverAuthenException extends Error{
	constructor(errorCode,errorMessage){
		super(errorMessage);
		Error.captureStackTrace(this, serverAuthenException);
		this.resultCode = errorCode.toString();
		this.userMessage = null;
		this.moreInfo = null;
		switch(errorCode){
			case 90001: this.developerMessage = errorMessage || "Missing Key Identify";
				this.name = "MissingKeyIdentify";
				break;
			case 90002: this.developerMessage = errorMessage || "Incorrect Key Identify";
				this.name = "IncorrectKeyIdentify";
				break;
			case 90003: this.developerMessage = errorMessage || "Missing Parameter";
				this.name = "MissingParameter";
				break;
			case 90004: this.developerMessage = errorMessage || "Incorrect Parameter";
				this.name = "IncorrectParameter";
				break;
			case 90005: this.developerMessage = errorMessage || "System Error";
				this.name = "SystemError";
				break;
			case 90006: this.developerMessage = errorMessage || "Permission Deny";
				this.name = "PermissionDeny";
				break;
			case 90007: this.developerMessage = errorMessage || "Connection Error";
				this.name = "ConnectionError";
				break;
			case 90008: this.developerMessage = errorMessage || "Connection Timeout";
				this.name = "ConnectionTimeout";
				break;
			case 90009: this.developerMessage = errorMessage || "Unknown Encoding";
				this.name = "UnknownEncoding";
				break;
			case 90010: this.developerMessage = errorMessage || "Decryption Error";
				this.name = "DecryptionError";
				break;
			case 90011: this.developerMessage = errorMessage || "Unknown Format";
				this.name = "UnknownFormat";
				break;
			case 90099: this.developerMessage = errorMessage || "Unknown Error";
				this.name = "UnknownError";
				break;
			case 91001: this.developerMessage = errorMessage || "Obtain Version Invalid";
				this.name = "ObtainVersionInvalid";
				break;
			case 80000: this.developerMessage = errorMessage || "Configuration File Error";
				this.name = "ConfigurationFileError";
		}
		return this;
	}
}

module.exports = serverAuthenException