(function () {

    var cfg = {};
    var cfgregs = [];

    var getTLD = function (domain) {
        if (!domain)
            return;
        if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(domain))
            return domain;
        var a = domain.split('.');
        var l = a.length;
        return (l < 3) ? domain : (a[l - 2] + '.' + a[l - 1])
    };
    var hostName = function (link) {
        var a = createle('a');
        a.href = link;
        return (a.host.length < a.hostname.length) ? a.host : a.hostname
    };
    var getcookie = function (href) {
        return (document.cookie && getTLD(location.hostname) == getTLD(hostName(href))) ? document.cookie + '; ' : '';
    };
    var downone = function (dm, link, referer, comment, posts) {
        var post = posts; if (post == null) post = "";
        var cookies = getcookie(link);
        var txt = document.getSelection() ? document.getSelection().toString() : "";
        if (txt.length == 0) txt = comment;
        if (dm == null) dm = "";
        chrome.extension.sendRequest({ name: "downone", dm: dm, link: link, referer: referer, txt: txt, cookies: cookies, posts: post });
    };
    var downall = function (dm, links, referer, comments) {
        if (dm == null) dm = "";
        var cookies = [];
        $.each(links, function (i, link) {
            cookies[i] = getcookie(link);
        });
        chrome.extension.sendRequest({ name: "downall", dm: dm, links: links, referer: referer, txts: comments, cookies: cookies });
    };
    var downbyctx = function (dm, isall, selc) {
        if (isall || cfg.ctxhref == "") {
            var links = [], txts = [];
            if (selc) {
                var reg = /(http:|https:|ftp:)\/\/[^ "'\r\n<>]+/ig;
                var urls = reg.exec(selc);
                if (!urls) {
                    alert(restr("msg_invaildselection"));
                } else {
                    while (urls) {
                        links.push(urls[0]); txts.push("");
                        urls = reg.exec(selc);
                    }
                    downall(dm, links, document.location.href, txts);
                }
                return;
            }
            $.each(document.links, function (i, link) { if ($.inArray(link.href, links) == -1) { links.push(link.href); txts.push(link.innerText); } });
            $("img").each(function () { var img = $(this)[0]; var alt = img.alt; if (alt == undefined || alt == null) alt = ""; if ($.inArray(img.src, links) == -1) { links.push(img.src); txts.push(alt); } });
            $("param").each(function () { var paramv = $(this)[0].value; if ($.inArray(paramv, links) == -1) { links.push(paramv); txts.push("object"); } });
            if (links.length > 0) { downall(dm, links, document.location.href, txts); }
        } else {
            downone(dm, cfg.ctxhref, document.location.href, "", null);
        }
    }

    var isKeyRight = function (e) { return e && !e.shiftKey && e.ctrlKey && e.altKey; };
    var stope = function (e) { e.stopPropagation(); e.preventDefault(); };

    var menu = null;
    var hidemenu = function () { if (menu != null && menu.length == 1) { menu[0].parentNode.removeChild(menu[0]); menu = null; } };
    var formatmenustr = function (str1, str2) { return str1.replace("%s", str2); };
    var geticonurl = function (dm) { return "url('" + chrome.extension.getURL("images/dms/" + dm + ".png") + "')"; };
    var getmenu = function (islink) {
        hidemenu();
        if (cfg.dmso.length + cfg.dmsa.length == 0) return null;
        var div = createle("ul");
        menu = $(div).attr("class", "_yissyoo_dmb_menu").css("display", "none");
        if (islink) {
            $.each(cfg.dmso, function (i, n) {
                menu.append(createle2("li").attr("dm", n).click(function () {
                    hidemenu(); downbyctx($(this).attr("dm"), false); return false;
                }).append(createle2("nobr").append(createle2("div").width(16).height(16).css("background-image", geticonurl(n))).append(createle2("a").text(formatmenustr(cfg.menu_do, n)))));
            });
        } else {
            if (cfg.dmsa.length == 0) return null;
        }
        $.each(cfg.dmsa, function (i, n) {
            menu.append(createle2("li").attr("dm", n).click(function () {
                hidemenu(); downbyctx($(this).attr("dm"), true); return false;
            }).append(createle2("nobr").append(createle2("div").width(16).height(16).css("background-image", geticonurl(n))).append(createle2("a").append(createle2("nobr").text(formatmenustr(cfg.menu_da, n))))));
        });

        document.body.appendChild(div);
        return div;
    };

    $(document).click(function (e) {
        hidemenu();
        if (e && e.button == 0 && isKeyRight(e)) {
            var hl = finda(e.target);
            if (hl != null) {
                stope(e);
                downone(null, hl.href, document.location.href, hl.innerText, null);
            }
        } else if (cfg.leftclick) {
            var hl = finda(e.target);
            if (hl != null) {
                var realhref = hl.href;
                var href = realhref.toLowerCase();
                var match = false;
                $.each(cfg.extsarr, function (i, ext) { if ((href.lastIndexOf(ext) + ext.length) == href.length) { match = true; return false; } });
                if (!match) {
                    $.each(cfgregs, function (i, reg) {
                        try {
                            if (reg.test(href)) { match = true; return false; }
                        } catch (e) { }
                    });
                }
                if (match) {
                    stope(e);
                    downone(null, realhref, document.location.href, hl.innerText, null);
                }
            }
        }
    }).bind("contextmenu", function (e) {
        var getx = function (ele, ev) {
            var px = ev.pageX;
            var pw = $(document).width() - 5;
            var ew = $(ele).width();
            if ((px + ew) > pw) return pw - ew; else return px;
        };
        var gety = function (ele, ev) {
            var py = ev.pageY;
            var ph = $(document).height() - 5;
            var eh = $(ele).height();
            if ((py + eh) > ph) return ph - eh; else return py;
        };
        hidemenu();
        chrome.extension.sendRequest({ name: "ctxstart", location: location.href });
        var ele = e.target;
        var hl = finda(ele);
        cfg.ctxhref = hl != null ? hl.href : "";
        if (cfg.showmenu && e.shiftKey && !e.ctrlKey && !e.altKey) {
            var menu = getmenu(hl != null);
            if (menu != null) $(menu).css("left", getx(menu, e)).css("top", gety(menu, e)).css("position", "absolute").css("z-index", "99999").show();
            return false;
        }
    });
    chrome.extension.sendRequest({ name: "getcfg" }, function (resp) {
        cfg = {
            leftclick: resp.leftclick,
            extsarr: strtoarr(resp.extstr),
            regarr: strtoarr(resp.regstr),
            showmenu: resp.showmenu,
            menu_do: resp.mo,
            menu_da: resp.ma,
            dmsa: strtoarr(resp.dmsa),
            dmso: strtoarr(resp.dmso)
        };
        if (cfg.showmenu) {
            $.each(cfg.regarr, function (i, reg) { cfgregs[i] = new RegExp(reg); });
            try {
                $("head")[0].appendChild(createle2('link').attr("rel", "stylesheet").attr("type", "text/css").attr("href", chrome.extension.getURL('css/menu.css'))[0]);
            } catch (e) { }
        }
    });
    chrome.extension.onRequest.addListener(function (req, sender, resp) {
        if (req.name == "ctxclick" && req.loc == location.href) {
            downbyctx(req.dm, req.isall, req.selc);
        } else if (req.name == "check") {
            resp();
        }
    });
})();