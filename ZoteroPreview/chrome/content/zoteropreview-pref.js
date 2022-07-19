/**
* functions for styleChooser.xul
*/

var Zotero = Components.classes["@zotero.org/Zotero;1"]
    .getService(Components.interfaces.nsISupports)
    .wrappedJSObject;

Zotero.debug('prefs scripts');

// chunks from https://github.com/zotero/zotero/blob/master/chrome/content/zotero/bibliography.js

/**
* build the list box with the current styles
* called from the onload in styleChooser.xul
* @return {void}
*/
var styleChooser = function () {
		var listbox = document.getElementById("style-listbox");
		// Zotero.debug(listbox);
		
		var format = Zotero.Prefs.get("export.lastStyle");
		var userpref = Zotero.Prefs.get('extensions.zoteropreview.citationstyle', true);
		// Zotero.debug(format);
		// Zotero.debug(userpref);
		
		// save the current user preference in case need to reset
		this.currentStyle = userpref;
		
		// if set, then make the user preference the format
		if ( userpref == "" ){
			userpref = format;
		}
		
		// add styles to list - from bibliography.js
		
		var styles = Zotero.Styles.getVisible();
		var selectIndex = null;
		for (let i=0; i < styles.length; i++) {
			var itemNode = document.createElement("listitem");
			itemNode.setAttribute("value", styles[i].styleID);
			let title = styles[i].title;
			// Add acronyms to APA and ASA to avoid confusion
			// https://forums.zotero.org/discussion/comment/357135/#Comment_357135
			title = title
				.replace(/^American Psychological Association/, "American Psychological Association (APA)")
				.replace(/^American Sociological Association/, "American Sociological Association (ASA)");
			itemNode.setAttribute("label", title);
			listbox.appendChild(itemNode);
			
			// Zotero.debug(styles[i].styleID);
			
			if(styles[i].styleID == userpref) {
				selectIndex = i;
			}
		}
		if (selectIndex == null){
			selectIndex = 0;
		}
		// Has to be async to work properly
		window.setTimeout(function () {
				listbox.ensureIndexIsVisible(selectIndex);
				listbox.selectedIndex = selectIndex;
				if (listbox.selectedIndex == -1) {
					// This can happen in tests if styles aren't loaded
					Zotero.debug("No styles to select", 2);
					return;
				}
			}, 0);
	}.bind(Zotero.zoteropreview);

/**
* called from the ondialogcancel in styleChooser.xul
* resets to the stored style and triggers the update
* @return {void}
*/
var styleCanceled = function() {
		Zotero.debug('styleCanceled');
		Zotero.Prefs.set('extensions.zoteropreview.citationstyle', this.currentStyle, true)
		this.getCitationPreview();
	}.bind(Zotero.zoteropreview);

/**
* called from the ondialogaccept in styleChooser.xul
* sets the stored style and triggers the preview update
* I think that .bind means that "this" will refer to Zotero.zoteropreview
* @return {void}
*/
var styleChanged = function() {
		Zotero.debug('styleChanged');
		var selectedItem = document.getElementById("style-listbox").selectedItem;
		lastSelectedStyle = selectedItem.getAttribute('value');
		Zotero.Prefs.set('extensions.zoteropreview.citationstyle', lastSelectedStyle, true);
		this.currentStyle = lastSelectedStyle;
		this.getCitationPreview();
	}.bind(Zotero.zoteropreview);


