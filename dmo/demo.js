var BASE_URL = "https://nguonphim1.site";
var HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": BASE_URL + "/"
};

// 0. KHAI BÁO MANIFEST CHO VAXPLAYER
function getManifest() {
    return {
        id: "nguonphim1",
        name: "Nguồn Phim 1",
        author: "Custom",
        version: 1,
        baseUrl: BASE_URL,
        icon: "https://m3.ngontv.com/media/images/1/logo/logo16012018.png",
        description: "Xem phim từ NguonPhim1",
        type: "video",
        locale: "vi_VN",
        tabs: [
            { title: "Trang chủ", url: BASE_URL + "/" },
            { title: "Phim lẻ", url: BASE_URL + "/phim-le.html" },
            { title: "Phim bộ", url: BASE_URL + "/phim-bo.html" },
            { title: "Hoạt hình", url: BASE_URL + "/hoat-hinh.html" }
        ]
    };
}

// Hàm chuẩn hóa đường dẫn
function fixUrl(url) {
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.indexOf("/") === 0) return BASE_URL + url;
    if (url.indexOf("http") !== 0) return BASE_URL + "/" + url;
    return url;
}

// Hàm bóc tách danh sách phim
function parseMovieList(doc) {
    var list = [];
    var seen = {};

    doc.select("a[href*='/xem-phim/']").forEach(function(el) {
        var href = fixUrl(el.attr("href"));
        if (!href || seen[href]) return;

        var img = el.select("img").first();
        if (!img) {
            var parent = el.parent();
            if (parent) img = parent.select("img").first();
        }
        if (!img) return;

        var name = el.attr("title") || img.attr("alt") || el.text();
        name = name.replace(/^Phim\s+/i, "").trim();
        if (!name) return;

        var cover = img.attr("data-src") || img.attr("data-original") || img.attr("src");
        seen[href] = true;

        list.push({
            name: name,
            link: href,
            cover: fixUrl(cover),
            description: "",
            host: BASE_URL
        });
    });

    return list;
}

// 1. LẤY DANH SÁCH PHIM TRANG CHỦ / DANH MỤC
function getHome(url, page) {
    var targetUrl = url ? fixUrl(url) : BASE_URL + "/";
    if (page && page > 1) {
        targetUrl = targetUrl.replace(/\/$/, "") + "/page/" + page;
    }

    var res = fetch(targetUrl, { headers: HEADERS });
    if (res.ok) {
        return Response.success(parseMovieList(res.html()));
    }
    return Response.error("Không thể tải danh sách phim");
}

// 2. TÌM KIẾM PHIM
function getSearch(keyword, page) {
    var p = page || 1;
    var res = fetch(BASE_URL + "/tim-kiem.html", {
        method: "GET",
        headers: HEADERS,
        queries: {
            q: keyword,
            page: String(p)
        }
    });

    if (res.ok) {
        return Response.success(parseMovieList(res.html()));
    }
    return Response.error("Lỗi tìm kiếm phim");
}

// 3. CHI TIẾT PHIM VÀ TẬP PHIM
function getDetail(url) {
    var targetUrl = fixUrl(url);
    var res = fetch(targetUrl, { headers: HEADERS });
    if (!res.ok) return Response.error("Không thể tải thông tin phim");

    var doc = res.html();
    var name = doc.select('meta[name="title"]').attr("content")
            || doc.select('meta[property="og:title"]').attr("content")
            || doc.select("h1").text();
    name = name.replace(/^Phim\s+/i, "").split("|")[0].trim();

    var cover = fixUrl(doc.select('meta[property="og:image"]').attr("content"));
    var description = doc.select('meta[name="description"]').attr("content") || "";

    var episodes = [];
    var epSeen = {};

    doc.select("a[href*='/xem-phim/']").forEach(function(el) {
        var epHref = fixUrl(el.attr("href"));
        var epName = el.text().trim();

        if (epName && !epSeen[epHref] && (/^(Tập\s*)?\d+/i.test(epName) || /^(Full|HD|Thuyết minh|Vietsub)/i.test(epName))) {
            epSeen[epHref] = true;
            episodes.push({
                name: epName,
                url: epHref,
                host: BASE_URL
            });
        }
    });

    if (episodes.length === 0) {
        episodes.push({
            name: "Full",
            url: targetUrl,
            host: BASE_URL
        });
    }

    return Response.success({
        name: name,
        cover: cover,
        description: description,
        ongoing: true,
        episodes: episodes,
        host: BASE_URL
    });
}

// 4. LẤY LINK PHÁT VIDEO
function getStream(url) {
    var targetUrl = fixUrl(url);
    var res = fetch(targetUrl, { headers: HEADERS });
    if (!res.ok) return Response.error("Không thể tải trang phát video");

    var html = res.text();

    var jwMatch = html.match(/["']?file["']?\s*:\s*["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
    if (jwMatch && jwMatch[1]) {
        var streamUrl1 = jwMatch[1].replace(/\\\//g, "/");
        return Response.success({
            url: streamUrl1,
            type: streamUrl1.indexOf(".mp4") !== -1 ? "mp4" : "hls",
            headers: HEADERS
        });
    }

    var rawMatch = html.match(/(https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)/i);
    if (rawMatch && rawMatch[1]) {
        var streamUrl2 = rawMatch[1].replace(/\\\//g, "/");
        return Response.success({
            url: streamUrl2,
            type: streamUrl2.indexOf(".mp4") !== -1 ? "mp4" : "hls",
            headers: HEADERS
        });
    }

    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
        var iframeUrl = fixUrl(iframeMatch[1]);
        var iframeRes = fetch(iframeUrl, {
            headers: {
                "User-Agent": HEADERS["User-Agent"],
                "Referer": targetUrl
            }
        });
        if (iframeRes.ok) {
            var iframeHtml = iframeRes.text();
            var subStream = iframeHtml.match(/(https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)/i);
            if (subStream && subStream[1]) {
                var streamUrl3 = subStream[1].replace(/\\\//g, "/");
                return Response.success({
                    url: streamUrl3,
                    type: streamUrl3.indexOf(".mp4") !== -1 ? "mp4" : "hls",
                    headers: { "Referer": iframeUrl }
                });
            }
        }
    }

    return Response.error("Không tìm thấy luồng phát video");
}
