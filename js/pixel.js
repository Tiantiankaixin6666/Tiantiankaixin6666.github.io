/* =========================================================
   PIXELQUEST —— 交互脚本（原生 JS，零依赖）
   ─ 启动加载：像素进度条 + 幕帘
   ─ 全站星野：像素星点 + 鼠标/滚动视差
   ─ 像素光标：十字准星 + 像素拖尾
   ─ 卡片：倾斜 + 聚光 + 精灵翻转（CSS）
   ─ 文章：渲染 / 搜索 / 标签 / 排序 / 浏览量
   ─ 页面转场：像素幕帘
   ========================================================= */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  // 默认开启动态；只有用户在背包里关闭「动态特效」时才降级（不跟随系统设置）
  var reduce = root.classList.contains("reduce-motion") || safeGet("localStorage", "px:motion") === "off";
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function on(el, ev, fn, o) { if (el) el.addEventListener(ev, fn, o); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeGet(st, k) { try { return window[st].getItem(k); } catch (e) { return null; } }
  function safeSet(st, k, v) { try { window[st].setItem(k, v); } catch (e) {} }
  function fmt(n) {
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "w";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(n);
  }

  /* ============ 1. 启动加载 ============ */
  (function boot() {
    var box = $("#boot");
    if (!box) { root.classList.add("ready"); return; }
    if (reduce) { box.style.display = "none"; root.classList.add("ready"); return; }

    var bar = $("#boot-bar");
    var pct = $("#boot-pct");
    var done = false, p = 0;

    function setP(v) {
      p = v;
      if (bar) bar.style.width = v + "%";
      if (pct) pct.textContent = ("00" + Math.floor(v)).slice(-3) + "%";
    }
    setP(0);

    var timer = setInterval(function () {
      var next = done ? 100 : Math.min(92, p + Math.random() * 13 + 4);
      setP(next);
      if (done && next >= 100) clearInterval(timer);
    }, 80);

    function finish() {
      if (done) return;
      done = true;
      setTimeout(function () {
        setP(100);
        setTimeout(function () {
          box.classList.add("done");
          root.classList.add("ready");
          try { document.dispatchEvent(new CustomEvent("pxready")); } catch (e) {}
          setTimeout(function () { box.style.display = "none"; }, 560);
        }, 220);
      }, 120);
    }

    if (doc.readyState === "complete") setTimeout(finish, 320);
    else on(window, "load", function () { setTimeout(finish, 240); });
    setTimeout(finish, 1900); // 兜底：图片再多也最多等 1.9s
  })();

  /* ============ 2. 全站像素星野 ============ */
  (function starfield() {
    var cv = $("#pxstars");
    if (!cv) {
      cv = doc.createElement("canvas");
      cv.id = "pxstars";
      cv.setAttribute("aria-hidden", "true");
      doc.body.insertBefore(cv, doc.body.firstChild);
    }
    var ctx = cv.getContext("2d");
    if (!ctx) return;

    var W = 0, H = 0, dpr = 1, stars = [], t0 = performance.now();
    var mx = 0, my = 0, tx = 0, ty = 0, scrollY = 0;

    var COLORS = [
      "255,244,224", "255,244,224", "255,244,224",
      "247,184,1", "157,180,255", "228,59,68"
    ];

    function build() {
      var n = clamp(Math.round((W * H) / 11000), 70, 190);
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          s: Math.random() < 0.82 ? 2 : 3,
          c: COLORS[(Math.random() * COLORS.length) | 0],
          a: 0.3 + Math.random() * 0.55,
          sp: 0.4 + Math.random() * 1.4,
          ph: Math.random() * Math.PI * 2,
          d: 0.3 + Math.random() * 1.6
        });
      }
    }
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, window.innerWidth);
      H = Math.max(1, window.innerHeight);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = W + "px";
      cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      build();
    }
    function mod(v, m) { return ((v % m) + m) % m; }

    function draw(now) {
      var t = (now - t0) / 1000;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      ctx.clearRect(0, 0, W, H);

      var sy = (scrollY * 0.16) % H;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        var alpha = s.a * (0.55 + 0.45 * tw);
        var x = mod(s.x + mx * s.d * 8 + t * s.d * 3.5, W);
        var y = mod(s.y + my * s.d * 8 + t * s.d * 1.2 - sy, H);
        ctx.fillStyle = "rgba(" + s.c + "," + alpha.toFixed(3) + ")";
        ctx.fillRect(Math.round(x), Math.round(y), s.s, s.s);
      }
      if (!reduce) requestAnimationFrame(draw);
    }

    size();
    on(window, "resize", size);
    on(window, "scroll", function () {
      scrollY = window.pageYOffset || root.scrollTop || 0;
    }, { passive: true });
    on(window, "pointermove", function (e) {
      tx = clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      ty = clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1);
    }, { passive: true });

    draw(t0);
  })();

  /* ============ 3. 像素光标 ============ */
  (function cursor() {
    if (!fine || reduce) return;
    var cur = $("#pxcursor");
    if (!cur) {
      cur = doc.createElement("div");
      cur.id = "pxcursor";
      cur.setAttribute("aria-hidden", "true");
      doc.body.appendChild(cur);
    }
    var enabled = safeGet("localStorage", "px:cursor") !== "off";
    var shown = false;
    function setEnabled(v) {
      enabled = v;
      if (!v) {
        root.classList.remove("px-cursor");
        cur.classList.remove("on");
        shown = false;
      } else if (shown) {
        root.classList.add("px-cursor");
      }
    }
    setEnabled(enabled);

    var gx = 0, gy = 0, cx = 0, cy = 0, lastTrail = 0;
    function spawnTrail(x, y) {
      var d = doc.createElement("span");
      d.className = "px-trail";
      d.style.left = x + "px";
      d.style.top = y + "px";
      d.style.background = Math.random() < 0.28 ? "var(--red)" : "var(--gold)";
      doc.body.appendChild(d);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 520);
    }

    on(window, "pointermove", function (e) {
      if (!enabled) return;
      gx = e.clientX; gy = e.clientY;
      if (!shown) { shown = true; root.classList.add("px-cursor"); cur.classList.add("on"); }
      var now = performance.now();
      if (now - lastTrail > 42) { lastTrail = now; spawnTrail(gx, gy); }
    }, { passive: true });

    doc.addEventListener("pointerover", function (e) {
      if (!enabled) return;
      var hit = e.target && e.target.closest
        ? e.target.closest("a, button, input, select, .tile, .chip, .stat, .inv-list li")
        : null;
      cur.classList.toggle("hover", !!hit);
    }, true);

    on(window, "pointerout", function (e) {
      if (!e.relatedTarget) { cur.classList.remove("on"); shown = false; }
    });

    (function loop() {
      cx += (gx - cx) * 0.32;
      cy += (gy - cy) * 0.32;
      cur.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    })();

    window.__pxCursor = { setEnabled: setEnabled, isEnabled: function () { return enabled; } };
  })();

  /* ============ 4. 卡片倾斜 + 聚光 ============ */
  (function tilt() {
    if (!fine || reduce) return;
    var sel = ".tile";
    var active = null;
    function apply(el, e) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var fx = (e.clientX - r.left) / r.width;
      var fy = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", (fx * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (fy * 100).toFixed(1) + "%");
      el.style.setProperty("--rx", ((0.5 - fy) * 4).toFixed(2) + "deg");
      el.style.setProperty("--ry", ((fx - 0.5) * 4).toFixed(2) + "deg");
    }
    function reset(el) {
      if (!el) return;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    }
    doc.addEventListener("pointermove", function (e) {
      var el = e.target && e.target.closest ? e.target.closest(sel) : null;
      if (el !== active) { if (active) reset(active); active = el; }
      if (active) apply(active, e);
    }, { passive: true });
    doc.addEventListener("pointerout", function (e) {
      var el = e.target && e.target.closest ? e.target.closest(sel) : null;
      if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) {
        reset(el);
        if (active === el) active = null;
      }
    }, { passive: true });
  })();

  /* ============ 5. Hero 视差 / 滚动淡出 ============ */
  (function heroParallax() {
    if (reduce) return;
    var title = $(".hero-title");
    if (fine && title) {
      on(window, "pointermove", function (e) {
        var dx = e.clientX / window.innerWidth - 0.5;
        var dy = e.clientY / window.innerHeight - 0.5;
        title.style.transform = "translate(" + (dx * -16).toFixed(1) + "px," + (dy * -10).toFixed(1) + "px)";
      }, { passive: true });
    }
    var inner = $(".hero-inner");
    if (inner) {
      var ticking = false;
      function apply() {
        ticking = false;
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        var h = window.innerHeight || 1;
        var p = Math.min(1, y / h);
        inner.style.transform = "translateY(" + (y * 0.16).toFixed(1) + "px)";
        inner.style.opacity = String(Math.max(0, 1 - p * 1.05));
      }
      on(window, "scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(apply); }
      }, { passive: true });
      apply();
    }
  })();

  /* ============ 5b. 首屏逐字打字 + 点击开始的动态下滑 ============ */
  (function heroIntro() {
    var typed = document.getElementById("hero-typed");
    var full = typed ? (typed.getAttribute("data-text") || "") : "";
    if (typed && full) {
      if (reduce) {
        typed.textContent = full;
      } else {
        typed.textContent = "";
        var started = false, idx = 0;
        function startTyping() {
          if (started) return;
          started = true;
          var timer = setInterval(function () {
            idx++;
            typed.textContent = full.slice(0, idx);
            if (idx >= full.length) {
              clearInterval(timer);
              var caret = document.querySelector(".type-caret");
              if (caret) setTimeout(function () { caret.classList.add("done"); }, 900);
            }
          }, 250);
        }
        document.addEventListener("pxready", startTyping, { once: true });
        setTimeout(startTyping, 1700);
      }
    }

    var fx = document.getElementById("slidefx");
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function slideTo(target) {
      if (!target) return;
      var dest = target.getBoundingClientRect().top + (window.pageYOffset || 0) - 70;
      if (reduce) { window.scrollTo(0, dest); return; }

      var startY = window.pageYOffset || 0;
      var diff = dest - startY;
      var dur = 1000;
      var t0 = null;
      var finished = false;

      // 关键：临时关闭 CSS smooth，避免与逐帧滚动互相打架
      root.style.scrollBehavior = "auto";
      root.classList.add("sliding");
      if (fx) { fx.classList.remove("on"); void fx.offsetWidth; fx.classList.add("on"); }

      function finish() {
        if (finished) return;
        finished = true;
        root.style.scrollBehavior = "";
        root.classList.remove("sliding");
        if (fx) fx.classList.remove("on");
      }
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        window.scrollTo(0, startY + diff * easeInOutCubic(p));
        if (p < 1) requestAnimationFrame(step);
        else { window.scrollTo(0, dest); finish(); }
      }
      requestAnimationFrame(step);
      // 兜底：rAF 被节流/暂停时，按时直接落位
      setTimeout(function () {
        if (!finished) { window.scrollTo(0, dest); finish(); }
      }, dur + 180);
    }

    $$(".blink-text, .scroll-cue").forEach(function (a) {
      on(a, "click", function (e) {
        var target = document.querySelector(".layout") || document.getElementById("quests");
        if (!target) return;
        e.preventDefault();
        slideTo(target);
      });
    });
  })();

  /* ============ 6. 浏览量 ============ */
  var VIEW_KEY = "px:views:v1";
  function readViews() {
    try {
      var raw = localStorage.getItem(VIEW_KEY);
      var o = raw ? JSON.parse(raw) : {};
      return o && typeof o === "object" ? o : {};
    } catch (e) { return {}; }
  }
  function writeViews(o) { safeSet("localStorage", VIEW_KEY, JSON.stringify(o)); }
  function viewsOf(slug) { var v = readViews()[slug]; return typeof v === "number" && v > 0 ? v : 0; }
  function bumpView(slug) {
    if (!slug) return 0;
    var map = readViews();
    var hit = "px:hit:" + slug;
    if (safeGet("sessionStorage", hit) !== "1") {
      map[slug] = (map[slug] || 0) + 1;
      writeViews(map);
      safeSet("sessionStorage", hit, "1");
    }
    return map[slug] || 0;
  }
  function totalViews() {
    var o = readViews(), s = 0;
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) s += o[k] || 0;
    return s;
  }

  /* ============ 7. 数据 ============ */
  var raw = window.POSTS || [];
  var POSTS = raw.map(function (p) {
    var tags = p.tags || [];
    return {
      title: p.title,
      date: p.date,
      tags: tags,
      minutes: p.minutes || 5,
      excerpt: p.summary || p.excerpt || "",
      url: p.file || p.url
    };
  });
  function slugOf(u) { var m = String(u).match(/([^/]+)\.html?$/); return m ? m[1] : ""; }
  POSTS.forEach(function (p) { p.slug = slugOf(p.url); });

  var allTags = [];
  POSTS.forEach(function (p) {
    p.tags.forEach(function (t) { if (allTags.indexOf(t) < 0) allTags.push(t); });
  });

  /* 滚动揭示观察器（提前创建，供动态渲染的卡片复用） */
  var io = null;
  if ("IntersectionObserver" in window && !reduce) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
  }
  function observeReveals(scope) {
    $$(".reveal", scope || doc).forEach(function (n) {
      if (n.classList.contains("is-visible")) return;
      if (io) io.observe(n); else n.classList.add("is-visible");
    });
  }

  var VARIANTS = ["red", "blue", "gold", "green", "purple", "orange"];
  var SPRITES = [
    ["☺", "★"], ["◆", "♥"], ["▲", "●"],
    ["♠", "❖"], ["♥", "☺"], ["★", "✦"],
    ["✚", "✖"], ["✪", "✧"], ["☀", "☾"]
  ];

  /* ============ 8. 首页：渲染 / 搜索 / 标签 / 排序 ============ */
  var state = { q: "", tag: null, sort: "new" };
  var grid = $("#stories");

  function hilite(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    var needle = esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return safe.replace(new RegExp(needle, "gi"), function (m) { return "<mark>" + m + "</mark>"; });
    } catch (e) { return safe; }
  }

  function tileHTML(p, idx) {
    var v = viewsOf(p.slug);
    var variant = VARIANTS[idx % VARIANTS.length];
    var sp = SPRITES[idx % SPRITES.length];
    var tags = p.tags.map(function (t) { return '<span class="tg">' + esc(t) + "</span>"; }).join("");
    var kicker = (p.tags[0] || "杂记") + " · 任务";
    return (
      '<a class="tile tile--' + variant + ' reveal" href="' + esc(p.url) + '">' +
        '<span class="sprite" data-a="' + sp[0] + '" data-b="' + sp[1] + '" aria-hidden="true"></span>' +
        '<div class="tile-kicker">' + esc(kicker) + "</div>" +
        '<h3 class="tile-title">' + hilite(p.title, state.q) + "</h3>" +
        '<p class="tile-text">' + hilite(p.excerpt, state.q) + "</p>" +
        '<div class="tile-meta"><span>' + esc(p.date) + "</span><span>浏览 " + fmt(v) + "</span><span>约 " + p.minutes + " 分钟</span></div>" +
        '<div class="tile-tags">' + tags + "</div>" +
        '<span class="tile-link">阅读 ▸</span>' +
      "</a>"
    );
  }

  function sorted(list) {
    var arr = list.slice();
    if (state.sort === "hot") {
      arr.sort(function (a, b) {
        var d = viewsOf(b.slug) - viewsOf(a.slug);
        return d !== 0 ? d : (a.date < b.date ? 1 : -1);
      });
    } else if (state.sort === "title") {
      arr.sort(function (a, b) { return a.title.localeCompare(b.title, "zh-Hans-CN"); });
    } else {
      arr.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    }
    return arr;
  }

  function filtered() {
    var q = state.q.toLowerCase();
    return POSTS.filter(function (p) {
      var okTag = !state.tag || p.tags.indexOf(state.tag) >= 0;
      var okQ = !q || (p.title + " " + p.excerpt + " " + p.tags.join(" ")).toLowerCase().indexOf(q) >= 0;
      return okTag && okQ;
    });
  }

  function renderGrid() {
    if (!grid) return;
    var list = sorted(filtered());
    if (!list.length) {
      grid.innerHTML =
        '<div class="empty"><strong>没有找到任务</strong>' +
        "换个关键词，或者回到全部任务看看？" +
        '<div><button class="btn" id="reset-filter" type="button">RESET FILTER</button></div></div>';
      on($("#reset-filter"), "click", function () {
        state.q = ""; state.tag = null;
        var si = $("#search-input"); if (si) si.value = "";
        syncSearchUI(); syncChips(); renderGrid();
      });
    } else {
      grid.innerHTML = list.map(tileHTML).join("");
      // 搜索/筛选后卡片已经重新生成：必须立即揭示，
      // 不能再等 IntersectionObserver（否则会只剩计数、没有卡片）
      $$(".tile", grid).forEach(function (el, i) {
        if (reduce) { el.classList.add("is-visible"); return; }
        setTimeout(function () { el.classList.add("is-visible"); }, Math.min(i * 35, 280));
      });
    }
    var rc = $("#result-count");
    if (rc) {
      var desc = state.tag ? "「" + esc(state.tag) + "」" : "全部任务";
      rc.innerHTML = "在 " + desc + " 中找到 <b>" + list.length + "</b> 篇 · " +
        (state.q ? "关键词 <b>" + esc(state.q) + "</b>" : "点击「阅读」进入关卡");
    }
  }

  function syncChips() {
    $$(".chip").forEach(function (b) {
      var t = b.getAttribute("data-tag");
      b.classList.toggle("active", state.tag ? t === state.tag : t === "__all");
    });
    $$("#cat-list button").forEach(function (b) {
      b.classList.toggle("active", state.tag && b.getAttribute("data-tag") === state.tag);
    });
  }

  function buildChips() {
    var bar = $("#tagbar");
    if (bar) {
      var html = '<button class="chip" data-tag="__all" type="button">全部<span class="cnt">' + POSTS.length + "</span></button>";
      allTags.forEach(function (t) {
        var n = POSTS.filter(function (p) { return p.tags.indexOf(t) >= 0; }).length;
        html += '<button class="chip" data-tag="' + esc(t) + '" type="button">' + esc(t) +
          '<span class="cnt">' + n + "</span></button>";
      });
      bar.innerHTML = html;
      bar.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest(".chip") : null;
        if (!b) return;
        var t = b.getAttribute("data-tag");
        state.tag = t === "__all" ? null : (state.tag === t ? null : t);
        syncChips(); renderGrid();
      });
    }
    var cats = $("#cat-list");
    if (cats) {
      cats.innerHTML = allTags.map(function (t) {
        var n = POSTS.filter(function (p) { return p.tags.indexOf(t) >= 0; }).length;
        return '<button type="button" data-tag="' + esc(t) + '">' + esc(t) + "<span>" + n + "</span></button>";
      }).join("");
      cats.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest("button[data-tag]") : null;
        if (!b) return;
        var t = b.getAttribute("data-tag");
        state.tag = state.tag === t ? null : t;
        syncChips(); renderGrid();
        var qs = $("#quests");
        if (qs) qs.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    }
    syncChips();
  }

  function syncSearchUI() {
    var w = $(".search");
    if (w) w.classList.toggle("has-value", !!state.q);
  }

  if (grid) {
    var searchEl = $("#search-input");
    var clearBtn = $("#search-clear");
    var sortEl = $("#sort-select");

    on(searchEl, "input", function () {
      state.q = (searchEl.value || "").trim();
      syncSearchUI();
      renderGrid();
    });
    on(clearBtn, "click", function () {
      if (searchEl) { searchEl.value = ""; searchEl.focus(); }
      state.q = ""; syncSearchUI(); renderGrid();
    });
    on(searchEl, "keydown", function (e) {
      if (e.key === "Escape") { searchEl.value = ""; state.q = ""; syncSearchUI(); renderGrid(); searchEl.blur(); }
    });
    on(sortEl, "change", function () { state.sort = sortEl.value; renderGrid(); });

    (function deepLink() {
      try {
        var sp = new URLSearchParams(location.search);
        var q = sp.get("q"), tag = sp.get("tag");
        if (q) { state.q = q; if (searchEl) searchEl.value = q; }
        if (tag && allTags.indexOf(tag) >= 0) state.tag = tag;
      } catch (e) {}
      syncSearchUI();
    })();

    buildChips();
    renderGrid();
  }

  /* ============ 8b. 网站访问数（Abacus 全局 + 本地兜底） ============ */
  (function visits() {
    var el = doc.getElementById("stat-visits");
    var VISITS_KEY = "px:visits";
    var LAST_KEY = "px:visits:last";

    var local = parseInt(safeGet("localStorage", VISITS_KEY) || "0", 10);
    if (isNaN(local) || local < 0) local = 0;
    local += 1;
    safeSet("localStorage", VISITS_KEY, String(local));

    var cached = parseInt(safeGet("localStorage", LAST_KEY) || "0", 10);
    if (isNaN(cached) || cached < 0) cached = 0;

    function render(n) {
      if (!el) return;
      el.textContent = n < 100000 ? String(n) : fmt(n);
    }
    render(Math.max(local, cached));

    if (!("fetch" in window)) return;
    // 全局访问数：每个页面加载计一次
    fetch("https://abacus.jasoncameron.dev/hit/tiantiankaixin6666-github-io/site-visits", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && typeof d.value === "number") {
          render(d.value);
          safeSet("localStorage", LAST_KEY, String(d.value));
        }
      })
      .catch(function () { /* 保持本地兜底数字 */ });
  })();

  /* ============ 9. 统计 + 分数 ============ */
  (function stats() {
    var days = Math.max(1, Math.floor((Date.now() - new Date("2026-09-28T00:00:00").getTime()) / 86400000));
    var vals = {
      "stat-posts": POSTS.length,
      "stat-tags": allTags.length,
      "stat-days": days,
      "stat-views": totalViews()
    };
    Object.keys(vals).forEach(function (id) {
      var el = doc.getElementById(id);
      if (!el) return;
      var target = vals[id];
      if (reduce || target === 0) { el.textContent = fmt(target); return; }
      var t0 = null, dur = 1000;
      function f(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(Math.round(e * target));
        if (k < 1) requestAnimationFrame(f);
      }
      requestAnimationFrame(f);
    });
  })();

  /* ============ 9b. HUD 小游戏：生命 / 分数（连击·暴击·双倍） ============ */
  (function hudGame() {
    var bar = document.getElementById("hp-bar");
    var scoreEl = document.getElementById("score");
    var HP_MAX = 10;

    function floatText(host, text, cls) {
      if (!host) return;
      var el = document.createElement("span");
      el.className = "hud-float" + (cls ? " " + cls : "");
      el.textContent = text;
      host.appendChild(el);
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 900);
    }

    if (bar) {
      var segs = bar.querySelectorAll("i");
      var hp = HP_MAX;
      function renderHp() {
        for (var i = 0; i < segs.length; i++) segs[i].classList.toggle("off", i >= hp);
        bar.setAttribute("aria-label", "生命值 " + hp + "/" + HP_MAX + "，点击扣血");
      }
      renderHp();
      on(bar, "click", function () {
        var host = bar.parentNode;
        if (hp > 0) {
          hp--;
          bar.classList.remove("full");
          bar.classList.add("hit");
          setTimeout(function () { bar.classList.remove("hit"); }, 280);
          floatText(host, "-1 生命", "hp");
        } else {
          hp = HP_MAX;
          bar.classList.add("full");
          setTimeout(function () { bar.classList.remove("full"); }, 620);
          floatText(host, "生命回满！", "heal");
        }
        renderHp();
      });
    }

    if (scoreEl) {
      var score = parseInt(safeGet("localStorage", "px:score") || "0", 10);
      if (isNaN(score) || score < 0) score = 0;
      var combo = 0, last = 0, comboTimer = null;
      var host = scoreEl.parentNode;

      var badge = document.createElement("span");
      badge.className = "combo-badge";
      host.appendChild(badge);

      function fmtScore(n) {
        var str = String(n);
        while (str.length < 6) str = "0" + str;
        return str;
      }
      function renderScore() { scoreEl.textContent = fmtScore(score); }
      function showCombo() {
        if (combo >= 2) {
          badge.textContent = combo >= 5 ? "连击 x" + combo + " · 双倍" : "连击 x" + combo;
          badge.classList.add("on");
        } else {
          badge.classList.remove("on");
        }
        clearTimeout(comboTimer);
        comboTimer = setTimeout(function () { badge.classList.remove("on"); }, 1300);
      }

      renderScore();

      on(scoreEl, "click", function () {
        var now = Date.now();
        combo = (now - last < 1200) ? combo + 1 : 1;
        last = now;

        var gain = 1;
        if (combo >= 5) gain *= 2;                      // 连击双倍
        var critChance = Math.min(0.5, 0.12 + combo * 0.02);
        var crit = Math.random() < critChance;
        if (crit) gain *= 2;                             // 暴击再翻倍

        score += gain;                                   // 无上限
        safeSet("localStorage", "px:score", String(score));
        renderScore();

        scoreEl.classList.remove("pop");
        void scoreEl.offsetWidth;
        scoreEl.classList.add("pop");
        setTimeout(function () { scoreEl.classList.remove("pop"); }, 220);

        if (crit) {
          scoreEl.classList.add("crit");
          root.classList.add("crit");
          setTimeout(function () {
            scoreEl.classList.remove("crit");
            root.classList.remove("crit");
          }, 400);
          floatText(host, "暴击 +" + gain, "crit");
        } else {
          floatText(host, "+" + gain, combo >= 5 ? "crit" : "");
        }

        if (combo > 0 && combo % 10 === 0) {
          floatText(host, combo + " 连击！", "crit");
        }
        showCombo();
      });
    }
  })();

  /* ============ 10. 文章页增强 ============ */
  (function postPage() {
    var body = $(".article-body");
    if (!body) return;

    var slug = slugOf(location.pathname);
    var meta = $(".article-meta");

    if (slug) {
      var v = bumpView(slug);
      if (meta) {
        var pv = doc.createElement("span");
        pv.className = "pill";
        pv.textContent = "浏览 " + fmt(v);
        meta.appendChild(pv);
      }
    }
    if (meta) {
      var text = (body.textContent || "").replace(/\s+/g, "");
      var cur = POSTS.filter(function (p) { return p.slug === slug; })[0];
      var minutes = (cur && cur.minutes) || Math.max(1, Math.round(text.length / 380));
      var pt = doc.createElement("span");
      pt.className = "pill plain";
      pt.textContent = "约 " + minutes + " 分钟";
      meta.appendChild(pt);
    }

    // 目录
    var tocHost = $("#toc");
    var heads = $$("h2, h3", body);
    if (tocHost && heads.length >= 3) {
      var items = heads.map(function (h, i) {
        if (!h.id) h.id = "sec-" + (i + 1);
        return '<li class="' + (h.tagName === "H3" ? "lv3" : "lv2") + '"><a href="#' + h.id + '">' +
          esc((h.textContent || "").trim()) + "</a></li>";
      }).join("");
      tocHost.innerHTML =
        '<div class="article-toc"><div class="toc-h"><span>▸ 本文目录</span><span>收起 / 展开</span></div>' +
        "<ol>" + items + "</ol></div>";
      var toc = $(".article-toc", tocHost);
      on($(".toc-h", toc), "click", function () { toc.classList.toggle("is-collapsed"); });
    }

    // 相关文章
    var relHost = $("#related");
    if (relHost) {
      var cur2 = POSTS.filter(function (p) { return p.slug === slug; })[0];
      var picks = [];
      if (cur2) {
        picks = POSTS.filter(function (p) {
          return p.slug !== slug && p.tags.some(function (t) { return cur2.tags.indexOf(t) >= 0; });
        });
      }
      if (picks.length < 2) {
        POSTS.forEach(function (p) {
          if (p.slug !== slug && picks.indexOf(p) < 0 && picks.length < 2) picks.push(p);
        });
      }
      picks = picks.slice(0, 2);
      if (picks.length) {
        relHost.innerHTML = "<h2>▸ 继续探索</h2><div class=\"related-grid\">" +
          picks.map(function (p) {
            return '<a class="related-item" href="' + esc(p.url) + '">' + esc(p.title) +
              "<small>" + esc(p.date) + " · " + esc(p.tags.join(" / ")) + "</small></a>";
          }).join("") + "</div>";
      }
    }
  })();

  /* ============ 10b. 点赞（全局计数） ============ */
  (function likes() {
    var btn = document.getElementById("like-btn");
    if (!btn) return;
    var slug = btn.getAttribute("data-slug") || "";
    var countEl = document.getElementById("like-count");
    var labelEl = btn.querySelector(".like-label");
    var API = "https://abacus.jasoncameron.dev";
    var NS = "tiantiankaixin6666-github-io";
    var KEY = "likes-" + slug;
    var CACHE = "px:likecount:" + slug;
    var LIKED = "px:liked:" + slug;

    var count = parseInt(safeGet("localStorage", CACHE) || "0", 10);
    if (isNaN(count) || count < 0) count = 0;
    function render(n) {
      if (countEl) countEl.textContent = n < 100000 ? String(n) : fmt(n);
    }
    render(count);

    fetch(API + "/get/" + NS + "/" + encodeURIComponent(KEY), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && typeof d.value === "number") {
          count = d.value;
          render(count);
          safeSet("localStorage", CACHE, String(count));
        }
      })
      .catch(function () {});

    var liked = safeGet("localStorage", LIKED) === "1";
    function markLiked() {
      btn.classList.add("liked");
      btn.disabled = true;
      btn.setAttribute("aria-pressed", "true");
      if (labelEl) labelEl.textContent = "已赞";
    }
    if (liked) markLiked();

    on(btn, "click", function () {
      if (liked) return;
      liked = true;
      safeSet("localStorage", LIKED, "1");
      markLiked();
      fetch(API + "/hit/" + NS + "/" + encodeURIComponent(KEY), { cache: "no-store" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && typeof d.value === "number") {
            count = d.value;
            render(count);
            safeSet("localStorage", CACHE, String(count));
          }
        })
        .catch(function () {
          count += 1;
          render(count);
          safeSet("localStorage", CACHE, String(count));
        });
    });
  })();

  /* ============ 10c. 评论区（GitHub Issues，零后端） ============ */
  (function comments() {
    var sec = document.getElementById("comments");
    if (!sec) return;
    var slug = sec.getAttribute("data-slug") || "";
    var list = document.getElementById("comment-list");
    var form = document.getElementById("comment-form");
    var text = document.getElementById("comment-text");
    var ghLink = document.getElementById("comment-gh");
    var countEl = document.getElementById("comment-count");
    if (!list || !form) return;

    var OWNER = "Tiantiankaixin6666";
    var REPO = "Tiantiankaixin6666.github.io";
    var prefix = "[评论] " + slug;
    var newUrl = "https://github.com/" + OWNER + "/" + REPO + "/issues/new";
    var listUrl = "https://github.com/" + OWNER + "/" + REPO + "/issues?q=" +
      encodeURIComponent('is:issue "' + prefix + '"');
    if (ghLink) ghLink.href = listUrl;

    function el(tag, cls, txt) {
      var n = doc.createElement(tag);
      if (cls) n.className = cls;
      if (txt != null) n.textContent = txt;
      return n;
    }

    function render(items) {
      list.innerHTML = "";
      if (!items.length) {
        list.appendChild(el("p", "comment-empty", "还没有评论，来抢第一楼。"));
        if (countEl) countEl.textContent = "";
        return;
      }
      if (countEl) countEl.textContent = "(" + items.length + ")";
      items.forEach(function (it) {
        var wrap = el("div", "comment-item");
        var head = el("div", "comment-head");
        if (it.user && it.user.avatar_url) {
          var img = doc.createElement("img");
          img.className = "comment-avatar";
          img.src = it.user.avatar_url;
          img.alt = "";
          img.loading = "lazy";
          head.appendChild(img);
        }
        var who = el("a", "comment-user", it.user ? it.user.login : "匿名");
        who.href = it.user ? it.user.html_url : "#";
        who.target = "_blank";
        who.rel = "noopener";
        head.appendChild(who);
        head.appendChild(el("span", "comment-time", (it.created_at || "").slice(0, 10)));
        wrap.appendChild(head);

        var body = (it.body || "").replace(/\n\n---\n来自：[\s\S]*$/, "");
        wrap.appendChild(el("div", "comment-body", body));

        var src = el("a", "comment-src", "查看原文 ↗");
        src.href = it.html_url;
        src.target = "_blank";
        src.rel = "noopener";
        wrap.appendChild(src);
        list.appendChild(wrap);
      });
    }

    fetch("https://api.github.com/repos/" + OWNER + "/" + REPO +
          "/issues?state=all&per_page=100&sort=created&direction=asc",
          { headers: { "Accept": "application/vnd.github+json" } })
      .then(function (r) { return r.json(); })
      .then(function (arr) {
        if (!Array.isArray(arr)) throw new Error("bad response");
        render(arr.filter(function (it) {
          return !it.pull_request && (it.title || "").indexOf(prefix) === 0;
        }));
      })
      .catch(function () {
        list.innerHTML = "";
        var p = el("p", "comment-empty", "评论加载失败，");
        var a = el("a", "", "去 GitHub 查看");
        a.href = listUrl;
        a.target = "_blank";
        a.rel = "noopener";
        p.appendChild(a);
        p.appendChild(doc.createTextNode("。"));
        list.appendChild(p);
      });

    on(form, "submit", function (e) {
      e.preventDefault();
      var content = (text.value || "").trim();
      if (!content) { if (text) text.focus(); return; }
      var pageTitle = document.title.replace(/\s*·\s*像素冒险\s*$/, "");
      var title = prefix + " · " + pageTitle;
      var body = content + "\n\n---\n来自：" + location.href + "\n（通过博客评论区提交）";
      var url = newUrl + "?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);
      var a = doc.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      doc.body.appendChild(a);
      a.click();
      doc.body.removeChild(a);
    });
  })();

  /* ============ 11. 主题 / 光标开关 ============ */
  (function controls() {
    var THEME_KEY = "px:theme";
    function applyTheme(t) {
      root.setAttribute("data-theme", t);
      var btn = $("#theme-toggle");
      if (btn) btn.textContent = t === "day" ? "☾ 夜晚" : "☀ 白天";
      $$('[data-action="theme"] b').forEach(function (b) { b.textContent = t === "day" ? "开" : "关"; });
    }
    var savedTheme = safeGet("localStorage", THEME_KEY) || "night";
    applyTheme(savedTheme);

    function toggleTheme() {
      var next = root.getAttribute("data-theme") === "day" ? "night" : "day";
      safeSet("localStorage", THEME_KEY, next);
      applyTheme(next);
    }
    on($("#theme-toggle"), "click", toggleTheme);
    $$('[data-action="theme"]').forEach(function (el) { on(el, "click", toggleTheme); });

    // 动态特效开关（切换后重载以完全生效）
    var motionOn = !root.classList.contains("reduce-motion");
    $$('[data-action="motion"] b').forEach(function (b) { b.textContent = motionOn ? "开" : "关"; });
    $$('[data-action="motion"]').forEach(function (el) {
      on(el, "click", function () {
        var isOn = !root.classList.contains("reduce-motion");
        safeSet("localStorage", "px:motion", isOn ? "off" : "on");
        location.reload();
      });
    });

    var curItem = $('[data-action="cursor"] b');
    if (curItem) curItem.textContent = (window.__pxCursor && window.__pxCursor.isEnabled()) ? "开" : "关";
    $$('[data-action="cursor"]').forEach(function (el) {
      on(el, "click", function () {
        if (!window.__pxCursor) return;
        var next = !window.__pxCursor.isEnabled();
        window.__pxCursor.setEnabled(next);
        safeSet("localStorage", "px:cursor", next ? "on" : "off");
        if (curItem) curItem.textContent = next ? "开" : "关";
      });
    });
  })();

  /* ============ 12. 滚动揭示 ============ */
  observeReveals(doc);

  // 兜底：个别环境 IntersectionObserver 不回调时，按视口手动揭示，避免内容空白
  (function revealFallback() {
    function check() {
      var vh = window.innerHeight || 1;
      $$(".reveal:not(.is-visible)").forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < vh - 20 && r.bottom > 0) n.classList.add("is-visible");
      });
    }
    var ticking = false;
    on(window, "scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { ticking = false; check(); });
      }
    }, { passive: true });
    on(window, "load", function () { setTimeout(check, 260); });
    setTimeout(check, 1000);
  })();

  /* ============ 13. 页面转场（像素幕帘） ============ */
  (function transitions() {
    var wipe = $("#wipe");
    function internal(a) {
      var href = a.getAttribute("href");
      if (!href) return false;
      if (href.charAt(0) === "#") return false;
      if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return false;
      if (a.target === "_blank" || a.hasAttribute("download")) return false;
      return true;
    }
    on(doc, "click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || !internal(a)) return;
      if (reduce || !wipe) return;
      e.preventDefault();
      wipe.classList.remove("out");
      wipe.classList.add("active");
      setTimeout(function () { location.href = a.href; }, 360);
    });
    on(window, "pageshow", function () {
      if (wipe) { wipe.classList.remove("active", "out"); }
      observeReveals(doc);
    });
    // 返回时复用 bfcache，清理幕帘
    on(window, "beforeunload", function () { if (wipe) wipe.classList.remove("active"); });
  })();

  /* ============ 14. 页脚年份 ============ */
  var y = doc.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
