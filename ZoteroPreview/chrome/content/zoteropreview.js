// completely different approach copied from zotfile

Zotero.zoteropreview = new function() {
	
	this.currentStyle = "";
	
	 /**
     * Initiate zoteropreview
	 * called from include.js
	 * adds a select listener to the main window
     * @return {void}
     */
	this.init = async function () {
		Zotero.debug("zoteropreview: init");
		await Zotero.Schema.schemaUpdatePromise;
		
		// probably a massive hack, but it works, oh and zotfile does something like this it turns out
		// do not know how to hook into chrome/content/zotero/itemPane.js for "viewItem" code
		// so just listen for a select - tried all kinds of things before this
		if(window.ZoteroPane) {
			var doc = window.ZoteroPane.document;
			doc.addEventListener("select", function(){
				Zotero.zoteropreview.getCitationPreview();
			});
		}
	};

	/**
	* Primary function to generate the preview
	* called from a number of places, but primarily on selection change
	* @return {void}
	*/
	this.getCitationPreview = async function(){
		Zotero.debug('zoteropreview: getCitationPreview');
		
		// see https://www.zotero.org/support/dev/client_coding/javascript_api#managing_citations_and_bibliographies
		var items = Zotero.getActiveZoteroPane().getSelectedItems();
		
		if (items.length == 1 && Zotero.getActiveZoteroPane().document.getElementById('zotero-view-tabbox').selectedIndex == 4){
			var qc = Zotero.QuickCopy;
			var format = Zotero.Prefs.get("export.quickCopy.setting");
			var userpref = Zotero.Prefs.get('extensions.zoteropreview.citationstyle', true);
			// get the font size preference from the global setting
			var fontSizePref = Zotero.Prefs.get('fontSize');
			Zotero.debug("format is: " + format);
			Zotero.debug("userpref is: " + userpref);
			
			if ( userpref != "" ){
				format = "bibliography=" + userpref;
			}
			Zotero.debug("format is now: " + format);

			var msg = "No bibliography style is chosen in the settings for QuickCopy.";
			
			// added a pane in overlay.xul
			var iframe = Zotero.getActiveZoteroPane().document.getElementById('zoteropreview-preview-box');

			if (format.split("=")[0] !== "bibliography") {
			   iframe.contentDocument.documentElement.innerHTML = msg;
			   this.openPreferenceWindow();
			   return;
			}
			var biblio = qc.getContentFromItems(items, format);
			msg = biblio.html;
			// wrap the output in a div that has the font size preference
			msg = "<div style=\"font-size: " + fontSizePref + "em\">" + msg + "</div>";
			Zotero.debug(msg);

			// https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.js
			// https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.xul
			
			iframe.contentDocument.documentElement.innerHTML = msg;	
		}
		Zotero.debug('zoteropreview: getCitationPreview done');
	};
	
	 /**
     * Open zoteropreview preference window
	 * this took way too long to work out how to do, mostly because of a typo in styleChooser.xul ;-)
     */
    this.openPreferenceWindow = function(paneID, action) {
        // var io = {pane: paneID, action: action};
		// Zotero.debug(prefWindow);
		// Zotero.debug(window.title);
        var prefWindow = window.openDialog('chrome://zoteropreview/content/styleChooser.xul',
            'zoteropreview-stylechooser',
            'chrome,centerscreen,scrollbars=yes,resizable=yes');
    };
	
};


