// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhdz.today";
var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Poster dự phòng khi trang danh sách idols hoặc mục menu không có thẻ <img>
var DEFAULT_IDOL_POSTER = BASE_URL + "/favicon.ico";

// Tùy chọn bảng poster theo slug idol (vd: "pornstar/hatano-yui": "https://...")
var IDOL_POSTERS = {
    "pornstar/hatano-yui": "",
    "pornstar/aika": "",
    "pornstar/hasumi-kurea": "",
    "pornstar/iioka-kanako": "",
    "pornstar/nagisa-mitsuki": "",
    "pornstar/shinoda-yuu": "",
    "pornstar/matsumoto-ichika": "",
    "pornstar/hamasaki-mao": "",
    "pornstar/haruna-hana": "",
    "pornstar/mitani-akari": "",
    "pornstar/ootsuki-hibiki": "",
    "pornstar/uehara-ai": "",
    "pornstar/seina-arisa": "",
    "pornstar/hachino-tsubasa": "",
    "pornstar/yayoi-mizuki": "",
    "pornstar/kimijima-mio": "",
    "pornstar/kanade-miyu": "",
    "pornstar/hana-arisu": "",
    "pornstar/kanamatsu-toho": "",
    "pornstar/yu-sasamoto": "",
    "pornstar/hanazato-akari": "",
    "pornstar/yui-mita": "",
    "pornstar/riria-hido": "",
    "pornstar/marina-sina": "",
    "pornstar/rin-chibana": "",
    "pornstar/yui-tsubaki": "",
    "pornstar/yurina-shoji": "",
    "pornstar/nao-hayakawa": "",
    "pornstar/hikari-mizusumi": "",
    "pornstar/saki-no-kanna": "",
    "pornstar/yurina-momosaki": "",
    "pornstar/hasmi-claire": "",
    "pornstar/yui-higa": "",
    "pornstar/yumi-kazama": "",
    "pornstar/yui-hatano": "",
    "pornstar/hana-haruna": "",
    "pornstar/eimi-fukada": "",
    "pornstar/reiko-kobayakawa": "",
    "pornstar/asahi-mizuno": "",
    "pornstar/hitomi-tanaka": "",
    "pornstar/maria-nagai": "",
    "pornstar/ai-sayama": "",
    "pornstar/mako-oda": "",
    "pornstar/aimi-yoshikawa": "",
    "pornstar/mina-kitano": "",
    "pornstar/ai-uehara": "",
    "pornstar/anri-okita": "",
    "pornstar/kaho-shibuya": "",
    "pornstar/yua-mikami": "",
    "pornstar/yu-shinoda": ""
};

var IDOLS_MENU_HTML = [
    '<li class="dropdown dropdown-large">',
    '  <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-star"></i> Idols Av<b class="caret"></b></a>',
    '  <ul class="dropdown-menu dropdown-menu-large row">',
    '    <li class="col-sm-4"><ul>',
    '      <li class="dropdown-header" style="color: #000;">Top Idols</li><li class="divider"></li>',
    '      <li><a href="https://javhdz.today/pornstar/hatano-yui/"><i class="fa fa-caret-right"></i> Hatano Yui</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/aika/"><i class="fa fa-caret-right"></i> Aika</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hasumi-kurea/"><i class="fa fa-caret-right"></i> Hasumi Kurea</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/iioka-kanako/"><i class="fa fa-caret-right"></i> Iioka Kanako</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/nagisa-mitsuki/"><i class="fa fa-caret-right"></i> Nagisa Mitsuki</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/shinoda-yuu/"><i class="fa fa-caret-right"></i> Shinoda Yuu</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/matsumoto-ichika/"><i class="fa fa-caret-right"></i> Matsumoto Ichika</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hamasaki-mao/"><i class="fa fa-caret-right"></i> Hamasaki Mao</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/haruna-hana/"><i class="fa fa-caret-right"></i> Haruna Hana</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/mitani-akari/"><i class="fa fa-caret-right"></i> Mitani Akari</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/ootsuki-hibiki/"><i class="fa fa-caret-right"></i> Ootsuki Hibiki</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/uehara-ai/"><i class="fa fa-caret-right"></i> Uehara Ai</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/seina-arisa/"><i class="fa fa-caret-right"></i> Seina Arisa</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hachino-tsubasa/"><i class="fa fa-caret-right"></i> Hachino Tsubasa</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yayoi-mizuki/"><i class="fa fa-caret-right"></i> Yayoi Mizuki</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/kimijima-mio/"><i class="fa fa-caret-right"></i> Kimijima Mio</a></li>',
    '      <li><a href="https://javhdz.today/pornstar"><i class="fa fa-caret-right"></i> <strong>All Idols Av</strong></a></li>',
    '    </ul></li>',
    '    <li class="col-sm-4"><ul>',
    '      <li class="dropdown-header" style="color: #000;">Newest Idols AV</li><li class="divider"></li>',
    '      <li><a href="https://javhdz.today/pornstar/kanade-miyu/" title="Kanade Miyu "><i class="fa fa-caret-right"></i> Kanade Miyu</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hana-arisu/" title="Hana Arisu "><i class="fa fa-caret-right"></i> Hana Arisu</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/kanamatsu-toho/" title="Kanamatsu Toho "><i class="fa fa-caret-right"></i> Kanamatsu Toho</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yu-sasamoto/" title="Yu Sasamoto "><i class="fa fa-caret-right"></i> Yu Sasamoto</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hanazato-akari/" title="Hanazato Akari "><i class="fa fa-caret-right"></i> Hanazato Akari</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yui-mita/" title="Yui Mita "><i class="fa fa-caret-right"></i> Yui Mita</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/riria-hido/" title="Riria Hido "><i class="fa fa-caret-right"></i> Riria Hido</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/marina-sina/" title="Marina Sina "><i class="fa fa-caret-right"></i> Marina Sina</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/rin-chibana/" title="Rin Chibana "><i class="fa fa-caret-right"></i> Rin Chibana</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yui-tsubaki/" title="Yui Tsubaki "><i class="fa fa-caret-right"></i> Yui Tsubaki</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yurina-shoji/" title="Yurina Shoji "><i class="fa fa-caret-right"></i> Yurina Shoji</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/nao-hayakawa/" title="Nao Hayakawa "><i class="fa fa-caret-right"></i> Nao Hayakawa</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hikari-mizusumi/" title="Hikari Mizusumi "><i class="fa fa-caret-right"></i> Hikari Mizusumi</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/saki-no-kanna/" title="Saki no Kanna "><i class="fa fa-caret-right"></i> Saki no Kanna</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yurina-momosaki/" title="Yurina Momosaki "><i class="fa fa-caret-right"></i> Yurina Momosaki</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hasmi-claire/" title="Hasmi Claire "><i class="fa fa-caret-right"></i> Hasmi Claire</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yui-higa/" title="Yui Higa "><i class="fa fa-caret-right"></i> Yui Higa</a></li>',
    '    </ul></li>',
    '    <li class="col-sm-4"><ul>',
    '      <li class="dropdown-header" style="color: #000;">Most Popular Idols AV</li><li class="divider"></li>',
    '      <li><a href="https://javhdz.today/pornstar/yumi-kazama/" title="Yumi Kazama "><i class="fa fa-caret-right"></i> Yumi Kazama</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yui-hatano/" title="Yui Hatano"><i class="fa fa-caret-right"></i> Yui Hatano</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hana-haruna/" title="Hana Haruna "><i class="fa fa-caret-right"></i> Hana Haruna</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/eimi-fukada/" title="Eimi Fukada "><i class="fa fa-caret-right"></i> Eimi Fukada</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/reiko-kobayakawa/" title="Reiko Kobayakawa "><i class="fa fa-caret-right"></i> Reiko Kobayakawa</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/asahi-mizuno/" title="Asahi Mizuno "><i class="fa fa-caret-right"></i> Asahi Mizuno</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/hitomi-tanaka/" title="Hitomi Tanaka "><i class="fa fa-caret-right"></i> Hitomi Tanaka</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/maria-nagai/" title="Maria Nagai "><i class="fa fa-caret-right"></i> Maria Nagai</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/ai-sayama/" title="Ai Sayama "><i class="fa fa-caret-right"></i> Ai Sayama</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/mako-oda/" title="Mako Oda "><i class="fa fa-caret-right"></i> Mako Oda</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/aimi-yoshikawa/" title="Aimi Yoshikawa "><i class="fa fa-caret-right"></i> Aimi Yoshikawa</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/mina-kitano/" title="Mina Kitano "><i class="fa fa-caret-right"></i> Mina Kitano</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/ai-uehara/" title="Ai Uehara "><i class="fa fa-caret-right"></i> Ai Uehara</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/anri-okita/" title="Anri Okita "><i class="fa fa-caret-right"></i> Anri Okita</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/kaho-shibuya/" title="Kaho Shibuya "><i class="fa fa-caret-right"></i> Kaho Shibuya</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yua-mikami/" title="Yua Mikami "><i class="fa fa-caret-right"></i> Yua Mikami</a></li>',
    '      <li><a href="https://javhdz.today/pornstar/yu-shinoda/" title="Yu Shinoda"><i class="fa fa-caret-right"></i> Yu Shinoda</a></li>',
    '    </ul></li>',
    '  </ul>',
    '</li>'
].join("\n");

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.2.1",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay"
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'recent' },
        { name: 'Không Che', slug: 'uncensored-jav' },
        { name: 'Khử Che', slug: 'reducing-mosaic' },
        { name: 'Vietsub', slug: 'jav-sub' },
        { name: 'Nghiệp Dư', slug: 'amateur' },
        { name: 'Idols AV', slug: 'pornstar' }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'popular/today', title: 'Xem Nhiều Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'uncensored-jav', title: 'Jav Uncensored', type: 'Horizontal', path: '' },
        { slug: 'reducing-mosaic', title: 'Reducing Mosaic', type: 'Horizontal', path: '' },
        { slug: 'jav-sub', title: 'Jav Sub', type: 'Horizontal', path: '' },
        { slug: 'pornstar', title: 'Idols AV', type: 'Horizontal', path: '' },
        { slug: 'recent', title: 'Video Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getIdolPosterUrl(slug, htmlPoster) {
    if (htmlPoster) {
        return PluginUtils.normalizeUrl(htmlPoster);
    }
    if (slug && IDOL_POSTERS && IDOL_POSTERS[slug]) {
        return PluginUtils.normalizeUrl(IDOL_POSTERS[slug]);
    }
    return DEFAULT_IDOL_POSTER;
}

function parseIdolsMenuHtml(html) {
    var src = html || IDOLS_MENU_HTML;
    var items = [];
    var seen = {};

    var colParts = src.split(/<li[^>]*class=["'][^"']*col-sm-4[^"']*["'][^>]*>/i);
    for (var c = 1; c < colParts.length; c++) {
        var colHtml = colParts[c];
        var headerMatch = colHtml.match(/<li[^>]*class=["'][^"']*dropdown-header[^"']*["'][^>]*>([\s\S]*?)<\/li>/i);
        var groupName = headerMatch ? PluginUtils.cleanText(headerMatch[1]) : ("Group " + c);

        var linkRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = linkRegex.exec(colHtml)) !== null) {
            var attrs = m[1];
            var innerHtml = m[2];
            var href = PluginUtils.extractAttr(attrs, "href");
            if (!href || href.indexOf("pornstar") === -1) continue;

            var slug = href
                .replace(/^https?:\/\/[^/]+/i, "")
                .replace(/^\/+|\/+$/g, "");
            if (!slug || slug === "pornstar") continue;

            var titleAttr = PluginUtils.extractAttr(attrs, "title");
            var labelText = PluginUtils.cleanText(titleAttr || innerHtml);
            if (!labelText) continue;

            var imgInLink = innerHtml.match(/<img\b[^>]*>/i);
            var rawImg = imgInLink ? (PluginUtils.extractAttr(imgInLink[0], "data-src") || PluginUtils.extractAttr(imgInLink[0], "src")) : "";
            var poster = getIdolPosterUrl(slug, rawImg);

            if (!seen[slug]) {
                seen[slug] = true;
                items.push({
                    id: slug,
                    name: labelText,
                    title: labelText,
                    value: slug,
                    slug: slug,
                    url: BASE_URL + "/" + slug + "/",
                    group: groupName,
                    posterUrl: poster,
                    backdropUrl: poster,
                    thumb: poster
                });
            }
        }
    }

    return items;
}

function getIdolsList() {
    return JSON.stringify(parseIdolsMenuHtml(IDOLS_MENU_HTML));
}

function getIdolsPosterPage(pageNum) {
    var page = parseInt(pageNum, 10) || 1;
    var perPage = 20;
    var allIdols = parseIdolsMenuHtml(IDOLS_MENU_HTML);
    var totalPages = Math.max(1, Math.ceil(allIdols.length / perPage));
    var safePage = Math.min(Math.max(1, page), totalPages);
    var start = (safePage - 1) * perPage;
    var end = Math.min(start + perPage, allIdols.length);

    var pageItems = [];
    for (var i = start; i < end; i++) {
        var idol = allIdols[i];
        pageItems.push({
            id: idol.slug,
            title: idol.name,
            name: idol.name,
            slug: idol.slug,
            url: idol.url,
            group: idol.group,
            posterUrl: idol.posterUrl,
            backdropUrl: idol.backdropUrl,
            year: 0,
            quality: "HD",
            episode_current: idol.group,
            lang: "Idol AV"
        });
    }

    return JSON.stringify({
        items: pageItems,
        pagination: {
            currentPage: safePage,
            totalPages: totalPages,
            totalItems: allIdols.length,
            itemsPerPage: perPage
        }
    });
}

function getFilterConfig() {
    var rawIdols = parseIdolsMenuHtml(IDOLS_MENU_HTML);
    var idolFilters = [];
    for (var i = 0; i < rawIdols.length; i++) {
        idolFilters.push({
            name: rawIdols[i].name + " (" + rawIdols[i].group + ")",
            value: rawIdols[i].value,
            posterUrl: rawIdols[i].posterUrl
        });
    }

    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'recent' },
            { name: 'Xem nhiều hôm nay', value: 'popular/today' },
            { name: 'Xem nhiều trong tuần', value: 'popular/week' },
            { name: 'Xem nhiều trong tháng', value: 'popular/month' },
            { name: 'Xem nhiều tất cả', value: 'popular/year' },
            { name: 'Nhiều lượt thích', value: 'rated/year' }
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
        idol: idolFilters
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    var sortPath = (filters.sort && filters.sort !== 'recent') ? (String(filters.sort).replace(/^\/+|\/+$/g, '') + '/') : '';

    var chosenSlug = filters.idol || filters.category || slug || 'recent';
    var normalizedTarget = String(chosenSlug).replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+|\/+$/g, '');

    var isPornstarRoot = (normalizedTarget === "pornstar");
    var isPornstarDetail = (normalizedTarget.indexOf("pornstar/") === 0);
    var isBrowse = false;
    var browsePrefixes = ['recent', 'popular', 'rated', 'discussed', 'downloaded', 'longest', 'watched'];
    for (var i = 0; i < browsePrefixes.length; i++) {
        if (normalizedTarget.indexOf(browsePrefixes[i]) === 0) {
            isBrowse = true;
            break;
        }
    }

    var finalUrl = "";
    if (String(chosenSlug).indexOf("http") === 0) {
        finalUrl = String(chosenSlug).replace(/\/+$/, '') + '/';
    } else if (!normalizedTarget || normalizedTarget === 'recent') {
        finalUrl = BASE_URL + "/recent/" + sortPath;
    } else if (isPornstarRoot || isPornstarDetail) {
        finalUrl = BASE_URL + "/" + normalizedTarget + "/";
    } else {
        finalUrl = BASE_URL + "/" + normalizedTarget + "/" + sortPath;
    }

    var params = [];
    if (!isPornstarRoot && !isPornstarDetail) {
        params.push(isBrowse ? "ajax=browse_videos" : "ajax=1");
    }
    if (page > 1) {
        params.push("page=" + page);
    }

    if (params.length === 0) {
        return finalUrl;
    }
    var separator = (finalUrl.indexOf('?') !== -1) ? '&' : '?';
    return finalUrl + separator + params.join('&');
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = parseInt(filters.page, 10) || 1;
    var url = BASE_URL + "/search/video/?s=" + encodeURIComponent(keyword || "") + "&ajax=1";
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    var s = String(slug).replace(/^\s+|\s+$/g, "");
    if (s.indexOf("http") === 0) return s;
    if (s.indexOf("/") === 0) return BASE_URL + s;
    return BASE_URL + "/" + s;
}

function getUrlCategories() { return BASE_URL + "/categories/"; }
function getUrlCountries() { return BASE_URL + "/"; }
function getUrlYears() { return BASE_URL + "/"; }

// =============================================================================
// UTILITIES & PARSERS
// =============================================================================

var PluginUtils = {
    trimStr: function (s) {
        if (s === null || s === undefined) return "";
        return String(s).replace(/^\s+|\s+$/g, "");
    },

    cleanText: function (text) {
        if (!text) return "";
        return PluginUtils.trimStr(
            String(text)
                .replace(/<[^>]*>/g, "")
                .replace(/&/g, "&")
                .replace(/"/g, '"')
                .replace(/'|'/g, "'")
                .replace(/</g, "<")
                .replace(/>/g, ">")
                .replace(/–/g, "-")
                .replace(/—/g, "--")
                .replace(/‘|’/g, "'")
                .replace(/“|”/g, '"')
                .replace(/…/g, "...")
                .replace(/ /g, " ")
                .replace(/&#(\d+);/g, function (_, code) {
                    var num = parseInt(code, 10);
                    return isNaN(num) ? "" : String.fromCharCode(num);
                })
                .replace(/\s+/g, " ")
        );
    },

    normalizeUrl: function (url) {
        if (!url) return "";
        var u = PluginUtils.trimStr(url);
        if (!u) return "";
        if (u.indexOf("//") === 0) return "https:" + u;
        if (u.indexOf("http") === 0) return u;
        if (u.indexOf("/") === 0) return BASE_URL + u;
        return BASE_URL + "/" + u;
    },

    decodeBase64: function (input) {
        if (!input) return "";
        var b64url = String(input).replace(/\s+/g, '');
        if (!b64url) return "";
        try {
            if (typeof atob === 'function') {
                return atob(b64url);
            }
        } catch (e) { }

        var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var decodedUrl = "";
        var str = b64url.replace(/=+$/, '');
        if (str.length % 4 === 1) return "";

        for (var bc = 0, bs, buffer, idx = 0; (buffer = str.charAt(idx++)); ) {
            buffer = b64chars.indexOf(buffer);
            if (~buffer) {
                bs = bc % 4 ? bs * 64 + buffer : buffer;
                if (bc++ % 4) {
                    decodedUrl += String.fromCharCode(255 & bs >> (-2 * bc & 6));
                }
            }
        }
        return decodedUrl;
    },

    extractAttr: function (tagHtml, attrName) {
        if (!tagHtml || !attrName) return "";
        var re = new RegExp(attrName + "\\s*=\\s*([\"'])([\\s\\S]*?)\\1", "i");
        var m = tagHtml.match(re);
        return m ? PluginUtils.trimStr(m[2]) : "";
    }
};

function isLikelyUrl(val) {
    if (!val) return false;
    var s = PluginUtils.trimStr(val);
    return (
        s.indexOf("http://") === 0 ||
        s.indexOf("https://") === 0 ||
        s.indexOf("//") === 0 ||
        s.indexOf("/") === 0
    );
}

function unescapeStreamUrl(url) {
    if (!url) return "";
    return PluginUtils.trimStr(
        String(url)
            .replace(/\\\//g, "/")
            .replace(/\\u002F/gi, "/")
            .replace(/&/g, "&")
    );
}

function extractStreamFromHtml(html) {
    var src = (html === null || html === undefined) ? "" : String(html);
    if (!src) return "";

    var normalized = unescapeStreamUrl(src);

    var m3u8Match = normalized.match(/(?:https?:)?\/\/[^\s"'<>\\]+\.m3u8(?:[^\s"'<>\\]*)?/i);
    if (m3u8Match && m3u8Match[0]) {
        return PluginUtils.normalizeUrl(m3u8Match[0]);
    }

    var mp4Match = normalized.match(/(?:https?:)?\/\/[^\s"'<>\\]+\.mp4(?:[^\s"'<>\\]*)?/i);
    if (mp4Match && mp4Match[0]) {
        return PluginUtils.normalizeUrl(mp4Match[0]);
    }

    var varMatch = normalized.match(/(?:file|src|source|hls|url)\s*[:=]\s*["']((?:https?:)?\/\/[^"'\s<>]+(?:\.m3u8|\.mp4)[^"'\s<>]*)["']/i);
    if (varMatch && varMatch[1]) {
        return PluginUtils.normalizeUrl(varMatch[1]);
    }

    return "";
}

function parseIdolsPosterPageHtml(html) {
    var src = (html === null || html === undefined) ? "" : String(html);
    var items = [];
    var seen = {};

    // Tách theo khối thẻ <li ...> hoặc <div ...> chứa link /pornstar/<slug>
    var blocks = src.split(/<(?:li|div)\b[^>]*>/i);
    for (var i = 0; i < blocks.length; i++) {
        var blk = blocks[i];
        if (blk.indexOf("/pornstar/") === -1) continue;

        var linkMatch = blk.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);
        if (!linkMatch) continue;

        var href = PluginUtils.extractAttr(linkMatch[1], "href");
        if (!href || href.indexOf("/pornstar/") === -1) continue;

        var slug = href.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+|\/+$/g, "");
        if (!slug || slug === "pornstar" || seen[slug]) continue;

        var imgMatch = blk.match(/<img\b([^>]*)>/i);
        var rawThumb = "";
        var altText = "";
        if (imgMatch) {
            rawThumb = PluginUtils.extractAttr(imgMatch[1], "data-src") ||
                PluginUtils.extractAttr(imgMatch[1], "data-lazy-src") ||
                PluginUtils.extractAttr(imgMatch[1], "src");
            altText = PluginUtils.extractAttr(imgMatch[1], "alt");
        }

        var name = PluginUtils.cleanText(
            PluginUtils.extractAttr(linkMatch[1], "title") ||
            altText ||
            linkMatch[2]
        );
        if (!name) continue;

        seen[slug] = true;
        var poster = getIdolPosterUrl(slug, rawThumb);
        items.push({
            id: slug,
            title: name,
            name: name,
            slug: slug,
            url: BASE_URL + "/" + slug + "/",
            posterUrl: poster,
            backdropUrl: poster,
            year: 0,
            quality: "HD",
            episode_current: "Idol AV",
            lang: "Idol AV"
        });
    }

    // Fallback nếu trang idols chỉ có danh sách link/menu mà không có poster riêng
    if (items.length === 0) {
        var menuIdols = parseIdolsMenuHtml(src || IDOLS_MENU_HTML);
        for (var k = 0; k < menuIdols.length; k++) {
            var mIdol = menuIdols[k];
            if (!seen[mIdol.slug]) {
                seen[mIdol.slug] = true;
                items.push({
                    id: mIdol.slug,
                    title: mIdol.name,
                    name: mIdol.name,
                    slug: mIdol.slug,
                    url: mIdol.url,
                    posterUrl: mIdol.posterUrl,
                    backdropUrl: mIdol.backdropUrl,
                    year: 0,
                    quality: "HD",
                    episode_current: mIdol.group || "Idol AV",
                    lang: "Idol AV"
                });
            }
        }
    }

    return items;
}

function parseListResponse(html) {
    var responseHtml = (html === null || html === undefined) ? "" : String(html);
    var paginationHtml = "";

    var trimmed = PluginUtils.trimStr(responseHtml);
    if (trimmed.indexOf('{') === 0) {
        try {
            var data = JSON.parse(trimmed);
            if (data && typeof data.html === "string") {
                responseHtml = data.html;
                if (data.pagination) {
                    paginationHtml = String(data.pagination);
                }
            }
        } catch (e) { }
    }

    var moviesMap = {};
    var parts = responseHtml.split(/<li[^>]*id=["']video-[^"']*["'][^>]*>/i);

    if (parts.length <= 1) {
        parts = responseHtml.split(/<(?:li|div)[^>]*(?:id=["']video-[^"']*["']|class=["'][^"']*video-item[^"']*["'])[^>]*>/i);
    }

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var fullUrl = "";
        var title = "";

        var aRegex = /<a\b([^>]*)>/gi;
        var aMatch;
        while ((aMatch = aRegex.exec(itemHtml)) !== null) {
            var attrs = aMatch[1];
            if (attrs.indexOf('thumbnail') !== -1 || !fullUrl) {
                var hrefVal = PluginUtils.extractAttr(attrs, "href");
                var titleVal = PluginUtils.extractAttr(attrs, "title");
                if (attrs.indexOf('thumbnail') !== -1) {
                    fullUrl = hrefVal;
                    title = titleVal;
                    break;
                }
                if (!fullUrl && hrefVal && hrefVal.indexOf("/video") !== -1) {
                    fullUrl = hrefVal;
                    if (!title) title = titleVal;
                }
            }
        }

        var slug = fullUrl;
        if (slug) {
            slug = slug.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/, '');
        }

        var thumb = "";
        var imgMatch = itemHtml.match(/<img\b([^>]*)>/i);
        if (imgMatch) {
            var imgAttrs = imgMatch[1];
            var dataSrc = PluginUtils.extractAttr(imgAttrs, "data-src") || PluginUtils.extractAttr(imgAttrs, "data-lazy-src");
            var src = PluginUtils.extractAttr(imgAttrs, "src");
            thumb = PluginUtils.normalizeUrl(dataSrc || src);
        }

        if (slug) {
            var rawTitle = PluginUtils.cleanText(title);
            if (!rawTitle) {
                var altMatch = itemHtml.match(/<img\b[^>]*alt=["']([^"']*)["']/i);
                rawTitle = PluginUtils.cleanText(altMatch ? altMatch[1] : "");
            }

            var durationMatch = itemHtml.match(/<span[^>]*class=["'][^"']*video-overlay\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var duration = durationMatch ? PluginUtils.cleanText(durationMatch[1]) : "";

            var codeMatch = itemHtml.match(/<span[^>]*class=["'][^"']*video-overlay1\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";

            var labels = [];
            if (duration) labels.push(duration);
            if (code) labels.push(code);
            var labelText = labels.join(" | ") || "HD";

            if (!moviesMap[slug]) {
                moviesMap[slug] = {
                    id: slug,
                    title: rawTitle || "Phim không tiêu đề",
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    year: 0,
                    quality: "HD",
                    episode_current: labelText,
                    lang: "Vietsub"
                };
            }
        }
    }

    var movies = [];
    for (var key in moviesMap) {
        if (moviesMap.hasOwnProperty(key)) {
            movies.push(moviesMap[key]);
        }
    }

    // Nếu không có thẻ video-* nhưng có danh sách idol (/pornstar/...), chuyển sang parse trang idols poster
    if (movies.length === 0 && responseHtml.indexOf("/pornstar/") !== -1) {
        movies = parseIdolsPosterPageHtml(responseHtml);
    }

    var totalPages = 1;
    var currentPage = 1;
    var paginationSrc = paginationHtml || responseHtml;
    var pagNav = "";

    var paginationBlock = paginationSrc.match(/<ul[^>]*class=["'][^"']*pagination[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i);
    if (paginationBlock) {
        pagNav = paginationBlock[1];
    } else if (paginationHtml) {
        pagNav = paginationHtml;
    }

    if (pagNav) {
        var activeMatch = pagNav.match(/<li[^>]*class=["'][^"']*active[^"']*["'][^>]*>\s*<(?:a|span)[^>]*>(\d+)<\/(?:a|span)>/i);
        if (activeMatch) {
            currentPage = parseInt(activeMatch[1], 10) || 1;
        }

        var pageLinks = pagNav.match(/href=["'][^"']*\/(\d+)\/?(?:[?#][^"']*)?["']/gi);
        if (pageLinks) {
            for (var j = 0; j < pageLinks.length; j++) {
                var pMatch = pageLinks[j].match(/\/(\d+)\/?(?:[?#]|["'])/);
                if (pMatch) {
                    var p = parseInt(pMatch[1], 10);
                    if (!isNaN(p) && p > totalPages) totalPages = p;
                }
            }
        }

        var queryPageLinks = pagNav.match(/href=["'][^"']*(?:[?&]|&)page=(\d+)[^"']*["']/gi);
        if (queryPageLinks) {
            for (var k = 0; k < queryPageLinks.length; k++) {
                var qMatch = queryPageLinks[k].match(/(?:[?&]|&)page=(\d+)/i);
                if (qMatch) {
                    var qp = parseInt(qMatch[1], 10);
                    if (!isNaN(qp) && qp > totalPages) totalPages = qp;
                }
            }
        }
    }

    if (totalPages <= 1) {
        var fallbackPages = paginationSrc.match(/(?:[?&]|&)page=(\d+)/gi);
        if (fallbackPages) {
            for (var m = 0; m < fallbackPages.length; m++) {
                var fMatch = fallbackPages[m].match(/page=(\d+)/i);
                if (fMatch) {
                    var fp = parseInt(fMatch[1], 10);
                    if (!isNaN(fp) && fp > totalPages) totalPages = fp;
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
        var srcHtml = (html === null || html === undefined) ? "" : String(html);
        var titleMatch = srcHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        var descMatch = srcHtml.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        var servers = [];
        var buttonRegex = /<button\b([^>]*)>/gi;
        var btnMatch;
        var foundServer = false;

        while ((btnMatch = buttonRegex.exec(srcHtml)) !== null) {
            var btnAttrs = btnMatch[1];
            var cls = PluginUtils.extractAttr(btnAttrs, "class");
            if (cls.indexOf("button_choice_server") !== -1) {
                var rawEmbed = PluginUtils.extractAttr(btnAttrs, "data-embed");
                var serverName = PluginUtils.cleanText(PluginUtils.extractAttr(btnAttrs, "data-name")) || ("Server " + (servers.length + 1));

                var decoded = PluginUtils.decodeBase64(rawEmbed);
                var candidate = isLikelyUrl(decoded) ? decoded : (isLikelyUrl(rawEmbed) ? rawEmbed : decoded);
                var finalServerUrl = PluginUtils.normalizeUrl(unescapeStreamUrl(candidate));

                if (finalServerUrl) {
                    foundServer = true;
                    servers.push({
                        name: serverName,
                        episodes: [{
                            id: finalServerUrl,
                            name: "Full",
                            slug: "full"
                        }]
                    });
                }
            }
        }

        if (!foundServer) {
            var mainPlayerStr = 'id="main-player"';
            var idxMain = srcHtml.indexOf(mainPlayerStr);
            if (idxMain === -1) idxMain = srcHtml.indexOf("id='main-player'");
            if (idxMain !== -1) {
                var snippet = srcHtml.substring(idxMain, Math.min(srcHtml.length, idxMain + 800));
                var srcAttr = PluginUtils.extractAttr(snippet, "src") || PluginUtils.extractAttr(snippet, "data-src");
                if (srcAttr) {
                    servers.push({
                        name: "Embed Server",
                        episodes: [{
                            id: PluginUtils.normalizeUrl(unescapeStreamUrl(srcAttr)),
                            name: "Full",
                            slug: "full"
                        }]
                    });
                    foundServer = true;
                }
            }
        }

        if (!foundServer) {
            var directStream = extractStreamFromHtml(srcHtml);
            if (directStream) {
                servers.push({
                    name: "Direct Stream",
                    episodes: [{
                        id: directStream,
                        name: "Full",
                        slug: "full"
                    }]
                });
                foundServer = true;
            }
        }

        if (!foundServer) {
            var ultimateMatch = srcHtml.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i) ||
                srcHtml.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(?:v|e|embed|player|play)\/[^"']+)["']/i);
            if (ultimateMatch && ultimateMatch[1]) {
                servers.push({
                    name: "Default Embed",
                    episodes: [{
                        id: PluginUtils.normalizeUrl(unescapeStreamUrl(ultimateMatch[1])),
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

        var thumbMatch = srcHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var thumb = thumbMatch ? PluginUtils.normalizeUrl(thumbMatch[1]) : "";

        var codeMatch = srcHtml.match(/Label:\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "Full";

        var categoryRegex = /<a[^>]*href=["']\/([^"']+)["'][^>]*><i[^>]*class=["'][^"']*fa-th-list[^"']*["'][^>]*><\/i>([\s\S]*?)<\/a>/gi;
        var categoriesArr = [];
        var catMatch;
        while ((catMatch = categoryRegex.exec(srcHtml)) !== null) {
            var catName = PluginUtils.cleanText(catMatch[2]);
            if (catName && categoriesArr.indexOf(catName) === -1) {
                categoriesArr.push(catName);
            }
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: description,
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: 0,
            rating: 0,
            casts: "",
            director: "",
            country: "",
            category: categoriesArr.join(", "),
            status: code
        });
    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html, fallbackUrl) {
    try {
        var srcHtml = (html === null || html === undefined) ? "" : String(html);
        var hostUrl = PluginUtils.normalizeUrl(unescapeStreamUrl(fallbackUrl || ""));

        var mainPlayerStr = 'id="main-player"';
        var idxMain = srcHtml.indexOf(mainPlayerStr);
        if (idxMain === -1) idxMain = srcHtml.indexOf("id='main-player'");
        if (idxMain !== -1) {
            var snippet = srcHtml.substring(idxMain, Math.min(srcHtml.length, idxMain + 800));
            var srcAttr = PluginUtils.extractAttr(snippet, "src") || PluginUtils.extractAttr(snippet, "data-src");
            if (srcAttr) {
                hostUrl = PluginUtils.normalizeUrl(unescapeStreamUrl(srcAttr));
            }
        }

        var directStream = extractStreamFromHtml(srcHtml);
        var isDirectMedia = /\.(?:m3u8|mp4)(?:[?#]|$)/i.test(directStream || hostUrl);

        return JSON.stringify({
            url: directStream || hostUrl,
            headers: {
                "User-Agent": DEFAULT_USER_AGENT,
                "Referer": hostUrl || (BASE_URL + "/")
            },
            subtitles: [],
            isEmbed: !isDirectMedia,
            embedRegex: "(?:https?:)?\\/\\/[^\\s\"'<>\\\\]+\\.(?:m3u8|mp4)(?:[^\\s\"'<>\\\\]*)?"
        });
    } catch (e) {
        return JSON.stringify({
            url: fallbackUrl || "",
            headers: {},
            subtitles: []
        });
    }
}

function parseEmbedResponse(html, fallbackUrl) {
    try {
        var srcHtml = (html === null || html === undefined) ? "" : String(html);
        var cleanFallback = PluginUtils.normalizeUrl(unescapeStreamUrl(fallbackUrl || ""));
        var extracted = extractStreamFromHtml(srcHtml);
        var streamUrl = extracted || cleanFallback;

        return JSON.stringify({
            url: streamUrl,
            headers: {
                "User-Agent": DEFAULT_USER_AGENT,
                "Referer": cleanFallback || (BASE_URL + "/")
            },
            subtitles: [],
            isEmbed: false
        });
    } catch (e) {
        return JSON.stringify({
            url: fallbackUrl || "",
            headers: {},
            subtitles: [],
            isEmbed: false
        });
    }
}

function parseCategoriesResponse(html) {
    var categories = [];
    var seen = {};
    var src = (html === null || html === undefined) ? "" : String(html);

    var idols = parseIdolsMenuHtml(IDOLS_MENU_HTML);
    var defaultEntries = [{
        name: "Idols AV (Tất cả)",
        slug: "pornstar",
        posterUrl: DEFAULT_IDOL_POSTER,
        backdropUrl: DEFAULT_IDOL_POSTER
    }];

    for (var k = 0; k < idols.length; k++) {
        defaultEntries.push({
            name: "Idol: " + idols[k].name,
            slug: idols[k].slug,
            posterUrl: idols[k].posterUrl,
            backdropUrl: idols[k].backdropUrl,
            group: idols[k].group
        });
    }

    for (var d = 0; d < defaultEntries.length; d++) {
        var dSlug = defaultEntries[d].slug;
        if (dSlug && !seen[dSlug]) {
            seen[dSlug] = true;
            categories.push(defaultEntries[d]);
        }
    }

    var parts = src.split(/<li[^>]*id=["']category-[^"']*["'][^>]*>/i);
    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var linkMatch = itemHtml.match(/href=["']\/([^"']+)[\/]?["']/i);
        var nameMatch = itemHtml.match(/<div[^>]*class=["'][^"']*category-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

        if (linkMatch && nameMatch) {
            var slug = linkMatch[1].replace(/^\/+|\/+$/g, '');
            var name = PluginUtils.cleanText(nameMatch[1]);
            var imgM = itemHtml.match(/<img\b([^>]*)>/i);
            var catPoster = imgM ? PluginUtils.normalizeUrl(PluginUtils.extractAttr(imgM[1], "data-src") || PluginUtils.extractAttr(imgM[1], "src")) : "";

            if (slug && name && !seen[slug]) {
                seen[slug] = true;
                categories.push({
                    name: name,
                    slug: slug,
                    posterUrl: catPoster,
                    backdropUrl: catPoster
                });
            }
        }
    }

    if (categories.length <= defaultEntries.length) {
        var aRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = aRe.exec(src)) !== null) {
            var href = PluginUtils.extractAttr(m[1], "href");
            var text = PluginUtils.cleanText(m[2]);
            if (href && text && href.indexOf("/category/") !== -1) {
                var cSlug = href.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+|\/+$/g, '');
                if (cSlug && !seen[cSlug]) {
                    seen[cSlug] = true;
                    categories.push({ name: text, slug: cSlug });
                }
            }
        }
    }

    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
