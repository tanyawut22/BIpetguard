var ServerAuthenSecurity = require('../security/serverAuthenSecurity');
var ServerAuthenErrorMessage = require('../exceptions/serverAuthenException');
var ClientAuthenManager = require('../service/clientAuthenManager');

var fs = require("fs");

var _clientAuthenManager = {};

var SingletonConfig = (function () {
	function createInstance(_pathConfig) {
		ServerAuthenSecurity.readClientAuthenticationFile(_pathConfig);
	}
	 
	return {
		getServerAuthenAPIInstance: function (_pathConfig) {
			if (!global.clientConfigParameter) {
				createInstance(_pathConfig);
			}
		}
	};
})();

class clientAuthenBuilder{
	buildAuthen(_clientConfigPath){
		try{
			SingletonConfig.getServerAuthenAPIInstance(_clientConfigPath);
			if(global.clientConfigParameter){
				_clientAuthenManager = new ClientAuthenManager();
			}else{
				throw new ServerAuthenErrorMessage(80000,'[Hummus] Missing Configuration File');
			}
		}catch (err){
			if(err.name=="Error"){
				throw new ServerAuthenErrorMessage(80000,'[Hummus] Missing Configuration File');
			}else if(err.name=="SyntaxError"){
				throw new ServerAuthenErrorMessage(80000,'[Hummus] Incorrect Configuration File');
			}
			global.clientConfigParameter = null;
			throw err;
		}
	}

	getResult(){ return _clientAuthenManager; }
}

module.exports = clientAuthenBuilder;
