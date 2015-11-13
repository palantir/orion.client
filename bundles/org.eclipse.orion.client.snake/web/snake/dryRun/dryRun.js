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
	"orion/objects",
	"orion/webui/littlelib",
	"orion/widgets/input/SettingsTextfield",
	"orion/widgets/settings/Subsection",
	"orion/xhr",
], function(
	objects,
	lib,
	SettingsTextfield,
	Subsection,
	xhr
) {
	function DryRun(options, node) {
		this.node = node;
	}

	objects.mixin(DryRun.prototype, {
		templateString:	"" +
					"<div class='sectionWrapper toolComposite'>" +
						"<div class='sectionAnchor sectionTitle layoutLeft'>Dry Run</div>" + 
						"<div id='userCommands' class='layoutRight sectionActions'></div>" +
					"</div>" +
					"<div class='sections sectionTable'>" +
					"</div>",

		createSections: function() {
			this.userCodeDir = [
				new SettingsTextfield({
					fieldlabel: "Absolute path to directory containing user code",
				})
			];
			var userCodeDirSection = new Subsection({
				children: this.userCodeDir,
				parentNode: this.sections,
				sectionName: "Code Directory"
			});

			this.authorConfigPath = [
				new SettingsTextfield({
			    	fieldlabel: "Relative path from user code directory containing configuration file"
			    })
			];
			var authorConfigPathSection = new Subsection({
				children: this.authorConfigPath,
				parentNode: this.sections,
				sectionName: "Config Path"
			});

			this.outputRootDir = [
				new SettingsTextfield({
			    	fieldlabel: "Absolute path to directory where output and error logs will be written"
			    })
			];
			var outputRootDirSection = new Subsection({
				children: this.outputRootDir,
				parentNode: this.sections,
				sectionName: "Output Directory"
			});
			userCodeDirSection.show();
			authorConfigPathSection.show();
			outputRootDirSection.show();
		},

		show: function() {
			this.node.innerHTML = this.templateString;
			
			this.sections = lib.$('.sections', this.node);
			this.createSections();
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
