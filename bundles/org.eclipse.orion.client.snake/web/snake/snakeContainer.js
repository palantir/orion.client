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
	"orion/PageUtil",
	"orion/URITemplate",
	"orion/objects",
	"orion/webui/littlelib",
	"orion/widgets/settings/SplitSelectionLayout",
	"snake/dryRun/dryRun",
], function(
	PageUtil,
	URITemplate,
	objects,
	lib,
	SplitSelectionLayout,
	DryRun
) {
	var superPrototype = SplitSelectionLayout.prototype;
	/**
	 * @name snake.SnakeContainer
	 * @class A container that manages additions of snakeCommands and their corresponding actions.
	 * @description constructs a SnakeContainer. The container is responsible for initializing the snakeCommands that it
	 * knows of and their corresponding widgets. The container will add the command name (for example, "Dry Run") as
	 * a command under the snakeCommandParent. When a command is clicked, the corresponding widget is showed to the user.
	 *
	 * @param {Object} options the options object, containing the service registry.
	 * @param {Element} snakeCommandParent The node to add the command.
	 * @param {Element} snakeCommandActionsParent the node to add the actions of the command when the user clicks the command.
	 */
	function SnakeContainer(options, snakeCommandParent, snakeCommandActionsParent) {
		SplitSelectionLayout.apply(this, arguments);
		this.serviceRegistry = options.serviceRegistry;
		this.snakeCommandActionsParent = snakeCommandActionsParent;
		this.snakeCommandParent = snakeCommandParent;
		this.snakeCommands = [];
		this.itemToIndexMap = {};
		this._init();
	}

	SnakeContainer.prototype = Object.create(superPrototype);
	objects.mixin(SnakeContainer.prototype, {
		_init: function() {
			var self = this;
			this.snakeCommands.push({
				id: "dryRun",
				textContent: "Dry Run",
				show: self.showDryRun
			});

			this.snakeCommands.forEach(function(snakeCommand) {
				snakeCommand.show = snakeCommand.show.bind(self);
			}.bind(self))

			window.addEventListener("hashchange", self.processHash.bind(self));
		},

		addCommand: function(snakeCommand) {
			snakeCommand["class"] = (snakeCommand["class"] || "") + " navbar-item";
			snakeCommand.role = "tab";
			snakeCommand.tabindex = -1;
			snakeCommand["aria-selected"] = "false";
			snakeCommand.onclick = snakeCommand.show;
			superPrototype.addCategory.apply(this, arguments);
		},

		addCommands: function() {
			this.snakeCommands.forEach(function(snakeCommand) {
				this.addCommand(snakeCommand);
			}.bind(this));
		},

		drawUserInterface: function() {
			superPrototype.drawUserInterface.apply(this, arguments);
			this.addCommands();
			this.processHash();
		},

		processHash: function() {
			var pageParams = PageUtil.matchResourceParameters();

			this.preferences.getPreferences("/snakeContainer").then(function(prefs){
				var selection = prefs.get("selection");
				var snakeCommand = pageParams["snakeCommand"] || selection;

				if (this.selectedSnakeCommand){
					if (this.selectedSnakeCommand.id === snakeCommand){
						return;
					}
				}

				if (!snakeCommand) {
					// no selection exists, select the first one
					snakeCommand = this.snakeCommands[0].id;
				}

				this.showBySnakeCommand(snakeCommand);
			}.bind(this));

			window.setTimeout(function() {
				this.commandService.processURL(window.location.href);
			}.bind(this), 0);
		},

		selectSnakeCommand: function(id) {
			this.preferences.getPreferences("/snakeContainer").then(function(prefs){
				prefs.put("selection", id);
			});

			superPrototype.selectCategory.apply(this, arguments);

			var params = PageUtil.matchResourceParameters();
			if (params.category !== id) {
				params.category = id;
				delete params.resource;
				window.location = new URITemplate("#,{params*}").expand({
					params: params
				});
			}
		},

		showBySnakeCommand: function(id) {
			var isDefaultSnakeCommand = this.snakeCommands.some(function(snakeCommand) {
				if (snakeCommand.id === id) {
					snakeCommand.show();
					return true;
				}
			});

			if (!isDefaultSnakeCommand) {
				this.selectSnakeCommandk(id);
			}
		},

		showDryRun: function() {
			this.selectSnakeCommand("dryRun");

			lib.empty(this.snakeCommandActionsParent);

			if (this.dryRunWidget) {
				this.dryRunWidget.destroy();
			}

			var dryRunActionsNode = document.createElement("div");
			this.snakeCommandActionsParent.appendChild(dryRunActionsNode);

			this.dryRunWidget = new DryRun({
				commandService: this.commandService,
				serviceRegistry: this.serviceRegistry
			}, dryRunActionsNode);
			this.dryRunWidget.show();
		}
	});

	return SnakeContainer;
});
