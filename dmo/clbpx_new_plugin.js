var BASE_URL = "https://clbphimxua.info";

function getManifest() {
    return JSON.stringify({
        "id": "clbphimxua",
        "name": "CLB Phim Xưa",
        "version": "1.0.1",
        "baseUrl": https://clbphimxua.info,
        "iconUrl": https://raw.githubusercontent.com/mangyeu/TV/refs/heads/main/dmo/clbphimxua-logo.ico,
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "embed",
        "layoutType": "VERTICAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        {"slug": "phim-bo",title": "Phim Bộ Mới","type": "LIST","path": "/phim-bo"},
        {"slug": "phim-le","title": "Phim Lẻ Mới","type": "LIST","path": "/phim-le"},
        {"slug": "hoat-hinh","title": "Phim Hoạt Họa","type": "LIST","path": "/hoat-hinh"},
        {"slug": "kiem-hiep","title": "Kiếm Hiệp - Cổ Trang","type": "LIST","path": "/kiem-hiep"},
        {"slug": "tinh-cam","title": "Phim Tình Cảm","type": "LIST","path": "/tinh-cam"}
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "phim-bo", "name": "Phim Bộ" },
        { "slug": "phim-le", "name": "Phim Lẻ" },
        { "slug": "kiem-hiep", "name": "Kiếm Hiệp" },
        { "slug": "tvb", "name": "Phim TVB" },
        { "slug": "hoat-hinh", "name": "Hoạt Hình - Anime" },
        { "slug": "kinh-di", "name": "Kinh Dị" },
        { "slug": "phim-han", "name": "Phim Hàn" },
        { "slug": "phim-tay", "name": "Phim Tây" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { value: "newest", label: "Mới cập nhật" },
            { value: "year", label: "Năm phát hành" },
            { value: "views", label: "Xem nhiều nhất" }
        ],
        categories: [
            { value: "phim-bo", label: "Phim Bộ" },
            { value: "phim-le", label: "Phim Lẻ" },
            { value: "kiem-hiep", label: "Kiếm Hiệp" },
            { value: "tvb", label: "Phim TVB" },
            { value: "hoat-hinh", label: "Hoạt Hình - Anime" },
            { value: "kinh-di", label: "Kinh Dị" },
            { value: "co-trang", label: "Cổ Trang" },
            { value: "hanh-dong", label: "Hành Động" },
            { value: "tinh-cam", label: "Tình Cảm" },
            { value: "hai-huoc", label: "Hài Hước" }
        ],
        countries: [
            { value: "hong-kong", label: "Hồng Kông (TVB)" },
            { value: "trung-quoc", label: "Trung Quốc" },
            { value: "han-quoc", label: "Hàn Quốc" },
            { value: "au-my", label: "Âu Mỹ (Phim Tây)" },
            { value: "nhat-ban", label: "Nhật Bản" },
            { value: "dai-loan", label: "Đài Loan" },
            { value: "thai-lan", label: "Thái Lan" }
        ],
        years: [
            { value: "2020s", label: "Thập niên 2020s" },
            { value: "2010s", label: "Thập niên 2010s" },
            { value: "2000s", label: "Thập niên 2000s" },
            { value: "1990s", label: "Thập niên 90s" },
            { value: "1980s", label: "Thập niên 80s" },
            { value: "1970s", label: "Thập niên 70s" }
        ]
    });
}

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var path = slug;

    // Ưu tiên chuyển hướng theo bộ lọc nếu người dùng chọn
    if (filters.category) {
        path = filters.category;
    } else if (filters.country) {
        path = "quoc-gia/" + filters.country;
    } else if (filters.year) {
        path = "nam-phat-hanh/" + filters.year;
    }

    var url = "https://clbphimxua.info/" + path;
    if (page > 1) {
        url += "/page/" + page;
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var encodedKeyword = encodeURIComponent((keyword || "").trim());

    if (page > 1) {
        return "https://clbphimxua.info" + page + "/?s=" + encodedKeyword;
    }
    return "https://clbphimxua.info" + encodedKeyword;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlResponse) {
    var items = [];
    if (!htmlResponse) {
        return JSON.stringify({ items: [] });
    }

    var regex = {
        article: /<article[^>]*class="[^"]*thumb\s+grid-item[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
        href: /<a[^>]*class="halim-thumb"[^>]*href="([^"]+)"/i,
        title: /<h2[^>]*class="entry-title"[^>]*>([\s\S]*?)<\/h2>/i,
        originalTitle: /<p[^>]*class="original_title"[^>]*>([\s\S]*?)<\/p>/i,
        imgSrc: /<img[^>]*src="([^"]+)"/i,
        imgDataSrc: /<img[^>]*data-src="([^"]+)"/i,
        episode: /<span[^>]*class="episode"[^>]*>([\s\S]*?)<\/span>/i,
        quality: /<span[^>]*class="fx-poster-quality"[^>]*>([\s\S]*?)<\/span>/i,
        nextPage: /class="next\s+page-numbers"|rel="next"/i
    };

    function decodeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&#8211;/g, "-")
            .replace(/&#8217;/g, "'")
            .replace(/<[^>]+>/g, "")
            .trim();
    }

    var match;
    while ((match = regex.article.exec(htmlResponse)) !== null) {
        var block = match[1];

        // 1. Lấy slug làm ID phim
        var hrefMatch = block.match(regex.href);
        var fullUrl = hrefMatch ? hrefMatch[1] : "";
        var slug = fullUrl
            .replace(/^https?:\/\/[^\/]+/i, "")
            .replace(/^\/|\/$/g, "");

        // 2. Lấy tên phim chính và tên gốc
        var titleMatch = block.match(regex.title);
        var title = titleMatch ? decodeHtml(titleMatch[1]) : "";

        var origMatch = block.match(regex.originalTitle);
        var originalTitle = origMatch ? decodeHtml(origMatch[1]) : "";

        // 3. Lấy ảnh Poster (ưu tiên data-src nếu dùng lazy load)
        var dataSrcMatch = block.match(regex.imgDataSrc);
        var imgMatch = block.match(regex.imgSrc);
        var posterUrl = (dataSrcMatch && dataSrcMatch[1]) ? dataSrcMatch[1] : (imgMatch ? imgMatch[1] : "");

        // 4. Lấy số tập và chất lượng
        var epMatch = block.match(regex.episode);
        var qualityMatch = block.match(regex.quality);
        var episode = epMatch ? decodeHtml(epMatch[1]) : "";
        var quality = qualityMatch ? decodeHtml(qualityMatch[1]) : "";

        // 5. Trích xuất năm phát hành (nếu có)
        var yearMatch = (originalTitle + " " + title).match(/\b(19[5-9]\d|20[0-2]\d)\b/);
        var year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

        if (slug && title) {
            items.push({
                id: slug,
                title: title,
                originalTitle: originalTitle,
                subTitle: [episode, quality].filter(Boolean).join(" • "),
                episode: episode,
                quality: quality,
                year: year,
                posterUrl: posterUrl,
                backdropUrl: posterUrl
            });
        }
    }

    return JSON.stringify({
        items: items,
        hasNextPage: regex.nextPage.test(htmlResponse)
    });
}

function parseSearchResponse(htmlResponse) {
    return parseListResponse(htmlResponse);
}

function getUrlDetail(slug) {
    return "https://clbphimxua.info" + slug.replace(/^\/|\/$/g, "");
}

function parseMovieDetail(htmlResponse) {
    if (!htmlResponse) {
        return JSON.stringify({});
    }

    function decodeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&#8211;/g, "-")
            .replace(/&#8217;/g, "'")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    // 1. Lấy Tên phim & Tên gốc
    var titleMatch = htmlResponse.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
    var title = titleMatch ? decodeHtml(titleMatch) : "";

    var origMatch = htmlResponse.match(/<p[^>]*class="[^"]*org_title[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
    var originalTitle = origMatch ? decodeHtml(origMatch) : "";

    // 2. Lấy Ảnh Poster & Backdrop
    var posterMatch = htmlResponse.match(/<img[^>]*class="[^"]*movie-thumb[^"]*"[^>]*src="([^"]+)"/i)
                   || htmlResponse.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    var posterUrl = posterMatch ? posterMatch : "";

    // 3. Lấy Nội dung mô tả phim
    var descMatch = htmlResponse.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
                 || htmlResponse.match(/<article[^>]*class="[^"]*item-content[^"]*"[^>]*>([\s\S]*?)<\/article>/i);
    var description = descMatch ? decodeHtml(descMatch) : "";

    // 4. Lấy Năm phát hành, Thể loại, Quốc gia, Diễn viên
    var yearMatch = htmlResponse.match(/\/release\/(\d{4})/i);
    var year = yearMatch ? parseInt(yearMatch, 10) : 0;

    var genres = [];
    var catRegex = /<a[^>]*rel="category tag"[^>]*>([\s\S]*?)<\/a>/gi;
    var catMatch;
    while ((catMatch = catRegex.exec(htmlResponse)) !== null) {
        var gName = decodeHtml(catMatch);
        if (gName && genres.indexOf(gName) === -1) genres.push(gName);
    }

    // 5. Bóc tách Danh sách Máy chủ (Servers) và Tập phim (Episodes)
    var servers = [];
    var serverBlockRegex = /<div[^>]*class="[^"]*halim-server[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*halim-server[^"]*"|<\/div>\s*<\/div>\s*<div[^>]*class="clearfix")/gi;
    var serverMatch;
    var serverIndex = 1;

    while ((serverMatch = serverBlockRegex.exec(htmlResponse)) !== null) {
        var sBlock = serverMatch;
        var sNameMatch = sBlock.match(/<span[^>]*class="[^"]*halim-server-name[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
        var serverName = sNameMatch ? decodeHtml(sNameMatch) : ("Server " + serverIndex);

        var episodes = [];
        var epRegex = /<li[^>]*class="[^"]*halim-episode[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
        var epMatch;

        while ((epMatch = epRegex.exec(sBlock)) !== null) {
            var eBlock = epMatch;
            var linkMatch = eBlock.match(/<a[^>]*href="([^"]+)"/i);
            var epNameMatch = eBlock.match(/<span[^>]*>([\s\S]*?)<\/span>/i) || eBlock.match(/<a[^>]*>([\s\S]*?)<\/a>/i);

            var epUrl = linkMatch ? linkMatch : "";
            var epSlug = epUrl.replace(/^https?:\/\/[^\/]+/i, "").replace(/^\/|\/$/g, "");
            var epName = epNameMatch ? decodeHtml(epNameMatch) : "";

            if (epSlug && epName) {
                episodes.push({
                    id: epSlug,
                    name: epName
                });
            }
        }

        if (episodes.length > 0) {
            servers.push({
                serverName: serverName,
                episodes: episodes
            });
            serverIndex++;
        }
    }

    // Dự phòng: Nếu trang chỉ có 1 danh sách tập không bọc trong halim-server
    if (servers.length === 0) {
        var fallbackEpisodes = [];
        var fbRegex = /<li[^>]*class="[^"]*halim-episode[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
        var fbMatch;
        while ((fbMatch = fbRegex.exec(htmlResponse)) !== null) {
            var fbBlock = fbMatch;
            var fbHref = fbBlock.match(/<a[^>]*href="([^"]+)"/i);
            var fbText = fbBlock.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
            if (fbHref && fbText) {
                var cleanSlug = fbHref.replace(/^https?:\/\/[^\/]+/i, "").replace(/^\/|\/$/g, "");
                fallbackEpisodes.push({
                    id: cleanSlug,
                    name: decodeHtml(fbText)
                });
            }
        }
        if (fallbackEpisodes.length > 0) {
            servers.push({
                serverName: "Vietsub",
                episodes: fallbackEpisodes
            });
        }
    }

    return JSON.stringify({
        title: title,
        originalTitle: originalTitle,
        description: description,
        posterUrl: posterUrl,
        backdropUrl: posterUrl,
        year: year,
        genres: genres,
        servers: servers
    });
}

function parseDetailResponse(htmlResponse, fallbackUrl) {
    var streamUrl = "";
    var streamType = "hls"; // Mặc định HLS (.m3u8), tự động đổi sang "embed" nếu là iframe
    var headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://clbphimxua.info"
    };

    if (!htmlResponse) {
        return JSON.stringify({
            url: fallbackUrl || "",
            type: "embed",
            headers: headers
        });
    }

    // Lớp 1: Tìm link phát trực tiếp (.m3u8 hoặc .mp4) nhúng sẵn trong mã nguồn / biến JS
    var m3u8Match = htmlResponse.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/i);
    var mp4Match = htmlResponse.match(/["'](https?:\/\/[^"'\s]+\.mp4[^"'\s]*)["']/i);

    if (m3u8Match && m3u8Match[1]) {
        streamUrl = m3u8Match[1].replace(/\\\//g, "/");
        streamType = "hls";
    } else if (mp4Match && mp4Match[1]) {
        streamUrl = mp4Match[1].replace(/\\\//g, "/");
        streamType = "mp4";
    }

    // Lớp 2: Nếu không có link trực tiếp, tìm thẻ <iframe> trong khung phát (#halim-player-wrapper hoặc toàn trang)
    if (!streamUrl) {
        var playerBlockMatch = htmlResponse.match(/<div[^>]*id="halim-player-wrapper"[^>]*>([\s\S]*?)<\/div>/i);
        var searchArea = playerBlockMatch ? playerBlockMatch[1] : htmlResponse;

        var iframeMatch = searchArea.match(/<iframe[^>]*src=["']([^"']+)["']/i)
                       || searchArea.match(/<iframe[^>]*data-src=["']([^"']+)["']/i);

        if (iframeMatch && iframeMatch[1]) {
            streamUrl = iframeMatch[1];
            // Xử lý nếu link iframe thiếu giao thức https: (VD: //://domain.com...)
            if (streamUrl.indexOf("//") === 0) {
                streamUrl = "https:" + streamUrl;
            }
            streamType = "embed";
        }
    }

    // Lớp 3: Dùng fallbackUrl nếu không bóc tách được nguồn nào
    if (!streamUrl && fallbackUrl) {
        streamUrl = fallbackUrl;
        streamType = "embed";
    }

    return JSON.stringify({
        url: streamUrl,
        type: streamType,
        headers: headers
    });
}
