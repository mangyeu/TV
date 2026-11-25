
var BASE = "https://javcc.me";

function getManifest() {
    return JSON.stringify({
        id: "javcc_me",
        name: "JAVCC",
        version: "1.0.0",
        baseUrl: BASE,
        iconUrl: BASE + "/favicon.ico",
        isEnabled: true,
        isAdult: true,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "", title: "Phim mới", type: "Horizontal", path: "" },
        { slug: "random", title: "Phim ngẫu nhiên", type: "Horizontal", path: "" },
        { slug: "reducing-mosaic", title: "Reducing Mosaic", type: "Horizontal", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [],
        category: [],
        year: []
    });
}

// ================= URL =================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;

    if (!slug) {
        return page > 1 ? BASE + "/page/" + page + "/" : BASE + "/";
    }

    if (slug === "random") {
        return BASE + "/category/random/";
    }

    if (slug === "reducing-mosaic") {
        return BASE + "/category/reducing-mosaic/";
    }

    return BASE + "/" + slug + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;

    return BASE + "/?s=" +
        encodeURIComponent(keyword) +
        (page > 1 ? "&paged=" + page : "");
}

function getUrlDetail(slug) {
    if (/^https?:\/\//i.test(slug)) return slug;
    return BASE + "/" + slug.replace(/^\/|\/$/g, "") + "/";
}

function getUrlCategories() {
    return "";
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// ================= HELPERS =================

function cleanText(s) {
    return (s || "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#(\d+);/g, function(a, n) {
            return String.fromCharCode(Number(n));
        })
        .replace(/\s+/g, " ")
        .trim();
}

function absoluteUrl(url) {
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    if (/^https?:\/\//i.test(url)) return url;
    return BASE + (url.charAt(0) === "/" ? "" : "/") + url;
}

function getAttr(html, name) {
    var re = new RegExp(
        name + '\\s*=\\s*["\\']([^"\\']+)["\\']',
        "i"
    );
    var m = html.match(re);
    return m ? m[1] : "";
}

function getMeta(html, key) {
    var re = new RegExp(
        '<meta[^>]*(?:property|name)=["\\']' +
        key +
        '["\\'][^>]*content=["\\']([^"\\']*)["\\']',
        "i"
    );
    var m = html.match(re);

    if (!m) {
        re = new RegExp(
            '<meta[^>]*content=["\\']([^"\\']*)["\\'][^>]*(?:property|name)=["\\']' +
            key + '["\\']',
            "i"
        );
        m = html.match(re);
    }

    return m ? m[1] : "";
}

// ================= PARSE LIST =================

function parseListResponse(html) {
    try {
        var items = [];
        var seen = {};

        var regex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = regex.exec(html)) !== null) {
            var attrs = match[1];
            var content = match[2];

            var href = getAttr(attrs, "href");
            var title = getAttr(attrs, "title");

            if (!href || href.indexOf("javcc.me") === -1 &&
                href.charAt(0) !== "/") {
                continue;
            }

            var imageMatch = content.match(
                /<(?:img|source)[^>]*(?:src|data-src|data-lazy-src)=["']([^"']+)["']/i
            );

            var image = imageMatch ? imageMatch[1] : "";

            if (!image) continue;

            if (!title) {
                title = cleanText(content);
            }

            if (!title || title.length < 2) continue;

            var id = href
                .replace(/^https?:\/\/javcc\.me/i, "")
                .replace(/^\/|\/$/g, "");

            if (!id || seen[id]) continue;

            seen[id] = true;

            items.push({
                id: id,
                title: title,
                posterUrl: absoluteUrl(image),
                description: "",
                detailUrl: absoluteUrl(href)
            });
        }

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });

    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

// ================= PARSE DETAIL =================

function parseMovieDetail(html) {
    try {
        var title =
            getMeta(html, "og:title") ||
            cleanText((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);

        var poster =
            getMeta(html, "og:image");

        var description =
            getMeta(html, "description") ||
            getMeta(html, "og:description");

        var date =
            getMeta(html, "article:published_time");

        var duration =
            (html.match(/(?:Duration|Runtime)[^<]{0,30}(\d{1,2}:\d{2}:\d{2})/i) || [])[1] || "";

        var actor = [];
        var actorRegex =
            /(?:Pornstars|Actress)[\s\S]{0,100}?<a[^>]*>([^<]+)<\/a>/gi;

        var m;
        while ((m = actorRegex.exec(html)) !== null) {
            actor.push(cleanText(m[1]));
        }

        var slug = html.match(
            /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i
        );

        return JSON.stringify({
            id: slug ? slug[1] : "",
            title: cleanText(title),
            posterUrl: absoluteUrl(poster),
            backdropUrl: absoluteUrl(poster),
            description: cleanText(description),
            servers: [{
                name: "JAVCC",
                episodes: [{
                    id: slug ? slug[1] : "",
                    name: "Play",
                    slug: "1"
                }]
            }],
            quality: "HD",
            year: date ? Number(date.substring(0, 4)) : 0,
            rating: 0,
            status: "Full",
            duration: duration,
            casts: actor.join(", "),
            director: "",
            category: ""
        });

    } catch (e) {
        return JSON.stringify({});
    }
}

// ================= PARSE VIDEO =================

function parseDetailResponse(html) {
    try {
        // Tìm video trực tiếp
        var video = html.match(
            /<(?:video|source)[^>]*src=["']([^"']+\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/i
        );

        if (video) {
            return JSON.stringify({
                url: absoluteUrl(video[1]),
                isEmbed: false,
                headers: {
                    Referer: BASE + "/"
                },
                subtitles: []
            });
        }

        // Tìm URL video trong JavaScript
        var file = html.match(
            /["'](?:file|src|url)["']\s*:\s*["'](https?:[^"']+\.(?:m3u8|mp4)[^"']*)["']/i
        );

        if (file) {
            return JSON.stringify({
                url: file[1].replace(/\\\//g, "/"),
                isEmbed: false,
                headers: {
                    Referer: BASE + "/"
                },
                subtitles: []
            });
        }

        // Tìm iframe
        var iframe = html.match(
            /<iframe[^>]+src=["']([^"']+)["']/i
        );

        if (iframe) {
            return JSON.stringify({
                url: absoluteUrl(iframe[1]),
                isEmbed: true,
                headers: {
                    Referer: BASE + "/"
                }
            });
        }

        return JSON.stringify({
            url: "",
            isEmbed: false
        });

    } catch (e) {
        return JSON.stringify({
            url: "",
            isEmbed: false
        });
    }
}

// ================= EMBED =================

function parseEmbedResponse(html, sourceUrl) {
    try {
        // Direct HLS / MP4
        var video = html.match(
            /https?:\\?\/\\?\/[^"' ]+\.(?:m3u8|mp4)(?:\?[^"' ]*)?/i
        );

        if (video) {
            return JSON.stringify({
                url: video[0].replace(/\\\//g, "/"),
                isEmbed: false,
                headers: {
                    Referer: sourceUrl || BASE + "/"
                }
            });
        }

        // Iframe tiếp theo
        var iframe = html.match(
            /<iframe[^>]+src=["']([^"']+)["']/i
        );

        if (iframe) {
            return JSON.stringify({
                url: absoluteUrl(iframe[1]),
                isEmbed: true
            });
        }

        return JSON.stringify({
            url: "",
            isEmbed: false
        });

    } catch (e) {
        return JSON.stringify({
            url: "",
            isEmbed: false
        });
    }
}

// ================= CATEGORIES =================

function parseCategoriesResponse(html) {
    return "[]";
}

function parseCountriesResponse(html) {
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}
