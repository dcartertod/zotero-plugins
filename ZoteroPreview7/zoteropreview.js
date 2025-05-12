
Zotero.zoteropreview = {
	id: null,
	version: null,
	rootURI: null,
	initialized: false,
	addedElementIDs: [],
	currentStyle: null,
	currentItem: null,
	currentItemID: null,
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

	// this was an approach that worked, but since Zotero itself uses stylesheets, I went with that
	// the ::before selector isn't available in JavaScript
	addIcon(){
		var mainDocument = Zotero.getActiveZoteroPane().document;
		if (mainDocument.getElementById('zpicon') == null){
			var icon = mainDocument.createElement('span');
			icon.innerHTML=" ";
			icon.id='zpicon';
			icon.style='width: 16px; height: 16px; background: url("chrome://zotero/skin/16/universal/view.svg") no-repeat center; -moz-context-properties: fill, fill-opacity, stroke, stroke-opacity;fill: var(--accent-blue);stroke: var(--accent-blue);';

			this.log('added span');

			mainDocument.querySelector('#zotero-preview-container .head .title').prepend(icon);
			this.storeAddedElement(icon);
		}
	},

	async addToWindow(positionpref) {
		try {
			//this.log(window);
			// the prefs.xhtml has the values of the containers representing the position
			if (typeof positionpref === 'undefined'){
				positionpref = Zotero.Prefs.get('extensions.zoteropreview.position', true);
			}

			this.log("positionpref:" + positionpref);

			var mainDocument = Zotero.getActiveZoteroPane().document;

			var target = mainDocument.getElementById(positionpref);
			this.log("target:" + target);

			var zpdivContainer = mainDocument.getElementById('zotero-preview-container');
			Zotero.debug('zpdivContainer done');

			// it appears that if we move a collapsible element, it loses it's contents
			this.log('zpdiv');
			var zpdiv = mainDocument.getElementById('zotero-preview');
			if (zpdiv == null){
				this.log('adding zpdiv');
				zpdiv = mainDocument.createElement('div');
				zpdiv.id = 'zotero-preview';
				this.storeAddedElement(zpdiv);
			}
			Zotero.debug('zpdiv done');

			if (zpdivContainer == null){
				this.log('adding zpdivContainer')

				mainDocument.ownerGlobal.MozXULElement.insertFTLIfNeeded('zotero-preview.ftl');
				
				zpdivContainer = mainDocument.createXULElement("collapsible-section");
				zpdivContainer.id='zotero-preview-container';
				zpdivContainer.style='--open-height: auto;';
				zpdivContainer.open="";
				zpdivContainer.label='Preview';
				zpdivContainer.dataset.pane="preview";
				zpdivContainer.setAttribute('data-l10n-id', 'zotero-preview-pane-title');


				this.log('adding span');
				this.log('storing elements');

				// Add a stylesheet to the main Zotero pane - based on make-it-red
				// see _collapsibleSection.scss
				// this is how the icons are done
				let link1 = mainDocument.createElement('link');
				this.log('link1');
				link1.id = 'zotero-preview-stylesheet';
				link1.type = 'text/css';
				link1.rel = 'stylesheet';
				link1.href = this.rootURI + 'style.css';
				mainDocument.documentElement.appendChild(link1);
				this.log('link1');
				this.storeAddedElement(link1);

				this.storeAddedElement(zpdivContainer);
			}

			this.log('appending container to target')
			target.after(zpdivContainer);

			// basic order of operations thing here. add the div after adding the container to the main document
			this.log('appending zpdiv to zpdivContainer');
			zpdivContainer.appendChild(zpdiv);
			// this.addIcon();
			this.log('store')

			try {
				this.getCitationPreview('addtowindow');		
			} catch (error) {
				this.log('error in getCitationPreview: ' + error);
			}
				
		} catch (error) {
			this.log('could not add the item pane header thing');
		}
	},
	
	addToAllWindows() {
		var windows = Zotero.getMainWindows();
		for (let win of windows) {
			if (!win.ZoteroPane) continue;
			this.addToWindow();
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
			doc.querySelector('#zotero-preview-container')?.remove();
			doc.querySelector('[href="zotero-preview.ftl"]')?.remove();
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
		this._notifierID = Zotero.Notifier.registerObserver(this, ['item','itemtree'], 'itemBox');
		this.log(this._notifierID);
		
		// Retrieve a global pref
		try {
			this.log(`Main: Format is ${Zotero.Prefs.get('extensions.zoteropreview.citationstyle', true)}`);
			this.addToAllWindows();
			if(Zotero.getActiveZoteroPane()) {
			 	var doc = Zotero.getActiveZoteroPane().document;
				 // ZoteroPane.itemsView.onSelect.addListener(() => Zotero.zoteropreview.getCitationPreview('select'));
			 	doc.addEventListener("select", function(){
					Zotero.zoteropreview.log('select');
					try {
						Zotero.zoteropreview.getCitationPreview('select');
					} catch (error) {
						Zotero.zoteropreview.log('select: ' + error);
					}
			 	});
			}
		}
		catch(err){
			this.log(err);
		}
	},

	// the way this works is that you register with the Zotero Notifier, which then calls the "notify" function
	notify(event, _type, ids, extraData) {
		Zotero.debug('not sure if there is an event for selecting an item in the main pane');
		this.log(event);
		this.log(_type);
		this.log(ids);
		Zotero.debug(ids);
		this.log(extraData);
		if (event != 'modify' && event != 'refresh') return;
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
		this.log('copy done');
	},

	setPref(pref,value){
		Zotero.Prefs.set(pref, value, true);
		this.getCitationPreview('post pref set: ' + pref + " to " + value);
	},

	async getCitationPreview (debugmsg){
		this.log("=========================")
		this.log('getCitationPreview started: ' + debugmsg);
		
		// see https://www.zotero.org/support/dev/client_coding/javascript_api#managing_citations_and_bibliographies
		var items = Zotero.getActiveZoteroPane().getSelectedItems();
		
		if (items.length == 1){
			if (this.currentItemID == items[0].id && debugmsg == 'select'){
				this.log('Same item and event');
				this.log('getCitationPreview done early');
				this.log('===================');
				return;	
			}
			this.currentItemID = items[0].id;
			//this.log("updating citation");
			var qc = Zotero.QuickCopy;
			var format = qc.getFormatFromURL(qc.lastActiveURL);
			format = Zotero.QuickCopy.unserializeSetting(format);

			// this.log(JSON.stringify(format));
			
			if (format.mode == ""){
				format.mode = "bibliography";
			}

			var userpref = Zotero.Prefs.get('extensions.zoteropreview.citationstyle', true);
			var showpref = Zotero.Prefs.get('extensions.zoteropreview.whattoshow', true);
			var userFontPref = Zotero.Prefs.get('extensions.zoteropreview.fontsize', true);
			var spacingPref = Zotero.Prefs.get('extensions.zoteropreview.spacing', true);

			if (typeof spacingPref == 'undefined'){
				spacingPref = "1.5";
			}

			if (debugmsg == 'zpboth' || debugmsg == 'zpintext' || debugmsg == 'zpbib'){
				showpref = debugmsg;
			}

			this.log('show: ' + showpref);

			// let icon = getCSSItemTypeIcon('duplicate');

			// get the font size preference from the global setting
			var fontSizePref = Zotero.Prefs.get('fontSize');
			// Zotero.debug("format is: " + format);
			// this.log("userpref is: " + userpref);

			if (userFontPref != ""){
				fontSizePref = userFontPref;
			}
			
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
			
			this.log('first bit');

			var clipSVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3V0H1V13H4V16H15V3H12ZM2 1H11V12H2V1ZM14 15H5V13H12V4H14V15Z" fill="#cc9200"/></svg>`;

			if (showpref == 'zpboth' || showpref == 'zpbib'){
				// the copy symbol. combination of unicode and styles shifting spans slightly
				var clipboard = " <span id='zpbibcopy' style='cursor: pointer;' title='Copy or use ctrl + shift + C'>" + clipSVG + "</span>";
		
				// this next line seems to take about 700ms on average
				var biblio = qc.getContentFromItems(items, format);
				this.log('biblio done');
				msg = biblio.html;
				// wee bit of a speed up, I think
				// if (this.currentItem == msg){
				// 	this.log('getCitationPreview done early');
				// 	this.log('===================');
				// 	return;
				// }
				this.currentItem = msg;
				// msg = msg.replace('</div>', clipboard + "</div>");
			}

			// msg =  '<h4 style="border-bottom:1px solid #eeeeee">' + style.title + "</h4>" + msg;
			if (showpref == "zpboth"){
				msg += '<hr style="color:#cccccc; width: 25%; margin-left: 0;"/>'
			}
			
			if (showpref == 'zpboth' || showpref == 'zpintext'){
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
				if (showpref == 'zpintext'){
					msg="";
				}
				msg += citations;
				// slightly different approach here, using absolute on the inner span. The above is probably more robust.
				clipboard = " <span id='zpcitecopy' style='cursor: pointer;' title='Copy or use ctrl + shift + A'>" + clipSVG + "</span>";
				msg += clipboard;
				this.log("after getting the individual in text: \r\n" + msg);
			}

			// wrap the output in a div that has the font size preference, and a bottom border
			msg = `<div style="font-size: ${fontSizePref}em; border-bottom: 1px solid #ddd; padding-left: 5px; padding-bottom: 5px;">${msg}</div>`;
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
					// this.log('setting copy for zpcitecopy to true');
					if (targetDiv.querySelector('#zpcitecopy') != null){
						targetDiv.querySelector('#zpcitecopy').onclick = () => Zotero.zoteropreview.copyCitation(true);
					}
					// this.log('setting copy for zpbibcopy to false');
					if (targetDiv.querySelector('#zpbibcopy') != null){
						targetDiv.querySelector('.csl-bib-body').style.lineHeight=spacingPref;
						targetDiv.querySelector('#zpbibcopy').onclick = () => Zotero.zoteropreview.copyCitation(false);
					}
				}
			}
		}
		this.log('getCitationPreview done');
		this.log('===================');
	}
};
