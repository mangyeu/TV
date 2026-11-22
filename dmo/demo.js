// =============================================================================
// MissAV Plugin v2.1 — Domain Updated (missav.ai)
// =============================================================================

var BASE_URL = "https://missav.media";
var DEFAULT_LOCALE = "vi";

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "2.1.0",
        "baseUrl": BASE_URL,
        "referrer": BASE_URL + "/",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "subtitleCat": true
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: DEFAULT_LOCALE + '/today-hot', title: 'Hot Hôm Nay', type: 'Horizontal', path: '' },
        { slug: DEFAULT_LOCALE + '/weekly-hot', title: 'Hot Trong Tuần', type: 'Horizontal', path: '' },
        { slug: DEFAULT_LOCALE + '/monthly-hot', title: 'Hot Trong Tháng', type: 'Horizontal', path: '' },
        { slug: DEFAULT_LOCALE + '/uncensored-leak', title: 'Không Che (Rò Rỉ)', type: 'Horizontal', path: '' },
        { slug: DEFAULT_LOCALE + '/release', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: DEFAULT_LOCALE + '/new' },
        { name: 'Nữ diễn viên', slug: DEFAULT_LOCALE + '/actresses' },
        { name: 'Thể loại', slug: DEFAULT_LOCALE + '/genres' },
        { name: 'Không che', slug: DEFAULT_LOCALE + '/uncensored-leak' },
        { name: "FC2", slug: DEFAULT_LOCALE + "/fc2" },
        { name: "HEYZO", slug: DEFAULT_LOCALE + "/heyzo" },
        { name: "Tokyo Hot", slug: DEFAULT_LOCALE + "/tokyohot" },
        { name: "1pondo", slug: DEFAULT_LOCALE + "/1pondo" },
        { name: "Caribbeancom", slug: DEFAULT_LOCALE + "/caribbeancom" },
        { name: "Caribbeancompr", slug: DEFAULT_LOCALE + "/caribbeancompr" },
        { name: "10musume", slug: DEFAULT_LOCALE + "/10musume" },
        { name: "pacopacomama", slug: DEFAULT_LOCALE + "/pacopacomama" },
        { name: "Gachinco", slug: DEFAULT_LOCALE + "/gachinco" },
        { name: "XXX-AV", slug: DEFAULT_LOCALE + "/xxx-av" },
        { name: "MarriedSlash", slug: DEFAULT_LOCALE + "/marriedslash" },
        { name: "Naughty4610", slug: DEFAULT_LOCALE + "/naughty4610" },
        { name: "Naughty0930", slug: DEFAULT_LOCALE + "/naughty0930" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'new' },
            { name: 'Xem nhiều', value: 'views' },
            { name: 'Hôm nay', value: 'today_views' },
            { name: 'Tuần này', value: 'weekly_views' },
            { name: 'Tháng này', value: 'monthly_views' }
        ],
        category: [
            { name: "Tất cả thể loại", value: DEFAULT_LOCALE + "/genres" },
            { name: "Mới cập nhật", value: DEFAULT_LOCALE + "/new" },
            { name: "Phát hành mới", value: DEFAULT_LOCALE + "/release" },
            { name: "Không che (Rò rỉ)", value: DEFAULT_LOCALE + "/uncensored-leak" },
            { name: "Nữ diễn viên", value: DEFAULT_LOCALE + "/actresses" },
            { name: "BXH Diễn viên", value: DEFAULT_LOCALE + "/actresses/ranking" },
            { name: "Nhà sản xuất", value: DEFAULT_LOCALE + "/makers" },
            { name: "VR", value: DEFAULT_LOCALE + "/genres/VR" },
            { name: "Xem nhiều hôm nay", value: DEFAULT_LOCALE + "/today-hot" },
            { name: "Xem nhiều tuần", value: DEFAULT_LOCALE + "/weekly-hot" },
            { name: "Xem nhiều tháng", value: DEFAULT_LOCALE + "/monthly-hot" },
            { name: "Phụ đề Anh", value: DEFAULT_LOCALE + "/english-subtitle" },
            { name: "Phụ đề China", value: DEFAULT_LOCALE + "/chinese-subtitle" }
        ]
    });
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var path = slug || (DEFAULT_LOCALE + "/new");
    if (path.indexOf("/") !== 0) path = "/" + path;
    var pathStr = path.substring(1);
    var url = BASE_URL + "/" + pathStr + "?page=" + page;
    if (filters.sort && filters.sort !== 'new' && filters.sort !== 'hot') {
        url += "&sort=" + filters.sort;
    } else if (filters.sort === 'hot') {
        url += "&sort=views";
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/" + DEFAULT_LOCALE + "/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return BASE_URL + slug;
    return BASE_URL + "/" + DEFAULT_LOCALE + "/" + slug;
}

function getUrlCategories() { return BASE_URL + "/" + DEFAULT_LOCALE + "/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// UTILS
// =============================================================================

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) return "";
        return html.replace(/class="([^"]*)"/g, function (m, v) {
            return 'class="' + v.replace(/missav_media-/g, '') + '"';
        });
    },
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
            .replace(/\s+/g, " ").trim();
    },
    getMeta: function (html, property) {
        var m = html.match(new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'i'));
        return m ? m[1] : "";
    },
    extractPreviewUrl: function (itemHtml) {
        var m = itemHtml.match(/<video[^>]+data-src="([^"]+)"/);
        var url = m ? m[1] : "";
        if (url && url.length === 36 && url.match(/^[0-9a-f-]{36}$/i)) {
            return "https://surrit.com/" + url + "/preview.mp4";
        }
        if (!url) {
            var u = itemHtml.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (u) return "https://surrit.com/" + u[0] + "/preview.mp4";
        }
        if (url && url.indexOf('//') === 0) return "https:" + url;
        return url;
    }
};

// =============================================================================
// DEEP STREAM SCANNER
// =============================================================================

var StreamScanner = {
    KNOWN_CDN_HOSTS: [
        "surrit.mrstcdn.store", "fourhoi.mrstcdn.store",
        "surrit.com", "sixyik.com", "nineyu.com", "fourhoi.com"
    ],
    UUID_BLACKLIST: [
        "apiguinee", "popunder", "banner", "snaptrckr", "user_uuid",
        "generateUUID", "randomUUID", "monitoring", "crypto", "gtm",
        "dataLayer", "_relaunch", "slot", "searchHistory"
    ],

    unpackEval: function (html) {
        var m = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]*?\}\([\s\S]*?\]\)\)/);
        if (!m) return "";
        try {
            var code = m[0];
            var args = code.match(/\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)/);
            if (!args) return "";
            var p = args[1], a = parseInt(args[2], 10), k = args[4].split("|");
            var e = function (c) {
                return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
            };
            return p.replace(/\b\w+\b/g, function (t) { return k[parseInt(t, a)] || t; });
        } catch (err) { return ""; }
    },

    findCdnUrl: function (text) {
        if (!text) return null;
        for (var i = 0; i < this.KNOWN_CDN_HOSTS.length; i++) {
            var host = this.KNOWN_CDN_HOSTS[i].replace(/\./g, "\\.");
            var m = text.match(new RegExp("https?://" + host + "/([0-9a-f-]{36})(/[^\"'\\s]*)", "i"));
            if (m) return { cdnHost: this.KNOWN_CDN_HOSTS[i], uuid: m[1], path: m[2] || "/playlist.m3u8" };
        }
        var m2 = text.match(/https?:\/\/([a-z0-9.-]+\.mrstcdn\.store)\/([0-9a-f-]{36})([^"'\s]*)/i);
        if (m2) return { cdnHost: m2[1], uuid: m2[2], path: m2[3] || "/playlist.m3u8" };
        return null;
    },

    findCleanUuid: function (text) {
        if (!text) return "";
        var matches = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
        for (var i = 0; i < matches.length; i++) {
            var u = matches[i], idx = text.indexOf(u);
            var ctx = text.substring(Math.max(0, idx - 100), Math.min(text.length, idx + 100)).toLowerCase();
            var bad = false;
            for (var j = 0; j < this.UUID_BLACKLIST.length; j++) {
                if (ctx.indexOf(this.UUID_BLACKLIST[j]) !== -1) { bad = true; break; }
            }
            if (!bad) return u;
        }
        return "";
    },

    scan: function (html) {
        if (!html) return { url: "", source: "empty" };
        var candidates = [];

        var direct = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/gi);
        if (direct) {
            for (var i = 0; i < direct.length; i++) {
                var u = direct[i].replace(/\\\//g, "/");
                if (u.indexOf("preview") === -1) candidates.push({ url: u, source: "direct" });
            }
        }

        var unpacked = this.unpackEval(html);
        if (unpacked) {
            var c1 = this.findCdnUrl(unpacked);
            if (c1) {
                var url1 = "https://" + c1.cdnHost + "/" + c1.uuid + c1.path;
                if (url1.indexOf(".m3u8") === -1) url1 += "/playlist.m3u8";
                candidates.push({ url: url1, source: "unpacked" });
            }
        }

        var c3 = this.findCdnUrl(html);
        if (c3) {
            var url3 = "https://" + c3.cdnHost + "/" + c3.uuid + c3.path;
            if (url3.indexOf(".m3u8") === -1) url3 += "/playlist.m3u8";
            candidates.push({ url: url3, source: "cdn" });
        }

        var uuid = this.findCleanUuid(html);
        if (uuid) {
            candidates.push({ url: "https://surrit.mrstcdn.store/" + uuid + "/playlist.m3u8", source: "uuid_mrst" });
            candidates.push({ url: "https://surrit.com/" + uuid + "/playlist.m3u8", source: "uuid_surrit" });
        }

        var evalParts = html.match(/eval\(function\(p,a,c,k,e,[dr]\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalParts) {
            var parts = evalParts[1].split("|"), uuids = [];
            for (var r = 0; r < parts.length; r++) if (/^[0-9a-f]{8,12}$/.test(parts[r])) uuids.push(parts[r]);
            if (uuids.length >= 5) {
                var uu = uuids[0] + "-" + uuids[1] + "-" + uuids[2] + "-" + uuids[3] + "-" + uuids[4];
                candidates.push({ url: "https://surrit.mrstcdn.store/" + uu + "/playlist.m3u8", source: "eval_mrst" });
                candidates.push({ url: "https://surrit.com/" + uu + "/playlist.m3u8", source: "eval_surrit" });
            }
        }

        var priority = ["direct", "unpacked", "cdn", "eval_mrst", "uuid_mrst", "eval_surrit", "uuid_surrit"];
        for (var pi = 0; pi < priority.length; pi++) {
            for (var ci = 0; ci < candidates.length; ci++) {
                if (candidates[ci].source === priority[pi]) {
                    return { url: candidates[ci].url.replace(/\\\//g, "/"), source: candidates[ci].source };
                }
            }
        }
        return { url: "", source: "not_found" };
    }
};

// =============================================================================
// PARSERS (giữ nguyên logic gốc, chỉ đổi domain)
// =============================================================================

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    var isSearchPage = html.indexOf('recombeeClient') !== -1 && html.indexOf('recommendItems') !== -1;
    if (isSearchPage) {
        return JSON.stringify({
            items: [{ id: "/vi", title: "⚠️ Tìm kiếm chưa hỗ trợ", posterUrl: "", backdropUrl: "", description: "Dùng mục Thể loại/Hot để duyệt.", year: 0, quality: "INFO", episode_current: "", lang: "" }],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 1 }
        });
    }

    var actressLinkMatch = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
    var isActressesPage = (actressLinkMatch && actressLinkMatch.length > 5);
    var isAllGenresPage = !isActressesPage && html.indexOf('class="text-nord13"') !== -1 && html.indexOf(':đếm video') !== -1;

    if (isActressesPage) {
        var gridMatch = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
        var scope = gridMatch ? gridMatch[1] : html;
        var blocked = ["Tiếng Việt","English","繁體中文","简体中文","日本語","한국의","Melayu","ไทย","Deutsch","Français","Bahasa Indonesia","Filipino","Português","MissAV"];
        var seen = {};
        var liRegex = /<li[\s\S]*?<\/li>/gi, m;
        while ((m = liRegex.exec(scope)) !== null) {
            var item = m[0];
            var um = item.match(/href="([^"]*\/actresses\/[^"]+)"/);
            if (!um || um[1].indexOf('?') !== -1) continue;
            var nameM = item.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
            var nameRaw = nameM ? nameM[1] : (item.match(/<img[^>]+alt="([^"]+)"/) || [])[1] || "";
            var name = PluginUtils.cleanText(nameRaw);
            if (!name || name.length < 2 || blocked.indexOf(name) !== -1) continue;
            var imgM = item.match(/<img[^>]+src="([^"]+)"/);
            var img = imgM ? imgM[1] : "";
            if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";
            var slug = um[1].replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) slug = "/" + slug;
            if (!seen[slug]) {
                movies.push({ id: slug, title: name, posterUrl: img, backdropUrl: img, description: "Nữ diễn viên", year: 0, quality: "ACTRESS", episode_current: "", lang: "" });
                seen[slug] = true;
            }
        }
    } else if (isAllGenresPage) {
        var genreRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, gm;
        var gSeen = {};
        while ((gm = genreRegex.exec(html)) !== null) {
            var gUrl = gm[1], inner = gm[2];
            if (gUrl.indexOf('/genres/') !== -1 && inner.indexOf(':đếm video') === -1) {
                var gName = PluginUtils.cleanText(inner);
                if (!gName || gName.length < 2) continue;
                var gSlug = gUrl.replace(/https?:\/\/[^\/]+/, "");
                if (gSlug.indexOf("/") !== 0) gSlug = "/" + gSlug;
                if (!gSeen[gSlug]) {
                    movies.push({ id: gSlug, title: gName, posterUrl: "", backdropUrl: "", description: "Thể loại", year: 0, quality: "CAT", episode_current: "", lang: "" });
                    gSeen[gSlug] = true;
                }
            }
        }
    }

    if (movies.length === 0) {
        var parts = html.split('thumbnail group');
        if (parts.length <= 1) parts = html.split('class="thumbnail');
        for (var i = 1; i < parts.length; i++) {
            var itemHtml = parts[i];
            var fullLink = itemHtml.match(/<a[^>]+href="([^"]+)"/);
            var slug = fullLink ? fullLink[1].replace(/https?:\/\/[^\/]+/, "") : "";
            if (slug.indexOf("/") !== 0) slug = "/" + slug;

            var codeM = itemHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeM ? PluginUtils.cleanText(codeM[1]) : "";
            if (!code && slug) { var sp = slug.split("/"); code = sp[sp.length - 1]; }

            var imgM = itemHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            var title = imgM ? PluginUtils.cleanText(imgM[1]) : code;
            if (code && title.toUpperCase().indexOf(code.toUpperCase()) === 0) {
                var stripped = title.substring(code.length).trim();
                if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) stripped = stripped.substring(1).trim();
                if (stripped.length > 3) title = stripped;
            }
            if (!title) title = code || "No Title";

            var thumbM = itemHtml.match(/<img[\s\S]*?data-src="([^"]+)"/) || itemHtml.match(/<img[\s\S]*?src="([^"]+)"/);
            var thumb = thumbM ? thumbM[1] : "";
            if (thumb.indexOf("cover-t.jpg") !== -1) thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");

            if (slug && slug.indexOf("actresses") === -1 && slug.indexOf("genres") === -1) {
                if (slug.indexOf('item.') !== -1 || slug === "/" || slug === "#") continue;
                var isUncensored = itemHtml.indexOf("Không kiểm duyệt") !== -1 || itemHtml.indexOf("bg-blue-800") !== -1;
                var preview = PluginUtils.extractPreviewUrl(itemHtml);
                movies.push({
                    id: slug, title: title, posterUrl: thumb, backdropUrl: thumb,
                    description: "", year: 0,
                    quality: isUncensored ? "K.K.Duyệt" : "HD",
                    episode_current: isUncensored ? "K.K.Duyệt" : "Full",
                    lang: code, previewUrl: preview
                });
            }
        }
    }

    var totalPages = 1, currentPage = 1;
    var allPages = html.match(/page=(\d+)/g);
    if (allPages) for (var j = 0; j < allPages.length; j++) {
        var p = parseInt(allPages[j].match(/\d+/)[0]);
        if (p > totalPages) totalPages = p;
    }

    return JSON.stringify({
        items: movies,
        pagination: { currentPage: currentPage, totalPages: totalPages || 1, totalItems: movies.length, itemsPerPage: 20 }
    });
}

function parseSearchResponse(html) { return parseListResponse(html); }

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var title = PluginUtils.getMeta(html, "og:title");
        var thumb = PluginUtils.getMeta(html, "og:image");
        var desc = PluginUtils.getMeta(html, "og:description");

        var scanResult = StreamScanner.scan(html);
        var streamUrl = scanResult.url;

        var servers = [];
        if (streamUrl) {
            servers.push({
                name: "Stream",
                episodes: [{ id: pageUrl || streamUrl, name: "Full", slug: "full" }]
            });
        }

        return JSON.stringify({
            id: "", title: title, posterUrl: thumb, backdropUrl: thumb,
            description: desc, servers: servers,
            quality: "HD", lang: "Vietsub", year: 0, rating: 0,
            casts: "", director: "", category: "", status: "", duration: ""
        });
    } catch (e) { return "null"; }
}

function parseDetailResponse(html) {
    var result = StreamScanner.scan(html || "");
    return JSON.stringify({
        url: result.url || "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASE_URL + "/",
            "Origin": BASE_URL
        },
        subtitles: [],
        _debug: { source: result.source }
    });
}

function parseCategoriesResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var cats = [{ name: "Tất cả thể loại", slug: DEFAULT_LOCALE + "/genres" }];
    var re = /<a[^>]+href="([^"]*\/genres\/[^"]+)"[^>]*>([^<]+)<\/a>/g, m, seen = {};
    while ((m = re.exec(html)) !== null) {
        var parts = m[1].split("/genres/");
        var slug = parts.length > 1 ? parts[1] : "";
        var name = PluginUtils.cleanText(m[2]);
        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            cats.push({ name: name, slug: DEFAULT_LOCALE + "/genres/" + slug });
        }
    }
    return JSON.stringify(cats);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
