

//Zotero.debug("zoteropreview loading",3);

// I have no idea what this does - copied from someone else
// loads sub scripts I suppose

// Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://zoteropreview/content/zoteropreview.js");

// Zotero.Schema.schemaUpdatePromise.then(() => {
	 // Zotero.zoteropreview.init();
	 // Zotero.debug("zoteropreview loaded",3);
// });

// Only create main object once - copied from zotfile
if (!Zotero.zoteropreview) {
	Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader).loadSubScript("chrome://zoteropreview/content/zoteropreview.js");
	window.addEventListener('load', function(e) {
		Zotero.zoteropreview.init();
	}, false);	
}
