if (typeof Zotero == 'undefined')
{
    var Zotero;
}

function log(msg) {
	Zotero.debug("Zotero Abstract Cleaner 0.1: " + msg);
}

function install() {
	log("Installed ");
}

async function startup({ id, version, rootURI }) {
	log("Starting " + version);
	Zotero.debug("Starting " + version);
	
	Zotero.debug("load sub script " + version);
    Services.scriptloader.loadSubScript(rootURI + 'ZoteroAbstractCleaner.js');
    Services.scriptloader.loadSubScript(rootURI + 'zoteroabstractcleaner_menu.js');

	Zotero.ZoteroAbstractCleaner.init({ id, version, rootURI });
    Zotero.ZoteroAbstractCleaner.Menus.init();

}

function shutdown()
{
    log('ZotMoov: Shutting down');
    // Zotero.ZoteroAbstractCleaner.destroy();
    Zotero.ZoteroAbstractCleaner.Menus.destroy();

    Zotero.ZoteroAbstractCleaner = null;
}

function uninstall()
{    
    log('ZotMoov: Uninstalled');
    // Zotero.ZoteroAbstractCleaner.destroy();
    Zotero.ZoteroAbstractCleaner.Menus.destroy();

    Zotero.ZoteroAbstractCleaner = null;
}

