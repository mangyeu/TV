// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhdz.today";
var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

var IDOLS_MENU_HTML = [
    '<li class="dropdown dropdown-large">',
    '  <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-star"></i> Idols Av<b class="caret"></b></a>',
    '  <ul class="dropdown-menu dropdown-menu-large row">',
    '    <li class="col-sm-4">',
    '      <ul>',
    '        <li class="dropdown-header" style="color: #000;">Top Idols</li>',
    '        <li class="divider"></li>',
    '        <li><a href="https://javhdz.today/pornstar/hatano-yui/"><i class="fa fa-caret-right"></i> Hatano Yui</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/aika/"><i class="fa fa-caret-right"></i> Aika</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hasumi-kurea/"><i class="fa fa-caret-right"></i> Hasumi Kurea</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/iioka-kanako/"><i class="fa fa-caret-right"></i> Iioka Kanako</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/nagisa-mitsuki/"><i class="fa fa-caret-right"></i> Nagisa Mitsuki</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/shinoda-yuu/"><i class="fa fa-caret-right"></i> Shinoda Yuu</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/matsumoto-ichika/"><i class="fa fa-caret-right"></i> Matsumoto Ichika</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hamasaki-mao/"><i class="fa fa-caret-right"></i> Hamasaki Mao</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/haruna-hana/"><i class="fa fa-caret-right"></i> Haruna Hana</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/mitani-akari/"><i class="fa fa-caret-right"></i> Mitani Akari</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/ootsuki-hibiki/"><i class="fa fa-caret-right"></i> Ootsuki Hibiki</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/uehara-ai/"><i class="fa fa-caret-right"></i> Uehara Ai</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/seina-arisa/"><i class="fa fa-caret-right"></i> Seina Arisa</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hachino-tsubasa/"><i class="fa fa-caret-right"></i> Hachino Tsubasa</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yayoi-mizuki/"><i class="fa fa-caret-right"></i> Yayoi Mizuki</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/kimijima-mio/"><i class="fa fa-caret-right"></i> Kimijima Mio</a></li>',
    '        <li><a href="https://javhdz.today/pornstar"><i class="fa fa-caret-right"></i> <strong>All Idols Av</strong></a></li>',
    '      </ul>',
    '    </li>',
    '    <li class="col-sm-4">',
    '      <ul>',
    '        <li class="dropdown-header" style="color: #000;">Newest Idols AV</li>',
    '        <li class="divider"></li>',
    '        <li><a href="https://javhdz.today/pornstar/kanade-miyu/" title="Kanade Miyu "><i class="fa fa-caret-right"></i> Kanade Miyu</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hana-arisu/" title="Hana Arisu "><i class="fa fa-caret-right"></i> Hana Arisu</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/kanamatsu-toho/" title="Kanamatsu Toho "><i class="fa fa-caret-right"></i> Kanamatsu Toho</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yu-sasamoto/" title="Yu Sasamoto "><i class="fa fa-caret-right"></i> Yu Sasamoto</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hanazato-akari/" title="Hanazato Akari "><i class="fa fa-caret-right"></i> Hanazato Akari</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yui-mita/" title="Yui Mita "><i class="fa fa-caret-right"></i> Yui Mita</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/riria-hido/" title="Riria Hido "><i class="fa fa-caret-right"></i> Riria Hido</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/marina-sina/" title="Marina Sina "><i class="fa fa-caret-right"></i> Marina Sina</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/rin-chibana/" title="Rin Chibana "><i class="fa fa-caret-right"></i> Rin Chibana</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yui-tsubaki/" title="Yui Tsubaki "><i class="fa fa-caret-right"></i> Yui Tsubaki</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yurina-shoji/" title="Yurina Shoji "><i class="fa fa-caret-right"></i> Yurina Shoji</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/nao-hayakawa/" title="Nao Hayakawa "><i class="fa fa-caret-right"></i> Nao Hayakawa</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hikari-mizusumi/" title="Hikari Mizusumi "><i class="fa fa-caret-right"></i> Hikari Mizusumi</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/saki-no-kanna/" title="Saki no Kanna "><i class="fa fa-caret-right"></i> Saki no Kanna</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yurina-momosaki/" title="Yurina Momosaki "><i class="fa fa-caret-right"></i> Yurina Momosaki</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hasmi-claire/" title="Hasmi Claire "><i class="fa fa-caret-right"></i> Hasmi Claire</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yui-higa/" title="Yui Higa "><i class="fa fa-caret-right"></i> Yui Higa</a></li>',
    '      </ul>',
    '    </li>',
    '    <li class="col-sm-4">',
    '      <ul>',
    '        <li class="dropdown-header" style="color: #000;">Most Popular Idols AV</li>',
    '        <li class="divider"></li>',
    '        <li><a href="https://javhdz.today/pornstar/yumi-kazama/" title="Yumi Kazama "><i class="fa fa-caret-right"></i> Yumi Kazama</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yui-hatano/" title="Yui Hatano"><i class="fa fa-caret-right"></i> Yui Hatano</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hana-haruna/" title="Hana Haruna "><i class="fa fa-caret-right"></i> Hana Haruna</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/eimi-fukada/" title="Eimi Fukada "><i class="fa fa-caret-right"></i> Eimi Fukada</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/reiko-kobayakawa/" title="Reiko Kobayakawa "><i class="fa fa-caret-right"></i> Reiko Kobayakawa</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/asahi-mizuno/" title="Asahi Mizuno "><i class="fa fa-caret-right"></i> Asahi Mizuno</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/hitomi-tanaka/" title="Hitomi Tanaka "><i class="fa fa-caret-right"></i> Hitomi Tanaka</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/maria-nagai/" title="Maria Nagai "><i class="fa fa-caret-right"></i> Maria Nagai</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/ai-sayama/" title="Ai Sayama "><i class="fa fa-caret-right"></i> Ai Sayama</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/mako-oda/" title="Mako Oda "><i class="fa fa-caret-right"></i> Mako Oda</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/aimi-yoshikawa/" title="Aimi Yoshikawa "><i class="fa fa-caret-right"></i> Aimi Yoshikawa</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/mina-kitano/" title="Mina Kitano "><i class="fa fa-caret-right"></i> Mina Kitano</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/ai-uehara/" title="Ai Uehara "><i class="fa fa-caret-right"></i> Ai Uehara</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/anri-okita/" title="Anri Okita "><i class="fa fa-caret-right"></i> Anri Okita</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/kaho-shibuya/" title="Kaho Shibuya "><i class="fa fa-caret-right"></i> Kaho Shibuya</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yua-mikami/" title="Yua Mikami "><i class="fa fa-caret-right"></i> Yua Mikami</a></li>',
    '        <li><a href="https://javhdz.today/pornstar/yu-shinoda/" title="Yu Shinoda"><i class="fa fa-caret-right"></i> Yu Shinoda</a></li>',
    '      </ul>',
    '    </li>',
    '  </ul>',
    '</li>'
].join("\n");

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.0.7",
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

function parseIdolsMenuHtml(html) {
    var src = html || IDOLS_MENU_HTML;
    var items = [];
    var seen = {};

    // Tách từng cột <li class="col-sm-4"> để gán nhóm (Top Idols / Newest Idols AV / Most Popular Idols AV)
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

            if (!seen[slug]) {
                seen[slug] = true;
                items.push({
                    name: labelText,
                    value: slug,
                    slug: slug,
                    group: groupName
                });
            }
        }
    }

    return items;
}

function getIdolsList() {
    return JSON.stringify(parseIdolsMenuHtml(IDOLS_MENU_HTML));
}

function getFilterConfig() {
    var idols = parseIdolsMenuHtml(IDOLS_MENU_HTML).map(function (idol) {
        return {
            name: idol.name + " (" + idol.group + ")",
            value: idol.value
        };
    });

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
        idol: idols
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
    var sortPath = (filters.sort && filters.sort !== 'recent') ? (filters.sort.replace(/^\/+|\/+$/g, '') + '/') : '';

    var chosenSlug = filters.idol || filters.category || slug || 'recent';
    var normalizedTarget = String(chosenSlug).replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+|\/+$/g, '');

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
    } else {
        finalUrl = BASE_URL + "/" + normalizedTarget + "/" + sortPath;
    }

    var params = [];
    params.push(isBrowse ? "ajax=browse_videos" : "ajax=1");
    if (page > 1) {
        params.push("page=" + page);
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
    var s = String(slug).trim();
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
    cleanText: function (text) {
        if (!text) return "";
        return String(text)
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
            .trim();
    },

    normalizeUrl: function (url) {
        if (!url) return "";
        var u = String(url).trim();
        if (!u) return "";
        if (u.indexOf("//") === 0) return "https:" + u;
        if (u.indexOf("http") === 0) return u;
        if (u.indexOf("/") === 0) return BASE_URL + u;
        return BASE_URL + "/" + u;
    },

    decodeBase64: function (input) {
        if (!input) return "";
        var b64url = String(input).trim().replace(/\s+/g, '');
        if (!b64url) return "";
        try {
            if (typeof atob === 'function') {
                return atob(b64url);
            }
        } catch (e) {
            // Fallback to manual decode
        }

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
        return m ? m[2].trim() : "";
    }
};

function parseListResponse(html) {
    var responseHtml = html || "";
    var paginationHtml = "";

    if (responseHtml.trim().indexOf('{') === 0) {
        try {
            var data = JSON.parse(responseHtml);
            if (data && data.html) {
                responseHtml = data.html;
                if (data.pagination) {
                    paginationHtml = data.pagination;
                }
            }
        } catch (e) {
            // Keep raw responseHtml
        }
    }

    var moviesMap = {};
    var parts = responseHtml.split(/<li[^>]*id=["']video-[^"']*["'][^>]*>/i);

    for (var i = 1; i < parts.length; i++) {
        var itemHtml = parts[i];
        var fullUrl = "";
        var title = "";

        var aRegex = /<a\b([^>]*)>/gi;
        var aMatch;
        while ((aMatch = aRegex.exec(itemHtml)) !== null) {
            var attrs = aMatch[1];
            if (attrs.indexOf('thumbnail') !== -1) {
                fullUrl = PluginUtils.extractAttr(attrs, "href");
                title = PluginUtils.extractAttr(attrs, "title");
                break;
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
        if (Object.prototype.hasOwnProperty.call(moviesMap, key)) {
            movies.push(moviesMap[key]);
        }
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
        var srcHtml = html || "";
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
                var b64url = PluginUtils.extractAttr(btnAttrs, "data-embed");
                var serverName = PluginUtils.cleanText(PluginUtils.extractAttr(btnAttrs, "data-name")) || ("Server " + (servers.length + 1));
                var decodedUrl = PluginUtils.normalizeUrl(PluginUtils.decodeBase64(b64url));

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
        }

        if (!foundServer) {
            var mainPlayerStr = 'id="main-player"';
            var idxMain = srcHtml.indexOf(mainPlayerStr);
            if (idxMain === -1) idxMain = srcHtml.indexOf("id='main-player'");
            if (idxMain !== -1) {
                var snippet = srcHtml.substring(idxMain, Math.min(srcHtml.length, idxMain + 500));
                var srcAttr = PluginUtils.extractAttr(snippet, "src");
                if (srcAttr) {
                    servers.push({
                        name: "Embed Server",
                        episodes: [{
                            id: PluginUtils.normalizeUrl(srcAttr),
                            name: "Full",
                            slug: "full"
                        }]
                    });
                    foundServer = true;
                }
            }
        }

        if (!foundServer) {
            var ultimateMatch = srcHtml.match(/src=["'](https?:\/\/[a-z0-9A-Z.-]+\/(?:v|e|embed)\/[^"']+)["']/i);
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
        var srcHtml = html || "";
        var hostUrl = PluginUtils.normalizeUrl(fallbackUrl || "");

        var mainPlayerStr = 'id="main-player"';
        var idxMain = srcHtml.indexOf(mainPlayerStr);
        if (idxMain === -1) idxMain = srcHtml.indexOf("id='main-player'");
        if (idxMain !== -1) {
            var snippet = srcHtml.substring(idxMain, Math.min(srcHtml.length, idxMain + 500));
            var srcAttr = PluginUtils.extractAttr(snippet, "src");
            if (srcAttr) {
                hostUrl = PluginUtils.normalizeUrl(srcAttr);
            }
        }

        return JSON.stringify({
            url: hostUrl,
            headers: {
                "User-Agent": DEFAULT_USER_AGENT,
                "Referer": BASE_URL + "/"
            },
            subtitles: [],
            isEmbed: true,
            embedRegex: "['\"](https?:\\/\\/[^\\s'\"]+\\.m3u8[^'\"]*)['\"]"
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
        var srcHtml = html || "";
        var streamUrl = PluginUtils.normalizeUrl(fallbackUrl || "");

        var m3u8Match = srcHtml.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/i);
        var mp4Match = srcHtml.match(/["'](https?:\/\/[^"'\s]+\.mp4[^"'\s]*)["']/i);

        if (m3u8Match && m3u8Match[1]) {
            streamUrl = m3u8Match[1].replace(/\\\//g, "/");
        } else if (mp4Match && mp4Match[1]) {
            streamUrl = mp4Match[1].replace(/\\\//g, "/");
        }

        return JSON.stringify({
            url: streamUrl,
            headers: {
                "User-Agent": DEFAULT_USER_AGENT,
                "Referer": BASE_URL + "/"
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
