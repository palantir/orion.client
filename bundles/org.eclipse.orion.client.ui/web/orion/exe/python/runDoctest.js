/**
 * This adds a "Run Tests" element to the editor and plugs into the console to output the tests' doctest output.
 */

/*eslint-env browser, amd*/
define(["orion/xhr", "orion/plugin", "orion/webui/littlelib", "domReady!"], function(xhr, PluginProvider, lib) {

	function RunDoctest(options) {
		this.running = false;
		this.inputManager = options.inputManager;
		this.console = options.serviceRegistry.getService("orion.console"); //$NON-NLS-0$
		this.exe = options.serviceRegistry.getService("orion.exe"); //$NON-NLS-0$

		var exeBar = lib.$(".editorViewerHeader"); //$NON-NLS-0$

		// cancel
		var cancelButton = this.cancelButton = document.createElement("button"); //$NON-NLS-0$
		cancelButton.classList.add("editorViewerHeaderAction"); //$NON-NLS-0$
		cancelButton.classList.add("dropdownTrigger"); //$NON-NLS-0$
		cancelButton.classList.add("commandImage"); //$NON-NLS-0$
		cancelButton.classList.add("orionButton"); //$NON-NLS-0$
		this.hideCancel();
		cancelButton.onclick = this.cancel.bind(this);
		cancelButton.appendChild(document.createTextNode("Cancel"));

		// run
		var runTestsButton = this.runTestsButton = document.createElement("button"); //$NON-NLS-0$
		runTestsButton.classList.add("editorViewerHeaderAction"); //$NON-NLS-0$
		runTestsButton.classList.add("dropdownTrigger"); //$NON-NLS-0$
		runTestsButton.classList.add("commandImage"); //$NON-NLS-0$
		runTestsButton.classList.add("orionButton"); //$NON-NLS-0$
		this.hideRunTests();
		runTestsButton.onclick = this.run.bind(this);
		runTestsButton.appendChild(document.createTextNode("Run Tests"));

		exeBar.appendChild(cancelButton);
		exeBar.appendChild(runTestsButton);

		options.sidebarNavInputManager.addEventListener("selectionChanged", function(event) { //$NON-NLS-0$
			if (this.running) {
				alert("Warning: You are navigating away from a test that has not yet completed which may cause problems. To cancel this test, simply start another test.");
				this.running = false;
			}
			if (event.selections.length === 1 && event.selection["Directory"] === false && //$NON-NLS-0$
				this.inputManager._input.match("\\.py$") != null) { //$NON-NLS-0$
				this.showRunTests();
			} else {
				this.console.hide();
				this.hideRunTests();
			}
			this.hideCancel();
		}.bind(this));
	};

	RunDoctest.prototype = {
		hideCancel: function() {
			this.cancelButton.style.display = "none"; //$NON-NLS-0$
		},
		showCancel: function() {
			this.cancelButton.style.display = "block"; //$NON-NLS-0$
		},
		hideRunTests: function() {
			this.runTestsButton.style.display = "none"; //$NON-NLS-0$
		},
		showRunTests: function() {
			this.runTestsButton.style.display = "block"; //$NON-NLS-0$
		},
		cancel: function() {
			this.exe.getExeResult("cancel", this.inputManager._input); //$NON-NLS-0$
			this.hideCancel();
			this.showRunTests();
		},
		run: function() {
			this.hideRunTests();
			this.showCancel();
			this.running = true;
			this.exe.getExeResult("doctest", this.inputManager._input).then(function(result) { //$NON-NLS-0$
				this.running = false;
				this.writeToConsole(result)
				this.hideCancel();
				this.showRunTests();
			}.bind(this)); //$NON-NLS-0$
		},
		writeToConsole: function(result) {
			if (result) {
				this.console.createContent(result);
			}
		}
	};

	return {
		RunDoctest: RunDoctest
	};
})