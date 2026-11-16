// @Allowed-Domains: phimmoichillz.top, *.phimmoichillz.top, phimmoichill.top, *.phimmoichill.top, googleapis.com, *.googleapis.com

var BASE_URL = "https://phimmoichillz.top";

// ==========================================
// 1. NHÓM CONFIG & METADATA
// ==========================================

function getManifest() {
  return JSON.stringify({
    "id": "phimmoichill",
    "name": "PhimMoiChill",
    "version": "1.0",
    "type": "MOVIE",
    "baseUrl": BASE_URL,
    "allowedDomains": [
      "phimmoichillz.top",
      "*.phimmoichillz.top",
      "phimmoichill.top",
      "*.phimmoichill.top",
      "googleapis.com",
      "*.googleapis.com"
    ]
  });
}

function getHomeSections() {
  return JSON.stringify([
    { slug: "phim-le", title: "Phim Lẻ Mới", type: "HORIZONTAL", path: "phim-le" },
    { slug: "phim-bo", title: "Phim Bộ Mới", type: "HORIZONTAL", path: "phim-bo" },
    { slug: "quoc-gia/viet-nam", title: "Phim Việt Nam", type: "HORIZONTAL", path: "quoc-gia/viet-nam" },
    { slug: "quoc-gia/hong-kong", title: "Phim Hồng Kông", type: "HORIZONTAL", path: "quoc-gia/hong-kong" },
    { slug: "quoc-gia/an-do", title: "Phim Ấn Độ", type: "HORIZONTAL", path: "quoc-gia/an-do" },
    { slug: "quoc-gia/phap", title: "Phim Pháp", type: "HORIZONTAL", path: "quoc-gia/phap" },
    { slug: "quoc-gia/nga", title: "Phim Nga", type: "HORIZONTAL", path: "quoc-gia/nga" }
  ]);
}

function getPrimaryCategories() {
  return JSON.stringify([
    { name: "Phim Lẻ", slug: "phim-le" },
    { name: "Phim Bộ", slug: "phim-bo" },
    { name: "Nga", slug: "quoc-gia/nga" },
    { name: "Ấn Độ", slug: "quoc-gia/an-do" },
    { name: "Hồng Kông", slug: "quoc-gia/hong-kong" },
    { name: "Việt Nam", slug: "quoc-gia/viet-nam" },
    { name: "Úc", slug: "quoc-gia/uc" },
    { name: "Ý", slug: "quoc-gia/y" },
    { name: "Tây Ban Nha", slug: "quoc-gia/tay-ban-nha" },
    { name: "Canada", slug: "quoc-gia/canada" },
    { name: "Pháp", slug: "quoc-gia/phap" },
    { name: "Indonesia", slug: "quoc-gia/indonesia" },
    { name: "Philippines", slug: "quoc-gia/philippines" },
    { name: "Đức", slug: "quoc-gia/duc" },
    { name: "Malaysia", slug: "quoc-gia/malaysia" },
    { name: "Mexico", slug: "quoc-gia/mexico" },
    { name: "Nam Phi", slug: "quoc-gia/nam-phi" },
    { name: "Brazil", slug: "quoc-gia/brazil" },
    { name: "Na Uy", slug: "quoc-gia/na-uy" },
    { name: "Châu Phi", slug: "quoc-gia/chau-phi" },
    { name: "Thụy Điển", slug: "quoc-gia/thuy-dien" },
    { name: "Ba Lan", slug: "quoc-gia/ba-lan" },
    { name: "Hà Lan", slug: "quoc-gia/ha-lan" },
    { name: "Ireland", slug: "quoc-gia/ireland" },
    { name: "Bỉ", slug: "quoc-gia/bi" },
    { name: "Đan Mạch", slug: "quoc-gia/dan-mach" },
    { name: "Ukraina", slug: "quoc-gia/ukraina" },
    { name: "Phần Lan", slug: "quoc-gia/phan-lan" },
    { name: "Thụy Sĩ", slug: "quoc-gia/thuy-si" }
  ]);
}

function getFilterConfig() {
  return JSON.stringify({
    countries: [
      { name: "Tất cả quốc gia", value: "" },
      { name: "Nga", value: "nga" },
      { name: "Ấn Độ", value: "an-do" },
      { name: "Hồng Kông", value: "hong-kong" },
      { name: "Việt Nam", value: "viet-nam" },
      { name: "Úc", value: "uc" },
      { name: "Ý", value: "y" },
      { name: "Tây Ban Nha", value: "tay-ban-nha" },
      { name: "Canada", value: "canada" },
      { name: "Pháp", value: "phap" },
      { name: "Indonesia", value: "indonesia" },
      { name: "Philippines", value: "philippines" },
      { name: "Đức", value: "duc" },
      { name: "Malaysia", value: "malaysia" },
      { name: "Mexico", value: "mexico" },
      { name: "Nam Phi", value: "nam-phi" },
      { name: "Brazil", value: "brazil" },
      { name: "Na Uy", value: "na-uy" },
      { name: "Châu Phi", value: "chau-phi" },
      { name: "Thụy Điển", value: "thuy-dien" },
      { name: "Ba Lan", value: "ba-lan" },
      { name: "Hà Lan", value: "ha-lan" },
      { name: "Ireland", value: "ireland" },
      { name: "Bỉ", value: "bi" },
      { name: "Đan Mạch", value: "dan-mach" },
      { name: "Ukraina", value: "ukraina" },
      { name: "Phần Lan", value: "phan-lan" },
      { name: "Thụy Sĩ", value: "thuy-si" }
    ],
    categories: [
      { name: "Tất cả thể loại", value: "" },
      { name: "Hành Động", value: "hanh-dong" },
      { name: "Tình Cảm", value: "tinh-cam" },
      { name: "Hài Hước", value: "hai-huoc" },
      { name: "Cổ Trang", value: "co-trang" },
      { name: "Tâm Lý", value: "tam-ly" },
      { name: "Hình Sự", value: "hinh-su" },
      { name: "Chiến Tranh", value: "chien-tranh" },
      { name: "Võ Thuật", value: "vo-thuat" },
      { name: "Viễn Tưởng", value: "vien-tuong" },
      { name: "Phiêu Lưu", value: "phieu-luu" },
      { name: "Khoa Học", value: "khoa-hoc" },
      { name: "Ma - Kinh Dị", value: "kinh-di" },
      { name: "Hoạt Hình", value: "hoat-hinh" },
      { name: "Gia Đình", value: "gia-dinh" },
      { name: "Bí Ẩn", value: "bi-an" }
    ],
    years: [
      { name: "Tất cả năm", value: "" },
      { name: "2026", value: "2026" },
      { name: "2025", value: "2025" },
      { name: "2024", value: "2024" },
      { name: "2023", value: "2023" },
      { name: "2022", value: "2022" },
      { name: "2021", value: "2021" },
      { name: "2020", value: "2020" }
    ],
    sorts: [
      { name: "Mới cập nhật", value: "latest" },
      { name: "Xem nhiều nhất", value: "views" },
      { name: "Năm phát hành", value: "year" }
    ]
  });
}

// ==========================================
// 2. NHÓM SINH ĐƯỜNG DẪN URL
// ==========================================

function getUrlList(slug, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  var path = "";

  if (filters.country && filters.country !== "") {
    path = "quoc-gia/" + filters.country;
  } else if (filters.category && filters.category !== "") {
    path = "the-loai/" + filters.category;
  } else if (filters.year && filters.year !== "") {
    path = "nam-phat-hanh/" + filters.year;
  } else {
    path = (slug || "phim-le").replace(/^\/+|\/+$/g, "");
  }

  var url = BASE_URL + "/" + path;

  if (page > 1) {
    url += "/page/" + page;
  }

  if (filters.sort && filters.sort !== "" && filters.sort !== "latest") {
    url += "?sort=" + filters.sort;
  }

  return url;
}

function getUrlSearch(keyword, filtersJson) {
  var filters = JSON.parse(filtersJson || "{}");
  var page = filters.page || 1;
  var encodedKeyword = encodeURIComponent(keyword || "").replace(/%20/g, "+");

  if (page > 1) {
    return BASE_URL + "/page/" + page + "/?s=" + encodedKeyword;
  }
  return BASE_URL + "/?s=" + encodedKeyword;
}

function getUrlDetail(slug) {
  if (!slug) return "";
  if (slug.indexOf("http://") === 0 || slug.indexOf("https://") === 0) {
    return slug;
  }
  return BASE_URL + "/" + slug.replace(/^\/+|\/+$/g, "");
}

// ==========================================
// 3. NHÓM PHÂN TÍCH DỮ LIỆU (PARSERS)
// ==========================================

function parseListResponse(html) {
  var moviesMap = {};
  var items = [];

  if (!html) return JSON.stringify({ items: items });

  try {
    var blocks = html.split(/<(?:article|li|div)[^>]*class=["'][^"']*\b(?:item|film-item|post-item|movie-item|halim-item|tray-item)\b[^"']*["'][^>]*>/i);

    for (var i = 1; i < blocks.length; i++) {
      var block = blocks[i].substring(0, 2500);

      var hrefMatch = block.match(/<a[^>]*href=["']([^"']+)["']/i);
      var href = hrefMatch ? hrefMatch[1] : "";

      if (!href || href === "#" || href.indexOf("javascript:") === 0) continue;

      var title = "";
      var titleAttr = block.match(/<a[^>]*title=["']([^"']+)["']/i);
      var altAttr = block.match(/<img[^>]*alt=["']([^"']+)["']/i);
      var headingTag = block.match(/<(?:h2|h3|h4|p|span|div)[^>]*class=["'][^"']*(?:title|name)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h2|h3|h4|p|span|div)>/i);

      if (titleAttr && titleAttr[1]) {
        title = titleAttr[1];
      } else if (headingTag && headingTag[1]) {
        title = headingTag[1].replace(/<[^>]+>/g, "");
      } else if (altAttr && altAttr[1]) {
        title = altAttr[1];
      }

      var posterUrl = "";
      var imgMatch = block.match(/<img[^>]*data-(?:src|original|lazy-src)=["']([^"']+)["']/i) ||
                     block.match(/<img[^>]*src=["']([^"']+)["']/i) ||
                     block.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i);

      if (imgMatch && imgMatch[1]) {
        posterUrl = imgMatch[1];
      }

      if (posterUrl && posterUrl.indexOf("data:image") !== 0 && posterUrl.indexOf("http") !== 0) {
        posterUrl = BASE_URL + "/" + posterUrl.replace(/^\/+/, "");
      }

      var yearMatch = block.match(/\b(20\d{2}|19\d{2})\b/);
      var year = yearMatch ? yearMatch[1] : "";

      var id = href.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");

      if (id && title && !moviesMap[id]) {
        var movieObj = {
          id: id,
          title: decodeHtmlEntities(title),
          posterUrl: posterUrl,
          backdropUrl: posterUrl,
          year: year
        };

        moviesMap[id] = movieObj;
        items.push(movieObj);
      }
    }
  } catch (e) {}

  return JSON.stringify({ items: items });
}

function parseSearchResponse(html) {
  return parseListResponse(html);
}

    if (h1Match && h1Match[1]) {
      title = h1Match[1].replace(/<[^>]+>/g, "").trim();
    } else if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].trim();
    }

    var ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (ogImgMatch && ogImgMatch[1]) {
      posterUrl = ogImgMatch[1];
    }
    if (posterUrl && posterUrl.indexOf("http") !== 0) {
      posterUrl = BASE_URL + "/" + posterUrl.replace(/^\/+/, "");
    }

    var descMatch = html.match(/<(?:div|p|article)[^>]*class=["'][^"']*(?:film-content|entry-content|content|description|storyline)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|p|article)>/i) ||
                    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    var yearMatch = html.match(/(?:Năm|Year)[^<]*<\/[^>]+>\s*([^<\n]+)/i) || html.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch && yearMatch[1]) {
      year = yearMatch[1].trim();
    }

    var catRegex = /<a[^>]*href=["'][^"']*\/the-loai\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    var catMatch;
    while ((catMatch = catRegex.exec(html)) !== null) {
      var catName = catMatch[1].replace(/<[^>]+>/g, "").trim();
      if (catName && categories.indexOf(catName) === -1) {
        categories.push(catName);
      }
    }

    var epRegex = /<a[^>]*href=["']([^"']+)["'][^>]*(?:class=["'][^"']*(?:episode|halim-btn|btn-ep|server)[^"']*["']|data-episode|data-slug)[^>]*>([\s\S]*?)<\/a>/gi;
    var epMatch;

    while ((epMatch = epRegex.exec(html)) !== null) {
      var epHref = epMatch[1];
      var epName = epMatch[2].replace(/<[^>]+>/g, "").trim();
      var epSlug = epHref.replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");

      if (epSlug && epName && !epMap[epSlug]) {
        epMap[epSlug] = true;
        episodesList.push({
          id: epSlug,
          name: decodeHtmlEntities(epName),
          slug: epSlug
        });
      }
    }

    if (episodesList.length === 0) {
      var watchBtn = html.match(/<a[^>]*href=["']([^"']*(?:xem-phim|watch|tap-1|full)[^"']*)["'][^>]*>/i);
      if (watchBtn && watchBtn[1]) {
        var watchSlug = watchBtn[1].replace(BASE_URL, "").replace(/^\/+|\/+$/g, "");
        episodesList.push({
          id: watchSlug,
          name: "Full / Tập 1",
          slug: watchSlug
        });
      }
    }

    if (episodesList.length > 0) {
      servers.push({
        serverName: "Vietsub / Thuyết Minh",
        episodes: episodesList
      });
    }

    var directMatch = html.match(/["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (directMatch && directMatch[1]) {
      streamUrl = directMatch[1].replace(/\\\//g, "/");
      streamType = streamUrl.indexOf(".mp4") !== -1 ? "mp4" : "hls";
    } else {
      var iframeMatch = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (iframeMatch && iframeMatch[1] && iframeMatch[1].indexOf("facebook.com") === -1) {
        streamUrl = iframeMatch[1];
        streamType = "embed";
      }
    }
  } catch (e) {}

  return JSON.stringify({
    title: decodeHtmlEntities(title),
    posterUrl: posterUrl,
    backdropUrl: posterUrl,
    description: decodeHtmlEntities(description),
    year: year,
    categories: categories,
    servers: servers,
    url: streamUrl,
    streamUrl: streamUrl,
    type: streamType
  });
}

function parseDetailResponse(html) {
  if (!html) return JSON.stringify({ url: "" });

  var streamUrl = "";
  var streamType = "hls";

  try {
    var directMatch = html.match(/["'](https?:\/\/[^"'\s\\]+\.(?:m3u8|mp4)[^"'\s\\]*)["']/i);
    if (directMatch && directMatch[1]) {
      streamUrl = directMatch[1].replace(/\\\//g, "/");
      streamType = streamUrl.indexOf(".mp4") !== -1 ? "mp4" : "hls";
    }

    if (!streamUrl) {
      var playerVarMatch = html.match(/(?:file|source|link_play|url_play|stream_url)\s*[:=]\s*["'](https?:\/\/[^"'\s]+)["']/i);
      if (playerVarMatch && playerVarMatch[1]) {
        streamUrl = playerVarMatch[1].replace(/\\\//g, "/");
        streamType = (streamUrl.indexOf(".m3u8") !== -1 || streamUrl.indexOf(".mp4") !== -1) ? "hls" : "embed";
      }
    }

    if (!streamUrl) {
      var iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi;
      var iframeMatch;
      while ((iframeMatch = iframeRegex.exec(html)) !== null) {
        var src = iframeMatch[1];
        if (
          src &&
          src.indexOf("facebook.com") === -1 &&
          src.indexOf("google") === -1 &&
          src.indexOf("doubleclick") === -1 &&
          src.indexOf("about:blank") === -1
        ) {
          streamUrl = src;
          streamType = "embed";
          break;
        }
      }
    }

    if (streamUrl && streamUrl.indexOf("//") === 0) {
      streamUrl = "https:" + streamUrl;
    }
  } catch (e) {}

  return JSON.stringify({
    url: streamUrl,
    type: streamType,
    headers: {
      "Referer": BASE_URL + "/",
      "Origin": BASE_URL,
      "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
    }
  });
}

// ==========================================
// HÀM PHỤ TRỢ (HELPERS)
// ==========================================

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
