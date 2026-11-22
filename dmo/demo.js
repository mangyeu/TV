// =============================================================================
// MissAV Plugin v2.0 — Deep Stream Scanner Edition
// Fix: domain CDN mới (mrstcdn.store), eval packer, Referer, blacklist UUID
// =============================================================================

// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "2.0.0",
        "baseUrl": "https://missav.media",
        "referrer": "https://missav.media/",
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
        { slug: 'vi/today-hot', title: 'Hot Hôm Nay', type: 'Horizontal', path: '' },
        { slug: 'vi/weekly-hot', title: 'Hot Trong Tuần', type: 'Horizontal', path: '' },
        { slug: 'vi/monthly-hot', title: 'Hot Trong Tháng', type: 'Horizontal', path: '' },
        { slug: 'vi/uncensored-leak', title: 'Không Che (Rò Rỉ)', type: 'Horizontal', path: '' },
        { slug: 'vi/release', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới cập nhật', slug: 'vi/new' },
        { name: 'Nữ diễn viên', slug: 'vi/actresses' },
        { name: 'Thể loại', slug: 'vi/genres' },
        { name: 'Không che', slug: 'vi/uncensored-leak' },
        { name: "FC2", slug: "vi/fc2" },
        { name: "HEYZO", slug: "vi/heyzo" },
        { name: "Tokyo Hot", slug: "vi/tokyohot" },
        { name: "1pondo", slug: "vi/1pondo" },
        { name: "Caribbeancom", slug: "vi/caribbeancom" },
        { name: "Caribbeancompr", slug: "vi/caribbeancompr" },
        { name: "10musume", slug: "vi/10musume" },
        { name: "pacopacomama", slug: "vi/pacopacomama" },
        { name: "Gachinco", slug: "vi/gachinco" },
        { name: "XXX-AV", slug: "vi/xxx-av" },
        { name: "MarriedSlash", slug: "vi/marriedslash" },
        { name: "Naughty4610", slug: "vi/naughty4610" },
        { name: "Naughty0930", slug: "vi/naughty0930" }
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
            { name: "Tất cả thể loại", value: "vi/genres" },
            { name: "Mới cập nhật", value: "vi/new" },
            { name: "Phát hành mới", value: "vi/release" },
            { name: "Không che (Rò rỉ)", value: "vi/uncensored-leak" },
            { name: "Nữ diễn viên", value: "vi/actresses" },
            { name: "BXH Diễn viên", value: "vi/actresses/ranking" },
            { name: "Nhà sản xuất", value: "vi/makers" },
            { name: "VR", value: "vi/genres/VR" },
            { name: "Xem nhiều hôm nay", value: "vi/today-hot" },
            { name: "Xem nhiều tuần", value: "vi/weekly-hot" },
            { name: "Xem nhiều tháng", value: "vi/monthly-hot" },
            { name: "Phụ đề Anh", value: "vi/english-subtitle" },
            { name: "Phụ đề China", value: "vi/chinese-subtitle" },
            { name: "SIRO", value: "vi/series/SIRO" },
            { name: "LUXU", value: "vi/series/LUXU" },
            { name: "GANA", value: "vi/series/GANA" },
            { name: "MAAN", value: "vi/series/MAAN" },
            { name: "S-CUTE", value: "vi/series/S-CUTE" },
            { name: "ARA", value: "vi/series/ARA" },
            { name: "FC2", value: "vi/series/FC2" },
            { name: "HEYZO", value: "vi/series/HEYZO" },
            { name: "Tokyo Hot", value: "vi/series/Tokyo-Hot" },
            { name: "1pondo", value: "vi/series/1pondo" },
            { name: "Caribbeancom", value: "vi/series/Caribbeancom" },
            { name: "Caribbeancompr", value: "vi/series/Caribbeancompr" },
            { name: "10musume", value: "vi/series/10musume" },
            { name: "pacopacomama", value: "vi/series/pacopacomama" },
            { name: "Gachinco", value: "vi/series/Gachinco" },
            { name: "XXX-AV", value: "vi/series/XXX-AV" },
            { name: "MarriedSlash", value: "vi/series/MarriedSlash" },
            { name: "Naughty4610", value: "vi/series/naughty4610" },
            { name: "Naughty0930", value: "vi/series/naughty0930" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://missav.media";
    var path = slug || "vi/new";
    if (path.indexOf("/") !== 0) path = "/" + path;

    var pathStr = path;
    if (pathStr.indexOf("/") === 0) pathStr = pathStr.substring(1);

    var url = baseUrl + "/" + pathStr + "?page=" + page;

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
    return "https://missav.media/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return "https://missav.media" + slug;
    return "https://missav.media/vi/" + slug;
}

function getUrlCategories() { return "https://missav.media/vi/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// UTILS
// =============================================================================

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) return "";
        return html.replace(/class="([^"]*)"/g, function (fullMatch, classValue) {
            var normalized = classValue.replace(/missav_media-/g, '');
            return 'class="' + normalized + '"';
        });
    },
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },
    getMeta: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'i');
        var match = html.match(regex);
        return match ? match[1] : "";
    },
    getMetaList: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'gi');
        var results = [];
        var match;
        while ((match = regex.exec(html)) !== null) results.push(match[1]);
        return results;
    },
    extractPreviewUrl: function (itemHtml) {
        var previewMatch = itemHtml.match(/<video[^>]+data-src="([^"]+)"/);
        var url = previewMatch ? previewMatch[1] : "";
        if (url && url.length === 36 && url.match(/^[0-9a-f-]{36}$/i)) {
            return "https://surrit.com/" + url + "/preview.mp4";
        }
        if (!url || url === "") {
            var uuidMatch = itemHtml.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) return "https://surrit.com/" + uuidMatch[0] + "/preview.mp4";
        }
        if (url && url.indexOf('//') === 0) return "https:" + url;
        return url;
    }
};

// =============================================================================
// DEEP STREAM SCANNER v2.0
// =============================================================================

var StreamScanner = {
    KNOWN_CDN_HOSTS: [
        "surrit.mrstcdn.store",
        "fourhoi.mrstcdn.store",
        "surrit.com", "surrit.ru", "sixyik.com",
        "nineyu.com", "fourhoi.com", "missav.com"
    ],

    UUID_BLACKLIST: [
        "apiguinee", "popunder", "banner", "snaptrckr",
        "user_uuid", "generateUUID", "randomUUID",
        "monitoring", "crypto", "gtm", "dataLayer",
        "_relaunch", "slot", "searchHistory", "setPreview",
        "holdPreviews", "recommendItems"
    ],

    unpackEval: function (html) {
        var m = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]*?\}\([\s\S]*?\]\)\)/);
        if (!m) return "";
        try {
            var code = m[0];
            var argsMatch = code.match(/\}\('([\s\S]*?)',(\d+),(\d+),'([\s\S]*?)'\.split\('\|'\)/);
            if (!argsMatch) return "";
            var p = argsMatch[1];
            var a = parseInt(argsMatch[2], 10);
            var c = parseInt(argsMatch[3], 10);
            var k = argsMatch[4].split("|");
            var e = function (c) {
                return (c < a ? "" : e(parseInt(c / a))) +
                    ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
            };
            var decoded = p.replace(/\b\w+\b/g, function (token) {
                return k[parseInt(token, a)] || token;
            });
            return decoded;
        } catch (err) {
            return "";
        }
    },

    findCdnUrl: function (text) {
        if (!text) return null;
        for (var i = 0; i < this.KNOWN_CDN_HOSTS.length; i++) {
            var host = this.KNOWN_CDN_HOSTS[i].replace(/\./g, "\\.");
            var re = new RegExp("https?://" + host + "/([0-9a-f-]{36})(/[^\"'\\s]*)", "i");
            var m = text.match(re);
            if (m) {
                return {
                    cdnHost: this.KNOWN_CDN_HOSTS[i],
                    uuid: m[1],
                    path: m[2] || "/playlist.m3u8"
                };
            }
        }
        var m2 = text.match(/https?:\/\/([a-z0-9.-]+\.mrstcdn\.store)\/([0-9a-f-]{36})([^"'\s]*)/i);
        if (m2) {
            return { cdnHost: m2[1], uuid: m2[2], path: m2[3] || "/playlist.m3u8" };
        }
        return null;
    },

    findCleanUuid: function (text) {
        if (!text) return "";
        var re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
        var matches = text.match(re) || [];
        for (var i = 0; i < matches.length; i++) {
            var u = matches[i];
            var idx = text.indexOf(u);
            var ctx = text.substring(Math.max(0, idx - 100), Math.min(text.length, idx + 100)).toLowerCase();
            var isBad = false;
            for (var j = 0; j < this.UUID_BLACKLIST.length; j++) {
                if (ctx.indexOf(this.UUID_BLACKLIST[j]) !== -1) { isBad = true; break; }
            }
            if (!isBad) return u;
        }
        return "";
    },

    scan: function (html) {
        if (!html) return { url: "", source: "empty" };
        var candidates = [];

        // S1: direct m3u8
        var directM3u8 = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/gi);
        if (directM3u8) {
            for (var i = 0; i < directM3u8.length; i++) {
                var u = directM3u8[i].replace(/\\\//g, "/");
                if (u.indexOf("preview") === -1) candidates.push({ url: u, source: "direct_m3u8" });
            }
        }

        // S2: unpack eval
        var unpacked = this.unpackEval(html);
        if (unpacked) {
            var cdn1 = this.findCdnUrl(unpacked);
            if (cdn1) {
                var url1 = "https://" + cdn1.cdnHost + "/" + cdn1.uuid + cdn1.path;
                if (url1.indexOf(".m3u8") === -1) url1 += "/playlist.m3u8";
                candidates.push({ url: url1, source: "unpacked_eval" });
            }
            var m3u8InUnpacked = unpacked.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/gi);
            if (m3u8InUnpacked) {
                for (var j = 0; j < m3u8InUnpacked.length; j++) {
                    var u2 = m3u8InUnpacked[j].replace(/\\\//g, "/");
                    if (u2.indexOf("preview") === -1) candidates.push({ url: u2, source: "unpacked_m3u8" });
                }
            }
        }

        // S3: cdn in HTML
        var cdn3 = this.findCdnUrl(html);
        if (cdn3) {
            var url3 = "https://" + cdn3.cdnHost + "/" + cdn3.uuid + cdn3.path;
            if (url3.indexOf(".m3u8") === -1) url3 += "/playlist.m3u8";
            candidates.push({ url: url3, source: "cdn_html" });
        }

        // S4: data attributes
        var dataAttrs = html.match(/data-(?:source|stream|url|src|hls)="([^"]+\.m3u8[^"]*)"/gi);
        if (dataAttrs) {
            for (var k = 0; k < dataAttrs.length; k++) {
                var m4 = dataAttrs[k].match(/="([^"]+)"/);
                if (m4) candidates.push({ url: m4[1], source: "data_attr" });
            }
        }

        // S5: JS vars
        var jsVarPatterns = [
            /source\s*[:=]\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i,
            /streamUrl\s*[:=]\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i,
            /masterUrl\s*[:=]\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i,
            /videoUrl\s*[:=]\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i,
            /hls\.loadSource\s*\(\s*['"]([^'"]+)['"]/i,
            /file\s*:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i
        ];
        for (var p = 0; p < jsVarPatterns.length; p++) {
            var vm = html.match(jsVarPatterns[p]);
            if (vm && vm[1]) candidates.push({ url: vm[1], source: "js_var_" + p });
        }

        // S6: JSON-LD
        var jsonLdMatches = html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi);
        if (jsonLdMatches) {
            for (var q = 0; q < jsonLdMatches.length; q++) {
                var cm = jsonLdMatches[q].match(/"contentUrl"\s*:\s*"([^"]+)"/i);
                if (cm && cm[1]) candidates.push({ url: cm[1], source: "jsonld" });
            }
        }

        // S7: deep UUID → mrstcdn + surrit
        var uuid7 = this.findCleanUuid(html);
        if (uuid7) {
            candidates.push({ url: "https://surrit.mrstcdn.store/" + uuid7 + "/playlist.m3u8", source: "uuid_deep_mrstcdn" });
            candidates.push({ url: "https://surrit.com/" + uuid7 + "/playlist.m3u8", source: "uuid_deep_surrit" });
        }

        // S8: UUID từ eval parts
        var evalPartsMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalPartsMatch) {
            var parts = evalPartsMatch[1].split("|");
            var uuidParts = [];
            for (var r = 0; r < parts.length; r++) {
                if (/^[0-9a-f]{8,12}$/.test(parts[r])) uuidParts.push(parts[r]);
            }
            if (uuidParts.length >= 5) {
                var uuid8 = uuidParts[0] + "-" + uuidParts[1] + "-" + uuidParts[2] + "-" + uuidParts[3] + "-" + uuidParts[4];
                candidates.push({ url: "https://surrit.mrstcdn.store/" + uuid8 + "/playlist.m3u8", source: "eval_uuid_mrstcdn" });
                candidates.push({ url: "https://surrit.com/" + uuid8 + "/playlist.m3u8", source: "eval_uuid_surrit" });
            }
        }

        // S9: og:video / twitter:player:stream
        var ogVideo = html.match(/property="og:video(?::url|:secure_url)?"\s+content="([^"]+)"/i);
        if (ogVideo && ogVideo[1]) candidates.push({ url: ogVideo[1], source: "og_video" });

        var twitterStream = html.match(/name="twitter:player:stream"\s+content="([^"]+)"/i);
        if (twitterStream && twitterStream[1]) candidates.push({ url: twitterStream[1], source: "twitter_stream" });

        // Priority
        var priority = [
            "direct_m3u8", "unpacked_eval", "unpacked_m3u8", "cdn_html",
            "data_attr", "js_var_4", "js_var_0", "js_var_1", "js_var_2",
            "js_var_3", "js_var_5", "jsonld", "og_video", "twitter_stream",
            "eval_uuid_mrstcdn", "uuid_deep_mrstcdn", "eval_uuid_surrit", "uuid_deep_surrit"
        ];

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
// PARSERS
// =============================================================================

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    var isSearchPage = html.indexOf('window.recombeeClient.send(new recombee.SearchItems') !== -1 ||
        (html.indexOf('x-data="{') !== -1 && html.indexOf('recommendItems') !== -1);

    if (isSearchPage) {
        return JSON.stringify({
            items: [{
                id: "/vi",
                title: "⚠️ Tìm kiếm MissAV chưa hỗ trợ",
                posterUrl: "",
                backdropUrl: "",
                description: "Trang tìm kiếm dùng Alpine.js + Recombee API, không parse được từ HTML tĩnh.",
                year: 0, quality: "INFO", episode_current: "", lang: ""
            }],
            pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 1 }
        });
    }

    var actressLinkMatch = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
    var isActressesPage = (actressLinkMatch && actressLinkMatch.length > 5);

    var isAllGenresPage = !isActressesPage &&
        html.indexOf('class="text-nord13"') !== -1 &&
        html.indexOf(':đếm video') !== -1;

    if (isActressesPage) {
        var gridMatch = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
        var searchScope = gridMatch ? gridMatch[1] : html;
        var blockedNames = ["Tiếng Việt", "English", "繁體中文", "简体中文", "日本語", "한국의", "Melayu", "ไทย", "Deutsch", "Français", "Bahasa Indonesia", "Filipino", "Português", "MissAV"];
        var foundActresses = {};
        var liRegex = /<li[\s\S]*?<\/li>/gi;
        var match;

        while ((match = liRegex.exec(searchScope)) !== null) {
            var itemHtml = match[0];
            var urlMatch = itemHtml.match(/href="([^"]*\/actresses\/[^"]+)"/);
            if (!urlMatch) continue;
            var url = urlMatch[1];
            if (url.indexOf('?') !== -1) continue;

            var nameMatch = itemHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
            var nameRaw = nameMatch ? nameMatch[1] : "";
            if (!nameRaw) {
                var altMatch = itemHtml.match(/<img[^>]+alt="([^"]+)"/);
                if (altMatch) nameRaw = altMatch[1];
            }
            var name = PluginUtils.cleanText(nameRaw);
            if (!name || name.length < 2) continue;
            if (name.indexOf(':đếm') !== -1) continue;

            var isBlocked = false;
            for (var k = 0; k < blockedNames.length; k++) {
                if (name === blockedNames[k]) { isBlocked = true; break; }
            }
            if (isBlocked) continue;

            var imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
            var img = imgMatch ? imgMatch[1] : "";
            if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";

            var slug = url.replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) slug = "/" + slug;

            if (!foundActresses[slug]) {
                movies.push({
                    id: slug, title: name, posterUrl: img, backdropUrl: img,
                    description: "Nữ diễn viên", year: 0, quality: "ACTRESS",
                    episode_current: "", lang: ""
                });
                foundActresses[slug] = true;
            }
        }
    } else if (isAllGenresPage) {
        var genreRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var foundSlugs = {};
        var gMatch;
        while ((gMatch = genreRegex.exec(html)) !== null) {
            var gUrl = gMatch[1];
            var innerContent = gMatch[2];
            if (gUrl.indexOf('/genres/') !== -1 && innerContent.indexOf(':đếm video') === -1) {
                var gName = PluginUtils.cleanText(innerContent);
                if (!gName || gName.length < 2) continue;
                var gSlug = gUrl.replace(/https?:\/\/[^\/]+/, "");
                if (gSlug.indexOf("/") !== 0) gSlug = "/" + gSlug;
                if (!foundSlugs[gSlug]) {
                    movies.push({
                        id: gSlug, title: gName, posterUrl: "", backdropUrl: "",
                        description: "Thể loại", year: 0, quality: "CAT",
                        episode_current: "", lang: ""
                    });
                    foundSlugs[gSlug] = true;
                }
            }
        }
    }

    if (movies.length === 0) {
        var parts = html.split('thumbnail group');
        if (parts.length <= 1) parts = html.split('class="thumbnail');

        for (var i = 1; i < parts.length; i++) {
            var itemHtml2 = parts[i];
            var linkMatch = itemHtml2.match(/<a[^>]+href="[^"]*\/vi\/([^"\/ \?]+)"/);
            var slug = linkMatch ? "vi/" + linkMatch[1] : "";

            var fullLinkMatch = itemHtml2.match(/<a[^>]+href="([^"]+)"/);
            if (fullLinkMatch) {
                var fullUrl = fullLinkMatch[1];
                slug = fullUrl.replace(/https?:\/\/[^\/]+/, "");
                if (slug.indexOf("/") !== 0) slug = "/" + slug;
            }

            var codeMatch = itemHtml2.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";
            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            var titleCandidates = [];
            var imgFullMatch = itemHtml2.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            if (imgFullMatch) titleCandidates.push(PluginUtils.cleanText(imgFullMatch[1]));
            var otherTitleRegex = /title="([^"]+)"/gi;
            var tMatch;
            while ((tMatch = otherTitleRegex.exec(itemHtml2)) !== null) {
                var val = PluginUtils.cleanText(tMatch[1]);
                if (val.toUpperCase() !== code.toUpperCase()) titleCandidates.push(val);
            }
            var bestTitle = "";
            for (var c = 0; c < titleCandidates.length; c++) {
                if (titleCandidates[c].length > bestTitle.length) bestTitle = titleCandidates[c];
            }
            var cleanTitle = bestTitle || code;
            if (code && cleanTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
                var stripped = cleanTitle.substring(code.length).trim();
                if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) stripped = stripped.substring(1).trim();
                if (stripped.length > 3) cleanTitle = stripped;
            }
            if (!cleanTitle) cleanTitle = code || "No Title";

            var thumbMatch = itemHtml2.match(/<img[\s\S]*?data-src="([^"]+)"/) ||
                itemHtml2.match(/<img[\s\S]*?src="([^"]+)"/);
            var thumb = thumbMatch ? thumbMatch[1] : "";
            if (thumb && thumb.indexOf("cover-t.jpg") !== -1) thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");

            if (slug && !slug.includes("actresses") && !slug.includes("genres")) {
                if (slug.indexOf('item.') !== -1 || slug.indexOf('{{') !== -1 || slug === "/" || slug === "#") continue;
                if (cleanTitle.indexOf('item.') !== -1 || cleanTitle.indexOf('{{') !== -1) continue;
                if (thumb.indexOf('item.') !== -1 || thumb.indexOf('itemUrl') !== -1) continue;

                var durationMatch = itemHtml2.match(/<span[^>]*>\s*(\d+):(\d+):(\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] + ":" + durationMatch[2] + ":" + durationMatch[3] : "";

                var isUncensored = itemHtml2.indexOf("Không kiểm duyệt") !== -1 ||
                    itemHtml2.indexOf("Uncensored") !== -1 ||
                    itemHtml2.indexOf("bg-blue-800") !== -1;

                var previewUrl = PluginUtils.extractPreviewUrl(itemHtml2);

                movies.push({
                    id: slug, title: cleanTitle, posterUrl: thumb, backdropUrl: thumb,
                    description: duration, year: 0,
                    quality: isUncensored ? "K.K.Duyệt" : "HD",
                    episode_current: isUncensored ? "K.K.Duyệt" : "Full",
                    lang: code, previewUrl: previewUrl
                });
            }
        }
    }

    var totalPages = 1;
    var currentPage = 1;
    var currentMatch = html.match(/<span[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i) ||
        html.match(/<a[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/a>/i);
    if (currentMatch) currentPage = parseInt(currentMatch[1]);

    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var j = 0; j < allPageNums.length; j++) {
            var p = parseInt(allPageNums[j].match(/\d+/)[0]);
            if (p > totalPages) totalPages = p;
        }
    }

    var inputPageMatch = html.match(/name="page" value="(\d+)"/) || html.match(/type="number" value="(\d+)"/);
    if (inputPageMatch) {
        var pVal = parseInt(inputPageMatch[1]);
        if (pVal > 0) currentPage = Math.max(currentPage, pVal);
    }

    var totalLabelMatch = html.match(/\/ (\d+)\s*<\/span>/) ||
        html.match(/>(\d+)<\/a>\s*<a[^>]*aria-label="Next"/i) ||
        html.match(/page=(\d+)[^>]*aria-label="Last"/i);
    if (totalLabelMatch) {
        var tVal = parseInt(totalLabelMatch[1]);
        if (tVal > 0) totalPages = Math.max(totalPages, tVal);
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

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html);
    try {
        var getSlug = function (url) {
            if (!url) return "";
            return url.replace(/^https?:\/\/[^\/]+/, "");
        };

        var getField = function (labelKey) {
            var regex = new RegExp("<span>" + labelKey + ":<\\/span>([\\s\\S]*?)<\\/div>", "i");
            var match = html.match(regex);
            if (!match) return "";
            var content = match[1];
            var linkMatch = content.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
            if (linkMatch) {
                var url = linkMatch[1];
                var text = PluginUtils.cleanText(linkMatch[2]);
                return "[" + text + "](" + getSlug(url) + ")";
            }
            var timeMatch = content
