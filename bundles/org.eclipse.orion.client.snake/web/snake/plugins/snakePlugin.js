/******************************************************************************* 
 * @license
 * Copyright (c) 2015 Palantir Technologies.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 ******************************************************************************/
/*eslint-env amd, browser*/
/*global URL confirm*/
define([
	"orion/xhr",
	"orion/plugin",
	"../../mixloginstatic/javascript/common",
	"orion/URL-shim"
], function(xhr, PluginProvider, common) {
	var SNAKE_HOST_KEY = "plugin.snake.host";
	var SNAKE_KEY = "plugin.snake.enabled";

	function connect() {
		// use common as it is guaranteed to have been loaded
		common.getLoginHref(2).then(function(login) {
			var headers = {
				name: "Orion Snake Support",
				version: "1.0",
				description: "This plug-in provides Snake Support.",
				login: login
			};
			var provider = new PluginProvider(headers);
			registerServiceProviders(provider);
			provider.connect();
		});
	}

	function getEnableSnake() {
		return xhr("POST", "../config", {
			data: JSON.stringify({
				"configKeys": [SNAKE_HOST_KEY, SNAKE_KEY]
			}),
			headers: {
				"Orion-Version": "1"
			},
			log: false,
			timeout: 15000
		}).then(function(result) {
			return JSON.parse(result.response);
		});
	}

	function registerServiceProviders(provider) {
		return getEnableSnake().then(function(configResult) {
			if (configResult[SNAKE_KEY] === "true" && configResult[SNAKE_HOST_KEY]) {
				provider.registerService("orion.snake.host", {
					getHost: function() { return configResult[SNAKE_HOST_KEY]; }
				});

				provider.registerService("orion.page.link.category", null, {
					id: "snake",
					name: "Snake",
					imageClass: "core-sprite-outline",
					order: 20
				});

				provider.registerService("orion.page.link", {}, {
					name: "Snake",
					id: "orion.snake",
					category: "snake",
					order: 100, // low priority
					uriTemplate: "{+OrionHome}/snake/snake.html#"
				});
			}
		});
	}

	return {
		connect: connect,
		registerServiceProviders: registerServiceProviders
	};
});
