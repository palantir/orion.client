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
			}).then(function(result) {
				return result.response;
			}, function(error) {
				return error.response;
			});
		}

		var serviceImpl = {
				getExeResult: function(command, fileLocation) {
					var uri = ".." + fileLocation.replace("/file/", "/exe/").replace("/workspace/", "/exe/") + "?command=" + command; //$NON-NLS-0$
					return getResponse(uri);
				}
		};
		var serviceProperties = {
				name: "Exe", //$NON-NLS-0$
		};

		var doctestImpl = {
				callback: function(args, context) {
					var fileLocation = (args.file.path.indexOf("/file") == 0) ? args.file.path : context.cwd + args.file.path; //$NON-NLS-0$
					return serviceImpl.getExeResult("doctest", fileLocation); //$NON-NLS-0$
				}
		};
		var doctestProperties = {
				name: "doctest", //$NON-NLS-0$
				description: "Run python doctest",
				parameters: [{
					name: "file", //$NON-NLS-0$
					type: {name: "file", file: true, exist: true}, //$NON-NLS-0$
					description: "File name"
				}],
				returnType: "string" //$NON-NLS-0$
		};

		var cancelImpl = {
				callback: function(args, context) {
					return serviceImpl.getExeResult("cancel", context.cwd); //$NON-NLS-0$
				}
		};
		var cancelProperties = {
				name: "cancel", //$NON-NLS-0$
				description: "Cancel running task",
				returnType: "string" //$NON-NLS-0$
		};

		provider.registerService("orion.exe", serviceImpl, serviceProperties);
		provider.registerServiceProvider("orion.shell.command", doctestImpl, doctestProperties);
		provider.registerServiceProvider("orion.shell.command", cancelImpl, cancelProperties);
	}

	return {
		connect: connect,
		registerServiceProviders: registerServiceProviders
	};
});
