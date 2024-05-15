Zotero.ZoteroAbstractCleaner = {

    id: null,
    version: null,
    rootURI: null,
    initialized: false,

    init({ id, version, rootURI })
    {
        if(this.initialized) return;

        this.id = id;
        this.version = version;
        this.rootURI = rootURI;
        this.initialized = true;
    },

	// when you copy from some formats e.g. pdf, the line endings are crap
	// added as an overlay.xul menu item
	fixAbstract: async function(){
		var items = Zotero.getActiveZoteroPane().getSelectedItems();
		for (var x=0; x<items.length; x++){
			var itemID = items[x].id;
			var item = Zotero.Items.get(itemID);
			var abstract = item.getField('abstractNote');
			//Zotero.debug(abstract);
			// bit more tedious but preserves paragraphs
			abstract = abstract.replace(/\r/gm," ");
			abstract = abstract.replace(/\n\n/gm,"<br>");
			abstract = abstract.replace(/\n/gm," ");
			abstract = abstract.replace(/<br>/gm,"\n\n");
			abstract = abstract.replace(/ +/g," ");
			//Zotero.debug(abstract);
			item.setField('abstractNote',abstract);
			await item.saveTx(); 
		}
	},
	
};


