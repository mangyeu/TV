var BASE_URL = "https://nguonphim1.site";
var HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 11; TV Box) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": BASE_URL + "/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

// 0. KHAI BÁO MANIFEST
function getManifest() {
    return {
        id: "nguonphim1",
        name: "Nguồn Phim 1",
        author: "Custom",
        version: 2,
        baseUrl: BASE_URL,
        icon: "https://ngontv.com",
        description: "Nguồn Phim 1 (Đã hỗ trợ vượt NP Checker)",
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

function fixUrl(url) {
    if (!url) return "";
    if (url.indexOf("//") === 0) return "https:" + url;
    if (url.indexOf("/") === 0) return BASE_URL + url;
    if (url.indexOf("http") !== 0) return BASE_URL + "/" + url;
    return url;
}

// HÀM TẢI HTML CÓ XỬ LÝ VƯỢT TƯỜNG LỬA NP CHECKER
function loadHtml(url) {
    var res = fetch(url, { headers: HEADERS });
    var html = res.text();

    // Kiểm tra xem có bị dính trang trung gian NP Checker không
    if (html.indexOf("NP Checker") !== -1 || html.indexOf("chuyển trang") !== -1) {
        // Thử phương án 1: Dùng trình duyệt ẩn (Engine/WebView) của VaxPlayer nếu có hỗ trợ
        if (typeof Engine !== "undefined") {
            var browser = Engine.newBrowser();
            browser.launch(url, 5000); // Đợi 5 giây để JS tự chuyển trang
            var realHtml = browser.html();
            browser.close();
            return realHtml;
        }

        // Phương án 2: Bắt link chuyển hướng hoặc cookie tự sinh trong mã JS của NP Checker
        var redirectMatch = html.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i);
        if (redirectMatch && redirectMatch[1]) {
            var nextUrl = fixUrl(redirectMatch[1]);
            var res2 = fetch(nextUrl, { headers: HEADERS });
            return res2.text();
        }
    }
    return html;
}

// BÓC TÁCH DANH SÁCH PHIM TỪ CHUỖI HTML
function parseMoviesFromHtml(html) {
    var list = [];
    var seen = {};
    var doc = Html.parse(html);

    // Quét tất cả thẻ <a> có chứa link phim
    var links = doc.select("a[href*='/xem-phim/'], a[href*='/phim/']");
    for (var i = 0; i < links.size(); i++) {
        var el = links.get(i);
        var href = fixUrl(el.attr("href"));
        if (!href || seen[href]) continue;

        var img = el.select("img").first();
        if (!img && el.parent()) {
            img = el.parent().select("img").first();
        }
        if (!img) continue;

        var name = el.attr("title") || img.attr("alt") || el.text();
        name = name.replace(/^Phim\s+/i, "").trim();
        if (!name) continue;

        var cover = img.attr("data-src") || img.attr("data-original") || img.attr("src");
        seen[href] = true;

        list.push({
            id: href,
            title: name,
            name: name,
            url: href,
            link: href,
            poster: fixUrl(cover),
            cover: fixUrl(cover),
            description: ""
        });
    }

    return list;
}

// 1. TRANG CHỦ / DANH MỤC
function getHome(tabUrl, page) {
    var targetUrl = tabUrl ? fixUrl(tabUrl) : BASE_URL + "/";
    if (page && page > 1) {
        targetUrl = targetUrl.replace(/\/$/, "") + "/page/" + page;
    }

    var html = loadHtml(targetUrl);
    var items = parseMoviesFromHtml(html);

    // Trả về mảng trực tiếp (chuẩn VaxPlayer dùng getManifest)
    return items;
}

// 2. TÌM KIẾM
function getSearch(keyword, page) {
    var p = page || 1;
    var searchUrl = BASE_URL + "/tim-kiem.html?q=" + encodeURIComponent(keyword) + "&page=" + p;
    var html = loadHtml(searchUrl);
    return parseMoviesFromHtml(html);
}

// 3. CHI TIẾT PHIM
function getDetail(url) {
    var targetUrl = fixUrl(url);
    var html = loadHtml(targetUrl);
    var doc = Html.parse(html);

    var name = doc.select('meta[name="title"]').attr("content")
            || doc.select('meta[property="og:title"]').attr("content")
            || doc.select("h1").text();
    name = name.replace(/^Phim\s+/i, "").split("|")[0].trim();

    var cover = fixUrl(doc.select('meta[property="og:image"]').attr("content"));
    var description = doc.select('meta[name="description"]').attr("content") || "";

    var episodes = [];
    var epSeen = {};
    var epLinks = doc.select("a[href*='/xem-phim/']");

    for (var i = 0; i < epLinks.size(); i++) {
        var el = epLinks.get(i);
        var epHref = fixUrl(el.attr("href"));
        var epName = el.text().trim();

        if (epName && !epSeen[epHref] && (/^(Tập\s*)?\d+/i.test(epName) || /^(Full|HD|Thuyết minh|Vietsub)/i.test(epName))) {
            epSeen[epHref] = true;
            episodes.push({
                id: epHref,
                name: epName,
                title: epName,
                url: epHref
            });
        }
    }

    if (episodes.length === 0) {
        episodes.push({
            id: targetUrl,
            name: "Full",
            title: "Full",
            url: targetUrl
        });
    }

    return {
        id: targetUrl,
        title: name,
        name: name,
        poster: cover,
        cover: cover,
        description: description,
        episodes: episodes
    };
}

// 4. LẤY LINK STREAM VIDEO
function getStream(url) {
    var targetUrl = fixUrl(url);
    var html = loadHtml(targetUrl);

    var jwMatch = html.match(/["']?file["']?\s*:\s*["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
    if (jwMatch && jwMatch[1]) {
        var s1 = jwMatch[1].replace(/\\\//g, "/");
        return {
            url: s1,
            type: s1.indexOf(".mp4") !== -1 ? "mp4" : "hls",
            headers: HEADERS
        };
    }

    var rawMatch = html.match(/(https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)/i);
    if (rawMatch && rawMatch[1]) {
        var s2 = rawMatch[1].replace(/\\\//g, "/");
        return {
            url: s2,
            type: s2.indexOf(".mp4") !== -1 ? "mp4" : "hls",
            headers: HEADERS
        };
    }

    return null;
}
