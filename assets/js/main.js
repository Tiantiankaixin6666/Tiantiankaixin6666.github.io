// 主题切换：读取本地存储，默认跟随系统
(function () {
  var stored = localStorage.getItem("theme");
  var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  function bind() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  // 自动更新页脚年份
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // 自动渲染文章列表（数据来自 posts-data.js 的 window.POSTS）
  renderPosts();
})();

function renderPosts() {
  var box = document.getElementById("post-list");
  if (!box) return;
  var posts = window.POSTS || [];
  if (!posts.length) {
    box.innerHTML = '<p style="color:var(--muted)">还没有文章。</p>';
    return;
  }
  // 按日期降序
  posts = posts.slice().sort(function (a, b) {
    return (b.date || "").localeCompare(a.date || "");
  });
  var html = posts.map(function (p) {
    var tags = (p.tags || []).map(function (t) {
      return '<span class="tag">' + escapeHtml(t) + "</span>";
    }).join("");
    return (
      '<a class="post-card" href="' + escapeHtml(p.file) + '">' +
        "<h3>" + escapeHtml(p.title) + "</h3>" +
        '<div class="meta"><span>' + escapeHtml(p.date || "") + "</span>" + tags + "</div>" +
        "<p>" + escapeHtml(p.summary || "") + "</p>" +
      "</a>"
    );
  }).join("");
  box.innerHTML = html;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
