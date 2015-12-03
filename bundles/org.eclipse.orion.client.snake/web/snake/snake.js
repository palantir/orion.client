/******************************************************************************* 
 * @license
 * Copyright (c) 2015 Palantir Technlogies.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 ******************************************************************************/
/*eslint-env browser, amd*/

define([
	'orion/bootstrap',
	'orion/commandRegistry',
	'orion/console/console',
	'orion/fileClient',
	'orion/globalCommands',
	'orion/operationsClient',
	'orion/searchClient',
	'orion/webui/littlelib',
	'snake/snakeContainer'
], function(
	mBootstrap,
	mCommandRegistry,
	mConsole,
	mFileClient,
	mGlobalCommands,
	mOperationsClient,
	mSearchClient,
	lib,
	SnakeContainer
) {
	mBootstrap.startup().then(function(core) {
		var serviceRegistry = core.serviceRegistry;
		var preferences = core.preferences;
		var pluginRegistry = core.pluginRegistry;

		// Register services
		var commandRegistry = new mCommandRegistry.CommandRegistry({ });

		var fileClient = new mFileClient.FileClient(serviceRegistry);
		var searcher = new mSearchClient.Searcher({
			serviceRegistry: serviceRegistry,
			commandService: commandRegistry,
			fileService: fileClient
		});

		mGlobalCommands.generateBanner("orion-snake", serviceRegistry, commandRegistry, preferences, searcher);

		lib.node("snakeCommandsTitle").innerHTML = "Snake Commands";
		var snakeContainer = new SnakeContainer({
			commandService: commandRegistry,
			preferences: preferences,
			serviceRegistry: serviceRegistry
		}, lib.node("snakeCommandsContainer"), lib.node("snakeCommands"));
		snakeContainer.show();

		new mConsole.Console({
			serviceRegistry: serviceRegistry
		}).hide();
	});
});
