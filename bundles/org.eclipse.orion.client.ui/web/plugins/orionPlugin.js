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
	"plugins/helpPlugin"
], function(PluginProvider, common) {
	var plugins = Array.prototype.slice.call(arguments);
	plugins.shift(); // skip plugin
	plugins.shift(); // skip common

	function connect(pluginProvider) {
		common.getLoginHref(1).then(function(login) {
			var headers = {
				name: "Orion Core Support",
				version: "1.0",
				description: "This plug-in provides the core Orion support.",
				login: login
			};
			pluginProvider = pluginProvider || new PluginProvider();
			pluginProvider.updateHeaders(headers);
			registerServiceProviders(pluginProvider);
			pluginProvider.connect();
		});
	}

	function registerServiceProviders(provider) {
		plugins.forEach(function(plugin) {
			plugin.registerServiceProviders(provider);
		});
	}

	return {
		connect: connect,
		registerServiceProviders: registerServiceProviders
	};
});