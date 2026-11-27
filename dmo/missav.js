// =============================================================================
// VAAPP Plugin — MissAV (Chuẩn hóa theo Plugin Template)
// =============================================================================

var BASE_URL = "https://missav.media";

// =============================================================================
// NHÓM 1: CẤU HÌNH (Config & Metadata)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "missav",
        "name": "MissAV",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "referrer": BASE_URL + "/",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/missav.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "playerType": "embed",
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
        { name: 'FC2', slug: 'vi/fc2' },
        { name: 'HEYZO', slug: 'vi/heyzo' },
        { name: 'Tokyo Hot', slug: 'vi/tokyohot' },
        { name: '1pondo', slug: 'vi/1pondo' },
        { name: 'Caribbeancom', slug: 'vi/caribbeancom' },
        { name: 'Caribbeancompr', slug: 'vi/caribbeancompr' },
        { name: '10musume', slug: 'vi/10musume' },
        { name: 'pacopacomama', slug: 'vi/pacopacomama' },
        { name: 'Gachinco', slug: 'vi/gachinco' },
        { name: 'XXX-AV', slug: 'vi/xxx-av' },
        { name: 'MarriedSlash', slug: 'vi/marriedslash' },
        { name: 'Naughty4610', slug: 'vi/naughty4610' },
        { name: 'Naughty0930', slug: 'vi/naughty0930' }
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
// NHÓM 2: SINH URL (App gọi hàm → nhận URL → tự fetch HTTP)
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var pathStr = (slug || "vi/new").replace(/^\/+/, "");

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
    return BASE_URL + "/vi/search/" + encodeURIComponent(keyword) + "?page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return BASE_URL + slug;
    return BASE_URL + "/vi/" + slug;
}

function getUrlCategories() { return BASE_URL + "/vi/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// TIỆN ÍCH NỘI BỘ (PluginUtils & Stream Extractor)
// =============================================================================

var PluginUtils = {
    normalizeHtml: function (html) {
        if (!html) return "";
        return html.replace(/class="([^"]*)"/g, function (_, classValue) {
            return 'class="' + classValue.replace(/missav_media-/g, '') + '"';
        });
    },
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    },
    getMeta: function (html, property) {
        var regex = new RegExp('property="' + property + '"\\s+content="([^"]+)"', 'i');
        var match = html.match(regex);
        return match ? match[1] : "";
    },
    extractPreviewUrl: function (itemHtml) {
        var previewMatch = itemHtml.match(/<video[^>]+data-src="([^"]+)"/);
        var url = previewMatch ? previewMatch[1] : "";

        if (url && url.length === 36 && /^[0-9a-f-]{36}$/i.test(url)) {
            return "https://surrit.com/" + url + "/preview.mp4";
        }

        if (!url) {
            var uuidMatch = itemHtml.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                return "https://surrit.com/" + uuidMatch[0] + "/preview.mp4";
            }
        }

        if (url && url.indexOf('//') === 0) {
            return "https:" + url;
        }

        return url;
    },
    extractStreamUuid: function (html) {
        var uuid = "";

        // Strategy 1: Giải mã mảng split('|') từ eval()
        var evalMatch = html.match(/eval\(function\(p,a,c,k,e,d\)[\s\S]*?'([^']+)'\.split\('\|'\)/i);
        if (evalMatch) {
            var parts = evalMatch[1].split('|');
            var hasSurrit = false;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === 'surrit' || parts[i] === 'sixyik') {
                    hasSurrit = true;
                    break;
                }
            }
            if (hasSurrit) {
                var uuidParts = [];
                for (var j = 0; j < parts.length; j++) {
                    if (/^[0-9a-f]{8,12}$/.test(parts[j])) {
                        uuidParts.push(parts[j]);
                    }
                }
                if (uuidParts.length >= 5) {
                    uuid = uuidParts[0] + '-' + uuidParts[1] + '-' + uuidParts[2] + '-' + uuidParts[3] + '-' + uuidParts[4];
                }
            }
        }

        // Strategy 2: Tìm trực tiếp qua domain hoster
        if (!uuid) {
            var hostMatch = html.match(/(?:surrit|sixyik|nineyu|fourhoi)\.com\/([0-9a-f-]{36})/i);
            if (hostMatch) uuid = hostMatch[1];
        }

        // Strategy 3: Tìm blob UUID
        if (!uuid) {
            var blobMatch = html.match(/src=["']blob:[^"']+\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})["']/i);
            if (blobMatch) uuid = blobMatch[1];
        }

        // Strategy 4: Quét sâu UUID loại trừ các biến tracking/ads
        if (!uuid) {
            var matches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
            var blacklist = ["snaptrckr", "user_uuid", "popunder", "banner", "monitoring", "crypto", "randomUUID", "generateUUID"];
            for (var k = 0; k < matches.length; k++) {
                var candidate = matches[k];
                var isBad = false;
                var idx = html.indexOf(candidate);
                if (idx !== -1) {
                    var ctx = html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 80));
                    for (var b = 0; b < blacklist.length; b++) {
                        if (ctx.indexOf(blacklist[b]) !== -1) {
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

        return uuid;
    }
};

// =============================================================================
// NHÓM 3: PARSER (App fetch URL xong → ném HTML/JSON thô vào đây → parse)
// =============================================================================

function parseListResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var movies = [];

    // Trường hợp đặc biệt: trang tìm kiếm dùng JS động (Alpine.js + Recombee)
    var isSearchPage = html.indexOf('window.recombeeClient.send(new recombee.SearchItems') !== -1 ||
        (html.indexOf('x-data="{') !== -1 && html.indexOf('recommendItems') !== -1);

    if (isSearchPage) {
        return JSON.stringify({
            items: [{
                id: "/vi",
                title: "⚠️ Tìm kiếm MissAV chưa hỗ trợ",
                posterUrl: "",
                backdropUrl: "",
                description: "Trang tìm kiếm của MissAV sử dụng công nghệ tải động (Alpine.js + Recombee API), không thể parse từ HTML tĩnh. Vui lòng sử dụng các mục 'Thể loại', 'Hot Hôm Nay', 'Mới cập nhật' để duyệt phim.",
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
        html.indexOf(':đếm video') !== -1;

    var match;

    if (isActressesPage) {
        var gridMatch = html.match(/<ul[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>([\s\S]*?)<\/ul>/);
        var searchScope = gridMatch ? gridMatch[1] : html;
        var blockedNames = [
            "Tiếng Việt", "English", "繁體中文", "简体中文", "日本語", "한국의",
            "Melayu", "ไทย", "Deutsch", "Français", "Bahasa Indonesia",
            "Filipino", "Português", "MissAV"
        ];
        var foundActresses = {};
        var liRegex = /<li[\s\S]*?<\/li>/gi;

        while ((match = liRegex.exec(searchScope)) !== null) {
            var itemHtml = match[0];
            var urlMatch = itemHtml.match(/href="([^"]*\/actresses\/[^"]+)"/);
            if (!urlMatch || urlMatch[1].indexOf('?') !== -1) continue;

            var nameMatch = itemHtml.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
            var nameRaw = nameMatch ? nameMatch[1] : "";
            if (!nameRaw) {
                var altMatch = itemHtml.match(/<img[^>]+alt="([^"]+)"/);
                if (altMatch) nameRaw = altMatch[1];
            }

            var name = PluginUtils.cleanText(nameRaw);
            if (!name || name.length < 2 || name.indexOf(':đếm') !== -1) continue;

            var isBlocked = false;
            for (var k = 0; k < blockedNames.length; k++) {
                if (name === blockedNames[k]) {
                    isBlocked = true;
                    break;
                }
            }
            if (isBlocked) continue;

            var imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/);
            var img = imgMatch ? imgMatch[1] : "";
            if (img.indexOf('flag') !== -1 || img.indexOf('icon') !== -1) img = "";

            var slug = urlMatch[1].replace(/https?:\/\/[^\/]+/, "");
            if (slug.indexOf("/") !== 0) slug = "/" + slug;

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

        while ((match = genreRegex.exec(html)) !== null) {
            var gUrl = match[1];
            var innerContent = match[2];

            if (gUrl.indexOf('/genres/') !== -1 && innerContent.indexOf(':đếm video') === -1) {
                var gName = PluginUtils.cleanText(innerContent);
                if (!gName || gName.length < 2) continue;

                var gSlug = gUrl.replace(/https?:\/\/[^\/]+/, "");
                if (gSlug.indexOf("/") !== 0) gSlug = "/" + gSlug;

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
        var parts = html.split('thumbnail group');
        if (parts.length <= 1) parts = html.split('class="thumbnail');

        for (var i = 1; i < parts.length; i++) {
            var mHtml = parts[i];
            var slug = "";

            var fullLinkMatch = mHtml.match(/<a[^>]+href="([^"]+)"/);
            if (fullLinkMatch) {
                slug = fullLinkMatch[1].replace(/https?:\/\/[^\/]+/, "");
                if (slug.indexOf("/") !== 0) slug = "/" + slug;
            }

            var codeMatch = mHtml.match(/class="[^"]*text-nord13[^"]*"[^>]*>([\s\S]*?)<\/a>/);
            var code = codeMatch ? PluginUtils.cleanText(codeMatch[1]) : "";
            if (!code && slug) {
                var slugParts = slug.split("/");
                code = slugParts[slugParts.length - 1];
            }

            var titleCandidates = [];
            var imgFullMatch = mHtml.match(/<img[^>]+(?:alt|title)="([^"]+)"/i);
            if (imgFullMatch) titleCandidates.push(PluginUtils.cleanText(imgFullMatch[1]));

            var otherTitleRegex = /title="([^"]+)"/gi;
            var tMatch;
            while ((tMatch = otherTitleRegex.exec(mHtml)) !== null) {
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
                var stripped = cleanTitle.substring(code.length).trim();
                if (stripped.indexOf("-") === 0 || stripped.indexOf(" ") === 0) {
                    stripped = stripped.substring(1).trim();
                }
                if (stripped.length > 3) {
                    cleanTitle = stripped;
                }
            }
            if (!cleanTitle) cleanTitle = code || "No Title";

            var thumbMatch = mHtml.match(/<img[\s\S]*?data-src="([^"]+)"/) ||
                mHtml.match(/<img[\s\S]*?src="([^"]+)"/);
            var thumb = thumbMatch ? thumbMatch[1] : "";
            if (thumb && thumb.indexOf("cover-t.jpg") !== -1) {
                thumb = thumb.replace("/cover-t.jpg", "/cover.jpg");
            }

            if (slug && slug.indexOf("actresses") === -1 && slug.indexOf("genres") === -1) {
                if (slug.indexOf('item.') !== -1 || slug.indexOf('{{') !== -1 || slug === "/" || slug === "#") continue;
                if (cleanTitle.indexOf('item.') !== -1 || cleanTitle.indexOf('{{') !== -1) continue;
                if (thumb.indexOf('item.') !== -1 || thumb.indexOf('itemUrl') !== -1) continue;

                var durationMatch = mHtml.match(/<span[^>]*>\s*(\d+:\d+:\d+)\s*<\/span>/);
                var duration = durationMatch ? durationMatch[1] : "";

                var isUncensored = mHtml.indexOf("Không kiểm duyệt") !== -1 ||
                    mHtml.indexOf("Uncensored") !== -1 ||
                    mHtml.indexOf("bg-blue-800") !== -1;

                var previewUrl = PluginUtils.extractPreviewUrl(mHtml);

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

    // Phân trang
    var totalPages = 1;
    var currentPage = 1;

    var currentMatch = html.match(/<(?:span|a)[^>]+class="[^"]*(?:bg-nord8|active|current)[^"]*"[^>]*>\s*(\d+)\s*<\/(?:span|a)>/i);
    if (currentMatch) {
        currentPage = parseInt(currentMatch[1], 10);
    }

    var allPageNums = html.match(/page=(\d+)/g);
    if (allPageNums) {
        for (var pIdx = 0; pIdx < allPageNums.length; pIdx++) {
            var p = parseInt(allPageNums[pIdx].match(/\d+/)[0], 10);
            if (p > totalPages) totalPages = p;
        }
    }

    var inputPageMatch = html.match(/name="page" value="(\d+)"/) || html.match(/type="number" value="(\d+)"/);
    if (inputPageMatch) {
        var pVal = parseInt(inputPageMatch[1], 10);
        if (pVal > 0) currentPage = Math.max(currentPage, pVal);
    }

    var totalLabelMatch = html.match(/\/ (\d+)\s*<\/span>/) ||
        html.match(/>(\d+)<\/a>\s*<a[^>]*aria-label="Next"/i) ||
        html.match(/page=(\d+)[^>]*aria-label="Last"/i);

    if (totalLabelMatch) {
        var tVal = parseInt(totalLabelMatch[1], 10);
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
                return "[" + PluginUtils.cleanText(linkMatch[2]) + "](" + getSlug(linkMatch[1]) + ")";
            }
            var timeMatch = content.match(/<time[^>]*>([^<]+)<\/time>/i);
            if (timeMatch) {
                return PluginUtils.cleanText(timeMatch[1]);
            }
            var spanMatch = content.match(/<span[^>]*>([^<]+)<\/span>/i);
            if (spanMatch) {
                return PluginUtils.cleanText(spanMatch[1]);
            }
            return PluginUtils.cleanText(content.replace(/<[^>]+>/g, ""));
        };

        var getMultiField = function (labelKey) {
            var regexStart = new RegExp("<span>" + labelKey + ":<\\/span>", "i");
            var matchStart = html.match(regexStart);
            if (!matchStart) return "";

            var startIndex = matchStart.index + matchStart[0].length;
            var searchArea = html.substring(startIndex);
            var divEnd = searchArea.indexOf("</div>");
            var content = divEnd !== -1 ? searchArea.substring(0, divEnd) : searchArea;

            var items = [];
            var linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
            var linkMatch;
            while ((linkMatch = linkRegex.exec(content)) !== null) {
                var text = PluginUtils.cleanText(linkMatch[2]);
                if (text && text.indexOf("<img") === -1) {
                    items.push("[" + text + "](" + getSlug(linkMatch[1]) + ")");
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
        var thumb = PluginUtils.getMeta(html, "og:image");
        var desc = PluginUtils.getMeta(html, "og:description");

        var previewMatch = html.match(/<video[^>]+data-src="([^"]+)"/) || html.match(/video_url:\s*'([^']+)'/);
        var previewUrl = previewMatch ? previewMatch[1] : "";
        if (!previewUrl && thumb && thumb.indexOf("cover.jpg") !== -1) {
            previewUrl = thumb.replace("cover.jpg", "preview.mp4");
        }

        var displayTitle = title;
        if (code && displayTitle.toUpperCase().indexOf(code.toUpperCase()) === 0) {
            displayTitle = displayTitle.substring(code.length).trim();
            if (displayTitle.indexOf("-") === 0 || displayTitle.indexOf(" ") === 0) {
                displayTitle = displayTitle.substring(1).trim();
            }
        }
        if (code) {
            displayTitle = "[" + code.toUpperCase() + "] " + displayTitle;
        }

        var titleWords = displayTitle.split(" ");
        if (titleWords.length > 25) {
            displayTitle = titleWords.slice(0, 25).join(" ") + "...";
        }

        var uuid = PluginUtils.extractStreamUuid(html);
        var streamUrl = uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";

        var servers = [];
        if (streamUrl || pageUrl) {
            servers.push({
                name: "Stream",
                episodes: [{
                    id: pageUrl || streamUrl,
                    name: "Full",
                    slug: "full"
                }]
            });
        }

        var statusLine = "";
        if (studio) statusLine += "Studio: " + studio;
        if (label) statusLine += (statusLine ? " | " : "") + "Label: " + label;
        if (!statusLine && releaseDate) statusLine = "Released: " + releaseDate;

        var year = releaseDate ? parseInt(releaseDate.substring(0, 4), 10) : 0;

        return JSON.stringify({
            id: code || "",
            title: PluginUtils.cleanText(displayTitle),
            posterUrl: thumb,
            backdropUrl: thumb,
            description: PluginUtils.cleanText(desc),
            servers: servers,
            quality: "HD",
            lang: "Vietsub",
            year: isNaN(year) ? 0 : year,
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

function parseDetailResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var uuid = PluginUtils.extractStreamUuid(html);
    var streamUrl = uuid ? "https://surrit.com/" + uuid + "/playlist.m3u8" : "";

    return JSON.stringify({
        url: streamUrl,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASE_URL + "/",
            "Origin": BASE_URL
        },
        subtitles: []
    });
}

function parseCategoriesResponse(html) {
    html = PluginUtils.normalizeHtml(html);
    var categories = [{ name: "Tất cả thể loại", slug: "vi/genres" }];
    var regex = /<a[^>]+href="([^"]*\/vi\/genres\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    var match;
    var seen = {};

    while ((match = regex.exec(html)) !== null) {
        var fullPath = match[1];
        var name = PluginUtils.cleanText(match[2]);
        var parts = fullPath.split("/genres/");
        var slug = parts.length > 1 ? parts[1] : "";

        if (slug && name && !seen[slug]) {
            seen[slug] = true;
            categories.push({ name: name, slug: "vi/genres/" + slug });
        }
    }

    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
