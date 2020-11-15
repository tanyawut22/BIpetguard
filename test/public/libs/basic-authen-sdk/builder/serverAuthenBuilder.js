var ServerAuthenSecurity = require('../security/serverAuthenSecurity');
var ServerAuthenMockupManager = require('../service/mockup/serverAuthenMockupManager');
var ServerAuthenManager = require('../service/serverAuthenManager');
var ServerAuthenErrorMessage = require('../exceptions/serverAuthenException');
var fs = require("fs");

var _serverAuthenManager = {};

var SingletonConfig = (function () {
	function createInstance(_pathConfig) {
		ServerAuthenSecurity.readServerAuthenticationFile(_pathConfig);
	}
	 
	return {
		getServerAuthenAPIInstance: function (_pathConfig) {
			if (!global.configParameter) {
				createInstance(_pathConfig);
			}
		}
	};
})();

class serverAuthenBuilder {
	buildAuthen(_serverConfigPath) {
		try{
			SingletonConfig.getServerAuthenAPIInstance(_serverConfigPath);
			if(global.configParameter){
				if(!fs.existsSync(global.configParameter.secretKeyPath)){
					throw new ServerAuthenErrorMessage(80000,'[Hummus] Secret path file not found');
				}
				if(global.configParameter.liveKey.trim() == ''){
					_serverAuthenManager = new ServerAuthenMockupManager();
				}else{
					_serverAuthenManager = new ServerAuthenManager();
				}
			}else{
				throw new ServerAuthenErrorMessage(80000,'[Hummus] Missing Configuration File');
			}
		}catch (err){
			if(err.name=="Error"){
				throw new ServerAuthenErrorMessage(80000,'[Hummus] Missing Configuration File');
			}else if(err.name=="SyntaxError"){
				throw new ServerAuthenErrorMessage(80000,'[Hummus] Incorrect Configuration File');
			}
			global.configParameter = null;
			throw err;
		}
	}

	getResult(){ return _serverAuthenManager; }
}

module.exports = serverAuthenBuilder;
