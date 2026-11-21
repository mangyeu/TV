/*
 * JavHDZ Catalog Plugin
 * Based on the KKPhim plugin architecture
 *
 * Catalog / metadata parser only.
 * Does not extract video stream or player URLs.
 */

// ============================================================
// CONSTANTS
// ============================================================

var BASE_URL = "https://javhdz.today";

// Regex cache cho getAttribute (tránh compile lại nhiều lần)
var ATTR_REGEX_CACHE = {};

// Path pattern để lọc anchor là phim (tránh false-positive từ nav/footer)
var MOVIE_PATH_REGEX = /\/(?:phim|video|jav|xem|watch|movie)\//i;

// Path cần loại bỏ (không phải phim)
var EXCLUDED_PATH_REGEX = /\/(?:the-loai|quoc-gia|nam|tag|category|country|year|search|login|register|dang-nhap|dang-ky)\b/i;

// ============================================================
// MANIFEST
// ============================================================

function getManifest() {
    return JSON.stringify({
        id: "javhdz",
        name: "JavHDZ",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE"
    });
}

// ============================================================
// HOME SECTIONS
// ============================================================

function getHomeSections() {
    return JSON.stringify([
        {
            slug: "recent",
            title: "Recently Updated",
            type: "Grid",
            path: "recent"
        },
        {
            slug: "popular",
            title: "Popular",
            type: "Grid",
            path: "popular"
        }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Recent", slug: "recent" },
        { name: "Popular", slug: "popular" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Newest", value: "date" },
            { name: "Popular", value: "views" }
        ]
    });
}

// ============================================================
// URL HELPERS
// ============================================================

function normalizeUrl(url, base) {
    if (!url) return "";

    url = String(url).trim();

    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    try {
        return new URL(url, base || BASE_URL).href;
    } catch (e) {
        return "";
    }
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");

        var page = Math.max(1, parseInt(filters.page, 10) || 1);
        var route = slug || "recent";

        // Trường hợp slug là absolute URL
        if (/^https?:\/\//i.test(route)) {
            var customUrl = new URL(route);

            if (page > 1) {
                customUrl.searchParams.set("page", page);
            }
            if (filters.sort) {
                customUrl.searchParams.set("sort", filters.sort);
            }

            return customUrl.href;
        }

        route = route.replace(/^\/+|\/+$/g, "");

        var url = new URL(
            route ? "/" + route + "/" : "/",
            BASE_URL
        );

        if (page > 1) {
            url.searchParams.set("page", page);
        }
        if (filters.sort) {
            url.searchParams.set("sort", filters.sort);
        }

        return url.href;

    } catch (e) {
        return BASE_URL + "/recent/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");

        var url = new URL("/", BASE_URL);

        if (keyword) {
            url.searchParams.set("q", keyword.trim());
        }

        var page = Math.max(1, parseInt(filters.page, 10) || 1);
        if (page > 1) {
            url.searchParams.set("page", page);
        }

        return url.href;

    } catch (e) {
        return BASE_URL + "/";
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";

    // Nếu slug đã là absolute URL → giữ nguyên
    if (/^https?:\/\//i.test(slug)) {
        return slug;
    }

    // Nếu là path tương đối → resolve
    return normalizeUrl(slug);
}

function getUrlCategories() {
    return BASE_URL + "/";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var years = [];
    var currentYear = new Date().getFullYear();

    for (var y = currentYear; y >= 1970; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }

    return JSON.stringify(years);
}

// ============================================================
// HTML HELPERS
// ============================================================

function decodeHtml(text) {
    if (!text) return "";

    return String(text)
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&#(\d+);/g, function (_, n) {
            return String.fromCharCode(parseInt(n, 10));
        })
        .replace(/&#x([0-9a-f]+);/gi, function (_, h) {
            return String.fromCharCode(parseInt(h, 16));
        });
}

function stripHtml(text) {
    return decodeHtml(
        String(text || "")
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]*>/g, "")
    )
    .replace(/\s+/g, " ")
    .trim();
}

function getAttribute(tag, attribute) {
    if (!tag || !attribute) return "";

    var regex = ATTR_REGEX_CACHE[attribute];

    if (!regex) {
        var escaped = attribute.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        regex = new RegExp(
            escaped +
            "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
            "i"
        );

        ATTR_REGEX_CACHE[attribute] = regex;
    }

    var match = tag.match(regex);

    return decodeHtml(
        match ? (match[1] || match[2] || match[3] || "") : ""
    );
}

function getMeta(html, property) {
    if (!html || !property) return "";

    var tags = html.match(/<meta\b[^>]*>/gi) || [];
    var target = property.toLowerCase();

    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];

        var key =
            getAttribute(tag, "property") ||
            getAttribute(tag, "name");

        if ((key || "").toLowerCase() === target) {
            return getAttribute(tag, "content");
        }
    }

    return "";
}

function getCanonical(html) {
    if (!html) return "";

    var tags = html.match(/<link\b[^>]*>/gi) || [];

    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];

        if (
            (getAttribute(tag, "rel") || "")
                .toLowerCase()
                .indexOf("canonical") !== -1
        ) {
            return normalizeUrl(
                getAttribute(tag, "href")
            );
        }
    }

    return "";
}

function getTitle(html) {
    if (!html) return "";

    var match = html.match(
        /<title[^>]*>([\s\S]*?)<\/title>/i
    );

    return stripHtml(match ? match[1] : "");
}

function extractYear(text) {
    var m = String(text || "").match(/(?:19|20)\d{2}/);
    return m ? parseInt(m[0], 10) : 0;
}

function parseNextPage(html) {
    if (!html) return 0;

    // rel="next"
    var linkTags = html.match(/<link\b[^>]*>/gi) || [];
    for (var i = 0; i < linkTags.length; i++) {
        if (
            (getAttribute(linkTags[i], "rel") || "")
                .toLowerCase()
                .indexOf("next") !== -1
        ) {
            var href = getAttribute(linkTags[i], "href");
            var pageMatch = href.match(/[?&]page=(\d+)/i);
            if (pageMatch) return parseInt(pageMatch[1], 10);
        }
    }

    // anchor rel="next"
    var anchors = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
    for (var j = 0; j < anchors.length; j++) {
        if (
            (getAttribute(anchors[j], "rel") || "")
                .toLowerCase()
                .indexOf("next") !== -1
        ) {
            var aHref = getAttribute(anchors[j], "href");
            var m = aHref.match(/[?&]page=(\d+)/i);
            if (m) return parseInt(m[1], 10);
        }
    }

    return 0;
}

// ============================================================
// CATALOG PARSER
// ============================================================

function parseCatalogResponse(html) {
    var items = [];
    var seen = {};

    try {
        if (!html) throw new Error("empty html");

        var anchors = html.match(
            /<a\b[^>]*>[\s\S]*?<\/a>/gi
        ) || [];

        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];

            var href = getAttribute(anchor, "href");
            if (!href) continue;

            var url = normalizeUrl(href);
            if (!url) continue;

            // Loại bỏ link không phải phim
            if (EXCLUDED_PATH_REGEX.test(url)) continue;

            // Yêu cầu có path khớp pattern phim
            if (!MOVIE_PATH_REGEX.test(url)) continue;

            // Loại duplicate
            if (seen[url]) continue;

            var title =
                getAttribute(anchor, "title") ||
                getAttribute(anchor, "aria-label");

            if (!title) {
                title = stripHtml(anchor);
            }

            // Bỏ anchor không có title hoặc title quá ngắn
            if (!title || title.length < 3) continue;

            var imgMatch = anchor.match(/<img\b[^>]*>/i);
            var image = "";

            if (imgMatch) {
                var img = imgMatch[0];
                image =
                    getAttribute(img, "data-src") ||
                    getAttribute(img, "data-original") ||
                    getAttribute(img, "data-lazy-src") ||
                    getAttribute(img, "data-srcset") ||
                    getAttribute(img, "src");
            }

            // Bắt buộc có ảnh poster
            if (!image) continue;

            seen[url] = true;

            items.push({
                id: url,
                title: title,
                url: url,
                posterUrl: normalizeUrl(image),
                backdropUrl: normalizeUrl(image),
                description: "",
                year: extractYear(title),
                duration: "",
                category: "",
                quality: ""
            });
        }

        var nextPage = parseNextPage(html);

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: nextPage > 1 ? Math.max(nextPage, 2) : 1,
                totalItems: items.length,
                itemsPerPage: items.length || 24
            }
        });

    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 24
            }
        });
    }
}

function parseListResponse(html) {
    return parseCatalogResponse(html);
}

function parseSearchResponse(html) {
    return parseCatalogResponse(html);
}

// ============================================================
// DETAIL METADATA PARSER
// ============================================================

function parseMovieDetail(html) {
    try {
        if (!html) return "null";

        var title =
            getMeta(html, "og:title") ||
            getTitle(html);

        var canonical =
            getCanonical(html) ||
            getMeta(html, "og:url");

        var poster = getMeta(html, "og:image");

        var description =
            getMeta(html, "og:description") ||
            getMeta(html, "description");

        var durationRaw = getMeta(html, "og:video:duration");
        var duration = durationRaw ? parseInt(durationRaw, 10) || 0 : 0;

        var releaseDate = getMeta(html, "og:video:release_date");

        // Rating
        var ratingRaw =
            getMeta(html, "og:rating") ||
            getMeta(html, "rating");
        var rating = ratingRaw ? parseFloat(ratingRaw) || 0 : 0;

        // H1
        var contentTitle = "";
        var h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (h1) {
            contentTitle = stripHtml(h1[1]);
        }

        // Tags
        var tags = [];
        var tagRegex =
            /<meta\b[^>]*property=["']video:tag["'][^>]*>/gi;
        var tagMatch;

        while ((tagMatch = tagRegex.exec(html)) !== null) {
            var tag = getAttribute(tagMatch[0], "content");
            if (tag && tags.indexOf(tag) === -1) {
                tags.push(tag);
            }
        }

        // Category (fallback từ breadcrumb nếu không có tags)
        var category = tags.join(", ");

        // Year từ releaseDate hoặc title
        var year =
            extractYear(releaseDate) ||
            extractYear(title) ||
            extractYear(contentTitle);

        return JSON.stringify({
            id: canonical,
            title: contentTitle || title,
            originName: title,
            posterUrl: normalizeUrl(poster),
            backdropUrl: normalizeUrl(poster),
            description: stripHtml(description),
            year: year,
            rating: rating,
            quality: "",
            duration: duration,
            episode_current: "",
            lang: "",
            category: category,
            country: "",
            director: "",
            casts: "",
            status: "",
            releaseDate: releaseDate || "",
            tags: tags,
            url: canonical
        });

    } catch (e) {
        return "null";
    }
}

// ============================================================
// DETAIL RESPONSE
// ============================================================

function parseDetailResponse(input) {
    /*
     * KHÔNG extract stream.
     * Chỉ trả về metadata-only response.
     */

    var fallback = JSON.stringify({
        url: "",
        isDirectStream: false,
        headers: {},
        subtitles: []
    });

    try {
        if (!input) return fallback;

        var parsed;

        // Thử parse JSON trước
        try {
            parsed = JSON.parse(input);
        } catch (_) {
            // Nếu không phải JSON → coi là HTML, không extract stream
            parsed = null;
        }

        if (!parsed || typeof parsed !== "object") {
            return fallback;
        }

        return JSON.stringify({
            url: parsed.url || "",
            isDirectStream: !!parsed.isDirectStream,
            headers: parsed.headers || {},
            subtitles: Array.isArray(parsed.subtitles) ? parsed.subtitles : []
        });

    } catch (e) {
        return fallback;
    }
}

// ============================================================
// CATEGORIES / COUNTRIES / YEARS
// ============================================================

function parseCategoriesResponse(html) {
    try {
        if (!html) return JSON.stringify({ categories: [] });

        var items = [];
        var seen = {};

        var anchors = html.match(
            /<a\b[^>]*>[\s\S]*?<\/a>/gi
        ) || [];

        for (var i = 0; i < anchors.length; i++) {
            var tag = anchors[i];

            var href = getAttribute(tag, "href");
            var name = stripHtml(tag);

            if (!href || !name) continue;
            if (name.length < 2) continue;

            var slug = normalizeUrl(href);
            if (!slug || seen[slug]) continue;

            // Chỉ giữ link category/country
            if (
                !/\/(?:the-loai|quoc-gia|category|country|tag)\//i.test(slug) &&
                !/^https?:\/\/[^/]+\/?$/.test(slug)
            ) {
                continue;
            }

            seen[slug] = true;
            items.push({ name: name, slug: slug });
        }

        return JSON.stringify({ categories: items });

    } catch (e) {
        return JSON.stringify({ categories: [] });
    }
}

function parseCountriesResponse(html) {
    return parseCategoriesResponse(html);
}

function parseYearsResponse(html) {
    return getLocalYearsJson();
}
