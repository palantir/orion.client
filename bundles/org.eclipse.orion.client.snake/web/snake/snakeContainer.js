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
    'orion/objects',
    'orion/webui/littlelib',
	'orion/widgets/settings/SplitSelectionLayout',
    'snake/dryRun/dryRun'
], function(
	objects,
	lib,
	SplitSelectionLayout,
	DryRun
) {
	var superPrototype = SplitSelectionLayout.prototype;
	/**
	 * @name snake.SnakeContainer
	 * @class A container that manages additions of commands and their corresponding actions.
	 * @description constructs a SnakeContainer. The container is responsible for initializing the commands that it
	 * knows of and their corresponding widgets. The container will add the command name (for example, "Dry Run") as
	 * a command under the commandParent. When a command is clicked, the corresponding widget is showed to the user.
	 *
	 * @param {Object} options the options object, containing the service registry.
	 * @param {Element} commandParent The node to add the command.
	 * @param {Element} commandActionsParent the node to add the actions of the command when the user clicks the command.
	 */
	function SnakeContainer(options, commandParent, commandActionsParent) {
		debugger;
		SplitSelectionLayout.apply(this, arguments);
		this.commandActionsParent = commandActionsParent;
		this.commandParent = commandParent;
		this.serviceRegistry = options.serviceRegistry;
		this.commands = [];
		this.itemToIndexMap = {};
		this._init();
	}

	SnakeContainer.prototype = Object.create(superPrototype);
	objects.mixin(SnakeContainer.prototype, {
		_init: function() {
			var self = this;
			this.commands.push({
				id: "dryRun", //$NON-NLS-0$
				textContent: "Dry Run",
				show: self.showDryRun
			});
			this.commands.forEach(function(command) {
				command.show = command.show.bind(self);
			}.bind(self))
		},

		addCommand: function(command) {
			command['class'] = (command['class'] || '') + ' navbar-item'; //$NON-NLS-1$ //$NON-NLS-0$
			command.role = "tab";
			command.tabindex = -1;
			command["aria-selected"] = "false"; //$NON-NLS-1$ //$NON-NLS-0$
			command.onclick = command.show;
			superPrototype.addCategory.apply(this, arguments);
		},

		addCommands: function() {
			this.commands.forEach(function(command) {
				this.addCommand(command);
			}.bind(this));
		},

		drawUserInterface: function() {
			superPrototype.drawUserInterface.apply(this, arguments);
			this.addCommands();
		},

		showDryRun: function() {
			lib.empty(this.commandActionsParent);
		
			if (this.dryRunWidget) {
				this.dryRunWidget.destroy();
			}

			// TODO: support encoding clicked command in the URL
			var dryRunActionsNode = document.createElement('div'); //$NON-NLS-0$
			this.commandActionsParent.appendChild(dryRunActionsNode);

			this.dryRunWidget = new DryRun({}, dryRunActionsNode);
			this.dryRunWidget.show();
		}
	});

	return SnakeContainer;
});
