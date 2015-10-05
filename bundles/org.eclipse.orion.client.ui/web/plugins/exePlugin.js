define(["orion/xhr", "orion/plugin", "domReady!"], function(xhr, PluginProvider) {
	function connect() {
		var headers = {
			name: "Orion Execution",
			version: "1.0",
			description: "Orion Execution description"
		};
		var pluginProvider = new PluginProvider(headers);
		registerServiceProviders(pluginProvider);
		pluginProvider.connect();
	}

	function registerServiceProviders(provider) {

		function getResponse(uri) {
			return xhr("GET", uri, { //$NON-NLS-0$
				headers: {
					"Orion-Version": "1" //$NON-NLS-0$
				},
				timeout: 15000
			}).then(function(result) {
				return result.response;
			}, function(error) {
				return error.response;
			});
		}

		var serviceImpl = {
				getExeResult: function(command, fileLocation) {
					var uri = ".." + fileLocation.replace("file", "exe") + "?command=" + command; //$NON-NLS-0$
					return getResponse(uri);
				}
		};
		var serviceProperties = {
				name: "Exe",
		};

		var runImpl = {
				callback: function(args, context) {
					var fileLocation = (args.file.path.indexOf("/file") == 0) ? args.file.path : context.cwd + args.file.path; //$NON-NLS-0$
					return serviceImpl.getExeResult(args.command, fileLocation);
				}
		};
		var runProperties = {
				name: "run", //$NON-NLS-0$
				description: "Run a command",
				parameters: [{
					name: "command", //$NON-NLS-0$
					type: {name: "string"}, //$NON-NLS-0$
					description: "Command"
						}, {
					name: "file", //$NON-NLS-0$
					type: {name: "file", file: true, exist: true}, //$NON-NLS-0$
					description: "File name"
				}],
				returnType: "string" //$NON-NLS-0$
		};

		provider.registerService("orion.exe", serviceImpl, serviceProperties);
		provider.registerServiceProvider("orion.shell.command", runImpl, runProperties);
	}

	return {
		connect: connect,
		registerServiceProviders: registerServiceProviders
	};
});
