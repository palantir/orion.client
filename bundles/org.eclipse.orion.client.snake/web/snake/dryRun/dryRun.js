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
	"orion/commands",
	"orion/Deferred",
	"orion/objects",
	"orion/section",
	"orion/webui/littlelib",
	"orion/widgets/input/SettingsTextfield",
	"orion/widgets/settings/Subsection",
	"orion/xhr",
], function(
	commands,
	Deferred,
	objects,
	mSection,
	lib,
	SettingsTextfield,
	Subsection,
	xhr
) {
	function DryRun(options, node) {
		objects.mixin(this, options);
		this.node = node;
		this.subsections = {
			datasetName: {
				fieldlabel: "The dataset name",
				sectionName: "Dataset Name"
			},
			userCodeDir: {
				fieldlabel: "Absolute path to directory containing user code",
				sectionName: "Code Directory"
			},
			authorConfigPath: {
				fieldlabel: "Relative path from user code directory containing configuration file",
				sectionName: "Config Path"
			},
			outputRootDir: {
				fieldlabel: "Absolute path to directory where output and error logs will be written",
				sectionName: "Output Directory"
			}
		};
	}

	objects.mixin(DryRun.prototype, {
		templateString:	"<div class='sections sectionTable'></div>",

		createSections: function() {
			sectionWidget = new mSection.Section(this.sections, {
				id: "dryRun",
				slideout: true,
				title: "Dry Run"
			});

			Object.keys(this.subsections).forEach(function(subsectionKey) {
				this["subsectionKey"] = [
					new SettingsTextfield({
						fieldlabel: this.subsections[subsectionKey].fieldlabel
					})
				];

				var subsection = new Subsection({
					children: this["subsectionKey"],
					parentNode: sectionWidget.getContentElement(),
					sectionName: this.subsections[subsectionKey].sectionName
				});

				subsection.show();
			}.bind(this));
		},

		createToolbar: function() {
			var toolbar = lib.node("dryRunToolActionsArea");
			var dryRunCommand = new commands.Command({
				callback: function(data) {
					this.dryRun().then(function() {
						lib.$(".commandButton", toolbar).blur();
					});
				}.bind(this),
				id: "orion.snake.dryRun",
				name: "Run",
				tooltip: "Performs a dry run for the dataset"
			});
			this.commandService.addCommand(dryRunCommand);
			this.commandService.registerCommandContribution("runDryRunCommand", "orion.snake.dryRun", 2);
			this.commandService.renderCommands("runDryRunCommand", toolbar, this, this, "button");
		},

		dryRun: function() {
			// TODO: implement this when Snake's dry-run code goes in
			// xhr(...);
			var mock = new Deferred();
			return mock.resolve("Fake response string").then(function(message) {
				return this.serviceRegistry.getService("orion.console").createContent(message);
			}.bind(this));
		},

		show: function() {
			this.node.innerHTML = this.templateString;
			
			this.sections = lib.$('.sections', this.node);
			this.createSections();
			this.createToolbar();
		},

		destroy: function() {
			if (this.node) {
				lib.empty(this.node);
				this.node = this.sections = null;
			}
		}
	});

	return DryRun;
});
