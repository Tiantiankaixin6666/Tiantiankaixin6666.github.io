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
})();
