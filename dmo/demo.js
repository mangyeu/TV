/**
 * ============================================================================
 * VAAPP PARSER SCRIPT - DIRECT WEBVIEW / IFRAME EXTRACTOR CHO PHIMHDCSS
 * ============================================================================
 */

function getManifest() {
    return JSON.stringify({
        "id": "phimhdcs",
        "name": "PhimHDCS (Direct Extractor)",
        "version": "2.0",
        "baseUrl": "https://phimhdcss.com",
        "iconUrl": "https://phimhdcss.com/favicon.ico",
        "isEnabled": true,
        "playerType": "exoplayer",
        "type": "MOVIE"
    });
}

function getUrlList(page, type, category, country, year) {
    var baseUrl = "https://phimhdcss.com";
    if (type && type !== 'all' && type !== '') {
        baseUrl += "/" + type;
    } else {
        baseUrl += "/phim-moi";
    }
    var queryParams = [];
    if (category) queryParams.push("category=" + encodeURIComponent(category));
    if (country) queryParams.push("country=" + encodeURIComponent(country));
    if (year) queryParams.push("year=" + encodeURIComponent(year));
    if (page && page > 1) queryParams.push("page=" + page);
    if (queryParams.length > 0) baseUrl += "?" + queryParams.join("&");
    return baseUrl;
}

function getUrlSearch(keyword, page) {
    var url = "https://phimhdcss.com/tim-kiem?keyword=" + encodeURIComponent(keyword);
    if (page && page > 1) url += "&page=" + page;
    return url;
}

function getUrlDetail(url) { return url; }
function getUrlCategories() { return "https://phimhdcss.com/"; }
function getUrlCountries() { return "https://phimhdcss.com/"; }
function getUrlYears() { return "https://phimhdcss.com/"; }

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Phim Mới", value: "phim-moi" },
        { name: "Phim Lẻ", value: "phim-le" },
        { name: "Phim Bộ", value: "phim-bo" },
        { name: "Hoạt Hình", value: "hoat-hinh" }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { title: "Phim Mới Cập Nhật", url: "https://phimhdcss.com/" },
        { title: "Phim Lẻ", url: "https://phimhdcss.com/phim-le" },
        { title: "Phim Bộ", url: "https://phimhdcss.com/phim-bo" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({ supportCategories: true, supportCountries: true, supportYears: true, supportTypes: true });
}

/**
 * Cải tiến parseDetailResponse: Quét triệt để mọi thẻ iframe, video source, 
 * link m3u8/mp4 hoặc đoạn script chứa link phát trực tiếp trong trang.
 */
function parseDetailResponse(htmlContent, pageUrl) {
    try {
        if (!htmlContent) return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });

        // 1. Quét tìm trực tiếp các định dạng link .m3u8 hoặc .mp4 xuất hiện trong toàn bộ HTML / Script
        var directStreamMatch = /https?:\/\/[^"'\s]+\.(?:m3u8|mp4)(?:\?[^"'\s]*)?/i.exec(htmlContent);
        if (directStreamMatch) {
            var streamUrl = directStreamMatch[0];
            return JSON.stringify({
                url: streamUrl,
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://phimhdcss.com/"
                },
                subtitles: []
            });
        }

        // 2. Quét mọi thẻ iframe có trong trang chi tiết / tập phim
        var iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
        var match;
        while ((match = iframeRegex.exec(htmlContent)) !== null) {
            var embedUrl = match[1];
            if (embedUrl.indexOf('//') === 0) embedUrl = "https:" + embedUrl;
            
            // Lọc bỏ các iframe quảng cáo hoặc trùng trang chủ
            if (embedUrl.indexOf("phimhdcss.com") === -1 && embedUrl.length > 10) {
                return JSON.stringify({
                    url: embedUrl,
                    isEmbed: true, // Chuyển sang parseEmbedResponse để xử lý tiếp tầng nhúng
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer": "https://phimhdcss.com/"
                    },
                    subtitles: []
                });
            }
        }

        // 3. Fallback: Nếu không bắt được bằng regex, trả về URL trang gốc để VAAPP mở qua chế độ Webview tích hợp
        return JSON.stringify({
            url: pageUrl,
            isEmbed: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            subtitles: []
        });

    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseEmbedResponse(htmlContent, url) {
    try {
        // Quét tìm link m3u8 / mp4 bên trong trang nhúng / API trả về
        var streamMatch = /https?:\/\/[^"'\s]+\.(?:m3u8|mp4)(?:\?[^"'\s]*)?/i.exec(htmlContent);
        if (streamMatch) {
            return JSON.stringify({
                url: streamMatch[0],
                isEmbed: false,
                mimeType: "application/x-mpegURL",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": url
                },
                subtitles: []
            });
        }
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    } catch (e) {
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function parseCategoriesResponse(htmlContent) { return "[]"; }
function parseCountriesResponse(htmlContent) { return "[]"; }
function parseYearsResponse(htmlContent) { return "[]"; }
