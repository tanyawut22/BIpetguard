var crypto = require("crypto");
var ursa = require('ursa-purejs');
var ServerAuthenErrorMessage = require('../exceptions/serverAuthenException');
var fs = require("fs");
var ConfigParameter = require('../models/common/commonConfigParameter');
var ClientConfigParameter = require('../models/common/commonClientConfigParameter');
var ServerAuthenValidation = require('../validation/serverAuthenValidation');
var ClientAuthenValidation = require('../validation/clientAuthenValidation');

var serverAuthenSecurity = {
	isJsonString : function isJsonString(str) {
	    try {
	        JSON.parse(str);
	    } catch (e) {
	        return false;
	    }
	    return true;
	},
	isDecodeBase64 : function isDecodeBase64(_str) {
	    try {
	    	var _base64 = new Buffer(_str,'base64').toString('utf8');
	    } catch (e) {
	        return false;
	    }
	    return true;
	},
	
	genSignatureSha256 :  (_pem,_txtSignature) => {
		try{
			var publicKey = _pem; 					
			var sha256Hash = crypto.createHash('sha256').update(_txtSignature).digest();
			var crt = ursa.createPublicKey(publicKey);
			var encrypted = crt.encrypt(sha256Hash, 'utf8', 'base64',ursa.RSA_PKCS1_PADDING).toString("base64");
			return encrypted;
		}catch (err){
			throw new ServerAuthenErrorMessage(90002,'[Hummus] Secret path file not found');
		}
	},
	genLiveKeyHash256 : (_clientId,_email) => {
		var _emailArr = _email.split("@");
		var _diff = Math.floor(_clientId.length / 2);
		var _clientPath1 = _clientId.substring(0,_diff);
		var _clientPath2 = _clientId.substring(_diff);
		var _concat = _emailArr[0]+"@"+_clientPath1+_emailArr[1]+_clientPath2;
		var base64 = crypto.createHash('sha256').update(_concat).digest('base64');
		return base64;
	},
	readServerAuthenticationFile : (_path) => {
		var data = fs.readFileSync(_path, 'utf8');
		var _configParameters = JSON.parse(data);
		var fieldlist = ["clientId","secretKeyPath","liveKey","email","urlLoginB2B","apiHost"];
		ServerAuthenValidation.validationConfigParameter(_configParameters,fieldlist);
		global.configParameter = new ConfigParameter(_configParameters);
	},
	readClientAuthenticationFile : (_path) => {
		var data = fs.readFileSync(_path, 'utf8');
		var _clientConfigParameters = JSON.parse(data);
		var fieldlistParent = ['partnerIdentities','urlObtain'];
		var fieldlist = ['secretPath','liveKey','email'];
		ClientAuthenValidation.validationClientConfigParameter(_clientConfigParameters,fieldlistParent,fieldlist);
		global.clientConfigParameter = new ClientConfigParameter(_clientConfigParameters);
	}
}

module.exports = serverAuthenSecurity;
