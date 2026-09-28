# 我的 GitHub Pages 博客

一个用纯静态 HTML/CSS/JS 搭建的轻量博客，零依赖、零构建，托管在 GitHub Pages。

## 目录结构

```
github-io-blog/
├── index.html              # 首页（文章列表）
├── about.html              # 关于页
├── 404.html                # 404 页
├── posts/                  # 每篇文章一个 HTML 文件
│   └── dengbao2-0.html     # 《我对等保2.0的理解》
├── assets/
│   ├── css/style.css       # 全局样式（含亮/暗色主题、表格）
│   ├── js/main.js          # 主题切换 + 页脚年份
│   └── img/hero-bg.png     # 首页 hero 背景图
└── README.md
```

## 本地预览

直接用浏览器打开 `index.html` 即可；或起一个本地服务（推荐，路径更准）：

```bash
# Python
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库，**仓库名必须**为 `Tiantiankaixin6666.github.io`
   （例如用户名是 `xiaoming`，仓库就叫 `xiaoming.github.io`）。
2. 把本文件夹里的**所有内容**（不含外层 `github-io-blog` 目录本身）推送到该仓库：

   ```bash
   git init
   git add .
   git commit -m "first blog"
   git branch -M main
   git remote add origin https://github.com/Tiantiankaixin6666/Tiantiankaixin6666.github.io.git
   git push -u origin main
   ```

3. 进入仓库 **Settings → Pages**，Source 选择 `main` 分支、根目录 `/`，保存。
4. 等 1～2 分钟，访问 `https://Tiantiankaixin6666.github.io` 即可。

> 用户级站点（`用户名.github.io`）用 `main` 分支根目录即可，无需 `docs/` 文件夹。

## 自定义

- **改名字 / 简介**：编辑 `index.html` 里的 `<title>`、`hero` 区块文字、头像字母。
- **换 hero 背景图**：替换 `assets/img/hero-bg.png`（建议 1600×600 以上、宽高比约 3:1）。
- **换社交链接**：改 `index.html` 和 `about.html` 里的 `#` / 占位地址。
- **改配色**：编辑 `assets/css/style.css` 顶部 `:root` 与 `[data-theme="dark"]` 的变量。
- **加文章**：复制 `posts/dengbao2-0.html`，改内容后到 `index.html` 加一张卡片。
- **发文更新线上**：改完后在本目录执行 `git add -A && git commit -m "new post" && git push`。
- **绑定自定义域名**：在仓库放一个 `CNAME` 文件，内容为你的域名，并在域名 DNS 处加一条 `CNAME` 记录指向 `Tiantiankaixin6666.github.io`。
