var BASE_URL = "https://nguonphim1.site";
// Dán chuỗi Cookie bạn vừa lấy từ trình duyệt vào giữa dấu ngoặc kép bên dưới:
var SITE_COOKIE = "";

function getManifest() {
    return JSON.stringify({
        id: "nguonphim1",
        name: "Nguồn Phim 1",
        version: "1.0.2",
        baseUrl: BASE_URL,
        type: "MOVIE",
        layout: "VERTICAL"
    });
}

function getHeaders() {
    var headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": BASE_URL + "/"
    };
    if (SITE_COOKIE) {
        headers["Cookie"] = SITE_COOKIE;
    }
    return JSON.stringify(headers);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "moi-cap-nhat", title: "Mới cập nhật", type: "MOVIE", path: "" },
        { slug: "phim-le", title: "Phim lẻ", type: "MOVIE", path: "phim-le.html" },
        { slug: "phim-bo", title: "Phim bộ", type: "MOVIE", path: "phim-bo.html" },
        { slug: "hoat-hinh", title: "Hoạt hình", type: "MOVIE", path: "hoat-hinh.html" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { slug: "phim-le.html", title: "Phim lẻ" },
        { slug: "phim-bo.html", title: "Phim bộ" },
        { slug: "hoat-hinh.html", title: "Hoạt hình" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify([]);
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var path = "";
    if (slug && slug !== "moi-cap-nhat") {
        path = slug.indexOf(".html") !== -1 ? "/" + slug : "/" + slug + ".html";
    }
    var url = BASE_URL + path;
    if (page > 1) {
        url += (url.indexOf("?") !== -1 ? "&" : "?") + "page=" + page;
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_URL + "/tim-kiem.html?q=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return BASE_URL;
    if (slug.indexOf("http") === 0) return slug;
    return BASE_URL + (slug.indexOf("/") === 0 ? slug : "/" + slug);
}

function fixUrl(url) {
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.indexOf("/") === 0) return BASE_URL + url;
    if (url.indexOf("http") !== 0) return BASE_URL + "/" + url;
    return url;
}

function cleanText(str) {
    if (!str) return "";
    return str.replace(/<[^>]*>/g, "")
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/\s+/g, " ")
              .trim();
}

function extractMovies(html) {
    var items = [];
    var seen = {};
    if (!html) return items;

    var linkRegex = /<a[^>]+href=["']([^"']*\/xem-phim\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = linkRegex.exec(html)) !== null) {
        var rawHref = match[1];
        var innerHtml = match[2];

        var imgMatch = innerHtml.match(/<img[^>]+(?:data-src|data-original|src)=["']([^"']+)["'][^>]*>/i);
        if (!imgMatch || !imgMatch[1]) continue;

        var titleMatch = match[0].match(/title=["']([^"']+)["']/i) || innerHtml.match(/alt=["']([^"']+)["']/i);
        var title = titleMatch && titleMatch[1] ? cleanText(titleMatch[1]) : cleanText(innerHtml);
        title = title.replace(/^Phim\s+/i, "");

        if (!title) continue;

        var id = rawHref.replace(BASE_URL, "");
        if (seen[id]) continue;
        seen[id] = true;

        var posterUrl = fixUrl(imgMatch[1]);

        items.push({
            id: id,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            year: ""
        });
    }
    return items;
}

function parseListResponse(html) {
    try {
        var movies = extractMovies(html);
        return JSON.stringify({ items: movies });
    } catch (e) {
        return JSON.stringify({ items: [] });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var titleMatch = html.match(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i)
                      || html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        var title = titleMatch && titleMatch[1] ? cleanText(titleMatch[1]).replace(/^Phim\s+/i, "").split("|")[0].trim() : "Phim";

        var descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
        var description = descMatch && descMatch[1] ? cleanText(descMatch[1]) : "";

        var imgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        var posterUrl = imgMatch && imgMatch[1] ? fixUrl(imgMatch[1]) : "";

        var urlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
        var currentUrl = urlMatch && urlMatch[1] ? urlMatch[1] : BASE_URL;

        var episodes = [];
        var epSeen = {};
        var epRegex = /<a[^>]+href=["']([^"']*\/xem-phim\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;

        while ((epMatch = epRegex.exec(html)) !== null) {
            var epHref = fixUrl(epMatch[1]);
            var epName = cleanText(epMatch[2]);

            if (epName && !epSeen[epHref] && (/^(Tập\s*)?\d+/i.test(epName) || /^(Full|HD|Thuyết minh|Vietsub)/i.test(epName))) {
                epSeen[epHref] = true;
                episodes.push({
                    name: epName,
                    slug: epHref,
                    url: epHref
                });
            }
        }

        if (episodes.length === 0) {
            episodes.push({
                name: "Full",
                slug: currentUrl,
                url: currentUrl
            });
        }

        return JSON.stringify({
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            episodes: [
                {
                    server_name: "Vietsub / Thuyết Minh",
                    server_data: episodes
                }
            ]
        });
    } catch (e) {
        return JSON.stringify({});
    }
}

function parseDetailResponse(html) {
    try {
        var headers = JSON.parse(getHeaders());

        var jwMatch = html.match(/["']?file["']?\s*:\s*["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
        if (jwMatch && jwMatch[1]) {
            return JSON.stringify({
                url: jwMatch[1].replace(/\\\//g, "/"),
                headers: headers
            });
        }

        var rawMatch = html.match(/(https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)/i);
        if (rawMatch && rawMatch[1]) {
            return JSON.stringify({
                url: rawMatch[1].replace(/\\\//g, "/"),
                headers: headers
            });
        }

        var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (iframeMatch && iframeMatch[1]) {
            return JSON.stringify({
                url: fixUrl(iframeMatch[1]),
                headers: headers
            });
        }

        return JSON.stringify({ url: "" });
    } catch (e) {
        return JSON.stringify({ url: "" });
    }
}
