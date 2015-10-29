/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define([
	"orion/Deferred",
	"orion/plugin",
	"../mixloginstatic/javascript/common",
	"plugins/authenticationPlugin",
	"plugins/fileClientPlugin",
	"plugins/jslintPlugin",
	"plugins/googleAnalyticsPlugin",
	"plugins/languageToolsPlugin",
	"plugins/preferencesPlugin",
	"plugins/pageLinksPlugin",
	"plugins/taskPlugin",
	"plugins/webEditingPlugin",
	"profile/userservicePlugin",
	"plugins/helpPlugin",
	"shell/plugins/shellPagePlugin"
], function(Deferred, PluginProvider, common) {
	var plugins = Array.prototype.slice.call(arguments);
	plugins.shift(); // skip Deferred
	plugins.shift(); // skip plugin
	plugins.shift(); // skip common

	function connect(pluginProvider) {
		common.getAuthProvider().then(function(provider) {
			if (provider) {
				var login = new URL("../login/oauth?oauth=" + provider, self.location.href).href;
			} else {
				var login = new URL("../mixloginstatic/LoginWindow.html", self.location.href).href;
			}

			var headers = {
				name: "Orion Core Support",
				version: "1.0",
				description: "This plug-in provides the core Orion support.",
				login: login
			};
			pluginProvider = pluginProvider || new PluginProvider();
			pluginProvider.updateHeaders(headers);
			var registerPromise = registerServiceProviders(pluginProvider);
			registerPromise.then(function() {
				pluginProvider.connect();
			});
		});
	}

	function registerServiceProviders(provider) {
		var promises = [];
		plugins.forEach(function(plugin) {
			var promise = plugin.registerServiceProviders(provider);
			if (promise) {
				promises.push(promise);
			}
		});
		// lazy evaluation of promises, i.e. do not short circuit to 
		// a failure if any one of the promise fails. We still want
		// to connect to the other providers
		return Deferred.all(promises, function(e) { console.log(e); });
	}

	return {
		connect: connect,
		registerServiceProviders: registerServiceProviders
	};
});