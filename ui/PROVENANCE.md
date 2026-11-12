# 复用来源（上游快照）

本目录下的文件是独立 Electron / 浏览器版 **Pocket · H5 预览工作台** 的原样拷贝，
DSH 插件面板的界面与交互全部由这些文件生成，未重写视觉层。

- 上游项目：Pocket · H5 预览工作台（作者自有的独立 Electron / 浏览器项目；原样快照见本目录）
- 快照版本：`pocket-h5` 1.2.0（`upstream-package.json`），Electron 外壳 1.4.0
- 拷贝文件：`index.html`、`styles.css`、`app.js`、`demo.html`
- 这些文件**不做手工修改**；`build-client.mjs` 在构建时做可复现的宿主适配转换：
  shadow DOM 作用域、`100vh → 100%`、`document.* → ShadowRoot`、去除 Electron 桥、
  demo 地址注入、监听器/观察器生命周期托管。转换规则集中在构建脚本里，便于逐条审查。

移植与降级说明见 `../docs/adaptation.md`。
