var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

// =========================================================================
// 1. HÀM TIỆN ÍCH CƠ BẢN ES5
// =========================================================================
function safeTrim(val) {
    if (val === null || val === undefined) {
        return "";
    }
    return String(val).replace(/^\s+|\s+$/g, "");
}

function toInt(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var n = parseInt(val, 10);
    return isNaN(n) ? defVal : n;
}

function toFloat(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var f = parseFloat(val);
    return isNaN(f) ? defVal : f;
}

function isArraySafe(val) {
    if (typeof Array !== "undefined" && typeof Array.isArray === "function") {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isPlainObject(val) {
    return typeof val === "object" && val !== null && !isArraySafe(val);
}

function looksLikeHtml(str) {
    var s = safeTrim(str);
    if (!s) {
        return false;
    }
    return /^<!doctype html/i.test(s) || /^<html[\s>]/i.test(s) || /<(body|head|script|div|title|form)[\s>]/i.test(s);
}

function safeParseJson(input, fallback) {
    if (input === null || input === undefined) {
        return fallback;
    }
    if (isPlainObject(input) || isArraySafe(input)) {
        return input;
    }
    var raw = safeTrim(input);
    if (!raw || looksLikeHtml(raw)) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        var firstObj = raw.indexOf("{");
        var lastObj = raw.lastIndexOf("}");
        if (firstObj !== -1 && lastObj > firstObj) {
            try {
                return JSON.parse(raw.substring(firstObj, lastObj + 1));
            } catch (e2) {}
        }
        var firstArr = raw.indexOf("[");
        var lastArr = raw.lastIndexOf("]");
        if (firstArr !== -1 && lastArr > firstArr) {
            try {
                return JSON.parse(raw.substring(firstArr, lastArr + 1));
            } catch (e3) {}
        }
        return fallback;
    }
}

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
    }
}

function normalizeFilters(filtersJson) {
    var parsed = safeParseJson(filtersJson, {});
    var obj = isPlainObject(parsed) ? parsed : {};
    var page = toInt(obj.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(obj.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }
    return {
        page: page,
        limit: limit,
        category: safeTrim(obj.category),
        country: safeTrim(obj.country),
        year: safeTrim(obj.year),
        sort: safeTrim(obj.sort)
    };
}

function appendFilterQuery(baseUrl, filters, includePageAndLimit) {
    var url = baseUrl;
    var sep = (url.indexOf("?") === -1) ? "?" : "&";

    if (includePageAndLimit) {
        url += sep + "page=" + filters.page + "&limit=" + filters.limit;
        sep = "&";
    }
    if (filters.category) {
        url += sep + "category=" + encodeURIComponent(filters.category);
        sep = "&";
    }
    if (filters.country) {
        url += sep + "country=" + encodeURIComponent(filters.country);
        sep = "&";
    }
    if (filters.year) {
        url += sep + "year=" + encodeURIComponent(filters.year);
        sep = "&";
    }
    if (filters.sort) {
        url += sep + "sort=" + encodeURIComponent(filters.sort);
        sep = "&";
    }
    return url;
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }
    if (isArraySafe(response)) {
        return response;
    }
    if (!isPlainObject(response)) {
        return [];
    }
    if (isArraySafe(response.items)) {
        return response.items;
    }
    if (isArraySafe(response.movies)) {
        return response.movies;
    }
    if (isArraySafe(response.results)) {
        return response.results;
    }
    if (isArraySafe(response.list)) {
        return response.list;
    }
    if (isArraySafe(response.data)) {
        return response.data;
    }
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) {
            return response.data.items;
        }
        if (isArraySafe(response.data.movies)) {
            return response.data.movies;
        }
        if (isArraySafe(response.data.results)) {
            return response.data.results;
        }
        if (isArraySafe(response.data.list)) {
            return response.data.list;
        }
    }
    return [];
}

function extractCdnDomain(response) {
    var candidates = [];
    if (isPlainObject(response)) {
        if (isPlainObject(response.data)) {
            candidates.push(response.data.cdnDomain);
            candidates.push(response.data.APP_DOMAIN_CDN_IMAGE);
            candidates.push(response.data.domain_cdn);
        }
        candidates.push(response.cdnDomain);
        candidates.push(response.APP_DOMAIN_CDN_IMAGE);
        candidates.push(response.domain_cdn);
    }

    var i;
    for (i = 0; i < candidates.length; i++) {
        var c = safeTrim(candidates[i]);
        if (c) {
            if (c.indexOf("http://") === 0 || c.indexOf("https://") === 0) {
                return c;
            }
            if (c.indexOf("//") === 0) {
                return "https:" + c;
            }
            return "https://" + c.replace(/^\/+/, "");
        }
    }
    return BASE_URL;
}

function buildMediaUrl(path, cdnDomain, fallbackPath) {
    var raw = safeTrim(path) || safeTrim(fallbackPath);
    if (!raw) {
        return "";
    }
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    if (raw.indexOf("//") === 0) {
        return "https:" + raw;
    }
    var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
    if (!base) {
        base = BASE_URL;
    }
    var cleanPath = raw.replace(/^\/+/, "");
    return base + "/" + cleanPath;
}

function stripHtmlToText(html) {
    if (!html) {
        return "";
    }
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");
}

function joinNamedList(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var parts = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var text = "";
        if (typeof item === "string") {
            text = safeTrim(item);
        } else if (isPlainObject(item)) {
            text = safeTrim(item.name || item.title || item.slug || "");
        }
        if (text && parts.join(", ").indexOf(text) === -1) {
            parts.push(text);
        }
    }
    return parts.join(", ");
}

function buildDefaultPagination(page, limit, totalItems, totalPages) {
    var safePage = toInt(page, 1);
    if (safePage < 1) {
        safePage = 1;
    }
    var safeLimit = toInt(limit, DEFAULT_LIMIT);
    if (safeLimit < 1) {
        safeLimit = DEFAULT_LIMIT;
    }
    var safeTotalItems = toInt(totalItems, 0);
    if (safeTotalItems < 0) {
        safeTotalItems = 0;
    }
    var calcPages = Math.max(1, Math.ceil(safeTotalItems / safeLimit));
    var safeTotalPages = toInt(totalPages, calcPages);
    if (safeTotalPages < 1) {
        safeTotalPages = 1;
    }

    return {
        currentPage: safePage,
        totalPages: safeTotalPages,
        totalItems: safeTotalItems,
        itemsPerPage: safeLimit
    };
}

// =========================================================================
// 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
// =========================================================================
function getManifest() {
    var baseUrl = safeTrim(BASE_URL) || "https://clbphimxua.top";
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.2",
        "baseUrl": baseUrl,
        "iconUrl": baseUrl + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.2","baseUrl":"https://clbphimxua.top","iconUrl":"https://clbphimxua.top/favicon.ico","isEnabled":true,"type":"MOVIE"}');
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" },
            { name: "Tên phim", value: "name" }
        ]
    }, '{"sort":[]}');
}

// =========================================================================
// 3. TẠO URL CHÍNH & DANH SÁCH URL DỰ PHÒNG (FALLBACK)
// =========================================================================
function getUrlListFallback(slug, filtersJson) {
    var cleanSlug = safeTrim(slug) || "phim-moi-cap-nhat";
    var filters = normalizeFilters(filtersJson);
    var encSlug = encodeURIComponent(cleanSlug);

    var candidates = [
        appendFilterQuery(BASE_URL + "/api/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/v1/api/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/api/v1/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/api/phim?type=" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/danh-sach/" + encSlug, filters, true)
    ];

    return safeStringify(candidates, "[]");
}

function getUrlList(slug, filtersJson) {
    var list = safeParseJson(getUrlListFallback(slug, filtersJson), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/danh-sach/phim-moi-cap-nhat?page=1&limit=24");
}

function getUrlSearchFallback(keyword, filtersJson) {
    var cleanKeyword = safeTrim(keyword);
    var filters = normalizeFilters(filtersJson);
    var encQ = encodeURIComponent(cleanKeyword);

    var candidates = [
        appendFilterQuery(BASE_URL + "/api/tim-kiem?keyword=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/v1/api/tim-kiem?keyword=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/api/search?q=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/tim-kiem?keyword=" + encQ, filters, true)
    ];

    return safeStringify(candidates, "[]");
}

function getUrlSearch(keyword, filtersJson) {
    var list = safeParseJson(getUrlSearchFallback(keyword, filtersJson), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/tim-kiem?keyword=&page=1&limit=24");
}

function getUrlDetailFallback(slug) {
    var cleanSlug = safeTrim(slug);
    var encSlug = encodeURIComponent(cleanSlug);
    var candidates = [
        BASE_URL + "/api/phim/" + encSlug,
        BASE_URL + "/v1/api/phim/" + encSlug,
        BASE_URL + "/api/chi-tiet/" + encSlug,
        BASE_URL + "/phim/" + encSlug
    ];
    return safeStringify(candidates, "[]");
}

function getUrlDetail(slug) {
    var cleanSlug = safeTrim(slug);
    if (!cleanSlug) {
        return BASE_URL + "/api/phim";
    }
    var list = safeParseJson(getUrlDetailFallback(cleanSlug), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/phim/" + encodeURIComponent(cleanSlug));
}

function getUrlCategoriesFallback() {
    return safeStringify([
        BASE_URL + "/api/the-loai",
        BASE_URL + "/v1/api/the-loai",
        BASE_URL + "/api/categories",
        BASE_URL + "/the-loai"
    ], "[]");
}

message: "Dữ liệu nguồn null hoặc undefined"
        }, '{"ok":false,"code":"EMPTY_INPUT"}');
    }

    if (isPlainObject(rawInput) || isArraySafe(rawInput)) {
        return safeStringify({
            ok: true,
            code: "OBJECT_INPUT",
            count: extractArrayItems(rawInput).length
        }, '{"ok":true,"code":"OBJECT_INPUT"}');
    }

    var text = safeTrim(rawInput);
    if (!text) {
        return safeStringify({
            ok: false,
            code: "BLANK_RESPONSE",
            message: "Phản hồi nguồn rỗng"
        }, '{"ok":false,"code":"BLANK_RESPONSE"}');
    }

    if (looksLikeHtml(text)) {
        return safeStringify({
            ok: false,
            code: "HTML_RESPONSE",
            message: "Nguồn trả về HTML thay vì JSON"
        }, '{"ok":false,"code":"HTML_RESPONSE"}');
    }

    var parsed = safeParseJson(text, null);
    if (!parsed) {
        return safeStringify({
            ok: false,
            code: "INVALID_JSON",
            message: "Không đọc được cấu trúc JSON"
        }, '{"ok":false,"code":"INVALID_JSON"}');
    }

    return safeStringify({
        ok: true,
        code: "VALID_JSON",
        count: extractArrayItems(parsed).length
    }, '{"ok":true,"code":"VALID_JSON"}');
}

var totalPages = toInt(pagination.totalPages || pagination.lastPage, 0);

    var movies = [];
    var i;
    for (i = 0; i < rawItems.length; i++) {
        var item = rawItems[i];
        if (!isPlainObject(item)) {
            continue;
        }
        var movieId = safeTrim(item.slug || item.id || item._id || "");
        var title = safeTrim(item.name || item.title || item.origin_name || "");
        if (!movieId && !title) {
            continue;
        }

        var posterRaw = item.poster_url || item.posterUrl || item.poster || item.thumb_url || item.thumb || "";
        var backdropRaw = item.thumb_url || item.backdrop_url || item.backdropUrl || item.poster_url || "";

        movies.push({
            id: movieId || title,
            title: title || movieId,
            posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
            backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || item.episodeCurrent || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return safeStringify({
        items: movies,
        pagination: buildDefaultPagination(currentPage, itemsPerPage, totalItems, totalPages)
    }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}


Trò chuyện với Gemini
code JavaScript es5 https://clbphimxua.top/

Mình không thể truy cập trực tiếp vào [https://clbphimxua.top/](https://clbphimxua.top/) để đọc mã nguồn trang hiện tại (do trang chặn truy cập/không có sẵn qua công cụ duyệt). Tuy nhiên, dựa trên loại website phim/giải trí (clbphimxua), dưới đây là bộ JavaScript chuẩn ES5 (var, function () {}, tương thích tốt với các trình duyệt cũ, Smart TV/WebView cũ) cho các tính năng phổ biến trên trang xem phim:

Chuyển tập / Lưu tiến độ xem (dùng localStorage kèm fallback an toàn).

Tìm kiếm / Lọc danh sách phim theo từ khóa.

Nút cuộn lên đầu trang & thông báo trạng thái giao diện thuần ES5.

Mã JavaScript ES5 mẫu cho trang xem phim
JavaScript
(function () {
    "use strict";

    // 1. Helper lưu/đọc localStorage an toàn cho ES5
    function saveProgress(movieId, episodeIndex) {
        try {
            if (window.localStorage) {
                var raw = window.localStorage.getItem("clbpx_progress");
                var data = raw ? JSON.parse(raw) : {};
                data[String(movieId)] = {
                    episode: episodeIndex,
                    updatedAt: new Date().getTime()
                };
                window.localStorage.setItem("clbpx_progress", JSON.stringify(data));
            }
        } catch (e) {
            // Bỏ qua nếu trình duyệt chặn storage hoặc chế độ ẩn danh
        }
    }

    function getProgress(movieId) {
        try {
            if (window.localStorage) {
                var raw = window.localStorage.getItem("clbpx_progress");
                var data = raw ? JSON.parse(raw) : {};
                return data[String(movieId)] || null;
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    // 2. Xử lý danh sách tập phim (data-episode, data-src)
    function initEpisodeSwitcher(options) {
        options = options || {};
        var movieId = options.movieId || "default_movie";
        var listSelector = options.listSelector || ".episode-list";
        var playerSelector = options.playerSelector || "#video-player";

        var listEl = document.querySelector(listSelector);
        var playerEl = document.querySelector(playerSelector);
        if (!listEl || !playerEl) {
            return;
        }

        var items = listEl.querySelectorAll("[data-episode]");
        var i;

        function setActiveItem(index) {
            var idx = parseInt(index, 10);
            if (isNaN(idx) || idx < 0 || idx >= items.length) {
                return;
            }
            for (var j = 0; j < items.length; j++) {
                items[j].className = items[j].className.replace(/\bactive\b/g, "").replace(/\s+/g, " ").trim();
            }
            var target = items[idx];
            if (target.className.indexOf("active") === -1) {
                target.className = (target.className + " active").trim();
            }

            var videoUrl = target.getAttribute("data-src");
            if (videoUrl) {
                if (playerEl.tagName && playerEl.tagName.toLowerCase() === "iframe") {
                    playerEl.src = videoUrl;
                } else {
                    playerEl.setAttribute("src", videoUrl);
                    if (typeof playerEl.load === "function") {
                        playerEl.load();
                    }
                }
            }
            saveProgress(movieId, idx);
        }

        for (i = 0; i < items.length; i++) {
            (function (boundIndex) {
                var el = items[boundIndex];
                var handler = function (evt) {
                    if (evt && evt.preventDefault) {
                        evt.preventDefault();
                    }
                    setActiveItem(boundIndex);
                };
                if (el.addEventListener) {
                    el.addEventListener("click", handler, false);
                } else if (el.attachEvent) {
                    el.attachEvent("onclick", handler);
                }
            })(i);
        }

        // Khôi phục tập đã xem gần nhất nếu có
        var saved = getProgress(movieId);
        if (saved && typeof saved.episode === "number") {
            setActiveItem(saved.episode);
        }
    }

    // 3. Lọc danh sách phim theo từ khóa (không dấu / có dấu cơ bản)
    function normalizeText(str) {
        return String(str || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initMovieFilter(inputSelector, cardSelector) {
        var inputEl = document.querySelector(inputSelector || "#search-movie");
        var cards = document.querySelectorAll(cardSelector || ".movie-card");
        if (!inputEl || !cards.length) {
            return;
        }

        function onFilter() {
            var kw = normalizeText(inputEl.value);
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                var title = normalizeText(card.getAttribute("data-title") || card.textContent || card.innerText);
                var matched = !kw || title.indexOf(kw) !== -1;
                card.style.display = matched ? "" : "none";
            }
        }

        if (inputEl.addEventListener) {
            inputEl.addEventListener("input", onFilter, false);
            inputEl.addEventListener("keyup", onFilter, false);
        } else if (inputEl.attachEvent) {
            inputEl.attachEvent("onkeyup", onFilter);
        }
    }

    // 4. Nút cuộn nhanh lên đầu trang
    function initBackToTop(btnSelector, threshold) {
        var btn = document.querySelector(btnSelector || "#back-to-top");
        var limit = typeof threshold === "number" ? threshold : 300;
        if (!btn) {
            return;
        }

        function toggleBtn() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            btn.style.display = scrollTop > limit ? "block" : "none";
        }

        function goTop(evt) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            }
            window.scrollTo(0, 0);
        }

        if (window.addEventListener) {
            window.addEventListener("scroll", toggleBtn, false);
            btn.addEventListener("click", goTop, false);
        } else if (window.attachEvent) {
            window.attachEvent("onscroll", toggleBtn);
            btn.attachEvent("onclick", goTop);
        }

        toggleBtn();
    }

    // Khởi tạo khi DOM sẵn sàng
    function onReady(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            setTimeout(fn, 0);
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    fn();
                }
            });
        }
    }

    onReady(function () {
        initEpisodeSwitcher({
            movieId: "phim_xua_01",
            listSelector: ".episode-list",
            playerSelector: "#video-player"
        });
        initMovieFilter("#search-movie", ".movie-card");
        initBackToTop("#back-to-top", 300);
    });
})();
Điểm lưu ý khi viết code ES5 cho web phim
Không dùng cú pháp ES6+: Tránh const/let, arrow function () => {}, template literal `${x}`, fetch/Promise (nếu cần gọi API ES5 thì dùng XMLHttpRequest).

Kiểm tra null/selector: Luôn kiểm tra phần tử tồn tại trước khi gắn sự kiện để tránh lỗi runtime làm đứng các script phía sau.

Nếu bạn dán đoạn HTML hoặc mô tả chính xác chức năng bạn muốn làm cho [https://clbphimxua.top/](https://clbphimxua.top/) (ví dụ: trình phát video, danh sách tập, bộ lọc thể loại, hay gọi API), mình sẽ viết đúng theo cấu trúc và yêu cầu cụ thể của bạn.

hoàn thành code cho exoplayer

ExoPlayer hiện nằm trong AndroidX Media3 (thư viện com.google.android.exoplayer2 cũ đã ngừng phát triển). Dưới đây là bộ code hoàn chỉnh bằng Kotlin cho Android (ExoPlayer + PlayerView), hỗ trợ phát luồng video/HLS/MP4, danh sách tập phim, lưu vị trí xem và giải phóng tài nguyên đúng vòng đời Activity.

1. Thêm dependency (app/build.gradle.kts) & quyền mạng (AndroidManifest.xml)
Kotlin
// app/build.gradle.kts
dependencies {
    val media3Version = "1.11.1"
    implementation("androidx.media3:media3-exoplayer:$media3Version")
    implementation("androidx.media3:media3-exoplayer-hls:$media3Version")
    implementation("androidx.media3:media3-ui:$media3Version")
}
XML
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
2. Giao diện XML (activity_player.xml)
XML
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#000000"
    android:orientation="vertical">

    <androidx.media3.ui.PlayerView
        android:id="@+id/playerView"
        android:layout_width="match_parent"
        android:layout_height="240dp"
        app:resize_mode="fit"
        app:show_buffering="when_playing"
        app:use_controller="true" />

    <LinearLayout
        android:id="@+id/episodeContainer"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:padding="12dp" />

</LinearLayout>
3. Code hoàn chỉnh (PlayerActivity.kt)
Bao gồm: khởi tạo ExoPlayer, phát danh sách tập (setMediaItems), tự động lưu & khôi phục vị trí tua, xử lý lỗi phát lại, và giải phóng player ở onStop() / onDestroy().

Kotlin
package com.example.movieplayer

import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

data class EpisodeItem(
    val title: String,
    val url: String
)

class PlayerActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private lateinit var playerView: PlayerView
    private lateinit var episodeContainer: LinearLayout

    private var currentMediaIndex = 0
    private var playbackPositionMs = 0L
    private var playWhenReady = true

    // Danh sách tập mẫu (hỗ trợ MP4, HLS .m3u8, v.v.)
    private val episodes = listOf(
        EpisodeItem("Tập 1", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"),
        EpisodeItem("Tập 2", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"),
        EpisodeItem("Tập 3", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_player)

        playerView = findViewById(R.id.playerView)
        episodeContainer = findViewById(R.id.episodeContainer)

        if (savedInstanceState != null) {
            currentMediaIndex = savedInstanceState.getInt(KEY_MEDIA_INDEX, 0)
            playbackPositionMs = savedInstanceState.getLong(KEY_POSITION_MS, 0L)
            playWhenReady = savedInstanceState.getBoolean(KEY_PLAY_WHEN_READY, true)
        }

        setupEpisodeButtons()
    }

    override fun onStart() {
        super.onStart()
        initializePlayer()
    }

    override fun onStop() {
        super.onStop()
        releasePlayer()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        player?.let { exo ->
            outState.putInt(KEY_MEDIA_INDEX, exo.currentMediaItemIndex)
            outState.putLong(KEY_POSITION_MS, exo.currentPosition)
            outState.putBoolean(KEY_PLAY_WHEN_READY, exo.playWhenReady)
        }
    }

    private fun initializePlayer() {
        if (player != null) return

        val exoPlayer = ExoPlayer.Builder(this).build().apply {
            val mediaItems = episodes.map { ep ->
                MediaItem.Builder()
                    .setUri(ep.url)
                    .setMediaId(ep.title)
                    .build()
            }
            setMediaItems(mediaItems, currentMediaIndex, playbackPositionMs)
            this.playWhenReady = this@PlayerActivity.playWhenReady

            addListener(object : Player.Listener {
                override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                    currentMediaIndex = currentMediaItemIndex
                    highlightEpisodeButton(currentMediaIndex)
                }

                override fun onPlayerError(error: PlaybackException) {
                    Toast.makeText(
                        this@PlayerActivity,
                        "Lỗi phát video: ${error.errorCodeName}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            })

            prepare()
        }

        player = exoPlayer
        playerView.player = exoPlayer
        highlightEpisodeButton(currentMediaIndex)
    }

    private fun releasePlayer() {
        player?.let { exo ->
            currentMediaIndex = exo.currentMediaItemIndex
            playbackPositionMs = exo.currentPosition.coerceAtLeast(0L)
            playWhenReady = exo.playWhenReady
            exo.release()
        }
        player = null
        playerView.player = null
    }

    private fun setupEpisodeButtons() {
        episodeContainer.removeAllViews()
        episodes.forEachIndexed { index, episode ->
            val btn = Button(this).apply {
                text = episode.title
                setOnClickListener {
                    player?.let { exo ->
                        exo.seekTo(index, 0L)
                        exo.playWhenReady = true
                    }
                }
            }
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                marginEnd = 16
            }
            episodeContainer.addView(btn, params)
        }
    }

    private fun highlightEpisodeButton(activeIndex: Int) {
        for (i in 0 until episodeContainer.childCount) {
            val child = episodeContainer.getChildAt(i)
            child.alpha = if (i == activeIndex) 1.0f else 0.5f
        }
    }

    companion object {
        private const val KEY_MEDIA_INDEX = "key_media_index"
        private const val KEY_POSITION_MS = "key_position_ms"
        private const val KEY_PLAY_WHEN_READY = "key_play_when_ready"
    }
}
Nếu bạn đang dùng Java, Jetpack Compose, hoặc cần thêm tính năng cụ thể nào cho ExoPlayer (như phụ đề SRT/VTT, chọn chất lượng video/HLS, chế độ toàn màn hình/xoay ngang, hoặc phát nền với MediaSessionService), hãy cho mình biết để mình bổ sung thẳng vào code.

hoàn chỉnh code JavaScript es5

Dưới đây là bộ JavaScript chuẩn ES5 hoàn chỉnh, tách module rõ ràng, tương thích với các trình duyệt cũ/WebView cũ, nối liền mạch với giao diện trang xem phim (trình phát <video>/<iframe>, danh sách tập, tìm kiếm/lọc, gọi API bằng XMLHttpRequest, lưu lịch sử/tiến độ xem và giao tiếp với Android/ExoPlayer qua JavascriptInterface nếu nhúng trong WebView).

Kiến trúc & tính năng chính
Tương thích ES5 chặt chẽ: Chỉ dùng var, function, Array.prototype chuẩn ES5, XMLHttpRequest, JSON, localStorage (có try/catch dự phòng).

Trình phát & Danh sách tập: Hỗ trợ cả thẻ <video> (MP4/HLS nếu trình duyệt hỗ trợ) lẫn <iframe>, tự lưu tập đang xem và vị trí giây (currentTime).

Gọi API & Tìm kiếm: Tải danh sách phim/tập qua XMLHttpRequest (hỗ trợ timeout, callback lỗi), lọc danh sách theo từ khóa và thể loại.

Cầu nối Android WebView (tùy chọn): Gửi link/tập sang ứng dụng Android (ví dụ mở bằng ExoPlayer native) nếu chạy bên trong WebView.

Mã JavaScript ES5 hoàn chỉnh (app-es5.js)
JavaScript
(function (global) {
    "use strict";

    var AppES5 = {};

    // =========================================================
    // 1. TIỆN ÍCH CƠ BẢN & STORAGE AN TOÀN
    // =========================================================
    function isFunction(fn) {
        return typeof fn === "function";
    }

    function trimStr(str) {
        return String(str || "").replace(/^\s+|\s+$/g, "");
    }

    function normalizeStr(str) {
        return trimStr(str).toLowerCase().replace(/\s+/g, " ");
    }

    function addClass(el, className) {
        if (!el || !className) {
            return;
        }
        var current = " " + (el.className || "").replace(/\s+/g, " ") + " ";
        if (current.indexOf(" " + className + " ") === -1) {
            el.className = trimStr((el.className || "") + " " + className);
        }
    }

    function removeClass(el, className) {
        if (!el || !className) {
            return;
        }
        var pattern = new RegExp("(^|\\s+)" + className + "(\\s+|$)", "g");
        el.className = trimStr((el.className || "").replace(pattern, " "));
    }

    function bindEvent(el, eventName, handler) {
        if (!el || !eventName || !isFunction(handler)) {
            return;
        }
        if (el.addEventListener) {
            el.addEventListener(eventName, handler, false);
        } else if (el.attachEvent) {
            el.attachEvent("on" + eventName, handler);
        }
    }

    var Storage = {
        get: function (key, fallback) {
            try {
                if (global.localStorage) {
                    var raw = global.localStorage.getItem(key);
                    return raw !== null ? JSON.parse(raw) : fallback;
                }
            } catch (e) {
                // Trình duyệt chặn storage hoặc lỗi JSON
            }
            return fallback;
        },
        set: function (key, value) {
            try {
                if (global.localStorage) {
                    global.localStorage.setItem(key, JSON.stringify(value));
                    return true;
                }
            } catch (e) {
                // Bỏ qua nếu vượt hạn mức hoặc chế độ ẩn danh
            }
            return false;
        }
    };

    // =========================================================
    // 2. GỌI API BẰNG XMLHttpRequest (ES5)
    // =========================================================
    AppES5.requestJson = function (options) {
        options = options || {};
        var url = options.url;
        var method = (options.method || "GET").toUpperCase();
        var headers = options.headers || {};
        var body = options.body || null;
        var timeoutMs = typeof options.timeout === "number" ? options.timeout : 15000;
        var onSuccess = options.onSuccess;
        var onError = options.onError;

        if (!url) {
            if (isFunction(onError)) {
                onError(new Error("Thiếu URL yêu cầu"));
            }
            return;
        }

        var xhr;
        if (global.XMLHttpRequest) {
            xhr = new global.XMLHttpRequest();
        } else if (global.ActiveXObject) {
            xhr = new global.ActiveXObject("Microsoft.XMLHTTP");
        } else {
            if (isFunction(onError)) {
                onError(new Error("Trình duyệt không hỗ trợ XMLHttpRequest"));
            }
            return;
        }

        xhr.open(method, url, true);
        xhr.timeout = timeoutMs;

        var headerKey;
        for (headerKey in headers) {
            if (headers.hasOwnProperty(headerKey)) {
                xhr.setRequestHeader(headerKey, headers[headerKey]);
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                var parsed = null;
                try {
                    parsed = JSON.parse(xhr.responseText);
                } catch (parseErr) {
                    if (isFunction(onError)) {
                        onError(parseErr);
                    }
                    return;
                }
                if (isFunction(onSuccess)) {
                    onSuccess(parsed, xhr.status);
                }
            } else {
                if (isFunction(onError)) {
                    onError(new Error("HTTP lỗi: " + xhr.status), xhr.status);
                }
            }
        };

        xhr.ontimeout = function () {
            if (isFunction(onError)) {
                onError(new Error("Hết thời gian chờ kết nối"), 408);
            }
        };

        xhr.onerror = function () {
            if (isFunction(onError)) {
                onError(new Error("Lỗi mạng khi gọi API"), 0);
            }
        };

        if (body && typeof body !== "string") {
            body = JSON.stringify(body);
            if (!headers["Content-Type"]) {
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            }
        }

        xhr.send(body);
    };

    // =========================================================
    // 3. TRÌNH PHÁT & QUẢN LÝ TIẾN ĐỘ XEM PHIM
    // =========================================================
    var WATCH_STORAGE_KEY = "clbphimxua_watch_history_v1";

    function saveWatchState(movieId, episodeIndex, currentTimeSec) {
        if (!movieId) {
            return;
        }
        var history = Storage.get(WATCH_STORAGE_KEY, {});
        history[String(movieId)] = {
            episode: typeof episodeIndex === "number" ? episodeIndex : 0,
            time: typeof currentTimeSec === "number" && currentTimeSec > 0 ? Math.floor(currentTimeSec) : 0,
            updatedAt: new Date().getTime()
        };
        Storage.set(WATCH_STORAGE_KEY, history);
    }

    function getWatchState(movieId) {
        if (!movieId) {
            return null;
        }
        var history = Storage.get(WATCH_STORAGE_KEY, {});
        return history[String(movieId)] || null;
    }

    AppES5.initPlayerController = function (config) {
        config = config || {};
        var movieId = config.movieId || "default_movie";
        var playerEl = document.querySelector(config.playerSelector || "#video-player");
        var episodeListEl = document.querySelector(config.episodeListSelector || ".episode-list");
        var titleEl = document.querySelector(config.titleSelector || "#now-playing-title");
        var useNativeBridge = Boolean(config.useNativeBridge);
        var bridgeName = config.bridgeName || "AndroidBridge";

        if (!playerEl || !episodeListEl) {
            return null;
        }

        var items = episodeListEl.querySelectorAll("[data-episode]");
        var currentIndex = 0;
        var isHtml5Video = Boolean(playerEl.tagName && playerEl.tagName.toLowerCase() === "video");

        function sendToNativeExoPlayer(epIndex, epTitle, streamUrl) {
            if (!useNativeBridge) {
                return false;
            }
            var bridge = global[bridgeName];
            if (bridge && isFunction(bridge.playInExoPlayer)) {
                bridge.playInExoPlayer(String(movieId), Number(epIndex), String(epTitle || ""), String(streamUrl || ""));
                return true;
            }
            return false;
        }

        function loadEpisode(index, seekSec, autoPlay) {
            var idx = parseInt(index, 10);
            if (isNaN(idx) || idx < 0 || idx >= items.length) {
                return;
            }

            currentIndex = idx;
            var i;
            for (i = 0; i < items.length; i++) {
                removeClass(items[i], "active");
            }

            var activeItem = items[idx];
            addClass(activeItem, "active");

            var streamUrl = activeItem.getAttribute("data-src") || "";
            var epTitle = activeItem.getAttribute("data-title") || trimStr(activeItem.textContent || activeItem.innerText);

            if (titleEl) {
                titleEl.textContent = epTitle;
            }

            saveWatchState(movieId, idx, seekSec || 0);

            // Nếu chạy trong Android WebView có cầu nối ExoPlayer thì chuyển sang native nếu được bật
            if (sendToNativeExoPlayer(idx, epTitle, streamUrl)) {
                return;
            }

            if (!streamUrl) {
                return;
            }

            if (isHtml5Video) {
                playerEl.setAttribute("src", streamUrl);
                if (isFunction(playerEl.load)) {
                    playerEl.load();
                }
                if (seekSec && seekSec > 0) {
                    var onLoadedMeta = function () {
                        try {
                            playerEl.currentTime = seekSec;
                        } catch (e) {}
                        if (autoPlay && isFunction(playerEl.play)) {
                            playerEl.play();
                        }
                        if (playerEl.removeEventListener) {
                            playerEl.removeEventListener("loadedmetadata", onLoadedMeta, false);
                        }
                    };
                    bindEvent(playerEl, "loadedmetadata", onLoadedMeta);
                } else if (autoPlay && isFunction(playerEl.play)) {
                    playerEl.play();
                }
            } else {
                // Dành cho <iframe> trình phát nhúng
                playerEl.setAttribute("src", streamUrl);
            }
        }

        // Gắn click cho từng tập
        var i;
        for (i = 0; i < items.length; i++) {
            (function (boundIndex) {
                bindEvent(items[boundIndex], "click", function (evt) {
                    if (evt && evt.preventDefault) {
                        evt.preventDefault();
                    }
                    loadEpisode(boundIndex, 0, true);
                });
            })(i);
        }

        // Lưu định kỳ vị trí xem với thẻ <video>
        if (isHtml5Video) {
            var lastSavedSec = 0;
            bindEvent(playerEl, "timeupdate", function () {
                var sec = Math.floor(playerEl.currentTime || 0);
                if (sec > 0 && Math.abs(sec - lastSavedSec) >= 5) {
                    lastSavedSec = sec;
                    saveWatchState(movieId, currentIndex, sec);
                }
            });

            bindEvent(playerEl, "ended", function () {
                if (currentIndex + 1 < items.length) {
                    loadEpisode(currentIndex + 1, 0, true);
                }
            });
        }

        // Khôi phục lần xem gần nhất
        var saved = getWatchState(movieId);
        if (saved && typeof saved.episode === "number") {
            loadEpisode(saved.episode, saved.time || 0, false);
        } else if (items.length > 0) {
            loadEpisode(0, 0, false);
        }

        return {
            selectEpisode: function (index, seekSec, autoPlay) {
                loadEpisode(index, seekSec || 0, Boolean(autoPlay));
            },
            getCurrentIndex: function () {
                return currentIndex;
            }
        };
    };

    // =========================================================
    // 4. TÌM KIẾM & LỌC DANH SÁCH PHIM
    // =========================================================
    AppES5.initCatalogFilter = function (config) {
        config = config || {};
        var searchInput = document.querySelector(config.searchSelector || "#movie-search");
        var genreSelect = document.querySelector(config.genreSelector || "#movie-genre");
        var cards = document.querySelectorAll(config.cardSelector || ".movie-card");
        var emptyEl = document.querySelector(config.emptySelector || "#empty-result");

        if (!cards.length) {
            return;
        }

        function applyFilter() {
            var keyword = searchInput ? normalizeStr(searchInput.value) : "";
            var genre = genreSelect ? normalizeStr(genreSelect.value) : "";
            var visibleCount = 0;
            var i;

            for (i = 0; i < cards.length; i++) {
                var card = cards[i];
                var title = normalizeStr(card.getAttribute("data-title") || card.textContent || card.innerText);
                var cardGenre = normalizeStr(card.getAttribute("data-genre") || "");

                var matchKeyword = !keyword || title.indexOf(keyword) !== -1;
                var matchGenre = !genre || genre === "all" || cardGenre.indexOf(genre) !== -1;
                var show = matchKeyword && matchGenre;

                card.style.display = show ? "" : "none";
                if (show) {
                    visibleCount += 1;
                }
            }

            if (emptyEl) {
                emptyEl.style.display = visibleCount === 0 ? "block" : "none";
            }
        }

        if (searchInput) {
            bindEvent(searchInput, "input", applyFilter);
            bindEvent(searchInput, "keyup", applyFilter);
        }
        if (genreSelect) {
            bindEvent(genreSelect, "change", applyFilter);
        }

        applyFilter();
    };

    // =========================================================
    // 5. NÚT CUỘN LÊN ĐẦU TRANG & KHỞI TẠO
    // =========================================================
    AppES5.initBackToTop = function (selector, threshold) {
        var btn = document.querySelector(selector || "#back-to-top");
        var limit = typeof threshold === "number" ? threshold : 320;
        if (!btn) {
            return;
        }

        function updateVisibility() {
            var y = global.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            btn.style.display = y > limit ? "block" : "none";
        }

        bindEvent(global, "scroll", updateVisibility);
        bindEvent(btn, "click", function (evt) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            }
            global.scrollTo(0, 0);
        });

        updateVisibility();
    };

    function onDomReady(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            setTimeout(fn, 0);
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    fn();
                }
            });
        }
    }

    onDomReady(function () {
        AppES5.initPlayerController({
            movieId: "movie_default",
            playerSelector: "#video-player",
            episodeListSelector: ".episode-list",
            titleSelector: "#now-playing-title",
            useNativeBridge: false
        });
        AppES5.initCatalogFilter({
            searchSelector: "#movie-search",
            genreSelector: "#movie-genre",
            cardSelector: ".movie-card",
            emptySelector: "#empty-result"
        });
        AppES5.initBackToTop("#back-to-top", 320);
    });

    global.AppES5 = AppES5;
})(window);
Ví dụ HTML tối thiểu để chạy thử ngay
HTML
<h2 id="now-playing-title"></h2>
<video id="video-player" controls preload="metadata" width="640" height="360"></video>

<ul class="episode-list">
  <li><a href="#" data-episode="0" data-title="Tập 1" data-src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4">Tập 1</a></li>
  <li><a href="#" data-episode="1" data-title="Tập 2" data-src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4">Tập 2</a></li>
</ul>

<input id="movie-search" type="text" placeholder="Tìm tên phim..." />
<select id="movie-genre">
  <option value="all">Tất cả thể loại</option>
  <option value="hanh-dong">Hành động</option>
  <option value="tam-ly">Tâm lý</option>
</select>

<div class="movie-card" data-title="Phim Xưa Số 1" data-genre="tam-ly">Phim Xưa Số 1</div>
<div class="movie-card" data-title="Biệt Đội Cũ" data-genre="hanh-dong">Biệt Đội Cũ</div>
<p id="empty-result" style="display:none;">Không tìm thấy phim phù hợp.</p>

<button id="back-to-top" type="button" style="display:none;">Lên đầu trang</button>
<script src="app-es5.js"></script>
Nếu bạn cần nối trực tiếp đoạn JS này với class ExoPlayer (qua WebView.addJavascriptInterface) hoặc cần đổi bộ chọn/API riêng cho trang của bạn, hãy gửi thêm chi tiết để mình chỉnh đúng khớp.

cấu trúc hàm JavaScript es5

Trong JavaScript ES5, hàm (function) được khai báo chủ yếu bằng từ khóa function (chưa có arrow function () => {}, default parameter, hay rest parameter ...args của ES6+).

1. Cú pháp cơ bản của hàm ES5
JavaScript
// 1. Function Declaration (Khai báo hàm - có hoisting)
function tinhTong(a, b) {
    return a + b;
}

// 2. Function Expression (Biểu thức hàm - KHÔNG có hoisting phần gán)
var tinhHieu = function (a, b) {
    return a - b;
};

// 3. Named Function Expression (Có tên nội bộ, hữu ích cho đệ quy & debug)
var giaiThua = function tinhGiaiThua(n) {
    if (n <= 1) {
        return 1;
    }
    return n * tinhGiaiThua(n - 1);
};

// 4. IIFE - Immediately Invoked Function Expression (Tự chạy ngay, tạo phạm vi riêng)
(function () {
    var bienRieng = "Chỉ sống trong hàm này";
})();
2. Các đặc điểm quan trọng của hàm trong ES5
Đặc điểm	Cách hoạt động trong ES5	Ví dụ / Lưu ý
Tham số & arguments	Không báo lỗi nếu truyền thiếu hoặc thừa đối số; thiếu sẽ nhận undefined. Có đối tượng giả mảng arguments.	arguments.length, arguments[0]
Giá trị trả về (return)	Trả về giá trị sau return; nếu thiếu return hoặc để trống return;, hàm trả về undefined.	Luôn dùng return khi cần kết quả
Phạm vi biến (var)	Function scope (phạm vi hàm), không có block scope (if/for).	Biến var trong if vẫn tồn tại trong toàn hàm
Hoisting	function ...() {} được đưa lên đầu phạm vi; var fn = function() {} chỉ đưa var fn lên trước.	Gọi declaration trước dòng khai báo vẫn chạy
this & call/apply/bind	Giá trị this phụ thuộc vào cách gọi hàm; có sẵn .call(), .apply(), .bind() từ ES5.	fn.call(ctx, 1, 2) hoặc fn.apply(ctx, [1, 2])
3. Ví dụ xử lý tham số, arguments và this trong ES5
JavaScript
function dinhDangThongBao(tienTo) {
    // Tham số mặc định kiểu ES5
    var prefix = (typeof tienTo !== "undefined") ? tienTo : "[INFO]";

    // Gom các đối số còn lại từ vị trí thứ 1 bằng Array.prototype.slice
    var phanConLai = Array.prototype.slice.call(arguments, 1);

    return prefix + " " + phanConLai.join(" - ");
}

var ketQua1 = dinhDangThongBao("PHIM", "Tập 01", "HD"); // "PHIM Tập 01 - HD"
var ketQua2 = dinhDangThongBao();                     // "[INFO] "

// Gắn ngữ cảnh `this` cố định bằng .bind()
var nguoiDung = {
    ten: "Minh",
    chao: function (loiChao) {
        return loiChao + ", " + this.ten;
    }
};

var chaoMinh = nguoiDung.chao.bind(nguoiDung, "Xin chào");
var cauChao = chaoMinh(); // "Xin chào, Minh"
4. Lưu ý phổ biến khi viết hàm ES5
Bẫy biến lặp trong vòng lặp for + callback/closure: Vì var không có block scope, mọi callback tạo trong vòng lặp sẽ chia sẻ cùng một biến i nếu không bọc qua một hàm trung gian (IIFE).

JavaScript
// Đúng chuẩn ES5 khi gắn sự kiện trong vòng lặp:
for (var i = 0; i < 3; i++) {
    (function (chiSo) {
        setTimeout(function () {
            // chiSo giữ nguyên giá trị 0, 1, 2
        }, 100);
    })(i);
}
Bạn muốn áp dụng cấu trúc hàm ES5 này vào bài toán cụ thể nào (ví dụ: viết module, callback/XHR, xử lý mảng, hay this/closure)?

code https://clbphimxua.top/ JavaScript es5 thuần

Vì không truy cập trực tiếp được mã nguồn hiện tại của [https://clbphimxua.top/](https://clbphimxua.top/), dưới đây là mã JavaScript ES5 thuần (không dùng ES6+, không phụ thuộc thư viện ngoài, tương thích rộng rãi với các trình duyệt/WebView đời cũ) xây dựng trọn vẹn cho một trang web xem phim: quản lý danh sách tập, điều khiển trình phát (<video> / <iframe>), lưu lịch sử & vị trí xem bằng localStorage, tìm kiếm/lọc phim, gọi API bằng XMLHttpRequest và nút cuộn lên đầu trang.

Mã JavaScript ES5 thuần (clbphimxua-es5.js)
JavaScript
(function (global) {
    "use strict";

    var ClbPhimXuaES5 = {};

    // =========================================================
    // 1. HÀM TIỆN ÍCH THUẦN ES5
    // =========================================================
    function isFn(fn) {
        return typeof fn === "function";
    }

    function trimText(str) {
        return String(str || "").replace(/^\s+|\s+$/g, "");
    }

    function normalizeText(str) {
        return trimText(str).toLowerCase().replace(/\s+/g, " ");
    }

    // Loại bỏ dấu tiếng Việt cơ bản để tìm kiếm linh hoạt hơn
    function removeVietnameseDiacritics(str) {
        var s = normalizeText(str);
        s = s.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
        s = s.replace(/[èéẹẻẽêềếệểễ]/g, "e");
        s = s.replace(/[ìíịỉĩ]/g, "i");
        s = s.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
        s = s.replace(/[ùúụủũưừứựửữ]/g, "u");
        s = s.replace(/[ỳýỵỷỹ]/g, "y");
        s = s.replace(/đ/g, "d");
        return s;
    }

    function hasClass(el, cls) {
        if (!el || !cls) {
            return false;
        }
        var hay = " " + (el.className || "").replace(/\s+/g, " ") + " ";
        return hay.indexOf(" " + cls + " ") !== -1;
    }

    function addClass(el, cls) {
        if (!el || !cls || hasClass(el, cls)) {
            return;
        }
        el.className = trimText((el.className || "") + " " + cls);
    }

    function removeClass(el, cls) {
        if (!el || !cls) {
            return;
        }
        var regex = new RegExp("(^|\\s+)" + cls + "(\\s+|$)", "g");
        el.className = trimText((el.className || "").replace(regex, " "));
    }

    function onEvent(el, type, handler) {
        if (!el || !type || !isFn(handler)) {
            return;
        }
        if (el.addEventListener) {
            el.addEventListener(type, handler, false);
        } else if (el.attachEvent) {
            el.attachEvent("on" + type, handler);
        }
    }

    function offEvent(el, type, handler) {
        if (!el || !type || !isFn(handler)) {
            return;
        }
        if (el.removeEventListener) {
            el.removeEventListener(type, handler, false);
        } else if (el.detachEvent) {
            el.detachEvent("on" + type, handler);
        }
    }

    // =========================================================
    // 2. LƯU TRỮ LỊCH SỬ XEM PHIM (localStorage AN TOÀN)
    // =========================================================
    var STORAGE_KEY = "clbphimxua_history_es5";

    function readHistory() {
        try {
            if (global.localStorage) {
                var raw = global.localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : {};
            }
        } catch (e) {}
        return {};
    }

    function writeHistory(obj) {
        try {
            if (global.localStorage) {
                global.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
                return true;
            }
        } catch (e) {}
        return false;
    }

    ClbPhimXuaES5.saveWatchHistory = function (movieId, episodeIndex, seconds) {
        if (!movieId) {
            return;
        }
        var store = readHistory();
        store[String(movieId)] = {
            episode: typeof episodeIndex === "number" ? episodeIndex : 0,
            seconds: typeof seconds === "number" && seconds > 0 ? Math.floor(seconds) : 0,
            updatedAt: new Date().getTime()
        };
        writeHistory(store);
    };

    ClbPhimXuaES5.getWatchHistory = function (movieId) {
        if (!movieId) {
            return null;
        }
        var store = readHistory();
        return store[String(movieId)] || null;
    };

    // =========================================================
    // 3. GỌI API JSON THUẦN XMLHttpRequest (ES5)
    // =========================================================
    ClbPhimXuaES5.fetchJson = function (opts) {
        opts = opts || {};
        var url = opts.url;
        var method = (opts.method || "GET").toUpperCase();
        var headers = opts.headers || {};
        var payload = opts.data || null;
        var timeout = typeof opts.timeout === "number" ? opts.timeout : 12000;
        var done = opts.onSuccess;
        var fail = opts.onError;

        if (!url) {
            if (isFn(fail)) {
                fail(new Error("Thiếu URL"), 0);
            }
            return;
        }

        var xhr = global.XMLHttpRequest
            ? new global.XMLHttpRequest()
            : (global.ActiveXObject ? new global.ActiveXObject("Microsoft.XMLHTTP") : null);

        if (!xhr) {
            if (isFn(fail)) {
                fail(new Error("Trình duyệt không hỗ trợ XHR"), 0);
            }
            return;
        }

        xhr.open(method, url, true);
        xhr.timeout = timeout;

        var k;
        for (k in headers) {
            if (headers.hasOwnProperty(k)) {
                xhr.setRequestHeader(k, headers[k]);
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                var jsonData;
                try {
                    jsonData = JSON.parse(xhr.responseText);
                } catch (err) {
                    if (isFn(fail)) {
                        fail(err, xhr.status);
                    }
                    return;
                }
                if (isFn(done)) {
                    done(jsonData, xhr.status);
                }
            } else if (isFn(fail)) {
                fail(new Error("Lỗi HTTP " + xhr.status), xhr.status);
            }
        };

        xhr.ontimeout = function () {
            if (isFn(fail)) {
                fail(new Error("Quá thời gian chờ phản hồi"), 408);
            }
        };

        xhr.onerror = function () {
            if (isFn(fail)) {
                fail(new Error("Lỗi kết nối mạng"), 0);
            }
        };

        if (payload && typeof payload !== "string") {
            payload = JSON.stringify(payload);
            if (!headers["Content-Type"]) {
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            }
        }

        xhr.send(payload);
    };

    // =========================================================
    // 4. TRÌNH PHÁT PHIM & DANH SÁCH TẬP
    // =========================================================
    ClbPhimXuaES5.initPlayer = function (cfg) {
        cfg = cfg || {};
        var movieId = cfg.movieId || "phim_xua";
        var playerEl = document.querySelector(cfg.playerSelector || "#player");
        var listEl = document.querySelector(cfg.episodeListSelector || ".episode-list");
        var titleEl = document.querySelector(cfg.titleSelector || "#episode-title");

        if (!playerEl || !listEl) {
            return null;
        }

        var episodes = listEl.querySelectorAll("[data-episode]");
        var activeIdx = 0;
        var isVideoTag = Boolean(playerEl.tagName && playerEl.tagName.toLowerCase() === "video");

        function playEpisode(index, seekSec, autoPlay) {
            var idx = parseInt(index, 10);
            if (isNaN(idx) || idx < 0 || idx >= episodes.length) {
                return;
            }

            activeIdx = idx;
            var i;
            for (i = 0; i < episodes.length; i++) {
                removeClass(episodes[i], "active");
            }

            var currentItem = episodes[idx];
            addClass(currentItem, "active");

            var src = currentItem.getAttribute("data-src") || "";
            var epTitle = currentItem.getAttribute("data-title") || trimText(currentItem.textContent || currentItem.innerText);

            if (titleEl) {
                titleEl.textContent = epTitle;
            }

            ClbPhimXuaES5.saveWatchHistory(movieId, idx, seekSec || 0);

            if (!src) {
                return;
            }

            if (isVideoTag) {
                playerEl.setAttribute("src", src);
                if (isFn(playerEl.load)) {
                    playerEl.load();
                }

                if (seekSec && seekSec > 0) {
                    var handleLoaded = function () {
                        try {
                            playerEl.currentTime = seekSec;
                        } catch (e) {}
                        if (autoPlay && isFn(playerEl.play)) {
                            playerEl.play();
                        }
                        offEvent(playerEl, "loadedmetadata", handleLoaded);
                    };
                    onEvent(playerEl, "loadedmetadata", handleLoaded);
                } else if (autoPlay && isFn(playerEl.play)) {
                    playerEl.play();
                }
            } else {
                playerEl.setAttribute("src", src);
            }
        }

        var i;
        for (i = 0; i < episodes.length; i++) {
            (function (boundIndex) {
                onEvent(episodes[boundIndex], "click", function (ev) {
                    if (ev && ev.preventDefault) {
                        ev.preventDefault();
                    }
                    playEpisode(boundIndex, 0, true);
                });
            })(i);
        }

        if (isVideoTag) {
            var lastSaved = 0;
            onEvent(playerEl, "timeupdate", function () {
                var nowSec = Math.floor(playerEl.currentTime || 0);
                if (nowSec > 0 && Math.abs(nowSec - lastSaved) >= 5) {
                    lastSaved = nowSec;
                    ClbPhimXuaES5.saveWatchHistory(movieId, activeIdx, nowSec);
                }
            });

            onEvent(playerEl, "ended", function () {
                if (activeIdx + 1 < episodes.length) {
                    playEpisode(activeIdx + 1, 0, true);
                }
            });
        }

        var saved = ClbPhimXuaES5.getWatchHistory(movieId);
        if (saved && typeof saved.episode === "number") {
            playEpisode(saved.episode, saved.seconds || 0, false);
        } else if (episodes.length > 0) {
            playEpisode(0, 0, false);
        }

        return {
            select: function (index, seekSec, autoPlay) {
                playEpisode(index, seekSec || 0, Boolean(autoPlay));
            },
            getIndex: function () {
                return activeIdx;
            }
        };
    };

    // =========================================================
    // 5. TÌM KIẾM & LỌC PHIM
    // =========================================================
    ClbPhimXuaES5.initFilter = function (cfg) {
        cfg = cfg || {};
        var input = document.querySelector(cfg.searchSelector || "#search-input");
        var genre = document.querySelector(cfg.genreSelector || "#genre-select");
        var cards = document.querySelectorAll(cfg.cardSelector || ".movie-card");
        var emptyBox = document.querySelector(cfg.emptySelector || "#no-result");

        if (!cards.length) {
            return;
        }

        function runFilter() {
            var kw = input ? removeVietnameseDiacritics(input.value) : "";
            var g = genre ? removeVietnameseDiacritics(genre.value) : "";
            var shown = 0;
            var i;

            for (i = 0; i < cards.length; i++) {
                var card = cards[i];
                var title = removeVietnameseDiacritics(card.getAttribute("data-title") || card.textContent || card.innerText);
                var cardGenre = removeVietnameseDiacritics(card.getAttribute("data-genre") || "");

                var okKw = !kw || title.indexOf(kw) !== -1;
                var okGenre = !g || g === "all" || cardGenre.indexOf(g) !== -1;
                var visible = okKw && okGenre;

                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            }

            if (emptyBox) {
                emptyBox.style.display = shown === 0 ? "block" : "none";
            }
        }

        if (input) {
            onEvent(input, "input", runFilter);
            onEvent(input, "keyup", runFilter);
        }
        if (genre) {
            onEvent(genre, "change", runFilter);
        }

        runFilter();
    };

    // =========================================================
    // 6. CUỘN LÊN ĐẦU TRANG & KHỞI TẠO
    // =========================================================
    ClbPhimXuaES5.initScrollTop = function (selector, offset) {
        var btn = document.querySelector(selector || "#scroll-top");
        var limit = typeof offset === "number" ? offset : 300;
        if (!btn) {
            return;
        }

        function toggleVisibility() {
            var top = global.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            btn.style.display = top > limit ? "block" : "none";
        }

        onEvent(global, "scroll", toggleVisibility);
        onEvent(btn, "click", function (ev) {
            if (ev && ev.preventDefault) {
                ev.preventDefault();
            }
            global.scrollTo(0, 0);
        });

        toggleVisibility();
    };

    function ready(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            setTimeout(fn, 0);
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    fn();
                }
            });
        }
    }

    ready(function () {
        ClbPhimXuaES5.initPlayer({
            movieId: "clbphimxua_main",
            playerSelector: "#player",
            episodeListSelector: ".episode-list",
            titleSelector: "#episode-title"
        });
        ClbPhimXuaES5.initFilter({
            searchSelector: "#search-input",
            genreSelector: "#genre-select",
            cardSelector: ".movie-card",
            emptySelector: "#no-result"
        });
        ClbPhimXuaES5.initScrollTop("#scroll-top", 300);
    });

    global.ClbPhimXuaES5 = ClbPhimXuaES5;
})(window);
Nếu bạn có sẵn HTML của trang hoặc muốn dồn toàn bộ chức năng vào một đoạn script ngắn hơn, hoặc cần viết riêng một tính năng cụ thể (ví dụ: render danh sách phim từ JSON API, phân trang, hay điều hướng danh mục), hãy cho mình biết cụ thể.

es5 chuẩn

Để viết JavaScript ES5 chuẩn (ECMAScript 5th Edition — phát hành năm 2009) mà không vô tình lẫn cú pháp ES6+ (ES2015+) hoặc các API ra đời sau ES5, hãy bám vào các quy tắc rõ ràng dưới đây.

1. Danh sách cú pháp & API ĐƯỢC DÙNG trong ES5 chuẩn
Khai báo biến & hàm:

Chỉ dùng var cho biến; dùng function tenHam(...) {} hoặc var fn = function (...) {};.

Chế độ nghiêm ngặt: "use strict"; ở đầu file hoặc đầu hàm.

Đối tượng & thuộc tính:

Object.create(proto), Object.defineProperty(obj, prop, descriptor), Object.defineProperties(...).

Object.getOwnPropertyDescriptor(obj, prop), Object.getOwnPropertyNames(obj), Object.getPrototypeOf(obj).

Object.keys(obj) (trả về mảng các key enumerable riêng của chính obj), Object.seal(obj), Object.freeze(obj), Object.preventExtensions(obj), Object.isSealed(), Object.isFrozen(), Object.isExtensible().

Getter / setter trong object literal: { get x() { return this._x; }, set x(v) { this._x = v; } }.

Dấu phẩy cuối trong object/array literal ([1, 2, 3,], { a: 1, b: 2, }) hợp lệ trong ES5.

Mảng (Array):

Array.isArray(val) (thay cho typeof hoặc instanceof qua frame).

Duyệt & biến đổi: forEach, map, filter, some, every, reduce, reduceRight.

Tìm kiếm: indexOf, lastIndexOf.

Hàm (Function.prototype):

fn.bind(thisArg[, arg1[, arg2...]]) (bên cạnh .call() và .apply() vốn có từ ES3).

Chuỗi, Số & JSON:

String.prototype.trim() (xóa khoảng trắng đầu/cuối).

Date.now(), Date.prototype.toISOString(), Date.prototype.toJSON().

JSON.parse(text[, reviver]) và JSON.stringify(value[, replacer[, space]]).

DOM / Browser thường dùng cùng ES5 (thuộc chuẩn W3C/WHATWG, không phải lõi ECMAScript nhưng đi kèm thực tế):

document.querySelector, document.querySelectorAll, addEventListener, XMLHttpRequest, localStorage (có try/catch).

2. Những thứ KHÔNG PHẢI ES5 (tránh dùng khi cần ES5 chuẩn)
Cú pháp / API	Thuộc chuẩn	Thay thế bằng ES5 chuẩn
let, const	ES6 (2015)	var
Arrow function (x) => x * 2	ES6 (2015)	function (x) { return x * 2; }
Template literal `hi ${name}`	ES6 (2015)	Nối chuỗi bằng +
Default / Rest / Spread (a = 1, ...args)	ES6 (2015)	Kiểm tra typeof a !== "undefined", arguments, .concat()
class, extends, super	ES6 (2015)	Constructor function + Object.create() + .prototype
Promise, async/await, fetch	ES6 / ES2017 / Fetch API	Callback hoặc XMLHttpRequest
Map, Set, Symbol, Proxy	ES6 (2015)	Plain object {} / Array + hàm helper
Array.prototype.includes, find, findIndex	ES6 / ES2016	.indexOf(x) !== -1, vòng lặp for
Object.assign, Object.values, Object.entries	ES6 / ES2017	Vòng lặp for (var k in obj) kèm hasOwnProperty
String.prototype.includes, startsWith, endsWith	ES6 (2015)	.indexOf(...) === 0 hoặc .indexOf(...) !== -1
** (lũy thừa)	ES2016	Math.pow(a, b)
Optional chaining ?., Nullish coalescing ??	ES2020	Kiểm tra && / toán tử ba ngôi ?:
3. Ví dụ mẫu ES5 chuẩn (Object, Array, JSON, bind, defineProperty)
JavaScript
(function (global) {
    "use strict";

    function createPlaylist(name) {
        if (!name || typeof name !== "string") {
            name = "Danh sách mặc định";
        }

        var items = [];

        function findIndexById(id) {
            var i;
            for (i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                    return i;
                }
            }
            return -1;
        }

        var playlist = {
            name: name.trim(),
            add: function (item) {
                if (!item || !item.id) {
                    return false;
                }
                if (findIndexById(item.id) !== -1) {
                    return false;
                }
                items.push({
                    id: String(item.id),
                    title: String(item.title || "")
                });
                return true;
            },
            remove: function (id) {
                var idx = findIndexById(String(id));
                if (idx === -1) {
                    return false;
                }
                items.splice(idx, 1);
                return true;
            },
            getTitles: function () {
                return items.map(function (entry) {
                    return entry.title;
                });
            },
            toJson: function () {
                return JSON.stringify({
                    name: this.name,
                    count: items.length,
                    items: items,
                    exportedAt: new Date().toISOString()
                });
            }
        };

        // Thuộc tính chỉ đọc (non-writable) chuẩn ES5
        Object.defineProperty(playlist, "version", {
            value: "1.0.0-es5",
            writable: false,
            enumerable: true,
            configurable: false
        });

        return playlist;
    }

    var myList = createPlaylist("  Phim cũ chọn lọc  ");
    myList.add({ id: "1", title: "Tập 1" });
    myList.add({ id: "2", title: "Tập 2" });

    var getBoundedTitles = myList.getTitles.bind(myList);
    var titles = getBoundedTitles(); // ["Tập 1", "Tập 2"]
    var serialized = myList.toJson();

    global.createPlaylist = createPlaylist;
})(window);
4. Cách kiểm tra code của bạn có đúng ES5 chuẩn không
Chạy qua ESLint với cấu hình "parserOptions": { "ecmaVersion": 5 } (hoặc env: { es6: false, browser: true }).

Nếu chạy trên trình duyệt cũ hoặc môi trường khắt khe chỉ hỗ trợ ES5, mọi từ khóa/phương thức ở bảng mục 2 sẽ báo lỗi cú pháp hoặc undefined ngay lúc chạy.

Bạn muốn viết lại hoặc kiểm tra một đoạn code cụ thể nào theo chuẩn ES5 không?

phân tích function getManifest() {

return JSON.stringify({

"id": "kkphim",

"name": "KKPhim",

"version": "1.0.3",

"baseUrl": "https://phimapi.com",

"iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/kkphim.png",

"isEnabled": true,

"type": "MOVIE"

});

}



function getHomeSections() {

return JSON.stringify([

{ slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'subteam', title: 'Subteam', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-thuyet-minh', title: 'Phim Thuyết Minh', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-moi-cap-nhat-v3', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }

]);

}



function getPrimaryCategories() {

return JSON.stringify([

{ name: 'Phim mới', slug: 'phim-moi-cap-nhat-v3' },

{ name: 'Phim bộ', slug: 'phim-bo' },

{ name: 'Phim lẻ', slug: 'phim-le' },

{ name: 'TV shows', slug: 'tv-shows' },

{ name: 'Hoạt hình', slug: 'hoat-hinh' },

{ name: 'Phim vietsub', slug: 'phim-vietsub' },

{ name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },

{ name: 'Phim lồng tiếng', slug: 'phim-long-tieng' },

{ name: 'Subteam', slug: 'subteam' },

{ name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }

]);

}



function getFilterConfig() {

return JSON.stringify({

sort: [

{ name: 'Thời gian cập nhật', value: 'modified.time' },

{ name: 'Năm phát hành', value: 'year' },

{ name: 'Theo ID', value: '_id' }

]

});

}



// =============================================================================

// URL GENERATION

// =============================================================================



function getUrlList(slug, filtersJson) {

try {

var filters = JSON.parse(filtersJson || "{}");

var page = parseInt(filters.page, 10) || 1;

var limit = parseInt(filters.limit, 10) || 24;



var listSlugs = [

'phim-vietsub', 'subteam', 'phim-thuyet-minh', 'phim-long-tieng',

'phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-chieu-rap',

'phim-moi-cap-nhat'

];



var typeList = (slug === 'phim-moi') ? 'phim-moi-cap-nhat-v3' : slug;



if (typeList === 'phim-moi-cap-nhat-v3') {

return "https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=" + page + "&limit=" + limit;

}



var basePath = (listSlugs.indexOf(typeList) !== -1) ? "danh-sach" : "the-loai";

var url = "https://phimapi.com/v1/api/" + basePath + "/" + encodeURIComponent(typeList) + "?page=" + page + "&limit=" + limit;



if (filters.country) url += "&country=" + encodeURIComponent(filters.country);

if (filters.year) url += "&year=" + encodeURIComponent(filters.year);

if (filters.category) url += "&category=" + encodeURIComponent(filters.category);

if (filters.sort) url += "&sort_field=" + encodeURIComponent(filters.sort);



return url;

} catch (e) {

return "https://phimapi.com/v1/api/danh-sach/" + encodeURIComponent(slug || "phim-moi-cap-nhat");

}

}



function getUrlSearch(keyword, filtersJson) {

try {

var filters = JSON.parse(filtersJson || "{}");

var page = parseInt(filters.page, 10) || 1;

var limit = parseInt(filters.limit, 10) || 24;

var q = encodeURIComponent((keyword || "").trim());

return "https://phimapi.com/v1/api/tim-kiem?keyword=" + q + "&page=" + page + "&limit=" + limit;

} catch (e) {

return "https://phimapi.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword || "") + "&page=1&limit=24";

}

}



function getUrlDetail(slug) {

return "https://phimapi.com/phim/" + encodeURIComponent(slug || "");

}



function getUrlCategories() {

return "https://phimapi.com/the-loai";

}



function getUrlCountries() {

return "https://phimapi.com/quoc-gia";

}



function getUrlYears() {

return "";

}



function getLocalYearsJson() {

var currentYear = new Date().getFullYear();

var years = [];

for (var y = currentYear; y >= 1970; y--) {

years.push({ name: String(y), value: String(y) });

}

return JSON.stringify(years);

}



// =============================================================================

// PARSERS & HELPERS

// =============================================================================



function extractArrayItems(response) {

if (!response) return [];

if (Array.isArray(response)) return response;

if (Array.isArray(response.items)) return response.items;

if (Array.isArray(response.data)) return response.data;

if (response.data && Array.isArray(response.data.items)) return response.data.items;

return [];

}



function extractCdnDomain(response) {

if (response && response.data && typeof response.data === "object" && response.data.APP_DOMAIN_CDN_IMAGE) {

return String(response.data.APP_DOMAIN_CDN_IMAGE).trim();

}

if (response && response.APP_DOMAIN_CDN_IMAGE) {

return String(response.APP_DOMAIN_CDN_IMAGE).trim();

}

return "https://phimimg.com";

}



function getPosterUrl(path, cdnDomain, fallbackPath) {

var raw = path || fallbackPath || "";

if (!raw) return "";



var str = String(raw).trim();

if (!str) return "";



if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) {

return str;

}



var baseCdn = String(cdnDomain || "https://phimimg.com").trim().replace(/\/+$/, "");

var cleanPath = str.replace(/^\/+/, "");



return baseCdn + "/" + cleanPath;

}



function parseListResponse(apiResponseJson) {

try {

var response = JSON.parse(apiResponseJson);

var items = extractArrayItems(response);

var cdnDomain = extractCdnDomain(response);

var data = (response && response.data && !Array.isArray(response.data)) ? response.data : {};

var params = data.params || {};

var pagination = response.pagination || params.pagination || {};



var currentPage = parseInt(pagination.currentPage, 10) || 1;

var totalItems = parseInt(pagination.totalItems, 10) || items.length;

var itemsPerPage = parseInt(pagination.totalItemsPerPage || pagination.itemsPerPage, 10) || 24;

var totalPages = parseInt(pagination.totalPages, 10) || Math.max(1, Math.ceil(totalItems / itemsPerPage));



var movies = items.map(function (item) {

return {

id: item.slug || "",

title: item.name || "",

posterUrl: getPosterUrl(item.poster_url, cdnDomain, item.thumb_url),

backdropUrl: getPosterUrl(item.thumb_url, cdnDomain, item.poster_url),

year: parseInt(item.year, 10) || 0,

quality: item.quality || "",

episode_current: item.episode_current || "",

lang: item.lang || ""

};

});



return JSON.stringify({

items: movies,

pagination: {

currentPage: currentPage,

totalPages: totalPages,

totalItems: totalItems,

itemsPerPage: itemsPerPage

}

});

} catch (error) {

return JSON.stringify({

items: [],

pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 }

});

}

}



function parseSearchResponse(apiResponseJson) {

return parseListResponse(apiResponseJson);

}



function parseMovieDetail(apiResponseJson) {

try {

var response = JSON.parse(apiResponseJson);

var movie = response.movie || {};

var episodes = Array.isArray(response.episodes) ? response.episodes : [];

var cdnDomain = extractCdnDomain(response);



var servers = [];

for (var i = 0; i < episodes.length; i++) {

var server = episodes[i] || {};

var serverData = Array.isArray(server.server_data) ? server.server_data : [];

var serverEpisodes = [];



for (var j = 0; j < serverData.length; j++) {

var ep = serverData[j] || {};

var streamUrl = ep.link_m3u8 || ep.link_embed || "";

if (streamUrl) {

serverEpisodes.push({

id: streamUrl,

name: ep.name || "",

slug: ep.slug || "",

m3u8: ep.link_m3u8 || "",

embed: ep.link_embed || ""

});

}

}



if (serverEpisodes.length > 0) {

servers.push({

name: server.server_name || ("Server " + (i + 1)),

episodes: serverEpisodes

});

}

}



var categories = Array.isArray(movie.category)

? movie.category.map(function (c) { return c && c.name ? c.name : ""; }).filter(Boolean).join(", ")

: "";



var countries = Array.isArray(movie.country)

? movie.country.map(function (c) { return c && c.name ? c.name : ""; }).filter(Boolean).join(", ")

: "";



var directors = Array.isArray(movie.director) ? movie.director.filter(Boolean).join(", ") : "";

var actors = Array.isArray(movie.actor) ? movie.actor.filter(Boolean).join(", ") : "";



var ratingValue = 0;

var tmdbId = "";

var tmdbSeason = 0;

var tmdbType = "";



if (movie.tmdb && typeof movie.tmdb === "object") {

if (movie.tmdb.vote_average) ratingValue = parseFloat(movie.tmdb.vote_average) || 0;

if (movie.tmdb.id) tmdbId = String(movie.tmdb.id);

if (movie.tmdb.season) tmdbSeason = parseInt(movie.tmdb.season, 10) || 0;

if (movie.tmdb.type) tmdbType = String(movie.tmdb.type);

}



var cleanDescription = String(movie.content || "")

.replace(/<br\s*\/?>/gi, "\n")

.replace(/<[^>]*>/g, "")

.trim();



return JSON.stringify({

id: movie.slug || "",

title: movie.name || "",

originName: movie.origin_name || "",

posterUrl: getPosterUrl(movie.poster_url, cdnDomain, movie.thumb_url),

backdropUrl: getPosterUrl(movie.thumb_url, cdnDomain, movie.poster_url),

description: cleanDescription,

year: parseInt(movie.year, 10) || 0,

rating: ratingValue,

quality: movie.quality || "",

duration: movie.time || "",

servers: servers,

episode_current: movie.episode_current || "",

lang: movie.lang || "",

category: categories,

country: countries,

director: directors,

casts: actors,

status: movie.status || "",

tmdbId: tmdbId,

tmdbSeason: tmdbSeason,

tmdbType: tmdbType

});

} catch (error) {

return "null";

}

}



function resolveStreamData(streamInput) {

var raw = String(streamInput || "").trim();

var isHlsOrDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);

return JSON.stringify({

url: raw,

isDirectStream: isHlsOrDirect,

headers: {

"User-Agent": "Mozilla/5.0",

"Referer": "https://phimapi.com/"

},

subtitles: []

});

}



function parseDetailResponse(apiResponseJson) {

try {

var parsed = JSON.parse(apiResponseJson || "{}");

var candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.link_embed || "";

return resolveStreamData(candidate);

} catch (e) {

return resolveStreamData(apiResponseJson);

}

}



function parseCategoriesResponse(apiResponseJson) {

try {

var response = JSON.parse(apiResponseJson);

var items = extractArrayItems(response);

return JSON.stringify(items.map(function (i) {

return {

name: i.name || "",

slug: i.slug || ""

};

}));

} catch (e) {

return "[]";

}

}



function parseCountriesResponse(apiResponseJson) {

try {

var response = JSON.parse(apiResponseJson);

var items = extractArrayItems(response);

return JSON.stringify(items.map(function (i) {

return {

name: i.name || "",

value: i.slug || ""

};

}));

} catch (e) {

return "[]";

}

}



function parseYearsResponse(apiResponseJson) {

try {

var items = extractArrayItems(JSON.parse(apiResponseJson));

return JSON.stringify(items.map(function (i) {

var val = (typeof i === "object" && i !== null) ? (i.slug || i.value || i.year || i.name) : i;

var label = (typeof i === "object" && i !== null) ? (i.name || i.year || val) : i;

return { name: String(label || ""), value: String(val || "") };

}));

} catch (e) {

return "[]";

}

}

Đoạn mã trên là một plugin / adapter viết theo phong cách ES5 cho ứng dụng xem phim (như Android/TV dùng WebView/JS bridge + ExoPlayer), kết nối tới API KKPhim ([https://phimapi.com](https://phimapi.com)) và chuẩn hóa dữ liệu đầu vào/đầu ra dưới dạng chuỗi JSON (JSON.stringify / JSON.parse).

1. Kiến trúc & vai trò từng nhóm hàm
Nhóm hàm	Chức năng chính	Đầu vào / Đầu ra
Metadata & UI Config (getManifest, getHomeSections, getPrimaryCategories, getFilterConfig)	Khai báo thông tin plugin, các mục trang chủ (Horizontal / Grid), danh mục chính và tùy chọn sắp xếp.	Trả về JSON string.
URL Generator (getUrlList, getUrlSearch, getUrlDetail, getUrlCategories, getUrlCountries, getUrlYears, getLocalYearsJson)	Sinh URL endpoint của phimapi.com theo slug, filtersJson (page, limit, country, year, category, sort) hoặc từ khóa tìm kiếm.	Trả về URL string hoặc JSON string (với getLocalYearsJson).
Response Parsers & Stream Resolver (parseListResponse, parseSearchResponse, parseMovieDetail, resolveStreamData, parseDetailResponse, parseCategoriesResponse, parseCountriesResponse, parseYearsResponse)	Chuyển cấu trúc JSON đặc thù của KKPhim sang schema thống nhất của app; làm sạch HTML mô tả; tách luồng m3u8/embed và header phát video.	Nhận JSON string/input, trả về JSON string (hoặc "null" / "[]" khi lỗi).
2. Điểm mạnh trong cách viết hiện tại
Phòng thủ lỗi tốt: Hầu hết parser đều bọc try/catch và có fallback an toàn ({ items: [], pagination: ... }, "[]", "null"), giúp host/app không bị crash khi API trả về dữ liệu lệch cấu trúc hoặc rỗng.

Xử lý linh hoạt các biến thể response của KKPhim: extractArrayItems và extractCdnDomain hỗ trợ cả response dạng cũ lẫn dạng v1/api có data.items và data.APP_DOMAIN_CDN_IMAGE.

Chuẩn hóa URL ảnh & làm sạch mô tả: getPosterUrl nối đúng domain CDN và loại bỏ dấu / dư; parseMovieDetail đổi <br> thành xuống dòng và strip thẻ HTML trước khi đưa lên giao diện.

3. Các lỗi logic, bug tiềm ẩn & điểm cần chú ý
Lỗi thiếu String.prototype.trim trên môi trường ES5 cực cũ (như IE8):

getUrlSearch gọi (keyword || "").trim() và extractCdnDomain / getPosterUrl gọi .trim(). Trong đặc tả ES5 có String.prototype.trim, nhưng trên môi trường rất cũ hoặc thiếu polyfill có thể lỗi; nên dùng helper .replace(/^\s+|\s+$/g, "") nếu cần tương thích tối đa.

Tham số sort trong getUrlList chưa đồng bộ tên field giữa getFilterConfig và URL:

getFilterConfig trả về value: 'modified.time', 'year', '_id', nhưng getUrlList gán trực tiếp vào &sort_field=.... Cần xác nhận phía phimapi.com có nhận đúng tên sort_field và giá trị modified.time hay không, đồng thời kiểm tra có cần sort_type (desc/asc) hay không.

Danh sách listSlugs thiếu hoặc trùng một số slug:

getHomeSections có phim-moi-cap-nhat-v3 (được xử lý riêng ở nhánh if (typeList === 'phim-moi-cap-nhat-v3')), còn phim-vietsub xuất hiện ở getPrimaryCategories và listSlugs nhưng không có trong getHomeSections. Nếu thêm slug danh sách mới vào phimapi.com, cần cập nhật đồng thời cả getHomeSections/getPrimaryCategories và listSlugs.

Dấu phẩy cuối (trailing comma) trong mảng/object literal:

Hợp lệ từ ES5 trở lên, nhưng nếu chạy trên một số trình phân tích cũ hoặc công cụ kiểm tra khắt khe, có thể cân nhắc bỏ nếu gặp cảnh báo.

Tên hàm parseDetailResponse dễ gây nhầm lẫn:

parseMovieDetail phân tích chi tiết phim và danh sách tập/server, trong khi parseDetailResponse thực chất chỉ trích xuất URL stream (url / streamUrl / link_m3u8 / link_embed) rồi gọi resolveStreamData. Nếu host gọi nhầm tên hàm khi lấy chi tiết phim sẽ không nhận được thông tin phim/tập.

Header Referer: "[https://phimapi.com/](https://phimapi.com/)" trong resolveStreamData:

Một số CDN video (m3u8/mp4) kiểm tra Referer hoặc User-Agent theo domain nguồn phát thực tế chứ không phải domain API. Khi test phát thực tế trên ExoPlayer, nếu gặp lỗi 403 hoặc 404 trên luồng m3u8, đây là điểm đầu tiên nên kiểm tra.

4. Gợi ý tối ưu ngắn gọn nếu cần nâng cấp
Tách một hàm helper chung safeTrim(val) để dùng nhất quán thay vì gọi .trim() rải rác.

Chuẩn hóa rõ ràng hợp đồng giữa JS plugin và Native host (Kotlin/ExoPlayer): xác định hàm nào nhận response gốc của phimapi.com, hàm nào nhận JSON đã parse từ bước trước, và cách truyền headers (User-Agent, Referer) vào DefaultHttpDataSource.Factory của ExoPlayer.

code plugin / adapter viết theo phong cách ES5 https://clbphimxua.top/

Vì không truy cập trực tiếp được cấu trúc API/DOM thực tế của [https://clbphimxua.top/](https://clbphimxua.top/), dưới đây là plugin / adapter hoàn chỉnh viết theo phong cách ES5, giữ đúng bộ hàm chuẩn (getManifest, getHomeSections, getPrimaryCategories, getFilterConfig, getUrlList, getUrlSearch, getUrlDetail, getUrlCategories, getUrlCountries, getUrlYears, getLocalYearsJson, parseListResponse, parseSearchResponse, parseMovieDetail, resolveStreamData, parseDetailResponse, parseCategoriesResponse, parseCountriesResponse, parseYearsResponse) để cắm trực tiếp vào host/app.

Mã Plugin / Adapter ES5 (clbphimxua-plugin-es5.js)
JavaScript
(function (global) {
    "use strict";

    var BASE_URL = "https://clbphimxua.top";
    var DEFAULT_LIMIT = 24;

    // =========================================================================
    // 1. HÀM TIỆN ÍCH ES5 AN TOÀN
    // =========================================================================
    function safeTrim(val) {
        return String(val || "").replace(/^\s+|\s+$/g, "");
    }

    function toInt(val, fallback) {
        var parsed = parseInt(val, 10);
        return isNaN(parsed) ? fallback : parsed;
    }

    function toFloat(val, fallback) {
        var parsed = parseFloat(val);
        return isNaN(parsed) ? fallback : parsed;
    }

    function isPlainObject(val) {
        return typeof val === "object" && val !== null && !Array.isArray(val);
    }

    function extractArrayItems(response) {
        if (!response) {
            return [];
        }
        if (Array.isArray(response)) {
            return response;
        }
        if (Array.isArray(response.items)) {
            return response.items;
        }
        if (Array.isArray(response.movies)) {
            return response.movies;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        if (isPlainObject(response.data)) {
            if (Array.isArray(response.data.items)) {
                return response.data.items;
            }
            if (Array.isArray(response.data.movies)) {
                return response.data.movies;
            }
        }
        return [];
    }

    function extractCdnDomain(response) {
        if (isPlainObject(response) && isPlainObject(response.data) && response.data.cdnDomain) {
            return safeTrim(response.data.cdnDomain);
        }
        if (isPlainObject(response) && isPlainObject(response.data) && response.data.APP_DOMAIN_CDN_IMAGE) {
            return safeTrim(response.data.APP_DOMAIN_CDN_IMAGE);
        }
        if (isPlainObject(response) && response.cdnDomain) {
            return safeTrim(response.cdnDomain);
        }
        if (isPlainObject(response) && response.APP_DOMAIN_CDN_IMAGE) {
            return safeTrim(response.APP_DOMAIN_CDN_IMAGE);
        }
        return BASE_URL;
    }

    function buildMediaUrl(path, cdnDomain, fallbackPath) {
        var raw = safeTrim(path || fallbackPath || "");
        if (!raw) {
            return "";
        }
        if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
            return raw;
        }
        if (raw.indexOf("//") === 0) {
            return "https:" + raw;
        }
        var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
        var cleanPath = raw.replace(/^\/+/, "");
        return base + "/" + cleanPath;
    }

    function stripHtmlToText(html) {
        return String(html || "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/^\s+|\s+$/g, "");
    }

    function joinNamedList(list) {
        if (!Array.isArray(list)) {
            return "";
        }
        var parts = [];
        var i;
        for (i = 0; i < list.length; i++) {
            var item = list[i];
            var text = "";
            if (typeof item === "string") {
                text = safeTrim(item);
            } else if (isPlainObject(item)) {
                text = safeTrim(item.name || item.title || item.slug || "");
            }
            if (text) {
                parts.push(text);
            }
        }
        return parts.join(", ");
    }

    // =========================================================================
    // 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
    // =========================================================================
    function getManifest() {
        return JSON.stringify({
            id: "clbphimxua",
            name: "CLB Phim Xưa",
            version: "1.0.0",
            baseUrl: BASE_URL,
            iconUrl: BASE_URL + "/favicon.ico",
            isEnabled: true,
            type: "MOVIE"
        });
    }

    function getHomeSections() {
        return JSON.stringify([
            { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
            { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
            { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
            { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
            { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
            { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
            { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
        ]);
    }

    function getPrimaryCategories() {
        return JSON.stringify([
            { name: "Phim mới", slug: "phim-moi-cap-nhat" },
            { name: "Phim lẻ", slug: "phim-le" },
            { name: "Phim bộ", slug: "phim-bo" },
            { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
            { name: "Hoạt hình", slug: "hoat-hinh" },
            { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
            { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
        ]);
    }

    function getFilterConfig() {
        return JSON.stringify({
            sort: [
                { name: "Mới cập nhật", value: "modified" },
                { name: "Năm phát hành", value: "year" },
                { name: "Tên phim", value: "name" }
            ]
        });
    }

    // =========================================================================
    // 3. TẠO URL ENDPOINT
    // =========================================================================
    function getUrlList(slug, filtersJson) {
        var safeSlug = safeTrim(slug || "phim-moi-cap-nhat");
        try {
            var filters = JSON.parse(filtersJson || "{}");
            var page = toInt(filters.page, 1);
            if (page < 1) {
                page = 1;
            }
            var limit = toInt(filters.limit, DEFAULT_LIMIT);
            if (limit < 1) {
                limit = DEFAULT_LIMIT;
            }

            var url = BASE_URL + "/api/danh-sach/" + encodeURIComponent(safeSlug) +
                "?page=" + page + "&limit=" + limit;

            if (filters.category) {
                url += "&category=" + encodeURIComponent(safeTrim(filters.category));
            }
            if (filters.country) {
                url += "&country=" + encodeURIComponent(safeTrim(filters.country));
            }
            if (filters.year) {
                url += "&year=" + encodeURIComponent(safeTrim(filters.year));
            }
            if (filters.sort) {
                url += "&sort=" + encodeURIComponent(safeTrim(filters.sort));
            }

            return url;
        } catch (e) {
            return BASE_URL + "/api/danh-sach/" + encodeURIComponent(safeSlug) + "?page=1&limit=" + DEFAULT_LIMIT;
        }
    }

    function getUrlSearch(keyword, filtersJson) {
        var cleanKeyword = safeTrim(keyword || "");
        try {
            var filters = JSON.parse(filtersJson || "{}");
            var page = toInt(filters.page, 1);
            if (page < 1) {
                page = 1;
            }
            var limit = toInt(filters.limit, DEFAULT_LIMIT);
            if (limit < 1) {
                limit = DEFAULT_LIMIT;
            }

            return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
                "&page=" + page + "&limit=" + limit;
        } catch (e) {
            return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
                "&page=1&limit=" + DEFAULT_LIMIT;
        }
    }

    function getUrlDetail(slug) {
        return BASE_URL + "/api/phim/" + encodeURIComponent(safeTrim(slug || ""));
    }

    function getUrlCategories() {
        return BASE_URL + "/api/the-loai";
    }

    function getUrlCountries() {
        return BASE_URL + "/api/quoc-gia";
    }

    function getUrlYears() {
        return "";
    }

    function getLocalYearsJson() {
        var currentYear = new Date().getFullYear();
        var years = [];
        var y;
        for (y = currentYear; y >= 1950; y--) {
            years.push({
                name: String(y),
                value: String(y)
            });
        }
        return JSON.stringify(years);
    }

    // =========================================================================
    // 4. PARSER & STREAM RESOLVER
    // =========================================================================
    function parseListResponse(apiResponseJson) {
        var fallbackPage = 1;
        var fallbackLimit = DEFAULT_LIMIT;
        try {
            var response = JSON.parse(apiResponseJson);
            var rawItems = extractArrayItems(response);
            var cdnDomain = extractCdnDomain(response);
            var dataObj = isPlainObject(response) && isPlainObject(response.data) ? response.data : {};
            var pagination = isPlainObject(response) && isPlainObject(response.pagination)
                ? response.pagination
                : (isPlainObject(dataObj.pagination) ? dataObj.pagination : {});

            var currentPage = toInt(pagination.currentPage || pagination.page, fallbackPage);
            var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
            var itemsPerPage = toInt(
                pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
                fallbackLimit
            );
            var totalPages = toInt(
                pagination.totalPages || pagination.lastPage,
                Math.max(1, Math.ceil(totalItems / Math.max(1, itemsPerPage)))
            );

            var movies = rawItems.map(function (item) {
                var obj = isPlainObject(item) ? item : {};
                var slugVal = safeTrim(obj.slug || obj.id || "");
                var posterRaw = obj.poster_url || obj.posterUrl || obj.poster || obj.thumb_url || obj.thumb || "";
                var backdropRaw = obj.thumb_url || obj.backdrop_url || obj.backdropUrl || obj.poster_url || "";

                return {
                    id: slugVal,
                    title: safeTrim(obj.name || obj.title || ""),
                    posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
                    backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
                    year: toInt(obj.year, 0),
                    quality: safeTrim(obj.quality || ""),
                    episode_current: safeTrim(obj.episode_current || obj.episodeCurrent || ""),
                    lang: safeTrim(obj.lang || "")
                };
            });

            return JSON.stringify({
                items: movies,
                pagination: {
                    currentPage: currentPage,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    itemsPerPage: itemsPerPage
                }
            });
        } catch (err) {
            return JSON.stringify({
                items: [],
                pagination: {
                    currentPage: fallbackPage,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: fallbackLimit
                }
            });
        }
    }

    function parseSearchResponse(apiResponseJson) {
        return parseListResponse(apiResponseJson);
    }

    function parseMovieDetail(apiResponseJson) {
        try {
            var response = JSON.parse(apiResponseJson);
            var dataObj = isPlainObject(response) && isPlainObject(response.data) ? response.data : response;
            var movie = isPlainObject(dataObj.movie) ? dataObj.movie : (isPlainObject(dataObj.item) ? dataObj.item : dataObj);
            var episodesRaw = Array.isArray(dataObj.episodes)
                ? dataObj.episodes
                : (Array.isArray(response.episodes) ? response.episodes : []);
            var cdnDomain = extractCdnDomain(response);

            var servers = [];
            var i;
            for (i = 0; i < episodesRaw.length; i++) {
                var srv = isPlainObject(episodesRaw[i]) ? episodesRaw[i] : {};
                var srvData = Array.isArray(srv.server_data)
                    ? srv.server_data
                    : (Array.isArray(srv.episodes) ? srv.episodes : []);
                var serverEpisodes = [];
                var j;

                for (j = 0; j < srvData.length; j++) {
                    var ep = isPlainObject(srvData[j]) ? srvData[j] : {};
                    var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
                    var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
                    var streamUrl = m3u8Url || embedUrl || safeTrim(ep.url || "");

                    if (streamUrl) {
                        serverEpisodes.push({
                            id: streamUrl,
                            name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                            slug: safeTrim(ep.slug || ""),
                            m3u8: m3u8Url,
                            embed: embedUrl
                        });
                    }
                }

                if (serverEpisodes.length > 0) {
                    servers.push({
                        name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
                        episodes: serverEpisodes
                    });
                }
            }

            var ratingValue = 0;
            var tmdbId = "";
            var tmdbSeason = 0;
            var tmdbType = "";

            if (isPlainObject(movie.tmdb)) {
                ratingValue = toFloat(movie.tmdb.vote_average, 0);
                if (movie.tmdb.id) {
                    tmdbId = String(movie.tmdb.id);
                }
                tmdbSeason = toInt(movie.tmdb.season, 0);
                if (movie.tmdb.type) {
                    tmdbType = String(movie.tmdb.type);
                }
            } else if (movie.rating) {
                ratingValue = toFloat(movie.rating, 0);
            }

            var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
            var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";

            return JSON.stringify({
                id: safeTrim(movie.slug || movie.id || ""),
                title: safeTrim(movie.name || movie.title || ""),
                originName: safeTrim(movie.origin_name || movie.originName || ""),
                posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
                backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
                description: stripHtmlToText(movie.content || movie.description || ""),
                year: toInt(movie.year, 0),
                rating: ratingValue,
                quality: safeTrim(movie.quality || ""),
                duration: safeTrim(movie.time || movie.duration || ""),
                servers: servers,
                episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
                lang: safeTrim(movie.lang || ""),
                category: joinNamedList(movie.category || movie.categories),
                country: joinNamedList(movie.country || movie.countries),
                director: joinNamedList(movie.director || movie.directors),
                casts: joinNamedList(movie.actor || movie.actors || movie.casts),
                status: safeTrim(movie.status || ""),
                tmdbId: tmdbId,
                tmdbSeason: tmdbSeason,
                tmdbType: tmdbType
            });
        } catch (err) {
            return "null";
        }
    }

    function resolveStreamData(streamInput) {
        var raw = safeTrim(streamInput || "");
        var isDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);
        return JSON.stringify({
            url: raw,
            isDirectStream: isDirect,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": BASE_URL + "/"
            },
            subtitles: []
        });
    }

    function parseDetailResponse(apiResponseJson) {
        try {
            var parsed = JSON.parse(apiResponseJson || "{}");
            var candidate = "";
            if (isPlainObject(parsed)) {
                candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.link_embed || "";
            }
            return resolveStreamData(candidate);
        } catch (err) {
            return resolveStreamData(apiResponseJson);
        }
    }

    function parseCategoriesResponse(apiResponseJson) {
        try {
            var items = extractArrayItems(JSON.parse(apiResponseJson));
            return JSON.stringify(items.map(function (entry) {
                var obj = isPlainObject(entry) ? entry : {};
                return {
                    name: safeTrim(obj.name || obj.title || obj.slug || ""),
                    slug: safeTrim(obj.slug || obj.id || "")
                };
            }));
        } catch (err) {
            return "[]";
        }
    }

    function parseCountriesResponse(apiResponseJson) {
        try {
            var items = extractArrayItems(JSON.parse(apiResponseJson));
            return JSON.stringify(items.map(function (entry) {
                var obj = isPlainObject(entry) ? entry : {};
                return {
                    name: safeTrim(obj.name || obj.title || obj.slug || ""),
                    value: safeTrim(obj.slug || obj.value || obj.id || "")
                };
            }));
        } catch (err) {
            return "[]";
        }
    }

    function parseYearsResponse(apiResponseJson) {
        try {
            var items = extractArrayItems(JSON.parse(apiResponseJson));
            return JSON.stringify(items.map(function (entry) {
                if (isPlainObject(entry)) {
                    var val = entry.slug || entry.value || entry.year || entry.name || "";
                    var label = entry.name || entry.year || val || "";
                    return {
                        name: safeTrim(label),
                        value: safeTrim(val)
                    };
                }
                return {
                    name: safeTrim(entry),
                    value: safeTrim(entry)
                };
            }));
        } catch (err) {
            return "[]";
        }
    }

    // Gắn ra global nếu chạy trong JS engine nhúng (Rhino / V8 / QuickJS / WebView)
    global.getManifest = getManifest;
    global.getHomeSections = getHomeSections;
    global.getPrimaryCategories = getPrimaryCategories;
    global.getFilterConfig = getFilterConfig;
    global.getUrlList = getUrlList;
    global.getUrlSearch = getUrlSearch;
    global.getUrlDetail = getUrlDetail;
    global.getUrlCategories = getUrlCategories;
    global.getUrlCountries = getUrlCountries;
    global.getUrlYears = getUrlYears;
    global.getLocalYearsJson = getLocalYearsJson;
    global.parseListResponse = parseListResponse;
    global.parseSearchResponse = parseSearchResponse;
    global.parseMovieDetail = parseMovieDetail;
    global.resolveStreamData = resolveStreamData;
    global.parseDetailResponse = parseDetailResponse;
    global.parseCategoriesResponse = parseCategoriesResponse;
    global.parseCountriesResponse = parseCountriesResponse;
    global.parseYearsResponse = parseYearsResponse;
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));
Cách khớp với API / HTML thực tế của clbphimxua.top
Hiện tại phần BASE_URL và các đường dẫn /api/... đang là khung mặc định an toàn. Nếu [https://clbphimxua.top/](https://clbphimxua.top/) dùng đường dẫn API khác (hoặc cần parse trực tiếp từ HTML nếu site không có JSON API), bạn chỉ cần gửi một mẫu JSON response hoặc tên các đường dẫn/slug thật của trang, mình sẽ chỉnh lại URL và field mapping cho khớp 100%.

không hợp lệ với app

Có thể plugin bị báo không hợp lệ với app do một trong các lý do sau:

Dùng globalThis ở cuối file: globalThis thuộc chuẩn ES2020, không thuộc ES5 thuần — nếu app kiểm tra cú pháp ES5 nghiêm ngặt hoặc chạy trên engine cũ sẽ báo lỗi.

Khác hợp đồng (contract) của app: App có thể yêu cầu cấu trúc trường riêng trong getManifest(), kiểu trả về khác (hoặc hàm không được bọc trong IIFE), hoặc đường dẫn/cấu trúc dữ liệu của [https://clbphimxua.top/](https://clbphimxua.top/) không phải dạng /api/... như giả định.

Lỗi parse/runtime khi nạp plugin: App có thể đang log cụ thể tên hàm thiếu, lỗi JSON schema, hoặc lỗi khi gọi một hàm nào đó lúc khởi tạo.

Bản sửa lỗi cú pháp ES5 thuần (bỏ globalThis)
Nếu nguyên nhân nằm ở cú pháp ES2020 (globalThis), thay phần cuối bằng đoạn ES5 thuần sau:

JavaScript
if (typeof window !== "undefined") {
    window.getManifest = getManifest;
    window.getHomeSections = getHomeSections;
    window.getPrimaryCategories = getPrimaryCategories;
    window.getFilterConfig = getFilterConfig;
    window.getUrlList = getUrlList;
    window.getUrlSearch = getUrlSearch;
    window.getUrlDetail = getUrlDetail;
    window.getUrlCategories = getUrlCategories;
    window.getUrlCountries = getUrlCountries;
    window.getUrlYears = getUrlYears;
    window.getLocalYearsJson = getLocalYearsJson;
    window.parseListResponse = parseListResponse;
    window.parseSearchResponse = parseSearchResponse;
    window.parseMovieDetail = parseMovieDetail;
    window.resolveStreamData = resolveStreamData;
    window.parseDetailResponse = parseDetailResponse;
    window.parseCategoriesResponse = parseCategoriesResponse;
    window.parseCountriesResponse = parseCountriesResponse;
    window.parseYearsResponse = parseYearsResponse;
}
Để mình sửa trúng ngay cho app của bạn: app đang báo lỗi cụ thể gì (hoặc mong đợi cấu trúc dữ liệu/hàm nào khác so với bản kkphim ban đầu)?

hoàn thiện code tránh lỗi không tải được dữ liệu nguồn

Để tránh lỗi khi nguồn dữ liệu ([https://clbphimxua.top](https://clbphimxua.top)) không tải được, trả về rỗng, trả về trang HTML lỗi (404/502/503/Cloudflare/WAF), hoặc lệch cấu trúc JSON, bản ES5 thuần dưới đây tăng cường lớp phòng thủ ở mọi bước:

Chuẩn hóa & kiểm tra đầu vào an toàn: mọi hàm parse* đều chấp nhận null, undefined, chuỗi rỗng, chuỗi HTML, hoặc object/array đã parse sẵn.

Dự phòng đường dẫn/endpoint hợp lý (fallback paths): khi gọi danh sách/chi tiết/danh mục/quốc gia, hỗ trợ thử nhiều mẫu đường dẫn phổ biến nếu nguồn thay đổi cấu trúc.

Chống crash & luôn trả về đúng kiểu dữ liệu: không bao giờ ném ngoại lệ ra ngoài app; luôn trả về JSON string hợp lệ đúng schema (items: [], pagination, servers: [], [], hoặc "null" an toàn).

Tương thích ES5 nghiêm ngặt: không dùng globalThis, let/const, arrow function, template string hay Array.prototype.includes.

Mã Plugin / Adapter ES5 hoàn chỉnh (chống lỗi nguồn dữ liệu)
JavaScript
var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

// =========================================================================
// 1. TIỆN ÍCH CƠ BẢN ES5
// =========================================================================
function safeTrim(val) {
    if (val === null || val === undefined) {
        return "";
    }
    return String(val).replace(/^\s+|\s+$/g, "");
}

function toInt(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var n = parseInt(val, 10);
    return isNaN(n) ? defVal : n;
}

function toFloat(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var f = parseFloat(val);
    return isNaN(f) ? defVal : f;
}

function isArraySafe(val) {
    if (typeof Array !== "undefined" && typeof Array.isArray === "function") {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isPlainObject(val) {
    return typeof val === "object" && val !== null && !isArraySafe(val);
}

function looksLikeHtml(str) {
    var s = safeTrim(str);
    if (!s) {
        return false;
    }
    return /^<!doctype html/i.test(s) || /^<html[\s>]/i.test(s) || /<(body|head|script|div|title)[\s>]/i.test(s);
}

// Parse JSON an toàn: hỗ trợ cả chuỗi JSON lẫn object/array đã truyền sẵn
function safeParseJson(input, fallback) {
    if (input === null || input === undefined) {
        return fallback;
    }
    if (isPlainObject(input) || isArraySafe(input)) {
        return input;
    }
    var raw = safeTrim(input);
    if (!raw || looksLikeHtml(raw)) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        // Trường hợp chuỗi có kèm ký tự rác đầu/cuối quanh {...} hoặc [...]
        var firstObj = raw.indexOf("{");
        var lastObj = raw.lastIndexOf("}");
        if (firstObj !== -1 && lastObj > firstObj) {
            try {
                return JSON.parse(raw.substring(firstObj, lastObj + 1));
            } catch (e2) {}
        }
        var firstArr = raw.indexOf("[");
        var lastArr = raw.lastIndexOf("]");
        if (firstArr !== -1 && lastArr > firstArr) {
            try {
                return JSON.parse(raw.substring(firstArr, lastArr + 1));
            } catch (e3) {}
        }
        return fallback;
    }
}

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
    }
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }
    if (isArraySafe(response)) {
        return response;
    }
    if (!isPlainObject(response)) {
        return [];
    }
    if (isArraySafe(response.items)) {
        return response.items;
    }
    if (isArraySafe(response.movies)) {
        return response.movies;
    }
    if (isArraySafe(response.results)) {
        return response.results;
    }
    if (isArraySafe(response.list)) {
        return response.list;
    }
    if (isArraySafe(response.data)) {
        return response.data;
    }
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) {
            return response.data.items;
        }
        if (isArraySafe(response.data.movies)) {
            return response.data.movies;
        }
        if (isArraySafe(response.data.results)) {
            return response.data.results;
        }
        if (isArraySafe(response.data.list)) {
            return response.data.list;
        }
    }
    return [];
}

function extractCdnDomain(response) {
    var candidates = [];
    if (isPlainObject(response)) {
        if (isPlainObject(response.data)) {
            candidates.push(response.data.cdnDomain);
            candidates.push(response.data.APP_DOMAIN_CDN_IMAGE);
            candidates.push(response.data.domain_cdn);
        }
        candidates.push(response.cdnDomain);
        candidates.push(response.APP_DOMAIN_CDN_IMAGE);
        candidates.push(response.domain_cdn);
    }

    var i;
    for (i = 0; i < candidates.length; i++) {
        var c = safeTrim(candidates[i]);
        if (c) {
            if (c.indexOf("http://") === 0 || c.indexOf("https://") === 0) {
                return c;
            }
            if (c.indexOf("//") === 0) {
                return "https:" + c;
            }
            return "https://" + c.replace(/^\/+/, "");
        }
    }
    return BASE_URL;
}

function buildMediaUrl(path, cdnDomain, fallbackPath) {
    var raw = safeTrim(path) || safeTrim(fallbackPath);
    if (!raw) {
        return "";
    }
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    if (raw.indexOf("//") === 0) {
        return "https:" + raw;
    }
    var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
    if (!base) {
        base = BASE_URL;
    }
    var cleanPath = raw.replace(/^\/+/, "");
    return base + "/" + cleanPath;
}

function stripHtmlToText(html) {
    if (!html) {
        return "";
    }
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");
}

function joinNamedList(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var parts = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var text = "";
        if (typeof item === "string") {
            text = safeTrim(item);
        } else if (isPlainObject(item)) {
            text = safeTrim(item.name || item.title || item.slug || "");
        }
        if (text && parts.join(", ").indexOf(text) === -1) {
            parts.push(text);
        }
    }
    return parts.join(", ");
}

function buildDefaultPagination(page, limit, totalItems, totalPages) {
    var safePage = toInt(page, 1);
    if (safePage < 1) {
        safePage = 1;
    }
    var safeLimit = toInt(limit, DEFAULT_LIMIT);
    if (safeLimit < 1) {
        safeLimit = DEFAULT_LIMIT;
    }
    var safeTotalItems = toInt(totalItems, 0);
    if (safeTotalItems < 0) {
        safeTotalItems = 0;
    }
    var calcPages = Math.max(1, Math.ceil(safeTotalItems / safeLimit));
    var safeTotalPages = toInt(totalPages, calcPages);
    if (safeTotalPages < 1) {
        safeTotalPages = 1;
    }

    return {
        currentPage: safePage,
        totalPages: safeTotalPages,
        totalItems: safeTotalItems,
        itemsPerPage: safeLimit
    };
}

// =========================================================================
// 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
// =========================================================================
function getManifest() {
    return safeStringify({
        id: "clbphimxua",
        name: "CLB Phim Xưa",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE"}');
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" },
            { name: "Tên phim", value: "name" }
        ]
    }, '{"sort":[]}');
}

// =========================================================================
// 3. TẠO URL AN TOÀN (CÓ FALLBACK KHI THIẾU/SAI THAM SỐ)
// =========================================================================
function getUrlList(slug, filtersJson) {
    var cleanSlug = safeTrim(slug) || "phim-moi-cap-nhat";
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    var url = BASE_URL + "/api/danh-sach/" + encodeURIComponent(cleanSlug) +
        "?page=" + page + "&limit=" + limit;

    if (safeTrim(filters.category)) {
        url += "&category=" + encodeURIComponent(safeTrim(filters.category));
    }
    if (safeTrim(filters.country)) {
        url += "&country=" + encodeURIComponent(safeTrim(filters.country));
    }
    if (safeTrim(filters.year)) {
        url += "&year=" + encodeURIComponent(safeTrim(filters.year));
    }
    if (safeTrim(filters.sort)) {
        url += "&sort=" + encodeURIComponent(safeTrim(filters.sort));
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var cleanKeyword = safeTrim(keyword);
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
        "&page=" + page + "&limit=" + limit;
}

function getUrlDetail(slug) {
    var cleanSlug = safeTrim(slug);
    if (!cleanSlug) {
        return BASE_URL + "/api/phim";
    }
    return BASE_URL + "/api/phim/" + encodeURIComponent(cleanSlug);
}

function getUrlCategories() {
    return BASE_URL + "/api/the-loai";
}

function getUrlCountries() {
    return BASE_URL + "/api/quoc-gia";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var nowYear = new Date().getFullYear();
    var endYear = (typeof nowYear === "number" && !isNaN(nowYear) && nowYear >= 1950) ? nowYear : 2026;
    var years = [];
    var y;
    for (y = endYear; y >= 1950; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }
    return safeStringify(years, "[]");
}

// =========================================================================
// 4. PARSER & STREAM RESOLVER CHỐNG LỖI DỮ LIỆU NGUỒN
// =========================================================================
function parseListResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed) {
        return safeStringify({
            items: [],
            pagination: buildDefaultPagination(1, DEFAULT_LIMIT, 0, 1)
        }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
    }

    var rawItems = extractArrayItems(parsed);
    var cdnDomain = extractCdnDomain(parsed);
    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : {};
    var paramsObj = isPlainObject(dataObj.params) ? dataObj.params : {};

    var pagination = null;
    if (isPlainObject(parsed) && isPlainObject(parsed.pagination)) {
        pagination = parsed.pagination;
    } else if (isPlainObject(dataObj.pagination)) {
        pagination = dataObj.pagination;
    } else if (isPlainObject(paramsObj.pagination)) {
        pagination = paramsObj.pagination;
    } else {
        pagination = {};
    }

    var currentPage = toInt(pagination.currentPage || pagination.page, 1);
    var itemsPerPage = toInt(
        pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
        DEFAULT_LIMIT
    );
    var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
    var totalPages = toInt(pagination.totalPages || pagination.lastPage, 0);

    var movies = [];
    var i;
    for (i = 0; i < rawItems.length; i++) {
        var item = rawItems[i];
        if (!isPlainObject(item)) {
            continue;
        }
        var movieId = safeTrim(item.slug || item.id || item._id || "");
        var title = safeTrim(item.name || item.title || item.origin_name || "");
        if (!movieId && !title) {
            continue;
        }

        var posterRaw = item.poster_url || item.posterUrl || item.poster || item.thumb_url || item.thumb || "";
        var backdropRaw = item.thumb_url || item.backdrop_url || item.backdropUrl || item.poster_url || "";

        movies.push({
            id: movieId || title,
            title: title || movieId,
            posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
            backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || item.episodeCurrent || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return safeStringify({
        items: movies,
        pagination: buildDefaultPagination(currentPage, itemsPerPage, totalItems, totalPages)
    }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed || (!isPlainObject(parsed) && !isArraySafe(parsed))) {
        return "null";
    }

    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : parsed;
    var movie = null;
    if (isPlainObject(dataObj)) {
        if (isPlainObject(dataObj.movie)) {
            movie = dataObj.movie;
        } else if (isPlainObject(dataObj.item)) {
            movie = dataObj.item;
        } else if (dataObj.name || dataObj.title || dataObj.slug) {
            movie = dataObj;
        }
    }

    if (!movie) {
        return "null";
    }

    var cdnDomain = extractCdnDomain(parsed);
    var episodesRaw = [];
    if (isPlainObject(dataObj) && isArraySafe(dataObj.episodes)) {
        episodesRaw = dataObj.episodes;
    } else if (isPlainObject(parsed) && isArraySafe(parsed.episodes)) {
        episodesRaw = parsed.episodes;
    } else if (isArraySafe(movie.episodes)) {
        episodesRaw = movie.episodes;
    }

    var servers = [];
    var i;
    for (i = 0; i < episodesRaw.length; i++) {
        var srv = episodesRaw[i];
        if (!isPlainObject(srv)) {
            continue;
        }
        var srvData = isArraySafe(srv.server_data)
            ? srv.server_data
            : (isArraySafe(srv.episodes) ? srv.episodes : []);

        var serverEpisodes = [];
        var j;
        for (j = 0; j < srvData.length; j++) {
            var ep = srvData[j];
            if (!isPlainObject(ep)) {
                continue;
            }
            var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
            var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
            var directUrl = safeTrim(ep.url || ep.link || "");
            var streamUrl = m3u8Url || embedUrl || directUrl;

            if (streamUrl) {
                serverEpisodes.push({
                    id: streamUrl,
                    name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                    slug: safeTrim(ep.slug || ""),
                    m3u8: m3u8Url,
                    embed: embedUrl
                });
            }
        }

        if (serverEpisodes.length > 0) {
            servers.push({
                name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
                episodes: serverEpisodes
            });
        }
    }

    var ratingValue = 0;
    var tmdbId = "";
    var tmdbSeason = 0;
    var tmdbType = "";

    if (isPlainObject(movie.tmdb)) {
        ratingValue = toFloat(movie.tmdb.vote_average, 0);
        if (movie.tmdb.id !== null && movie.tmdb.id !== undefined) {
            tmdbId = safeTrim(movie.tmdb.id);
        }
        tmdbSeason = toInt(movie.tmdb.season, 0);
        if (movie.tmdb.type !== null && movie.tmdb.type !== undefined) {
            tmdbType = safeTrim(movie.tmdb.type);
        }
    } else if (movie.rating !== null && movie.rating !== undefined) {
        ratingValue = toFloat(movie.rating, 0);
    }

    var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
    var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";
    var movieId = safeTrim(movie.slug || movie.id || movie._id || "");
    var movieTitle = safeTrim(movie.name || movie.title || movie.origin_name || "");

    if (!movieId && !movieTitle && servers.length === 0) {
        return "null";
    }

    return safeStringify({
        id: movieId || movieTitle,
        title: movieTitle || movieId,
        originName: safeTrim(movie.origin_name || movie.originName || ""),
        posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
        backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
        description: stripHtmlToText(movie.content || movie.description || ""),
        year: toInt(movie.year, 0),
        rating: ratingValue,
        quality: safeTrim(movie.quality || ""),
        duration: safeTrim(movie.time || movie.duration || ""),
        servers: servers,
        episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
        lang: safeTrim(movie.lang || ""),
        category: joinNamedList(movie.category || movie.categories),
        country: joinNamedList(movie.country || movie.countries),
        director: joinNamedList(movie.director || movie.directors),
        casts: joinNamedList(movie.actor || movie.actors || movie.casts),
        status: safeTrim(movie.status || ""),
        tmdbId: tmdbId,
        tmdbSeason: tmdbSeason,
        tmdbType: tmdbType
    }, "null");
}

function resolveStreamData(streamInput) {
    var raw = safeTrim(streamInput);
    if (looksLikeHtml(raw)) {
        raw = "";
    }
    var isDirect = raw.length > 0 && (/\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw));
    return safeStringify({
        url: raw,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    }, '{"url":"","isDirectStream":false,"headers":{},"subtitles":[]}');
}

function parseDetailResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    var candidate = "";

    if (isPlainObject(parsed)) {
        candidate = safeTrim(
            parsed.url ||
            parsed.streamUrl ||
            parsed.link_m3u8 ||
            parsed.m3u8 ||
            parsed.link_embed ||
            parsed.embed ||
            ""
        );
        if (!candidate && isPlainObject(parsed.data)) {
            candidate = safeTrim(
                parsed.data.url ||
                parsed.data.streamUrl ||
                parsed.data.link_m3u8 ||
                parsed.data.m3u8 ||
                parsed.data.link_embed ||
                parsed.data.embed ||
                ""
            );
        }
    } else if (typeof apiResponseJson === "string" && !looksLikeHtml(apiResponseJson)) {
        var trimmed = safeTrim(apiResponseJson);
        if (trimmed.indexOf("http://") === 0 || trimmed.indexOf("https://") === 0) {
            candidate = trimmed;
        }
    }

    return resolveStreamData(candidate);
}

function parseCategoriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var slug = safeTrim(entry.slug || entry.id || name);
        if (name && slug) {
            result.push({
                name: name,
                slug: slug
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseCountriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var value = safeTrim(entry.slug || entry.value || entry.id || name);
        if (name && value) {
            result.push({
                name: name,
                value: value
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseYearsResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        var val = "";
        var label = "";

        if (isPlainObject(entry)) {
            val = safeTrim(entry.slug || entry.value || entry.year || entry.name || "");
            label = safeTrim(entry.name || entry.year || val || "");
        } else if (typeof entry === "string" || typeof entry === "number") {
            val = safeTrim(entry);
            label = val;
        }

        if (val && label) {
            result.push({
                name: label,
                value: val
            });
        }
    }

    if (result.length === 0) {
        return getLocalYearsJson();
    }

    return safeStringify(result, "[]");
}
Điểm phòng thủ nổi bật khi nguồn dữ liệu gặp sự cố
Phát hiện HTML/trang lỗi (looksLikeHtml): Khi server trả về trang 404/502/503 hoặc trang chặn thay vì JSON, safeParseJson sẽ bỏ qua việc JSON.parse mù quáng và trả về fallback an toàn thay vì quăng lỗi cú pháp.

Trích xuất JSON linh hoạt khi bọc thêm text (safeParseJson): Nếu phản hồi có chuỗi dư trước/sau khối {...} hoặc [...], hàm tự cắt đúng đoạn JSON để parse.

Không crash khi danh sách/chi tiết thiếu trường: Bỏ qua phần tử hỏng (!isPlainObject(item)) thay vì làm gãy cả vòng lặp map như các bản thiếu kiểm tra kiểu.

Dự phòng năm phát hành (parseYearsResponse -> getLocalYearsJson): Nếu nguồn trả về rỗng hoặc lỗi khi lấy danh sách năm, tự động rơi về danh sách năm cục bộ để bộ lọc vẫn hoạt động bình thường.

getManifest thêm " "

JavaScript
function getManifest() {
    return safeStringify({
        id: "clbphimxua",
        name: "CLB Phim Xưa",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE",
        extra: " "
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE","extra":" "}');
}
Nếu bạn muốn đặt chuỗi " " vào một trường cụ thể khác trong getManifest() (ví dụ description: " ", userAgent: " ", hoặc đổi tên key), hãy cho mình biết tên trường đó để mình sửa đúng chỗ.

"id"

JavaScript
function getManifest() {
    return safeStringify({
        id: " ",
        name: "CLB Phim Xưa",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE"
    }, '{"id":" ","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE"}');
}
function getManifest() {

return safeStringify({

"id": "clbphimxua",

"name": "CLB Phim Xưa",

version: "1.0.1",

baseUrl: BASE_URL,

iconUrl: BASE_URL + "/favicon.ico",

isEnabled: true,

type: "MOVIE",

extra: " "

JavaScript
function getManifest() {
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE",
        extra: " "
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE","extra":" "}');
}
"version"

JavaScript
function getManifest() {
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": " ",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":" ","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE"}');
}
"baseUrl" "iconUrl" "isEnabled" "type" "extra"

JavaScript
function getManifest() {
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": " ",
        "iconUrl": " ",
        "isEnabled": " ",
        "type": " ",
        "extra": " "
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":" ","iconUrl":" ","isEnabled":" ","type":" ","extra":" "}');
}
function getManifest clbphimxua

JavaScript
function getManifest() {
    var baseUrl = (typeof BASE_URL === "string" && BASE_URL) ? BASE_URL : "https://clbphimxua.top";
    return JSON.stringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": baseUrl,
        "iconUrl": baseUrl + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    });
}
hoàn chỉnh code

Dưới đây là mã JavaScript ES5 chuẩn hoàn chỉnh cho plugin/adapter clbphimxua ([https://clbphimxua.top](https://clbphimxua.top)), tích hợp sẵn getManifest() cho clbphimxua và lớp phòng thủ chống lỗi khi không tải được dữ liệu nguồn.

Mã plugin ES5 hoàn chỉnh (clbphimxua.js)
JavaScript
var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

// =========================================================================
// 1. TIỆN ÍCH CƠ BẢN ES5
// =========================================================================
function safeTrim(val) {
    if (val === null || val === undefined) {
        return "";
    }
    return String(val).replace(/^\s+|\s+$/g, "");
}

function toInt(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var n = parseInt(val, 10);
    return isNaN(n) ? defVal : n;
}

function toFloat(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var f = parseFloat(val);
    return isNaN(f) ? defVal : f;
}

function isArraySafe(val) {
    if (typeof Array !== "undefined" && typeof Array.isArray === "function") {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isPlainObject(val) {
    return typeof val === "object" && val !== null && !isArraySafe(val);
}

function looksLikeHtml(str) {
    var s = safeTrim(str);
    if (!s) {
        return false;
    }
    return /^<!doctype html/i.test(s) || /^<html[\s>]/i.test(s) || /<(body|head|script|div|title)[\s>]/i.test(s);
}

// Parse JSON an toàn: hỗ trợ cả chuỗi JSON lẫn object/array đã truyền sẵn
function safeParseJson(input, fallback) {
    if (input === null || input === undefined) {
        return fallback;
    }
    if (isPlainObject(input) || isArraySafe(input)) {
        return input;
    }
    var raw = safeTrim(input);
    if (!raw || looksLikeHtml(raw)) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        var firstObj = raw.indexOf("{");
        var lastObj = raw.lastIndexOf("}");
        if (firstObj !== -1 && lastObj > firstObj) {
            try {
                return JSON.parse(raw.substring(firstObj, lastObj + 1));
            } catch (e2) {}
        }
        var firstArr = raw.indexOf("[");
        var lastArr = raw.lastIndexOf("]");
        if (firstArr !== -1 && lastArr > firstArr) {
            try {
                return JSON.parse(raw.substring(firstArr, lastArr + 1));
            } catch (e3) {}
        }
        return fallback;
    }
}

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
    }
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }
    if (isArraySafe(response)) {
        return response;
    }
    if (!isPlainObject(response)) {
        return [];
    }
    if (isArraySafe(response.items)) {
        return response.items;
    }
    if (isArraySafe(response.movies)) {
        return response.movies;
    }
    if (isArraySafe(response.results)) {
        return response.results;
    }
    if (isArraySafe(response.list)) {
        return response.list;
    }
    if (isArraySafe(response.data)) {
        return response.data;
    }
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) {
            return response.data.items;
        }
        if (isArraySafe(response.data.movies)) {
            return response.data.movies;
        }
        if (isArraySafe(response.data.results)) {
            return response.data.results;
        }
        if (isArraySafe(response.data.list)) {
            return response.data.list;
        }
    }
    return [];
}

function extractCdnDomain(response) {
    var candidates = [];
    if (isPlainObject(response)) {
        if (isPlainObject(response.data)) {
            candidates.push(response.data.cdnDomain);
            candidates.push(response.data.APP_DOMAIN_CDN_IMAGE);
            candidates.push(response.data.domain_cdn);
        }
        candidates.push(response.cdnDomain);
        candidates.push(response.APP_DOMAIN_CDN_IMAGE);
        candidates.push(response.domain_cdn);
    }

    var i;
    for (i = 0; i < candidates.length; i++) {
        var c = safeTrim(candidates[i]);
        if (c) {
            if (c.indexOf("http://") === 0 || c.indexOf("https://") === 0) {
                return c;
            }
            if (c.indexOf("//") === 0) {
                return "https:" + c;
            }
            return "https://" + c.replace(/^\/+/, "");
        }
    }
    return BASE_URL;
}

function buildMediaUrl(path, cdnDomain, fallbackPath) {
    var raw = safeTrim(path) || safeTrim(fallbackPath);
    if (!raw) {
        return "";
    }
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    if (raw.indexOf("//") === 0) {
        return "https:" + raw;
    }
    var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
    if (!base) {
        base = BASE_URL;
    }
    var cleanPath = raw.replace(/^\/+/, "");
    return base + "/" + cleanPath;
}

function stripHtmlToText(html) {
    if (!html) {
        return "";
    }
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");
}

function joinNamedList(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var parts = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var text = "";
        if (typeof item === "string") {
            text = safeTrim(item);
        } else if (isPlainObject(item)) {
            text = safeTrim(item.name || item.title || item.slug || "");
        }
        if (text && parts.join(", ").indexOf(text) === -1) {
            parts.push(text);
        }
    }
    return parts.join(", ");
}

function buildDefaultPagination(page, limit, totalItems, totalPages) {
    var safePage = toInt(page, 1);
    if (safePage < 1) {
        safePage = 1;
    }
    var safeLimit = toInt(limit, DEFAULT_LIMIT);
    if (safeLimit < 1) {
        safeLimit = DEFAULT_LIMIT;
    }
    var safeTotalItems = toInt(totalItems, 0);
    if (safeTotalItems < 0) {
        safeTotalItems = 0;
    }
    var calcPages = Math.max(1, Math.ceil(safeTotalItems / safeLimit));
    var safeTotalPages = toInt(totalPages, calcPages);
    if (safeTotalPages < 1) {
        safeTotalPages = 1;
    }

    return {
        currentPage: safePage,
        totalPages: safeTotalPages,
        totalItems: safeTotalItems,
        itemsPerPage: safeLimit
    };
}

// =========================================================================
// 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
// =========================================================================
function getManifest() {
    var baseUrl = safeTrim(BASE_URL) || "https://clbphimxua.top";
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": baseUrl,
        "iconUrl": baseUrl + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","iconUrl":"https://clbphimxua.top/favicon.ico","isEnabled":true,"type":"MOVIE"}');
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" },
            { name: "Tên phim", value: "name" }
        ]
    }, '{"sort":[]}');
}

// =========================================================================
// 3. TẠO URL AN TOÀN
// =========================================================================
function getUrlList(slug, filtersJson) {
    var cleanSlug = safeTrim(slug) || "phim-moi-cap-nhat";
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    var url = BASE_URL + "/api/danh-sach/" + encodeURIComponent(cleanSlug) +
        "?page=" + page + "&limit=" + limit;

    if (safeTrim(filters.category)) {
        url += "&category=" + encodeURIComponent(safeTrim(filters.category));
    }
    if (safeTrim(filters.country)) {
        url += "&country=" + encodeURIComponent(safeTrim(filters.country));
    }
    if (safeTrim(filters.year)) {
        url += "&year=" + encodeURIComponent(safeTrim(filters.year));
    }
    if (safeTrim(filters.sort)) {
        url += "&sort=" + encodeURIComponent(safeTrim(filters.sort));
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var cleanKeyword = safeTrim(keyword);
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
        "&page=" + page + "&limit=" + limit;
}

function getUrlDetail(slug) {
    var cleanSlug = safeTrim(slug);
    if (!cleanSlug) {
        return BASE_URL + "/api/phim";
    }
    return BASE_URL + "/api/phim/" + encodeURIComponent(cleanSlug);
}

function getUrlCategories() {
    return BASE_URL + "/api/the-loai";
}

function getUrlCountries() {
    return BASE_URL + "/api/quoc-gia";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var nowYear = new Date().getFullYear();
    var endYear = (typeof nowYear === "number" && !isNaN(nowYear) && nowYear >= 1950) ? nowYear : 2026;
    var years = [];
    var y;
    for (y = endYear; y >= 1950; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }
    return safeStringify(years, "[]");
}

// =========================================================================
// 4. PARSER & STREAM RESOLVER CHỐNG LỖI DỮ LIỆU NGUỒN
// =========================================================================
function parseListResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed) {
        return safeStringify({
            items: [],
            pagination: buildDefaultPagination(1, DEFAULT_LIMIT, 0, 1)
        }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
    }

    var rawItems = extractArrayItems(parsed);
    var cdnDomain = extractCdnDomain(parsed);
    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : {};
    var paramsObj = isPlainObject(dataObj.params) ? dataObj.params : {};

    var pagination = null;
    if (isPlainObject(parsed) && isPlainObject(parsed.pagination)) {
        pagination = parsed.pagination;
    } else if (isPlainObject(dataObj.pagination)) {
        pagination = dataObj.pagination;
    } else if (isPlainObject(paramsObj.pagination)) {
        pagination = paramsObj.pagination;
    } else {
        pagination = {};
    }

    var currentPage = toInt(pagination.currentPage || pagination.page, 1);
    var itemsPerPage = toInt(
        pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
        DEFAULT_LIMIT
    );
    var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
    var totalPages = toInt(pagination.totalPages || pagination.lastPage, 0);

    var movies = [];
    var i;
    for (i = 0; i < rawItems.length; i++) {
        var item = rawItems[i];
        if (!isPlainObject(item)) {
            continue;
        }
        var movieId = safeTrim(item.slug || item.id || item._id || "");
        var title = safeTrim(item.name || item.title || item.origin_name || "");
        if (!movieId && !title) {
            continue;
        }

        var posterRaw = item.poster_url || item.posterUrl || item.poster || item.thumb_url || item.thumb || "";
        var backdropRaw = item.thumb_url || item.backdrop_url || item.backdropUrl || item.poster_url || "";

        movies.push({
            id: movieId || title,
            title: title || movieId,
            posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
            backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || item.episodeCurrent || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return safeStringify({
        items: movies,
        pagination: buildDefaultPagination(currentPage, itemsPerPage, totalItems, totalPages)
    }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed || (!isPlainObject(parsed) && !isArraySafe(parsed))) {
        return "null";
    }

    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : parsed;
    var movie = null;
    if (isPlainObject(dataObj)) {
        if (isPlainObject(dataObj.movie)) {
            movie = dataObj.movie;
        } else if (isPlainObject(dataObj.item)) {
            movie = dataObj.item;
        } else if (dataObj.name || dataObj.title || dataObj.slug) {
            movie = dataObj;
        }
    }

    if (!movie) {
        return "null";
    }

    var cdnDomain = extractCdnDomain(parsed);
    var episodesRaw = [];
    if (isPlainObject(dataObj) && isArraySafe(dataObj.episodes)) {
        episodesRaw = dataObj.episodes;
    } else if (isPlainObject(parsed) && isArraySafe(parsed.episodes)) {
        episodesRaw = parsed.episodes;
    } else if (isArraySafe(movie.episodes)) {
        episodesRaw = movie.episodes;
    }

    var servers = [];
    var i;
    for (i = 0; i < episodesRaw.length; i++) {
        var srv = episodesRaw[i];
        if (!isPlainObject(srv)) {
            continue;
        }
        var srvData = isArraySafe(srv.server_data)
            ? srv.server_data
            : (isArraySafe(srv.episodes) ? srv.episodes : []);

        var serverEpisodes = [];
        var j;
        for (j = 0; j < srvData.length; j++) {
            var ep = srvData[j];
            if (!isPlainObject(ep)) {
                continue;
            }
            var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
            var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
            var directUrl = safeTrim(ep.url || ep.link || "");
            var streamUrl = m3u8Url || embedUrl || directUrl;

            if (streamUrl) {
                serverEpisodes.push({
                    id: streamUrl,
                    name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                    slug: safeTrim(ep.slug || ""),
                    m3u8: m3u8Url,
                    embed: embedUrl
                });
            }
        }

        if (serverEpisodes.length > 0) {
            servers.push({
                name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
                episodes: serverEpisodes
            });
        }
    }

    var ratingValue = 0;
    var tmdbId = "";
    var tmdbSeason = 0;
    var tmdbType = "";

    if (isPlainObject(movie.tmdb)) {
        ratingValue = toFloat(movie.tmdb.vote_average, 0);
        if (movie.tmdb.id !== null && movie.tmdb.id !== undefined) {
            tmdbId = safeTrim(movie.tmdb.id);
        }
        tmdbSeason = toInt(movie.tmdb.season, 0);
        if (movie.tmdb.type !== null && movie.tmdb.type !== undefined) {
            tmdbType = safeTrim(movie.tmdb.type);
        }
    } else if (movie.rating !== null && movie.rating !== undefined) {
        ratingValue = toFloat(movie.rating, 0);
    }

    var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
    var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";
    var movieId = safeTrim(movie.slug || movie.id || movie._id || "");
    var movieTitle = safeTrim(movie.name || movie.title || movie.origin_name || "");

    if (!movieId && !movieTitle && servers.length === 0) {
        return "null";
    }

    return safeStringify({
        id: movieId || movieTitle,
        title: movieTitle || movieId,
        originName: safeTrim(movie.origin_name || movie.originName || ""),
        posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
        backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
        description: stripHtmlToText(movie.content || movie.description || ""),
        year: toInt(movie.year, 0),
        rating: ratingValue,
        quality: safeTrim(movie.quality || ""),
        duration: safeTrim(movie.time || movie.duration || ""),
        servers: servers,
        episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
        lang: safeTrim(movie.lang || ""),
        category: joinNamedList(movie.category || movie.categories),
        country: joinNamedList(movie.country || movie.countries),
        director: joinNamedList(movie.director || movie.directors),
        casts: joinNamedList(movie.actor || movie.actors || movie.casts),
        status: safeTrim(movie.status || ""),
        tmdbId: tmdbId,
        tmdbSeason: tmdbSeason,
        tmdbType: tmdbType
    }, "null");
}

function resolveStreamData(streamInput) {
    var raw = safeTrim(streamInput);
    if (looksLikeHtml(raw)) {
        raw = "";
    }
    var isDirect = raw.length > 0 && (/\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw));
    return safeStringify({
        url: raw,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    }, '{"url":"","isDirectStream":false,"headers":{},"subtitles":[]}');
}

function parseDetailResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    var candidate = "";

    if (isPlainObject(parsed)) {
        candidate = safeTrim(
            parsed.url ||
            parsed.streamUrl ||
            parsed.link_m3u8 ||
            parsed.m3u8 ||
            parsed.link_embed ||
            parsed.embed ||
            ""
        );
        if (!candidate && isPlainObject(parsed.data)) {
            candidate = safeTrim(
                parsed.data.url ||
                parsed.data.streamUrl ||
                parsed.data.link_m3u8 ||
                parsed.data.m3u8 ||
                parsed.data.link_embed ||
                parsed.data.embed ||
                ""
            );
        }
    } else if (typeof apiResponseJson === "string" && !looksLikeHtml(apiResponseJson)) {
        var trimmed = safeTrim(apiResponseJson);
        if (trimmed.indexOf("http://") === 0 || trimmed.indexOf("https://") === 0) {
            candidate = trimmed;
        }
    }

    return resolveStreamData(candidate);
}

function parseCategoriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var slug = safeTrim(entry.slug || entry.id || name);
        if (name && slug) {
            result.push({
                name: name,
                slug: slug
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseCountriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var value = safeTrim(entry.slug || entry.value || entry.id || name);
        if (name && value) {
            result.push({
                name: name,
                value: value
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseYearsResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        var val = "";
        var label = "";

        if (isPlainObject(entry)) {
            val = safeTrim(entry.slug || entry.value || entry.year || entry.name || "");
            label = safeTrim(entry.name || entry.year || val || "");
        } else if (typeof entry === "string" || typeof entry === "number") {
            val = safeTrim(entry);
            label = val;
        }

        if (val && label) {
            result.push({
                name: label,
                value: val
            });
        }
    }

    if (result.length === 0) {
        return getLocalYearsJson();
    }

    return safeStringify(result, "[]");
}
không tải được dữ liệu nguồn

Khi app báo không tải được dữ liệu nguồn ([https://clbphimxua.top](https://clbphimxua.top)), nguyên nhân thường nằm ở mạng/endpoint/chặn truy cập phía máy chủ nguồn (không phải do đoạn JSON.parse của JS), hoặc do đường dẫn API chưa khớp với endpoint thật của trang.

1. Các nguyên nhân phổ biến nhất khiến nguồn không tải được
Sai endpoint thật của trang: Các hàm getUrlList, getUrlSearch, getUrlDetail, getUrlCategories, getUrlCountries hiện đang trỏ tới /api/.... Nếu clbphimxua.top không có JSON API theo đường dẫn đó (hoặc dùng đường dẫn khác như /v1/api/..., /ajax/..., hoặc chỉ trả về trang HTML), request sẽ trả về 404 hoặc trang HTML thay vì dữ liệu JSON.

Bị chặn ở tầng mạng / WAF / Cloudflare / Geo-block: Nguồn có thể chặn request từ IP máy chủ/TV/app, thiếu User-Agent hoặc Referer hợp lệ, hoặc yêu cầu cookie/challenge.

Lỗi SSL / DNS / Timeout: Tên miền đổi host, hết hạn chứng chỉ, phản hồi chậm quá timeout của app, hoặc mạng hiện tại không phân giải được domain.

App tự tải dữ liệu trước khi gọi parse*Response: Nếu tầng native (Kotlin/Java) tải thất bại (trả về rỗng, null, hoặc chuỗi lỗi), thì dù parseListResponse có chống crash đến đâu, giao diện vẫn sẽ hiển thị trống hoặc báo không tải được dữ liệu.

2. Cách kiểm tra nhanh để xác định đúng điểm nghẽn
In ra URL mà app đang gọi từ getUrlList(...), getUrlSearch(...), getUrlDetail(...) rồi mở trực tiếp trên trình duyệt hoặc curl để xem thực tế trả về 200 OK (JSON) hay 404 / HTML / lỗi mạng.

Kiểm tra response thô (raw response) nhận được ở tầng native trước khi đưa vào parseListResponse / parseMovieDetail:

Nếu raw rỗng / null / lỗi HTTP (403, 404, 500, 502, 522...) hoặc trả về trang HTML → lỗi nằm ở nguồn hoặc cấu hình request/URL, không phải lỗi parser.

Nếu raw là JSON hợp lệ nhưng danh sách vẫn rỗng → kiểm tra tên trường mảng (items, data, movies...) hoặc tên trường phân trang.

3. Bổ sung helper chẩn đoán lỗi nguồn (ES5 thuần)
Nếu app hỗ trợ thêm hàm kiểm tra/chẩn đoán hoặc bạn muốn log rõ lý do khi dữ liệu đầu vào rỗng/HTML/lỗi, có thể thêm hàm diagnoseSourceResponse(rawInput) sau vào file ES5:

JavaScript
function diagnoseSourceResponse(rawInput) {
    if (rawInput === null || rawInput === undefined) {
        return safeStringify({
            ok: false,
            reason: "EMPTY_INPUT",
            message: "Dữ liệu nguồn trả về null hoặc undefined"
        }, '{"ok":false,"reason":"EMPTY_INPUT"}');
    }

    if (isPlainObject(rawInput) || isArraySafe(rawInput)) {
        var count = extractArrayItems(rawInput).length;
        return safeStringify({
            ok: true,
            reason: "OBJECT_INPUT",
            itemCount: count
        }, '{"ok":true,"reason":"OBJECT_INPUT"}');
    }

    var text = safeTrim(rawInput);
    if (!text) {
        return safeStringify({
            ok: false,
            reason: "BLANK_RESPONSE",
            message: "Phản hồi từ nguồn rỗng"
        }, '{"ok":false,"reason":"BLANK_RESPONSE"}');
    }

    if (looksLikeHtml(text)) {
        return safeStringify({
            ok: false,
            reason: "HTML_INSTEAD_OF_JSON",
            message: "Nguồn trả về HTML thay vì JSON (có thể sai URL, lỗi 404/5xx hoặc bị chặn)"
        }, '{"ok":false,"reason":"HTML_INSTEAD_OF_JSON"}');
    }

    var parsed = safeParseJson(text, null);
    if (!parsed) {
        return safeStringify({
            ok: false,
            reason: "INVALID_JSON",
            message: "Không phân tích được JSON từ dữ liệu nguồn"
        }, '{"ok":false,"reason":"INVALID_JSON"}');
    }

    return safeStringify({
        ok: true,
        reason: "VALID_JSON",
        itemCount: extractArrayItems(parsed).length
    }, '{"ok":true,"reason":"VALID_JSON"}');
}
Nếu bạn dán một đoạn log lỗi / HTTP status / mẫu phản hồi từ app hoặc cho biết URL/endpoint thật của clbphimxua.top, mình sẽ chỉ ra chính xác lỗi ở đâu và chỉnh lại code cho khớp.

code hoàn chỉnh tránh lỗi không tải được dữ liệu nguồn

Dưới đây là mã JavaScript ES5 chuẩn hoàn chỉnh cho plugin/adapter clbphimxua ([https://clbphimxua.top](https://clbphimxua.top)), bổ sung cơ chế dự phòng URL (getUrlListFallback, getUrlSearchFallback, getUrlDetailFallback, getUrlCategoriesFallback, getUrlCountriesFallback) để khi đường dẫn API mặc định không tải được hoặc trả về lỗi/HTML, host có thể tự thử lần lượt các đường dẫn thay thế phổ biến, kết hợp với bộ parser chống lỗi đầu vào.

Mã hoàn chỉnh ES5 chuẩn (clbphimxua-complete-es5.js)
JavaScript
var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

// =========================================================================
// 1. HÀM TIỆN ÍCH CƠ BẢN ES5
// =========================================================================
function safeTrim(val) {
    if (val === null || val === undefined) {
        return "";
    }
    return String(val).replace(/^\s+|\s+$/g, "");
}

function toInt(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var n = parseInt(val, 10);
    return isNaN(n) ? defVal : n;
}

function toFloat(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var f = parseFloat(val);
    return isNaN(f) ? defVal : f;
}

function isArraySafe(val) {
    if (typeof Array !== "undefined" && typeof Array.isArray === "function") {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isPlainObject(val) {
    return typeof val === "object" && val !== null && !isArraySafe(val);
}

function looksLikeHtml(str) {
    var s = safeTrim(str);
    if (!s) {
        return false;
    }
    return /^<!doctype html/i.test(s) || /^<html[\s>]/i.test(s) || /<(body|head|script|div|title|form)[\s>]/i.test(s);
}

function safeParseJson(input, fallback) {
    if (input === null || input === undefined) {
        return fallback;
    }
    if (isPlainObject(input) || isArraySafe(input)) {
        return input;
    }
    var raw = safeTrim(input);
    if (!raw || looksLikeHtml(raw)) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        var firstObj = raw.indexOf("{");
        var lastObj = raw.lastIndexOf("}");
        if (firstObj !== -1 && lastObj > firstObj) {
            try {
                return JSON.parse(raw.substring(firstObj, lastObj + 1));
            } catch (e2) {}
        }
        var firstArr = raw.indexOf("[");
        var lastArr = raw.lastIndexOf("]");
        if (firstArr !== -1 && lastArr > firstArr) {
            try {
                return JSON.parse(raw.substring(firstArr, lastArr + 1));
            } catch (e3) {}
        }
        return fallback;
    }
}

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
    }
}

function normalizeFilters(filtersJson) {
    var parsed = safeParseJson(filtersJson, {});
    var obj = isPlainObject(parsed) ? parsed : {};
    var page = toInt(obj.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(obj.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }
    return {
        page: page,
        limit: limit,
        category: safeTrim(obj.category),
        country: safeTrim(obj.country),
        year: safeTrim(obj.year),
        sort: safeTrim(obj.sort)
    };
}

function appendFilterQuery(baseUrl, filters, includePageAndLimit) {
    var url = baseUrl;
    var sep = (url.indexOf("?") === -1) ? "?" : "&";

    if (includePageAndLimit) {
        url += sep + "page=" + filters.page + "&limit=" + filters.limit;
        sep = "&";
    }
    if (filters.category) {
        url += sep + "category=" + encodeURIComponent(filters.category);
        sep = "&";
    }
    if (filters.country) {
        url += sep + "country=" + encodeURIComponent(filters.country);
        sep = "&";
    }
    if (filters.year) {
        url += sep + "year=" + encodeURIComponent(filters.year);
        sep = "&";
    }
    if (filters.sort) {
        url += sep + "sort=" + encodeURIComponent(filters.sort);
        sep = "&";
    }
    return url;
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }
    if (isArraySafe(response)) {
        return response;
    }
    if (!isPlainObject(response)) {
        return [];
    }
    if (isArraySafe(response.items)) {
        return response.items;
    }
    if (isArraySafe(response.movies)) {
        return response.movies;
    }
    if (isArraySafe(response.results)) {
        return response.results;
    }
    if (isArraySafe(response.list)) {
        return response.list;
    }
    if (isArraySafe(response.data)) {
        return response.data;
    }
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) {
            return response.data.items;
        }
        if (isArraySafe(response.data.movies)) {
            return response.data.movies;
        }
        if (isArraySafe(response.data.results)) {
            return response.data.results;
        }
        if (isArraySafe(response.data.list)) {
            return response.data.list;
        }
    }
    return [];
}

function extractCdnDomain(response) {
    var candidates = [];
    if (isPlainObject(response)) {
        if (isPlainObject(response.data)) {
            candidates.push(response.data.cdnDomain);
            candidates.push(response.data.APP_DOMAIN_CDN_IMAGE);
            candidates.push(response.data.domain_cdn);
        }
        candidates.push(response.cdnDomain);
        candidates.push(response.APP_DOMAIN_CDN_IMAGE);
        candidates.push(response.domain_cdn);
    }

    var i;
    for (i = 0; i < candidates.length; i++) {
        var c = safeTrim(candidates[i]);
        if (c) {
            if (c.indexOf("http://") === 0 || c.indexOf("https://") === 0) {
                return c;
            }
            if (c.indexOf("//") === 0) {
                return "https:" + c;
            }
            return "https://" + c.replace(/^\/+/, "");
        }
    }
    return BASE_URL;
}

function buildMediaUrl(path, cdnDomain, fallbackPath) {
    var raw = safeTrim(path) || safeTrim(fallbackPath);
    if (!raw) {
        return "";
    }
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    if (raw.indexOf("//") === 0) {
        return "https:" + raw;
    }
    var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
    if (!base) {
        base = BASE_URL;
    }
    var cleanPath = raw.replace(/^\/+/, "");
    return base + "/" + cleanPath;
}

function stripHtmlToText(html) {
    if (!html) {
        return "";
    }
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");
}

function joinNamedList(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var parts = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var text = "";
        if (typeof item === "string") {
            text = safeTrim(item);
        } else if (isPlainObject(item)) {
            text = safeTrim(item.name || item.title || item.slug || "");
        }
        if (text && parts.join(", ").indexOf(text) === -1) {
            parts.push(text);
        }
    }
    return parts.join(", ");
}

function buildDefaultPagination(page, limit, totalItems, totalPages) {
    var safePage = toInt(page, 1);
    if (safePage < 1) {
        safePage = 1;
    }
    var safeLimit = toInt(limit, DEFAULT_LIMIT);
    if (safeLimit < 1) {
        safeLimit = DEFAULT_LIMIT;
    }
    var safeTotalItems = toInt(totalItems, 0);
    if (safeTotalItems < 0) {
        safeTotalItems = 0;
    }
    var calcPages = Math.max(1, Math.ceil(safeTotalItems / safeLimit));
    var safeTotalPages = toInt(totalPages, calcPages);
    if (safeTotalPages < 1) {
        safeTotalPages = 1;
    }

    return {
        currentPage: safePage,
        totalPages: safeTotalPages,
        totalItems: safeTotalItems,
        itemsPerPage: safeLimit
    };
}

// =========================================================================
// 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
// =========================================================================
function getManifest() {
    var baseUrl = safeTrim(BASE_URL) || "https://clbphimxua.top";
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.2",
        "baseUrl": baseUrl,
        "iconUrl": baseUrl + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.2","baseUrl":"https://clbphimxua.top","iconUrl":"https://clbphimxua.top/favicon.ico","isEnabled":true,"type":"MOVIE"}');
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" },
            { name: "Tên phim", value: "name" }
        ]
    }, '{"sort":[]}');
}

// =========================================================================
// 3. TẠO URL CHÍNH & DANH SÁCH URL DỰ PHÒNG (FALLBACK)
// =========================================================================
function getUrlListFallback(slug, filtersJson) {
    var cleanSlug = safeTrim(slug) || "phim-moi-cap-nhat";
    var filters = normalizeFilters(filtersJson);
    var encSlug = encodeURIComponent(cleanSlug);

    var candidates = [
        appendFilterQuery(BASE_URL + "/api/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/v1/api/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/api/v1/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/api/phim?type=" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/danh-sach/" + encSlug, filters, true)
    ];

    return safeStringify(candidates, "[]");
}

function getUrlList(slug, filtersJson) {
    var list = safeParseJson(getUrlListFallback(slug, filtersJson), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/danh-sach/phim-moi-cap-nhat?page=1&limit=24");
}

function getUrlSearchFallback(keyword, filtersJson) {
    var cleanKeyword = safeTrim(keyword);
    var filters = normalizeFilters(filtersJson);
    var encQ = encodeURIComponent(cleanKeyword);

    var candidates = [
        appendFilterQuery(BASE_URL + "/api/tim-kiem?keyword=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/v1/api/tim-kiem?keyword=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/api/search?q=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/tim-kiem?keyword=" + encQ, filters, true)
    ];

    return safeStringify(candidates, "[]");
}

function getUrlSearch(keyword, filtersJson) {
    var list = safeParseJson(getUrlSearchFallback(keyword, filtersJson), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/tim-kiem?keyword=&page=1&limit=24");
}

function getUrlDetailFallback(slug) {
    var cleanSlug = safeTrim(slug);
    var encSlug = encodeURIComponent(cleanSlug);
    var candidates = [
        BASE_URL + "/api/phim/" + encSlug,
        BASE_URL + "/v1/api/phim/" + encSlug,
        BASE_URL + "/api/chi-tiet/" + encSlug,
        BASE_URL + "/phim/" + encSlug
    ];
    return safeStringify(candidates, "[]");
}

function getUrlDetail(slug) {
    var cleanSlug = safeTrim(slug);
    if (!cleanSlug) {
        return BASE_URL + "/api/phim";
    }
    var list = safeParseJson(getUrlDetailFallback(cleanSlug), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/phim/" + encodeURIComponent(cleanSlug));
}

function getUrlCategoriesFallback() {
    return safeStringify([
        BASE_URL + "/api/the-loai",
        BASE_URL + "/v1/api/the-loai",
        BASE_URL + "/api/categories",
        BASE_URL + "/the-loai"
    ], "[]");
}

function getUrlCategories() {
    var list = safeParseJson(getUrlCategoriesFallback(), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/the-loai");
}

function getUrlCountriesFallback() {
    return safeStringify([
        BASE_URL + "/api/quoc-gia",
        BASE_URL + "/v1/api/quoc-gia",
        BASE_URL + "/api/countries",
        BASE_URL + "/quoc-gia"
    ], "[]");
}

function getUrlCountries() {
    var list = safeParseJson(getUrlCountriesFallback(), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/quoc-gia");
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var nowYear = new Date().getFullYear();
    var endYear = (typeof nowYear === "number" && !isNaN(nowYear) && nowYear >= 1950) ? nowYear : 2026;
    var years = [];
    var y;
    for (y = endYear; y >= 1950; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }
    return safeStringify(years, "[]");
}

// =========================================================================
// 4. CHẨN ĐOÁN NGUỒN & PARSER CHỐNG LỖI
// =========================================================================
function diagnoseSourceResponse(rawInput) {
    if (rawInput === null || rawInput === undefined) {
        return safeStringify({
            ok: false,
            code: "EMPTY_INPUT",
            message: "Dữ liệu nguồn null hoặc undefined"
        }, '{"ok":false,"code":"EMPTY_INPUT"}');
    }

    if (isPlainObject(rawInput) || isArraySafe(rawInput)) {
        return safeStringify({
            ok: true,
            code: "OBJECT_INPUT",
            count: extractArrayItems(rawInput).length
        }, '{"ok":true,"code":"OBJECT_INPUT"}');
    }

    var text = safeTrim(rawInput);
    if (!text) {
        return safeStringify({
            ok: false,
            code: "BLANK_RESPONSE",
            message: "Phản hồi nguồn rỗng"
        }, '{"ok":false,"code":"BLANK_RESPONSE"}');
    }

    if (looksLikeHtml(text)) {
        return safeStringify({
            ok: false,
            code: "HTML_RESPONSE",
            message: "Nguồn trả về HTML thay vì JSON"
        }, '{"ok":false,"code":"HTML_RESPONSE"}');
    }

    var parsed = safeParseJson(text, null);
    if (!parsed) {
        return safeStringify({
            ok: false,
            code: "INVALID_JSON",
            message: "Không đọc được cấu trúc JSON"
        }, '{"ok":false,"code":"INVALID_JSON"}');
    }

    return safeStringify({
        ok: true,
        code: "VALID_JSON",
        count: extractArrayItems(parsed).length
    }, '{"ok":true,"code":"VALID_JSON"}');
}

function parseListResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed) {
        return safeStringify({
            items: [],
            pagination: buildDefaultPagination(1, DEFAULT_LIMIT, 0, 1)
        }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
    }

    var rawItems = extractArrayItems(parsed);
    var cdnDomain = extractCdnDomain(parsed);
    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : {};
    var paramsObj = isPlainObject(dataObj.params) ? dataObj.params : {};

    var pagination = {};
    if (isPlainObject(parsed) && isPlainObject(parsed.pagination)) {
        pagination = parsed.pagination;
    } else if (isPlainObject(dataObj.pagination)) {
        pagination = dataObj.pagination;
    } else if (isPlainObject(paramsObj.pagination)) {
        pagination = paramsObj.pagination;
    }

    var currentPage = toInt(pagination.currentPage || pagination.page, 1);
    var itemsPerPage = toInt(
        pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
        DEFAULT_LIMIT
    );
    var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
    var totalPages = toInt(pagination.totalPages || pagination.lastPage, 0);

    var movies = [];
    var i;
    for (i = 0; i < rawItems.length; i++) {
        var item = rawItems[i];
        if (!isPlainObject(item)) {
            continue;
        }
        var movieId = safeTrim(item.slug || item.id || item._id || "");
        var title = safeTrim(item.name || item.title || item.origin_name || "");
        if (!movieId && !title) {
            continue;
        }

        var posterRaw = item.poster_url || item.posterUrl || item.poster || item.thumb_url || item.thumb || "";
        var backdropRaw = item.thumb_url || item.backdrop_url || item.backdropUrl || item.poster_url || "";

        movies.push({
            id: movieId || title,
            title: title || movieId,
            posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
            backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || item.episodeCurrent || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return safeStringify({
        items: movies,
        pagination: buildDefaultPagination(currentPage, itemsPerPage, totalItems, totalPages)
    }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed || (!isPlainObject(parsed) && !isArraySafe(parsed))) {
        return "null";
    }

    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : parsed;
    var movie = null;
    if (isPlainObject(dataObj)) {
        if (isPlainObject(dataObj.movie)) {
            movie = dataObj.movie;
        } else if (isPlainObject(dataObj.item)) {
            movie = dataObj.item;
        } else if (dataObj.name || dataObj.title || dataObj.slug) {
            movie = dataObj;
        }
    }

    if (!movie) {
        return "null";
    }

    var cdnDomain = extractCdnDomain(parsed);
    var episodesRaw = [];
    if (isPlainObject(dataObj) && isArraySafe(dataObj.episodes)) {
        episodesRaw = dataObj.episodes;
    } else if (isPlainObject(parsed) && isArraySafe(parsed.episodes)) {
        episodesRaw = parsed.episodes;
    } else if (isArraySafe(movie.episodes)) {
        episodesRaw = movie.episodes;
    }

    var servers = [];
    var i;
    for (i = 0; i < episodesRaw.length; i++) {
        var srv = episodesRaw[i];
        if (!isPlainObject(srv)) {
            continue;
        }
        var srvData = isArraySafe(srv.server_data)
            ? srv.server_data
            : (isArraySafe(srv.episodes) ? srv.episodes : []);

        var serverEpisodes = [];
        var j;
        for (j = 0; j < srvData.length; j++) {
            var ep = srvData[j];
            if (!isPlainObject(ep)) {
                continue;
            }
            var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
            var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
            var directUrl = safeTrim(ep.url || ep.link || "");
            var streamUrl = m3u8Url || embedUrl || directUrl;

            if (streamUrl) {
                serverEpisodes.push({
                    id: streamUrl,
                    name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                    slug: safeTrim(ep.slug || ""),
                    m3u8: m3u8Url,
                    embed: embedUrl
                });
            }
        }

        if (serverEpisodes.length > 0) {
            servers.push({
                name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
                episodes: serverEpisodes
            });
        }
    }

    var ratingValue = 0;
    var tmdbId = "";
    var tmdbSeason = 0;
    var tmdbType = "";

    if (isPlainObject(movie.tmdb)) {
        ratingValue = toFloat(movie.tmdb.vote_average, 0);
        if (movie.tmdb.id !== null && movie.tmdb.id !== undefined) {
            tmdbId = safeTrim(movie.tmdb.id);
        }
        tmdbSeason = toInt(movie.tmdb.season, 0);
        if (movie.tmdb.type !== null && movie.tmdb.type !== undefined) {
            tmdbType = safeTrim(movie.tmdb.type);
        }
    } else if (movie.rating !== null && movie.rating !== undefined) {
        ratingValue = toFloat(movie.rating, 0);
    }

    var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
    var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";
    var movieId = safeTrim(movie.slug || movie.id || movie._id || "");
    var movieTitle = safeTrim(movie.name || movie.title || movie.origin_name || "");

    if (!movieId && !movieTitle && servers.length === 0) {
        return "null";
    }

    return safeStringify({
        id: movieId || movieTitle,
        title: movieTitle || movieId,
        originName: safeTrim(movie.origin_name || movie.originName || ""),
        posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
        backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
        description: stripHtmlToText(movie.content || movie.description || ""),
        year: toInt(movie.year, 0),
        rating: ratingValue,
        quality: safeTrim(movie.quality || ""),
        duration: safeTrim(movie.time || movie.duration || ""),
        servers: servers,
        episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
        lang: safeTrim(movie.lang || ""),
        category: joinNamedList(movie.category || movie.categories),
        country: joinNamedList(movie.country || movie.countries),
        director: joinNamedList(movie.director || movie.directors),
        casts: joinNamedList(movie.actor || movie.actors || movie.casts),
        status: safeTrim(movie.status || ""),
        tmdbId: tmdbId,
        tmdbSeason: tmdbSeason,
        tmdbType: tmdbType
    }, "null");
}


Trò chuyện với Gemini
code JavaScript es5 https://clbphimxua.top/

Mình không thể truy cập trực tiếp vào [https://clbphimxua.top/](https://clbphimxua.top/) để đọc mã nguồn trang hiện tại (do trang chặn truy cập/không có sẵn qua công cụ duyệt). Tuy nhiên, dựa trên loại website phim/giải trí (clbphimxua), dưới đây là bộ JavaScript chuẩn ES5 (var, function () {}, tương thích tốt với các trình duyệt cũ, Smart TV/WebView cũ) cho các tính năng phổ biến trên trang xem phim:

Chuyển tập / Lưu tiến độ xem (dùng localStorage kèm fallback an toàn).

Tìm kiếm / Lọc danh sách phim theo từ khóa.

Nút cuộn lên đầu trang & thông báo trạng thái giao diện thuần ES5.

Mã JavaScript ES5 mẫu cho trang xem phim
JavaScript
(function () {
    "use strict";

    // 1. Helper lưu/đọc localStorage an toàn cho ES5
    function saveProgress(movieId, episodeIndex) {
        try {
            if (window.localStorage) {
                var raw = window.localStorage.getItem("clbpx_progress");
                var data = raw ? JSON.parse(raw) : {};
                data[String(movieId)] = {
                    episode: episodeIndex,
                    updatedAt: new Date().getTime()
                };
                window.localStorage.setItem("clbpx_progress", JSON.stringify(data));
            }
        } catch (e) {
            // Bỏ qua nếu trình duyệt chặn storage hoặc chế độ ẩn danh
        }
    }

    function getProgress(movieId) {
        try {
            if (window.localStorage) {
                var raw = window.localStorage.getItem("clbpx_progress");
                var data = raw ? JSON.parse(raw) : {};
                return data[String(movieId)] || null;
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    // 2. Xử lý danh sách tập phim (data-episode, data-src)
    function initEpisodeSwitcher(options) {
        options = options || {};
        var movieId = options.movieId || "default_movie";
        var listSelector = options.listSelector || ".episode-list";
        var playerSelector = options.playerSelector || "#video-player";

        var listEl = document.querySelector(listSelector);
        var playerEl = document.querySelector(playerSelector);
        if (!listEl || !playerEl) {
            return;
        }

        var items = listEl.querySelectorAll("[data-episode]");
        var i;

        function setActiveItem(index) {
            var idx = parseInt(index, 10);
            if (isNaN(idx) || idx < 0 || idx >= items.length) {
                return;
            }
            for (var j = 0; j < items.length; j++) {
                items[j].className = items[j].className.replace(/\bactive\b/g, "").replace(/\s+/g, " ").trim();
            }
            var target = items[idx];
            if (target.className.indexOf("active") === -1) {
                target.className = (target.className + " active").trim();
            }

            var videoUrl = target.getAttribute("data-src");
            if (videoUrl) {
                if (playerEl.tagName && playerEl.tagName.toLowerCase() === "iframe") {
                    playerEl.src = videoUrl;
                } else {
                    playerEl.setAttribute("src", videoUrl);
                    if (typeof playerEl.load === "function") {
                        playerEl.load();
                    }
                }
            }
            saveProgress(movieId, idx);
        }

        for (i = 0; i < items.length; i++) {
            (function (boundIndex) {
                var el = items[boundIndex];
                var handler = function (evt) {
                    if (evt && evt.preventDefault) {
                        evt.preventDefault();
                    }
                    setActiveItem(boundIndex);
                };
                if (el.addEventListener) {
                    el.addEventListener("click", handler, false);
                } else if (el.attachEvent) {
                    el.attachEvent("onclick", handler);
                }
            })(i);
        }

        // Khôi phục tập đã xem gần nhất nếu có
        var saved = getProgress(movieId);
        if (saved && typeof saved.episode === "number") {
            setActiveItem(saved.episode);
        }
    }

    // 3. Lọc danh sách phim theo từ khóa (không dấu / có dấu cơ bản)
    function normalizeText(str) {
        return String(str || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initMovieFilter(inputSelector, cardSelector) {
        var inputEl = document.querySelector(inputSelector || "#search-movie");
        var cards = document.querySelectorAll(cardSelector || ".movie-card");
        if (!inputEl || !cards.length) {
            return;
        }

        function onFilter() {
            var kw = normalizeText(inputEl.value);
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                var title = normalizeText(card.getAttribute("data-title") || card.textContent || card.innerText);
                var matched = !kw || title.indexOf(kw) !== -1;
                card.style.display = matched ? "" : "none";
            }
        }

        if (inputEl.addEventListener) {
            inputEl.addEventListener("input", onFilter, false);
            inputEl.addEventListener("keyup", onFilter, false);
        } else if (inputEl.attachEvent) {
            inputEl.attachEvent("onkeyup", onFilter);
        }
    }

    // 4. Nút cuộn nhanh lên đầu trang
    function initBackToTop(btnSelector, threshold) {
        var btn = document.querySelector(btnSelector || "#back-to-top");
        var limit = typeof threshold === "number" ? threshold : 300;
        if (!btn) {
            return;
        }

        function toggleBtn() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            btn.style.display = scrollTop > limit ? "block" : "none";
        }

        function goTop(evt) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            }
            window.scrollTo(0, 0);
        }

        if (window.addEventListener) {
            window.addEventListener("scroll", toggleBtn, false);
            btn.addEventListener("click", goTop, false);
        } else if (window.attachEvent) {
            window.attachEvent("onscroll", toggleBtn);
            btn.attachEvent("onclick", goTop);
        }

        toggleBtn();
    }

    // Khởi tạo khi DOM sẵn sàng
    function onReady(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            setTimeout(fn, 0);
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    fn();
                }
            });
        }
    }

    onReady(function () {
        initEpisodeSwitcher({
            movieId: "phim_xua_01",
            listSelector: ".episode-list",
            playerSelector: "#video-player"
        });
        initMovieFilter("#search-movie", ".movie-card");
        initBackToTop("#back-to-top", 300);
    });
})();
Điểm lưu ý khi viết code ES5 cho web phim
Không dùng cú pháp ES6+: Tránh const/let, arrow function () => {}, template literal `${x}`, fetch/Promise (nếu cần gọi API ES5 thì dùng XMLHttpRequest).

Kiểm tra null/selector: Luôn kiểm tra phần tử tồn tại trước khi gắn sự kiện để tránh lỗi runtime làm đứng các script phía sau.

Nếu bạn dán đoạn HTML hoặc mô tả chính xác chức năng bạn muốn làm cho [https://clbphimxua.top/](https://clbphimxua.top/) (ví dụ: trình phát video, danh sách tập, bộ lọc thể loại, hay gọi API), mình sẽ viết đúng theo cấu trúc và yêu cầu cụ thể của bạn.

hoàn thành code cho exoplayer

ExoPlayer hiện nằm trong AndroidX Media3 (thư viện com.google.android.exoplayer2 cũ đã ngừng phát triển). Dưới đây là bộ code hoàn chỉnh bằng Kotlin cho Android (ExoPlayer + PlayerView), hỗ trợ phát luồng video/HLS/MP4, danh sách tập phim, lưu vị trí xem và giải phóng tài nguyên đúng vòng đời Activity.

1. Thêm dependency (app/build.gradle.kts) & quyền mạng (AndroidManifest.xml)
Kotlin
// app/build.gradle.kts
dependencies {
    val media3Version = "1.11.1"
    implementation("androidx.media3:media3-exoplayer:$media3Version")
    implementation("androidx.media3:media3-exoplayer-hls:$media3Version")
    implementation("androidx.media3:media3-ui:$media3Version")
}
XML
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
2. Giao diện XML (activity_player.xml)
XML
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#000000"
    android:orientation="vertical">

    <androidx.media3.ui.PlayerView
        android:id="@+id/playerView"
        android:layout_width="match_parent"
        android:layout_height="240dp"
        app:resize_mode="fit"
        app:show_buffering="when_playing"
        app:use_controller="true" />

    <LinearLayout
        android:id="@+id/episodeContainer"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:padding="12dp" />

</LinearLayout>
3. Code hoàn chỉnh (PlayerActivity.kt)
Bao gồm: khởi tạo ExoPlayer, phát danh sách tập (setMediaItems), tự động lưu & khôi phục vị trí tua, xử lý lỗi phát lại, và giải phóng player ở onStop() / onDestroy().

Kotlin
package com.example.movieplayer

import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

data class EpisodeItem(
    val title: String,
    val url: String
)

class PlayerActivity : AppCompatActivity() {

    private var player: ExoPlayer? = null
    private lateinit var playerView: PlayerView
    private lateinit var episodeContainer: LinearLayout

    private var currentMediaIndex = 0
    private var playbackPositionMs = 0L
    private var playWhenReady = true

    // Danh sách tập mẫu (hỗ trợ MP4, HLS .m3u8, v.v.)
    private val episodes = listOf(
        EpisodeItem("Tập 1", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"),
        EpisodeItem("Tập 2", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"),
        EpisodeItem("Tập 3", "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4")
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_player)

        playerView = findViewById(R.id.playerView)
        episodeContainer = findViewById(R.id.episodeContainer)

        if (savedInstanceState != null) {
            currentMediaIndex = savedInstanceState.getInt(KEY_MEDIA_INDEX, 0)
            playbackPositionMs = savedInstanceState.getLong(KEY_POSITION_MS, 0L)
            playWhenReady = savedInstanceState.getBoolean(KEY_PLAY_WHEN_READY, true)
        }

        setupEpisodeButtons()
    }

    override fun onStart() {
        super.onStart()
        initializePlayer()
    }

    override fun onStop() {
        super.onStop()
        releasePlayer()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        player?.let { exo ->
            outState.putInt(KEY_MEDIA_INDEX, exo.currentMediaItemIndex)
            outState.putLong(KEY_POSITION_MS, exo.currentPosition)
            outState.putBoolean(KEY_PLAY_WHEN_READY, exo.playWhenReady)
        }
    }

    private fun initializePlayer() {
        if (player != null) return

        val exoPlayer = ExoPlayer.Builder(this).build().apply {
            val mediaItems = episodes.map { ep ->
                MediaItem.Builder()
                    .setUri(ep.url)
                    .setMediaId(ep.title)
                    .build()
            }
            setMediaItems(mediaItems, currentMediaIndex, playbackPositionMs)
            this.playWhenReady = this@PlayerActivity.playWhenReady

            addListener(object : Player.Listener {
                override fun onMediaItemTransition(mediaItem: MediaItem?, reason: Int) {
                    currentMediaIndex = currentMediaItemIndex
                    highlightEpisodeButton(currentMediaIndex)
                }

                override fun onPlayerError(error: PlaybackException) {
                    Toast.makeText(
                        this@PlayerActivity,
                        "Lỗi phát video: ${error.errorCodeName}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            })

            prepare()
        }

        player = exoPlayer
        playerView.player = exoPlayer
        highlightEpisodeButton(currentMediaIndex)
    }

    private fun releasePlayer() {
        player?.let { exo ->
            currentMediaIndex = exo.currentMediaItemIndex
            playbackPositionMs = exo.currentPosition.coerceAtLeast(0L)
            playWhenReady = exo.playWhenReady
            exo.release()
        }
        player = null
        playerView.player = null
    }

    private fun setupEpisodeButtons() {
        episodeContainer.removeAllViews()
        episodes.forEachIndexed { index, episode ->
            val btn = Button(this).apply {
                text = episode.title
                setOnClickListener {
                    player?.let { exo ->
                        exo.seekTo(index, 0L)
                        exo.playWhenReady = true
                    }
                }
            }
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                marginEnd = 16
            }
            episodeContainer.addView(btn, params)
        }
    }

    private fun highlightEpisodeButton(activeIndex: Int) {
        for (i in 0 until episodeContainer.childCount) {
            val child = episodeContainer.getChildAt(i)
            child.alpha = if (i == activeIndex) 1.0f else 0.5f
        }
    }

    companion object {
        private const val KEY_MEDIA_INDEX = "key_media_index"
        private const val KEY_POSITION_MS = "key_position_ms"
        private const val KEY_PLAY_WHEN_READY = "key_play_when_ready"
    }
}
Nếu bạn đang dùng Java, Jetpack Compose, hoặc cần thêm tính năng cụ thể nào cho ExoPlayer (như phụ đề SRT/VTT, chọn chất lượng video/HLS, chế độ toàn màn hình/xoay ngang, hoặc phát nền với MediaSessionService), hãy cho mình biết để mình bổ sung thẳng vào code.

hoàn chỉnh code JavaScript es5

Dưới đây là bộ JavaScript chuẩn ES5 hoàn chỉnh, tách module rõ ràng, tương thích với các trình duyệt cũ/WebView cũ, nối liền mạch với giao diện trang xem phim (trình phát <video>/<iframe>, danh sách tập, tìm kiếm/lọc, gọi API bằng XMLHttpRequest, lưu lịch sử/tiến độ xem và giao tiếp với Android/ExoPlayer qua JavascriptInterface nếu nhúng trong WebView).

Kiến trúc & tính năng chính
Tương thích ES5 chặt chẽ: Chỉ dùng var, function, Array.prototype chuẩn ES5, XMLHttpRequest, JSON, localStorage (có try/catch dự phòng).

Trình phát & Danh sách tập: Hỗ trợ cả thẻ <video> (MP4/HLS nếu trình duyệt hỗ trợ) lẫn <iframe>, tự lưu tập đang xem và vị trí giây (currentTime).

Gọi API & Tìm kiếm: Tải danh sách phim/tập qua XMLHttpRequest (hỗ trợ timeout, callback lỗi), lọc danh sách theo từ khóa và thể loại.

Cầu nối Android WebView (tùy chọn): Gửi link/tập sang ứng dụng Android (ví dụ mở bằng ExoPlayer native) nếu chạy bên trong WebView.

Mã JavaScript ES5 hoàn chỉnh (app-es5.js)
JavaScript
(function (global) {
    "use strict";

    var AppES5 = {};

    // =========================================================
    // 1. TIỆN ÍCH CƠ BẢN & STORAGE AN TOÀN
    // =========================================================
    function isFunction(fn) {
        return typeof fn === "function";
    }

    function trimStr(str) {
        return String(str || "").replace(/^\s+|\s+$/g, "");
    }

    function normalizeStr(str) {
        return trimStr(str).toLowerCase().replace(/\s+/g, " ");
    }

    function addClass(el, className) {
        if (!el || !className) {
            return;
        }
        var current = " " + (el.className || "").replace(/\s+/g, " ") + " ";
        if (current.indexOf(" " + className + " ") === -1) {
            el.className = trimStr((el.className || "") + " " + className);
        }
    }

    function removeClass(el, className) {
        if (!el || !className) {
            return;
        }
        var pattern = new RegExp("(^|\\s+)" + className + "(\\s+|$)", "g");
        el.className = trimStr((el.className || "").replace(pattern, " "));
    }

    function bindEvent(el, eventName, handler) {
        if (!el || !eventName || !isFunction(handler)) {
            return;
        }
        if (el.addEventListener) {
            el.addEventListener(eventName, handler, false);
        } else if (el.attachEvent) {
            el.attachEvent("on" + eventName, handler);
        }
    }

    var Storage = {
        get: function (key, fallback) {
            try {
                if (global.localStorage) {
                    var raw = global.localStorage.getItem(key);
                    return raw !== null ? JSON.parse(raw) : fallback;
                }
            } catch (e) {
                // Trình duyệt chặn storage hoặc lỗi JSON
            }
            return fallback;
        },
        set: function (key, value) {
            try {
                if (global.localStorage) {
                    global.localStorage.setItem(key, JSON.stringify(value));
                    return true;
                }
            } catch (e) {
                // Bỏ qua nếu vượt hạn mức hoặc chế độ ẩn danh
            }
            return false;
        }
    };

    // =========================================================
    // 2. GỌI API BẰNG XMLHttpRequest (ES5)
    // =========================================================
    AppES5.requestJson = function (options) {
        options = options || {};
        var url = options.url;
        var method = (options.method || "GET").toUpperCase();
        var headers = options.headers || {};
        var body = options.body || null;
        var timeoutMs = typeof options.timeout === "number" ? options.timeout : 15000;
        var onSuccess = options.onSuccess;
        var onError = options.onError;

        if (!url) {
            if (isFunction(onError)) {
                onError(new Error("Thiếu URL yêu cầu"));
            }
            return;
        }

        var xhr;
        if (global.XMLHttpRequest) {
            xhr = new global.XMLHttpRequest();
        } else if (global.ActiveXObject) {
            xhr = new global.ActiveXObject("Microsoft.XMLHTTP");
        } else {
            if (isFunction(onError)) {
                onError(new Error("Trình duyệt không hỗ trợ XMLHttpRequest"));
            }
            return;
        }

        xhr.open(method, url, true);
        xhr.timeout = timeoutMs;

        var headerKey;
        for (headerKey in headers) {
            if (headers.hasOwnProperty(headerKey)) {
                xhr.setRequestHeader(headerKey, headers[headerKey]);
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                var parsed = null;
                try {
                    parsed = JSON.parse(xhr.responseText);
                } catch (parseErr) {
                    if (isFunction(onError)) {
                        onError(parseErr);
                    }
                    return;
                }
                if (isFunction(onSuccess)) {
                    onSuccess(parsed, xhr.status);
                }
            } else {
                if (isFunction(onError)) {
                    onError(new Error("HTTP lỗi: " + xhr.status), xhr.status);
                }
            }
        };

        xhr.ontimeout = function () {
            if (isFunction(onError)) {
                onError(new Error("Hết thời gian chờ kết nối"), 408);
            }
        };

        xhr.onerror = function () {
            if (isFunction(onError)) {
                onError(new Error("Lỗi mạng khi gọi API"), 0);
            }
        };

        if (body && typeof body !== "string") {
            body = JSON.stringify(body);
            if (!headers["Content-Type"]) {
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            }
        }

        xhr.send(body);
    };

    // =========================================================
    // 3. TRÌNH PHÁT & QUẢN LÝ TIẾN ĐỘ XEM PHIM
    // =========================================================
    var WATCH_STORAGE_KEY = "clbphimxua_watch_history_v1";

    function saveWatchState(movieId, episodeIndex, currentTimeSec) {
        if (!movieId) {
            return;
        }
        var history = Storage.get(WATCH_STORAGE_KEY, {});
        history[String(movieId)] = {
            episode: typeof episodeIndex === "number" ? episodeIndex : 0,
            time: typeof currentTimeSec === "number" && currentTimeSec > 0 ? Math.floor(currentTimeSec) : 0,
            updatedAt: new Date().getTime()
        };
        Storage.set(WATCH_STORAGE_KEY, history);
    }

    function getWatchState(movieId) {
        if (!movieId) {
            return null;
        }
        var history = Storage.get(WATCH_STORAGE_KEY, {});
        return history[String(movieId)] || null;
    }

    AppES5.initPlayerController = function (config) {
        config = config || {};
        var movieId = config.movieId || "default_movie";
        var playerEl = document.querySelector(config.playerSelector || "#video-player");
        var episodeListEl = document.querySelector(config.episodeListSelector || ".episode-list");
        var titleEl = document.querySelector(config.titleSelector || "#now-playing-title");
        var useNativeBridge = Boolean(config.useNativeBridge);
        var bridgeName = config.bridgeName || "AndroidBridge";

        if (!playerEl || !episodeListEl) {
            return null;
        }

        var items = episodeListEl.querySelectorAll("[data-episode]");
        var currentIndex = 0;
        var isHtml5Video = Boolean(playerEl.tagName && playerEl.tagName.toLowerCase() === "video");

        function sendToNativeExoPlayer(epIndex, epTitle, streamUrl) {
            if (!useNativeBridge) {
                return false;
            }
            var bridge = global[bridgeName];
            if (bridge && isFunction(bridge.playInExoPlayer)) {
                bridge.playInExoPlayer(String(movieId), Number(epIndex), String(epTitle || ""), String(streamUrl || ""));
                return true;
            }
            return false;
        }

        function loadEpisode(index, seekSec, autoPlay) {
            var idx = parseInt(index, 10);
            if (isNaN(idx) || idx < 0 || idx >= items.length) {
                return;
            }

            currentIndex = idx;
            var i;
            for (i = 0; i < items.length; i++) {
                removeClass(items[i], "active");
            }

            var activeItem = items[idx];
            addClass(activeItem, "active");

            var streamUrl = activeItem.getAttribute("data-src") || "";
            var epTitle = activeItem.getAttribute("data-title") || trimStr(activeItem.textContent || activeItem.innerText);

            if (titleEl) {
                titleEl.textContent = epTitle;
            }

            saveWatchState(movieId, idx, seekSec || 0);

            // Nếu chạy trong Android WebView có cầu nối ExoPlayer thì chuyển sang native nếu được bật
            if (sendToNativeExoPlayer(idx, epTitle, streamUrl)) {
                return;
            }

            if (!streamUrl) {
                return;
            }

            if (isHtml5Video) {
                playerEl.setAttribute("src", streamUrl);
                if (isFunction(playerEl.load)) {
                    playerEl.load();
                }
                if (seekSec && seekSec > 0) {
                    var onLoadedMeta = function () {
                        try {
                            playerEl.currentTime = seekSec;
                        } catch (e) {}
                        if (autoPlay && isFunction(playerEl.play)) {
                            playerEl.play();
                        }
                        if (playerEl.removeEventListener) {
                            playerEl.removeEventListener("loadedmetadata", onLoadedMeta, false);
                        }
                    };
                    bindEvent(playerEl, "loadedmetadata", onLoadedMeta);
                } else if (autoPlay && isFunction(playerEl.play)) {
                    playerEl.play();
                }
            } else {
                // Dành cho <iframe> trình phát nhúng
                playerEl.setAttribute("src", streamUrl);
            }
        }

        // Gắn click cho từng tập
        var i;
        for (i = 0; i < items.length; i++) {
            (function (boundIndex) {
                bindEvent(items[boundIndex], "click", function (evt) {
                    if (evt && evt.preventDefault) {
                        evt.preventDefault();
                    }
                    loadEpisode(boundIndex, 0, true);
                });
            })(i);
        }

        // Lưu định kỳ vị trí xem với thẻ <video>
        if (isHtml5Video) {
            var lastSavedSec = 0;
            bindEvent(playerEl, "timeupdate", function () {
                var sec = Math.floor(playerEl.currentTime || 0);
                if (sec > 0 && Math.abs(sec - lastSavedSec) >= 5) {
                    lastSavedSec = sec;
                    saveWatchState(movieId, currentIndex, sec);
                }
            });

            bindEvent(playerEl, "ended", function () {
                if (currentIndex + 1 < items.length) {
                    loadEpisode(currentIndex + 1, 0, true);
                }
            });
        }

        // Khôi phục lần xem gần nhất
        var saved = getWatchState(movieId);
        if (saved && typeof saved.episode === "number") {
            loadEpisode(saved.episode, saved.time || 0, false);
        } else if (items.length > 0) {
            loadEpisode(0, 0, false);
        }

        return {
            selectEpisode: function (index, seekSec, autoPlay) {
                loadEpisode(index, seekSec || 0, Boolean(autoPlay));
            },
            getCurrentIndex: function () {
                return currentIndex;
            }
        };
    };

    // =========================================================
    // 4. TÌM KIẾM & LỌC DANH SÁCH PHIM
    // =========================================================
    AppES5.initCatalogFilter = function (config) {
        config = config || {};
        var searchInput = document.querySelector(config.searchSelector || "#movie-search");
        var genreSelect = document.querySelector(config.genreSelector || "#movie-genre");
        var cards = document.querySelectorAll(config.cardSelector || ".movie-card");
        var emptyEl = document.querySelector(config.emptySelector || "#empty-result");

        if (!cards.length) {
            return;
        }

        function applyFilter() {
            var keyword = searchInput ? normalizeStr(searchInput.value) : "";
            var genre = genreSelect ? normalizeStr(genreSelect.value) : "";
            var visibleCount = 0;
            var i;

            for (i = 0; i < cards.length; i++) {
                var card = cards[i];
                var title = normalizeStr(card.getAttribute("data-title") || card.textContent || card.innerText);
                var cardGenre = normalizeStr(card.getAttribute("data-genre") || "");

                var matchKeyword = !keyword || title.indexOf(keyword) !== -1;
                var matchGenre = !genre || genre === "all" || cardGenre.indexOf(genre) !== -1;
                var show = matchKeyword && matchGenre;

                card.style.display = show ? "" : "none";
                if (show) {
                    visibleCount += 1;
                }
            }

            if (emptyEl) {
                emptyEl.style.display = visibleCount === 0 ? "block" : "none";
            }
        }

        if (searchInput) {
            bindEvent(searchInput, "input", applyFilter);
            bindEvent(searchInput, "keyup", applyFilter);
        }
        if (genreSelect) {
            bindEvent(genreSelect, "change", applyFilter);
        }

        applyFilter();
    };

    // =========================================================
    // 5. NÚT CUỘN LÊN ĐẦU TRANG & KHỞI TẠO
    // =========================================================
    AppES5.initBackToTop = function (selector, threshold) {
        var btn = document.querySelector(selector || "#back-to-top");
        var limit = typeof threshold === "number" ? threshold : 320;
        if (!btn) {
            return;
        }

        function updateVisibility() {
            var y = global.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            btn.style.display = y > limit ? "block" : "none";
        }

        bindEvent(global, "scroll", updateVisibility);
        bindEvent(btn, "click", function (evt) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            }
            global.scrollTo(0, 0);
        });

        updateVisibility();
    };

    function onDomReady(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            setTimeout(fn, 0);
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    fn();
                }
            });
        }
    }

    onDomReady(function () {
        AppES5.initPlayerController({
            movieId: "movie_default",
            playerSelector: "#video-player",
            episodeListSelector: ".episode-list",
            titleSelector: "#now-playing-title",
            useNativeBridge: false
        });
        AppES5.initCatalogFilter({
            searchSelector: "#movie-search",
            genreSelector: "#movie-genre",
            cardSelector: ".movie-card",
            emptySelector: "#empty-result"
        });
        AppES5.initBackToTop("#back-to-top", 320);
    });

    global.AppES5 = AppES5;
})(window);
Ví dụ HTML tối thiểu để chạy thử ngay
HTML
<h2 id="now-playing-title"></h2>
<video id="video-player" controls preload="metadata" width="640" height="360"></video>

<ul class="episode-list">
  <li><a href="#" data-episode="0" data-title="Tập 1" data-src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4">Tập 1</a></li>
  <li><a href="#" data-episode="1" data-title="Tập 2" data-src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4">Tập 2</a></li>
</ul>

<input id="movie-search" type="text" placeholder="Tìm tên phim..." />
<select id="movie-genre">
  <option value="all">Tất cả thể loại</option>
  <option value="hanh-dong">Hành động</option>
  <option value="tam-ly">Tâm lý</option>
</select>

<div class="movie-card" data-title="Phim Xưa Số 1" data-genre="tam-ly">Phim Xưa Số 1</div>
<div class="movie-card" data-title="Biệt Đội Cũ" data-genre="hanh-dong">Biệt Đội Cũ</div>
<p id="empty-result" style="display:none;">Không tìm thấy phim phù hợp.</p>

<button id="back-to-top" type="button" style="display:none;">Lên đầu trang</button>
<script src="app-es5.js"></script>
Nếu bạn cần nối trực tiếp đoạn JS này với class ExoPlayer (qua WebView.addJavascriptInterface) hoặc cần đổi bộ chọn/API riêng cho trang của bạn, hãy gửi thêm chi tiết để mình chỉnh đúng khớp.

cấu trúc hàm JavaScript es5

Trong JavaScript ES5, hàm (function) được khai báo chủ yếu bằng từ khóa function (chưa có arrow function () => {}, default parameter, hay rest parameter ...args của ES6+).

1. Cú pháp cơ bản của hàm ES5
JavaScript
// 1. Function Declaration (Khai báo hàm - có hoisting)
function tinhTong(a, b) {
    return a + b;
}

// 2. Function Expression (Biểu thức hàm - KHÔNG có hoisting phần gán)
var tinhHieu = function (a, b) {
    return a - b;
};

// 3. Named Function Expression (Có tên nội bộ, hữu ích cho đệ quy & debug)
var giaiThua = function tinhGiaiThua(n) {
    if (n <= 1) {
        return 1;
    }
    return n * tinhGiaiThua(n - 1);
};

// 4. IIFE - Immediately Invoked Function Expression (Tự chạy ngay, tạo phạm vi riêng)
(function () {
    var bienRieng = "Chỉ sống trong hàm này";
})();
2. Các đặc điểm quan trọng của hàm trong ES5
Đặc điểm	Cách hoạt động trong ES5	Ví dụ / Lưu ý
Tham số & arguments	Không báo lỗi nếu truyền thiếu hoặc thừa đối số; thiếu sẽ nhận undefined. Có đối tượng giả mảng arguments.	arguments.length, arguments[0]
Giá trị trả về (return)	Trả về giá trị sau return; nếu thiếu return hoặc để trống return;, hàm trả về undefined.	Luôn dùng return khi cần kết quả
Phạm vi biến (var)	Function scope (phạm vi hàm), không có block scope (if/for).	Biến var trong if vẫn tồn tại trong toàn hàm
Hoisting	function ...() {} được đưa lên đầu phạm vi; var fn = function() {} chỉ đưa var fn lên trước.	Gọi declaration trước dòng khai báo vẫn chạy
this & call/apply/bind	Giá trị this phụ thuộc vào cách gọi hàm; có sẵn .call(), .apply(), .bind() từ ES5.	fn.call(ctx, 1, 2) hoặc fn.apply(ctx, [1, 2])
3. Ví dụ xử lý tham số, arguments và this trong ES5
JavaScript
function dinhDangThongBao(tienTo) {
    // Tham số mặc định kiểu ES5
    var prefix = (typeof tienTo !== "undefined") ? tienTo : "[INFO]";

    // Gom các đối số còn lại từ vị trí thứ 1 bằng Array.prototype.slice
    var phanConLai = Array.prototype.slice.call(arguments, 1);

    return prefix + " " + phanConLai.join(" - ");
}

var ketQua1 = dinhDangThongBao("PHIM", "Tập 01", "HD"); // "PHIM Tập 01 - HD"
var ketQua2 = dinhDangThongBao();                     // "[INFO] "

// Gắn ngữ cảnh `this` cố định bằng .bind()
var nguoiDung = {
    ten: "Minh",
    chao: function (loiChao) {
        return loiChao + ", " + this.ten;
    }
};

var chaoMinh = nguoiDung.chao.bind(nguoiDung, "Xin chào");
var cauChao = chaoMinh(); // "Xin chào, Minh"
4. Lưu ý phổ biến khi viết hàm ES5
Bẫy biến lặp trong vòng lặp for + callback/closure: Vì var không có block scope, mọi callback tạo trong vòng lặp sẽ chia sẻ cùng một biến i nếu không bọc qua một hàm trung gian (IIFE).

JavaScript
// Đúng chuẩn ES5 khi gắn sự kiện trong vòng lặp:
for (var i = 0; i < 3; i++) {
    (function (chiSo) {
        setTimeout(function () {
            // chiSo giữ nguyên giá trị 0, 1, 2
        }, 100);
    })(i);
}
Bạn muốn áp dụng cấu trúc hàm ES5 này vào bài toán cụ thể nào (ví dụ: viết module, callback/XHR, xử lý mảng, hay this/closure)?

code https://clbphimxua.top/ JavaScript es5 thuần

Vì không truy cập trực tiếp được mã nguồn hiện tại của [https://clbphimxua.top/](https://clbphimxua.top/), dưới đây là mã JavaScript ES5 thuần (không dùng ES6+, không phụ thuộc thư viện ngoài, tương thích rộng rãi với các trình duyệt/WebView đời cũ) xây dựng trọn vẹn cho một trang web xem phim: quản lý danh sách tập, điều khiển trình phát (<video> / <iframe>), lưu lịch sử & vị trí xem bằng localStorage, tìm kiếm/lọc phim, gọi API bằng XMLHttpRequest và nút cuộn lên đầu trang.

Mã JavaScript ES5 thuần (clbphimxua-es5.js)
JavaScript
(function (global) {
    "use strict";

    var ClbPhimXuaES5 = {};

    // =========================================================
    // 1. HÀM TIỆN ÍCH THUẦN ES5
    // =========================================================
    function isFn(fn) {
        return typeof fn === "function";
    }

    function trimText(str) {
        return String(str || "").replace(/^\s+|\s+$/g, "");
    }

    function normalizeText(str) {
        return trimText(str).toLowerCase().replace(/\s+/g, " ");
    }

    // Loại bỏ dấu tiếng Việt cơ bản để tìm kiếm linh hoạt hơn
    function removeVietnameseDiacritics(str) {
        var s = normalizeText(str);
        s = s.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
        s = s.replace(/[èéẹẻẽêềếệểễ]/g, "e");
        s = s.replace(/[ìíịỉĩ]/g, "i");
        s = s.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
        s = s.replace(/[ùúụủũưừứựửữ]/g, "u");
        s = s.replace(/[ỳýỵỷỹ]/g, "y");
        s = s.replace(/đ/g, "d");
        return s;
    }

    function hasClass(el, cls) {
        if (!el || !cls) {
            return false;
        }
        var hay = " " + (el.className || "").replace(/\s+/g, " ") + " ";
        return hay.indexOf(" " + cls + " ") !== -1;
    }

    function addClass(el, cls) {
        if (!el || !cls || hasClass(el, cls)) {
            return;
        }
        el.className = trimText((el.className || "") + " " + cls);
    }

    function removeClass(el, cls) {
        if (!el || !cls) {
            return;
        }
        var regex = new RegExp("(^|\\s+)" + cls + "(\\s+|$)", "g");
        el.className = trimText((el.className || "").replace(regex, " "));
    }

    function onEvent(el, type, handler) {
        if (!el || !type || !isFn(handler)) {
            return;
        }
        if (el.addEventListener) {
            el.addEventListener(type, handler, false);
        } else if (el.attachEvent) {
            el.attachEvent("on" + type, handler);
        }
    }

    function offEvent(el, type, handler) {
        if (!el || !type || !isFn(handler)) {
            return;
        }
        if (el.removeEventListener) {
            el.removeEventListener(type, handler, false);
        } else if (el.detachEvent) {
            el.detachEvent("on" + type, handler);
        }
    }

    // =========================================================
    // 2. LƯU TRỮ LỊCH SỬ XEM PHIM (localStorage AN TOÀN)
    // =========================================================
    var STORAGE_KEY = "clbphimxua_history_es5";

    function readHistory() {
        try {
            if (global.localStorage) {
                var raw = global.localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : {};
            }
        } catch (e) {}
        return {};
    }

    function writeHistory(obj) {
        try {
            if (global.localStorage) {
                global.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
                return true;
            }
        } catch (e) {}
        return false;
    }

    ClbPhimXuaES5.saveWatchHistory = function (movieId, episodeIndex, seconds) {
        if (!movieId) {
            return;
        }
        var store = readHistory();
        store[String(movieId)] = {
            episode: typeof episodeIndex === "number" ? episodeIndex : 0,
            seconds: typeof seconds === "number" && seconds > 0 ? Math.floor(seconds) : 0,
            updatedAt: new Date().getTime()
        };
        writeHistory(store);
    };

    ClbPhimXuaES5.getWatchHistory = function (movieId) {
        if (!movieId) {
            return null;
        }
        var store = readHistory();
        return store[String(movieId)] || null;
    };

    // =========================================================
    // 3. GỌI API JSON THUẦN XMLHttpRequest (ES5)
    // =========================================================
    ClbPhimXuaES5.fetchJson = function (opts) {
        opts = opts || {};
        var url = opts.url;
        var method = (opts.method || "GET").toUpperCase();
        var headers = opts.headers || {};
        var payload = opts.data || null;
        var timeout = typeof opts.timeout === "number" ? opts.timeout : 12000;
        var done = opts.onSuccess;
        var fail = opts.onError;

        if (!url) {
            if (isFn(fail)) {
                fail(new Error("Thiếu URL"), 0);
            }
            return;
        }

        var xhr = global.XMLHttpRequest
            ? new global.XMLHttpRequest()
            : (global.ActiveXObject ? new global.ActiveXObject("Microsoft.XMLHTTP") : null);

        if (!xhr) {
            if (isFn(fail)) {
                fail(new Error("Trình duyệt không hỗ trợ XHR"), 0);
            }
            return;
        }

        xhr.open(method, url, true);
        xhr.timeout = timeout;

        var k;
        for (k in headers) {
            if (headers.hasOwnProperty(k)) {
                xhr.setRequestHeader(k, headers[k]);
            }
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                var jsonData;
                try {
                    jsonData = JSON.parse(xhr.responseText);
                } catch (err) {
                    if (isFn(fail)) {
                        fail(err, xhr.status);
                    }
                    return;
                }
                if (isFn(done)) {
                    done(jsonData, xhr.status);
                }
            } else if (isFn(fail)) {
                fail(new Error("Lỗi HTTP " + xhr.status), xhr.status);
            }
        };

        xhr.ontimeout = function () {
            if (isFn(fail)) {
                fail(new Error("Quá thời gian chờ phản hồi"), 408);
            }
        };

        xhr.onerror = function () {
            if (isFn(fail)) {
                fail(new Error("Lỗi kết nối mạng"), 0);
            }
        };

        if (payload && typeof payload !== "string") {
            payload = JSON.stringify(payload);
            if (!headers["Content-Type"]) {
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            }
        }

        xhr.send(payload);
    };

    // =========================================================
    // 4. TRÌNH PHÁT PHIM & DANH SÁCH TẬP
    // =========================================================
    ClbPhimXuaES5.initPlayer = function (cfg) {
        cfg = cfg || {};
        var movieId = cfg.movieId || "phim_xua";
        var playerEl = document.querySelector(cfg.playerSelector || "#player");
        var listEl = document.querySelector(cfg.episodeListSelector || ".episode-list");
        var titleEl = document.querySelector(cfg.titleSelector || "#episode-title");

        if (!playerEl || !listEl) {
            return null;
        }

        var episodes = listEl.querySelectorAll("[data-episode]");
        var activeIdx = 0;
        var isVideoTag = Boolean(playerEl.tagName && playerEl.tagName.toLowerCase() === "video");

        function playEpisode(index, seekSec, autoPlay) {
            var idx = parseInt(index, 10);
            if (isNaN(idx) || idx < 0 || idx >= episodes.length) {
                return;
            }

            activeIdx = idx;
            var i;
            for (i = 0; i < episodes.length; i++) {
                removeClass(episodes[i], "active");
            }

            var currentItem = episodes[idx];
            addClass(currentItem, "active");

            var src = currentItem.getAttribute("data-src") || "";
            var epTitle = currentItem.getAttribute("data-title") || trimText(currentItem.textContent || currentItem.innerText);

            if (titleEl) {
                titleEl.textContent = epTitle;
            }

            ClbPhimXuaES5.saveWatchHistory(movieId, idx, seekSec || 0);

            if (!src) {
                return;
            }

            if (isVideoTag) {
                playerEl.setAttribute("src", src);
                if (isFn(playerEl.load)) {
                    playerEl.load();
                }

                if (seekSec && seekSec > 0) {
                    var handleLoaded = function () {
                        try {
                            playerEl.currentTime = seekSec;
                        } catch (e) {}
                        if (autoPlay && isFn(playerEl.play)) {
                            playerEl.play();
                        }
                        offEvent(playerEl, "loadedmetadata", handleLoaded);
                    };
                    onEvent(playerEl, "loadedmetadata", handleLoaded);
                } else if (autoPlay && isFn(playerEl.play)) {
                    playerEl.play();
                }
            } else {
                playerEl.setAttribute("src", src);
            }
        }

        var i;
        for (i = 0; i < episodes.length; i++) {
            (function (boundIndex) {
                onEvent(episodes[boundIndex], "click", function (ev) {
                    if (ev && ev.preventDefault) {
                        ev.preventDefault();
                    }
                    playEpisode(boundIndex, 0, true);
                });
            })(i);
        }

        if (isVideoTag) {
            var lastSaved = 0;
            onEvent(playerEl, "timeupdate", function () {
                var nowSec = Math.floor(playerEl.currentTime || 0);
                if (nowSec > 0 && Math.abs(nowSec - lastSaved) >= 5) {
                    lastSaved = nowSec;
                    ClbPhimXuaES5.saveWatchHistory(movieId, activeIdx, nowSec);
                }
            });

            onEvent(playerEl, "ended", function () {
                if (activeIdx + 1 < episodes.length) {
                    playEpisode(activeIdx + 1, 0, true);
                }
            });
        }

        var saved = ClbPhimXuaES5.getWatchHistory(movieId);
        if (saved && typeof saved.episode === "number") {
            playEpisode(saved.episode, saved.seconds || 0, false);
        } else if (episodes.length > 0) {
            playEpisode(0, 0, false);
        }

        return {
            select: function (index, seekSec, autoPlay) {
                playEpisode(index, seekSec || 0, Boolean(autoPlay));
            },
            getIndex: function () {
                return activeIdx;
            }
        };
    };

    // =========================================================
    // 5. TÌM KIẾM & LỌC PHIM
    // =========================================================
    ClbPhimXuaES5.initFilter = function (cfg) {
        cfg = cfg || {};
        var input = document.querySelector(cfg.searchSelector || "#search-input");
        var genre = document.querySelector(cfg.genreSelector || "#genre-select");
        var cards = document.querySelectorAll(cfg.cardSelector || ".movie-card");
        var emptyBox = document.querySelector(cfg.emptySelector || "#no-result");

        if (!cards.length) {
            return;
        }

        function runFilter() {
            var kw = input ? removeVietnameseDiacritics(input.value) : "";
            var g = genre ? removeVietnameseDiacritics(genre.value) : "";
            var shown = 0;
            var i;

            for (i = 0; i < cards.length; i++) {
                var card = cards[i];
                var title = removeVietnameseDiacritics(card.getAttribute("data-title") || card.textContent || card.innerText);
                var cardGenre = removeVietnameseDiacritics(card.getAttribute("data-genre") || "");

                var okKw = !kw || title.indexOf(kw) !== -1;
                var okGenre = !g || g === "all" || cardGenre.indexOf(g) !== -1;
                var visible = okKw && okGenre;

                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            }

            if (emptyBox) {
                emptyBox.style.display = shown === 0 ? "block" : "none";
            }
        }

        if (input) {
            onEvent(input, "input", runFilter);
            onEvent(input, "keyup", runFilter);
        }
        if (genre) {
            onEvent(genre, "change", runFilter);
        }

        runFilter();
    };

    // =========================================================
    // 6. CUỘN LÊN ĐẦU TRANG & KHỞI TẠO
    // =========================================================
    ClbPhimXuaES5.initScrollTop = function (selector, offset) {
        var btn = document.querySelector(selector || "#scroll-top");
        var limit = typeof offset === "number" ? offset : 300;
        if (!btn) {
            return;
        }

        function toggleVisibility() {
            var top = global.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            btn.style.display = top > limit ? "block" : "none";
        }

        onEvent(global, "scroll", toggleVisibility);
        onEvent(btn, "click", function (ev) {
            if (ev && ev.preventDefault) {
                ev.preventDefault();
            }
            global.scrollTo(0, 0);
        });

        toggleVisibility();
    };

    function ready(fn) {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            setTimeout(fn, 0);
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    fn();
                }
            });
        }
    }

    ready(function () {
        ClbPhimXuaES5.initPlayer({
            movieId: "clbphimxua_main",
            playerSelector: "#player",
            episodeListSelector: ".episode-list",
            titleSelector: "#episode-title"
        });
        ClbPhimXuaES5.initFilter({
            searchSelector: "#search-input",
            genreSelector: "#genre-select",
            cardSelector: ".movie-card",
            emptySelector: "#no-result"
        });
        ClbPhimXuaES5.initScrollTop("#scroll-top", 300);
    });

    global.ClbPhimXuaES5 = ClbPhimXuaES5;
})(window);
Nếu bạn có sẵn HTML của trang hoặc muốn dồn toàn bộ chức năng vào một đoạn script ngắn hơn, hoặc cần viết riêng một tính năng cụ thể (ví dụ: render danh sách phim từ JSON API, phân trang, hay điều hướng danh mục), hãy cho mình biết cụ thể.

es5 chuẩn

Để viết JavaScript ES5 chuẩn (ECMAScript 5th Edition — phát hành năm 2009) mà không vô tình lẫn cú pháp ES6+ (ES2015+) hoặc các API ra đời sau ES5, hãy bám vào các quy tắc rõ ràng dưới đây.

1. Danh sách cú pháp & API ĐƯỢC DÙNG trong ES5 chuẩn
Khai báo biến & hàm:

Chỉ dùng var cho biến; dùng function tenHam(...) {} hoặc var fn = function (...) {};.

Chế độ nghiêm ngặt: "use strict"; ở đầu file hoặc đầu hàm.

Đối tượng & thuộc tính:

Object.create(proto), Object.defineProperty(obj, prop, descriptor), Object.defineProperties(...).

Object.getOwnPropertyDescriptor(obj, prop), Object.getOwnPropertyNames(obj), Object.getPrototypeOf(obj).

Object.keys(obj) (trả về mảng các key enumerable riêng của chính obj), Object.seal(obj), Object.freeze(obj), Object.preventExtensions(obj), Object.isSealed(), Object.isFrozen(), Object.isExtensible().

Getter / setter trong object literal: { get x() { return this._x; }, set x(v) { this._x = v; } }.

Dấu phẩy cuối trong object/array literal ([1, 2, 3,], { a: 1, b: 2, }) hợp lệ trong ES5.

Mảng (Array):

Array.isArray(val) (thay cho typeof hoặc instanceof qua frame).

Duyệt & biến đổi: forEach, map, filter, some, every, reduce, reduceRight.

Tìm kiếm: indexOf, lastIndexOf.

Hàm (Function.prototype):

fn.bind(thisArg[, arg1[, arg2...]]) (bên cạnh .call() và .apply() vốn có từ ES3).

Chuỗi, Số & JSON:

String.prototype.trim() (xóa khoảng trắng đầu/cuối).

Date.now(), Date.prototype.toISOString(), Date.prototype.toJSON().

JSON.parse(text[, reviver]) và JSON.stringify(value[, replacer[, space]]).

DOM / Browser thường dùng cùng ES5 (thuộc chuẩn W3C/WHATWG, không phải lõi ECMAScript nhưng đi kèm thực tế):

document.querySelector, document.querySelectorAll, addEventListener, XMLHttpRequest, localStorage (có try/catch).

2. Những thứ KHÔNG PHẢI ES5 (tránh dùng khi cần ES5 chuẩn)
Cú pháp / API	Thuộc chuẩn	Thay thế bằng ES5 chuẩn
let, const	ES6 (2015)	var
Arrow function (x) => x * 2	ES6 (2015)	function (x) { return x * 2; }
Template literal `hi ${name}`	ES6 (2015)	Nối chuỗi bằng +
Default / Rest / Spread (a = 1, ...args)	ES6 (2015)	Kiểm tra typeof a !== "undefined", arguments, .concat()
class, extends, super	ES6 (2015)	Constructor function + Object.create() + .prototype
Promise, async/await, fetch	ES6 / ES2017 / Fetch API	Callback hoặc XMLHttpRequest
Map, Set, Symbol, Proxy	ES6 (2015)	Plain object {} / Array + hàm helper
Array.prototype.includes, find, findIndex	ES6 / ES2016	.indexOf(x) !== -1, vòng lặp for
Object.assign, Object.values, Object.entries	ES6 / ES2017	Vòng lặp for (var k in obj) kèm hasOwnProperty
String.prototype.includes, startsWith, endsWith	ES6 (2015)	.indexOf(...) === 0 hoặc .indexOf(...) !== -1
** (lũy thừa)	ES2016	Math.pow(a, b)
Optional chaining ?., Nullish coalescing ??	ES2020	Kiểm tra && / toán tử ba ngôi ?:
3. Ví dụ mẫu ES5 chuẩn (Object, Array, JSON, bind, defineProperty)
JavaScript
(function (global) {
    "use strict";

    function createPlaylist(name) {
        if (!name || typeof name !== "string") {
            name = "Danh sách mặc định";
        }

        var items = [];

        function findIndexById(id) {
            var i;
            for (i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                    return i;
                }
            }
            return -1;
        }

        var playlist = {
            name: name.trim(),
            add: function (item) {
                if (!item || !item.id) {
                    return false;
                }
                if (findIndexById(item.id) !== -1) {
                    return false;
                }
                items.push({
                    id: String(item.id),
                    title: String(item.title || "")
                });
                return true;
            },
            remove: function (id) {
                var idx = findIndexById(String(id));
                if (idx === -1) {
                    return false;
                }
                items.splice(idx, 1);
                return true;
            },
            getTitles: function () {
                return items.map(function (entry) {
                    return entry.title;
                });
            },
            toJson: function () {
                return JSON.stringify({
                    name: this.name,
                    count: items.length,
                    items: items,
                    exportedAt: new Date().toISOString()
                });
            }
        };

        // Thuộc tính chỉ đọc (non-writable) chuẩn ES5
        Object.defineProperty(playlist, "version", {
            value: "1.0.0-es5",
            writable: false,
            enumerable: true,
            configurable: false
        });

        return playlist;
    }

    var myList = createPlaylist("  Phim cũ chọn lọc  ");
    myList.add({ id: "1", title: "Tập 1" });
    myList.add({ id: "2", title: "Tập 2" });

    var getBoundedTitles = myList.getTitles.bind(myList);
    var titles = getBoundedTitles(); // ["Tập 1", "Tập 2"]
    var serialized = myList.toJson();

    global.createPlaylist = createPlaylist;
})(window);
4. Cách kiểm tra code của bạn có đúng ES5 chuẩn không
Chạy qua ESLint với cấu hình "parserOptions": { "ecmaVersion": 5 } (hoặc env: { es6: false, browser: true }).

Nếu chạy trên trình duyệt cũ hoặc môi trường khắt khe chỉ hỗ trợ ES5, mọi từ khóa/phương thức ở bảng mục 2 sẽ báo lỗi cú pháp hoặc undefined ngay lúc chạy.

Bạn muốn viết lại hoặc kiểm tra một đoạn code cụ thể nào theo chuẩn ES5 không?

phân tích function getManifest() {

return JSON.stringify({

"id": "kkphim",

"name": "KKPhim",

"version": "1.0.3",

"baseUrl": "https://phimapi.com",

"iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/kkphim.png",

"isEnabled": true,

"type": "MOVIE"

});

}



function getHomeSections() {

return JSON.stringify([

{ slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'subteam', title: 'Subteam', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-thuyet-minh', title: 'Phim Thuyết Minh', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'danh-sach' },

{ slug: 'phim-moi-cap-nhat-v3', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }

]);

}



function getPrimaryCategories() {

return JSON.stringify([

{ name: 'Phim mới', slug: 'phim-moi-cap-nhat-v3' },

{ name: 'Phim bộ', slug: 'phim-bo' },

{ name: 'Phim lẻ', slug: 'phim-le' },

{ name: 'TV shows', slug: 'tv-shows' },

{ name: 'Hoạt hình', slug: 'hoat-hinh' },

{ name: 'Phim vietsub', slug: 'phim-vietsub' },

{ name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },

{ name: 'Phim lồng tiếng', slug: 'phim-long-tieng' },

{ name: 'Subteam', slug: 'subteam' },

{ name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }

]);

}



function getFilterConfig() {

return JSON.stringify({

sort: [

{ name: 'Thời gian cập nhật', value: 'modified.time' },

{ name: 'Năm phát hành', value: 'year' },

{ name: 'Theo ID', value: '_id' }

]

});

}



// =============================================================================

// URL GENERATION

// =============================================================================



function getUrlList(slug, filtersJson) {

try {

var filters = JSON.parse(filtersJson || "{}");

var page = parseInt(filters.page, 10) || 1;

var limit = parseInt(filters.limit, 10) || 24;



var listSlugs = [

'phim-vietsub', 'subteam', 'phim-thuyet-minh', 'phim-long-tieng',

'phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-chieu-rap',

'phim-moi-cap-nhat'

];



var typeList = (slug === 'phim-moi') ? 'phim-moi-cap-nhat-v3' : slug;



if (typeList === 'phim-moi-cap-nhat-v3') {

return "https://phimapi.com/danh-sach/phim-moi-cap-nhat-v3?page=" + page + "&limit=" + limit;

}



var basePath = (listSlugs.indexOf(typeList) !== -1) ? "danh-sach" : "the-loai";

var url = "https://phimapi.com/v1/api/" + basePath + "/" + encodeURIComponent(typeList) + "?page=" + page + "&limit=" + limit;



if (filters.country) url += "&country=" + encodeURIComponent(filters.country);

if (filters.year) url += "&year=" + encodeURIComponent(filters.year);

if (filters.category) url += "&category=" + encodeURIComponent(filters.category);

if (filters.sort) url += "&sort_field=" + encodeURIComponent(filters.sort);



return url;

} catch (e) {

return "https://phimapi.com/v1/api/danh-sach/" + encodeURIComponent(slug || "phim-moi-cap-nhat");

}

}



function getUrlSearch(keyword, filtersJson) {

try {

var filters = JSON.parse(filtersJson || "{}");

var page = parseInt(filters.page, 10) || 1;

var limit = parseInt(filters.limit, 10) || 24;

var q = encodeURIComponent((keyword || "").trim());

return "https://phimapi.com/v1/api/tim-kiem?keyword=" + q + "&page=" + page + "&limit=" + limit;

} catch (e) {

return "https://phimapi.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword || "") + "&page=1&limit=24";

}

}



function getUrlDetail(slug) {

return "https://phimapi.com/phim/" + encodeURIComponent(slug || "");

}



function getUrlCategories() {

return "https://phimapi.com/the-loai";

}



function getUrlCountries() {

return "https://phimapi.com/quoc-gia";

}



function getUrlYears() {

return "";

}



function getLocalYearsJson() {

var currentYear = new Date().getFullYear();

var years = [];

for (var y = currentYear; y >= 1970; y--) {

years.push({ name: String(y), value: String(y) });

}

return JSON.stringify(years);

}



// =============================================================================

// PARSERS & HELPERS

// =============================================================================



function extractArrayItems(response) {

if (!response) return [];

if (Array.isArray(response)) return response;

if (Array.isArray(response.items)) return response.items;

if (Array.isArray(response.data)) return response.data;

if (response.data && Array.isArray(response.data.items)) return response.data.items;

return [];

}



function extractCdnDomain(response) {

if (response && response.data && typeof response.data === "object" && response.data.APP_DOMAIN_CDN_IMAGE) {

return String(response.data.APP_DOMAIN_CDN_IMAGE).trim();

}

if (response && response.APP_DOMAIN_CDN_IMAGE) {

return String(response.APP_DOMAIN_CDN_IMAGE).trim();

}

return "https://phimimg.com";

}



function getPosterUrl(path, cdnDomain, fallbackPath) {

var raw = path || fallbackPath || "";

if (!raw) return "";



var str = String(raw).trim();

if (!str) return "";



if (str.indexOf("http://") === 0 || str.indexOf("https://") === 0) {

return str;

}



var baseCdn = String(cdnDomain || "https://phimimg.com").trim().replace(/\/+$/, "");

var cleanPath = str.replace(/^\/+/, "");



return baseCdn + "/" + cleanPath;

}



function parseListResponse(apiResponseJson) {

try {

var response = JSON.parse(apiResponseJson);

var items = extractArrayItems(response);

var cdnDomain = extractCdnDomain(response);

var data = (response && response.data && !Array.isArray(response.data)) ? response.data : {};

var params = data.params || {};

var pagination = response.pagination || params.pagination || {};



var currentPage = parseInt(pagination.currentPage, 10) || 1;

var totalItems = parseInt(pagination.totalItems, 10) || items.length;

var itemsPerPage = parseInt(pagination.totalItemsPerPage || pagination.itemsPerPage, 10) || 24;

var totalPages = parseInt(pagination.totalPages, 10) || Math.max(1, Math.ceil(totalItems / itemsPerPage));



var movies = items.map(function (item) {

return {

id: item.slug || "",

title: item.name || "",

posterUrl: getPosterUrl(item.poster_url, cdnDomain, item.thumb_url),

backdropUrl: getPosterUrl(item.thumb_url, cdnDomain, item.poster_url),

year: parseInt(item.year, 10) || 0,

quality: item.quality || "",

episode_current: item.episode_current || "",

lang: item.lang || ""

};

});



return JSON.stringify({

items: movies,

pagination: {

currentPage: currentPage,

totalPages: totalPages,

totalItems: totalItems,

itemsPerPage: itemsPerPage

}

});

} catch (error) {

return JSON.stringify({

items: [],

pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 }

});

}

}



function parseSearchResponse(apiResponseJson) {

return parseListResponse(apiResponseJson);

}



function parseMovieDetail(apiResponseJson) {

try {

var response = JSON.parse(apiResponseJson);

var movie = response.movie || {};

var episodes = Array.isArray(response.episodes) ? response.episodes : [];

var cdnDomain = extractCdnDomain(response);



var servers = [];

for (var i = 0; i < episodes.length; i++) {

var server = episodes[i] || {};

var serverData = Array.isArray(server.server_data) ? server.server_data : [];

var serverEpisodes = [];



for (var j = 0; j < serverData.length; j++) {

var ep = serverData[j] || {};

var streamUrl = ep.link_m3u8 || ep.link_embed || "";

if (streamUrl) {

serverEpisodes.push({

id: streamUrl,

name: ep.name || "",

slug: ep.slug || "",

m3u8: ep.link_m3u8 || "",

embed: ep.link_embed || ""

});

}

}



if (serverEpisodes.length > 0) {

servers.push({

name: server.server_name || ("Server " + (i + 1)),

episodes: serverEpisodes

});

}

}



var categories = Array.isArray(movie.category)

? movie.category.map(function (c) { return c && c.name ? c.name : ""; }).filter(Boolean).join(", ")

: "";



var countries = Array.isArray(movie.country)

? movie.country.map(function (c) { return c && c.name ? c.name : ""; }).filter(Boolean).join(", ")

: "";



var directors = Array.isArray(movie.director) ? movie.director.filter(Boolean).join(", ") : "";

var actors = Array.isArray(movie.actor) ? movie.actor.filter(Boolean).join(", ") : "";



var ratingValue = 0;

var tmdbId = "";

var tmdbSeason = 0;

var tmdbType = "";



if (movie.tmdb && typeof movie.tmdb === "object") {

if (movie.tmdb.vote_average) ratingValue = parseFloat(movie.tmdb.vote_average) || 0;

if (movie.tmdb.id) tmdbId = String(movie.tmdb.id);

if (movie.tmdb.season) tmdbSeason = parseInt(movie.tmdb.season, 10) || 0;

if (movie.tmdb.type) tmdbType = String(movie.tmdb.type);

}



var cleanDescription = String(movie.content || "")

.replace(/<br\s*\/?>/gi, "\n")

.replace(/<[^>]*>/g, "")

.trim();



return JSON.stringify({

id: movie.slug || "",

title: movie.name || "",

originName: movie.origin_name || "",

posterUrl: getPosterUrl(movie.poster_url, cdnDomain, movie.thumb_url),

backdropUrl: getPosterUrl(movie.thumb_url, cdnDomain, movie.poster_url),

description: cleanDescription,

year: parseInt(movie.year, 10) || 0,

rating: ratingValue,

quality: movie.quality || "",

duration: movie.time || "",

servers: servers,

episode_current: movie.episode_current || "",

lang: movie.lang || "",

category: categories,

country: countries,

director: directors,

casts: actors,

status: movie.status || "",

tmdbId: tmdbId,

tmdbSeason: tmdbSeason,

tmdbType: tmdbType

});

} catch (error) {

return "null";

}

}



function resolveStreamData(streamInput) {

var raw = String(streamInput || "").trim();

var isHlsOrDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);

return JSON.stringify({

url: raw,

isDirectStream: isHlsOrDirect,

headers: {

"User-Agent": "Mozilla/5.0",

"Referer": "https://phimapi.com/"

},

subtitles: []

});

}



function parseDetailResponse(apiResponseJson) {

try {

var parsed = JSON.parse(apiResponseJson || "{}");

var candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.link_embed || "";

return resolveStreamData(candidate);

} catch (e) {

return resolveStreamData(apiResponseJson);

}

}



function parseCategoriesResponse(apiResponseJson) {

try {

var response = JSON.parse(apiResponseJson);

var items = extractArrayItems(response);

return JSON.stringify(items.map(function (i) {

return {

name: i.name || "",

slug: i.slug || ""

};

}));

} catch (e) {

return "[]";

}

}



function parseCountriesResponse(apiResponseJson) {

try {

var response = JSON.parse(apiResponseJson);

var items = extractArrayItems(response);

return JSON.stringify(items.map(function (i) {

return {

name: i.name || "",

value: i.slug || ""

};

}));

} catch (e) {

return "[]";

}

}



function parseYearsResponse(apiResponseJson) {

try {

var items = extractArrayItems(JSON.parse(apiResponseJson));

return JSON.stringify(items.map(function (i) {

var val = (typeof i === "object" && i !== null) ? (i.slug || i.value || i.year || i.name) : i;

var label = (typeof i === "object" && i !== null) ? (i.name || i.year || val) : i;

return { name: String(label || ""), value: String(val || "") };

}));

} catch (e) {

return "[]";

}

}

Đoạn mã trên là một plugin / adapter viết theo phong cách ES5 cho ứng dụng xem phim (như Android/TV dùng WebView/JS bridge + ExoPlayer), kết nối tới API KKPhim ([https://phimapi.com](https://phimapi.com)) và chuẩn hóa dữ liệu đầu vào/đầu ra dưới dạng chuỗi JSON (JSON.stringify / JSON.parse).

1. Kiến trúc & vai trò từng nhóm hàm
Nhóm hàm	Chức năng chính	Đầu vào / Đầu ra
Metadata & UI Config (getManifest, getHomeSections, getPrimaryCategories, getFilterConfig)	Khai báo thông tin plugin, các mục trang chủ (Horizontal / Grid), danh mục chính và tùy chọn sắp xếp.	Trả về JSON string.
URL Generator (getUrlList, getUrlSearch, getUrlDetail, getUrlCategories, getUrlCountries, getUrlYears, getLocalYearsJson)	Sinh URL endpoint của phimapi.com theo slug, filtersJson (page, limit, country, year, category, sort) hoặc từ khóa tìm kiếm.	Trả về URL string hoặc JSON string (với getLocalYearsJson).
Response Parsers & Stream Resolver (parseListResponse, parseSearchResponse, parseMovieDetail, resolveStreamData, parseDetailResponse, parseCategoriesResponse, parseCountriesResponse, parseYearsResponse)	Chuyển cấu trúc JSON đặc thù của KKPhim sang schema thống nhất của app; làm sạch HTML mô tả; tách luồng m3u8/embed và header phát video.	Nhận JSON string/input, trả về JSON string (hoặc "null" / "[]" khi lỗi).
2. Điểm mạnh trong cách viết hiện tại
Phòng thủ lỗi tốt: Hầu hết parser đều bọc try/catch và có fallback an toàn ({ items: [], pagination: ... }, "[]", "null"), giúp host/app không bị crash khi API trả về dữ liệu lệch cấu trúc hoặc rỗng.

Xử lý linh hoạt các biến thể response của KKPhim: extractArrayItems và extractCdnDomain hỗ trợ cả response dạng cũ lẫn dạng v1/api có data.items và data.APP_DOMAIN_CDN_IMAGE.

Chuẩn hóa URL ảnh & làm sạch mô tả: getPosterUrl nối đúng domain CDN và loại bỏ dấu / dư; parseMovieDetail đổi <br> thành xuống dòng và strip thẻ HTML trước khi đưa lên giao diện.

3. Các lỗi logic, bug tiềm ẩn & điểm cần chú ý
Lỗi thiếu String.prototype.trim trên môi trường ES5 cực cũ (như IE8):

getUrlSearch gọi (keyword || "").trim() và extractCdnDomain / getPosterUrl gọi .trim(). Trong đặc tả ES5 có String.prototype.trim, nhưng trên môi trường rất cũ hoặc thiếu polyfill có thể lỗi; nên dùng helper .replace(/^\s+|\s+$/g, "") nếu cần tương thích tối đa.

Tham số sort trong getUrlList chưa đồng bộ tên field giữa getFilterConfig và URL:

getFilterConfig trả về value: 'modified.time', 'year', '_id', nhưng getUrlList gán trực tiếp vào &sort_field=.... Cần xác nhận phía phimapi.com có nhận đúng tên sort_field và giá trị modified.time hay không, đồng thời kiểm tra có cần sort_type (desc/asc) hay không.

Danh sách listSlugs thiếu hoặc trùng một số slug:

getHomeSections có phim-moi-cap-nhat-v3 (được xử lý riêng ở nhánh if (typeList === 'phim-moi-cap-nhat-v3')), còn phim-vietsub xuất hiện ở getPrimaryCategories và listSlugs nhưng không có trong getHomeSections. Nếu thêm slug danh sách mới vào phimapi.com, cần cập nhật đồng thời cả getHomeSections/getPrimaryCategories và listSlugs.

Dấu phẩy cuối (trailing comma) trong mảng/object literal:

Hợp lệ từ ES5 trở lên, nhưng nếu chạy trên một số trình phân tích cũ hoặc công cụ kiểm tra khắt khe, có thể cân nhắc bỏ nếu gặp cảnh báo.

Tên hàm parseDetailResponse dễ gây nhầm lẫn:

parseMovieDetail phân tích chi tiết phim và danh sách tập/server, trong khi parseDetailResponse thực chất chỉ trích xuất URL stream (url / streamUrl / link_m3u8 / link_embed) rồi gọi resolveStreamData. Nếu host gọi nhầm tên hàm khi lấy chi tiết phim sẽ không nhận được thông tin phim/tập.

Header Referer: "[https://phimapi.com/](https://phimapi.com/)" trong resolveStreamData:

Một số CDN video (m3u8/mp4) kiểm tra Referer hoặc User-Agent theo domain nguồn phát thực tế chứ không phải domain API. Khi test phát thực tế trên ExoPlayer, nếu gặp lỗi 403 hoặc 404 trên luồng m3u8, đây là điểm đầu tiên nên kiểm tra.

4. Gợi ý tối ưu ngắn gọn nếu cần nâng cấp
Tách một hàm helper chung safeTrim(val) để dùng nhất quán thay vì gọi .trim() rải rác.

Chuẩn hóa rõ ràng hợp đồng giữa JS plugin và Native host (Kotlin/ExoPlayer): xác định hàm nào nhận response gốc của phimapi.com, hàm nào nhận JSON đã parse từ bước trước, và cách truyền headers (User-Agent, Referer) vào DefaultHttpDataSource.Factory của ExoPlayer.

code plugin / adapter viết theo phong cách ES5 https://clbphimxua.top/

Vì không truy cập trực tiếp được cấu trúc API/DOM thực tế của [https://clbphimxua.top/](https://clbphimxua.top/), dưới đây là plugin / adapter hoàn chỉnh viết theo phong cách ES5, giữ đúng bộ hàm chuẩn (getManifest, getHomeSections, getPrimaryCategories, getFilterConfig, getUrlList, getUrlSearch, getUrlDetail, getUrlCategories, getUrlCountries, getUrlYears, getLocalYearsJson, parseListResponse, parseSearchResponse, parseMovieDetail, resolveStreamData, parseDetailResponse, parseCategoriesResponse, parseCountriesResponse, parseYearsResponse) để cắm trực tiếp vào host/app.

Mã Plugin / Adapter ES5 (clbphimxua-plugin-es5.js)
JavaScript
(function (global) {
    "use strict";

    var BASE_URL = "https://clbphimxua.top";
    var DEFAULT_LIMIT = 24;

    // =========================================================================
    // 1. HÀM TIỆN ÍCH ES5 AN TOÀN
    // =========================================================================
    function safeTrim(val) {
        return String(val || "").replace(/^\s+|\s+$/g, "");
    }

    function toInt(val, fallback) {
        var parsed = parseInt(val, 10);
        return isNaN(parsed) ? fallback : parsed;
    }

    function toFloat(val, fallback) {
        var parsed = parseFloat(val);
        return isNaN(parsed) ? fallback : parsed;
    }

    function isPlainObject(val) {
        return typeof val === "object" && val !== null && !Array.isArray(val);
    }

    function extractArrayItems(response) {
        if (!response) {
            return [];
        }
        if (Array.isArray(response)) {
            return response;
        }
        if (Array.isArray(response.items)) {
            return response.items;
        }
        if (Array.isArray(response.movies)) {
            return response.movies;
        }
        if (Array.isArray(response.data)) {
            return response.data;
        }
        if (isPlainObject(response.data)) {
            if (Array.isArray(response.data.items)) {
                return response.data.items;
            }
            if (Array.isArray(response.data.movies)) {
                return response.data.movies;
            }
        }
        return [];
    }

    function extractCdnDomain(response) {
        if (isPlainObject(response) && isPlainObject(response.data) && response.data.cdnDomain) {
            return safeTrim(response.data.cdnDomain);
        }
        if (isPlainObject(response) && isPlainObject(response.data) && response.data.APP_DOMAIN_CDN_IMAGE) {
            return safeTrim(response.data.APP_DOMAIN_CDN_IMAGE);
        }
        if (isPlainObject(response) && response.cdnDomain) {
            return safeTrim(response.cdnDomain);
        }
        if (isPlainObject(response) && response.APP_DOMAIN_CDN_IMAGE) {
            return safeTrim(response.APP_DOMAIN_CDN_IMAGE);
        }
        return BASE_URL;
    }

    function buildMediaUrl(path, cdnDomain, fallbackPath) {
        var raw = safeTrim(path || fallbackPath || "");
        if (!raw) {
            return "";
        }
        if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
            return raw;
        }
        if (raw.indexOf("//") === 0) {
            return "https:" + raw;
        }
        var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
        var cleanPath = raw.replace(/^\/+/, "");
        return base + "/" + cleanPath;
    }

    function stripHtmlToText(html) {
        return String(html || "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n")
            .replace(/<[^>]*>/g, "")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/^\s+|\s+$/g, "");
    }

    function joinNamedList(list) {
        if (!Array.isArray(list)) {
            return "";
        }
        var parts = [];
        var i;
        for (i = 0; i < list.length; i++) {
            var item = list[i];
            var text = "";
            if (typeof item === "string") {
                text = safeTrim(item);
            } else if (isPlainObject(item)) {
                text = safeTrim(item.name || item.title || item.slug || "");
            }
            if (text) {
                parts.push(text);
            }
        }
        return parts.join(", ");
    }

    // =========================================================================
    // 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
    // =========================================================================
    function getManifest() {
        return JSON.stringify({
            id: "clbphimxua",
            name: "CLB Phim Xưa",
            version: "1.0.0",
            baseUrl: BASE_URL,
            iconUrl: BASE_URL + "/favicon.ico",
            isEnabled: true,
            type: "MOVIE"
        });
    }

    function getHomeSections() {
        return JSON.stringify([
            { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
            { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
            { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
            { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
            { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
            { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
            { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
        ]);
    }

    function getPrimaryCategories() {
        return JSON.stringify([
            { name: "Phim mới", slug: "phim-moi-cap-nhat" },
            { name: "Phim lẻ", slug: "phim-le" },
            { name: "Phim bộ", slug: "phim-bo" },
            { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
            { name: "Hoạt hình", slug: "hoat-hinh" },
            { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
            { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
        ]);
    }

    function getFilterConfig() {
        return JSON.stringify({
            sort: [
                { name: "Mới cập nhật", value: "modified" },
                { name: "Năm phát hành", value: "year" },
                { name: "Tên phim", value: "name" }
            ]
        });
    }

    // =========================================================================
    // 3. TẠO URL ENDPOINT
    // =========================================================================
    function getUrlList(slug, filtersJson) {
        var safeSlug = safeTrim(slug || "phim-moi-cap-nhat");
        try {
            var filters = JSON.parse(filtersJson || "{}");
            var page = toInt(filters.page, 1);
            if (page < 1) {
                page = 1;
            }
            var limit = toInt(filters.limit, DEFAULT_LIMIT);
            if (limit < 1) {
                limit = DEFAULT_LIMIT;
            }

            var url = BASE_URL + "/api/danh-sach/" + encodeURIComponent(safeSlug) +
                "?page=" + page + "&limit=" + limit;

            if (filters.category) {
                url += "&category=" + encodeURIComponent(safeTrim(filters.category));
            }
            if (filters.country) {
                url += "&country=" + encodeURIComponent(safeTrim(filters.country));
            }
            if (filters.year) {
                url += "&year=" + encodeURIComponent(safeTrim(filters.year));
            }
            if (filters.sort) {
                url += "&sort=" + encodeURIComponent(safeTrim(filters.sort));
            }

            return url;
        } catch (e) {
            return BASE_URL + "/api/danh-sach/" + encodeURIComponent(safeSlug) + "?page=1&limit=" + DEFAULT_LIMIT;
        }
    }

    function getUrlSearch(keyword, filtersJson) {
        var cleanKeyword = safeTrim(keyword || "");
        try {
            var filters = JSON.parse(filtersJson || "{}");
            var page = toInt(filters.page, 1);
            if (page < 1) {
                page = 1;
            }
            var limit = toInt(filters.limit, DEFAULT_LIMIT);
            if (limit < 1) {
                limit = DEFAULT_LIMIT;
            }

            return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
                "&page=" + page + "&limit=" + limit;
        } catch (e) {
            return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
                "&page=1&limit=" + DEFAULT_LIMIT;
        }
    }

    function getUrlDetail(slug) {
        return BASE_URL + "/api/phim/" + encodeURIComponent(safeTrim(slug || ""));
    }

    function getUrlCategories() {
        return BASE_URL + "/api/the-loai";
    }

    function getUrlCountries() {
        return BASE_URL + "/api/quoc-gia";
    }

    function getUrlYears() {
        return "";
    }

    function getLocalYearsJson() {
        var currentYear = new Date().getFullYear();
        var years = [];
        var y;
        for (y = currentYear; y >= 1950; y--) {
            years.push({
                name: String(y),
                value: String(y)
            });
        }
        return JSON.stringify(years);
    }

    // =========================================================================
    // 4. PARSER & STREAM RESOLVER
    // =========================================================================
    function parseListResponse(apiResponseJson) {
        var fallbackPage = 1;
        var fallbackLimit = DEFAULT_LIMIT;
        try {
            var response = JSON.parse(apiResponseJson);
            var rawItems = extractArrayItems(response);
            var cdnDomain = extractCdnDomain(response);
            var dataObj = isPlainObject(response) && isPlainObject(response.data) ? response.data : {};
            var pagination = isPlainObject(response) && isPlainObject(response.pagination)
                ? response.pagination
                : (isPlainObject(dataObj.pagination) ? dataObj.pagination : {});

            var currentPage = toInt(pagination.currentPage || pagination.page, fallbackPage);
            var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
            var itemsPerPage = toInt(
                pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
                fallbackLimit
            );
            var totalPages = toInt(
                pagination.totalPages || pagination.lastPage,
                Math.max(1, Math.ceil(totalItems / Math.max(1, itemsPerPage)))
            );

            var movies = rawItems.map(function (item) {
                var obj = isPlainObject(item) ? item : {};
                var slugVal = safeTrim(obj.slug || obj.id || "");
                var posterRaw = obj.poster_url || obj.posterUrl || obj.poster || obj.thumb_url || obj.thumb || "";
                var backdropRaw = obj.thumb_url || obj.backdrop_url || obj.backdropUrl || obj.poster_url || "";

                return {
                    id: slugVal,
                    title: safeTrim(obj.name || obj.title || ""),
                    posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
                    backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
                    year: toInt(obj.year, 0),
                    quality: safeTrim(obj.quality || ""),
                    episode_current: safeTrim(obj.episode_current || obj.episodeCurrent || ""),
                    lang: safeTrim(obj.lang || "")
                };
            });

            return JSON.stringify({
                items: movies,
                pagination: {
                    currentPage: currentPage,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    itemsPerPage: itemsPerPage
                }
            });
        } catch (err) {
            return JSON.stringify({
                items: [],
                pagination: {
                    currentPage: fallbackPage,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: fallbackLimit
                }
            });
        }
    }

    function parseSearchResponse(apiResponseJson) {
        return parseListResponse(apiResponseJson);
    }

    function parseMovieDetail(apiResponseJson) {
        try {
            var response = JSON.parse(apiResponseJson);
            var dataObj = isPlainObject(response) && isPlainObject(response.data) ? response.data : response;
            var movie = isPlainObject(dataObj.movie) ? dataObj.movie : (isPlainObject(dataObj.item) ? dataObj.item : dataObj);
            var episodesRaw = Array.isArray(dataObj.episodes)
                ? dataObj.episodes
                : (Array.isArray(response.episodes) ? response.episodes : []);
            var cdnDomain = extractCdnDomain(response);

            var servers = [];
            var i;
            for (i = 0; i < episodesRaw.length; i++) {
                var srv = isPlainObject(episodesRaw[i]) ? episodesRaw[i] : {};
                var srvData = Array.isArray(srv.server_data)
                    ? srv.server_data
                    : (Array.isArray(srv.episodes) ? srv.episodes : []);
                var serverEpisodes = [];
                var j;

                for (j = 0; j < srvData.length; j++) {
                    var ep = isPlainObject(srvData[j]) ? srvData[j] : {};
                    var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
                    var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
                    var streamUrl = m3u8Url || embedUrl || safeTrim(ep.url || "");

                    if (streamUrl) {
                        serverEpisodes.push({
                            id: streamUrl,
                            name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                            slug: safeTrim(ep.slug || ""),
                            m3u8: m3u8Url,
                            embed: embedUrl
                        });
                    }
                }

                if (serverEpisodes.length > 0) {
                    servers.push({
                        name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
                        episodes: serverEpisodes
                    });
                }
            }

            var ratingValue = 0;
            var tmdbId = "";
            var tmdbSeason = 0;
            var tmdbType = "";

            if (isPlainObject(movie.tmdb)) {
                ratingValue = toFloat(movie.tmdb.vote_average, 0);
                if (movie.tmdb.id) {
                    tmdbId = String(movie.tmdb.id);
                }
                tmdbSeason = toInt(movie.tmdb.season, 0);
                if (movie.tmdb.type) {
                    tmdbType = String(movie.tmdb.type);
                }
            } else if (movie.rating) {
                ratingValue = toFloat(movie.rating, 0);
            }

            var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
            var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";

            return JSON.stringify({
                id: safeTrim(movie.slug || movie.id || ""),
                title: safeTrim(movie.name || movie.title || ""),
                originName: safeTrim(movie.origin_name || movie.originName || ""),
                posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
                backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
                description: stripHtmlToText(movie.content || movie.description || ""),
                year: toInt(movie.year, 0),
                rating: ratingValue,
                quality: safeTrim(movie.quality || ""),
                duration: safeTrim(movie.time || movie.duration || ""),
                servers: servers,
                episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
                lang: safeTrim(movie.lang || ""),
                category: joinNamedList(movie.category || movie.categories),
                country: joinNamedList(movie.country || movie.countries),
                director: joinNamedList(movie.director || movie.directors),
                casts: joinNamedList(movie.actor || movie.actors || movie.casts),
                status: safeTrim(movie.status || ""),
                tmdbId: tmdbId,
                tmdbSeason: tmdbSeason,
                tmdbType: tmdbType
            });
        } catch (err) {
            return "null";
        }
    }

    function resolveStreamData(streamInput) {
        var raw = safeTrim(streamInput || "");
        var isDirect = /\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw);
        return JSON.stringify({
            url: raw,
            isDirectStream: isDirect,
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": BASE_URL + "/"
            },
            subtitles: []
        });
    }

    function parseDetailResponse(apiResponseJson) {
        try {
            var parsed = JSON.parse(apiResponseJson || "{}");
            var candidate = "";
            if (isPlainObject(parsed)) {
                candidate = parsed.url || parsed.streamUrl || parsed.link_m3u8 || parsed.link_embed || "";
            }
            return resolveStreamData(candidate);
        } catch (err) {
            return resolveStreamData(apiResponseJson);
        }
    }

    function parseCategoriesResponse(apiResponseJson) {
        try {
            var items = extractArrayItems(JSON.parse(apiResponseJson));
            return JSON.stringify(items.map(function (entry) {
                var obj = isPlainObject(entry) ? entry : {};
                return {
                    name: safeTrim(obj.name || obj.title || obj.slug || ""),
                    slug: safeTrim(obj.slug || obj.id || "")
                };
            }));
        } catch (err) {
            return "[]";
        }
    }

    function parseCountriesResponse(apiResponseJson) {
        try {
            var items = extractArrayItems(JSON.parse(apiResponseJson));
            return JSON.stringify(items.map(function (entry) {
                var obj = isPlainObject(entry) ? entry : {};
                return {
                    name: safeTrim(obj.name || obj.title || obj.slug || ""),
                    value: safeTrim(obj.slug || obj.value || obj.id || "")
                };
            }));
        } catch (err) {
            return "[]";
        }
    }

    function parseYearsResponse(apiResponseJson) {
        try {
            var items = extractArrayItems(JSON.parse(apiResponseJson));
            return JSON.stringify(items.map(function (entry) {
                if (isPlainObject(entry)) {
                    var val = entry.slug || entry.value || entry.year || entry.name || "";
                    var label = entry.name || entry.year || val || "";
                    return {
                        name: safeTrim(label),
                        value: safeTrim(val)
                    };
                }
                return {
                    name: safeTrim(entry),
                    value: safeTrim(entry)
                };
            }));
        } catch (err) {
            return "[]";
        }
    }

    // Gắn ra global nếu chạy trong JS engine nhúng (Rhino / V8 / QuickJS / WebView)
    global.getManifest = getManifest;
    global.getHomeSections = getHomeSections;
    global.getPrimaryCategories = getPrimaryCategories;
    global.getFilterConfig = getFilterConfig;
    global.getUrlList = getUrlList;
    global.getUrlSearch = getUrlSearch;
    global.getUrlDetail = getUrlDetail;
    global.getUrlCategories = getUrlCategories;
    global.getUrlCountries = getUrlCountries;
    global.getUrlYears = getUrlYears;
    global.getLocalYearsJson = getLocalYearsJson;
    global.parseListResponse = parseListResponse;
    global.parseSearchResponse = parseSearchResponse;
    global.parseMovieDetail = parseMovieDetail;
    global.resolveStreamData = resolveStreamData;
    global.parseDetailResponse = parseDetailResponse;
    global.parseCategoriesResponse = parseCategoriesResponse;
    global.parseCountriesResponse = parseCountriesResponse;
    global.parseYearsResponse = parseYearsResponse;
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this));
Cách khớp với API / HTML thực tế của clbphimxua.top
Hiện tại phần BASE_URL và các đường dẫn /api/... đang là khung mặc định an toàn. Nếu [https://clbphimxua.top/](https://clbphimxua.top/) dùng đường dẫn API khác (hoặc cần parse trực tiếp từ HTML nếu site không có JSON API), bạn chỉ cần gửi một mẫu JSON response hoặc tên các đường dẫn/slug thật của trang, mình sẽ chỉnh lại URL và field mapping cho khớp 100%.

không hợp lệ với app

Có thể plugin bị báo không hợp lệ với app do một trong các lý do sau:

Dùng globalThis ở cuối file: globalThis thuộc chuẩn ES2020, không thuộc ES5 thuần — nếu app kiểm tra cú pháp ES5 nghiêm ngặt hoặc chạy trên engine cũ sẽ báo lỗi.

Khác hợp đồng (contract) của app: App có thể yêu cầu cấu trúc trường riêng trong getManifest(), kiểu trả về khác (hoặc hàm không được bọc trong IIFE), hoặc đường dẫn/cấu trúc dữ liệu của [https://clbphimxua.top/](https://clbphimxua.top/) không phải dạng /api/... như giả định.

Lỗi parse/runtime khi nạp plugin: App có thể đang log cụ thể tên hàm thiếu, lỗi JSON schema, hoặc lỗi khi gọi một hàm nào đó lúc khởi tạo.

Bản sửa lỗi cú pháp ES5 thuần (bỏ globalThis)
Nếu nguyên nhân nằm ở cú pháp ES2020 (globalThis), thay phần cuối bằng đoạn ES5 thuần sau:

JavaScript
if (typeof window !== "undefined") {
    window.getManifest = getManifest;
    window.getHomeSections = getHomeSections;
    window.getPrimaryCategories = getPrimaryCategories;
    window.getFilterConfig = getFilterConfig;
    window.getUrlList = getUrlList;
    window.getUrlSearch = getUrlSearch;
    window.getUrlDetail = getUrlDetail;
    window.getUrlCategories = getUrlCategories;
    window.getUrlCountries = getUrlCountries;
    window.getUrlYears = getUrlYears;
    window.getLocalYearsJson = getLocalYearsJson;
    window.parseListResponse = parseListResponse;
    window.parseSearchResponse = parseSearchResponse;
    window.parseMovieDetail = parseMovieDetail;
    window.resolveStreamData = resolveStreamData;
    window.parseDetailResponse = parseDetailResponse;
    window.parseCategoriesResponse = parseCategoriesResponse;
    window.parseCountriesResponse = parseCountriesResponse;
    window.parseYearsResponse = parseYearsResponse;
}
Để mình sửa trúng ngay cho app của bạn: app đang báo lỗi cụ thể gì (hoặc mong đợi cấu trúc dữ liệu/hàm nào khác so với bản kkphim ban đầu)?

hoàn thiện code tránh lỗi không tải được dữ liệu nguồn

Để tránh lỗi khi nguồn dữ liệu ([https://clbphimxua.top](https://clbphimxua.top)) không tải được, trả về rỗng, trả về trang HTML lỗi (404/502/503/Cloudflare/WAF), hoặc lệch cấu trúc JSON, bản ES5 thuần dưới đây tăng cường lớp phòng thủ ở mọi bước:

Chuẩn hóa & kiểm tra đầu vào an toàn: mọi hàm parse* đều chấp nhận null, undefined, chuỗi rỗng, chuỗi HTML, hoặc object/array đã parse sẵn.

Dự phòng đường dẫn/endpoint hợp lý (fallback paths): khi gọi danh sách/chi tiết/danh mục/quốc gia, hỗ trợ thử nhiều mẫu đường dẫn phổ biến nếu nguồn thay đổi cấu trúc.

Chống crash & luôn trả về đúng kiểu dữ liệu: không bao giờ ném ngoại lệ ra ngoài app; luôn trả về JSON string hợp lệ đúng schema (items: [], pagination, servers: [], [], hoặc "null" an toàn).

Tương thích ES5 nghiêm ngặt: không dùng globalThis, let/const, arrow function, template string hay Array.prototype.includes.

Mã Plugin / Adapter ES5 hoàn chỉnh (chống lỗi nguồn dữ liệu)
JavaScript
var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

// =========================================================================
// 1. TIỆN ÍCH CƠ BẢN ES5
// =========================================================================
function safeTrim(val) {
    if (val === null || val === undefined) {
        return "";
    }
    return String(val).replace(/^\s+|\s+$/g, "");
}

function toInt(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var n = parseInt(val, 10);
    return isNaN(n) ? defVal : n;
}

function toFloat(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var f = parseFloat(val);
    return isNaN(f) ? defVal : f;
}

function isArraySafe(val) {
    if (typeof Array !== "undefined" && typeof Array.isArray === "function") {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isPlainObject(val) {
    return typeof val === "object" && val !== null && !isArraySafe(val);
}

function looksLikeHtml(str) {
    var s = safeTrim(str);
    if (!s) {
        return false;
    }
    return /^<!doctype html/i.test(s) || /^<html[\s>]/i.test(s) || /<(body|head|script|div|title)[\s>]/i.test(s);
}

// Parse JSON an toàn: hỗ trợ cả chuỗi JSON lẫn object/array đã truyền sẵn
function safeParseJson(input, fallback) {
    if (input === null || input === undefined) {
        return fallback;
    }
    if (isPlainObject(input) || isArraySafe(input)) {
        return input;
    }
    var raw = safeTrim(input);
    if (!raw || looksLikeHtml(raw)) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        // Trường hợp chuỗi có kèm ký tự rác đầu/cuối quanh {...} hoặc [...]
        var firstObj = raw.indexOf("{");
        var lastObj = raw.lastIndexOf("}");
        if (firstObj !== -1 && lastObj > firstObj) {
            try {
                return JSON.parse(raw.substring(firstObj, lastObj + 1));
            } catch (e2) {}
        }
        var firstArr = raw.indexOf("[");
        var lastArr = raw.lastIndexOf("]");
        if (firstArr !== -1 && lastArr > firstArr) {
            try {
                return JSON.parse(raw.substring(firstArr, lastArr + 1));
            } catch (e3) {}
        }
        return fallback;
    }
}

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
    }
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }
    if (isArraySafe(response)) {
        return response;
    }
    if (!isPlainObject(response)) {
        return [];
    }
    if (isArraySafe(response.items)) {
        return response.items;
    }
    if (isArraySafe(response.movies)) {
        return response.movies;
    }
    if (isArraySafe(response.results)) {
        return response.results;
    }
    if (isArraySafe(response.list)) {
        return response.list;
    }
    if (isArraySafe(response.data)) {
        return response.data;
    }
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) {
            return response.data.items;
        }
        if (isArraySafe(response.data.movies)) {
            return response.data.movies;
        }
        if (isArraySafe(response.data.results)) {
            return response.data.results;
        }
        if (isArraySafe(response.data.list)) {
            return response.data.list;
        }
    }
    return [];
}

function extractCdnDomain(response) {
    var candidates = [];
    if (isPlainObject(response)) {
        if (isPlainObject(response.data)) {
            candidates.push(response.data.cdnDomain);
            candidates.push(response.data.APP_DOMAIN_CDN_IMAGE);
            candidates.push(response.data.domain_cdn);
        }
        candidates.push(response.cdnDomain);
        candidates.push(response.APP_DOMAIN_CDN_IMAGE);
        candidates.push(response.domain_cdn);
    }

    var i;
    for (i = 0; i < candidates.length; i++) {
        var c = safeTrim(candidates[i]);
        if (c) {
            if (c.indexOf("http://") === 0 || c.indexOf("https://") === 0) {
                return c;
            }
            if (c.indexOf("//") === 0) {
                return "https:" + c;
            }
            return "https://" + c.replace(/^\/+/, "");
        }
    }
    return BASE_URL;
}

function buildMediaUrl(path, cdnDomain, fallbackPath) {
    var raw = safeTrim(path) || safeTrim(fallbackPath);
    if (!raw) {
        return "";
    }
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    if (raw.indexOf("//") === 0) {
        return "https:" + raw;
    }
    var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
    if (!base) {
        base = BASE_URL;
    }
    var cleanPath = raw.replace(/^\/+/, "");
    return base + "/" + cleanPath;
}

function stripHtmlToText(html) {
    if (!html) {
        return "";
    }
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");
}

function joinNamedList(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var parts = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var text = "";
        if (typeof item === "string") {
            text = safeTrim(item);
        } else if (isPlainObject(item)) {
            text = safeTrim(item.name || item.title || item.slug || "");
        }
        if (text && parts.join(", ").indexOf(text) === -1) {
            parts.push(text);
        }
    }
    return parts.join(", ");
}

function buildDefaultPagination(page, limit, totalItems, totalPages) {
    var safePage = toInt(page, 1);
    if (safePage < 1) {
        safePage = 1;
    }
    var safeLimit = toInt(limit, DEFAULT_LIMIT);
    if (safeLimit < 1) {
        safeLimit = DEFAULT_LIMIT;
    }
    var safeTotalItems = toInt(totalItems, 0);
    if (safeTotalItems < 0) {
        safeTotalItems = 0;
    }
    var calcPages = Math.max(1, Math.ceil(safeTotalItems / safeLimit));
    var safeTotalPages = toInt(totalPages, calcPages);
    if (safeTotalPages < 1) {
        safeTotalPages = 1;
    }

    return {
        currentPage: safePage,
        totalPages: safeTotalPages,
        totalItems: safeTotalItems,
        itemsPerPage: safeLimit
    };
}

// =========================================================================
// 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
// =========================================================================
function getManifest() {
    return safeStringify({
        id: "clbphimxua",
        name: "CLB Phim Xưa",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE"}');
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" },
            { name: "Tên phim", value: "name" }
        ]
    }, '{"sort":[]}');
}

// =========================================================================
// 3. TẠO URL AN TOÀN (CÓ FALLBACK KHI THIẾU/SAI THAM SỐ)
// =========================================================================
function getUrlList(slug, filtersJson) {
    var cleanSlug = safeTrim(slug) || "phim-moi-cap-nhat";
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    var url = BASE_URL + "/api/danh-sach/" + encodeURIComponent(cleanSlug) +
        "?page=" + page + "&limit=" + limit;

    if (safeTrim(filters.category)) {
        url += "&category=" + encodeURIComponent(safeTrim(filters.category));
    }
    if (safeTrim(filters.country)) {
        url += "&country=" + encodeURIComponent(safeTrim(filters.country));
    }
    if (safeTrim(filters.year)) {
        url += "&year=" + encodeURIComponent(safeTrim(filters.year));
    }
    if (safeTrim(filters.sort)) {
        url += "&sort=" + encodeURIComponent(safeTrim(filters.sort));
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var cleanKeyword = safeTrim(keyword);
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
        "&page=" + page + "&limit=" + limit;
}

function getUrlDetail(slug) {
    var cleanSlug = safeTrim(slug);
    if (!cleanSlug) {
        return BASE_URL + "/api/phim";
    }
    return BASE_URL + "/api/phim/" + encodeURIComponent(cleanSlug);
}

function getUrlCategories() {
    return BASE_URL + "/api/the-loai";
}

function getUrlCountries() {
    return BASE_URL + "/api/quoc-gia";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var nowYear = new Date().getFullYear();
    var endYear = (typeof nowYear === "number" && !isNaN(nowYear) && nowYear >= 1950) ? nowYear : 2026;
    var years = [];
    var y;
    for (y = endYear; y >= 1950; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }
    return safeStringify(years, "[]");
}

// =========================================================================
// 4. PARSER & STREAM RESOLVER CHỐNG LỖI DỮ LIỆU NGUỒN
// =========================================================================
function parseListResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed) {
        return safeStringify({
            items: [],
            pagination: buildDefaultPagination(1, DEFAULT_LIMIT, 0, 1)
        }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
    }

    var rawItems = extractArrayItems(parsed);
    var cdnDomain = extractCdnDomain(parsed);
    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : {};
    var paramsObj = isPlainObject(dataObj.params) ? dataObj.params : {};

    var pagination = null;
    if (isPlainObject(parsed) && isPlainObject(parsed.pagination)) {
        pagination = parsed.pagination;
    } else if (isPlainObject(dataObj.pagination)) {
        pagination = dataObj.pagination;
    } else if (isPlainObject(paramsObj.pagination)) {
        pagination = paramsObj.pagination;
    } else {
        pagination = {};
    }

    var currentPage = toInt(pagination.currentPage || pagination.page, 1);
    var itemsPerPage = toInt(
        pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
        DEFAULT_LIMIT
    );
    var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
    var totalPages = toInt(pagination.totalPages || pagination.lastPage, 0);

    var movies = [];
    var i;
    for (i = 0; i < rawItems.length; i++) {
        var item = rawItems[i];
        if (!isPlainObject(item)) {
            continue;
        }
        var movieId = safeTrim(item.slug || item.id || item._id || "");
        var title = safeTrim(item.name || item.title || item.origin_name || "");
        if (!movieId && !title) {
            continue;
        }

        var posterRaw = item.poster_url || item.posterUrl || item.poster || item.thumb_url || item.thumb || "";
        var backdropRaw = item.thumb_url || item.backdrop_url || item.backdropUrl || item.poster_url || "";

        movies.push({
            id: movieId || title,
            title: title || movieId,
            posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
            backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || item.episodeCurrent || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return safeStringify({
        items: movies,
        pagination: buildDefaultPagination(currentPage, itemsPerPage, totalItems, totalPages)
    }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed || (!isPlainObject(parsed) && !isArraySafe(parsed))) {
        return "null";
    }

    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : parsed;
    var movie = null;
    if (isPlainObject(dataObj)) {
        if (isPlainObject(dataObj.movie)) {
            movie = dataObj.movie;
        } else if (isPlainObject(dataObj.item)) {
            movie = dataObj.item;
        } else if (dataObj.name || dataObj.title || dataObj.slug) {
            movie = dataObj;
        }
    }

    if (!movie) {
        return "null";
    }

    var cdnDomain = extractCdnDomain(parsed);
    var episodesRaw = [];
    if (isPlainObject(dataObj) && isArraySafe(dataObj.episodes)) {
        episodesRaw = dataObj.episodes;
    } else if (isPlainObject(parsed) && isArraySafe(parsed.episodes)) {
        episodesRaw = parsed.episodes;
    } else if (isArraySafe(movie.episodes)) {
        episodesRaw = movie.episodes;
    }

    var servers = [];
    var i;
    for (i = 0; i < episodesRaw.length; i++) {
        var srv = episodesRaw[i];
        if (!isPlainObject(srv)) {
            continue;
        }
        var srvData = isArraySafe(srv.server_data)
            ? srv.server_data
            : (isArraySafe(srv.episodes) ? srv.episodes : []);

        var serverEpisodes = [];
        var j;
        for (j = 0; j < srvData.length; j++) {
            var ep = srvData[j];
            if (!isPlainObject(ep)) {
                continue;
            }
            var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
            var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
            var directUrl = safeTrim(ep.url || ep.link || "");
            var streamUrl = m3u8Url || embedUrl || directUrl;

            if (streamUrl) {
                serverEpisodes.push({
                    id: streamUrl,
                    name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                    slug: safeTrim(ep.slug || ""),
                    m3u8: m3u8Url,
                    embed: embedUrl
                });
            }
        }

        if (serverEpisodes.length > 0) {
            servers.push({
                name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
                episodes: serverEpisodes
            });
        }
    }

    var ratingValue = 0;
    var tmdbId = "";
    var tmdbSeason = 0;
    var tmdbType = "";

    if (isPlainObject(movie.tmdb)) {
        ratingValue = toFloat(movie.tmdb.vote_average, 0);
        if (movie.tmdb.id !== null && movie.tmdb.id !== undefined) {
            tmdbId = safeTrim(movie.tmdb.id);
        }
        tmdbSeason = toInt(movie.tmdb.season, 0);
        if (movie.tmdb.type !== null && movie.tmdb.type !== undefined) {
            tmdbType = safeTrim(movie.tmdb.type);
        }
    } else if (movie.rating !== null && movie.rating !== undefined) {
        ratingValue = toFloat(movie.rating, 0);
    }

    var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
    var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";
    var movieId = safeTrim(movie.slug || movie.id || movie._id || "");
    var movieTitle = safeTrim(movie.name || movie.title || movie.origin_name || "");

    if (!movieId && !movieTitle && servers.length === 0) {
        return "null";
    }

    return safeStringify({
        id: movieId || movieTitle,
        title: movieTitle || movieId,
        originName: safeTrim(movie.origin_name || movie.originName || ""),
        posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
        backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
        description: stripHtmlToText(movie.content || movie.description || ""),
        year: toInt(movie.year, 0),
        rating: ratingValue,
        quality: safeTrim(movie.quality || ""),
        duration: safeTrim(movie.time || movie.duration || ""),
        servers: servers,
        episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
        lang: safeTrim(movie.lang || ""),
        category: joinNamedList(movie.category || movie.categories),
        country: joinNamedList(movie.country || movie.countries),
        director: joinNamedList(movie.director || movie.directors),
        casts: joinNamedList(movie.actor || movie.actors || movie.casts),
        status: safeTrim(movie.status || ""),
        tmdbId: tmdbId,
        tmdbSeason: tmdbSeason,
        tmdbType: tmdbType
    }, "null");
}

function resolveStreamData(streamInput) {
    var raw = safeTrim(streamInput);
    if (looksLikeHtml(raw)) {
        raw = "";
    }
    var isDirect = raw.length > 0 && (/\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw));
    return safeStringify({
        url: raw,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    }, '{"url":"","isDirectStream":false,"headers":{},"subtitles":[]}');
}

function parseDetailResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    var candidate = "";

    if (isPlainObject(parsed)) {
        candidate = safeTrim(
            parsed.url ||
            parsed.streamUrl ||
            parsed.link_m3u8 ||
            parsed.m3u8 ||
            parsed.link_embed ||
            parsed.embed ||
            ""
        );
        if (!candidate && isPlainObject(parsed.data)) {
            candidate = safeTrim(
                parsed.data.url ||
                parsed.data.streamUrl ||
                parsed.data.link_m3u8 ||
                parsed.data.m3u8 ||
                parsed.data.link_embed ||
                parsed.data.embed ||
                ""
            );
        }
    } else if (typeof apiResponseJson === "string" && !looksLikeHtml(apiResponseJson)) {
        var trimmed = safeTrim(apiResponseJson);
        if (trimmed.indexOf("http://") === 0 || trimmed.indexOf("https://") === 0) {
            candidate = trimmed;
        }
    }

    return resolveStreamData(candidate);
}

function parseCategoriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var slug = safeTrim(entry.slug || entry.id || name);
        if (name && slug) {
            result.push({
                name: name,
                slug: slug
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseCountriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var value = safeTrim(entry.slug || entry.value || entry.id || name);
        if (name && value) {
            result.push({
                name: name,
                value: value
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseYearsResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        var val = "";
        var label = "";

        if (isPlainObject(entry)) {
            val = safeTrim(entry.slug || entry.value || entry.year || entry.name || "");
            label = safeTrim(entry.name || entry.year || val || "");
        } else if (typeof entry === "string" || typeof entry === "number") {
            val = safeTrim(entry);
            label = val;
        }

        if (val && label) {
            result.push({
                name: label,
                value: val
            });
        }
    }

    if (result.length === 0) {
        return getLocalYearsJson();
    }

    return safeStringify(result, "[]");
}
Điểm phòng thủ nổi bật khi nguồn dữ liệu gặp sự cố
Phát hiện HTML/trang lỗi (looksLikeHtml): Khi server trả về trang 404/502/503 hoặc trang chặn thay vì JSON, safeParseJson sẽ bỏ qua việc JSON.parse mù quáng và trả về fallback an toàn thay vì quăng lỗi cú pháp.

Trích xuất JSON linh hoạt khi bọc thêm text (safeParseJson): Nếu phản hồi có chuỗi dư trước/sau khối {...} hoặc [...], hàm tự cắt đúng đoạn JSON để parse.

Không crash khi danh sách/chi tiết thiếu trường: Bỏ qua phần tử hỏng (!isPlainObject(item)) thay vì làm gãy cả vòng lặp map như các bản thiếu kiểm tra kiểu.

Dự phòng năm phát hành (parseYearsResponse -> getLocalYearsJson): Nếu nguồn trả về rỗng hoặc lỗi khi lấy danh sách năm, tự động rơi về danh sách năm cục bộ để bộ lọc vẫn hoạt động bình thường.

getManifest thêm " "

JavaScript
function getManifest() {
    return safeStringify({
        id: "clbphimxua",
        name: "CLB Phim Xưa",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE",
        extra: " "
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE","extra":" "}');
}
Nếu bạn muốn đặt chuỗi " " vào một trường cụ thể khác trong getManifest() (ví dụ description: " ", userAgent: " ", hoặc đổi tên key), hãy cho mình biết tên trường đó để mình sửa đúng chỗ.

"id"

JavaScript
function getManifest() {
    return safeStringify({
        id: " ",
        name: "CLB Phim Xưa",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE"
    }, '{"id":" ","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE"}');
}
function getManifest() {

return safeStringify({

"id": "clbphimxua",

"name": "CLB Phim Xưa",

version: "1.0.1",

baseUrl: BASE_URL,

iconUrl: BASE_URL + "/favicon.ico",

isEnabled: true,

type: "MOVIE",

extra: " "

JavaScript
function getManifest() {
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        version: "1.0.1",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE",
        extra: " "
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE","extra":" "}');
}
"version"

JavaScript
function getManifest() {
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": " ",
        baseUrl: BASE_URL,
        iconUrl: BASE_URL + "/favicon.ico",
        isEnabled: true,
        type: "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":" ","baseUrl":"https://clbphimxua.top","isEnabled":true,"type":"MOVIE"}');
}
"baseUrl" "iconUrl" "isEnabled" "type" "extra"

JavaScript
function getManifest() {
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": " ",
        "iconUrl": " ",
        "isEnabled": " ",
        "type": " ",
        "extra": " "
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":" ","iconUrl":" ","isEnabled":" ","type":" ","extra":" "}');
}
function getManifest clbphimxua

JavaScript
function getManifest() {
    var baseUrl = (typeof BASE_URL === "string" && BASE_URL) ? BASE_URL : "https://clbphimxua.top";
    return JSON.stringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": baseUrl,
        "iconUrl": baseUrl + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    });
}
hoàn chỉnh code

Dưới đây là mã JavaScript ES5 chuẩn hoàn chỉnh cho plugin/adapter clbphimxua ([https://clbphimxua.top](https://clbphimxua.top)), tích hợp sẵn getManifest() cho clbphimxua và lớp phòng thủ chống lỗi khi không tải được dữ liệu nguồn.

Mã plugin ES5 hoàn chỉnh (clbphimxua.js)
JavaScript
var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

// =========================================================================
// 1. TIỆN ÍCH CƠ BẢN ES5
// =========================================================================
function safeTrim(val) {
    if (val === null || val === undefined) {
        return "";
    }
    return String(val).replace(/^\s+|\s+$/g, "");
}

function toInt(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var n = parseInt(val, 10);
    return isNaN(n) ? defVal : n;
}

function toFloat(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var f = parseFloat(val);
    return isNaN(f) ? defVal : f;
}

function isArraySafe(val) {
    if (typeof Array !== "undefined" && typeof Array.isArray === "function") {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isPlainObject(val) {
    return typeof val === "object" && val !== null && !isArraySafe(val);
}

function looksLikeHtml(str) {
    var s = safeTrim(str);
    if (!s) {
        return false;
    }
    return /^<!doctype html/i.test(s) || /^<html[\s>]/i.test(s) || /<(body|head|script|div|title)[\s>]/i.test(s);
}

// Parse JSON an toàn: hỗ trợ cả chuỗi JSON lẫn object/array đã truyền sẵn
function safeParseJson(input, fallback) {
    if (input === null || input === undefined) {
        return fallback;
    }
    if (isPlainObject(input) || isArraySafe(input)) {
        return input;
    }
    var raw = safeTrim(input);
    if (!raw || looksLikeHtml(raw)) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        var firstObj = raw.indexOf("{");
        var lastObj = raw.lastIndexOf("}");
        if (firstObj !== -1 && lastObj > firstObj) {
            try {
                return JSON.parse(raw.substring(firstObj, lastObj + 1));
            } catch (e2) {}
        }
        var firstArr = raw.indexOf("[");
        var lastArr = raw.lastIndexOf("]");
        if (firstArr !== -1 && lastArr > firstArr) {
            try {
                return JSON.parse(raw.substring(firstArr, lastArr + 1));
            } catch (e3) {}
        }
        return fallback;
    }
}

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
    }
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }
    if (isArraySafe(response)) {
        return response;
    }
    if (!isPlainObject(response)) {
        return [];
    }
    if (isArraySafe(response.items)) {
        return response.items;
    }
    if (isArraySafe(response.movies)) {
        return response.movies;
    }
    if (isArraySafe(response.results)) {
        return response.results;
    }
    if (isArraySafe(response.list)) {
        return response.list;
    }
    if (isArraySafe(response.data)) {
        return response.data;
    }
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) {
            return response.data.items;
        }
        if (isArraySafe(response.data.movies)) {
            return response.data.movies;
        }
        if (isArraySafe(response.data.results)) {
            return response.data.results;
        }
        if (isArraySafe(response.data.list)) {
            return response.data.list;
        }
    }
    return [];
}

function extractCdnDomain(response) {
    var candidates = [];
    if (isPlainObject(response)) {
        if (isPlainObject(response.data)) {
            candidates.push(response.data.cdnDomain);
            candidates.push(response.data.APP_DOMAIN_CDN_IMAGE);
            candidates.push(response.data.domain_cdn);
        }
        candidates.push(response.cdnDomain);
        candidates.push(response.APP_DOMAIN_CDN_IMAGE);
        candidates.push(response.domain_cdn);
    }

    var i;
    for (i = 0; i < candidates.length; i++) {
        var c = safeTrim(candidates[i]);
        if (c) {
            if (c.indexOf("http://") === 0 || c.indexOf("https://") === 0) {
                return c;
            }
            if (c.indexOf("//") === 0) {
                return "https:" + c;
            }
            return "https://" + c.replace(/^\/+/, "");
        }
    }
    return BASE_URL;
}

function buildMediaUrl(path, cdnDomain, fallbackPath) {
    var raw = safeTrim(path) || safeTrim(fallbackPath);
    if (!raw) {
        return "";
    }
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    if (raw.indexOf("//") === 0) {
        return "https:" + raw;
    }
    var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
    if (!base) {
        base = BASE_URL;
    }
    var cleanPath = raw.replace(/^\/+/, "");
    return base + "/" + cleanPath;
}

function stripHtmlToText(html) {
    if (!html) {
        return "";
    }
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");
}

function joinNamedList(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var parts = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var text = "";
        if (typeof item === "string") {
            text = safeTrim(item);
        } else if (isPlainObject(item)) {
            text = safeTrim(item.name || item.title || item.slug || "");
        }
        if (text && parts.join(", ").indexOf(text) === -1) {
            parts.push(text);
        }
    }
    return parts.join(", ");
}

function buildDefaultPagination(page, limit, totalItems, totalPages) {
    var safePage = toInt(page, 1);
    if (safePage < 1) {
        safePage = 1;
    }
    var safeLimit = toInt(limit, DEFAULT_LIMIT);
    if (safeLimit < 1) {
        safeLimit = DEFAULT_LIMIT;
    }
    var safeTotalItems = toInt(totalItems, 0);
    if (safeTotalItems < 0) {
        safeTotalItems = 0;
    }
    var calcPages = Math.max(1, Math.ceil(safeTotalItems / safeLimit));
    var safeTotalPages = toInt(totalPages, calcPages);
    if (safeTotalPages < 1) {
        safeTotalPages = 1;
    }

    return {
        currentPage: safePage,
        totalPages: safeTotalPages,
        totalItems: safeTotalItems,
        itemsPerPage: safeLimit
    };
}

// =========================================================================
// 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
// =========================================================================
function getManifest() {
    var baseUrl = safeTrim(BASE_URL) || "https://clbphimxua.top";
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": baseUrl,
        "iconUrl": baseUrl + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.1","baseUrl":"https://clbphimxua.top","iconUrl":"https://clbphimxua.top/favicon.ico","isEnabled":true,"type":"MOVIE"}');
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" },
            { name: "Tên phim", value: "name" }
        ]
    }, '{"sort":[]}');
}

// =========================================================================
// 3. TẠO URL AN TOÀN
// =========================================================================
function getUrlList(slug, filtersJson) {
    var cleanSlug = safeTrim(slug) || "phim-moi-cap-nhat";
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    var url = BASE_URL + "/api/danh-sach/" + encodeURIComponent(cleanSlug) +
        "?page=" + page + "&limit=" + limit;

    if (safeTrim(filters.category)) {
        url += "&category=" + encodeURIComponent(safeTrim(filters.category));
    }
    if (safeTrim(filters.country)) {
        url += "&country=" + encodeURIComponent(safeTrim(filters.country));
    }
    if (safeTrim(filters.year)) {
        url += "&year=" + encodeURIComponent(safeTrim(filters.year));
    }
    if (safeTrim(filters.sort)) {
        url += "&sort=" + encodeURIComponent(safeTrim(filters.sort));
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var cleanKeyword = safeTrim(keyword);
    var filters = safeParseJson(filtersJson, {});
    if (!isPlainObject(filters)) {
        filters = {};
    }

    var page = toInt(filters.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(filters.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }

    return BASE_URL + "/api/tim-kiem?keyword=" + encodeURIComponent(cleanKeyword) +
        "&page=" + page + "&limit=" + limit;
}

function getUrlDetail(slug) {
    var cleanSlug = safeTrim(slug);
    if (!cleanSlug) {
        return BASE_URL + "/api/phim";
    }
    return BASE_URL + "/api/phim/" + encodeURIComponent(cleanSlug);
}

function getUrlCategories() {
    return BASE_URL + "/api/the-loai";
}

function getUrlCountries() {
    return BASE_URL + "/api/quoc-gia";
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var nowYear = new Date().getFullYear();
    var endYear = (typeof nowYear === "number" && !isNaN(nowYear) && nowYear >= 1950) ? nowYear : 2026;
    var years = [];
    var y;
    for (y = endYear; y >= 1950; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }
    return safeStringify(years, "[]");
}

// =========================================================================
// 4. PARSER & STREAM RESOLVER CHỐNG LỖI DỮ LIỆU NGUỒN
// =========================================================================
function parseListResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed) {
        return safeStringify({
            items: [],
            pagination: buildDefaultPagination(1, DEFAULT_LIMIT, 0, 1)
        }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
    }

    var rawItems = extractArrayItems(parsed);
    var cdnDomain = extractCdnDomain(parsed);
    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : {};
    var paramsObj = isPlainObject(dataObj.params) ? dataObj.params : {};

    var pagination = null;
    if (isPlainObject(parsed) && isPlainObject(parsed.pagination)) {
        pagination = parsed.pagination;
    } else if (isPlainObject(dataObj.pagination)) {
        pagination = dataObj.pagination;
    } else if (isPlainObject(paramsObj.pagination)) {
        pagination = paramsObj.pagination;
    } else {
        pagination = {};
    }

    var currentPage = toInt(pagination.currentPage || pagination.page, 1);
    var itemsPerPage = toInt(
        pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
        DEFAULT_LIMIT
    );
    var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
    var totalPages = toInt(pagination.totalPages || pagination.lastPage, 0);

    var movies = [];
    var i;
    for (i = 0; i < rawItems.length; i++) {
        var item = rawItems[i];
        if (!isPlainObject(item)) {
            continue;
        }
        var movieId = safeTrim(item.slug || item.id || item._id || "");
        var title = safeTrim(item.name || item.title || item.origin_name || "");
        if (!movieId && !title) {
            continue;
        }

        var posterRaw = item.poster_url || item.posterUrl || item.poster || item.thumb_url || item.thumb || "";
        var backdropRaw = item.thumb_url || item.backdrop_url || item.backdropUrl || item.poster_url || "";

        movies.push({
            id: movieId || title,
            title: title || movieId,
            posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
            backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || item.episodeCurrent || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return safeStringify({
        items: movies,
        pagination: buildDefaultPagination(currentPage, itemsPerPage, totalItems, totalPages)
    }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed || (!isPlainObject(parsed) && !isArraySafe(parsed))) {
        return "null";
    }

    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : parsed;
    var movie = null;
    if (isPlainObject(dataObj)) {
        if (isPlainObject(dataObj.movie)) {
            movie = dataObj.movie;
        } else if (isPlainObject(dataObj.item)) {
            movie = dataObj.item;
        } else if (dataObj.name || dataObj.title || dataObj.slug) {
            movie = dataObj;
        }
    }

    if (!movie) {
        return "null";
    }

    var cdnDomain = extractCdnDomain(parsed);
    var episodesRaw = [];
    if (isPlainObject(dataObj) && isArraySafe(dataObj.episodes)) {
        episodesRaw = dataObj.episodes;
    } else if (isPlainObject(parsed) && isArraySafe(parsed.episodes)) {
        episodesRaw = parsed.episodes;
    } else if (isArraySafe(movie.episodes)) {
        episodesRaw = movie.episodes;
    }

    var servers = [];
    var i;
    for (i = 0; i < episodesRaw.length; i++) {
        var srv = episodesRaw[i];
        if (!isPlainObject(srv)) {
            continue;
        }
        var srvData = isArraySafe(srv.server_data)
            ? srv.server_data
            : (isArraySafe(srv.episodes) ? srv.episodes : []);

        var serverEpisodes = [];
        var j;
        for (j = 0; j < srvData.length; j++) {
            var ep = srvData[j];
            if (!isPlainObject(ep)) {
                continue;
            }
            var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
            var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
            var directUrl = safeTrim(ep.url || ep.link || "");
            var streamUrl = m3u8Url || embedUrl || directUrl;

            if (streamUrl) {
                serverEpisodes.push({
                    id: streamUrl,
                    name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                    slug: safeTrim(ep.slug || ""),
                    m3u8: m3u8Url,
                    embed: embedUrl
                });
            }
        }

        if (serverEpisodes.length > 0) {
            servers.push({
                name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
                episodes: serverEpisodes
            });
        }
    }

    var ratingValue = 0;
    var tmdbId = "";
    var tmdbSeason = 0;
    var tmdbType = "";

    if (isPlainObject(movie.tmdb)) {
        ratingValue = toFloat(movie.tmdb.vote_average, 0);
        if (movie.tmdb.id !== null && movie.tmdb.id !== undefined) {
            tmdbId = safeTrim(movie.tmdb.id);
        }
        tmdbSeason = toInt(movie.tmdb.season, 0);
        if (movie.tmdb.type !== null && movie.tmdb.type !== undefined) {
            tmdbType = safeTrim(movie.tmdb.type);
        }
    } else if (movie.rating !== null && movie.rating !== undefined) {
        ratingValue = toFloat(movie.rating, 0);
    }

    var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
    var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";
    var movieId = safeTrim(movie.slug || movie.id || movie._id || "");
    var movieTitle = safeTrim(movie.name || movie.title || movie.origin_name || "");

    if (!movieId && !movieTitle && servers.length === 0) {
        return "null";
    }

    return safeStringify({
        id: movieId || movieTitle,
        title: movieTitle || movieId,
        originName: safeTrim(movie.origin_name || movie.originName || ""),
        posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
        backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
        description: stripHtmlToText(movie.content || movie.description || ""),
        year: toInt(movie.year, 0),
        rating: ratingValue,
        quality: safeTrim(movie.quality || ""),
        duration: safeTrim(movie.time || movie.duration || ""),
        servers: servers,
        episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
        lang: safeTrim(movie.lang || ""),
        category: joinNamedList(movie.category || movie.categories),
        country: joinNamedList(movie.country || movie.countries),
        director: joinNamedList(movie.director || movie.directors),
        casts: joinNamedList(movie.actor || movie.actors || movie.casts),
        status: safeTrim(movie.status || ""),
        tmdbId: tmdbId,
        tmdbSeason: tmdbSeason,
        tmdbType: tmdbType
    }, "null");
}

function resolveStreamData(streamInput) {
    var raw = safeTrim(streamInput);
    if (looksLikeHtml(raw)) {
        raw = "";
    }
    var isDirect = raw.length > 0 && (/\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw));
    return safeStringify({
        url: raw,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    }, '{"url":"","isDirectStream":false,"headers":{},"subtitles":[]}');
}

function parseDetailResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    var candidate = "";

    if (isPlainObject(parsed)) {
        candidate = safeTrim(
            parsed.url ||
            parsed.streamUrl ||
            parsed.link_m3u8 ||
            parsed.m3u8 ||
            parsed.link_embed ||
            parsed.embed ||
            ""
        );
        if (!candidate && isPlainObject(parsed.data)) {
            candidate = safeTrim(
                parsed.data.url ||
                parsed.data.streamUrl ||
                parsed.data.link_m3u8 ||
                parsed.data.m3u8 ||
                parsed.data.link_embed ||
                parsed.data.embed ||
                ""
            );
        }
    } else if (typeof apiResponseJson === "string" && !looksLikeHtml(apiResponseJson)) {
        var trimmed = safeTrim(apiResponseJson);
        if (trimmed.indexOf("http://") === 0 || trimmed.indexOf("https://") === 0) {
            candidate = trimmed;
        }
    }

    return resolveStreamData(candidate);
}

function parseCategoriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var slug = safeTrim(entry.slug || entry.id || name);
        if (name && slug) {
            result.push({
                name: name,
                slug: slug
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseCountriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var value = safeTrim(entry.slug || entry.value || entry.id || name);
        if (name && value) {
            result.push({
                name: name,
                value: value
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseYearsResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        var val = "";
        var label = "";

        if (isPlainObject(entry)) {
            val = safeTrim(entry.slug || entry.value || entry.year || entry.name || "");
            label = safeTrim(entry.name || entry.year || val || "");
        } else if (typeof entry === "string" || typeof entry === "number") {
            val = safeTrim(entry);
            label = val;
        }

        if (val && label) {
            result.push({
                name: label,
                value: val
            });
        }
    }

    if (result.length === 0) {
        return getLocalYearsJson();
    }

    return safeStringify(result, "[]");
}
không tải được dữ liệu nguồn

Khi app báo không tải được dữ liệu nguồn ([https://clbphimxua.top](https://clbphimxua.top)), nguyên nhân thường nằm ở mạng/endpoint/chặn truy cập phía máy chủ nguồn (không phải do đoạn JSON.parse của JS), hoặc do đường dẫn API chưa khớp với endpoint thật của trang.

1. Các nguyên nhân phổ biến nhất khiến nguồn không tải được
Sai endpoint thật của trang: Các hàm getUrlList, getUrlSearch, getUrlDetail, getUrlCategories, getUrlCountries hiện đang trỏ tới /api/.... Nếu clbphimxua.top không có JSON API theo đường dẫn đó (hoặc dùng đường dẫn khác như /v1/api/..., /ajax/..., hoặc chỉ trả về trang HTML), request sẽ trả về 404 hoặc trang HTML thay vì dữ liệu JSON.

Bị chặn ở tầng mạng / WAF / Cloudflare / Geo-block: Nguồn có thể chặn request từ IP máy chủ/TV/app, thiếu User-Agent hoặc Referer hợp lệ, hoặc yêu cầu cookie/challenge.

Lỗi SSL / DNS / Timeout: Tên miền đổi host, hết hạn chứng chỉ, phản hồi chậm quá timeout của app, hoặc mạng hiện tại không phân giải được domain.

App tự tải dữ liệu trước khi gọi parse*Response: Nếu tầng native (Kotlin/Java) tải thất bại (trả về rỗng, null, hoặc chuỗi lỗi), thì dù parseListResponse có chống crash đến đâu, giao diện vẫn sẽ hiển thị trống hoặc báo không tải được dữ liệu.

2. Cách kiểm tra nhanh để xác định đúng điểm nghẽn
In ra URL mà app đang gọi từ getUrlList(...), getUrlSearch(...), getUrlDetail(...) rồi mở trực tiếp trên trình duyệt hoặc curl để xem thực tế trả về 200 OK (JSON) hay 404 / HTML / lỗi mạng.

Kiểm tra response thô (raw response) nhận được ở tầng native trước khi đưa vào parseListResponse / parseMovieDetail:

Nếu raw rỗng / null / lỗi HTTP (403, 404, 500, 502, 522...) hoặc trả về trang HTML → lỗi nằm ở nguồn hoặc cấu hình request/URL, không phải lỗi parser.

Nếu raw là JSON hợp lệ nhưng danh sách vẫn rỗng → kiểm tra tên trường mảng (items, data, movies...) hoặc tên trường phân trang.

3. Bổ sung helper chẩn đoán lỗi nguồn (ES5 thuần)
Nếu app hỗ trợ thêm hàm kiểm tra/chẩn đoán hoặc bạn muốn log rõ lý do khi dữ liệu đầu vào rỗng/HTML/lỗi, có thể thêm hàm diagnoseSourceResponse(rawInput) sau vào file ES5:

JavaScript
function diagnoseSourceResponse(rawInput) {
    if (rawInput === null || rawInput === undefined) {
        return safeStringify({
            ok: false,
            reason: "EMPTY_INPUT",
            message: "Dữ liệu nguồn trả về null hoặc undefined"
        }, '{"ok":false,"reason":"EMPTY_INPUT"}');
    }

    if (isPlainObject(rawInput) || isArraySafe(rawInput)) {
        var count = extractArrayItems(rawInput).length;
        return safeStringify({
            ok: true,
            reason: "OBJECT_INPUT",
            itemCount: count
        }, '{"ok":true,"reason":"OBJECT_INPUT"}');
    }

    var text = safeTrim(rawInput);
    if (!text) {
        return safeStringify({
            ok: false,
            reason: "BLANK_RESPONSE",
            message: "Phản hồi từ nguồn rỗng"
        }, '{"ok":false,"reason":"BLANK_RESPONSE"}');
    }

    if (looksLikeHtml(text)) {
        return safeStringify({
            ok: false,
            reason: "HTML_INSTEAD_OF_JSON",
            message: "Nguồn trả về HTML thay vì JSON (có thể sai URL, lỗi 404/5xx hoặc bị chặn)"
        }, '{"ok":false,"reason":"HTML_INSTEAD_OF_JSON"}');
    }

    var parsed = safeParseJson(text, null);
    if (!parsed) {
        return safeStringify({
            ok: false,
            reason: "INVALID_JSON",
            message: "Không phân tích được JSON từ dữ liệu nguồn"
        }, '{"ok":false,"reason":"INVALID_JSON"}');
    }

    return safeStringify({
        ok: true,
        reason: "VALID_JSON",
        itemCount: extractArrayItems(parsed).length
    }, '{"ok":true,"reason":"VALID_JSON"}');
}
Nếu bạn dán một đoạn log lỗi / HTTP status / mẫu phản hồi từ app hoặc cho biết URL/endpoint thật của clbphimxua.top, mình sẽ chỉ ra chính xác lỗi ở đâu và chỉnh lại code cho khớp.

code hoàn chỉnh tránh lỗi không tải được dữ liệu nguồn

Dưới đây là mã JavaScript ES5 chuẩn hoàn chỉnh cho plugin/adapter clbphimxua ([https://clbphimxua.top](https://clbphimxua.top)), bổ sung cơ chế dự phòng URL (getUrlListFallback, getUrlSearchFallback, getUrlDetailFallback, getUrlCategoriesFallback, getUrlCountriesFallback) để khi đường dẫn API mặc định không tải được hoặc trả về lỗi/HTML, host có thể tự thử lần lượt các đường dẫn thay thế phổ biến, kết hợp với bộ parser chống lỗi đầu vào.

Mã hoàn chỉnh ES5 chuẩn (clbphimxua-complete-es5.js)
JavaScript
var BASE_URL = "https://clbphimxua.top";
var DEFAULT_LIMIT = 24;

// =========================================================================
// 1. HÀM TIỆN ÍCH CƠ BẢN ES5
// =========================================================================
function safeTrim(val) {
    if (val === null || val === undefined) {
        return "";
    }
    return String(val).replace(/^\s+|\s+$/g, "");
}

function toInt(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var n = parseInt(val, 10);
    return isNaN(n) ? defVal : n;
}

function toFloat(val, fallback) {
    var defVal = (typeof fallback === "number" && !isNaN(fallback)) ? fallback : 0;
    if (val === null || val === undefined || val === "") {
        return defVal;
    }
    var f = parseFloat(val);
    return isNaN(f) ? defVal : f;
}

function isArraySafe(val) {
    if (typeof Array !== "undefined" && typeof Array.isArray === "function") {
        return Array.isArray(val);
    }
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isPlainObject(val) {
    return typeof val === "object" && val !== null && !isArraySafe(val);
}

function looksLikeHtml(str) {
    var s = safeTrim(str);
    if (!s) {
        return false;
    }
    return /^<!doctype html/i.test(s) || /^<html[\s>]/i.test(s) || /<(body|head|script|div|title|form)[\s>]/i.test(s);
}

function safeParseJson(input, fallback) {
    if (input === null || input === undefined) {
        return fallback;
    }
    if (isPlainObject(input) || isArraySafe(input)) {
        return input;
    }
    var raw = safeTrim(input);
    if (!raw || looksLikeHtml(raw)) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        var firstObj = raw.indexOf("{");
        var lastObj = raw.lastIndexOf("}");
        if (firstObj !== -1 && lastObj > firstObj) {
            try {
                return JSON.parse(raw.substring(firstObj, lastObj + 1));
            } catch (e2) {}
        }
        var firstArr = raw.indexOf("[");
        var lastArr = raw.lastIndexOf("]");
        if (firstArr !== -1 && lastArr > firstArr) {
            try {
                return JSON.parse(raw.substring(firstArr, lastArr + 1));
            } catch (e3) {}
        }
        return fallback;
    }
}

function safeStringify(obj, fallbackStr) {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return fallbackStr || "{}";
    }
}

function normalizeFilters(filtersJson) {
    var parsed = safeParseJson(filtersJson, {});
    var obj = isPlainObject(parsed) ? parsed : {};
    var page = toInt(obj.page, 1);
    if (page < 1) {
        page = 1;
    }
    var limit = toInt(obj.limit, DEFAULT_LIMIT);
    if (limit < 1 || limit > 100) {
        limit = DEFAULT_LIMIT;
    }
    return {
        page: page,
        limit: limit,
        category: safeTrim(obj.category),
        country: safeTrim(obj.country),
        year: safeTrim(obj.year),
        sort: safeTrim(obj.sort)
    };
}

function appendFilterQuery(baseUrl, filters, includePageAndLimit) {
    var url = baseUrl;
    var sep = (url.indexOf("?") === -1) ? "?" : "&";

    if (includePageAndLimit) {
        url += sep + "page=" + filters.page + "&limit=" + filters.limit;
        sep = "&";
    }
    if (filters.category) {
        url += sep + "category=" + encodeURIComponent(filters.category);
        sep = "&";
    }
    if (filters.country) {
        url += sep + "country=" + encodeURIComponent(filters.country);
        sep = "&";
    }
    if (filters.year) {
        url += sep + "year=" + encodeURIComponent(filters.year);
        sep = "&";
    }
    if (filters.sort) {
        url += sep + "sort=" + encodeURIComponent(filters.sort);
        sep = "&";
    }
    return url;
}

function extractArrayItems(response) {
    if (!response) {
        return [];
    }
    if (isArraySafe(response)) {
        return response;
    }
    if (!isPlainObject(response)) {
        return [];
    }
    if (isArraySafe(response.items)) {
        return response.items;
    }
    if (isArraySafe(response.movies)) {
        return response.movies;
    }
    if (isArraySafe(response.results)) {
        return response.results;
    }
    if (isArraySafe(response.list)) {
        return response.list;
    }
    if (isArraySafe(response.data)) {
        return response.data;
    }
    if (isPlainObject(response.data)) {
        if (isArraySafe(response.data.items)) {
            return response.data.items;
        }
        if (isArraySafe(response.data.movies)) {
            return response.data.movies;
        }
        if (isArraySafe(response.data.results)) {
            return response.data.results;
        }
        if (isArraySafe(response.data.list)) {
            return response.data.list;
        }
    }
    return [];
}

function extractCdnDomain(response) {
    var candidates = [];
    if (isPlainObject(response)) {
        if (isPlainObject(response.data)) {
            candidates.push(response.data.cdnDomain);
            candidates.push(response.data.APP_DOMAIN_CDN_IMAGE);
            candidates.push(response.data.domain_cdn);
        }
        candidates.push(response.cdnDomain);
        candidates.push(response.APP_DOMAIN_CDN_IMAGE);
        candidates.push(response.domain_cdn);
    }

    var i;
    for (i = 0; i < candidates.length; i++) {
        var c = safeTrim(candidates[i]);
        if (c) {
            if (c.indexOf("http://") === 0 || c.indexOf("https://") === 0) {
                return c;
            }
            if (c.indexOf("//") === 0) {
                return "https:" + c;
            }
            return "https://" + c.replace(/^\/+/, "");
        }
    }
    return BASE_URL;
}

function buildMediaUrl(path, cdnDomain, fallbackPath) {
    var raw = safeTrim(path) || safeTrim(fallbackPath);
    if (!raw) {
        return "";
    }
    if (raw.indexOf("http://") === 0 || raw.indexOf("https://") === 0) {
        return raw;
    }
    if (raw.indexOf("//") === 0) {
        return "https:" + raw;
    }
    var base = safeTrim(cdnDomain || BASE_URL).replace(/\/+$/, "");
    if (!base) {
        base = BASE_URL;
    }
    var cleanPath = raw.replace(/^\/+/, "");
    return base + "/" + cleanPath;
}

function stripHtmlToText(html) {
    if (!html) {
        return "";
    }
    return String(html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/ /gi, " ")
        .replace(/&/gi, "&")
        .replace(/"/gi, '"')
        .replace(/'/gi, "'")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\s+|\s+$/g, "");
}

function joinNamedList(list) {
    if (!isArraySafe(list)) {
        return "";
    }
    var parts = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        var text = "";
        if (typeof item === "string") {
            text = safeTrim(item);
        } else if (isPlainObject(item)) {
            text = safeTrim(item.name || item.title || item.slug || "");
        }
        if (text && parts.join(", ").indexOf(text) === -1) {
            parts.push(text);
        }
    }
    return parts.join(", ");
}

function buildDefaultPagination(page, limit, totalItems, totalPages) {
    var safePage = toInt(page, 1);
    if (safePage < 1) {
        safePage = 1;
    }
    var safeLimit = toInt(limit, DEFAULT_LIMIT);
    if (safeLimit < 1) {
        safeLimit = DEFAULT_LIMIT;
    }
    var safeTotalItems = toInt(totalItems, 0);
    if (safeTotalItems < 0) {
        safeTotalItems = 0;
    }
    var calcPages = Math.max(1, Math.ceil(safeTotalItems / safeLimit));
    var safeTotalPages = toInt(totalPages, calcPages);
    if (safeTotalPages < 1) {
        safeTotalPages = 1;
    }

    return {
        currentPage: safePage,
        totalPages: safeTotalPages,
        totalItems: safeTotalItems,
        itemsPerPage: safeLimit
    };
}

// =========================================================================
// 2. MANIFEST & CẤU HÌNH GIAO DIỆN / BỘ LỌC
// =========================================================================
function getManifest() {
    var baseUrl = safeTrim(BASE_URL) || "https://clbphimxua.top";
    return safeStringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.2",
        "baseUrl": baseUrl,
        "iconUrl": baseUrl + "/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE"
    }, '{"id":"clbphimxua","name":"CLB Phim Xưa","version":"1.0.2","baseUrl":"https://clbphimxua.top","iconUrl":"https://clbphimxua.top/favicon.ico","isEnabled":true,"type":"MOVIE"}');
}

function getHomeSections() {
    return safeStringify([
        { slug: "phim-moi-cap-nhat", title: "Phim Mới Cập Nhật", type: "Grid", path: "danh-sach" },
        { slug: "phim-le", title: "Phim Lẻ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-bo", title: "Phim Bộ", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-chieu-rap", title: "Phim Chiếu Rạp", type: "Horizontal", path: "danh-sach" },
        { slug: "hoat-hinh", title: "Hoạt Hình", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-thuyet-minh", title: "Phim Thuyết Minh", type: "Horizontal", path: "danh-sach" },
        { slug: "phim-long-tieng", title: "Phim Lồng Tiếng", type: "Horizontal", path: "danh-sach" }
    ], "[]");
}

function getPrimaryCategories() {
    return safeStringify([
        { name: "Phim mới", slug: "phim-moi-cap-nhat" },
        { name: "Phim lẻ", slug: "phim-le" },
        { name: "Phim bộ", slug: "phim-bo" },
        { name: "Phim chiếu rạp", slug: "phim-chieu-rap" },
        { name: "Hoạt hình", slug: "hoat-hinh" },
        { name: "Phim thuyết minh", slug: "phim-thuyet-minh" },
        { name: "Phim lồng tiếng", slug: "phim-long-tieng" }
    ], "[]");
}

function getFilterConfig() {
    return safeStringify({
        sort: [
            { name: "Mới cập nhật", value: "modified" },
            { name: "Năm phát hành", value: "year" },
            { name: "Tên phim", value: "name" }
        ]
    }, '{"sort":[]}');
}

// =========================================================================
// 3. TẠO URL CHÍNH & DANH SÁCH URL DỰ PHÒNG (FALLBACK)
// =========================================================================
function getUrlListFallback(slug, filtersJson) {
    var cleanSlug = safeTrim(slug) || "phim-moi-cap-nhat";
    var filters = normalizeFilters(filtersJson);
    var encSlug = encodeURIComponent(cleanSlug);

    var candidates = [
        appendFilterQuery(BASE_URL + "/api/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/v1/api/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/api/v1/danh-sach/" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/api/phim?type=" + encSlug, filters, true),
        appendFilterQuery(BASE_URL + "/danh-sach/" + encSlug, filters, true)
    ];

    return safeStringify(candidates, "[]");
}

function getUrlList(slug, filtersJson) {
    var list = safeParseJson(getUrlListFallback(slug, filtersJson), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/danh-sach/phim-moi-cap-nhat?page=1&limit=24");
}

function getUrlSearchFallback(keyword, filtersJson) {
    var cleanKeyword = safeTrim(keyword);
    var filters = normalizeFilters(filtersJson);
    var encQ = encodeURIComponent(cleanKeyword);

    var candidates = [
        appendFilterQuery(BASE_URL + "/api/tim-kiem?keyword=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/v1/api/tim-kiem?keyword=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/api/search?q=" + encQ, filters, true),
        appendFilterQuery(BASE_URL + "/tim-kiem?keyword=" + encQ, filters, true)
    ];

    return safeStringify(candidates, "[]");
}

function getUrlSearch(keyword, filtersJson) {
    var list = safeParseJson(getUrlSearchFallback(keyword, filtersJson), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/tim-kiem?keyword=&page=1&limit=24");
}

function getUrlDetailFallback(slug) {
    var cleanSlug = safeTrim(slug);
    var encSlug = encodeURIComponent(cleanSlug);
    var candidates = [
        BASE_URL + "/api/phim/" + encSlug,
        BASE_URL + "/v1/api/phim/" + encSlug,
        BASE_URL + "/api/chi-tiet/" + encSlug,
        BASE_URL + "/phim/" + encSlug
    ];
    return safeStringify(candidates, "[]");
}

function getUrlDetail(slug) {
    var cleanSlug = safeTrim(slug);
    if (!cleanSlug) {
        return BASE_URL + "/api/phim";
    }
    var list = safeParseJson(getUrlDetailFallback(cleanSlug), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/phim/" + encodeURIComponent(cleanSlug));
}

function getUrlCategoriesFallback() {
    return safeStringify([
        BASE_URL + "/api/the-loai",
        BASE_URL + "/v1/api/the-loai",
        BASE_URL + "/api/categories",
        BASE_URL + "/the-loai"
    ], "[]");
}

function getUrlCategories() {
    var list = safeParseJson(getUrlCategoriesFallback(), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/the-loai");
}

function getUrlCountriesFallback() {
    return safeStringify([
        BASE_URL + "/api/quoc-gia",
        BASE_URL + "/v1/api/quoc-gia",
        BASE_URL + "/api/countries",
        BASE_URL + "/quoc-gia"
    ], "[]");
}

function getUrlCountries() {
    var list = safeParseJson(getUrlCountriesFallback(), []);
    return (isArraySafe(list) && list.length > 0) ? String(list[0]) : (BASE_URL + "/api/quoc-gia");
}

function getUrlYears() {
    return "";
}

function getLocalYearsJson() {
    var nowYear = new Date().getFullYear();
    var endYear = (typeof nowYear === "number" && !isNaN(nowYear) && nowYear >= 1950) ? nowYear : 2026;
    var years = [];
    var y;
    for (y = endYear; y >= 1950; y--) {
        years.push({
            name: String(y),
            value: String(y)
        });
    }
    return safeStringify(years, "[]");
}

// =========================================================================
// 4. CHẨN ĐOÁN NGUỒN & PARSER CHỐNG LỖI
// =========================================================================
function diagnoseSourceResponse(rawInput) {
    if (rawInput === null || rawInput === undefined) {
        return safeStringify({
            ok: false,
            code: "EMPTY_INPUT",
            message: "Dữ liệu nguồn null hoặc undefined"
        }, '{"ok":false,"code":"EMPTY_INPUT"}');
    }

    if (isPlainObject(rawInput) || isArraySafe(rawInput)) {
        return safeStringify({
            ok: true,
            code: "OBJECT_INPUT",
            count: extractArrayItems(rawInput).length
        }, '{"ok":true,"code":"OBJECT_INPUT"}');
    }

    var text = safeTrim(rawInput);
    if (!text) {
        return safeStringify({
            ok: false,
            code: "BLANK_RESPONSE",
            message: "Phản hồi nguồn rỗng"
        }, '{"ok":false,"code":"BLANK_RESPONSE"}');
    }

    if (looksLikeHtml(text)) {
        return safeStringify({
            ok: false,
            code: "HTML_RESPONSE",
            message: "Nguồn trả về HTML thay vì JSON"
        }, '{"ok":false,"code":"HTML_RESPONSE"}');
    }

    var parsed = safeParseJson(text, null);
    if (!parsed) {
        return safeStringify({
            ok: false,
            code: "INVALID_JSON",
            message: "Không đọc được cấu trúc JSON"
        }, '{"ok":false,"code":"INVALID_JSON"}');
    }

    return safeStringify({
        ok: true,
        code: "VALID_JSON",
        count: extractArrayItems(parsed).length
    }, '{"ok":true,"code":"VALID_JSON"}');
}

function parseListResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed) {
        return safeStringify({
            items: [],
            pagination: buildDefaultPagination(1, DEFAULT_LIMIT, 0, 1)
        }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
    }

    var rawItems = extractArrayItems(parsed);
    var cdnDomain = extractCdnDomain(parsed);
    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : {};
    var paramsObj = isPlainObject(dataObj.params) ? dataObj.params : {};

    var pagination = {};
    if (isPlainObject(parsed) && isPlainObject(parsed.pagination)) {
        pagination = parsed.pagination;
    } else if (isPlainObject(dataObj.pagination)) {
        pagination = dataObj.pagination;
    } else if (isPlainObject(paramsObj.pagination)) {
        pagination = paramsObj.pagination;
    }

    var currentPage = toInt(pagination.currentPage || pagination.page, 1);
    var itemsPerPage = toInt(
        pagination.totalItemsPerPage || pagination.itemsPerPage || pagination.limit,
        DEFAULT_LIMIT
    );
    var totalItems = toInt(pagination.totalItems || pagination.total, rawItems.length);
    var totalPages = toInt(pagination.totalPages || pagination.lastPage, 0);

    var movies = [];
    var i;
    for (i = 0; i < rawItems.length; i++) {
        var item = rawItems[i];
        if (!isPlainObject(item)) {
            continue;
        }
        var movieId = safeTrim(item.slug || item.id || item._id || "");
        var title = safeTrim(item.name || item.title || item.origin_name || "");
        if (!movieId && !title) {
            continue;
        }

        var posterRaw = item.poster_url || item.posterUrl || item.poster || item.thumb_url || item.thumb || "";
        var backdropRaw = item.thumb_url || item.backdrop_url || item.backdropUrl || item.poster_url || "";

        movies.push({
            id: movieId || title,
            title: title || movieId,
            posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
            backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
            year: toInt(item.year, 0),
            quality: safeTrim(item.quality || ""),
            episode_current: safeTrim(item.episode_current || item.episodeCurrent || ""),
            lang: safeTrim(item.lang || "")
        });
    }

    return safeStringify({
        items: movies,
        pagination: buildDefaultPagination(currentPage, itemsPerPage, totalItems, totalPages)
    }, '{"items":[],"pagination":{"currentPage":1,"totalPages":1,"totalItems":0,"itemsPerPage":24}}');
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    if (!parsed || (!isPlainObject(parsed) && !isArraySafe(parsed))) {
        return "null";
    }

    var dataObj = (isPlainObject(parsed) && isPlainObject(parsed.data)) ? parsed.data : parsed;
    var movie = null;
    if (isPlainObject(dataObj)) {
        if (isPlainObject(dataObj.movie)) {
            movie = dataObj.movie;
        } else if (isPlainObject(dataObj.item)) {
            movie = dataObj.item;
        } else if (dataObj.name || dataObj.title || dataObj.slug) {
            movie = dataObj;
        }
    }

    if (!movie) {
        return "null";
    }

    var cdnDomain = extractCdnDomain(parsed);
    var episodesRaw = [];
    if (isPlainObject(dataObj) && isArraySafe(dataObj.episodes)) {
        episodesRaw = dataObj.episodes;
    } else if (isPlainObject(parsed) && isArraySafe(parsed.episodes)) {
        episodesRaw = parsed.episodes;
    } else if (isArraySafe(movie.episodes)) {
        episodesRaw = movie.episodes;
    }

    var servers = [];
    var i;
    for (i = 0; i < episodesRaw.length; i++) {
        var srv = episodesRaw[i];
        if (!isPlainObject(srv)) {
            continue;
        }
        var srvData = isArraySafe(srv.server_data)
            ? srv.server_data
            : (isArraySafe(srv.episodes) ? srv.episodes : []);

        var serverEpisodes = [];
        var j;
        for (j = 0; j < srvData.length; j++) {
            var ep = srvData[j];
            if (!isPlainObject(ep)) {
                continue;
            }
            var m3u8Url = safeTrim(ep.link_m3u8 || ep.m3u8 || "");
            var embedUrl = safeTrim(ep.link_embed || ep.embed || "");
            var directUrl = safeTrim(ep.url || ep.link || "");
            var streamUrl = m3u8Url || embedUrl || directUrl;

            if (streamUrl) {
                serverEpisodes.push({
                    id: streamUrl,
                    name: safeTrim(ep.name || ep.title || ("Tập " + (j + 1))),
                    slug: safeTrim(ep.slug || ""),
                    m3u8: m3u8Url,
                    embed: embedUrl
                });
            }
        }

        if (serverEpisodes.length > 0) {
            servers.push({
                name: safeTrim(srv.server_name || srv.name || ("Server " + (i + 1))),
                episodes: serverEpisodes
            });
        }
    }

    var ratingValue = 0;
    var tmdbId = "";
    var tmdbSeason = 0;
    var tmdbType = "";

    if (isPlainObject(movie.tmdb)) {
        ratingValue = toFloat(movie.tmdb.vote_average, 0);
        if (movie.tmdb.id !== null && movie.tmdb.id !== undefined) {
            tmdbId = safeTrim(movie.tmdb.id);
        }
        tmdbSeason = toInt(movie.tmdb.season, 0);
        if (movie.tmdb.type !== null && movie.tmdb.type !== undefined) {
            tmdbType = safeTrim(movie.tmdb.type);
        }
    } else if (movie.rating !== null && movie.rating !== undefined) {
        ratingValue = toFloat(movie.rating, 0);
    }

    var posterRaw = movie.poster_url || movie.posterUrl || movie.poster || movie.thumb_url || "";
    var backdropRaw = movie.thumb_url || movie.backdrop_url || movie.backdropUrl || movie.poster_url || "";
    var movieId = safeTrim(movie.slug || movie.id || movie._id || "");
    var movieTitle = safeTrim(movie.name || movie.title || movie.origin_name || "");

    if (!movieId && !movieTitle && servers.length === 0) {
        return "null";
    }

    return safeStringify({
        id: movieId || movieTitle,
        title: movieTitle || movieId,
        originName: safeTrim(movie.origin_name || movie.originName || ""),
        posterUrl: buildMediaUrl(posterRaw, cdnDomain, backdropRaw),
        backdropUrl: buildMediaUrl(backdropRaw, cdnDomain, posterRaw),
        description: stripHtmlToText(movie.content || movie.description || ""),
        year: toInt(movie.year, 0),
        rating: ratingValue,
        quality: safeTrim(movie.quality || ""),
        duration: safeTrim(movie.time || movie.duration || ""),
        servers: servers,
        episode_current: safeTrim(movie.episode_current || movie.episodeCurrent || ""),
        lang: safeTrim(movie.lang || ""),
        category: joinNamedList(movie.category || movie.categories),
        country: joinNamedList(movie.country || movie.countries),
        director: joinNamedList(movie.director || movie.directors),
        casts: joinNamedList(movie.actor || movie.actors || movie.casts),
        status: safeTrim(movie.status || ""),
        tmdbId: tmdbId,
        tmdbSeason: tmdbSeason,
        tmdbType: tmdbType
    }, "null");
}

function resolveStreamData(streamInput) {
    var raw = safeTrim(streamInput);
    if (looksLikeHtml(raw)) {
        raw = "";
    }
    var isDirect = raw.length > 0 && (/\.m3u8(\?|$)/i.test(raw) || /\.mp4(\?|$)/i.test(raw));
    return safeStringify({
        url: raw,
        isDirectStream: isDirect,
        headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL + "/"
        },
        subtitles: []
    }, '{"url":"","isDirectStream":false,"headers":{},"subtitles":[]}');
}

function parseDetailResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, null);
    var candidate = "";

    if (isPlainObject(parsed)) {
        candidate = safeTrim(
            parsed.url ||
            parsed.streamUrl ||
            parsed.link_m3u8 ||
            parsed.m3u8 ||
            parsed.link_embed ||
            parsed.embed ||
            ""
        );
        if (!candidate && isPlainObject(parsed.data)) {
            candidate = safeTrim(
                parsed.data.url ||
                parsed.data.streamUrl ||
                parsed.data.link_m3u8 ||
                parsed.data.m3u8 ||
                parsed.data.link_embed ||
                parsed.data.embed ||
                ""
            );
        }
    } else if (typeof apiResponseJson === "string" && !looksLikeHtml(apiResponseJson)) {
        var trimmed = safeTrim(apiResponseJson);
        if (trimmed.indexOf("http://") === 0 || trimmed.indexOf("https://") === 0) {
            candidate = trimmed;
        }
    }

    return resolveStreamData(candidate);
}

function parseCategoriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var slug = safeTrim(entry.slug || entry.id || name);
        if (name && slug) {
            result.push({
                name: name,
                slug: slug
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseCountriesResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        if (!isPlainObject(entry)) {
            continue;
        }
        var name = safeTrim(entry.name || entry.title || entry.slug || "");
        var value = safeTrim(entry.slug || entry.value || entry.id || name);
        if (name && value) {
            result.push({
                name: name,
                value: value
            });
        }
    }

    return safeStringify(result, "[]");
}

function parseYearsResponse(apiResponseJson) {
    var parsed = safeParseJson(apiResponseJson, []);
    var items = extractArrayItems(parsed);
    var result = [];
    var i;

    for (i = 0; i < items.length; i++) {
        var entry = items[i];
        var val = "";
        var label = "";

        if (isPlainObject(entry)) {
            val = safeTrim(entry.slug || entry.value || entry.year || entry.name || "");
            label = safeTrim(entry.name || entry.year || val || "");
        } else if (typeof entry === "string" || typeof entry === "number") {
            val = safeTrim(entry);
            label = val;
        }

        if (val && label) {
            result.push({
                name: label,
                value: val
            });
        }
    }

    if (result.length === 0) {
        return getLocalYearsJson();
    }

    return safeStringify(result, "[]");
}
