# Quartz 发布说明

这个仓库现在使用“显式发布”方式同步笔记到 Quartz。

## 发布一篇笔记

在要公开的 Markdown 笔记最顶部加 frontmatter：

```yaml
---
publish: true
---
```

然后运行：

```bash
npm run sync-content
npx quartz build
```

同步脚本会把带有 `publish: true` 的笔记复制到 `content/`，并尽量复制这些笔记中引用的本地图片、PDF、音频、视频、Canvas、Excalidraw 等附件。

如果没有任何笔记带 `publish: true`，脚本会保留现有 `content/`，不会清空内容。

## GitHub Pages

推送到 `master` 分支后，`.github/workflows/deploy-quartz.yml` 会自动执行：

```bash
npm ci
npm run sync-content
npx quartz build
```

构建产物会上传到 GitHub Pages。仓库需要在 GitHub 设置里把 Pages 来源设置为 **GitHub Actions**。

