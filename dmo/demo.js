// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

var BASE_URL = "https://javhdz.today";

var DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": BASE_URL + "/"
};

var PORNSTARS_LIST = [
    { name: "Hatano Yui", slug: "pornstar/hatano-yui" },
    { name: "Aika", slug: "pornstar/aika" },
    { name: "Hasumi Kurea", slug: "pornstar/hasumi-kurea" },
    { name: "Iioka Kanako", slug: "pornstar/iioka-kanako" },
    { name: "Nagisa Mitsuki", slug: "pornstar/nagisa-mitsuki" },
    { name: "Shinoda Yuu", slug: "pornstar/shinoda-yuu" },
    { name: "Matsumoto Ichika", slug: "pornstar/matsumoto-ichika" },
    { name: "Hamasaki Mao", slug: "pornstar/hamasaki-mao" },
    { name: "Haruna Hana", slug: "pornstar/haruna-hana" },
    { name: "Mitani Akari", slug: "pornstar/mitani-akari" },
    { name: "Ootsuki Hibiki", slug: "pornstar/ootsuki-hibiki" },
    { name: "Uehara Ai", slug: "pornstar/uehara-ai" },
    { name: "Seina Arisa", slug: "pornstar/seina-arisa" },
    { name: "Hachino Tsubasa", slug: "pornstar/hachino-tsubasa" },
    { name: "Yayoi Mizuki", slug: "pornstar/yayoi-mizuki" },
    { name: "Kimijima Mio", slug: "pornstar/kimijima-mio" }
];

function getManifest() {
    return JSON.stringify({
        "id": "javhd",
        "name": "JavHD",
        "version": "1.1.1",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay"
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới cập nhật", slug: "recent" },
        { name: "Không Che", slug: "uncensored-jav" },
        { name: "Khử Che", slug: "reducing-mosaic" },
        { name: "Vietsub", slug: "jav-sub" },
        { name: "Nghiệp Dư", slug: "amateur" },
        { name: "Diễn Viên", slug: "pornstar" }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "popular/today", title: "Xem Nhiều Hôm Nay", type: "Horizontal", path: "" },
        { slug: "uncensored-jav", title: "Jav Uncensored", type: "Horizontal", path: "" },
        { slug: "reducing-mosaic", title: "Reducing Mosaic", type: "Horizontal", path: "" },
        { slug: "jav-sub", title: "Jav Sub", type: "Horizontal", path: "" },
        { slug: "recent", title: "Video Mới Cập Nhật", type: "Grid", path: "" }
    ]);
}

function getFilterConfig() {
    var categoryWithStars = [
        { name: "Uncensored Jav", value: "uncensored-jav" },
        { name: "Reducing Mosaic", value: "reducing-mosaic" },
        { name: "Jav Sub", value: "jav-sub" },
        { name: "Chinese Sub", value: "chinese-subtitle" },
        { name: "Creampie", value: "creampie" },
        { name: "Big Tits", value: "big-tits" },
        { name: "Amateur", value: "amateur" },
        { name: "Married Woman", value: "married-woman" },
        { name: "Beautiful Girl", value: "beautiful-girl" },
        { name: "Mature Woman", value: "mature-woman" },
        { name: "Cuckold", value: "cuckold" },
        { name: "Squirting", value: "squirting" },
        { name: "Nasty", value: "nasty" },
        { name: "Hardcore", value: "hardcore" }
    ];

    for (var i = 0; i < PORNSTARS_LIST.length; i++) {
        categoryWithStars.push({
            name: "DV: " + PORNSTARS_LIST[i].name,
            value: PORNSTARS_LIST[i].slug
        });
    }

    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "recent" },
            { name: "Xem nhiều hôm nay", value: "popular/today" },
            { name: "Xem nhiều trong tuần", value: "popular/week" },
            { name: "Xem nhiều trong tháng", value: "popular/month" },
            { name: "Xem nhiều tất cả", value: "popular/year" },
            { name: "Nhiều lượt thích", value: "rated/year" }
        ],
        category: categoryWithStars,
        pornstar: PORNSTARS_LIST,
        pornstars: PORNSTARS_LIST
    });
}

function getPornstars(page, pageSize) {
    if (typeof page === "undefined" || page === null) {
        return JSON.stringify(PORNSTARS_LIST);
    }

    var currentPage = parseInt(page, 10) || 1;
    var perPage = parseInt(pageSize, 10) || 10;
    if (currentPage < 1) currentPage = 1;
    if (perPage < 1) perPage = 10;

    var totalItems = PORNSTARS_LIST.length;
    var totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * perPage;
    var end = start + perPage;

    return JSON.stringify({
        items: PORNSTARS_LIST.slice(start, end),
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: perPage
        }
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

var LAST_LIST_CONTEXT = {
    slug: "recent",
    page: 1
};

function getUrlList(slug, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    if (page < 1) page = 1;

    var sortPath = (filters.sort && filters.sort !== "recent")
        ? (String(filters.sort).replace(/^\/+|\/+$/g, "") + "/")
        : "";

    var targetSlug = filters.pornstar || filters.category || slug || "recent";
    targetSlug = String(targetSlug).trim();

    if (targetSlug.indexOf("http") === 0) {
        var cleanFull = targetSlug.replace(/\/+$/, "");
        var sepFull = (cleanFull.indexOf("?") !== -1) ? "&" : "?";
        LAST_LIST_CONTEXT = { slug: cleanFull, page: page };
        return cleanFull + "/" + sepFull + (page > 1 ? "ajax=1&page=" + page : "ajax=1");
    }

    targetSlug = targetSlug.replace(/^\/+|\/+$/g, "");
    if (!targetSlug) targetSlug = "recent";

    LAST_LIST_CONTEXT = { slug: targetSlug, page: page };

    var isBrowse = false;
    var browsePrefixes = ["recent", "popular", "rated", "discussed", "downloaded", "longest", "watched"];
    for (var i = 0; i < browsePrefixes.length; i++) {
        if (targetSlug.indexOf(browsePrefixes[i]) === 0) {
            isBrowse = true;
            break;
        }
    }

    var finalUrl = BASE_URL + "/" + targetSlug + "/" + sortPath;
    var params = [isBrowse ? "ajax=browse_videos" : "ajax=1"];
    if (page > 1) {
        params.push("page=" + page);
    }

    var separator = (finalUrl.indexOf("?") !== -1) ? "&" : "?";
    return finalUrl + separator + params.join("&");
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try {
        filters = JSON.parse(filtersJson || "{}");
    } catch (e) {
        filters = {};
    }

    var page = parseInt(filters.page, 10) || 1;
    if (page < 1) page = 1;

    var url = BASE_URL + "/search/video/?s=" + encodeURIComponent(keyword || "") + "&ajax=1";
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getUrlDetail(slug) {
    var s = String(slug || "").trim();
    if (!s) return BASE_URL;
    if (s.indexOf("http") === 0) return s;
    if (s.indexOf("/") === 0) return BASE_URL + s;
    return BASE_URL + "/" + s;
}

function getUrlCategories() { return BASE_URL + "/categories/"; }
function getUrlPornstarsPage(page) {
    var p = parseInt(page, 10) || 1;
    return p > 1 ?
