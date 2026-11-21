
/*
 * JavHDZ Catalog Plugin
 * Based on the KKPhim plugin architecture
 *
 * Catalog / metadata parser only.
 * Does not extract video stream or player URLs.
 */

function getManifest() {
    return JSON.stringify({
        id: "javhdz",
        name: "JavHDZ",
        version: "1.0.0",
        baseUrl: "https://javhdz.today",
        iconUrl: "https://javhdz.today/favicon.ico",
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
            path: ""
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

var BASE_URL = "https://javhdz.today";

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

        if (/^https?:\/\//i.test(route)) {
            var customUrl = new URL(route);

            if (filters.page) {
                customUrl.searchParams.set("page", page);
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

        if (filters.page) {
            url.searchParams.set("page", filters.page);
        }

        return url.href;

    } catch (e) {
        return BASE_URL + "/";
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";

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
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#(\d+);/g, function (_, n) {
            return String.fromCharCode(parseInt(n, 10));
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
    var escaped = attribute.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    var regex = new RegExp(
        escaped +
        "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))",
        "i"
    );

    var match = tag.match(regex);

    return decodeHtml(
        match ? (match[1] || match[2] || match[3] || "") : ""
    );
}

function getMeta(html, property) {
    var tags = html.match(/<meta\b[^>]*>/gi) || [];

    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];

        var key =
            getAttribute(tag, "property") ||
            getAttribute(tag, "name");

        if (key.toLowerCase() === property.toLowerCase()) {
            return getAttribute(tag, "content");
        }
    }

    return "";
}

function getCanonical(html) {
    var tags = html.match(/<link\b[^>]*>/gi) || [];

    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];

        if (
            getAttribute(tag, "rel")
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
    var match = html.match(
        /<title[^>]*>([\s\S]*?)<\/title>/i
    );

    return stripHtml(match ? match[1] : "");
}

// ============================================================
// CATALOG PARSER
// ============================================================

function parseCatalogResponse(html) {
    try {
        var items = [];

        var seen = {};

        /*
         * HTML snapshot supplied:
         * Homepage cards are rendered as skeletons.
         * This parser therefore supports normal anchor/card HTML
         * if actual items are present in the response.
         */

        var anchors = html.match(
            /<a\b[^>]*>[\s\S]*?<\/a>/gi
        ) || [];

        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];

            var href = getAttribute(anchor, "href");

            if (!href) continue;

            var url = normalizeUrl(href);

            if (!url) continue;

            // Ignore duplicate URLs
            if (seen[url]) continue;

            var title =
                getAttribute(anchor, "title") ||
                getAttribute(anchor, "aria-label");

            if (!title) {
                title = stripHtml(anchor);
            }

            var imgMatch = anchor.match(
                /<img\b[^>]*>/i
            );

            var image = "";

            if (imgMatch) {
                var img = imgMatch[0];

                image =
                    getAttribute(img, "data-src") ||
                    getAttribute(img, "data-original") ||
                    getAttribute(img, "src") ||
                    getAttribute(img, "data-lazy-src");
            }

            // Ignore navigation links without catalog images
            if (!image) continue;

            seen[url] = true;

            items.push({
                id: url,
                title: title,
                url: url,
                posterUrl: normalizeUrl(image),
                backdropUrl: normalizeUrl(image),
                description: "",
                year: 0,
                duration: "",
                category: "",
                quality: ""
            });
        }

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: items.length,
                itemsPerPage: items.length
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
        var title =
            getMeta(html, "og:title") ||
            getTitle(html);

        var canonical =
            getCanonical(html) ||
            getMeta(html, "og:url");

        var poster =
            getMeta(html, "og:image");

        var description =
            getMeta(html, "og:description") ||
            getMeta(html, "description");

        var duration =
            getMeta(html, "og:video:duration");

        var releaseDate =
            getMeta(html, "og:video:release_date");

        var contentTitle = "";

        var h1 = html.match(
            /<h1[^>]*>([\s\S]*?)<\/h1>/i
        );

        if (h1) {
            contentTitle = stripHtml(h1[1]);
        }

        var tags = [];

        var tagRegex =
            /<meta\b[^>]*property=["']video:tag["'][^>]*>/gi;

        var tagMatch;

        while ((tagMatch = tagRegex.exec(html)) !== null) {
            var tag = getAttribute(
                tagMatch[0],
                "content"
            );

            if (tag) {
                tags.push(tag);
            }
        }

        return JSON.stringify({
            id: canonical,
            title: contentTitle || title,
            originName: title,
            posterUrl: normalizeUrl(poster),
            backdropUrl: normalizeUrl(poster),
            description: stripHtml(description),
            year: 0,
            rating: 0,
            quality: "",
            duration: duration
                ? parseInt(duration, 10)
                : 0,
            episode_current: "",
            lang: "",
            category: tags.join(", "),
            country: "",
            director: "",
            casts: "",
            status: "",
            releaseDate: releaseDate,
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
     * Return metadata only.
     * Does not resolve player links or streams.
     */

    try {
        var parsed = JSON.parse(input || "{}");

        return JSON.stringify({
            url: parsed.url || "",
            isDirectStream: false,
            headers: {},
            subtitles: []
        });

    } catch (e) {
        return JSON.stringify({
            url: "",
            isDirectStream: false,
            headers: {},
            subtitles: []
        });
    }
}

// ============================================================
// CATEGORIES
// ============================================================

function parseCategoriesResponse(html) {
    try {
        var items = [];

        var anchors = html.match(
            /<a\b[^>]*>[\s\S]*?<\/a>/gi
        ) || [];

        for (var i = 0; i < anchors.length; i++) {
            var tag = anchors[i];

            var href = getAttribute(tag, "href");

            var name = stripHtml(tag);

            if (!href || !name) continue;

            items.push({
                name: name,
                slug: normalizeUrl(href)
            });
        }

        return JSON.stringify(items);

    } catch (e) {
        return "[]";
    }
}

function parseCountriesResponse(html) {
    return parseCategoriesResponse(html);
}

function parseYearsResponse(html) {
    return getLocalYearsJson();
}
