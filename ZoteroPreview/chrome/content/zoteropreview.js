Zotero.zoteropreview = {

	init: async function () {
		Zotero.debug("zoteropreview: init");
		
		// probably a massive hack, but it works, oh and zotfile does something like this it turns out
		// do not know how to hook into chrome/content/zotero/itemPane.js for "viewItem" code
		// so just listen for a select - tried all kinds of things before this
		document.addEventListener("select", function(){
			Zotero.zoteropreview.getCitationPreview();
		});
	},

	getCitationPreview: async function(){
		Zotero.debug('zoteropreview: getCitationPreview');
		// https://www.zotero.org/support/dev/client_coding/javascript_api#managing_citations_and_bibliographies
		var items = Zotero.getActiveZoteroPane().getSelectedItems();
		
		if (items.length == 1 && document.getElementById('zotero-view-tabbox').selectedIndex == 4){
			var qc = Zotero.QuickCopy;
			var format = Zotero.Prefs.get("export.quickCopy.setting");
			var msg = "No bibliography style is chosen in the settings for QuickCopy.";
			
			// added a pane in overlay.xul
			var iframe = document.getElementById('zoteropreview-preview-box');

			if (format.split("=")[0] !== "bibliography") {
			   iframe.contentDocument.documentElement.innerHTML = msg;
			   return;
			}
			var biblio = qc.getContentFromItems(items, format);
			msg = biblio.html;

			// https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.js
			// https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.xul
			
			iframe.contentDocument.documentElement.innerHTML = msg;	
		}
	},
	
};


