function createtip(id) {
    return createle2("a").attr("href", "#").css("color", "blue").text(restr("clear_tip")).attr("arg", id).click(function () {
        if (confirm(restr("clear_confirm"))) { $("#_dmb")[0].Clear($(this).attr("arg")); window.reload(); }
    });
}
function msg(key, close) {
    window.scrollTo(0, 0);
    var sp = $("#spmsg"); sp.text(restr(key)); sp.show("fast");
    var hide = function () { sp.hide("fast", function () { if (close) { window.close(); } }); };
    setTimeout(hide, 1000);
}
function ready() {
    initmessage();
    var dms = $("#dms"); dms.hide("fast"); dms.empty();
    var cget = $("#_dmb")[0];
    cget.Test();
    //DMS
    $.get(chrome.extension.getURL("npdmb.test"), function (data) {
        var dmso = []; var dmson = 0; var dmsa = []; var dmsan = 0;
        var apps = data.split("\n"); var app = "";
        for (var i = 0; i < apps.length; i++) { for (var j = i; j < apps.length; j++) { if (apps[i] > apps[j]) { app = apps[j]; apps[j] = apps[i]; apps[i] = app; } } }
        for (var i = 0; i < apps.length; i++) {
            var appstr = apps[i];
            if (appstr.length > 0) {
                var app = appstr.split("|"); var appid = app[0]; var isall = parseInt(app[1]) == 1; var isclearable = parseInt(app[2]) == 1; var ison = parseInt(app[3]) == 1;
                var nobr = createle2("nobr");
                var radio = createle2("input").attr({ type: "radio", name: "dm", id: "rd" + appid, value: appid });
                var label = createle2("label").attr({ "for": "rd" + appid }).append(appid);
                nobr.append(radio); nobr.append(label); dms.append(nobr); dms.append("&nbsp;");
                if (ison) {
                    var disone = createle2("a").attr({ href: "#", name: "astate", appid: appid });
                    nobr.append("&nbsp;[").append(disone).append("]");
                    if (isall) { dmso[dmson++] = appid; dmsa[dmsan++] = appid; } else { dmso[dmson++] = appid; }
                    if (isclearable) {
                        label.poshytip({
                            content: new createtip(appid),
                            className: 'tip-yellowsimple',
                            showOn: 'hover',
                            alignTo: 'target',
                            alignX: 'center',
                            alignY: 'bottom',
                            offsetY: 5,
                            hideTimeout: 1000,
                            showTimeout: 500
                        });
                    }
                } else { radio.attr("disabled", "disabled"); label.css("color", "gray"); }
            }
        }

        var cdm = get(_cfgid.DownloadManagerCurrent);
        $("input[name='dm']").each(function () {
            var r = $(this)[0];
            if ($(this).val() == cdm)
                r.checked = true;
        });





        var dmpolicy = get(_cfgid.MenuPolicy); if (dmpolicy) dmpolicy = dmpolicy.split(",");

        var getstatestr = function (mode) {
            return mode == 0 ? restr("p_mode0") : (mode == 1 ? restr("p_mode1") : (mode == 2 ? restr("p_mode2") : restr("p_mode3")));
        };
        $("a[name='astate']").each(function () {
            var a = $(this);
            var appid = a.attr("appid");
            var mode = findone(dmpolicy, function (dmp) { return dmp.split("|")[0] == appid; }, function (dmp) { return dmp.split("|")[1]; }, 0);
            a.text(getstatestr(mode)).attr("mode", mode);
        }).click(function () {
            var a = $(this);
            var mode = a.attr("mode"); if (mode == null) mode = 0; mode = parseInt(mode);
            if (++mode > 3) mode = 0;
            a.attr("mode", mode);
            a.text(getstatestr(mode));
            return false;
        });





        setdms(dmsa, true); setdms(dmso, false);
        dms.show("fast", function () { new msg("opt_msg_reload"); });
    }, "text");
    //
    $("#txtCustom").val(get(_cfgid.DownloadManagerCustomString));
    $("#chkBlockStream")[0].checked = strtobool(get(_cfgid.EnableBlockStream));
    $("#chkLeftClick")[0].checked = strtobool(get(_cfgid.EnableLeftClick));
    $("#txtExts").val(get(_cfgid.LeftClickExtensions) + "\n" + get(_cfgid.LeftClickRegexs));
    $("#txtDoM").val(get(_cfgid.MenuItemTextRoot));
    $("#txtDof").val(get(_cfgid.MenuItemTextDownloadOne));
    $("#txtDaf").val(get(_cfgid.MenuItemTextDownloadAll));
    $("#chkMenu")[0].checked = strtobool(get(_cfgid.EnableExtensionMenu));
    $("#chkMenu2")[0].checked = strtobool(get(_cfgid.EnableChromeMenu));
    $("#chkMenu2Custom")[0].checked = strtobool(get(_cfgid.EnableCustomDMMenu));
    $("#chkMenu2Auto")[0].checked = strtobool(get(_cfgid.EnableAutoHideParentMenu));
}

function getdm() { return }
function setdms(dms, all) { set((all ? _cfgid.DownloadManagersSupportAll : _cfgid.DownloadManagersSupportOne), dms); }
function save(close) {
    var dm = "";
    $("input[name='dm']").each(function () { var r = $(this)[0]; if (r.checked) dm = r.value; });
    set(_cfgid.DownloadManagerCurrent, dm);
    set(_cfgid.DownloadManagerCustomString, $("#txtCustom").val());
    set(_cfgid.EnableBlockStream, booltostr($("#chkBlockStream")[0].checked));
    set(_cfgid.EnableLeftClick, booltostr($("#chkLeftClick")[0].checked));

    var mstr = $("#txtExts").val()
    var mstrs = mstr.split("\n");
    var extsarr = []; var j1 = 0; var regarr = []; var j2 = 0;
    $.each(mstrs, function (i1, mstr2) {
        if (i1 == 0) {
            mstr2 = mstr2.toLowerCase();
            $.each(mstr2.split(","), function (i2, ext) {
                var ext = $.trim(ext);
                if (ext.length > 1 && ext.indexOf(".") == 0) { extsarr[j1++] = ext; }
            });
        } else {
            $.each($.grep(mstr2.split(","), function (n, i) {
                return $.trim(n).length > 0;
            }), function (i2, reg) {
                if (reg.length > 0) {
                    regarr[j2++] = reg;
                }
            });
        }
    });
    set(_cfgid.LeftClickExtensions, extsarr);
    set(_cfgid.LeftClickRegexs, regarr);
    set(_cfgid.EnableExtensionMenu, booltostr($("#chkMenu")[0].checked));
    set(_cfgid.EnableChromeMenu, booltostr($("#chkMenu2")[0].checked));
    set(_cfgid.EnableCustomDMMenu, booltostr($("#chkMenu2Custom")[0].checked));
    set(_cfgid.EnableAutoHideParentMenu, booltostr($("#chkMenu2Auto")[0].checked));
    set(_cfgid.MenuItemTextRoot, $("#txtDoM").val());
    set(_cfgid.MenuItemTextDownloadOne, $("#txtDof").val());
    set(_cfgid.MenuItemTextDownloadAll, $("#txtDaf").val());


    var dmpolicy = [];
    $("a[name='astate']").each(function () {
        var a = $(this);
        dmpolicy.push(a.attr("appid") + "|" + a.attr("mode"));
    });
    set(_cfgid.MenuPolicy, dmpolicy);

    chrome.extension.sendRequest({ name: "umenu" });
    new msg("opt_msg_saved", close);
}
$(document).ready(ready);