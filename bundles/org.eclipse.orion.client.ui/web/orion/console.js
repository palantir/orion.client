/*eslint-env browser, amd*/
define(['orion/webui/littlelib'], function(lib) {
	var content = "Starting content";

	function Console(serviceRegistry) {
		var console = lib.node("console");

		if (!console.childNodes.length) {
			console.appendChild(document.createTextNode(""));
		}
		this.childNode = console.firstChild;
	}
	Console.prototype = {
		setContent: function(newContent) {
			this.childNode.nodeValue = newContent;
		}
	}

	return {Console: Console};
});

//	
//	
//	Blamer.prototype = {
//		getBlamer: function() {
//			var metadata = this.inputManager.getFileMetadata();
//			var blamers = this.serviceRegistry.getServiceReferences("orion.edit.blamer"); //$NON-NLS-0$
//			for (var i=0; i < blamers.length; i++) {
//				var serviceReference = blamers[i];
//				var info = {};
//				info.validationProperties = serviceReference.getProperty("validationProperties"); //$NON-NLS-0$
//				info.forceSingleItem = true;
//				var validator = mExtensionCommands._makeValidator(info, this.serviceRegistry);
//				if (validator.validationFunction.bind(validator)(metadata)) {
//					return this.serviceRegistry.getService(serviceReference);
//				}
//			}
//			return null;
//		},
//
//		isVisible: function() {
//			return !!this.getBlamer();
//		},
//		
//		doBlame: function() {
//			var service = this.getBlamer();
//			if (service) {
//				var handleResult = function(results) {
//					var orionHome = PageLinks.getOrionHome();
//					for (var i=0; i<results.length; i++) {
//						var range = results[i];
//						var uriTemplate = new URITemplate(range.CommitLink);
//						var params = {};
//						params.OrionHome = orionHome;
//						range.CommitLink = uriTemplate.expand(params);
//					}
//					this.editor.showBlame(results);
//				}.bind(this);
//				var inputManager = this.inputManager;
//				var context = {metadata: inputManager.getFileMetadata()};
//				service.computeBlame(this.editor.getEditorContext(), context).then(handleResult);
//			}
//		}
//	};
//	return {Blamer: Blamer}; 
//});


