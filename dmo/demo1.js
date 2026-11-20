/* =========================================
   TVHAY.BUZZ - VAXPLAYER COMPATIBILITY FIX
   ES5
========================================= */

var BASE_URL = "https://tvhay.buzz";
var PLUGIN_ID = "tvhay";

/* =========================================
   MANIFEST
========================================= */

function getManifest() {
    return JSON.stringify({
        id: "tvhay",
        name: "TVHAY",
        version: "2.1.0",
        baseUrl: BASE_URL,
        iconUrl: "",
        isEnabled: true,
        type: "MOVIE"
    });
}

/* =========================================
   HOME SECTIONS
========================================= */

function getHomeSections() {
    return JSON.stringify([
        {
            slug: "phim-moi",
            title: "Phim Mới",
            type: "Grid",
            path: "phim-moi"
        },
        {
            slug: "phim-bo",
            title: "Phim Bộ",
            type: "Horizontal",
            path: "phim-bo"
        },
        {
            slug: "phim-le",
            title: "Phim Lẻ",
            type: "Horizontal",
            path: "phim-le"
        },
        {
            slug: "short-drama",
            title: "Short Drama",
            type: "Horizontal",
            path: "short-drama"
        }
    ]);
}

/* =========================================
   PRIMARY CATEGORIES
========================================= */

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim mới", slug: "phim-moi" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Short Drama", slug: "short-drama" },
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
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Thần Thoại", slug: "than-thoai" },
        { name: "Thể Thao", slug: "the-thao" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Viễn Tưởng", slug: "vien-tuong" },
        { name: "Võ Thuật", slug: "vo-thuat" },
        { name: "Âm Nhạc", slug: "am-nhac" }
    ]);
}

/* =========================================
   FILTER CONFIG
========================================= */

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới cập nhật", value: "latest" },
            { name: "Năm phát hành", value: "year" }
        ]
    });
}

/* =========================================
   URL LIST
   VAXPLAYER: getUrlList(slug, filtersJson)
========================================= */

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");

        var page = parseInt(filters.page, 10) || 1;

        slug = String(slug || "phim-moi");

        slug = slug.replace(/^\/+|\/+$/g, "");

        var path = slug;

        if (slug === "latest") {
            path = "phim-moi";
        }

        if (slug === "series") {
            path = "phim-bo";
        }

        if (slug === "movies") {
            path = "phim-le";
        }

        if (slug === "short-drama") {
            path = "short-drama";
        }

        var url = BASE_URL + "/" + path;

        if (page > 1) {
            url += "/" + page;
        }

        return url;

    } catch (e) {
        return BASE_URL + "/phim-moi";
    }
}

/* =========================================
   URL SEARCH
========================================= */

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");

        var page = parseInt(filters.page, 10) || 1;

        var url = BASE_URL +
            "/tim-kiem?keyword=" +
            encodeURIComponent(String(keyword || ""));

        if (page > 1) {
            url += "&page=" + page;
        }

        return url;

    } catch (e) {
        return BASE_URL +
            "/tim-kiem?keyword=" +
            encodeURIComponent(String(keyword || ""));
    }
}

/* =========================================
   URL DETAIL
========================================= */

function getUrlDetail(slug) {
    slug = String(slug || "");

    if (/^https?:\/\//i.test(slug)) {
        return slug;
    }

    slug = slug.replace(/^\/+/, "");

    if (slug.indexOf("phim/") === 0) {
        return BASE_URL + "/" + slug;
    }

    return BASE_URL + "/phim/" + slug;
}

/* =========================================
   URL CATEGORIES
========================================= */

function getUrlCategories() {
    return BASE_URL + "/the-loai";
}

/* =========================================
   URL COUNTRIES
========================================= */

function getUrlCountries() {
    return BASE_URL + "/quoc-gia";
}

/* =========================================
   URL YEARS
========================================= */

function getUrlYears() {
    return "";
}

/* =========================================
   LOCAL YEARS
========================================= */

function getLocalYearsJson() {
    var currentYear = new Date().getFullYear();

    var years = [];

    for (var y = currentYear; y >= 1970; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }

    return JSON.stringify(years);
}

/* =========================================
   LIST RESPONSE
========================================= */

function parseListResponse(html) {
    try {
        html = String(html || "");

        var movies = extractMovieLinks(html);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: extractCurrentPage(html),
                totalPages: 1,
                totalItems: movies.length,
                itemsPerPage: movies.length || 24,
                hasNextPage: extractHasNextPage(html),
                nextPage: extractNextPage(html)
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

/* =========================================
   SEARCH RESPONSE
========================================= */

function parseSearchResponse(html) {
    return parseListResponse(html);
}

/* =========================================
   MOVIE DETAIL
========================================= */

function parseMovieDetail(html) {
    try {
        html = String(html || "");

        var poster = extractPoster(html);

        return JSON.stringify({
            id: extractMovieId(html),
            title: extractMovieTitle(html),
            originName: extractOriginalTitle(html),
            posterUrl: poster,
            backdropUrl: poster,
            description: extractDescription(html),
            year: parseInt(extractYear(html), 10) || 0,
            country: extractCountries(html).join(", "),
            category: extractCategories(html).join(", "),
            casts: extractActors(html).join(", "),
            director: extractDirectors(html).join(", "),
            duration: extractDuration(html),
            quality: extractQuality(html),
            status: extractStatus(html),
            episodes: extractEpisodes(html)
        });

    } catch (e) {
        return "null";
    }
}

/* =========================================
   DETAIL RESPONSE
========================================= */

function parseDetailResponse(html) {
    try {
        html = String(html || "");

        var detailJson = parseMovieDetail(html);

        var detail = JSON.parse(detailJson);

        detail.url = extractCanonicalURL(html);
        detail.playerPresent = detectPlayer(html);
        detail.servers = extractServerNames(html);
        detail.nextEpisode = extractNextEpisode(html);
        detail.previousEpisode = extractPreviousEpisode(html);
        detail.likes = extractLikes(html);

        return JSON.stringify(detail);

    } catch (e) {
        return "null";
    }
}

/* =========================================
   CATEGORIES RESPONSE
========================================= */

function parseCategoriesResponse(html) {
    try {
        html = String(html || "");

        var result = [];
        var regex =
            /<a\b[^>]*href\s*=\s*["'][^"']*\/the-loai\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

        var match;

        while ((match = regex.exec(html)) !== null) {
            var slug = match[1].split(/[?#]/)[0].replace(/\/+$/, "");
            var name = cleanText(match[2]);

            if (name && slug) {
                result.push({
                    name: name,
                    slug: slug
                });
            }
        }

        return JSON.stringify(result);

    } catch (e) {
        return "[]";
    }
}

/* =========================================
   COUNTRIES RESPONSE
========================================= */

function parseCountriesResponse(html) {
    try {
        html = String(html || "");

        var result = [];
        var regex =
            /<a\b[^>]*href\s*=\s*["'][^"']*\/quoc-gia\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

        var match;

        while ((match = regex.exec(html)) !== null) {
            var slug = match[1].split(/[?#]/)[0].replace(/\/+$/, "");
            var name = cleanText(match[2]);

            if (name && slug) {
                result.push({
                    name: name,
                    value: slug
                });
            }
        }

        return JSON.stringify(result);

    } catch (e) {
        return "[]";
    }
}

/* =========================================
   YEARS RESPONSE
========================================= */

function parseYearsResponse(html) {
    return getLocalYearsJson();
}
