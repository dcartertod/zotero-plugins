Zotero.zoteropreview = {
	id: null,
	version: null,
	rootURI: null,
	initialized: false,
	addedElementIDs: [],
	currentStyle: null,
	_notifierID: null,
	
	init({ id, version, rootURI }) {
		if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
	},
	
	log(msg) {
		Zotero.debug("zoteropreview: " + msg);
	},

	addToWindow(positionpref) {
		try {
			//this.log(window);
			if (typeof positionpref === 'undefined'){
				positionpref = Zotero.Prefs.get('extensions.zoteropreview.position', true);
			}

			var target = Zotero.getActiveZoteroPane().document.getElementById(positionpref);
			this.log(target);

			var zpdiv = Zotero.getActiveZoteroPane().document.getElementById('zotero-preview');
			this.log(zpdiv);

			if (zpdiv == null){
				this.log('adding div')
				// Add a div to the main Zotero pane just below the article title (for now)
				zpdiv = Zotero.getActiveZoteroPane().document.createElement('div');
				zpdiv.id = 'zotero-preview';

				this.storeAddedElement(zpdiv);
			}
			target.after(zpdiv);
			this.log('store')

			this.getCitationPreview('addtowindow');		
				
		} catch (error) {
			this.log('could not add the item pane header thing');
		}
	},
	
	addToAllWindows() {
		var windows = Zotero.getMainWindows();
		for (let win of windows) {
			if (!win.ZoteroPane) continue;
			this.addToWindow(win);
		}
	},
	
	// keep track of added elements so they can be removed on uninstall and shutdown
	storeAddedElement(elem) {
		if (!elem.id) {
			throw new Error("Element must have an id");
		}
		this.addedElementIDs.push(elem.id);
	},
	
	removeFromWindow(window) {
		var doc = window.document;
		// Remove all elements added to DOM
		for (let id of this.addedElementIDs) {
			doc.getElementById(id)?.remove();
		}
		try {
			doc.querySelector('#zotero-preview')?.remove();
		}
		catch(err){
			this.log(err);
		}
	},
	
	removeFromAllWindows() {
		var windows = Zotero.getMainWindows();
		for (let win of windows) {
			if (!win.ZoteroPane) continue;
			this.removeFromWindow(win);
		}
	},
	
	async main() {
		// this.log('adding notifier');
		this._notifierID = Zotero.Notifier.registerObserver(this, ['item'], 'itemBox');
		// this.log(this._notifierID);
		
		// Retrieve a global pref
		this.log(`Main: Format is ${Zotero.Prefs.get('extensions.zoteropreview.citationstyle', true)}`);
		// this.addToAllWindows();
		if(Zotero.getActiveZoteroPane()) {
			var doc = Zotero.getActiveZoteroPane().document;
			doc.addEventListener("select", function(){
				//Zotero.debug('zoteropreview: select');
				Zotero.zoteropreview.getCitationPreview('select in the main part');
			});
			// doc.addEventListener("click", function(){
			// 	//Zotero.debug('zoteropreview: click');
			// 	Zotero.zoteropreview.getCitationPreview('click on the main part');
			// });
			// doc.addEventListener("focus", function(){
			// 	//Zotero.debug('zoteropreview: focus');
			// 	Zotero.zoteropreview.getCitationPreview('focus on the main part');
			// });
			// doc.getElementById('zotero-items-tree').addEventListener("focus", function(){
			// 	//Zotero.debug('zoteropreview: focus new');
			// 	Zotero.zoteropreview.getCitationPreview('focus on the list');
			// });
			// doc.getElementById('zotero-items-tree').addEventListener("click", function(){
			// 	//Zotero.debug('zoteropreview: click new');
			// 	Zotero.zoteropreview.getCitationPreview('click on the list');
			// });
			// doc.getElementById('zotero-editpane-item-box').addEventListener("change", function(){
			// 		//Zotero.debug('zoteropreview: click new');
			// 		Zotero.zoteropreview.getCitationPreview('change on meta-data in zotero-view-item-container');
			// 	});
			// doc.getElementById('zotero-item-pane').addEventListener("focus", function(){
			// 	//Zotero.debug('zoteropreview: focus new');
			// 	Zotero.zoteropreview.getCitationPreview('focus on an item');
			// });
			// doc.getElementById('zotero-items-tree').addEventListener("blur", function(){
			// 	//Zotero.debug('zoteropreview: focus new');
			// 	Zotero.zoteropreview.getCitationPreview('blur on an item');
			// });
			// doc.getElementById('zotero-item-pane').addEventListener("load", function(){
			// 	//Zotero.debug('zoteropreview: focus new');
			// 	Zotero.zoteropreview.getCitationPreview('load on an item');
			// });
		}
	},

	notify(event, _type, ids) {
		if (event != 'modify') return;
		this.log('notified');
		this.addToWindow();
	},

	// because someone might prefer a different preview to their default, this is a custom function
	copyCitation(asCitations){
		// true = citation
		// false = bib
		this.log('copying citation');
		this.log("parameter is: " + asCitations);
		var qc = Zotero.QuickCopy;
		var items = Zotero.getActiveZoteroPane().getSelectedItems();
		var format = qc.getFormatFromURL(qc.lastActiveURL);
		format = qc.unserializeSetting(format);
		var locale = format.locale ? format.locale : Zotero.Prefs.get('export.quickCopy.locale');
		var userpref = Zotero.Prefs.get('extensions.zoteropreview.citationstyle', true);
		if ( userpref != "" ){
			format.id = userpref;
		}

		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
							   .getService(Components.interfaces.nsIWindowMediator);
		var browserWindow = wm.getMostRecentWindow("navigator:browser");

		browserWindow.Zotero_File_Interface.copyItemsToClipboard(
			 	items, format.id, locale, format.contentType == 'html', asCitations
		);
	},

	async getCitationPreview (debugmsg){
		this.log("=========================")
		this.log('getCitationPreview started ' + debugmsg);
		
		// see https://www.zotero.org/support/dev/client_coding/javascript_api#managing_citations_and_bibliographies
		var items = Zotero.getActiveZoteroPane().getSelectedItems();
		
		if (items.length == 1){
			//this.log("updating citation");
			var qc = Zotero.QuickCopy;
			var format = qc.getFormatFromURL(qc.lastActiveURL);
			format = Zotero.QuickCopy.unserializeSetting(format);

			// this.log(JSON.stringify(format));
			
			if (format.mode == ""){
				format.mode = "bibliography";
			}

			var userpref = Zotero.Prefs.get('extensions.zoteropreview.citationstyle', true);
			// get the font size preference from the global setting
			var fontSizePref = Zotero.Prefs.get('fontSize');
			// Zotero.debug("format is: " + format);
			// this.log("userpref is: " + userpref);
			
			// if the userpref is set, then make that the preview format
			if ( userpref != "" ){
				// this.log("format: " + format["id"]);
				// this.log("Actual userpref is " + format["id"]);
				format.id = userpref;
				format.mode = "bibliography";
			}
			//this.log("format is now: " + JSON.stringify(format));

			var msg = "No bibliography style is chosen in the settings for QuickCopy. Set Preview preference in Settings.";
			
			// if they haven't set either an export format or a custom setting, prompt them to do so
			if (format.id == "" || format.mode == "export") {
				Zotero.getActiveZoteroPane().document.getElementById('zotero-preview').innerHTML = msg;
			   	Zotero.Utilities.Internal.openPreferences('zotero-prefpane-zotero-preview');
			   	return;
			}

			// the copy symbol. combination of unicode and styles shifting spans slightly
			var clipboard = " <span id='zpbibcopy' title='Copy' style=\"z-index: 999; position: relative; top: -.25em; left: -.125em\">📄<span style=\"position: relative; top: .25em; left: -.75em\">📄</span></span>";
			
			this.log('first bit');
			var biblio = qc.getContentFromItems(items, format);
			this.log('biblio done');
			msg = biblio.html;
			msg = msg.replace('</div>', clipboard + "</div>");

			//this.log("first done is \r\n" + msg);

			var locale = format.locale ? format.locale : Zotero.Prefs.get('export.quickCopy.locale');
			
			this.log("format is (after locale) : " + JSON.stringify(format));
			
			var style = Zotero.Styles.get(format.id);
			var styleEngine = style.getCiteProc(locale, 'html');
			
			var citations = styleEngine.previewCitationCluster(
				{
					citationItems: items.map(item => ({ id: item.id })),
					properties: {}
				},
				[], [], "html"
			);
			styleEngine.free();

			// msg =  '<h4 style="border-bottom:1px solid #eeeeee">' + style.title + "</h4>" + msg;
			msg += '<hr style="color:#cccccc; width: 25%; margin-left: 0;"/>' + citations;
			
			// slightly different approach here, using absolute on the inner span. The above is probably more robust.
			clipboard = " <span id='zpcitecopy' title='Copy' style=\"z-index: 999; position: relative; top: -.25em; left: -.125em\">📄<span style=\"position: absolute; top: .25em; left: .25em\">📄</span></span>";
			msg += clipboard;
			this.log("after getting the individual in text: \r\n" + msg);

			// wrap the output in a div that has the font size preference, and a bottom border
			msg = "<div style=\"font-size: " + fontSizePref + "em; border-bottom: 2px solid #cccccc; padding-left: 5%; padding-bottom: 2px;\">" + msg + "</div>";
			// Zotero.debug(msg);

			// https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.js
			// https://github.com/zotero/zotero/blob/master/chrome/content/zotero/tools/cslpreview.xul

			// Zotero_CSL_Editor.generateBibliography(styleEngine);

			//this.log("after adding fontsize");

			var targetDiv = Zotero.getActiveZoteroPane().document.getElementById('zotero-preview');

			//this.log("after getting the target");

			if (targetDiv != null){
				//this.log("target not null");

				if (targetDiv.innerHTML != msg){
					//this.log("setting message");

					targetDiv.innerHTML = msg;	
				}
			}
			// this.log('setting copy for zpcitecopy to true');
			Zotero.getActiveZoteroPane().document.getElementById('zpcitecopy').onclick = () => Zotero.zoteropreview.copyCitation(true);
			// this.log('setting copy for zpbibcopy to false');
			Zotero.getActiveZoteroPane().document.getElementById('zpbibcopy').onclick = () => Zotero.zoteropreview.copyCitation(false);
		}
		this.log('getCitationPreview done');
		this.log('===================');
	}
};
