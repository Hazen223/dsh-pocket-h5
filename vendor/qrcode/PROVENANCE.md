# 内置二维码编码器（vendor）

面板里的「手机扫码」功能需要一个 **完全离线** 的二维码编码器：插件的浏览器模块只能
`require('react')`，不能加载 npm 包，也不应把 H5 地址发给任何在线 QR 服务。

因此这里内置了 [`node-qrcode`](https://github.com/soldair/node-qrcode) 的**矩阵生成内核**
（不含 canvas / PNG / 终端渲染器与 CLI），由 `build-client.mjs` 打包进 `client.js`；
二维码的 SVG 由插件自己按矩阵绘制（`src/client/qr.js`）。

## 来源与版本

- 包：`qrcode` **1.5.4**，作者 Ryan Day，许可证 **MIT**
- 提取自已安装的 DeepSeek Harness Desktop 运行时（其 `app.asar` 内的 `node_modules/qrcode/`，
  即该应用依赖树里的同一版本），不是从网络重新下载的。
- 只保留 `lib/core/*.js` 共 22 个文件（`qrcode.js` → `segments` → `dijkstrajs` 的完整依赖闭包）。
  `lib/core/qrcode.js` 的 `create(text, { errorCorrectionLevel })` 返回 `{ modules: { size, data }, version }`。
- 许可全文：`LICENSE`（node-qrcode 原始 MIT 文本，Copyright © 2012 Ryan Day）。
- 唯一外部依赖 `dijkstrajs` 1.0.3（MIT，Copyright © 2008 Wyatt Baldwin）位于
  `node_modules/dijkstrajs/`，保留原始 `LICENSE.md`。
- `package.json` 声明 `"type": "commonjs"`，让这些上游 CJS 文件在 Node 与打包器里都按原样解析。

MIT 许可证允许再分发，但保留上述版权与许可声明。若后续升级 `qrcode`，替换
`lib/core/` 后运行 `node build-client.mjs` 与 `node tests/client-smoke.mjs`（含二维码结构断言）。
