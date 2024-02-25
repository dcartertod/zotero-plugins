if (typeof Zotero == 'undefined')
{
    var Zotero;
}

function log(msg) {
	Zotero.debug("zoteropreview 0.1: " + msg);
}

function install() {
	log("Installed ");
}

async function startup({ id, version, rootURI }) {
	log("Starting " + version);
	Zotero.debug("Starting " + version);
	
	Zotero.debug("load sub script " + version);
	Services.scriptloader.loadSubScript(rootURI + 'zoteropreview.js');

	Zotero.PreferencePanes.register({
		pluginID: 'zoteropreview@carter-tod.com',
		src: rootURI + 'prefs.xhtml',
		scripts: [rootURI + 'zoteropreview_prefs.js']
	});

	Zotero.debug("init " + version);
	Zotero.zoteropreview.init({ id, version, rootURI });

	Zotero.debug("Add to windows " + version);
	Zotero.zoteropreview.addToWindow();
	await Zotero.zoteropreview.main();
}

function onMainWindowLoad({ window }) {
	Zotero.zoteropreview.addToWindow(window);
}

function onMainWindowUnload({ window }) {
	Zotero.zoteropreview.removeFromWindow(window);
}

function removeFromWindow(window) {
	var doc = window.document;
	// Remove all elements added to DOM
	// for (let id of this.addedElementIDs) {
	// 	doc.getElementById(id)?.remove();
	// }
	try {
		doc.querySelector('#zotero-preview')?.remove();
	}
	catch(err){
		this.log(err);
	}
}

function removeFromAllWindows() {
	var windows = Zotero.getMainWindows();
	for (let win of windows) {
		if (!win.ZoteroPane) continue;
		this.removeFromWindow(win);
	}
}

function shutdown() {
	log("Shutting down ");
	Zotero.Notifier.unregisterObserver(this._notifierID);
	this.removeFromAllWindows();
	Zotero.zoteropreview = undefined;
}

function uninstall() {
	this.shutdown();
	log("Uninstalled ");
}
