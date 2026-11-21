// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var TVHAY_BASE_URL = "https://tvhay.buzz";

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHAY",
        "version": "1.0.2",
        "baseUrl": TVHAY_BASE_URL,
        "iconUrl": "https://tvhay.buzz/favicon.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "phim-hay", title: "Phim Hay", type: "Horizontal", path: "" },
        { slug: "phim-moi", title: "Phim Mới", type: "Horizontal", path: "" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "" },
        { slug: "short-drama", title: "Short Drama", type: "Grid", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Hài Hước", slug: "hai-huoc" },
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Học Đường", slug: "hoc-duong" },
        { name: "Khoa Học", slug: "khoa-hoc" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Kinh Điển", slug: "kinh-dien" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" },
        { name: "Phim Ngắn", slug: "phim-ngan" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Thần Thoại", slug: "than-thoai" },
        { name: "Thể Thao", slug: "the-thao" },
        { name: "Trẻ Em", slug: "tre-em" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Viễn Tưởng", slug: "vien-tuong" },
        { name: "Võ Thuật", slug: "vo-thuat" },
        { name: "Âm Nhạc", slug: "am-nhac" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        countries: [
            { name: "Anh", slug: "anh" },
            { name: "Hàn Quốc", slug: "han-quoc" },
            { name: "Hồng Kông", slug: "hong-kong" },
            { name: "Nhật Bản", slug: "nhat-ban" },
            { name: "Thái Lan", slug: "thai-lan" },
            { name: "Trung Quốc", slug: "trung-quoc" },
            { name: "Việt Nam", slug: "viet-nam" },
            { name: "Âu Mỹ", slug: "au-my" },
            { name: "Đài Loan", slug: "dai-loan" },
            { name: "Ấn Độ", slug: "an-do" }
        ],
        years: [
            "2026", "2025", "2024", "2023", "2022", "2021",
            "2020", "2019", "2018", "2017", "2016", "2015",
            "2014", "2013", "2012", "2011", "2010"
        ]
    });
}

// =============================================================================
// HELPER FUNCTIONS (ES5)
// =============================================================================

function _tvhayTrim(str) {
    if (!str) return "";
    return String(str).replace(/^\s+|\s+$/g, "");
}

function _tvhayAbsUrl(href, baseOrigin) {
    if (!href) return "";
    href = _tvhayTrim(href);
    if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) {
        return href;
    }
    if (href.indexOf("//") === 0) {
        return "https:" + href;
    }
    var origin = baseOrigin || TVHAY_BASE_URL;
    if (href.charAt(0) !== "/") {
        href = "/" + href;
    }
    return origin + href;
}

function _tvhayStripTags(str) {
    if (!str) return "";
    return _tvhayTrim(String(str).replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

function _tvhayDecodeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&")
        .replace(/"/g, '"')
        .replace(/'/g, "'")
        .replace(/</g, "<")
        .replace(/>/g, ">");
}

function _tvhayCleanEmbedHtml(html) {
    return String(html || "")
        .replace(/\\\//g, "/")
        .replace(/\\u0026/gi, "&")
        .replace(/&/g, "&");
}

function _tvhayPickStreamUrl(text) {
    if (!text) return "";

    // 1. Link trực tiếp .m3u8 hoặc .mp4 (ví dụ: https://v7.kkphimplayer7.com/.../index.m3u8)
    var mediaMatch = text.match(/(https?:\/\/[^\s"'<>\\`]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\`]*)?)/i);
    if (mediaMatch && mediaMatch[1]) {
        return mediaMatch[1];
    }

    // 2. Link stream/playlist không có đuôi mở rộng rõ ràng
    var streamPathMatch = text.match(/(https?:\/\/[^\s"'<>\\`]+(?:\/(?:playlist|master|manifest|stream|hls|index)\.(?:m3u8|php|txt)|(?:playlist|master|hls|stream)[a-zA-Z0-9_\-\/]*))/i);
    if (streamPathMatch && streamPathMatch[1]) {
        return streamPathMatch[1];
    }

    // 3. Thuộc tính file / src / url / m3u8 / stream trong cấu hình player JS/JSON
    var cfgMatch = text.match(/(?:["']?(?:file|src|url|hls|stream|m3u8|video_url|source)["']?\s*[:=]\s*["'])(https?:\/\/[^"'\\`]+)(?:["'])/i);
    if (cfgMatch && cfgMatch[1]) {
        var candidate = cfgMatch[1];
        if (!/\.(?:jpg|jpeg|png|gif|webp|css|js)(\?|$)/i.test(candidate)) {
            return candidate;
        }
    }

    return "";
}

function _tvhayBuildStreamResult(streamUrl, refererUrl) {
    var finalUrl = _tvhayAbsUrl(streamUrl);
    if (!finalUrl) {
        return { url: "", isEmbed: false, headers: {} };
    }
    var isHls = /\.m3u8(\?|$)/i.test(finalUrl) || finalUrl.indexOf("m3u8") !== -1;
    var isMp4 = /\.mp4(\?|$)/i.test(finalUrl);
    return {
        url: finalUrl,
        isEmbed: false,
        mimeType: isHls ? "application/x-mpegURL" : (isMp4 ? "video/mp4" : ""),
        headers: {
            "Referer": refererUrl || (TVHAY_BASE_URL + "/")
        }
    };
}

function _tvhayExtractEmbedStreamOrNext(html, refererUrl) {
    var cleaned = _tvhayCleanEmbedHtml(html);

    // 1. Tìm link stream trực tiếp hoặc trong config JS
    var direct = _tvhayPickStreamUrl(cleaned);
    if (direct) {
        return _tvhayBuildStreamResult(direct, refererUrl);
    }

    // 2. Thử giải mã chuỗi base64 trong atob("...")
    var b64Regex = /atob\(\s*["']([A-Za-z0-9+/=]{16,})["']\s*\)/gi;
    var b64Match;
    while ((b64Match = b64Regex.exec(cleaned)) !== null) {
        try {
            if (typeof atob === "function") {
                var decoded = atob(b64Match[1]);
                var bUrl = _tvhayPickStreamUrl(decoded);
                if (!bUrl && /^https?:\/\//i.test(decoded)) {
                    bUrl = _tvhayTrim(decoded);
                }
                if (bUrl) {
                    var bAbs = _tvhayAbsUrl(bUrl);
                    var bHls = /\.m3u8(\?|$)/i.test(bAbs) || bAbs.indexOf("m3u8") !== -1;
                    var bMp4 = /\.mp4(\?|$)/i.test(bAbs);
                    return {
                        url: bAbs,
                        isEmbed: !bHls && !bMp4,
                        mimeType: bHls ? "application/x-mpegURL" : (bMp4 ? "video/mp4" : ""),
                        headers: { "Referer": refererUrl }
                    };
                }
            }
        } catch (e) {}
    }

    // 3. Nếu có iframe lồng bên trong embed
    var nestedIframe = cleaned.match(/<iframe[^>]*src=["']([^"']+)["']/i);
    if (nestedIframe && nestedIframe[1]) {
        return {
            url: _tvhayAbsUrl(nestedIframe[1]),
            isEmbed: true,
            headers: { "Referer": refererUrl }
        };
    }

    // 4. Nếu trang embed gọi endpoint/API trung gian để lấy link stream
    var apiMatch = cleaned.match(/(?:fetch|axios\.(?:get|post)|\$\.(?:ajax|get|post)|open\(\s*["'](?:GET|POST)["']\s*,)\s*["']([^"']*(?:stream|source|play|video|link|playlist|m3u8|hash|api)[^"']*)["']/i);
    if (apiMatch && apiMatch[1]) {
        var apiUrl = apiMatch[1];
        if (apiUrl.indexOf("http") !== 0) {
            if (apiUrl.charAt(0) !== "/") {
                var baseDir = refererUrl.replace(/[^\/?#]+([?#].*)?$/, "");
                apiUrl = baseDir + apiUrl;
            } else {
                var originMatch = refererUrl.match(/^(https?:\/\/[^\/]+)/i);
                apiUrl = (originMatch ? originMatch[1] : TVHAY_BASE_URL) + apiUrl;
            }
        }
        return {
            url: apiUrl,
            isEmbed: true,
            headers: {
                "Referer": refererUrl,
                "X-Requested-With": "XMLHttpRequest"
            }
        };
    }

    return null;
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
    var country = filters.country || "";
    var year = filters.year || "";
    var base = TVHAY_BASE_URL;

    if (country) {
        return page > 1
            ? base + "/quoc-gia/" + country + "/trang-" + page
            : base + "/quoc-gia/" + country;
    }

    if (year) {
        return page > 1
            ? base + "/nam/" + year + "/trang-" + page
            : base + "/nam/" + year;
    }

    if (!slug || slug === "" || slug === "home" || slug === "phim-hay") {
        return page > 1
            ? base + "/phim-moi/trang-" + page
            : base + "/";
    }

    if (
        slug === "phim-moi" ||
        slug === "phim-bo" ||
        slug === "phim-le" ||
        slug === "short-drama"
    ) {
        return page > 1
            ? base + "/" + slug + "/trang-" + page
            : base + "/" + slug;
    }

    return page > 1
        ? base + "/the-loai/" + slug + "/trang-" + page
        : base + "/the-loai/" + slug;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    var q = _tvhayTrim(keyword || "");
    var url = TVHAY_BASE_URL + "/?view=tim-kiem&keyword=" + encodeURIComponent(q);
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.charAt(0) !== "/") slug = "/" + slug;
    return TVHAY_BASE_URL + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    var items = [];
    var seenIds = {};

    if (!html) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }

    if (_tvhayTrim(html).charAt(0) === "[") {
        try {
            var arr = JSON.parse(html);
            for (var j = 0; j < arr.length; j++) {
                var m = arr[j] || {};
                var mUrl = m.slug ? _tvhayAbsUrl("/phim/" + m.slug) : "";
                var mThumb = m.thumb ? _tvhayAbsUrl(m.thumb) : "";
                if (mUrl && m.name && !seenIds[mUrl]) {
                    seenIds[mUrl] = true;
                    items.push({
                        id: mUrl,
                        title: _tvhayDecodeHtml(_tvhayStripTags(String(m.name))),
                        posterUrl: mThumb,
                        backdropUrl: mThumb,
                        year: parseInt(m.year, 10) || 0,
                        lang: m.lang || ""
                    });
                }
            }
            return JSON.stringify({
                items: items,
                pagination: { currentPage: 1, totalPages: 1 }
            });
        } catch (jsonErr) {}
    }

    var blocks = html.split("movie-item");
    for (var i = 1; i < blocks.length; i++) {
        var block = blocks[i];

        var linkMatch = block.match(/href=["']([^"']+)["']/i);
        var fullLink = _tvhayAbsUrl(linkMatch ? linkMatch[1] : "");

        var titleMatch = block.match(/class=["'][^"']*movie-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
            || block.match(/title=["']([^"']+)["']/i);
        var cleanTitle = _tvhayDecodeHtml(_tvhayStripTags(titleMatch ? titleMatch[1] : ""));

        var thumbMatch = block.match(/data-src=["']([^"']+)["']/i)
            || block.match(/data-original=["']([^"']+)["']/i)
            || block.match(/<img[^>]*src=["']([^"']+)["']/i);
        var thumb = thumbMatch ? _tvhayAbsUrl(thumbMatch[1]) : "";
        if (thumb.indexOf("data:image") === 0 || thumb.indexOf("placehold.co") !== -1) {
            thumb = "";
        }

        var yearMatch = block.match(/<span[^>]*font-weight:\s*bold[^>]*>(\d{4})<\/span>/i)
            || block.match(/\b(19\d{2}|20\d{2})\b/);
        var year = yearMatch ? (parseInt(yearMatch[1], 10) || 0) : 0;

        var langMatch = block.match(/class=["'][^"']*movie-label[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var lang = langMatch ? _tvhayStripTags(langMatch[1]) : "";

        var epMatch = block.match(/class=["'][^"']*movie-ep-status[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
        var status = epMatch ? _tvhayStripTags(epMatch[1]) : "";

        if (fullLink && cleanTitle && !seenIds[fullLink]) {
            seenIds[fullLink] = true;
            items.push({
                id: fullLink,
                title: cleanTitle,
                posterUrl: thumb,
                backdropUrl: thumb,
                year: year,
                lang: lang,
                status: status
            });
        }
    }

    var currentPage = 1;
    var totalPages = 1;

    var cpMatch = html.match(/<[^>]*class=["'][^"']*current[^"']*["'][^>]*>(\d+)<\/[^>]+>/i);
    if (cpMatch) {
        currentPage = parseInt(cpMatch[1], 10) || 1;
    }

    var pageRegex = /<(?:a|span)[^>]*>(\d+)<\/(?:a|span)>/gi;
    var pMatch;
    while ((pMatch = pageRegex.exec(html)) !== null) {
        var num = parseInt(pMatch[1], 10);
        if (num > totalPages && num < 10000) {
            totalPages = num;
        }
    }
    if (currentPage > totalPages) {
        totalPages = currentPage;
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        if (!html) return "null";

        var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
        var pageUrl = canonicalMatch ? _tvhayAbsUrl(canonicalMatch[1]) : "";

        var h1Match = html.match(/<h1[^>]*class=["'][^"']*movie-h1[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)
            || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var h2Match = html.match(/<h2[^>]*class=["'][^"']*movie-h2[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i);
        var ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);

        var title = "";
        if (h1Match) {
            title = _tvhayDecodeHtml(_tvhayStripTags(h1Match[1]))
                .replace(/\s*TẬP\s*\d+.*$/i, "")
                .replace(/\s*(THUYẾT MINH|LỒNG TIẾNG|VIETSUB).*$/i, "");
            title = _tvhayTrim(title);
        }
        if (!title && ogTitleMatch) {
            title = _tvhayTrim(
                _tvhayDecodeHtml(_tvhayStripTags(ogTitleMatch[1]))
                    .replace(/^Xem phim\s+/i, "")
                    .replace(/\s*-\s*.*$/, "")
            );
        }

        var descMatch = html.match(/<div[^>]*class=["'][^"']*movie-desc[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
            || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        var description = descMatch ? _tvhayDecodeHtml(_tvhayStripTags(descMatch[1])) : "";

        var ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = ogImgMatch ? _tvhayAbsUrl(ogImgMatch[1]) : "";

        var yearText = h2Match ? _tvhayStripTags(h2Match[1]) : html;
        var yearMatch = yearText.match(/\b(19\d{2}|20\d{2})\b/);
        var year = yearMatch ? (parseInt(yearMatch[1], 10) || 0) : 0;

        var episodeBlockMatch = html.match(/<div[^>]*class=["'][^"']*episode-block["'][^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class=["'][^"']*movie-info-block["']/i);
        var epScope = episodeBlockMatch ? episodeBlockMatch[1] : html;

        var sourceSplits = epScope.split(/class=["'][^"']*source-container[^"']*["']/i);
        var sourceGroups = [];

        if (sourceSplits.length > 1) {
            for (var s = 1; s < sourceSplits.length; s++) {
                var sBlock = sourceSplits[s];
                var sTitleMatch = sBlock.match(/class=["'][^"']*source-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
                var sName = sTitleMatch ? _tvhayDecodeHtml(_tvhayStripTags(sTitleMatch[1])) : ("Nguồn #" + s);

                var eps = [];
                var seenEp = {};
                var epRegex = /<a[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*>([\s\S]*?)<\/a>|<a[^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
                var epMatch;
                while ((epMatch = epRegex.exec(sBlock)) !== null) {
                    var href = _tvhayAbsUrl(epMatch[1] || epMatch[3]);
                    var epLabel = _tvhayDecodeHtml(_tvhayStripTags(epMatch[2] || epMatch[4]));
                    var epName = /^\d+$/.test(epLabel) ? ("Tập " + epLabel) : (epLabel || ("Tập " + (eps.length + 1)));
                    if (href && !seenEp[href]) {
                        seenEp[href] = true;
                        eps.push({
                            id: href,
                            name: epName,
                            slug: href
                        });
                    }
                }

                if (eps.length > 0) {
                    sourceGroups.push({
                        sourceName: sName,
                        episodes: eps
                    });
                }
            }
        }

        if (sourceGroups.length === 0) {
            var fallbackEps = [];
            var seenFallback = {};
            var fbRegex = /<a[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*>([\s\S]*?)<\/a>|<a[^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var fbMatch;
            while ((fbMatch = fbRegex.exec(epScope)) !== null) {
                var fbHref = _tvhayAbsUrl(fbMatch[1] || fbMatch[3]);
                var fbLabel = _tvhayDecodeHtml(_tvhayStripTags(fbMatch[2] || fbMatch[4]));
                var fbName = /^\d+$/.test(fbLabel) ? ("Tập " + fbLabel) : (fbLabel || ("Tập " + (fallbackEps.length + 1)));
                if (fbHref && !seenFallback[fbHref]) {
                    seenFallback[fbHref] = true;
                    fallbackEps.push({
                        id: fbHref,
                        name: fbName,
                        slug: fbHref
                    });
                }
            }
            if (fallbackEps.length === 0 && pageUrl) {
                fallbackEps.push({
                    id: pageUrl,
                    name: "Full",
                    slug: "full"
                });
            }
            sourceGroups.push({
                sourceName: "Lồng tiếng #1",
                episodes: fallbackEps
            });
        }

        var playerModes = [];
        var modeRegex = /onclick=["']changePlayerMode\(['"]([^'"]+)['"]\)["'][^>]*>([\s\S]*?)<\/button>/gi;
        var modeMatch;
        while ((modeMatch = modeRegex.exec(html)) !== null) {
            var modeKey = _tvhayTrim(modeMatch[1]).toLowerCase();
            var modeLabel = _tvhayDecodeHtml(_tvhayStripTags(modeMatch[2])) || modeKey.toUpperCase();
            playerModes.push({
                key: modeKey,
                label: modeLabel
            });
        }
        if (playerModes.length === 0) {
            playerModes.push({ key: "hpro", label: "H.PRO" });
            playerModes.push({ key: "spro", label: "S.PRO" });
        }

        var servers = [];
        for (var g = 0; g < sourceGroups.length; g++) {
            var group = sourceGroups[g];
            for (var m = 0; m < playerModes.length; m++) {
                var modeObj = playerModes[m];
                var modeEps = [];
                for (var e = 0; e < group.episodes.length; e++) {
                    var baseEp = group.episodes[e];
                    var sep = baseEp.id.indexOf("#") !== -1 ? "&" : "#";
                    modeEps.push({
                        id: baseEp.id + sep + "mode=" + modeObj.key,
                        name: baseEp.name,
                        slug: baseEp.slug + "-" + modeObj.key
                    });
                }
                servers.push({
                    name: group.sourceName + " - " + modeObj.label,
                    episodes: modeEps
                });
            }
        }

        var lang = "Thuyết Minh / Lồng Tiếng";
        if (/lồng tiếng/i.test(html) && !/thuyết minh/i.test(html)) {
            lang = "Lồng Tiếng";
        } else if (/thuyết minh/i.test(html) && !/lồng tiếng/i.test(html)) {
            lang = "Thuyết Minh";
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            servers: servers,
            quality: "HD",
            lang: lang,
            year: year,
            rating: 0,
            casts: "",
            director: "",
            country: "",
            category: "",
            status: "HD"
        });
    } catch (e) {
        return "null";
    }
}

// =============================================================================
// STREAM RESOLUTION
// =============================================================================

function parseDetailResponse(html, fetchedUrl) {
    try {
        if (!html) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var cleaned = _tvhayCleanEmbedHtml(html);
        var mode = "hpro";
        if (fetchedUrl) {
            var modeMatch = fetchedUrl.match(/[#&]mode=([a-zA-Z0-9_-]+)/);
            if (modeMatch && modeMatch[1]) {
                mode = modeMatch[1].toLowerCase();
            }
        }

        var hProMatch = cleaned.match(/var\s+linkHPro\s*=\s*["']([^"']+)["']/i);
        var sProMatch = cleaned.match(/var\s+linkSPro\s*=\s*["']([^"']+)["']/i);
        var iframeMatch = cleaned.match(/<iframe[^>]*id=["']movie-iframe["'][^>]*src=["']([^"']+)["']/i)
            || cleaned.match(/<iframe[^>]*src=["']([^"']+)["']/i);

        var chosenUrl = "";
        if (mode === "spro" && sProMatch && sProMatch[1]) {
            chosenUrl = sProMatch[1];
        } else if (mode === "hpro" && hProMatch && hProMatch[1]) {
            chosenUrl = hProMatch[1];
        } else if (hProMatch && hProMatch[1]) {
            chosenUrl = hProMatch[1];
        } else if (sProMatch && sProMatch[1]) {
            chosenUrl = sProMatch[1];
        } else if (iframeMatch && iframeMatch[1]) {
            chosenUrl = iframeMatch[1];
        }

        chosenUrl = _tvhayAbsUrl(chosenUrl);
        if (!chosenUrl) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var isHls = /\.m3u8(\?|$)/i.test(chosenUrl);
        var isMp4 = /\.mp4(\?|$)/i.test(chosenUrl);
        var isDirect = isHls || isMp4;

        return JSON.stringify({
            url: chosenUrl,
            isEmbed: !isDirect,
            mimeType: isHls ? "application/x-mpegURL" : (isMp4 ? "video/mp4" : ""),
            headers: {
                "Referer": TVHAY_BASE_URL + "/"
            }
        });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}

function parseEmbedResponse(html, url) {
    try {
        if (!html) {
            return JSON.stringify({ url: "", isEmbed: false, headers: {} });
        }

        var refererUrl = url || (TVHAY_BASE_URL + "/");
        var cleaned = _tvhayCleanEmbedHtml(html);
        var trimmed = _tvhayTrim(cleaned);

        // Nếu response chính là nội dung playlist HLS (.m3u8)
        if (/^#EXTM3U/i.test(trimmed) && url) {
            return JSON.stringify({
                url: url,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "Referer": TVHAY_BASE_URL + "/"
                }
            });
        }

        // Bắt trực tiếp link .m3u8 / .mp4
        var mediaMatch = cleaned.match(/(https?:\/\/[^\s"'<>\\`]+\.(?:m3u8|mp4)(?:\?[^\s"'<>\\`]*)?)/i);
        if (mediaMatch && mediaMatch[1]) {
            return JSON.stringify(_tvhayBuildStreamResult(mediaMatch[1], refererUrl));
        }

        // Nếu response là JSON
        if (trimmed.charAt(0) === "{") {
            try {
                var obj = JSON.parse(trimmed);
                var jsonUrl = obj.url || obj.link || obj.stream || obj.file || obj.m3u8 || obj.src || obj.iframe || obj.playlist || "";
                if (jsonUrl) {
                    var jAbs = _tvhayAbsUrl(jsonUrl);
                    var jHls = /\.m3u8(\?|$)/i.test(jAbs) || jAbs.indexOf("m3u8") !== -1;
                    var jMp4 = /\.mp4(\?|$)/i.test(jAbs);
                    return JSON.stringify({
                        url: jAbs,
                        isEmbed: !jHls && !jMp4,
                        mimeType: jHls ? "application/x-mpegURL" : (jMp4 ? "video/mp4" : ""),
                        headers: {
                            "Referer": refererUrl
                        }
                    });
                }
            } catch (jsonErr) {}
        }

        var found = _tvhayExtractEmbedStreamOrNext(cleaned, refererUrl);
        if (found && found.url) {
            return JSON.stringify(found);
        }

        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {} });
    }
}
