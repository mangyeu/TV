/*
 * vaxPlayer test extension scaffold
 * Compatible-style JS (avoid dependencies).
 * Use only with sources/content you own or are authorized to access.
 * Embed URLs are preserved as embed URLs; this code does not bypass site protections.
 */
(function () {
  "use strict";

  var BASE_URL = "https://phim.nguonc.com";

  function getManifest() {
    return {
      id: "nguonc_test",
      name: "NguonC - Test",
      version: "0.1.0",
      baseUrl: BASE_URL,
      playerType: "embed",
      description: "Test parser scaffold; preserves authorized embed/source URLs."
    };
  }

  function cleanText(value) {
    return String(value == null ? "" : value)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  }

  function absoluteUrl(url, base) {
    if (!url) return "";
    url = String(url).trim();
    if (/^(https?:)?\/\//i.test(url)) {
      return url.indexOf("//") === 0 ? "https:" + url : url;
    }
    if (/^data:/i.test(url)) return url;
    var origin = (base || BASE_URL).replace(/\/+$/, "");
    if (url.charAt(0) === "/") return origin + url;
    return origin + "/" + url;
  }

  function safeJson(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  function getUrlList(page) {
    page = page || 1;
    return BASE_URL + "/api/films?page=" + encodeURIComponent(page);
  }

  function getUrlSearch(keyword, page) {
    page = page || 1;
    return BASE_URL + "/api/films?search=" + encodeURIComponent(keyword || "") +
      "&page=" + encodeURIComponent(page);
  }

  function getUrlDetail(slug) {
    return BASE_URL + "/api/film/" + encodeURIComponent(slug || "");
  }

  function parseListResponse(input) {
    var data = typeof input === "string" ? safeJson(input) : input;
    if (!data) return { items: [], page: 1, hasNext: false };

    var list = data.items || data.films || data.films || data.results ||
      data.data || [];
    if (!Array.isArray(list)) list = [];

    var items = list.map(function (item) {
      item = item || {};
      return {
        id: item.slug || item.id || item._id || "",
        title: cleanText(item.name || item.title || item.original_name || ""),
        poster: absoluteUrl(item.poster_url || item.thumb_url || item.image || item.poster || ""),
        year: item.year || "",
        description: cleanText(item.description || item.content || ""),
        raw: item
      };
    }).filter(function (x) { return x.id || x.title; });

    return {
      items: items,
      page: Number(data.page || 1),
      hasNext: Boolean(data.has_next || data.next_page || data.pagination && data.pagination.next)
    };
  }

  function normalizeEpisode(ep, serverName) {
    ep = ep || {};
    var embed = ep.embed || ep.link_embed || ep.url || ep.link || "";
    var direct = ep.m3u8 || ep.hls || ep.video_url || ep.file || "";
    return {
      name: cleanText(ep.name || ep.episode || ep.title || "Tập"),
      server: cleanText(serverName || ep.server_name || "Server"),
      embedUrl: absoluteUrl(embed, BASE_URL),
      directUrl: absoluteUrl(direct, BASE_URL),
      // Keep the original source; embed is not treated as a direct media file.
      id: absoluteUrl(embed || direct, BASE_URL),
      type: embed ? "embed" : (direct ? "direct" : "unknown")
    };
  }

  function parseMovieDetail(input) {
    var data = typeof input === "string" ? safeJson(input) : input;
    if (!data) return null;
    var film = data.movie || data.film || data.data || data;
    var servers = film.episodes || film.servers || [];
    var episodes = [];

    if (Array.isArray(servers)) {
      servers.forEach(function (server) {
        if (Array.isArray(server)) {
          server.forEach(function (ep) { episodes.push(normalizeEpisode(ep)); });
        } else if (server && Array.isArray(server.items)) {
          server.items.forEach(function (ep) {
            episodes.push(normalizeEpisode(ep, server.name || server.server_name));
          });
        } else if (server && (server.embed || server.url || server.link || server.m3u8)) {
          episodes.push(normalizeEpisode(server, server.name || server.server_name));
        }
      });
    }

    return {
      id: film.slug || film.id || "",
      title: cleanText(film.name || film.title || ""),
      poster: absoluteUrl(film.poster_url || film.thumb_url || film.image || ""),
      description: cleanText(film.description || film.content || ""),
      year: film.year || "",
      episodes: episodes,
      raw: film
    };
  }

  /*
   * Parses only media URLs explicitly present in the supplied page text.
   * No hidden-token, DRM, obfuscation, or protected-player bypass logic.
   */
  function parseDetailResponse(html) {
    html = String(html || "");
    var matches = [];
    var re = /(?:file|src|source|url)\s*[:=]\s*["'](https?:\/\/[^"'<>]+)["']/gi;
    var match;
    while ((match = re.exec(html)) !== null) {
      var url = match[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
      if (/\.m3u8(?:[?#]|$)/i.test(url) || /\.(mp4|webm)(?:[?#]|$)/i.test(url)) {
        if (matches.indexOf(url) === -1) matches.push(url);
      }
    }
    if (!matches.length) return { sources: [], embedUrl: "" };
    return {
      sources: matches.map(function (url) {
        return { url: url, type: /\.m3u8(?:[?#]|$)/i.test(url) ? "hls" : "file" };
      }),
      embedUrl: ""
    };
  }

  function getCategories() {
    return [
      { id: "phim-le", name: "Phim lẻ" },
      { id: "phim-bo", name: "Phim bộ" },
      { id: "hoat-hinh", name: "Hoạt hình" },
      { id: "tv-shows", name: "TV Shows" }
    ];
  }

  function getCountries() {
    return [
      { id: "viet-nam", name: "Việt Nam" },
      { id: "han-quoc", name: "Hàn Quốc" },
      { id: "trung-quoc", name: "Trung Quốc" },
      { id: "my", name: "Mỹ" }
    ];
  }

  function getYears() {
    var years = [];
    var current = new Date().getFullYear();
    for (var y = current; y >= 1990; y--) years.push({ id: String(y), name: String(y) });
    return years;
  }

  function getImageUrl(url) {
    return absoluteUrl(url, BASE_URL);
  }

  // Export common extension methods.
  var api = {
    getManifest: getManifest,
    getUrlList: getUrlList,
    getUrlSearch: getUrlSearch,
    getUrlDetail: getUrlDetail,
    parseListResponse: parseListResponse,
    parseMovieDetail: parseMovieDetail,
    parseDetailResponse: parseDetailResponse,
    getCategories: getCategories,
    getCountries: getCountries,
    getYears: getYears,
    getImageUrl: getImageUrl
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof globalThis !== "undefined") globalThis.NguonCTestExtension = api;
})();
