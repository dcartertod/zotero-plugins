// ZoteroAbstractCleaner
// Indebted to Zotmoov code written by Wiley Yu

Components.utils.import('resource://gre/modules/Services.jsm');

Zotero.ZoteroAbstractCleaner.Menus = {
    _store_added_elements: [],
    _zac_menu_item: null,

    _window_listener:
    {
        onOpenWindow: function(a_window)
        {
            let dom_window = a_window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
            dom_window.addEventListener('load', function()
            {
                dom_window.removeEventListener('load', arguments.callee, false);
                if (dom_window.document.documentElement.getAttribute('windowtype') != 'navigator:browser') return;
                Zotero.ZoteroAbstractCleaner.Menus._store_added_elements = []; // Clear tracked elements since destroyed by closed window
                Zotero.ZoteroAbstractCleaner.Menus._zac_menu_item = null;
                Zotero.ZoteroAbstractCleaner.Menus._init();
            }, false);
        }
    },

    _getWindow()
    {
        let enumerator = Services.wm.getEnumerator('navigator:browser');
        while (enumerator.hasMoreElements())
        {
            let win = enumerator.getNext();
            if (!win.ZoteroPane) continue;
            return win;
        }
    },

    init()
    {
        this._init();
        Services.wm.addListener(this._window_listener);
    },

    _init()
    {
        let win = this._getWindow();
        let doc = win.document;

        // Menu separator
        let menuseparator = doc.createXULElement('menuseparator');

        // ZAC Menu item
        this._zac_menu_item = doc.createXULElement('menuitem');
        this._zac_menu_item.id = 'zoteroabstractcleaner-menuitem';
        this._zac_menu_item.setAttribute('data-l10n-id', 'ZoteroAbstractCleaner-abstract');
        this._zac_menu_item.addEventListener('command', function()
        {
            Zotero.ZoteroAbstractCleaner.fixAbstract();
        });

        let zotero_itemmenu = doc.getElementById('zotero-itemmenu');

        zotero_itemmenu.appendChild(menuseparator);
        zotero_itemmenu.appendChild(this._zac_menu_item);

        this._store_added_elements.push(menuseparator, this._zac_menu_item);

        // Enable localization
        win.MozXULElement.insertFTLIfNeeded('ZoteroAbstractCleaner.ftl');
    },

    destroy()
    {
        this._destroy();
        Services.wm.removeListener(this._window_listener);
    },

    _destroy()
    {
        let doc = this._getWindow().document;
        for (let element of this._store_added_elements)
        {
            if (element) element.remove();
        }
        doc.querySelector('[href="ZoteroAbstractCleaner.ftl"]').remove();

        this._store_added_elements = [];
        this._zac_menu_item = null;
    }
}
