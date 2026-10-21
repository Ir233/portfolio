# 罗能 · 视频与概念作品集

静态作品网站，入口为 `docs/index.html`，支持 GitHub Pages、Cloudflare Pages 和 Cloudflare Workers Static Assets。

## 内容

- 惊悚乐园：宣传 PV、怪物概念设计、指定时间段镜头导航
- 平田的世界：完整 PV、项目与故事简介、角色及场景设计
- 失真地：创作调研、角色与元素设定、完整绘本图像序列

字体为作品集同款 Cubic 11（俐方体11号）；许可保存在 `assets/fonts/LICENSE.txt`。视频分段、播放器与字体均托管在本仓库，无需第三方 CDN。作品图像与视频仅为作品集展示用途，字体和第三方播放器保留各自许可。

## Cloudflare

连接本仓库，Pages 的构建命令留空、输出目录设为 `docs`。如采用 Workers & Pages 的 Worker 流程，仓库提供 `wrangler.jsonc`，部署命令为 `npx wrangler deploy`。

本地预览：`python3 -m http.server 8765 --directory docs`。

GitHub Pages：main 分支的 `/docs` 目录。

## Vercel

导入 Ir233/portfolio，保留仓库根目录，框架选择 Other。根目录的 vercel.json 已指定静态输出目录 docs，并配置两个 PV 的 HLS 播放类型，无需构建或安装依赖。
