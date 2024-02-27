// zoteropreview
// zoteropreview_prefs.js
// adapted from work by Wiley Yu (zotmoov)

Zotero.zoteropreview.Prefs =
{
    init()
    {
        Zotero.zoteropreview.log('prefs init');
        this.populateStyleList();

		var fontPref = Zotero.Prefs.get('extensions.zoteropreview.fontsize',true);
		if (fontPref == "" || typeof fontPref == 'undefined'){
			fontPref = "1";
			Zotero.Prefs.set('extensions.zoteropreview.fontsize',"1",true);
		}
		document.getElementById('zotero-preview-fontsize').value=fontPref;

		var spacingPref = Zotero.Prefs.get('extensions.zoteropreview.spacing',true);
		if (spacingPref == " " || typeof spacingPref == 'undefined'){
			spacingPref = "1.5";
			Zotero.Prefs.set('extensions.zoteropreview.spacing',"1.5",true);
		}
		document.getElementById('zotero-preview-spacing').value=spacingPref;
	},

    populateStyleList() {
		Zotero.zoteropreview.log('populating list');

        // target from prefs.xhtml
		var listbox = document.querySelector("#zotero-preview-style-menulist menupopup");
		var menulist = "";
		
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
		
		Zotero.zoteropreview.log(userpref);

		// add styles to list - from bibliography.js
		
		var styles = Zotero.Styles.getVisible();
		var selectIndex = null;
		for (let i=0; i < styles.length; i++) {
			// var itemNode = document.createElement("menuitem");
			var itemNode = document.createXULElement("menuitem");
			itemNode.setAttribute("value", styles[i].styleID);
			let title = styles[i].title;
			// Add acronyms to APA and ASA to avoid confusion
			// https://forums.zotero.org/discussion/comment/357135/#Comment_357135
			title = title
				.replace(/^American Psychological Association/, "American Psychological Association (APA)")
				.replace(/^American Sociological Association/, "American Sociological Association (ASA)");
			itemNode.setAttribute("label", title);
			
			var itemNodeHTML = "<menuitem value=\"" + styles[i].styleID + "\" label=\"" + title + "\"";
			
			if(styles[i].styleID == userpref) {
				selectIndex = i;
				itemNode.setAttribute('selected', 'true');
				itemNodeHTML += " selected=\"true\"";
				document.getElementById('zotero-preview-style-menulist').value = styles[i].styleID;
				document.getElementById('zotero-preview-style-menulist').lable = title;
			}

			itemNodeHTML += "/>";
			menulist += itemNodeHTML + "\r\n";
			listbox.appendChild(itemNode);
			Zotero.debug(styles[i].styleID);
			// Zotero.debug(title);
			// Zotero.debug(itemNode);
			
		}
		if (selectIndex == null){
			selectIndex = 0;
		}

		// otero.debug(document.getElementById('zotero-prefpane-zotero-preview').outerHTML);

		// Has to be async to work properly
		// window.setTimeout(function () {
		// 		// listbox.ensureIndexIsVisible(selectIndex);
		// 		listbox.selectedIndex = selectIndex;
		// 		if (listbox.selectedIndex == -1) {
		// 			// This can happen in tests if styles aren't loaded
		// 			Zotero.debug("No styles to select", 2);
		// 			return;
		// 		}
		// 	}, 0);
    },

     styleChanged () {
        Zotero.zoteropreview.log('styleChanged');
        // var selectedItem = document.getElementById("style-listbox").selectedItem;
        // var lastSelectedStyle = selectedItem.getAttribute('value');
        // Zotero.Prefs.set('extensions.zoteropreview.citationstyle', lastSelectedStyle, true);
        // Zotero.zoteropreview.currentStyle = lastSelectedStyle;
        Zotero.zoteropreview.getCitationPreview();
    }
};
