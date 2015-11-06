/**
 * A general console acting as stdout to the user.
 */

/*eslint-env browser, amd*/
define(['orion/webui/littlelib', 'orion/webui/splitter'], function(lib, mSplitter) {

	function Console(options) {
		var splitEditConsole = lib.$(".splitEditConsole"); //$NON-NLS-0$
		var top = lib.$(".topPanelLayout"); //$NON-NLS-0$
		var bot = lib.$(".botPanelLayout"); //$NON-NLS-0$
		this.splitter = new mSplitter.Splitter({
			id: "editConsole", //$NON-NLS-0$
			node: splitEditConsole,
			sidePanel: top,
			mainPanel: bot,
			vertical: true,
			toggle: true,
			closeReversely: true,
			closeByDefault: true
		});

		this.console = lib.node("console"); //$NON-NLS-0$
		this.contentsNode = lib.$(".console-messages", this.console); //$NON-NLS-0$
		this.inputManager = options.inputManager;
		this.serviceRegistry = options.serviceRegistry;
		lib.$(".clear-console").onclick = this.clearContent.bind(this); //$NON-NLS-0$
		this.clearContent();
	}

	Console.prototype = {
		clearContent: function() {
			this.contentsNode.innerHTML = ""; //$NON-NLS-0$
		},

		createContent: function(content) {
			this.show();
			var contentItem = document.createElement("li"); //$NON-NLS-0$
			contentItem.classList.add("console-message"); //$NON-NLS-0$
			var coreSpriteArrow = document.createElement("div"); //$NON-NLS-0$
			coreSpriteArrow.classList.add("console-arrow"); //$NON-NLS-0$
			var contentExpandedWrapper = document.createElement("div"); //$NON-NLS-0$
			var contentCollapsedWrapper = document.createElement("div"); //$NON-NLS-0$
			contentExpandedWrapper.appendChild(document.createTextNode(content));
			contentCollapsedWrapper.appendChild(document.createTextNode(content.split("\n")[0])); //$NON-NLS-0$
			contentItem.appendChild(coreSpriteArrow);
			contentItem.appendChild(contentExpandedWrapper);
			contentItem.appendChild(contentCollapsedWrapper);
			this.contentsNode.appendChild(contentItem);

			var expand = function() {
				coreSpriteArrow.classList.remove("core-sprite-closedarrow"); //$NON-NLS-0$
				coreSpriteArrow.classList.add("core-sprite-openarrow"); //$NON-NLS-0$
				contentExpandedWrapper.style.display = "block"; //$NON-NLS-0$
				contentCollapsedWrapper.style.display = "none"; //$NON-NLS-0$
				return collapse;
			};

			var collapse = function() {
				coreSpriteArrow.classList.remove("core-sprite-openarrow"); //$NON-NLS-0$
				coreSpriteArrow.classList.add("core-sprite-closedarrow"); //$NON-NLS-0$
				contentCollapsedWrapper.style.display = "block"; //$NON-NLS-0$
				contentExpandedWrapper.style.display = "none"; //$NON-NLS-0$
				return expand;
			}

			var current = expand;
			var toggle = function() {
				current = current();
			};

			// expanded by default
			toggle();
			coreSpriteArrow.onclick = toggle;

			var scrollTop = this.contentsNode.offsetHeight - this.console.offsetHeight;
			if (scrollTop > 0) {
				this.console.scrollTop = scrollTop;
			}
		},

		hide: function() {
			if (!this.splitter.isClosed()) {
				this.splitter.toggleSidePanel();
			}
		},
		show: function() {
			if (this.splitter.isClosed()) {
				this.splitter.toggleSidePanel();
			}
		}
	}

	return {Console: Console};
});
