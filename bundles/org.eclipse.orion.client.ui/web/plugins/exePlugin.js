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
		console.log("Register Exe: start");

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
				var uri = ".." + fileLocation.replace("file", "exe") + "?command=" + command;
				console.log(uri);
				return getResponse(uri);
			}
		};
		var serviceProperties = {
	              name: "Exe",
		};

		var runImpl = {
				callback: function(args, context) {
					console.log("New doctest impl, args:" + JSON.stringify(args) + ", context: " + JSON.stringify(context));
					return serviceImpl.getExeResult(args.command, context.cwd + args.file.path);
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
		console.log("Register Exe: done");
	}

	return {
		connect: connect,
		registerServiceProviders: registerServiceProviders
	};
});