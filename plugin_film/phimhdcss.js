var BASE_URL = "https://phimhdcss.com";

function getManifest() {
    return {
        id: "phimhdcss",
        name: "PhimHDC",
        version: "1.0.0",
        baseUrl: BASE_URL,
        icon: BASE_URL + "/favicon.ico",
        description: "Plugin xem phim HD Vietsub, Thuyết Minh từ PhimHDC (ES5)",
        language: "vi",
        supportSearch: true,
        supportFilter: true
    };
}

function getHomeSections() {
    return [
        {
            id: "phim-de-cu",
            title: "Phim Đề Cử",
            url: BASE_URL + "/",
            type: "slider"
        },
        {
            id: "phim-chieu-rap",
            title: "Phim Chiếu Rạp",
            url: BASE_URL + "/danh-sach/phim-chieu-rap",
            type: "grid"
        },
        {
            id: "phim-bo",
            title: "Phim Bộ Mới",
            url: BASE_URL + "/danh-sach/phim-bo",
            type: "grid"
        },
        {
            id: "phim-le",
            title: "Phim Lẻ Mới",
            url: BASE_URL + "/danh-sach/phim-le",
            type: "grid"
        },
        {
            id: "phim-ngan",
            title: "Phim Ngắn",
            url: BASE_URL + "/the-loai/phim-ngan",
            type: "grid"
        },
        {
            id: "hoat-hinh",
            title: "Hoạt Hình",
            url: BASE_URL + "/the-loai/hoat-hinh",
            type: "grid"
        }
    ];
}

function getPrimaryCategories() {
    return [
        { id: "phim-bo", name: "Phim Bộ", url: BASE_URL + "/danh-sach/phim-bo" },
        { id: "phim-le", name: "Phim Lẻ", url: BASE_URL + "/danh-sach/phim-le" },
        { id: "phim-chieu-rap", name: "Chiếu Rạp", url: BASE_URL + "/danh-sach/phim-chieu-rap" },
        { id: "phim-ngan", name: "Phim Ngắn", url: BASE_URL + "/the-loai/phim-ngan" },
        { id: "hoat-hinh", name: "Hoạt Hình", url: BASE_URL + "/the-loai/hoat-hinh" },
        { id: "sap-chieu", name: "Sắp Chiếu", url: BASE_URL + "/danh-sach/sap-chieu" }
    ];
}

function getFilterConfig() {
    return {
        searchUrl: BASE_URL + "/tim-kiem?keyword={keyword}&page={page}",
        categoryUrl: BASE_URL + "/{type}/{slug}?page={page}",
        filters: [
            {
                key: "the-loai",
                label: "Thể loại",
                options: [
                    { label: "Tất cả", value: "" },
                    { label: "Cổ trang", value: "co-trang" },
                    { label: "Ngôn tình", value: "ngon-tinh" },
                    { label: "Hiện đại", value: "hien-dai" },
                    { label: "Tình cảm", value: "tinh-cam" },
                    { label: "Hành động", value: "hanh-dong" },
                    { label: "Hoạt hình", value: "hoat-hinh" },
                    { label: "Bí ẩn", value: "bi-an" },
                    { label: "Chiến tranh", value: "chien-tranh" },
                    { label: "Chính kịch", value: "chinh-kich" },
                    { label: "Gia đình", value: "gia-dinh" },
                    { label: "Giả tưởng", value: "gia-tuong" },
                    { label: "Hài hước", value: "hai-huoc" },
                    { label: "Hình sự", value: "hinh-su" },
                    { label: "Học đường", value: "hoc-duong" },
                    { label: "Huyền huyễn", value: "huyen-huyen" },
                    { label: "Khoa học viễn tưởng", value: "khoa-hoc-vien-tuong" },
                    { label: "Kinh dị", value: "kinh-di" },
                    { label: "Phiêu lưu", value: "phieu-luu" },
                    { label: "Tâm lý", value: "tam-ly" },
                    { label: "Tiên hiệp", value: "tien-hiep" },
                    { label: "Võ thuật", value: "vo-thuat" },
                    { label: "Xuyên không", value: "xuyen-khong" }
                ]
            },
            {
                key: "quoc-gia",
                label: "Quốc gia",
                options: [
                    { label: "Tất cả", value: "" },
                    { label: "Trung Quốc", value: "trung-quoc" },
                    { label: "Hàn Quốc", value: "han-quoc" },
                    { label: "Thái Lan", value: "thai-lan" },
                    { label: "Nhật Bản", value: "nhat-ban" },
                    { label: "Việt Nam", value: "viet-nam" },
                    { label: "Âu Mỹ", value: "au-my" },
                    { label: "Đài Loan", value: "dai-loan" },
                    { label: "Hồng Kông", value: "hong-kong" },
                    { label: "Ấn Độ", value: "an-do" }
                ]
            }
        ]
    };
}

// --- HÀM HỖ TRỢ XỬ LÝ CHUỖI & URL (ES5) ---

function normalizeUrl(url) {
    if (!url) return "";
    url = url.replace(/\\\//g, "/").trim();
    if (url.indexOf("//") === 0) {
        return "https:" + url;
    }
    if (url.indexOf("/") === 0) {
        return BASE_URL + url;
    }
    return url;
}

function cleanHtmlText(str) {
    if (!str) return "";
    return str
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

// --- PARSE DANH SÁCH PHIM (TRANG CHỦ / TÌM KIẾM / DANH MỤC) ---

function parseListResponse(html) {
    var items = [];
    var seenUrls = {};
    if (!html) return items;

    // Bắt các thẻ <a> trỏ tới trang phim (/phim/...)
    var linkRegex = /<a[^>]+href=["']([^"']*\/phim\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var match;

    while ((match = linkRegex.exec(html)) !== null) {
        var href = normalizeUrl(match[1]);
        var innerHtml = match[2];

        // Bỏ qua link xem ngay trực tiếp nếu trùng slug gốc
        var cleanSlugUrl = href.replace(/\/tap-[^\/]+.*$/, "").replace(/\/xem-phim.*$/, "");
        if (seenUrls[cleanSlugUrl]) continue;

        // Tìm ảnh poster (ưu tiên data-src, data-original, src)
        var imgMatch = innerHtml.match(/<img[^>]+(?:data-src|data-original|src)=["']([^"']+)["'][^>]*>/i);
        if (!imgMatch) continue; // Chỉ lấy các card có chứa hình ảnh

        var poster = normalizeUrl(imgMatch[1]);

        // Lấy tiêu đề từ alt ảnh, title thẻ a hoặc text bên trong
        var title = "";
        var titleAttrMatch = match[0].match(/title=["']([^"']+)["']/i);
        var altAttrMatch = innerHtml.match(/alt=["']([^"']+)["']/i);

        if (titleAttrMatch && titleAttrMatch[1]) {
            title = cleanHtmlText(titleAttrMatch[1]);
        } else if (altAttrMatch && altAttrMatch[1]) {
            title = cleanHtmlText(altAttrMatch[1]);
        } else {
            title = cleanHtmlText(innerHtml);
        }

        if (!title) continue;

        // Lấy nhãn tập / chất lượng (Vietsub, Tập X, Full...)
        var badge = "";
        var badgeMatch = innerHtml.match(/<(?:span|div)[^>]*class=["'][^"']*(?:badge|episode|status|label|quality|tag)[^"']*["'][^>]*>([\s\S]*?)<\/(?:span|div)>/i);
        if (badgeMatch) {
            badge = cleanHtmlText(badgeMatch[1]);
        }

        seenUrls[cleanSlugUrl] = true;
        items.push({
            id: cleanSlugUrl,
            title: title,
            url: cleanSlugUrl,
            poster: poster,
            badge: badge
        });
    }

    return items;
}

// --- PARSE CHI TIẾT PHIM & DANH SÁCH TẬP ---

function parseDetailResponse(html, pageUrl) {
    var result = {
        id: pageUrl || "",
        title: "",
        originalTitle: "",
        poster: "",
        banner: "",
        description: "",
        year: "",
        country: "",
        categories: [],
        servers: []
    };

    if (!html) return result;

    // 1. Tiêu đề phim
    var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
        result.title = cleanHtmlText(h1Match[1]);
    } else {
        var ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
        if (ogTitle) result.title = cleanHtmlText(ogTitle[1]);
    }

    // 2. Poster & Banner
    var ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImage) {
        result.poster = normalizeUrl(ogImage[1]);
        result.banner = result.poster;
    }

    // 3. Mô tả nội dung
    var descMatch = html.match(/<(?:div|p)[^>]*class=["'][^"']*(?:description|content|film-content|tom-tat|summary)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p)>/i);
    if (descMatch) {
        result.description = cleanHtmlText(descMatch[1]);
    } else {
        var metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
        if (metaDesc) result.description = cleanHtmlText(metaDesc[1]);
    }

    // 4. Trích xuất danh sách tập theo từng Server
    var episodes = [];
    var seenEpUrls = {};

    // Tìm các link tập phim (thường có /tap- hoặc ?tap= hoặc data-episode)
    var epRegex = /<a[^>]+href=["']([^"']*(?:\/tap-|\/xem-phim|\?tap=)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var epMatch;

    while ((epMatch = epRegex.exec(html)) !== null) {
        var epUrl = normalizeUrl(epMatch[1]);
        var epName = cleanHtmlText(epMatch[2]);

        if (!epName || epName.length > 40) continue;
        if (epName.toLowerCase() === "xem phim" || epName.toLowerCase() === "xem ngay") {
            epName = "Full";
        }

        if (!seenEpUrls[epUrl]) {
            seenEpUrls[epUrl] = true;
            episodes.push({
                id: epUrl,
                name: epName,
                url: epUrl
            });
        }
    }

    // Fallback nếu phim lẻ chỉ có 1 nút "Xem phim"
    if (episodes.length === 0) {
        var watchBtn = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>\s*(?:Xem\s*Phim|Xem\s*Ngay|Play)\s*<\/a>/i);
        if (watchBtn) {
            var watchUrl = normalizeUrl(watchBtn[1]);
            episodes.push({
                id: watchUrl,
                name: "Full",
                url: watchUrl
            });
        }
    }

    if (episodes.length > 0) {
        result.servers.push({
            name: "Vietsub / Thuyết Minh",
            episodes: episodes
        });
    }

    return result;
}

// --- GIẢI MÃ EVAL PACKER (P, A, C, K, E, D) CHUẨN ES5 ---

function unpackEvalScripts(html) {
    var unpackedAll = "";
    var packerRegex = /eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]*?\}\('([^']+)',\s*(\d+),\s*(\d+),\s*'([^']+)'\.split\('\|'\)/g;
    var match;

    while ((match = packerRegex.exec(html)) !== null) {
        var p = match[1];
        var a = parseInt(match[2], 10);
        var c = parseInt(match[3], 10);
        var k = match[4].split("|");

        var encodeBase = function(num, radix) {
            var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var res = "";
            if (num === 0) return "0";
            while (num > 0) {
                res = chars.charAt(num % radix) + res;
                num = Math.floor(num / radix);
            }
            return res;
        };

        while (c--) {
            if (k[c]) {
                var token = encodeBase(c, a);
                var tokenRegex = new RegExp("\\b" + token + "\\b", "g");
                p = p.replace(tokenRegex, k[c]);
            }
        }
        unpackedAll += "\n" + p;
    }

    return unpackedAll;
}

// --- BÓC TÁCH LINK STREAM (.M3U8 / MP4 / IFRAME) ĐA TẦNG ---

function parseStreamResponse(html, episodeUrl) {
    var streams = [];
    if (!html) return streams;

    // Gộp HTML gốc với nội dung script đã giải mã eval()
    var unpacked = unpackEvalScripts(html);
    var combinedSource = html + "\n" + unpacked;

    // Chuẩn hóa các chuỗi thoát dấu gạch chéo trong JSON/JS (https:\/\/...)
    var normalizedSource = combinedSource.replace(/\\\//g, "/");

    // TẦNG 1: Bắt trực tiếp URL .m3u8 đầy đủ
    var m3u8Regex = /(https?:\/\/[^\s"'<>\\]+\.m3u8(?:\?[^\s"'<>\\]*)?)/gi;
    var m3u8Match;
    var foundUrls = {};

    while ((m3u8Match = m3u8Regex.exec(normalizedSource)) !== null) {
        var streamUrl = m3u8Match[1];
        if (!foundUrls[streamUrl]) {
            foundUrls[streamUrl] = true;
            streams.push({
                url: streamUrl,
                type: "hls",
                quality: "Auto",
                headers: {
                    "Referer": BASE_URL + "/",
                    "Origin": BASE_URL,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
        }
    }

    if (streams.length > 0) return streams;

    // TẦNG 2: Bắt link theo cấu trúc CDN + UUID (ví dụ: https://cdn.../stream/<uuid>/index.m3u8 hoặc không đuôi)
    var cdnUuidRegex = /(https?:\/\/[^\s"'<>\\]+?\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(?:\/[^\s"'<>\\]*)?)/gi;
    var cdnMatch;
    while ((cdnMatch = cdnUuidRegex.exec(normalizedSource)) !== null) {
        var candidate = cdnMatch[1];
        if (candidate.indexOf(".jpg") === -1 && candidate.indexOf(".png") === -1 && candidate.indexOf(".webp") === -1) {
            if (candidate.indexOf(".m3u8") === -1) {
                candidate = candidate.replace(/\/$/, "") + "/index.m3u8";
            }
            if (!foundUrls[candidate]) {
                foundUrls[candidate] = true;
                streams.push({
                    url: candidate,
                    type: "hls",
                    quality: "HD",
                    headers: {
                        "Referer": BASE_URL + "/"
                    }
                });
            }
        }
    }

    if (streams.length > 0) return streams;

    // TẦNG 3: Quét biến cấu hình player (file, source, link_m3u8, url) + UUID trong ngữ cảnh gần
    var configVarRegex = /(?:file|source|link_m3u8|streamUrl|videoUrl)\s*[:=]\s*["']([^"']+)["']/gi;
    var cfgMatch;
    while ((cfgMatch = configVarRegex.exec(normalizedSource)) !== null) {
        var val = cfgMatch[1];
        if (val.indexOf("http") === 0 && (val.indexOf(".m3u8") !== -1 || val.indexOf(".mp4") !== -1)) {
            if (!foundUrls[val]) {
                foundUrls[val] = true;
                streams.push({
                    url: val,
                    type: val.indexOf(".mp4") !== -1 ? "mp4" : "hls",
                    quality: "HD",
                    headers: {
                        "Referer": BASE_URL + "/"
                    }
                });
            }
        }
    }

    if (streams.length > 0) return streams;

    // TẦNG 4: Bắt Iframe Embed dự phòng nếu server nhúng player ngoài
    var iframeRegex = /<iframe[^>]+src=["']([^"']+)["'][^>]*>/gi;
    var iframeMatch;
    while ((iframeMatch = iframeRegex.exec(normalizedSource)) !== null) {
        var iframeSrc = normalizeUrl(iframeMatch[1]);
        if (iframeSrc.indexOf("facebook.com") === -1 && iframeSrc.indexOf("google") === -1) {
            streams.push({
                url: iframeSrc,
                type: "embed",
                quality: "Embed",
                headers: {
                    "Referer": episodeUrl || (BASE_URL + "/")
                }
            });
        }
    }

    return streams;
}
