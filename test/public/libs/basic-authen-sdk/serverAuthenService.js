var ServerAuthenBuilder = require('./builder/serverAuthenBuilder');
var ClientAuthenBuilder = require('./builder/clientAuthenBuilder');

class ServerAuthenService {
	buildServerAuthen(configPath){
		var serverAuthenBuilder = new ServerAuthenBuilder();
		serverAuthenBuilder.buildAuthen(configPath);
		return serverAuthenBuilder.getResult();
	}
	buildClientAuthen(configPath){
		var clientAuthenBuilder = new ClientAuthenBuilder();
		clientAuthenBuilder.buildAuthen(configPath);
		return clientAuthenBuilder.getResult();
	}
}

module.exports = ServerAuthenService;