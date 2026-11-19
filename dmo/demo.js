var BASE_URL = "https://missav.media/en";
var SITE_ORIGIN = "https://missav.media";
var SITE_REFERER = "https://missav.media/en/";
var EMBED_REFERER = "https://missav.media/en/";

function trimStr(str) {
    if (!str || typeof str !== "string") {
        return "";
    }
    return str.replace(/^\s+|\s+$/g, "");
}

function getOriginReferer(targetUrl, fallbackUrl) {
    var source = targetUrl || fallbackUrl || "";
    var match = source.match(/^(https?:\/\/[^/]+)\//i);
    return match ? match[1] + "/" : fallbackUrl;
}

function resolveUrl(rawUrl, baseUrl) {
    var trimmed = trimStr(rawUrl);
    if (!trimmed) {
        return "";
    }
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    if (/^\/\//.test(trimmed)) {
        var protoMatch = (baseUrl || BASE_URL).match(/^(https?:)/i);
        var proto = protoMatch ? protoMatch[1] : "https:";
        return proto + trimmed;
    }
    var origin = getOriginReferer(baseUrl, SITE_REFERER);
    if (trimmed.charAt(0) === "/") {
        return origin.replace(/\/$/, "") + trimmed;
    }
    return BASE_URL.replace(/\/$/, "") + "/" + trimmed.replace(/^\/+/, "");
}

function parsePageNumber(filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = filters && filters.page ? parseInt(filters.page, 10) : 1;
    return (!isNaN(page) && page > 0) ? page : 1;
}

// === 1. MANIFEST & ĐIỀU HƯỚNG ===

function getManifest() {
    return JSON.stringify({
        "id": "missav2",
        "name": "MissAV 2",
        "version": "1.1.3",
        "baseUrl": BASE_URL,
        "fallbackUrls": ["https://missav123.com", "https://missav.media"],
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "subtitleCat": true,
        "imageReferer": SITE_REFERER
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "today-hot", title: "Hot Hôm Nay", type: "Horizontal", path: "" },
        { slug: "weekly-hot", title: "Hot Trong Tuần", type: "Horizontal", path: "" },
        { slug: "monthly-hot", title: "Hot Trong Tháng", type: "Horizontal", path: "" },
        { slug: "uncensored-leak", title: "Không Che (Rò Rỉ)", type: "Horizontal", path: "" },
        { slug: "release", title: "Mới Cập Nhật", type: "Grid", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới cập nhật", slug: "new" },
        { name: "Nữ diễn viên", slug: "actresses" },
        { name: "Thể loại", slug: "genres" },
        { name: "Không che", slug: "uncensored-leak" },
        { name: "FC2", slug: "fc2" },
        { name: "HEYZO", slug: "heyzo" },
        { name: "Tokyo Hot", slug: "tokyohot" },
        { name: "1pondo", slug: "1pondo" },
        { name: "Caribbeancom", slug: "caribbeancom" },
        { name: "Caribbeancompr", slug: "caribbeancompr" },
        { name: "10musume", slug: "10musume" },
        { name: "pacopacomama", slug: "pacopacomama" },
        { name: "Gachinco", slug: "gachinco" },
        { name: "XXX-AV", slug: "xxx-av" },
        { name: "MarriedSlash", slug: "marriedslash" },
        { name: "Naughty4610", slug: "naughty4610" },
        { name: "Naughty0930", slug: "naughty0930" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "new" },
            { name: "Xem nhiều", value: "views" },
            { name: "Hôm nay", value: "today_views" },
            { name: "Tuần này", value: "weekly_views" },
            { name: "Tháng này", value: "monthly_views" }
        ],
        category: [
            { name: "Tất cả thể loại", value: "genres" },
            { name: "Mới cập nhật", value: "new" },
            { name: "Phát hành mới", value: "release" },
            { name: "Không che (Rò rỉ)", value: "uncensored-leak" },
            { name: "Nữ diễn viên", value: "actresses" },
            { name: "BXH Diễn viên", value: "actresses/ranking" },
            { name: "Nhà sản xuất", value: "makers" },
            { name: "VR", value: "genres/VR" },
            { name: "Xem nhiều hôm nay", value: "today-hot" },
            { name: "Xem nhiều tuần", value: "weekly-hot" },
            { name: "Xem nhiều tháng", value: "monthly-hot" },
            { name: "Phụ đề Anh", value: "english-subtitle" },
            { name: "Phụ đề China", value: "chinese-subtitle" },

            // Amateur
            { name: "SIRO", value: "series/SIRO" },
            { name: "LUXU", value: "series/LUXU" },
            { name: "GANA", value: "series/GANA" },
            { name: "MAAN", value: "series/MAAN" },
            { name: "S-CUTE", value: "series/S-CUTE" },
            { name: "ARA", value: "series/ARA" },

            // Uncensored Brands
            { name: "FC2", value: "series/FC2" },
            { name: "HEYZO", value: "series/HEYZO" },
            { name: "Tokyo Hot", value: "series/Tokyo-Hot" },
            { name: "1pondo", value: "series/1pondo" },
            { name: "Caribbeancom", value: "series/Caribbeancom" },
            { name: "Caribbeancompr", value: "series/Caribbeancompr" },
            { name: "10musume", value: "series/10musume" },
            { name: "pacopacomama", value: "series/pacopacomama" },
            { name: "Gachinco", value: "series/Gachinco" },
            { name: "XXX-AV", value: "series/XXX-AV" },
            { name: "MarriedSlash", value: "series/MarriedSlash" },
            { name: "Naughty4610", value: "series/naughty4610" },
            { name: "Naughty0930", value: "series/naughty0930" }
        ]
    });
}

// === 2. BỘ SINH URL ===

function normalizeSlugForEn(rawSlug) {
    var clean = trimStr(rawSlug || "");
    clean = clean.replace(/^https?:\/\/[^/]+/i, "");
    clean = clean.replace(/^\/?(?:vi|en)\//i, "");
    clean = clean.replace(/^\/+|\/+$/g, "");
    return clean;
}

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }
    var page = parsePageNumber(filtersJson);
    var relPath = normalizeSlugForEn(slug || "new") || "new";

    var url = BASE_URL + "/" + relPath + "?page=" + page;
    if (filters.sort && filters.sort !== "new" && filters.sort !== "hot") {
        url += "&sort=" + encodeURIComponent(filters.sort);
    } else if (filters.sort === "hot") {
        url += "&sort=views";
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var page = parsePageNumber(filtersJson);
    var safeKeyword = encodeURIComponent(trimStr(typeof keyword === "string" ? keyword : ""));
    return BASE_URL + "/search/" + safeKeyword + "?page=" + page;
}

function getUrlDetail(slug) {
    var clean = trimStr(slug);
    if (!clean) {
        return "";
    }
    if (/^https?:\/\//i.test(clean)) {
        return clean;
    }
    var relPath = normalizeSlugForEn(clean);
    if (!relPath) {
        return BASE_URL;
    }
    return BASE_URL + "/" + relPath;
}

function getUrlCategories() { return BASE_URL + "/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// === 3. UTILS & PARSE DANH SÁCH / CHI TIẾT ===

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) {
            return "";
        }
        return html.replace(/class="([^"]*)"/g, function (fullMatch, classValue) {
            var normalized = classValue.replace(/missav_media-/g, "");
            return 'class="' + normalized + '"';
        });
    },
    cleanText: function (text) {
        if (!text) {
            return "";
        }
        return trimStr(
            String(text)
                .replace(/<[^>]*>/g, "")
                .replace(/&/g, "&")
                .replace(/"/g, '"')
                .replace(/'/g, "'")
                .replace(/</g, "<")
                .replace(/>/g, ">")
                .replace(/\s+/g, " ")
        );
    },
    toRelativeSlug: function (url) {
        if (!url) {
            return "";
        }
        var clean = String(url).replace(/^https?:\/\/[^/]+/i, "");
        if (clean.indexOf("/") !== 0) {
            clean = "/" + clean;
        }
        return clean;
    },
    getMeta: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', "i");
        var match = html.match(regex);
        return match ? match[1] : "";
    }
};

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html || "");
    var movies = [];

    var isSearchPage = html.indexOf("window.recombeeClient.send(new recombee.SearchItems") !== -1 ||
        (html.indexOf('x-data="{') !== -1 && html.indexOf("recommendItems") !== -1);

    if (isSearchPage) {
        return JSON.stringify({
            items: [{
                id: "/en",
                title: "Tìm kiếm MissAV chưa hỗ trợ",
                posterUrl: "",
                backdropUrl: "",
                description: "Trang tìm kiếm tải động bằng JavaScript/Recombee nên không thể parse từ HTML tĩnh. Hãy duyệt theo Thể loại hoặc các mục Hot/Mới cập nhật.",
                year: 0,
                quality: "INFO",
                episode_current: "",
                lang: ""
            }],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 1,
                itemsPerPage: 1
            }
        });
    }

    var actressLinkMatch = html.match(/href="[^"]*\/actresses\/[^"]+"/g);
    var isActressesPage = !!(actressLinkMatch && actressLinkMatch.length > 5);

    var isAllGenresPage = !isActressesPage &&
        html.indexOf('class="text-nord13"') !== -1 &&
        (html.indexOf(":đếm video") !== -1 || html.indexOf("videos") !== -1);

    if (isActressesPage) {
        var gridMatch = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
        var searchScope = gridMatch ? gridMatch[1] : html;
        var blockedNames = [
            "Tiếng Việt", "English", "繁體中文", "简体中文", "日本語", "한국의",
            "Melayu", "ไทย", "Deutsch", "Français", "Bahasa Indonesia", "Filipino",
            "Português", "MissAV"
        ];
        var foundActresses = {};
        var liRegex = /<li[\s\S]*?<\/li>/gi;
        var match;

        while ((match = liRegex.exec(searchScope)) !== null) {
            var itemHtml = match[0];
            var urlMatch = itemHtml.match(/href="([^"]*\/actresses\/[^"]+)"/);
            if (!urlMatch) {
                continue;
            }
            var url = urlMatch[1];
            if (url.indexOf("?") !== -1) {
                continue;
            }

            var nameMatch = itemHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
            var nameRaw = nameMatch ? nameMatch[1] : "";
            if (!nameRaw) {
                var altMatch = itemHtml.match(/<img[^>]+alt="([^"]+)"/);
                if (altMatch) {
                    nameRaw = altMatch[1];
                }
            }

            var name = PluginUtils.cleanText(nameRaw);
            if (!name || name.length < 2 || name.indexOf(":đếm") !== -1) {
                continue;
            }

            var isBlocked = false;
            for (var k = 0; k < blockedNames.length; k++) {
                if (name === blockedNames[k]) {
                    isBlocked = true;
                    break;
                }
            }
            if (isBlocked) {
                continue;
            }

            var imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
            var img = imgMatch ? resolveUrl(imgMatch[1], BASE_URL) : "";
            if (img.indexOf("flag") !== -1 || img.indexOf("icon") !== -1) {
                img = "";
            }

            var slug = PluginUtils.toRelativeSlug(url);
            if (!foundActresses[slug]) {
                movies.push({
                    id: slug,
                    title: name,
                    posterUrl: img,
                    backdropUrl: img,
                    description: "Nữ diễn viên",
                    year: 0,
                    quality: "ACTRESS",
                    episode_current: "",
                    lang: ""
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
            if (gUrl.indexOf("/genres/") !== -1 && innerContent.indexOf(":đếm video") === -1) {
                var gName = PluginUtils.cleanText(innerContent);
                if (!gName || gName.length < 2) {
                    continue;
                }
                var gSlug = PluginUtils.toRelativeSlug(gUrl);
                if (!foundSlugs[gSlug]) {
                    movies.push({
                        id: gSlug,
                        title: gName,
                        posterUrl: "",
                        backdropUrl: "",
                        description: "Thể loại",
                        year: 0,
                        quality: "CAT",
                        episode_current: "",
                        lang: ""
                    });
                    foundSlugs[gSlug] = true;
                }
            }
        }
    }

    if (movies.length === 0) {
        var parts = html.split("thumbnail group");
        if (parts.length <= 1) {
            parts = html.split('class="thumbnail');
        }

        for (var i = 1; i < parts.length; i++) {
            var itemPart = parts[i];
            var fullLinkMatch = itemPart.match(/<a[^>]+href="([^"]+)"/);
            var slug = fullLinkMatch ? PluginUtils.toRelativeSlug(fullLinkMatch[1]) : "";

            var codeMatch = itemPart.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";
            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            var titleCandidates = [];
            var imgFullMatch = itemPart.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            if (imgFullMatch) {
                titleCandidates.push(PluginUtils.cleanText(imgFullMatch[1]));
            }

            var otherTitleRegex = /title="([^"]+)"/gi;
            var tMatch;
            while ((tMatch = otherTitleRegex.exec(itemPart)) !== null) {
                var val = PluginUtils.cleanText(tMatch[1]);
                if (val.toUpperCase() !== code.toUpperCase()) {
                    titleCandidates.push(val);
                }
            }

            var bestTitle = "";
            for (var c = 0; c < titleCandidates.length; c++) {
                if (titleCandidates[c].length > bestTitle.length) {
                    bestTitle = titleCandidates[c];
                }
            }

            var cleanTitle = bestTitle || code;
            if (code && cleanTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
                var stripped = trimStr(cleanTitle.substring(code.length));
                if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) {
                    stripped = trimStr(stripped.substring(1));
                }
                if (stripped.length > 3) {
                    cleanTitle = stripped;
                }
            }
            if (!cleanTitle) {
                cleanTitle = code || "No Title";
            }

            var thumbMatch = itemPart.match(/<img[\s\S]*?data-src="([^"]+)"/) ||
                itemPart.match(/<img[\s\S]*?src="([^"]+)"/);
            var thumb = thumbMatch ? resolveUrl(thumbMatch[1], BASE_URL) : "";
            if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
                thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");
            }

            if (slug && slug.indexOf("/actresses") === -1 && slug.indexOf("/genres") === -1) {
                if (slug.indexOf("item.") !== -1 || slug.indexOf("{{") !== -1 || slug === "/" || slug === "#") {
                    continue;
                }
                if (cleanTitle.indexOf("item.") !== -1 || cleanTitle.indexOf("{{") !== -1) {
                    continue;
                }
                if (thumb.indexOf("item.") !== -1 || thumb.indexOf("itemUrl") !== -1) {
                    continue;
                }

                var durationMatch = itemPart.match(/<span[^>]*>\s*(\d+:\d+:\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] : "";

                var isUncensored = itemPart.indexOf("Không kiểm duyệt") !== -1 ||
                    itemPart.indexOf("Uncensored") !== -1 ||
                    itemPart.indexOf("bg-blue-800") !== -1;

                var previewMatch = itemPart.match(/<video[^>]+data-src="([^"]+)"/);
                var previewUrl = previewMatch ? resolveUrl(previewMatch[1], BASE_URL) : "";

                movies.push({
                    id: slug,
                    title: cleanTitle,
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    description: duration,
                    year: 0,
                    quality: isUncensored ? "K.K.Duyệt" : "HD",
                    episode_current: isUncensored ? "K.K.Duyệt" : "Full",
                    lang: code,
                    previewUrl: previewUrl
                });
            }
        }
    }

    var totalPages = 1;
    var currentPage = 1;

    var currentMatch = html.match(/<(?:span|a)[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/(?:span|a)>/i);
    if (currentMatch) {
        currentPage = parseInt(currentMatch[1], 10);
    }

    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var j = 0; j < allPageNums.length; j++) {
            var pMatch = allPageNums[j].match(/\d+/);
            if (pMatch) {
                var p = parseInt(pMatch[0], 10);
                if (p > totalPages) {
                    totalPages = p;
                }
            }
        }
    }

    var inputPageMatch = html.match(/name="page"[^>]*value="(\d+)"/) || html.match(/type="number"[^>]*value="(\d+)"/);
    if (inputPageMatch) {
        var pVal = parseInt(inputPageMatch[1], 10);
        if (pVal > currentPage) {
            currentPage = pVal;
        }
    }

    var totalLabelMatch = html.match(/\/\s*(\d+)\s*<\/span>/) ||
        html.match(/>(\d+)<\/a>\s*<a[^>]*aria-label="Next"/i) ||
        html.match(/page=(\d+)[^>]*aria-label="Last"/i);
    if (totalLabelMatch) {
        var tVal = parseInt(totalLabelMatch[1], 10);
        if (tVal > totalPages) {
            totalPages = tVal;
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

function extractStreamFromHtml(html) {
    var uuid = "";
    var streamUrl = "";
    if (!html || typeof html !== "string") {
        return { uuid: "", streamUrl: "" };
    }

    var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
    if (evalMatch) {
        var parts = evalMatch[1].split("|");
        var hasSurrit = false;
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === "surrit" || parts[i] === "sixyik") {
                hasSurrit = true;
                break;
            }
        }
        if (hasSurrit) {
            var uuidParts = [];
            for (var uIdx = 0; uIdx < parts.length; uIdx++) {
                if (/^[0-9a-f]{8,12}$/i.test(parts[uIdx])) {
                    uuidParts.push(parts[uIdx]);
                }
            }
            if (uuidParts.length >= 5) {
                uuid = uuidParts[0] + "-" + uuidParts[1] + "-" + uuidParts[2] + "-" + uuidParts[3] + "-" + uuidParts[4];
            }
        }
    }

    if (!uuid) {
        var domainMatch = html.match(/(?:surrit|sixyik|nineyu|fourhoi)\.com\/([0-9a-f-]{36})/i);
        if (domainMatch) {
            uuid = domainMatch[1];
        }
    }

    if (!uuid) {
        var directM3u8 = html.match(/(https?:\/\/[^\s"'\\<>]+\.m3u8(?:\?[^\s"'\\<>]*)?)/i);
        if (directM3u8 && directM3u8[1]) {
            streamUrl = directM3u8[1];
        }
    }

    if (!uuid && !streamUrl) {
        var uuidMatches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
        var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID"];
        for (var mIdx = 0; mIdx < uuidMatches.length; mIdx++) {
            var candidate = uuidMatches[mIdx];
            var isBad = false;
            var pos = html.indexOf(candidate);
            if (pos !== -1) {
                var ctx = html.substring(Math.max(0, pos - 50), Math.min(html.length, pos + 50));
                for (var bIdx = 0; bIdx < blacklist.length; bIdx++) {
                    if (ctx.indexOf(blacklist[bIdx]) !== -1) {
                        isBad = true;
                        break;
                    }
                }
            }
            if (!isBad) {
                uuid = candidate;
                break;
            }
        }
    }

    if (uuid && !streamUrl) {
        streamUrl = "https://surrit.com/" + uuid + "/playlist.m3u8";
    }

    return { uuid: uuid, streamUrl: streamUrl };
}

function parseMovieDetail(html, pageUrl) {
    html = PluginUtils.normalizeHtml(html || "");
    try {
        var getField = function (labelKey) {
            var regex = new RegExp("<span>" + labelKey + ":<\\/span>([\\s\\S]*?)<\\/div>", "i");
            var match = html.match(regex);
            if (!match) {
                return "";
            }
            var content = match[1];
            var linkMatch = content.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
            if (linkMatch) {
                return "[" + PluginUtils.cleanText(linkMatch[2]) + "](" + PluginUtils.toRelativeSlug(linkMatch[1]) + ")";
            }
            var timeMatch = content.match(/<time[^>]*>([^<]+)<\/time>/i);
            if (timeMatch) {
                return PluginUtils.cleanText(timeMatch[1]);
            }
            var spanMatch = content.match(/<span[^>]*>([^<]+)<\/span>/i);
            if (spanMatch) {
                return PluginUtils.cleanText(spanMatch[1]);
            }
            return PluginUtils.cleanText(content);
        };

        var getMultiField = function (labelKey) {
            var regexStart = new RegExp("<span>" + labelKey + ":<\\/span>", "i");
            var matchStart = html.match(regexStart);
            if (!matchStart) {
                return "";
            }
            var startIndex = matchStart.index + matchStart[0].length;
            var searchArea = html.substring(startIndex);
            var divEnd = searchArea.indexOf("</div>");
            var content = divEnd !== -1 ? searchArea.substring(0, divEnd) : searchArea;

            var items = [];
            var linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
            var linkMatch;
            while ((linkMatch = linkRegex.exec(content)) !== null) {
                var rawInner = linkMatch[2];
                if (rawInner.indexOf("<img") !== -1) {
                    continue;
                }
                var text = PluginUtils.cleanText(rawInner);
                if (text) {
                    items.push("[" + text + "](" + PluginUtils.toRelativeSlug(linkMatch[1]) + ")");
                }
            }
            return items.join(", ");
        };

        var code = getField("Mã số") || getField("Code");
        var releaseDate = getField("Ngày phát hành") || getField("Release date");
        var studio = getField("nhà sản xuất") || getField("Maker");
        var director = getField("Giám đốc") || getField("Director");
        var label = getField("Nhãn") || getField("Label");

        var casts = getMultiField("Nữ diễn viên") || getMultiField("Actresses");
        var genres = getMultiField("thể loại") || getMultiField("Genre") || getMultiField("Genres");
        var series = getMultiField("Loạt") || getMultiField("Series");

        if (!code) {
            var dvdIdMatch = html.match(/dvdId:\s*'([^']+)'/);
            code = dvdIdMatch ? dvdIdMatch[1] : "";
        }

        var title = PluginUtils.getMeta(html, "og:title");
        var thumb = resolveUrl(PluginUtils.getMeta(html, "og:image"), BASE_URL);
        var desc = PluginUtils.getMeta(html, "og:description");

        var previewMatch = html.match(/<video[^>]+data-src="([^"]+)"/) || html.match(/video_url:\s*'([^']+)'/);
        var previewUrl = previewMatch ? resolveUrl(previewMatch[1], BASE_URL) : "";
        if (!previewUrl && thumb && thumb.indexOf("cover.jpg") !== -1) {
            previewUrl = thumb.replace("cover.jpg", "preview.mp4");
        }

        var displayTitle = title;
        if (code && displayTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            var stripped = trimStr(displayTitle.substring(code.length));
            if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) {
                stripped = trimStr(stripped.substring(1));
            }
            if (stripped.length > 0) {
                displayTitle = stripped;
            }
        }
        if (code) {
            displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;
        }

        var titleWords = displayTitle.split(" ");
        if (titleWords.length > 25) {
            displayTitle = titleWords.slice(0, 25).join(" ") + "...";
        }

        var extracted = extractStreamFromHtml(html);
        var servers = [];
        if (extracted.streamUrl) {
            var episodeId = pageUrl || extracted.streamUrl;
            servers.push({
                name: "Stream",
                episodes: [{
                    id: episodeId,
                    name: "Full",
                    slug: "full"
                }]
            });
        }

        var statusLine = "";
        if (studio) {
            statusLine += "Studio: " + studio;
        }
        if (label) {
            statusLine += (statusLine ? " | " : "") + "Label: " + label;
        }
        if (!statusLine && releaseDate) {
            statusLine = "Released: " + releaseDate;
        }

        var year = releaseDate ? (parseInt(releaseDate.substring(0, 4), 10) || 0) : 0;

        return JSON.stringify({
            id: code || "",
            title: PluginUtils.cleanText(displayTitle),
            posterUrl: thumb,
            backdropUrl: thumb,
            description: PluginUtils.cleanText(desc),
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: year,
            rating: 0,
            casts: casts,
            director: director,
            category: genres,
            status: statusLine,
            duration: series ? "Series: " + series : "",
            previewUrl: previewUrl || ""
        });
    } catch (e) {
        return "null";
    }
}

// === 4. PARSE EMBED / STREAM ===

function parseDetailResponse(html, fetchedUrl) {
    try {
        if (!html || typeof html !== "string") {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var referer = getOriginReferer(fetchedUrl, SITE_REFERER);
        var extracted = extractStreamFromHtml(html);
        if (extracted.streamUrl) {
            return JSON.stringify({
                url: extracted.streamUrl,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "Referer": referer
                }
            });
        }

        return parseEmbedResponse(html, fetchedUrl || BASE_URL);
    } catch (error) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

function parseEmbedResponse(html, url) {
    try {
        if (!html || typeof html !== "string") {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var referer = getOriginReferer(url, EMBED_REFERER);
        var unescaped = html.replace(/\\\//g, "/");

        var extracted = extractStreamFromHtml(unescaped);
        if (extracted.streamUrl) {
            var isHls = /\.m3u8/i.test(extracted.streamUrl);
            return JSON.stringify({
                url: extracted.streamUrl,
                isEmbed: false,
                mimeType: isHls ? "application/x-mpegURL" : "video/mp4",
                headers: {
                    "Referer": referer
                }
            });
        }

        var iframeMatch = unescaped.match(/<iframe[^>]*src=["']([^"']+)["']/i);
        if (iframeMatch && iframeMatch[1]) {
            return JSON.stringify({
                url: resolveUrl(iframeMatch[1], referer),
                isEmbed: true,
                headers: {
                    "Referer": referer
                }
            });
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

// === 5. BỘ CHẠY ĐỆ QUY QUA XHR ===

function requestTextEs5(reqConfig, onSuccess, onError) {
    if (typeof XMLHttpRequest === "undefined") {
        onError(new Error("XMLHttpRequest is not available in this runtime; use host HTTP client."));
        return;
    }
    try {
        var method = reqConfig.postBody ? "POST" : "GET";
        var xhr = new XMLHttpRequest();
        xhr.open(method, reqConfig.url, true);

        var headers = reqConfig.headers || {};
        for (var key in headers) {
            if (headers.hasOwnProperty(key) && headers[key]) {
                try {
                    xhr.setRequestHeader(key, headers[key]);
                } catch (hdrErr) {}
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    onSuccess(xhr.responseText);
                } else {
                    onError(new Error("HTTP status " + xhr.status));
                }
            }
        };

        xhr.send(reqConfig.postBody || null);
    } catch (err) {
        onError(err);
    }
}

function resolveStreamFromDetail(detailHtml, fetchedUrl, options, callback) {
    var opts = options || {};
    var maxDepth = typeof opts.maxDepth === "number" ? opts.maxDepth : 5;
    var visited = opts.visited || {};

    var firstStepJson = parseDetailResponse(detailHtml, fetchedUrl);
    var firstStep;
    try {
        firstStep = JSON.parse(firstStepJson);
    } catch (e) {
        callback({ url: "", isEmbed: false, headers: {}, error: "Invalid detail parse JSON" });
        return;
    }

    if (!firstStep || !firstStep.url) {
        callback({ url: "", isEmbed: false, headers: {} });
        return;
    }

    if (!firstStep.isEmbed) {
        callback(firstStep);
        return;
    }

    function loopEmbed(reqSpec, depth) {
        if (depth > maxDepth) {
            callback({ url: "", isEmbed: false, headers: {}, error: "Max depth exceeded" });
            return;
        }

        var visitKey = reqSpec.url + "|" + (reqSpec.postBody || "");
        if (visited[visitKey]) {
            callback({ url: "", isEmbed: false, headers: {}, error: "Circular request detected" });
            return;
        }
        visited[visitKey] = true;

        requestTextEs5(
            reqSpec,
            function (respText) {
                var parsed;
                try {
                    parsed = JSON.parse(parseEmbedResponse(respText, reqSpec.url));
                } catch (parseErr) {
                    callback({ url: "", isEmbed: false, headers: {}, error: "Invalid embed parse JSON" });
                    return;
                }

                if (!parsed || !parsed.url) {
                    callback({ url: "", isEmbed: false, headers: {} });
                    return;
                }

                if (!parsed.isEmbed) {
                    callback(parsed);
                    return;
                }

                loopEmbed({
                    url: parsed.url,
                    postBody: "",
                    headers: parsed.headers || {}
                }, depth + 1);
            },
            function (err) {
                callback({
                    url: "",
                    isEmbed: false,
                    headers: {},
                    error: err && err.message ? err.message : "Request failed"
                });
            }
        );
    }

    loopEmbed(firstStep, 0);
}
