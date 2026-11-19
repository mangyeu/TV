// =============================================================================
// CONFIGURATION & METADATA (STRICT ES5)
// =============================================================================

var PLUGIN_CONFIG = {
    id: "javhd",
    name: "JavHD",
    version: "1.2.0",
    baseUrl: "https://javhdz.today",
    iconUrl: "https://javhdz.today/favicon.ico",
    isEnabled: true,
    isAdult: true,
    type: "VIDEO",
    playerType: "embedtoexoplay",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

var IDOLS_MENU_HTML = ""
    + '<li class="dropdown dropdown-large">'
    + '  <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-star"></i> Idols Av<b class="caret"></b></a>'
    + '  <ul class="dropdown-menu dropdown-menu-large row">'
    + '    <li class="col-sm-4"><ul>'
    + '      <li class="dropdown-header" style="color: #000;">Top Idols</li>'
    + '      <li class="divider"></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hatano-yui/"><i class="fa fa-caret-right"></i> Hatano Yui</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/aika/"><i class="fa fa-caret-right"></i> Aika</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hasumi-kurea/"><i class="fa fa-caret-right"></i> Hasumi Kurea</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/iioka-kanako/"><i class="fa fa-caret-right"></i> Iioka Kanako</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/nagisa-mitsuki/"><i class="fa fa-caret-right"></i> Nagisa Mitsuki</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/shinoda-yuu/"><i class="fa fa-caret-right"></i> Shinoda Yuu</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/matsumoto-ichika/"><i class="fa fa-caret-right"></i> Matsumoto Ichika</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hamasaki-mao/"><i class="fa fa-caret-right"></i> Hamasaki Mao</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/haruna-hana/"><i class="fa fa-caret-right"></i> Haruna Hana</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/mitani-akari/"><i class="fa fa-caret-right"></i> Mitani Akari</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/ootsuki-hibiki/"><i class="fa fa-caret-right"></i> Ootsuki Hibiki</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/uehara-ai/"><i class="fa fa-caret-right"></i> Uehara Ai</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/seina-arisa/"><i class="fa fa-caret-right"></i> Seina Arisa</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hachino-tsubasa/"><i class="fa fa-caret-right"></i> Hachino Tsubasa</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yayoi-mizuki/"><i class="fa fa-caret-right"></i> Yayoi Mizuki</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/kimijima-mio/"><i class="fa fa-caret-right"></i> Kimijima Mio</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar"><i class="fa fa-caret-right"></i> <strong>All Idols Av</strong></a></li>'
    + '    </ul></li>'
    + '    <li class="col-sm-4"><ul>'
    + '      <li class="dropdown-header" style="color: #000;">Newest Idols AV</li>'
    + '      <li class="divider"></li>'
    + '      <li><a href="https://javhdz.today/pornstar/kanade-miyu/" title="Kanade Miyu "><i class="fa fa-caret-right"></i> Kanade Miyu</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hana-arisu/" title="Hana Arisu "><i class="fa fa-caret-right"></i> Hana Arisu</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/kanamatsu-toho/" title="Kanamatsu Toho "><i class="fa fa-caret-right"></i> Kanamatsu Toho</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yu-sasamoto/" title="Yu Sasamoto "><i class="fa fa-caret-right"></i> Yu Sasamoto</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hanazato-akari/" title="Hanazato Akari "><i class="fa fa-caret-right"></i> Hanazato Akari</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yui-mita/" title="Yui Mita "><i class="fa fa-caret-right"></i> Yui Mita</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/riria-hido/" title="Riria Hido "><i class="fa fa-caret-right"></i> Riria Hido</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/marina-sina/" title="Marina Sina "><i class="fa fa-caret-right"></i> Marina Sina</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/rin-chibana/" title="Rin Chibana "><i class="fa fa-caret-right"></i> Rin Chibana</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yui-tsubaki/" title="Yui Tsubaki "><i class="fa fa-caret-right"></i> Yui Tsubaki</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yurina-shoji/" title="Yurina Shoji "><i class="fa fa-caret-right"></i> Yurina Shoji</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/nao-hayakawa/" title="Nao Hayakawa "><i class="fa fa-caret-right"></i> Nao Hayakawa</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hikari-mizusumi/" title="Hikari Mizusumi "><i class="fa fa-caret-right"></i> Hikari Mizusumi</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/saki-no-kanna/" title="Saki no Kanna "><i class="fa fa-caret-right"></i> Saki no Kanna</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yurina-momosaki/" title="Yurina Momosaki "><i class="fa fa-caret-right"></i> Yurina Momosaki</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hasmi-claire/" title="Hasmi Claire "><i class="fa fa-caret-right"></i> Hasmi Claire</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yui-higa/" title="Yui Higa "><i class="fa fa-caret-right"></i> Yui Higa</a></li>'
    + '    </ul></li>'
    + '    <li class="col-sm-4"><ul>'
    + '      <li class="dropdown-header" style="color: #000;">Most Popular Idols AV</li>'
    + '      <li class="divider"></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yumi-kazama/" title="Yumi Kazama "><i class="fa fa-caret-right"></i> Yumi Kazama</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yui-hatano/" title="Yui Hatano"><i class="fa fa-caret-right"></i> Yui Hatano</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hana-haruna/" title="Hana Haruna "><i class="fa fa-caret-right"></i> Hana Haruna</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/eimi-fukada/" title="Eimi Fukada "><i class="fa fa-caret-right"></i> Eimi Fukada</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/reiko-kobayakawa/" title="Reiko Kobayakawa "><i class="fa fa-caret-right"></i> Reiko Kobayakawa</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/asahi-mizuno/" title="Asahi Mizuno "><i class="fa fa-caret-right"></i> Asahi Mizuno</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/hitomi-tanaka/" title="Hitomi Tanaka "><i class="fa fa-caret-right"></i> Hitomi Tanaka</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/maria-nagai/" title="Maria Nagai "><i class="fa fa-caret-right"></i> Maria Nagai</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/ai-sayama/" title="Ai Sayama "><i class="fa fa-caret-right"></i> Ai Sayama</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/mako-oda/" title="Mako Oda "><i class="fa fa-caret-right"></i> Mako Oda</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/aimi-yoshikawa/" title="Aimi Yoshikawa "><i class="fa fa-caret-right"></i> Aimi Yoshikawa</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/mina-kitano/" title="Mina Kitano "><i class="fa fa-caret-right"></i> Mina Kitano</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/ai-uehara/" title="Ai Uehara "><i class="fa fa-caret-right"></i> Ai Uehara</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/anri-okita/" title="Anri Okita "><i class="fa fa-caret-right"></i> Anri Okita</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/kaho-shibuya/" title="Kaho Shibuya "><i class="fa fa-caret-right"></i> Kaho Shibuya</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yua-mikami/" title="Yua Mikami "><i class="fa fa-caret-right"></i> Yua Mikami</a></li>'
    + '      <li><a href="https://javhdz.today/pornstar/yu-shinoda/" title="Yu Shinoda"><i class="fa fa-caret-right"></i> Yu Shinoda</a></li>'
    + '    </ul></li>'
    + '  </ul>'
    + '</li>';

function getManifest() {
    return JSON.stringify({
        id: PLUGIN_CONFIG.id,
        name: PLUGIN_CONFIG.name,
        version: PLUGIN_CONFIG.version,
        baseUrl: PLUGIN_CONFIG.baseUrl,
        iconUrl: PLUGIN_CONFIG.iconUrl,
        isEnabled: PLUGIN_CONFIG.isEnabled,
        isAdult: PLUGIN_CONFIG.isAdult,
        type: PLUGIN_CONFIG.type,
        playerType: PLUGIN_CONFIG.playerType
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới cập nhật", slug: "recent" },
        { name: "Không Che", slug: "uncensored-jav" },
        { name: "Khử Che", slug: "reducing-mosaic" },
        { name: "Vietsub", slug: "jav-sub" },
        { name: "Nghiệp Dư", slug: "amateur" },
        { name: "Idols AV", slug: "pornstar" }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "popular/today", title: "Xem Nhiều Hôm Nay", type: "Horizontal", path: "" },
        { slug: "uncensored-jav", title: "Jav Uncensored", type: "Horizontal", path: "" },
        { slug: "reducing-mosaic", title: "Reducing Mosaic", type: "Horizontal", path: "" },
        { slug: "jav-sub", title: "Jav Sub", type: "Horizontal", path: "" },
        { slug: "recent", title: "Video Mới Cập Nhật", type: "Grid", path: "" }
    ]);
}

function getIdols() {
    return parseIdolsResponse(IDOLS_MENU_HTML);
}

function getFilterConfig() {
    var idolsList = [];
    try {
        var parsedIdols = JSON.parse(getIdols());
        for (var i = 0; i < parsedIdols.length; i++) {
            idolsList.push({
                name: parsedIdols[i].name,
                value: parsedIdols[i].slug
            });
        }
    } catch (e) {}

    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "recent" },
            { name: "Xem nhiều hôm nay", value: "popular/today" },
            { name: "Xem nhiều trong tuần", value: "popular/week" },
            { name: "Xem nhiều trong tháng", value: "popular/month" },
            { name: "Xem nhiều tất cả", value: "popular/year" },
            { name: "Nhiều lượt thích", value: "rated/year" }
        ],
        category: [
            { name: "Uncensored Jav", value: "uncensored-jav" },
            { name: "Reducing Mosaic", value: "reducing-mosaic" },
            { name: "Jav Sub", value: "jav-sub" },
            { name: "Chinese Sub", value: "chinese-subtitle" },
            { name: "Creampie", value: "creampie" },
            { name: "Big Tits", value: "big-tits" },
            { name: "Amateur", value: "amateur" },
            { name: "Married Woman", value: "married-woman" },
            { name: "Beautiful Girl", value: "beautiful-girl" },
            { name: "Mature Woman", value: "mature-woman" },
            { name: "Cuckold", value: "cuckold" },
            { name: "Squirting", value: "squirting" },
            { name: "Nasty", value: "nasty" },
            { name: "Hardcore", value: "hardcore" }
        ],
        idol: idolsList
    });
}

// =============================================================================
// URL GENERATION (STRICT ES5)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var base = PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "");
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    if (page < 1) page = 1;

    var sortPath = "";
    if (filters.sort && filters.sort !== "recent") {
        sortPath = String(filters.sort).replace(/^\/+|\/+$/g, "") + "/";
    }

    var targetSlug = slug || "recent";
    if (filters.idol) {
        targetSlug = filters.idol;
    } else if (filters.category) {
        targetSlug = filters.category;
    }

    var isBrowse = false;
    var browsePrefixes = ["recent", "popular", "rated", "discussed", "downloaded", "longest", "watched"];
    for (var i = 0; i < browsePrefixes.length; i++) {
        if (String(targetSlug).indexOf(browsePrefixes[i]) === 0) {
            isBrowse = true;
            break;
        }
    }

    var finalUrl = "";
    if (String(targetSlug).indexOf("http") === 0) {
        finalUrl = String(targetSlug).replace(/\/+$/, "") + "/";
    } else {
        var cleanSlug = String(targetSlug).replace(/^\/+|\/+$/g, "");
        var isPornstarRoute = cleanSlug.indexOf("pornstar") === 0;
        var appliedSort = isPornstarRoute ? "" : sortPath;
        finalUrl = base + "/" + cleanSlug + "/" + appliedSort;
    }

    var params = [isBrowse ? "ajax=browse_videos" : "ajax=1"];
    if (page > 1) {
        params.push("page=" + page);
    }

    var separator = finalUrl.indexOf("?") !== -1 ? "&" : "?";
    return finalUrl + separator + params.join("&");
}

function getUrlSearch(keyword, filtersJson) {
    var base = PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "");
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    if (page < 1) page = 1;

    var url = base + "/search/video/?s=" + encodeURIComponent(keyword || "") + "&ajax=1";
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    var base = PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "");
    var s = String(slug || "");
    if (s.indexOf("http") === 0) return s;
    if (s.indexOf("/") === 0) return base + s;
    return base + "/" + s;
}

function getUrlCategories() { return PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "") + "/categories/"; }
function getUrlIdols() { return PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "") + "/pornstar"; }
function getUrlCountries() { return PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "") + "/"; }
function getUrlYears() { return PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "") + "/"; }

// =============================================================================
// ES5 UTILITIES & PACKER DECODER
// =============================================================================

var B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var BASE62_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

var PluginUtils = {
    trim: function (str) {
        return String(str || "").replace(/^\s+|\s+$/g, "");
    },

    cleanText: function (text) {
        if (!text) return "";
        return PluginUtils.trim(
            String(text)
                .replace(/<[^>]*>/g, "")
                .replace(/&/g, "&")
                .replace(/"/g, '"')
                .replace(/'/g, "'")
                .replace(/ /g, " ")
                .replace(/\s+/g, " ")
        );
    },

    decodeBase64: function (input) {
        if (!input) return "";
        var clean = PluginUtils.trim(input).replace(/-/g, "+").replace(/_/g, "/");
        var padLen = clean.length % 4;
        if (padLen > 0) {
            var pads = "";
            for (var p = 0; p < 4 - padLen; p++) {
                pads += "=";
            }
            clean += pads;
        }

        try {
            if (typeof atob === "function") {
                return atob(clean);
            }
        } catch (e) {}

        var str = clean.replace(/=+$/, "");
        if (str.length % 4 === 1) return "";

        var output = "";
        var bc = 0;
        var bs = 0;
        var buffer = "";
        var idx = 0;

        while ((buffer = str.charAt(idx++)) !== "") {
            buffer = B64_CHARS.indexOf(buffer);
            if (~buffer) {
                bs = bc % 4 ? bs * 64 + buffer : buffer;
                if (bc++ % 4) {
                    output += String.fromCharCode(255 & (bs >> (-2 * bc & 6)));
                }
            }
        }
        return output;
    },

    getAttr: function (tagAttrs, attrName) {
        if (!tagAttrs || !attrName) return "";
        var re = new RegExp(attrName + '\\s*=\\s*(["\'])([\\s\\S]*?)\\1', "i");
        var m = String(tagAttrs).match(re);
        return m ? m[2] : "";
    },

    detectLanguage: function (text) {
        var t = String(text || "").toLowerCase();
        if (t.indexOf("vietsub") !== -1 || t.indexOf("viet sub") !== -1 || t.indexOf("jav-sub") !== -1) {
            return "Vietsub";
        }
        if (t.indexOf("chinese") !== -1 || t.indexOf("zh-sub") !== -1) {
            return "Chinese Sub";
        }
        if (t.indexOf("uncensored") !== -1 || t.indexOf("không che") !== -1) {
            return "Uncensored";
        }
        return "RAW / Nhật";
    },

    toBase: function (num, base) {
        var prefix = num < base ? "" : PluginUtils.toBase(parseInt(num / base, 10), base);
        var rem = num % base;
        var ch = rem > 35 ? String.fromCharCode(rem + 29) : BASE62_CHARS.charAt(rem);
        return prefix + ch;
    },

    unpackJs: function (html) {
        var match = String(html || "").match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]*?\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)/);
        if (!match) return "";

        var p = match[1];
        var a = parseInt(match[2], 10);
        var c = parseInt(match[3], 10);
        var k = match[4].split("|");
        if (!a || !c || !k.length) return "";

        var dict = {};
        while (c--) {
            var key = PluginUtils.toBase(c, a);
            dict[key] = k[c] || key;
        }

        return p.replace(/\b\w+\b/g, function (token) {
            return Object.prototype.hasOwnProperty.call(dict, token) ? dict[token] : token;
        });
    },

    extractStreamUrl: function (html) {
        var src = String(html || "");
        var unpacked = PluginUtils.unpackJs(src);
        var combined = unpacked ? (src + "\n" + unpacked) : src;

        var m3u8Match = combined.match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/i);
        if (m3u8Match) return m3u8Match[0];

        var mp4Match = combined.match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/i);
        if (mp4Match) return mp4Match[0];

        return "";
    }
};

// =============================================================================
// PARSERS (STRICT ES5)
// =============================================================================

function parseIdolsResponse(html) {
    var idolsMap = {};
    var idols = [];
    var srcHtml = html || "";

    var colRegex = /<li[^>]*class=["'][^"']*col-sm-4[^"']*["'][^>]*>([\s\S]*?)<\/li>\s*<\/ul>/gi;
    var colMatch = null;
    var matchedCols = false;

    while ((colMatch = colRegex.exec(srcHtml)) !== null) {
        matchedCols = true;
        var colBlock = colMatch[1];
        var headerMatch = colBlock.match(/<li[^>]*class=["'][^"']*dropdown-header[^"']*["'][^>]*>([\s\S]*?)<\/li>/i);
        var groupName = headerMatch ? PluginUtils.cleanText(headerMatch[1]) : "Idols AV";

        var linkRegex = /<a[^>]*href=["']([^"']*\/pornstar(?:\/[^"']*)?)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var linkMatch = null;
        while ((linkMatch = linkRegex.exec(colBlock)) !== null) {
            var rawHref = PluginUtils.trim(linkMatch[1]);
            var name = PluginUtils.cleanText(linkMatch[2]);
            var pathMatch = rawHref.match(/\/pornstar(?:\/([^"'/?#]+))?\/?$/i);
            if (pathMatch && name) {
                var slug = pathMatch[1] ? ("pornstar/" + pathMatch[1]) : "pornstar";
                if (!Object.prototype.hasOwnProperty.call(idolsMap, slug)) {
                    var item = {
                        name: name,
                        slug: slug,
                        group: groupName
                    };
                    idolsMap[slug] = item;
                    idols.push(item);
                }
            }
        }
    }

    if (!matchedCols && srcHtml) {
        var anyLinkRegex = /<a[^>]*href=["']([^"']*\/pornstar(?:\/[^"']*)?)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var anyMatch = null;
        while ((anyMatch = anyLinkRegex.exec(srcHtml)) !== null) {
            var rawHref2 = PluginUtils.trim(anyMatch[1]);
            var name2 = PluginUtils.cleanText(anyMatch[2]);
            var pathMatch2 = rawHref2.match(/\/pornstar(?:\/([^"'/?#]+))?\/?$/i);
            if (pathMatch2 && name2) {
                var slug2 = pathMatch2[1] ? ("pornstar/" + pathMatch2[1]) : "pornstar";
                if (!Object.prototype.hasOwnProperty.call(idolsMap, slug2)) {
                    var item2 = {
                        name: name2,
                        slug: slug2,
                        group: "Idols AV"
                    };
                    idolsMap[slug2] = item2;
                    idols.push(item2);
                }
            }
        }
    }

    return JSON.stringify(idols);
}

function parseListResponse(html) {
    var responseHtml = html || "";
    var paginationHtml = "";

    if (PluginUtils.trim(responseHtml).indexOf("{") === 0) {
        try {
            var data = JSON.parse(responseHtml);
            if (data && data.html) {
                responseHtml = data.html;
                if (data.pagination) {
                    paginationHtml = data.pagination;
                }
            }
        } catch (e) {}
    }

    var moviesMap = {};
    var parts = responseHtml.split(/<li[^>]*id=["']video-[^"']*["'][^>]*>/);

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var fullUrl = "";
        var title = "";

        var aRegex = /<a([^>]+)>/g;
        var aMatch = null;
        while ((aMatch = aRegex.exec(itemHtml)) !== null) {
            var attrs = aMatch[1];
            if (attrs.indexOf("thumbnail") !== -1) {
                fullUrl = PluginUtils.getAttr(attrs, "href");
                title = PluginUtils.getAttr(attrs, "title");
                break;
            }
        }

        var slug = fullUrl;
        if (slug && slug.indexOf("/") === 0) {
            slug = slug.substring(1);
        }

        var thumb = "";
        var imgMatch = itemHtml.match(/<img([^>]+)>/);
        if (imgMatch) {
            var imgAttrs = imgMatch[1];
            var dataSrc = PluginUtils.getAttr(imgAttrs, "data-src");
            var srcAttr = PluginUtils.getAttr(imgAttrs, "src");
            thumb = dataSrc || srcAttr || "";
        }

        if (slug) {
            var rawTitle = PluginUtils.cleanText(title);

            var durationMatch = itemHtml.match(/<span[^>]*class=["']video-overlay badge transparent["'][^>]*>([\s\S]*?)<\/span>/);
            var duration = durationMatch ? PluginUtils.cleanText(durationMatch[1]) : "";

            var codeMatch = itemHtml.match(/<span[^>]*class=["']video-overlay1 badge transparent["'][^>]*>([\s\S]*?)<\/span>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

            var labels = [];
            if (duration) labels.push(duration);
            if (code) labels.push(code);

            var labelText = labels.length ? labels.join(" | ") : "HD";
            var detectedLang = PluginUtils.detectLanguage(rawTitle + " " + slug);

            if (!Object.prototype.hasOwnProperty.call(moviesMap, slug)) {
                moviesMap[slug] = {
                    id: slug,
                    title: rawTitle || "Phim không tiêu đề",
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    year: 0,
                    quality: "HD",
                    episode_current: labelText,
                    lang: detectedLang
                };
            }
        }
    }

    var movies = [];
    for (var key in moviesMap) {
        if (Object.prototype.hasOwnProperty.call(moviesMap, key)) {
            movies.push(moviesMap[key]);
        }
    }

    var totalPages = 1;
    var currentPage = 1;

    var paginationSrc = paginationHtml || responseHtml;
    var pagNav = "";
    var paginationBlock = paginationSrc.match(/<ul[^>]*class="[^"]*pagination[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
    if (paginationBlock) {
        pagNav = paginationBlock[1];
    } else if (paginationHtml) {
        pagNav = paginationHtml;
    }

    if (pagNav) {
        var activeMatch = pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<a[^>]*>(\d+)<\/a>/i)
            || pagNav.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<span[^>]*>(\d+)<\/span>/i);
        if (activeMatch) {
            currentPage = parseInt(activeMatch[1], 10) || 1;
        }

        var pageLinks = pagNav.match(/href="[^"]*\/(\d+)\/?[^"]*"/g);
        if (pageLinks) {
            for (var j = 0; j < pageLinks.length; j++) {
                var pMatch = pageLinks[j].match(/\/(\d+)\/?"/);
                if (pMatch) {
                    var p = parseInt(pMatch[1], 10);
                    if (p > totalPages) totalPages = p;
                }
            }
        }

        var queryPageLinks = pagNav.match(/href="[^"]*(?:[?&]|&)page=(\d+)[^"]*"/g);
        if (queryPageLinks) {
            for (var m = 0; m < queryPageLinks.length; m++) {
                var qm = queryPageLinks[m].match(/(?:[?&]|&)page=(\d+)/);
                if (qm) {
                    var qp = parseInt(qm[1], 10);
                    if (qp > totalPages) totalPages = qp;
                }
            }
        }
    }

    if (totalPages <= 1) {
        var queryPages = paginationSrc.match(/(?:[?&]|&)page=(\d+)/g);
        if (queryPages) {
            for (var k = 0; k < queryPages.length; k++) {
                var qMatch = queryPages[k].match(/page=(\d+)/);
                if (qMatch) {
                    var qPage = parseInt(qMatch[1], 10);
                    if (qPage > totalPages) totalPages = qPage;
                }
            }
        }
    }

    return JSON.stringify({
        items: movies,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages || 1,
            totalItems: movies.length,
            itemsPerPage: 20
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var srcHtml = html || "";
        var titleMatch = srcHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        var descMatch = srcHtml.match(/<p[^>]*class=["']description["'][^>]*>([\s\S]*?)<\/p>/);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var servers = [];
        var btnRegex = /<button([^>]*class=["'][^"']*button_choice_server[^"']*["'][^>]*)>/gi;
        var btnMatch = null;
        var foundServer = false;

        while ((btnMatch = btnRegex.exec(srcHtml)) !== null) {
            var attrs = btnMatch[1];
            var b64url = PluginUtils.getAttr(attrs, "data-embed");
            var serverName = PluginUtils.cleanText(PluginUtils.getAttr(attrs, "data-name")) || "Server";
            var decodedUrl = PluginUtils.decodeBase64(b64url);

            if (decodedUrl) {
                foundServer = true;
                servers.push({
                    name: serverName,
                    episodes: [{
                        id: decodedUrl,
                        name: "Full",
                        slug: "full"
                    }]
                });
            }
        }

        if (!foundServer) {
            var mainPlayerStr = 'id="main-player"';
            var idxMain = srcHtml.indexOf(mainPlayerStr);
            if (idxMain !== -1) {
                var srcStr = 'src="';
                var idxSrc = srcHtml.indexOf(srcStr, idxMain);
                if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                    var startUrl = idxSrc + srcStr.length;
                    var endUrl = srcHtml.indexOf('"', startUrl);
                    if (endUrl !== -1) {
                        var embedUrl = srcHtml.substring(startUrl, endUrl);
                        servers.push({
                            name: "Embed Server",
                            episodes: [{
                                id: embedUrl,
                                name: "Full",
                                slug: "full"
                            }]
                        });
                        foundServer = true;
                    }
                }
            }
        }

        if (!foundServer) {
            var ultimateMatch = srcHtml.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(v|e|embed)\/[^"']+)["']/i);
            if (ultimateMatch) {
                servers.push({
                    name: "Default Embed",
                    episodes: [{
                        id: ultimateMatch[1],
                        name: "Full",
                        slug: "full"
                    }]
                });
            } else {
                servers.push({
                    name: "Unknown",
                    episodes: [{
                        id: "",
                        name: "Full",
                        slug: "full"
                    }]
                });
            }
        }

        var thumbMatch = srcHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        var codeMatch = srcHtml.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "Full";

        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["']fa fa-th-list["'][^>]*><\/i>([^<]+)<\/a>/g;
        var categoriesArr = [];
        var catMatch = null;
        while ((catMatch = categoryRegex.exec(srcHtml)) !== null) {
            categoriesArr.push(PluginUtils.cleanText(catMatch[2]));
        }

        var categoriesText = categoriesArr.join(", ");

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: description,
            servers: servers,
            quality: "HD",
            lang: PluginUtils.detectLanguage(title + " " + categoriesText),
            year: 0,
            rating: 0,
            casts: "",
            director: "",
            country: "",
            category: categoriesText,
            status: code
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, fallbackUrl) {
    var refererUrl = PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "") + "/";
    try {
        var hostUrl = fallbackUrl || "";
        var srcHtml = html || "";

        var mainPlayerStr = 'id="main-player"';
        var idxMain = srcHtml.indexOf(mainPlayerStr);
        if (idxMain !== -1) {
            var srcStr = 'src="';
            var idxSrc = srcHtml.indexOf(srcStr, idxMain);
            if (idxSrc !== -1 && idxSrc - idxMain < 500) {
                var startUrl = idxSrc + srcStr.length;
                var endUrl = srcHtml.indexOf('"', startUrl);
                if (endUrl !== -1) {
                    hostUrl = srcHtml.substring(startUrl, endUrl);
                }
            }
        }

        return JSON.stringify({
            url: hostUrl,
            headers: {
                "User-Agent": PLUGIN_CONFIG.userAgent,
                "Referer": refererUrl
            },
            subtitles: [],
            isEmbed: true,
            embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
        });
    } catch (e) {
        return JSON.stringify({
            url: fallbackUrl || "",
            headers: {
                "User-Agent": PLUGIN_CONFIG.userAgent,
                "Referer": refererUrl
            },
            subtitles: []
        });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    var refererUrl = PLUGIN_CONFIG.baseUrl.replace(/\/+$/, "") + "/";
    var extractedStream = PluginUtils.extractStreamUrl(html);
    var finalUrl = extractedStream || fallbackUrl || "";

    return JSON.stringify({
        url: finalUrl,
        headers: {
            "User-Agent": PLUGIN_CONFIG.userAgent,
            "Referer": fallbackUrl || refererUrl
        },
        subtitles: [],
        isEmbed: !extractedStream
    });
}

function parseCategoriesResponse(html) {
    var categories = [];
    var parts = (html || "").split(/<li[^>]*id=["']category-[^"']*["'][^>]*>/);
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var linkMatch = itemHtml.match(/href=["']\/([^"']+)[\/]?["']/);
        var nameMatch = itemHtml.match(/<div[^>]*class=["']category-title["'][^>]*>([\s\S]*?)<\/div>/);

        if (linkMatch && nameMatch) {
            var slug = linkMatch[1];
            if (slug.charAt(slug.length - 1) === "/") {
                slug = slug.substring(0, slug.length - 1);
            }
            var name = PluginUtils.cleanText(nameMatch[1]);
            categories.push({
                name: name,
                slug: slug
            });
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
