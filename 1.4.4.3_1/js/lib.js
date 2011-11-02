var _cfgid = {
    DownloadManagerCurrent: "_dm",
    DownloadManagerCustomString: "_dm_c",
    DownloadManagersSupportAll: "_dms_all",
    DownloadManagersSupportOne: "_dms_one",
    EnableLeftClick: "_leftclick",
    EnableBlockStream: "_blockstream",
    LeftClickExtensions: "_exts",
    LeftClickRegexs: "_exts_reg",
    EnableExtensionMenu: "_showmenu",
    EnableChromeMenu: "_showmenu2",
    EnableCustomDMMenu: "_showmenu_cust",
    EnableAutoHideParentMenu: "_autohidegroupmenu",
    MenuPolicy: "_menupolicy",
    MenuItemTextDownloadOne: "_menu_do",
    MenuItemTextDownloadAll: "_menu_da",
    MenuItemTextRoot: "_menu_m",
    ExtensionVersion: "ver",
    _CustomDownloadManager: "_DM_C"
};
function get(key) {
    var nv = function (k, k2) {
        if (k == k2) { var v = localStorage.getItem(k); return v == undefined || v == null; }
        return false;
    }
    if (nv(key, _cfgid.EnableBlockStream)) return booltostr(false);
    if (nv(key, _cfgid.EnableLeftClick)) return booltostr(false);
    if (nv(key, _cfgid.EnableChromeMenu)) return booltostr(true);
    if (nv(key, _cfgid.EnableCustomDMMenu)) return booltostr(true);
    if (nv(key, _cfgid.EnableAutoHideParentMenu)) return booltostr(true);
    if (nv(key, _cfgid.EnableExtensionMenu)) return booltostr(true);
    if (nv(key, _cfgid.LeftClickExtensions)) return ".asf,.avi,.exe,.iso,.mp3,.mpeg,.mpg,.mpga,.ra,.rar,.rm,.rmvb,.tar,.wma,.wmp,.wmv,.mov,.zip,.3gp,.chm,.mdf,.torrent,.mp4,.7z";
    if (nv(key, _cfgid.LeftClickRegexs)) return "\\.exe\\??,\\.rar\\??,\\.flv\\??,\\.mp4\\??,\\.avi\\??,\\.mpeg\\??,\\.mpg\\??,\\.wmv\\??,\\.mov\\??,\\.3gp\\??,youtube\\.com/videoplayback\\?";
    if (nv(key, _cfgid.MenuItemTextRoot)) return restr("opt_menu_main_default");
    if (nv(key, _cfgid.MenuItemTextDownloadOne)) return restr("opt_menu_downoneformat");
    if (nv(key, _cfgid.MenuItemTextDownloadAll)) return restr("opt_menu_downallformat");

    return localStorage.getItem(key);
}
function set(key, value) { localStorage.setItem(key, value); }
function restr(key) { return chrome.i18n.getMessage(key); }
function createle(tag) { return document.createElement(tag); }
function createle2(tag) { return $(createle(tag)); }
function openpage(url) { chrome.extension.sendRequest({ name: "open", arg: url }); }
function formatstr(str) { return (str != null && str != undefined) ? str : ""; }
function strtoarr(str) { var arr = formatstr(str).split(","); return $.grep(arr, function (n, i) { return n.length > 0; }); }
function finda(ele) { while (ele.tagName != 'A' && ele.parentNode) { ele = ele.parentNode }; if (!ele.href) { return null; } else { return ele; } }
function getappname(src) { var appstr = /^(\"([^\"]+)\"|([^ \"]+) )/.exec(src); if (appstr) { appstr = appstr[2] ? appstr[2] : appstr[3]; var app = /[^\\]+$/.exec(appstr); if (app) return app[0]; } }
function booltostr(value) { return value ? "1" : "0"; }
function strtobool(str) { return str == "1"; }
function initmessage() { var settext = function () { var me = $(this); me.text(restr(me.attr("mid"))); }; $("label[mid]").each(settext); $("a[mid]").each(settext); }
function findone(arr, finder, valuegetter, defaultvalue) {
    if (!arr) {
        return defaultvalue;
    }
    for (var i = 0; i < arr.length; i++) {
        if (finder(arr[i])) {
            if (valuegetter) {
                return valuegetter(arr[i]);
            }
            return arr[i];
        }
    }
    return defaultvalue;
}