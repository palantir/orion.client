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
	"orion/widgets/input/SettingsSelect",
	"orion/widgets/input/SettingsTextfield",
	"orion/widgets/settings/Subsection",
	"orion/xhr",
], function(
	commands,
	Deferred,
	objects,
	mSection,
	lib,
	SettingsSelect,
	SettingsTextfield,
	Subsection,
	xhr
) {
	function DryRun(options, node) {
		objects.mixin(this, options);
		this.node = node;
		this.subsections = {
			datasetName: {
				create: this.createTextfield.bind(this),
				fieldlabel: "The dataset name",
				sectionName: "Dataset Name"
			},
			userCodeDir: {
				create: this.createOptions.bind(this),
				fieldlabel: "Absolute path to directory containing user code",
				options: this.getUserCodeDirs(),
				sectionName: "Code Directory"
			},
			authorConfigPath: {
				create: this.createTextfield.bind(this),
				fieldlabel: "Relative path from user code directory containing configuration file",
				sectionName: "Config Path"
			},
			outputRootDir: {
				create: this.createTextfield.bind(this),
				fieldlabel: "Absolute path to directory where output and error logs will be written",
				sectionName: "Output Directory"
			}
		};
	}

	objects.mixin(DryRun.prototype, {
		templateString:	"<div class='sections sectionTable'></div>",

		createOptions: function(subsectionKey, parent) {
			var subsectionJson = this.subsections[subsectionKey];
			subsectionJson.options.then(function(options) {
				this[subsectionKey] = [new SettingsSelect({
					options: Object.keys(options).map(function(option) {
						return {
							label: option,
							value: options[option]
						};
					}),
					fieldlabel: subsectionJson.fieldlabel
				})];

				var subsection = new Subsection({
					children: this[subsectionKey],
					parentNode: parent.getContentElement(),
					sectionName: subsectionJson.sectionName
				});
	
				subsection.show();
			}.bind(this));
		},

		createTextfield: function(subsectionKey, parent) {
			var subsectionJson = this.subsections[subsectionKey];
			this[subsectionKey] = [new SettingsTextfield({ fieldlabel: subsectionJson.fieldlabel })];
			var subsection = new Subsection({
				children: this[subsectionKey],
				parentNode: parent.getContentElement(),
				sectionName: subsectionJson.sectionName
			});

			subsection.show();
		},

		createSections: function() {
			sectionWidget = new mSection.Section(this.sections, {
				id: "dryRun",
				slideout: true,
				title: "Dry Run"
			});

			Object.keys(this.subsections).forEach(function(subsectionKey) {
				this.subsections[subsectionKey].create(subsectionKey, sectionWidget);
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

		destroy: function() {
			if (this.node) {
				lib.empty(this.node);
				this.node = this.sections = null;
			}
		},

		dryRun: function() {
			return this.serviceRegistry.getService("orion.snake.host").getHost().then(function(host) {
				var userCodeDir = this.userCodeDir[0].select.value;
				// TODO: wait for options to initialize, assume they are initialized for now
				return xhr("POST", host + "/dryRun/" + this.datasetName[0].getValue(), {
					headers: { 
						"Content-Type" : "application/json; charset=UTF-8"
					},
					handleAs: "json",
					data: {
						userCodeDir: userCodeDir,
						authorConfigPath: userCodeDir + "/" + this.authorConfigPath[0].getValue(),
						outputRootDir: this.outputRootDir[0].getValue()
					}
				})
			}.bind(this));
		},

		getUserCodeDirs: function() {
			var codeDirs = [];
			return xhr("GET", "../snakeapi/projects", {
				headers: { 
					"Orion-Version" : "1",
					"Content-Type" : "application/json; charset=UTF-8"
				},
				handleAs: "json"
			}).then(function(restResponse) {
				return JSON.parse(restResponse.response);
			});
		},

		show: function() {
			this.node.innerHTML = this.templateString;
			
			this.sections = lib.$('.sections', this.node);
			this.createSections();
			this.createToolbar();
		}
	});

	return DryRun;
});
