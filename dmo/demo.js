// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhd.today";
var DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var DEFAULT_IDOL_POSTER = BASE_URL + "/favicon.ico";

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
    "pornstar/kimijima-mio": ""
};

var IDOLS_MENU_HTML = [
    '<h3>AV Pornstars</h3>',
    '<li><a href="https://javhd.today/pornstar/hatano-yui/">Hatano Yui</a></li>',
    '<li><a href="https://javhd.today/pornstar/aika/">Aika</a></li>',
    '<li><a href="https://javhd.today/pornstar/hasumi-kurea/">Hasumi Kurea</a></li>',
    '<li><a href="https://javhd.today/pornstar/iioka-kanako/">Iioka Kanako</a></li>',
    '<li><a href="https://javhd.today/pornstar/nagisa-mitsuki/">Nagisa Mitsuki</a></li>',
    '<li><a href="https://javhd.today/pornstar/shinoda-yuu/">Shinoda Yuu</a></li>',
    '<li><a href="https://javhd.today/pornstar/matsumoto-ichika/">Matsumoto Ichika</a></li>',
    '<li><a href="https://javhd.today/pornstar/hamasaki-mao/">Hamasaki Mao</a></li>',
    '<li><a href="https://javhd.today/pornstar/haruna-hana/">Haruna Hana</a></li>',
    '<li><a href="https://javhd.today/pornstar/mitani-akari/">Mitani Akari</a></li>',
    '<li><a href="https://javhd.today/pornstar/ootsuki-hibiki/">Ootsuki Hibiki</a></li>',
    '<li><a href="https://javhd.today/pornstar/uehara-ai/">Uehara Ai</a></li>',
    '<li><a href="https://javhd.today/pornstar/seina-arisa/">Seina Arisa</a></li>',
    '<li><a href="https://javhd.today/pornstar/hachino-tsubasa/">Hachino Tsubasa</a></li>',
    '<li><a href="https://javhd.today/pornstar/yayoi-mizuki/">Yayoi Mizuki</a></li>',
    '<li><a href="https://javhd.today/pornstar/kimijima-mio/">Kimijima Mio</a></li>',
    '<li><a href="https://javhd.today/pornstar"><h4>All AV list</h4></a></li>',
    '</ul>'
].join("\n");

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.3.2",
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
        { name: 'AV Pornstars', slug: 'pornstar' },
        { name: 'Most Videos Idols', slug: 'pornstar/most-videos' }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'popular/today', title: 'Xem Nhiều Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'uncensored-jav', title: 'Jav Uncensored', type: 'Horizontal', path: '' },
        { slug: 'reducing-mosaic', title: 'Reducing Mosaic', type: 'Horizontal', path: '' },
        { slug: 'jav-sub', title: 'Jav Sub', type: 'Horizontal', path: '' },
        { slug: 'pornstar', title: 'AV Pornstars', type: 'Horizontal', path: '' },
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

function extractSlugFromHref(href) {
    if (!href) return "";
    return String(href)
        .replace(/^https?:\/\/[^/]+/i, "")
        .replace(/^\/+|\/+$/g, "");
}

function parseIdolsMenuHtml(html) {
    var src = html || IDOLS_MENU_HTML;
    var items = [];
    var seen = {};

    var h3Match = src.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    var groupName = h3Match ? PluginUtils.cleanText(h3Match[1]) : "AV Pornstars";

    var linkRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
    var m;
    while ((m = linkRegex.exec(src)) !== null) {
        var attrs = m[1];
        var innerHtml = m[2];
        var href = PluginUtils.extractAttr(attrs, "href");
        if (!href || href.indexOf("pornstar") === -1) continue;

        var slug = extractSlugFromHref(href);
        if (!slug || slug === "pornstar") continue;

        var titleAttr = PluginUtils.extractAttr(attrs, "title");
        var labelText = PluginUtils.cleanText(titleAttr || innerHtml);
        if (!labelText || /^all\s+av\s+list$/i.test(labelText)) continue;

        var imgInLink = innerHtml.match(/<img\b[^>]*>/i);
        var rawImg = imgInLink
            ? (PluginUtils.extractAttr(imgInLink[0], "data-src") || PluginUtils.extractAttr(imgInLink[0], "src"))
            : "";
        var poster = getIdolPosterUrl(slug, rawImg);

        if (!seen[slug]) {
            seen[slug] = true;
            items.push({
                id: slug,
                name: labelText,
                title: labelText,
                value: slug,
                slug: slug,
                group: groupName,
                posterUrl: poster,
                backdropUrl: poster,
                thumb: poster
            });
        }
    }

    return items;
}

function getIdolsList() {
    return JSON.stringify(parseIdolsMenuHtml(IDOLS_MENU_HTML));
}

function getIdolsMostVideosList() {
    return JSON.stringify(parseIdolsMenuHtml(IDOLS_MENU_HTML));
}

function getIdolsPosterPage(pageNum) {
    var page = parseInt(pageNum, 10) || 1;
    var perPage = 20;
    var sourceIdols = parseIdolsMenuHtml(IDOLS_MENU_HTML);

    var totalPages = Math.max(1, Math.ceil(sourceIdols.length / perPage));
    var safePage = Math.min(Math.max(1, page), totalPages);
    var start = (safePage - 1) * perPage;
    var end = Math.min(start + perPage, sourceIdols.length);

    var pageItems = [];
    for (var i = start; i < end; i++) {
        var idol = sourceIdols[i];
        pageItems.push({
            id: idol.slug,
            title: idol.name,
            name: idol.name,
            slug: idol.slug,
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
            totalItems: sourceIdols.length,
            itemsPerPage: perPage
        }
    });
}

function getFilterConfig() {
    var rawIdols = parseIdolsMenuHtml(IDOLS_MENU_HTML);
    var idolFilters = [
        { name: "All Pornstars", value: "pornstar", posterUrl: DEFAULT_IDOL_POSTER },
        { name: "Most Videos Idols", value: "pornstar/most-videos", posterUrl: DEFAULT_IDOL_POSTER }
    ];
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
    var sortPath = (filters.sort && filters.sort !== 'recent')
        ? (String(filters.sort).replace(/^\/+|\/+$/g, '') + '/')
        : '';

    var chosenSlug = filters.idol || filters.category || slug || 'recent';
    var normalizedTarget = extractSlugFromHref(chosenSlug);

    if (normalizedTarget.indexOf("pornstar/") === 0 &&
        normalizedTarget !== "pornstar/most-videos" &&
        normalizedTarget !== "pornstar/popular" &&
        normalizedTarget !== "pornstar/newest") {
        var idolUrl = BASE_URL + "/" + normalizedTarget + "/";
        if (page > 1) {
            idolUrl += (idolUrl.indexOf("?") !== -1 ? "&" : "?") + "page=" + page;
        }
        return idolUrl;
    }

    var isPornstarList = (
        normalizedTarget === "pornstar" ||
        normalizedTarget === "pornstar/most-videos" ||
        normalizedTarget === "pornstar/popular" ||
        normalizedTarget === "pornstar/newest"
    );
    var isPornstarDetail = (normalizedTarget.indexOf("pornstar/") === 0 && !isPornstarList);
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
        var relPath = extractSlugFromHref(chosenSlug);
        finalUrl = BASE_URL + (relPath ? ("/" + relPath + "/") : "/");
    } else if (!normalizedTarget || normalizedTarget === 'recent') {
        finalUrl = BASE_URL + "/recent/" + sortPath;
    } else if (normalizedTarget === "pornstar/most-videos") {
        finalUrl = BASE_URL + "/pornstar/";
    } else if (isPornstarList || isPornstarDetail) {
        finalUrl = BASE_URL + "/" + normalizedTarget + "/";
    } else {
        finalUrl = BASE_URL + "/" + normalizedTarget + "/" + sortPath;
    }

    var params = [];
    if (!isPornstarList && !isPornstarDetail) {
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
    if (s.indexOf("http") === 0) {
        var rel = extractSlugFromHref(s);
        return BASE_URL + (rel ? ("/" + rel) : "");
    }
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

function parseVideoItemsFromHtml(responseHtml) {
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

        var slug = extractSlugFromHref(fullUrl);

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
    return movies;
}

function parseIdolsPosterPageHtml(html) {
    var src = (html === null || html === undefined) ? "" : String(html);
    var items = [];
    var seen = {};

    var blocks = src.split(/<(?:li|div)\b[^>]*>/i);
    for (var i = 0; i < blocks.length; i++) {
        var blk = blocks[i];
        if (blk.indexOf("/pornstar/") === -1) continue;

        var linkMatch = blk.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);
        if (!linkMatch) continue;

        var href = PluginUtils.extractAttr(linkMatch[1], "href");
        if (!href || href.indexOf("/pornstar/") === -1) continue;

        var slug = extractSlugFromHref(href);
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

        var countMatch = blk.match(/(\d+)\s*(?:videos?|phim)/i);
        var countLabel = countMatch ? (countMatch[1] + " Videos") : "AV Pornstars";

        var name = PluginUtils.cleanText(
            PluginUtils.extractAttr(linkMatch[1], "title") ||
            altText ||
            linkMatch[2]
        );
        if (!name || /^all\s+av\s+list$/i.test(name)) continue;

        seen[slug] = true;
        var poster = getIdolPosterUrl(slug, rawThumb);
        items.push({
            id: slug,
            title: name,
            name: name,
            slug: slug,
            posterUrl: poster,
            backdropUrl: poster,
            year: 0,
            quality: "HD",
            episode_current: countLabel,
            lang: "Idol AV"
        });
    }

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
                    posterUrl: mIdol.posterUrl,
                    backdropUrl: mIdol.backdropUrl,
                    year: 0,
                    quality: "HD",
                    episode_current: mIdol.group || "AV Pornstars",
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

    var movies = parseVideoItemsFromHtml(responseHtml);

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

function parseServerEmbedUrls(btnAttrs) {
    var urls = [];
    var seen = {};

    function addUrl(u) {
        var norm = PluginUtils.normalizeUrl(unescapeStreamUrl(u));
        if (norm && !seen[norm]) {
            seen[norm] = true;
            urls.push(norm);
        }
    }

    var rawEmbeds = PluginUtils.extractAttr(btnAttrs, "data-embeds");
    if (rawEmbeds) {
        var decodedArrayStr = PluginUtils.decodeBase64(rawEmbeds);
        try {
            var arr = JSON.parse(decodedArrayStr);
            if (arr && arr.length) {
                for (var i = 0; i < arr.length; i++) {
                    addUrl(arr[i]);
                }
            }
        } catch (e) {
            if (isLikelyUrl(decodedArrayStr)) {
                addUrl(decodedArrayStr);
            }
        }
    }

    var rawEmbed = PluginUtils.extractAttr(btnAttrs, "data-embed");
    if (rawEmbed) {
        var decodedSingle = PluginUtils.decodeBase64(rawEmbed);
        addUrl(isLikelyUrl(decodedSingle) ? decodedSingle : rawEmbed);
    }

    return urls;
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

        while ((btnMatch = buttonRegex.exec(srcHtml)) !== null) {
            var btnAttrs = btnMatch[1];
            var cls = PluginUtils.extractAttr(btnAttrs, "class");
            if (cls.indexOf("button_choice_server") === -1) continue;

            var serverName = PluginUtils.cleanText(PluginUtils.extractAttr(btnAttrs, "data-name")) || ("Server " + (servers.length + 1));
            var embedUrls = parseServerEmbedUrls(btnAttrs);

            if (embedUrls.length > 0) {
                var episodes = [];
                for (var idx = 0; idx < embedUrls.length; idx++) {
                    episodes.push({
                        id: embedUrls[idx],
                        name: embedUrls.length > 1 ? ("Mirror " + (idx + 1)) : "Full",
                        slug: embedUrls.length > 1 ? ("mirror-" + (idx + 1)) : "full"
                    });
                }
                servers.push({
                    name: serverName,
                    episodes: episodes
                });
            }
        }

        if (servers.length === 0) {
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
                }
            }
        }

        if (servers.length === 0) {
            servers.push({
                name: "Unknown",
                episodes: [{
                    id: "",
                    name: "Full",
                    slug: "full"
                }]
            });
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
        var srcHtml = (html === null || html === undefined) ? "" : String
