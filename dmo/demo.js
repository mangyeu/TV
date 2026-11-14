var BASE_URL = "https://chillhayz.pro";

// 1. Thông tin nhận diện nguồn
function getManifest() {
    return JSON.stringify({
        "id": "chillhayz_pro",
        "name": "ChillHay (Thuyết Minh)",
        "version": "1.0.0",
        "baseUrl": BASE_URL,
        "type": "MOVIE",
        "layout": "VERTICAL"
    });
}

// 2. Các mục hiển thị ngoài trang chủ (khớp với menu trên web)

// Hàm tải mã nguồn HTML kèm Header giả lập trình duyệt
async function fetchHTML(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Referer": BASE_URL + "/"
    }
  });
  return await response.text();
}

// Hàm chuẩn hóa đường dẫn tương đối thành URL đầy đủ
function toFullUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return BASE_URL + (path.startsWith("/") ? "" : "/") + path;
}

// Hàm bóc tách danh sách phim từ đối tượng DOM của Chillhay
function parseChillhayMovies(doc) {
  const movies = [];
  const seenUrls = new Set();

  // Tìm tất cả các thẻ <li> hoặc khối chứa thẻ <a> có kèm hình ảnh <img>
  const items = doc.querySelectorAll("li, .movie-item, .film-item");

  items.forEach((item) => {
    const linkTag = item.querySelector("a");
    const imgTag = item.querySelector("img");

    // Bỏ qua các mục menu hoặc bảng xếp hạng chữ không có ảnh bìa
    if (!linkTag || !imgTag) return;

    const href = linkTag.getAttribute("href") || "";
    // Bỏ qua các đường dẫn danh mục, chỉ lấy link dẫn vào trang phim
    if (!href || href.includes("/the-loai/") || href.includes("/quoc-gia/")) return;

    const fullUrl = toFullUrl(href);
    if (seenUrls.has(fullUrl)) return;
    seenUrls.add(fullUrl);

    // Lấy tên phim từ thuộc tính title của thẻ <a>, alt của thẻ <img> hoặc thẻ tiêu đề bên trong
    const rawTitle =
      linkTag.getAttribute("title") ||
      imgTag.getAttribute("alt") ||
      item.querySelector(".name, .title, h2, h4")?.textContent ||
      "";

    const title = rawTitle.replace(/CHILLHAY/gi, "").trim();
    const poster = toFullUrl(imgTag.getAttribute("data-src") || imgTag.getAttribute("src"));

    // Lấy thông tin tập và nhãn Thuyết Minh (VD: "23/24 Thuyết Minh")
    const textContent = item.textContent.replace(/\s+/g, " ").trim();
    const epMatch = textContent.match(/(\d+\/\d+|Full|Tập\s*\d+)\s*(Thuyết Minh|Lồng Tiếng|Vietsub)?/i);
    const subtitle = epMatch ? epMatch.trim() : "Thuyết Minh";

    if (title) {
      movies.push({
        title: title,
        url: fullUrl,
        poster: poster,
        subtitle: subtitle
      });
    }
  });

  return movies;
}

// 1. Lấy danh sách phim Trang Chủ
async function getHome() {
  const html = await fetchHTML(BASE_URL);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return parseChillhayMovies(doc);
}

// 2. Tìm kiếm phim theo từ khóa
async function search(keyword) {
  const searchUrl = `${BASE_URL}/tim-kiem/${encodeURIComponent(keyword)}`;
  const html = await fetchHTML(searchUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return parseChillhayMovies(doc);
}

// 3. Lấy thông tin chi tiết và danh sách tập phim
async function getDetail(movieUrl) {
  const html = await fetchHTML(movieUrl);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const title = doc.querySelector("h1")?.textContent.trim() || "Đang cập nhật";
  const desc = doc.querySelector(".film-content, .content, #info-film")?.textContent.trim() || "";
  const episodes = [];
  const seenEp = new Set();

  // Quét các thẻ <a> dẫn đến trang xem phim hoặc danh sách tập
  const links = doc.querySelectorAll("a");
  links.forEach((a) => {
    const href = a.getAttribute("href") || "";
    const text = a.textContent.trim();

    if (href.includes("tap-") || href.includes("xem-phim") || /^(\d+|Full|Tập\s*\d+)$/i.test(text)) {
      const fullUrl = toFullUrl(href);
      if (!seenEp.has(fullUrl)) {
        seenEp.add(fullUrl);
        episodes.push({
          name: text || "Xem phim",
          url: fullUrl
        });
      }
    }
  });

  return {
    title: title,
    description: desc,
    episodes: episodes
  };
}

// 4. Trích xuất link phát video (.m3u8 hoặc iframe)
async function getStream(episodeUrl) {
  const html = await fetchHTML(episodeUrl);

  // Cách 1: Quét trực tiếp link .m3u8 nằm trong mã nguồn trang
  const m3u8Match = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/);
  if (m3u8Match) {
    return {
      url: m3u8Match.replace(/\\/g, ""),
      headers: {
        "Referer": BASE_URL + "/",
        "Origin": BASE_URL
      }
    };
  }

  // Cách 2: Lấy link nhúng qua thẻ <iframe>
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const iframeSrc = doc.querySelector("iframe")?.getAttribute("src");

  return {
    url: toFullUrl(iframeSrc),
    headers: {
      "Referer": episodeUrl
    }
  };
}
