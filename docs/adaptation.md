# Pocket H5 面板：复用与适配说明

> 面向后续维护者。读完本文应能回答四件事：上游是什么、这次交付了什么、
> 哪些东西是原样复用/怎么变成面板的、哪些能力在浏览器里做不到且我们怎么处理。
>
> 阅读顺序：本文件（复用与适配）→ `ui/PROVENANCE.md`（快照溯源）→ `docs/verification.md`（独立验证记录）。
>
> 写作状态：阶段 1 按 移植规格 目标架构成文；阶段 2/3/4 已逐条对照真实构建产物与 DSH 运行时契约
> （详见 `docs/verification.md`），本文与代码不一致处已按代码修正。唯一新增（上游没有）的能力是
> **手机扫码**，单独成节（§9）。当前仍未做浏览器内渲染/交互的视觉验证。

## 1. 上游是什么

- 项目：**Pocket · H5 预览工作台**。本地 H5 预览工具：左侧是预览设置，右侧是一部
  按真机物理尺寸缩放的 iPhone 17 外框，屏幕里用 `<iframe>` 加载你本机正在开发的 H5 页面。
- 上游来源目录：Pocket · H5 预览工作台（快照见本仓库 `ui/`）
  （见 `ui/PROVENANCE.md`）。
- 版本：`pocket-h5` 1.2.0（`ui/upstream-package.json`），Electron 外壳 1.4.0。
- 上游有两种运行形态，共用同一套静态界面：
  1. **浏览器版**：`node server.mjs` 起一个只监听回环地址的静态服务（默认
     `http://127.0.0.1:4177`，被占用时顺延），浏览器打开该地址使用。
  2. **Electron 独立应用**：`native/` 打包源码经 `bash native/build-intel.sh` 生成
     x86_64 `.app`，走系统 Cocoa / WebKit，额外获得应用内 SOCKS5 代理、原生显示器
     毫米度量、Chromium DevTools、webview 导航状态等能力。
- 技术形态：**无框架的单页静态文件**——
  - `ui/index.html`（144 行）：页面骨架、全部控件与内联 SVG symbol 图标库；
  - `ui/styles.css`（1000 行）：整页样式，纯黑白灰，无选择器命名空间；
  - `ui/app.js`（323 行）：全部交互（地址归一化、缩放、校准、代理、说明弹窗、toast、
    localStorage 持久化），有 `if (window.pocketDesktop)` 的 Electron 分支；
  - `ui/demo.html`：内置示例 H5（「留白」页），预览 iframe 的默认内容。
- 关键行为：本地存储键 `pocket-h5-v1`（外观/最近地址/校准/代理端点），逻辑画布
  402 × 874（iPhone 17，@3x，机身 71.5 × 149.6 mm），100% = 真机物理大小。

## 2. 这次交付什么

交付物是一个 **DeepSeek Harness Web GUI 插件面板**，不是 Electron 应用、不是独立窗口，
也不是「用一个 iframe 把上游页面整个包进来」：

- 包名 / client factory id：`dsh-pocket-h5`；loader row id：`pocket-h5`；
- 侧栏入口：注册到 `sidebar.panellist`，id 为 `pocket-h5`（左侧栏「Pocket H5」图标）；
- 主面板：注册到 root 作用域的 `main` keyed slot，key 为 `pocket-h5`；
- 界面与交互**仍由上游四个文件生成**（视觉层不重写）；面板组件在宿主页面内建立
  **Shadow DOM** 承载上游标记与样式，再运行由 `ui/app.js` 机械转换出的
  `mountPocketH5(root, DEMO_URL)`；
- 预览本体仍是上游的 `<iframe id="previewFrame">`，加载用户自己的 H5 开发服务地址；
- 内置示例 `ui/demo.html` 不塞进 client.js，而是由 **Host 半** 通过 `ctx.webServer`
  注册路由 `/pocket-h5`（prefix，只放行 demo）提供；面板侧
  `DEMO_URL = new URL('/pocket-h5/demo.html', window.location.origin).href`。
  这样示例页是一个真实可预览的同源文档，和用户自己的 H5 走完全一样的 iframe 路径。
- **`location.origin` 的两种取值**：浏览器打开时是 `http://127.0.0.1:<port>`；DSH 桌面应用里
  是 `dsh-app://app/`（Electron 自定义协议，`standard+secure`，`/`、`/index.html`、`/assets/*`
  之外的请求由 `forwardWebRequest` 带上宿主凭据转发到本机 Host）。两种情况下
  `dsh-app://app/pocket-h5/demo.html` 都会命中 Host 注册的 demo 路由；该转发行为来自
  `index.js` 代码与桌面端协议实现，未在本会话做桌面窗口内的视觉验证。
- **新增一项上游没有的能力：手机扫码**（见 §9）。地址栏右侧二维码按钮 → 把当前预览地址渲染成
  离线二维码 → 手机扫码打开；编码器内置于 bundle，不联网、不新增依赖。
- **新增一项上游没有的能力：登录桥**（见 §14）。Host 起一个只监听 `127.0.0.1` 的反向代理，
  把 Safari 里已登录的 Cookie（或手动粘贴的 Cookie 头）注入上游请求，iframe 改走代理；
  需要登录、或原本禁止 iframe 嵌入的页面都能在面板里预览。Cookie 只在 Host 内存，停止/失焦/闲置即释放。
- **新增一项上游没有的能力：预览诊断**（见 §13）。Host 半新增
  `GET /pocket-h5/probe.json`：受控地请求目标地址（只读响应头、最多 5 次跳转、6 秒超时），
  面板据此区分「站点禁止 iframe 嵌入」「被重定向到登录页 / 401」「服务访问不到」，并给出建议。
  同时「新窗口打开」入口改名为「在系统浏览器打开」——它实际由 DSH 桌面端
  `shell.openExternal` 交给系统浏览器，用的是系统浏览器的登录态。
- **显示器物理尺寸探测**：Host 半在 macOS 上提供 `GET /pocket-h5/display.json`（CoreGraphics
  → 毫米/像素几何），面板用它把上游的 `window.pocketDisplayMetrics` 桥填上，使 `100%` 恢复为
  真机物理大小；非 macOS/失败时退回浏览器估算 + 尺子校准（见 §7.1）。

为什么不用 iframe 装整个面板页：iframe 里的页面拿不到宿主主题/语言/上下文，
也会多一层自有滚动与焦点边界；DSH 的面板本身就是 React 组件 + slot，直接渲染才能
和宿主布局、侧栏、快捷键一致（移植规格 §架构已定）。

交付目录（构建完成后）：

```
dsh-pocket-h5/
├── package.json        # 包名 dsh-pocket-h5；声明 dsh.client（platform: web）；exports["./client"] → client.js
├── index.js            # Host 半（Node）：ctx.webServer 注册 prefix /pocket-h5（demo 页 + display.json + probe.json）
├── client.js           # 客户端半（由 build-client.mjs 生成，禁止手改）
├── build-client.mjs    # 构建脚本：ui/ + src/client/ → client.js，含静态自检与 vendor 打包
├── src/client/panel.js # 面板外壳：Shadow DOM 挂载 + 槽位注册 + 侧栏图标
├── src/client/qr.js    # 新增能力：手机扫码按钮/对话框/SVG 渲染
├── src/client/diagnose.js # 新增能力：诊断按钮/对话框/结论翻译（禁止嵌入 vs 登录）
├── ui/                 # 上游快照（只读输入，原样，不手工修改）
├── vendor/qrcode/      # 离线二维码内核（node-qrcode 1.5.4 core + dijkstrajs，MIT，见其 PROVENANCE.md）
├── locale/             # 插件元数据本地化（zh/en，描述含二维码）
├── tests/host-smoke.mjs   # Host 冒烟测试（假 ctx）
├── tests/client-smoke.mjs # Client 冒烟测试（__ModuleLoader__ + React stub + QR 内核逐位校验）
└── docs/               # adaptation.md（本文）、verification.md（独立验证）
```

**面板如何被加载**（维护时最容易踩的链条）：DSH 的 `client-modules` 会扫描 Loader 里
已启用且声明了 `dsh.client` 的包，按 `exports["./client"]` 找到 `client.js` 并通过
bundle 路由下发给 Web GUI；浏览器侧用 `window.__ModuleLoader__.load({ id, factory })`
注册模块，`factory(require)` 返回含 `apply(ctx)` 的 Cordis 插件对象（当前是
`{ inject: ['slots'], apply }`），再由 `ctx.slots.inject('main' | 'sidebar.panellist', ...)`
完成挂载。因此：**包名、`dsh.client.platform='web'`、`exports["./client"]`、factory id
四者必须一致**，否则会出现「包装了但没有面板」。

## 3. 复用清单

「原样复用」指 `ui/` 下四个文件与上游逐字节一致（来源与版本见 `ui/PROVENANCE.md`），
所有宿主适配都发生在构建期，转换规则集中在 `build-client.mjs`，便于逐条审查与回退。

| 上游文件 | 上游职责 | 复用方式 | 在面板里的落点 |
| --- | --- | --- | --- |
| `ui/index.html` | 页面骨架、全部控件、SVG symbol 图标库 | 构建期取 `<body>` 内容；删除 `<script>`；把 `<symbol>` 展开进对应 `<use>`（shadow 内 fragment `use` 不可靠） | `client.js` 的 `MARKUP` 常量 → `<style>` 之后注入 ShadowRoot |
| `ui/styles.css` | 全部视觉（1000 行，黑白灰） | 构建期做作用域与单位转换（见 §4）；除 `:root`/`body` 两处边界选择器外，选择器零改动 | `client.js` 的 `CSS` 常量 → ShadowRoot 内 `<style>` |
| `ui/app.js` | 全部交互与状态 | 构建期机械转换（删除 Electron 桥、替换 demo 地址、包装生命周期），不做其它重构 | `client.js` 内的 `mountPocketH5(root, DEMO_URL)` |
| `ui/demo.html` | 内置示例 H5 | **原样不动、不参与转换**；Host 读取文件并作为 `/pocket-h5/demo.html` 响应 | `index.js`（Host 半）的路由处理器 |
| `ui/PROVENANCE.md`、`ui/上游使用说明.md`、`ui/upstream-package.json` | 溯源、上游使用说明、上游包元数据 | 只随 bundle 保留作参考 | 不参与构建 |

原样复用的直接收益：上游发布新版时，替换 `ui/` 四个文件 + 重跑 `node build-client.mjs`，
不需要重新手改 1000 行样式；`docs/verification.md` 里记录了构建自检，回归成本低。

## 4. 构建期转换（摘要；权威规则在 `build-client.mjs`）

只允许做 移植规格 列出的这几类机械转换，不做结构性重构：

1. **HTML**（`build-client.mjs` `buildMarkup`）：取 `<body>`；删 `<script>`；`<svg class="icon-library">`
   里的 `<symbol>` 按 `id` 展开进每个 `<use>`，产物中不残留 `<use>` 引用（避免 shadow 内 fragment
   引用失效），随后移除图标库骨架元素；品牌链接 `<a class="brand" href="/">` 改成不可导航的
   `<div class="brand">`（面板里点它会把宿主页面导航走）；代理提示「需要 macOS 14+ 独立应用」
   替换为面板版降级说明，代理分区第二条提示「仅作用于 Pocket；本机地址直连。账号密码不保存到磁盘。」
   替换为「面板版不会修改系统或浏览器代理；示例与预览请求沿用宿主网络设置。」
2. **CSS 作用域与单位**（`buildCss`）：
   - `:root` → `:host`（上游的字体/配色变量落到宿主元素上，仍在 shadow 边界内；含 3 个媒体查询，
     共 5 处 `:host`），并给 `:host` 补 `color-scheme: light`（上游页面头部 meta 的等价物）；
   - `body{margin:0;overflow:hidden}` → `:host{display:block;height:100%;margin:0;overflow:hidden}`；
   - `.workspace` 的 `height:100vh/100dvh` → `height:100%`（面板高度由宿主 flex 决定，没有视口可占）；
   - `.toast`、`.help-backdrop`、`.fallback-dialog[open]` 的 `position:fixed` → `absolute`
     （`fixed` 相对浏览器视口，会飘出面板）；
   - 删除上游的 `webview#previewFrame{display:flex}` 规则（面板里没有 webview 元素）；
   - 追加 `.pocket-h5-root{position:relative;height:100%;min-height:0;overflow:hidden}` 作为面板根容器。
     （上游的 `.icon-library` 规则仍保留在 CSS 里，元素已删，属无害死规则。）
3. **JS**（`buildApp`）：删除 `if (window.pocketDesktop) { ... }` 整块（上游 app.js 第 27–49 行，Electron 桥）；
   4 处 `new URL('/demo.html', location.href).href`（第 21、87、212、321 行）替换为 `DEMO_URL`；
   刷新按钮回调里的 `if (window.pocketDesktop) ... else ...` 简化为浏览器分支；
   代理不可用文案改为面板版说明；`document.createElement` → `realDocument.createElement`
   （ShadowRoot 没有 `createElement`，只有 datalist option 这一处需要）；
   `new ResizeObserver(resizeDevice).observe(...)` 拆成可清理变量；
   `requestAnimationFrame(resizeDevice)` 记入 `pocketAnimationFrame`，cleanup 里 `cancelAnimationFrame`
   （否则卸载竞态会对已移除的 shadow 执行 `resizeDevice`）；
   去掉上游 `?url=` 直开（面板里的 `location.search` 是宿主页面的查询串），初始地址只取 `saved.url`；
   包装为 `function mountPocketH5(root, DEMO_URL)`，内部 `const document = root;`（ShadowRoot 支撑
   `getElementById/querySelectorAll/addEventListener`），`window` 用 Proxy 包真实 window 并记录
   `addEventListener` 以便卸载时全部移除；末尾 `return () => { ... }` 清理监听器/定时器/动画帧/观察器。
4. **生成模块壳**：`window.__ModuleLoader__.load({ id: 'dsh-pocket-h5', factory(require) { ... } })`，
   factory 内 `const React = require("react")`、`const h = React.createElement`，内含 `CSS`/`MARKUP`、
   `mountPocketH5`、面板 React 组件、侧栏图标组件、`apply(ctx)`；factory 返回
   `{ inject: ['slots'], apply }`（Cordis 对象插件形态），另带一个只读的 `__test` 入口供
   `tests/client-smoke.mjs` 检查二维码内核（渲染不读取）。
5. **手机扫码（新增能力）的组装**：`src/client/qr.js` 原样插入 factory；`vendor/qrcode` 的
   23 个 CJS 模块（node-qrcode 1.5.4 内核 + dijkstrajs）由 `build-client.mjs` 用最小 require
   解析器打包进 `client.js`（不新增运行时依赖、不联网）；`QR_CSS` 与上游 CSS 一起
   `style.textContent = CSS + QR_CSS` 注入 shadow（详见 §9）。
6. **自检**（构建脚本内置，失败即非零退出）：`$('id')` 引用的 id 都存在于标记中（当前 51 个）、
   标记无 `<use>` 残留、CSS 有 `.pocket-h5-root` 且 `:host` 恰好 5 处、无 `position:fixed` 残留、
   CSS 花括号配对、面板片段含 `main` 与 `sidebar.panellist` 槽位注册、含二维码入口与 QR_CSS 注入、
   面板片段接入 Host 显示器探测（`applyHostDisplayMetrics`）、vendor 打包 23 个模块、
   `client.js` 的 id 取自包名、`node --check client.js` 通过。

## 5. 为什么用 Shadow DOM

上游 CSS 是**整页样式**：`:root`、`body`、元素选择器 `button/svg/select/h2/p/a`、`dialog`、
`#previewFrame`、`.workspace`、`.sidebar`…… 没有任何命名前缀，也没打算嵌入别的应用。
直接把它注入宿主文档会出两种事故：

- **污染宿主**：`button`、`svg`、`select`、`dialog`、`h2`、`a` 这些元素选择器会命中 DSH GUI
  自己的控件，把宿主 UI 改形；`.workspace/.sidebar/.canvas` 这类类名也可能撞上。
- **被宿主覆盖**：宿主自己的 reset / 主题 / 组件样式会反过来改面板内部。

Shadow DOM（`attachShadow({ mode: 'open' })`）把整份 CSS 和整棵标记关进隔离树：
选择器只在面板内匹配，宿主样式进不来，面板样式也出不去。于是**上游 CSS 除 `:root`/`body`
两处边界改写外，一行选择器都不用改**，只需在边界上做 §4 那几处机械适配。

边界与代价（维护时要知道）：

- 隔离是单向的：shadow 内样式不外泄，但**可继承属性**（`font-family`、`color` 等）仍会从宿主
  继承进来；上游 `:root → :host` 重新声明了字体与颜色，实际会覆盖。
- **宿主主题 token 的映射**：外观层（§15）把上游变量名映射到 `light-dark()` 面层令牌，
  并用继承的 `color-scheme` 跟随 DSH 浅色/黑暗主题；上游 CSS 本身仍保持黑白灰硬编码，
  由外观层覆盖具体选择器。
- 事件不穿透（`composed` 事件除外）：上游的 `document.addEventListener('keydown')` 转换后
  监听的是 ShadowRoot；焦点在预览 iframe 内时父文档收不到键盘事件（上游同样如此）。
- `position: fixed` 在 shadow 内仍相对浏览器视口，所以 toast/遮罩必须改 `absolute`。
- 无法用宿主全局 CSS 覆盖面板内部；需要定制时改 `build-client.mjs` 的 CSS 转换或加 `:host` 规则。
- dialog 的 `showModal()` 仍在顶层，正常可用；上游的 `fallback-dialog` 分支（`showModal`
  不可用时）同样被构建期改成 `position:absolute`，Chromium 下不会走到该分支。
- 面板用 `:host{display:block;height:100%}` 撑满 React 组件给的 div；**它的高度依赖宿主
  `main` 槽容器提供确定高度**（宿主 center column 是 flex 列容器）。静态代码成立，
  真实像素表现需安装后在 GUI 里目视确认（见 `docs/verification.md` 未验证项）。

## 6. 面板与宿主布局的关系

```
DSH Web GUI（宿主页面）
├─ sidebar.panellist → 侧栏图标（24×24 phone 轮廓，复用上游 i-phone 图形）
└─ main keyed slot "pocket-h5"
   └─ <div ref>  style: height:100%; flex:1 1 auto; min-height:0     ← 组件挂载点
      └─ #shadow-root (open)
         ├─ <style>（由 ui/styles.css 转换）
         ├─ 上游 <body> 标记（symbol 已内联）
         └─ .workspace = 上游 296px 设置栏 + 手机画布
            └─ iframe#previewFrame → 用户 H5（如 http://127.0.0.1:5173）
```

- 面板用宿主给的 slot 高度撑满：`:host{display:block;height:100%}` + `.workspace{height:100%}`，
  上游 `.sidebar`（`overflow:auto`）与 `.canvas`（`overflow:auto`）各自滚动，互不影响。
- 面板内的 296px 左栏是**上游的预览设置栏**，和 DSH 自己的导航侧栏是两层东西，不要混淆。
- 上游已有 1600 / 1100 / 820 / 760 宽度断点，面板变窄时按上游窄窗口规则收缩；
  不需要为面板另写响应式。
- 侧栏图标组件接收宿主传入的 `{ size, active }`；当前实现只读取 `size`（默认 18），
  `active` 未消费。图标用 `stroke="currentColor"`，选中态视觉由宿主按钮继承色决定
  （实际效果未做视觉验证）。
- 卸载：React 组件卸载即移除 shadow 树，但 **window 上的监听器、定时器、动画帧、ResizeObserver
  不会自动消失**，必须靠 cleanup 逐一清理（移植规格 §面板组件约束）。当前有两份 cleanup：
  `mountPocketH5` 返回的 dispose（`window` 监听器经 Proxy 记录、`toastTimer`/`loadingTimer`/
  代理超时定时器、`pocketAnimationFrame`、`canvasObserver.disconnect()`）和
  `mountQrFeature` 返回的 disposeQr（移除二维码按钮与对话框）；面板 `useEffect` 卸载时两者都调用。

## 7. Electron 宿主接口逐项映射

下表左侧严格对应上游 Electron preload 暴露的接口；最后一列是**预期实现位置**
（阶段 2 在真实代码中逐条核对，结果见 `docs/verification.md`）。

| 上游 Electron 接口 | 面板里的适配 | 说明 | 预期实现位置（阶段 2 核对） |
| --- | --- | --- | --- |
| 本地 http server 提供工作台页面（`main.cjs startServer` / `server.mjs`） | Client 插件模块 + Shadow DOM 直接承载界面；Host 只服务 `demo.html` | 不再需要上游 4177/4197 这类独立端口 | `client.js`：`PocketH5Panel` + `mountPocketH5`；`index.js`：`ctx.webServer.register({kind:'prefix', path:'/pocket-h5', handler})`，只放行 `/pocket-h5/demo.html` 与别名 `/pocket-h5/demo` |
| `pocket:metrics`（原生 display-metrics 辅助程序） | macOS 上由 Host 侧 CoreGraphics 探测（`GET /pocket-h5/display.json`），Client 把结果填回上游的 `window.pocketDisplayMetrics` 桥；其它平台/探测失败退回 `screen` 估算 + 尺子校准 | `100%` 在 macOS 上恢复为真机物理大小（本机 127.5 CSS px/inch）；非 macOS 与失败路径保持原降级，不静默假装成功 | `index.js`：`DISPLAY_PATH` / `DISPLAY_PROBE` / `readDisplays()`（30s 缓存）；`src/client/panel.js`：`pickHostDisplay` / `hostCssPixelsPerInch` / `applyHostDisplayMetrics` / `watchHostDisplayMetrics`；`client.js` 内上游 `displayScale()` 原样消费该桥 |
| `pocket:proxy`（Chromium session proxy + proxy-chain 本地中转） | **不可用**：保留 SOCKS5 面板但禁用，文案改为说明面板版限制 | 面板页面无法设置浏览器/iframe 请求的代理；不静默回退 | `build-client.mjs` 删除 Electron 块（app.js 27–49 行）→ `window.pocketProxyAvailable` 永不为 true → `proxySupported()` 为 false → `updateProxyAvailability()` 禁用表单；代理文案由构建期替换 |
| `pocket:devtools` | 不可用，隐藏「打开开发者工具」按钮 | 浏览器内不开放 | `ui/index.html` 的 `#devToolsButton` 默认 `hidden`；Electron 块删除后不再有取消 hidden 的代码 |
| `pocket:reload` | 浏览器分支：重新设置 iframe `src` | 上游已有分支 | `client.js` 内刷新按钮回调的 `else` 分支：`navigate(currentUrl, false)` |
| `pocket:navigation`（webview 导航事件） | 浏览器分支：iframe `load` 事件 + 状态条文案 | 跨域无法读取真实导航 | `client.js` 内 `#previewFrame` 的 `load` 监听；Electron `onNavigation` 块已删除 → `navigationMessage` 恒为空 |
| `pocket:refresh`（菜单 ⌘R） | 去掉；面板内刷新按钮 / 快捷键由宿主管理 | 不注册全局快捷键 | 无实现；`build-client.mjs` 不生成任何快捷键注册（宿主 ⌘R 刷新整个 GUI，见 §10） |
| `pocket:display`（显示器变化） | `window resize` + ResizeObserver | 上游浏览器分支 | `client.js` 内 `window.addEventListener('resize', resizeDevice)` 与 `ResizeObserver(resizeDevice).observe($('canvas'))` |
| `localStorage('pocket-h5-v1')` | 保留：面板与宿主同源，持久化外观/地址/校准/代理端点 | 不改存储格式 | `client.js` 内 `persist()` / 启动时 `JSON.parse(localStorage.getItem('pocket-h5-v1'))`，存储键原样 |
| webview + `persist:pocket-chromium` 分区 | 普通 iframe，使用 **DSH 应用默认会话**的 Cookie（持久库在 `~/.dsh/electron-user-data/`） | 面板不提供独立分区，也不读取系统浏览器 Cookie | `ui/index.html` 的 `<iframe id="previewFrame">` 原样保留；Electron 块里把 iframe 换成 webview 的代码被删除 |
| 应用内登录弹窗（上游 `openPage()` 创建同会话子窗口） | **不可用**：DSH 桌面端把 `window.open` 交给系统浏览器（`shell.openExternal`），登录结果回传不回 iframe；改用 `probe.json` 诊断 +「在系统浏览器打开」入口 + 手机扫码 | 这是宿主能力差异，不是配置问题；详见 §13 | `index.js`：`PROBE_PATH` / `probeUrl()` / `assessFraming()`；`src/client/diagnose.js`：`summarizeProbe` / `mountDiagnoseFeature`；`build-client.mjs` 替换按钮文案与帮助说明 |
| 桌面菜单 / 单实例锁 / 应用退出清理 | 宿主负责生命周期；面板卸载时清理监听器/定时器/观察器 | | `client.js` 内 `mountPocketH5` 返回的 cleanup；`PocketH5Panel` 的 `useEffect` 卸载路径；Host 半由 DSH Loader 管理 |

阶段 2/3 逐条核对结果：**12 行全部在代码中找到对应实现**（逐行证据见
`docs/verification.md` §4 与 §11）。阶段 3 已修：代理分区第二条提示已替换为面板版说明；
`requestAnimationFrame` 已纳入清理；`?url=` 读取已去掉。阶段 4 又为 `pocket:metrics`
补了 Host 侧探测（见 §7.1），不再只依赖浏览器估算。目前唯一残留是
`sendProxyRequest` 里不可达的 `window.pocketDesktop` / `window.webkit` 分支
（被 `proxySupported()` 的前置 `return` 挡住，仅代码卫生问题，见 verification R4）。

### 7.1 Host 侧显示器探测（`GET /pocket-h5/display.json`，阶段 4 新增）

上游 `pocket:metrics` 是 Electron 的 native 辅助程序；浏览器页面拿不到显示器毫米尺寸。
面板版的做法是让 **Host（Node 侧）** 代劳，仍然把结果填回上游 app.js 已经认识的
`window.pocketDisplayMetrics` 形状——所以上游 `displayScale()` 一行没改，`100%` 就恢复成
真机物理大小（本机实测 127.5 CSS px/inch）。

- **数据形状**（Host 返回，`application/json`、`no-store`）：
  `{ ok: boolean, platform: string, displays: [{ id, widthMm, heightMm, pixelWidth, pixelHeight }] }`。
  非 macOS 或探测失败为 `{ ok:false, platform, displays: [] }`。
- **探测实现**（`index.js`）：macOS 上 `execFile('/usr/bin/python3', ['-c', DISPLAY_PROBE])`，
  脚本是**常量**（不拼接任何请求/用户输入）——用 ctypes 调 CoreGraphics：
  `CGGetActiveDisplayList` 枚举活动显示器，`CGDisplayScreenSize` 取毫米尺寸，
  `CGDisplayPixelsWide/High` 取当前模式宽度/高度（本机 probe 返回 1512×982；面板用
  `screen.width/height` 精确匹配，设计上两者都是 Retina 的 “looks like” 逻辑分辨率；
  页面侧的 `screen.*` 数值未在无浏览器环境里直接读取，匹配逻辑由 client-smoke 的固定样本覆盖）；
  4s 超时，失败静默返回空数组。
- **匹配规则**（`src/client/panel.js`）：先过滤非法几何（`pixelWidth/pixelHeight/widthMm > 0`），
  再用 `screen.width/height` 与 `pixelWidth/pixelHeight` **精确匹配**当前窗口所在屏；
  只有一块屏时回退用它；多屏且都匹配不上时返回 `null`（退回 96 估算 + 尺子校准）。
- **换算**：`cssPixelsPerInch = pixelWidth × 25.4 / widthMm`，校验范围 16–1100（与上游
  `displayScale()` 的校验一致）；`displayKey = 'host:<id>:<pixelWidth>x<pixelHeight>'`，
  进入上游的校准 key 体系（手动尺子校准仍可覆盖 Host 值）。
- **缓存与刷新**：Host 侧内存缓存 30s（避免每次请求都 spawn python）；Client 首次进面板取一次，
  之后监听 `window resize` 去抖 250ms 重取（即**窗口跨显示器移动 / resize 会重新探测**），
  保证 `100%` 仍对应当前屏。
  卸载时移除该监听并清掉去抖定时器。
- **非 macOS / 失败路径**：返回 `{ok:false,displays:[]}`；Client 保持原浏览器估算（96 CSS px/inch），
  提示「需用尺子校准」。**不静默假装**已拿到真机尺寸（`displayKey` 不变、`ppi` 仍是 96）。
- **隐私**：只返回显示器几何（id/毫米/像素），不读取窗口、用户名、会话、文件或网络信息；
  探测脚本参数固定，不接受任何请求输入；响应只给同源页面用（Host 路由本身受宿主访问策略约束）。
- **已知边界**：需要机器上有 `/usr/bin/python3`（macOS 通常随 Xcode Command Line Tools 提供）；
  `CGDisplayScreenSize` 对个别显示器/转换器可能不准，所以保留尺子校准；多屏且尺寸完全相同时
  仅按 CSS 尺寸无法区分是哪一块；窗口在两块**布局尺寸相同**的屏之间移动时，浏览器可能不触发
  resize，此时不会立即重取（重开面板或触发一次 resize 即可）。

## 8. 能力降级（不粉饰）

按影响从大到小列。这里的每一条都是**真实能力损失**，不是「换个写法等价实现」。

1. **SOCKS5 应用内代理：不可用。**
   上游在 Electron 里通过 Chromium `session.setProxy` + `proxy-chain` 本地中转，
   让 Pocket 内的请求走代理。DSH Web GUI 是普通网页，**网页无法为 iframe 的请求设置代理**，
   浏览器也没有对应 API。落地方式：SOCKS5 折叠区在界面上保留（不删控件，避免布局变化），
   但所有输入与「应用代理配置」按钮 `disabled`，状态文案改为面板版说明
   （实际运行时文案：「面板版不支持应用内代理：iframe 请求沿用宿主浏览器的网络设置。」）。
   **不静默回退**：不会有「点了应用但实际没生效」的假成功——按钮根本不可点。
   表单下方第二条提示也已换成「面板版不会修改系统或浏览器代理；示例与预览请求沿用宿主网络设置。」，
   与降级说明一致（阶段 3 复验已确认）。
   附注：上游浏览器版本来也禁用此控件（仅 macOS 14+ 独立应用可用），所以面板行为与上游
   浏览器版一致，不是我们额外砍掉的功能。
2. **原生显示器毫米度量：macOS 上由 Host 侧恢复；其它平台仍不可用，退回估算 + 尺子校准。**
   上游通过 Electron 的 native 辅助程序取系统报告的显示器毫米尺寸与逻辑分辨率，得到
   `cssPixelsPerInch`。面板的**页面**拿不到这些信息（桌面端 origin 是 `dsh-app://app`，
   浏览器端更没有），但 **Host 是 Node 进程**，可以在 macOS 上调 CoreGraphics 枚举显示器
   （`/pocket-h5/display.json`，见 §7.1），Client 再把结果填回上游的
   `window.pocketDisplayMetrics` 桥。因此：
   - macOS + 探测成功：`100%` = 真机物理大小（本机 127.5 ppi 时，手机框 358.9 CSS px
     宽，换算约 71.5mm，与 iPhone 17 机身一致）；
   - 非 macOS / 没有 python3 / 超时 / 多屏匹配不上：`displayScale()` 回退到
     `browser:${screen.width}x${screen.height}@${devicePixelRatio}` 与 **96 CSS px/英寸**，
     会让手机框比真机**偏小**（本机 96/127.5 ≈ 75%，与用户反馈一致），此时必须用尺子校准；
   - 校准始终保留：在「显示与尺寸 → 校准实际尺寸」里量 200 CSS px 线段，按显示器 key 存进
     `localStorage('pocket-h5-v1')` 的 `calibrations`；手动校准优先于 Host 的估算值
     （Host 数据有误时仍可纠偏）。
3. **Chromium DevTools：不可用。**
   上游独立应用可对 webview 打开 DevTools；面板里没有该能力，`#devToolsButton` 保持
   `hidden`。调试 H5 请在新窗口打开，或用 DSH 页面自身的开发者工具。
4. **webview 导航事件：退化为 iframe `load`。**
   上游能拿到 `statusCode` 与代理错误码，状态条可以显示「预览中 · HTTP 200」或
   「代理转发失败 · HTTP 5xx」。跨域 iframe 读不到这些，面板只会显示
   `load` 后的固定文案（「预览中 · 若空白请查看帮助」）。注意：**`load` 触发不代表页面
   渲染成功**，被 `X-Frame-Options` 拦掉的空白页也可能触发 `load`；上游浏览器版同样如此，
   界面不会把 `load` 当作连接成功证明。
5. **没有 Electron 独立存储分区。**
   `persist:pocket-chromium` 分区不存在。预览页是普通 iframe，Cookie / storage 属于用户
   H5 自己的源，和用浏览器直接打开一致。面板自己的设置存在**宿主同源** localStorage
   （键仍为 `pocket-h5-v1`）：同一个 DSH 源下持久，换访问端口/域名就带不过去；
   清除该站点数据会清空全部设置（与上游一致）。代理端点字段仍会写进存储，但代理本身不可用。
6. **Electron 菜单 / 单实例锁 / 退出清理：交给宿主。**
   面板不注册菜单、不抢单实例、不接管宿主退出。它能负责的只有自己那部分：
   `resize` / `pocketdisplaychange` / `pocketproxyresult` 等 window 监听器、toast 与
   loading 定时器、`ResizeObserver`，都在卸载时移除/断开。

3. **系统浏览器登录态无法通过浏览器 API 继承；上游的「应用内弹窗登录」也没有了。**
   面板不能读取 Safari/Chrome 的 Cookie（跨应用 + 系统钥匙串加密），也不应该去读。
   内嵌预览用的是 DSH 应用自己的 Chromium 会话：**在预览里登录一次会保留**（含重启 DSH）。
   但上游 Electron 版能让预览里的 `window.open` 在**同一会话的子窗口**里完成登录并把 Cookie
   带回来；DSH 桌面端统一把 `window.open` 交给系统浏览器，回传不了——所以弹窗式登录 /
   第三方 SSO 在预览里无法完成。落地方式：不隐藏限制，而是新增「诊断」入口（§13）把
   「禁止嵌入」「需要登录」「服务访问不到」区分开，并把入口文案写成「在系统浏览器打开」，
   同时保留手机扫码路径。**不静默、不伪装成可用。**

## 9. 手机扫码（新增能力）

> 这一节描述的不是上游能力，而是面板版**新增**的「手机扫码打开当前预览地址」功能；
> 上游工作台只有桌面预览。实现由 `src/client/qr.js` + `vendor/qrcode/` 组成。

**为什么加**：做 H5 真机验收时，最麻烦的一步是把电脑上的预览地址弄到手机上（手输 IP/端口、
或用聊天工具转发）。面板在地址栏右侧加一个二维码按钮，把当前预览地址生成二维码，手机扫一下
即可打开——这是上游 Electron/浏览器版都没有的便利能力。

**为什么必须离线生成**：面板的浏览器模块只能 `require('react')`（DSH web loader 的模块表决定），
不能现场装 npm 包；也不应把用户的 H5 地址发给任何在线二维码服务（隐私 + 内网地址本来也出不去）。
所以把二维码**编码内核**随 bundle 一起打包：二维码完全在本机内存里生成，**预览地址不离开本机**，
只有扫码后的手机才会去访问该地址。

**vendor 的来源与许可**（详见 `vendor/qrcode/PROVENANCE.md`）：

- `node-qrcode` **1.5.4**（作者 Ryan Day，MIT）的矩阵生成内核：`lib/core/*.js` 共 22 个文件，
  以及唯一外部依赖 `dijkstrajs` **1.0.3**（MIT，保留其 `LICENSE.md`）；
- 提取自已安装的 DeepSeek Harness Desktop 运行时（其 `app.asar` 内的 `node_modules/qrcode/`，
  即该应用依赖树里的同一版本），**不是从网络下载**；阶段 3 已核对 22 个 core 文件 + dijkstra.js 与 asar
  逐字节一致，asar 内 `qrcode@1.5.4`、`dijkstrajs@1.0.3` 均为 MIT；
- 只保留 `lib/core`（不含 canvas / PNG / terminal 渲染器、CLI、helper）：渲染成 SVG 由
  `qr.js` 自己按矩阵绘制（1 个模块 = 1 个用户单位，`shape-rendering="crispEdges"`，外加
  4 模块静区），不引入 canvas / pngjs / fs / yargs 等依赖；
- `build-client.mjs` 用一个最小 CJS require 解析器把 23 个模块内联进 `client.js`，
  **不新增运行时依赖、不联网**；`vendor/qrcode/package.json` 仅声明 `"type": "commonjs"` 供 Node 侧
  测试直接 require。

**交互与实现要点**：

- 按钮：`<button type="button" class="icon-button">`，append 到上游 `.address-buttons`（`type=button`
  保证不会触发地址表单提交），沿用上游黑白灰 `.icon-button` 样式；
- 对话框：`<dialog class="qr-dialog">`，append 到 `.pocket-h5-root`；`QR_CSS` 与上游 CSS 一起
  `style.textContent = CSS + QR_CSS` 注入 **shadow 内的 `<style>`**（不碰宿主 `document.head`）；
- 二维码内容取自 `#previewFrame` 当前的 `src`（不是输入框里的半成品）：内置示例 / `dsh-app:` 的 demo
  地址会提示「先打开你的 H5 再生成」；生成后同时显示地址文本与提示；
- 关闭：右上角关闭按钮、点击对话框外遮罩、以及原生 `<dialog>` 的 Escape（`cancel` 默认行为）；
- 清理：`mountQrFeature` 返回 disposeQr，卸载时 `button.remove()` + `dialog.remove()`；不注册任何
  window 监听器/定时器，不发起网络请求；
- 失败隔离：`mountQrFeature` 挂在主面板 effect 里、失败只 console.error（`try/catch`），不影响预览本体。

**为什么提示「改用局域网 IP」**：`127.0.0.1` / `localhost` / `[::1]` 在手机上指的是**手机自己**，
扫出来的地址手机打不开。所以地址是 loopback 时对话框会明确提示：把地址改成电脑的局域网 IP
（例如 `192.168.1.23:5173`），并让 H5 开发服务监听 `0.0.0.0`/局域网地址，而不是只监听本机；
手机与电脑需在同一网络。若 H5 侧只有 http，桌面端（`dsh-app://app` 安全上下文）的跨设备 http
可能被混合内容拦截，此时用浏览器版 GUI 或给 H5 启用 https。

**验证与限制**：`tests/client-smoke.mjs` 覆盖「打包内核与 vendor Node 模块逐位一致、finder pattern、
确定性、长 URL 版本增长、quiet zone、crispEdges、按钮/样式/清理标记」；`docs/verification.md` §11
记录阶段 3 的复验结果。**仍未做视觉验证**：二维码在真实面板里的显示、手机相机实际扫码、不同
`dialog` 实现的差异都需要人工确认；`showModal()` 不可用的降级分支没有定位样式（Chromium 系不会走到，
记为极低风险）。

## 10. 已知限制

这些限制不会「修」，写清楚是为了避免误判为 bug：

- **界面文案仍是上游中文**，没有接入 DSH 的 locale 体系；品牌、帮助弹窗、示例页
  （「留白」）都是上游原样内容。
- **外观层覆盖上游配色**：工作台现在跟随 DSH 主题自动明暗切换（`light-dark()` 令牌），
  但设备外框/状态栏等「被预览的手机」保持中性灰，不参与主题映射。
- **目标 H5 若设置 `X-Frame-Options` / CSP `frame-ancestors`，预览会空白**。
  工具不修改也不绕过响应头；解决办法是在你自己的开发服务里允许被嵌入，
  或先用「在系统浏览器打开」确认 H5 服务本身可访问。面板里的「诊断」会直接把这条原因标出来。
- **登录态不能继承系统浏览器**：预览使用 DSH 应用自己的会话，在预览里登录会保留；
  但 Safari/Chrome 的登录态无法读取，弹窗式 OAuth 也会被系统浏览器接管、回传不到预览。
  需要登录的站点请优先在预览内登录；失败时用「在系统浏览器打开」或手机扫码（详见 §13）。
- **HTTPS/安全上下文宿主页嵌 HTTP 子页会被拦**（混合内容）。分三种情况：
  - 宿主是 `http://127.0.0.1:<port>`（浏览器默认）：可嵌 http/https；
  - 宿主是 `dsh-app://app/`（桌面应用，注册为 `secure`）：`http://127.0.0.1` / `http://localhost`
    属于「潜在可信」的 loopback，可以嵌；而**局域网 IP 的 http 的 H5 会被当混合内容拦截**；
  - 经 HTTPS 反代访问同样会拦 http 子页。
  这类拦截发生在浏览器层，面板无法绕过；请在 H5 开发服务上启用 https，或改用本机 loopback。
- **尺寸**：macOS 桌面版会经 Host 探测真机密度（本机 127.5 CSS px/inch），`100%` 即真机
  物理大小；探测不可用（非 macOS / 无 python3 / 超时 / 多屏无法匹配）时退回 **96 CSS px/英寸**
  估算（约 75% 大小），需用「校准实际尺寸」量一次。校准只匹配物理大小，不提高显示器实际
  像素密度，也不模拟真机色彩、锐度、观看距离。
- **只是外观/布局预览**：沿用桌面浏览器引擎、User-Agent、设备像素比与输入方式，
  不模拟 iOS Safari、软键盘、触摸事件；@3x 只是规格说明。
- **宿主快捷键语义变了**：上游「刷新 H5 · ⌘R」在面板里没有注册；按 ⌘R / Ctrl+R 是
  刷新整个 DSH 页面（宿主行为）。刷新 H5 请用面板内的刷新按钮——注意该按钮的
  `title` 仍来自上游，写着「⌘R」，属上游文案，面板不提供该快捷键。
- **手机扫码需要手机与电脑在同一网络**：二维码只包含预览地址（不包含任何凭据/令牌），
  手机要能访问该地址；loopback 地址（127.0.0.1/localhost/[::1]）在手机上指手机自己，
  对话框会提示改成电脑的局域网 IP，并让 H5 开发服务监听 `0.0.0.0`/局域网地址。
- **预览依赖你自己先启动 H5 开发服务**，面板不会代启；地址输入规则与上游一致
  （纯端口默认 `http://127.0.0.1:<端口>`）。
- **品牌链接已改为不可导航元素**：上游 `<a class="brand" href="/">` 在面板里会把宿主页面导航到
  站点根，构建期已换成 `<div class="brand">`（阶段 2 已在 `client.js` 核对到）。
- **`?url=` 直开参数已去掉**：上游用 `new URLSearchParams(location.search).get('url')` 支持
  「带地址直开」，但面板里的 `location.search` 是**宿主页面**的查询串（宿主 URL 带 `?url=` 会串味），
  构建期已删除该读取；面板初始地址只取 `saved.url`，没有历史地址时加载内置示例。
- **⌘R tooltip、示例页文案、帮助弹窗**都是上游原样内容；移植层没有做文案本地化。

## 11. 构建、安装与打开

### 构建

```sh
cd <本仓库目录>
node build-client.mjs        # ui/ + src/client/ + vendor/qrcode → client.js（自检失败非零退出）
node --check client.js       # 语法检查
node --check index.js        # Host 半语法检查
node tests/host-smoke.mjs    # Host 冒烟：/pocket-h5/demo.html 200 + text/html，未知路径 404，非 GET/HEAD 405
node tests/client-smoke.mjs  # Client 冒烟：__ModuleLoader__ + React stub 实例化 factory、跑 apply、
                             #   逐位校验打包后的二维码内核（无需浏览器）
```

`client.js` 是**生成产物，禁止手改**：改转换规则请改 `build-client.mjs`，改界面请更新 `ui/`，
改面板外壳/扫码改 `src/client/`，升级二维码内核换 `vendor/qrcode/lib/core/`，然后重新构建。
构建应可重复执行且字节级幂等（同一输入产出相同 sha256；构建脚本自带校验，当前输出
`221` 组 CSS 花括号、`51` 个 DOM id、`23` 个 vendor 模块）。
最近一次独立验证结果（命令输出、哈希、证据行号）见 `docs/verification.md`。

### 安装 / 卸载

在 DSH 会话里用插件管理工具安装本目录（即 `install_bundle` 的 target）：

```
plugin_manager install_bundle target=<本仓库目录>
```

按工具返回的提示处理（可能需要刷新/重启 Web GUI 让新 bundle 生效）。卸载用
`plugin_manager remove_bundle`，target 同上。安装后如果侧栏没有图标，先检查：
Loader 里 `pocket-h5` 这一行是否启用、`dsh.client` 与 `exports["./client"]` 是否齐全
（见 §2 的加载链条）。

安装后可以这样核对（也用于排障）：

1. Host 侧：`cordis_inspect_query`（host / `Config` / `listConfigs`，name=`dsh-pocket-h5`）
   应出现 `patchId: pocket-h5` 的 loader row，且 `packageDir` 指向本目录。
2. Host 路由：`curl -i http://127.0.0.1:<端口>/pocket-h5/demo.html` 应返回
   `200`、`text/html; charset=utf-8`、`Cache-Control: no-store`；未知路径 404，非 GET/HEAD 405。
   （未认证 curl 访问 `/plugins/<包名>/client.js` 一律 404 属正常：那是给已认证 GUI 用的
   bundle 路由，无法用它判断插件是否加载。）
3. 显示器探测：`curl -i http://127.0.0.1:<端口>/pocket-h5/display.json` 在 macOS 上应返回
   `200`、`application/json`，body 形如
   `{"ok":true,"platform":"darwin","displays":[{"id":1,"widthMm":301.2,"heightMm":195.6,"pixelWidth":1512,"pixelHeight":982}]}`
   （`pixelWidth×25.4/widthMm` 应在 16–1100 之间，本机为 127.5）。**如果这里 404，
   说明运行中的 Host 还是旧模块**：bundle 更新后必须重启 DSH 进程（仅刷新页面不够），
   重启后 Host 与 Client 才会一起生效。
4. 浏览器侧：刷新 GUI 后侧栏出现「Pocket H5」图标，点击后 main 区渲染面板；
   面板内应能看到上游设置栏与内置示例手机预览，`100%` 的机身宽度应约 71.5mm
   （macOS 探测成功时）。Slots 的实时检查需要 GUI 页面处于连接状态。

### 打开

DSH Web GUI 左侧栏 →「Pocket H5」图标 → 主区域显示面板。首次打开默认加载内置示例
（Host 路由 `/pocket-h5/demo.html`）；此后打开会回到上次预览的地址（存在
`localStorage['pocket-h5-v1']`）。输入框填 `5173` 这类端口或完整 HTTP/HTTPS 地址，
点「打开预览」。

## 12. 维护约定

- `ui/` 是上游快照，**不手工修改**；要升级上游，替换四个文件并重跑构建，然后按
  `docs/verification.md` 的清单回归（它记录的正是构建自检与人工核对项）。
- 所有宿主适配只出现在 `build-client.mjs`；若某个转换规则不再需要，删规则而不是改产物。
- `src/client/panel.js` / `src/client/qr.js` / `src/client/diagnose.js` 是「片段源」而不是 ES 模块：它们被原样插进
  factory 作用域，直接使用 `React`/`h`/`CSS`/`QR_CSS`/`mountPocketH5`/`pocketDemoUrl` 等符号，
  改它们时注意不要加 `import`/`export`。
- `client.js`、`index.js` 由构建/交付流程负责；文档与验证记录只写 `docs/`。
- 面板内新增功能时，优先在「上游已有能力」里找等价分支（上游浏览器版已经做过一遍降级），
  不要另造一套；新增浏览器侧依赖必须像 `vendor/qrcode` 一样内联进 bundle（不能新增 require）。
- 升级 `vendor/qrcode`：从 `app.asar` 的 `node_modules/qrcode` 取新版 `lib/core/`（及其
  dijkstrajs 依赖）替换后跑 `node build-client.mjs && node tests/client-smoke.mjs`；
  `client-smoke` 会逐位对比打包内核与 vendor Node 模块。

## 13. 登录态与嵌入诊断（阶段 5 新增）

### 13.1 为什么不能「继承系统浏览器登录态」

- Safari / Chrome 的 Cookie 属于各自应用，由系统钥匙串加密保存；DSH 插件（页面侧）与
  Host（Node 侧）都没有合法的跨应用读取入口。这样的能力也不应实现：读浏览器凭据库属于
  安全与隐私边界。
- 内嵌预览用的是 **DSH 桌面应用的默认 Chromium 会话**（`~/.dsh/electron-user-data/` 下的
  持久 Cookie 库），所以在预览框里登录一次，之后（包括重启 DSH）一般仍然有效——这是
  「继承登录态」在面板里唯一成立的形态，继承的是 DSH 的会话，不是系统浏览器的。
- 「调用目标计算机上的浏览器」是可行的，而且已经有入口：地址栏右侧按钮在 DSH 桌面端由
  `shell.openExternal` 打开系统默认浏览器（http/https），用的是那边的登录态；面板只是不能
  把那个浏览器的 Cookie 反向喂回 iframe。

### 13.2 上游 Electron 版能做、面板做不到的部分

上游 `main.cjs` 对预览用 webview，并把 `window.open` 交给 Chromium 创建**同一
`persist:pocket-chromium` 会话的子窗口**，因此弹窗式登录能完成并把 Cookie 回传给预览。
面板是宿主页面里的普通 iframe，`window.open` 由 DSH 桌面端的
`setWindowOpenHandler` 统一交给系统浏览器（`shell.openExternal`），没有回传通道；
插件也没有创建应用内窗口的 API。**这是宿主能力差异，不能靠配置修复。**

### 13.3 `GET /pocket-h5/probe.json?url=<绝对 http(s) 地址>`

- 校验：仅 http/https、长度 ≤2048、不允许 URL 内嵌账号密码；不读取用户文件。
- 行为：`fetch(url, { redirect: 'manual' })` 手动跟随最多 5 次跳转，总超时 6 秒；
  **只读响应头，正文立即 cancel**；不发送 Cookie/凭据。返回：
  `{ ok, requestedUrl, finalUrl, status, redirects:[{status,from,to}], framing:{allowed,reason,xFrameOptions,frameAncestors}, login:{detected,redirected,reason} }`。
- 判定：`X-Frame-Options: DENY/SAMEORIGIN` → 禁止（面板跨源）；CSP `frame-ancestors`
  只有包含 `*` 或 `dsh-app:` 才算允许，`'none'`/其他列表 → 禁止；无相关头 → 允许（不代表
  一定渲染，JS 反嵌入仍可能）。登录：跳转链/最终地址命中 login/signin/sso/oauth/authorize/
  passport/cas/auth 等词，或返回 401/403。
- 失败：`{ ok:false, code:'invalid-url'|'invalid-protocol'|'fetch-failed'|'timeout'|'too-many-redirects', message }`
  （HTTP 仍为 200，方便面板展示）。
- 安全边界：该路由由本机回环上的面板调用，作用等同于「由宿主替你 curl 一次目标地址」；
  不写入磁盘、不记录日志、不缓存结果。

### 13.4 面板侧

- 「诊断」按钮（`#diagnoseButton`，插在「示例」旁边）→ 对话框；
  `summarizeProbe(payload)` 是纯函数（`__test` 暴露给冒烟测试），负责把探测结果翻译成
  「标题 + 事实 + 建议」三部分；
- 「在系统浏览器打开」按钮（上游「新窗口打开」改名，`title`/`aria-label` 同步）+
  帮助弹窗新增「需要登录的页面」说明；
- 构建期约束：不新增 `require`、样式只进 Shadow DOM、卸载时移除按钮/对话框。

## 14. 登录桥（阶段 6 新增）

### 14.1 为什么需要它

内嵌 iframe 跑在 DSH 自己的 Chromium 会话里，没有 Safari/Chrome 的登录 Cookie；而浏览器不允许
一个页面读取另一个应用的 Cookie。于是「需要登录才能看」的页面在面板里只能看到登录页或空白。
登录桥把两件事拆开：**读登录态**（本机文件/手动粘贴）和**用登录态**（本机反向代理注入 Cookie），
从而在不改 DSH、不改浏览器安全模型的前提下，让面板里的预览带上登录态。

### 14.2 结构

- `lib/bridge.js`（Host，纯 Node 内置模块）：
  - `parseBinaryCookies(buffer)`：Safari `Cookies.binarycookies` 解析（自动识别真实布局与规范布局，
    校验越界/NUL/UTF-8；expires 从 Cocoa 2001 基准换算为 Unix 秒，0=session）；
  - `readSafariCookies({path})`：只读 Safari Cookie 文件；EACCES/EPERM →
    `{ok:false, code:'safari-permission', message:…完全磁盘访问权限…}`；
  - `filterCookiesForUrl(cookies, url)`：域边界后缀匹配 + path 前缀 + 过期过滤（IP 仅精确匹配）；
  - `mergeCookieHeader(jar, browserCookieHeader)`：jar 优先，浏览器独有名字保留；
  - `createBridge({target, cookies, timeoutMs})`：只绑 `127.0.0.1:0`、只连 target origin；注入 Cookie、
    剥离 `X-Frame-Options`、删除 CSP 的 `frame-ancestors` 指令、改写 `Location`/请求 `origin`/`referer`、
    把上游 `Set-Cookie` 去掉 `Domain`/`SameSite=None` 后转给浏览器并回灌 jar、body 流式透传、
    `upgrade` 用 net/tls 隧道转发 WebSocket（注入 Cookie）、502/504 纯文本、幂等 `close()`、
    live `cookieCount`；无磁盘写入、无日志。
- `index.js` 路由 `prefix /pocket-h5` 内新增 `GET|POST /pocket-h5/bridge.json`：
  - GET 返回 `{ok, active, target, entryUrl, proxyUrl, cookieCount, source, importedAt}`（不含 Cookie 值）；
  - POST `{action:'start'|'refresh'|'stop', target?, cookies?}`：start 默认读 Safari 并过滤，
    传 `cookies` 则用手动 Cookie 头；refresh 重新读 Safari；stop 关闭代理。
  - 单一活动桥、闲置 30 分钟自动关闭；插件卸载 disposer 里关闭。
- `src/client/bridge.js`：「登录桥」按钮 + 对话框（来源、状态、手动粘贴 Cookie 折叠区）+ 顶部
  「登录桥已启用」状态条 + 「恢复直连」；启用时设置 `window.pocketBridge = {target, entryUrl}`，
  `navigate()` 对目标地址改加载代理地址（构建期 patch），二维码/诊断/桥接本身都用
  `pocketPreviewTarget()` 还原成原始目标。
- 生命周期：面板卸载时停止桥接；`Cookie` 只在 Host 进程内存。

### 14.3 安全与隐私

- 代理只监听回环、只代理启动时指定的 origin（非开放代理）；Cookie 值不写盘、不打印、不出现在
  bridge.json 状态里。
- 读取 Safari Cookie 需要用户在「系统设置 → 隐私与安全性 → 完全磁盘访问权限」给 DSH 授权并重启；
  未授权时返回明确错误并提供「手动粘贴 Cookie」路径。
- 手动 Cookie 只存在内存，停止/闲置即清空。

### 14.4 已知限制

- 只对 Cookie 认证有效；Bearer/localStorage 登录态不会自动带入。
- 只代理 target origin：页面里写死指向其它域名（CDN/API）的绝对地址不经过代理，这些请求没有登录态。
- 面板预览的 origin 变成 `http://127.0.0.1:<代理端口>`：依赖精确 origin/referer 校验的页面需验证；
  代理已改写请求 origin/referer 与响应 Location 以尽量兼容。
- 代理剥离 `X-Frame-Options`/`frame-ancestors` 是为了「能在面板里看」，不代表目标站愿意被嵌入；
  仅用于本机自测。

## 15. 外观层：FlowPilot 风格重排 + 黑暗模式（阶段 7 新增）

### 15.1 目标

上游工作台是「整页表单」的排版（11–12.5px 密排、每节一条描边、没有顶栏），放进 1000px 宽的面板里
显得拥挤；用户要求按 FlowPilot 的设计语言重排，并且界面要有黑暗模式。

### 15.2 做法（不重写业务逻辑）

- **DOM 重排**（`src/client/theme.js` 的 `mountPanelTheme`）：在上游 DOM 已挂载、app.js 已完成
  事件绑定之后，创建 `<header class="ph-topbar">` 作为 `.workspace` 的第一个 grid 子项，
  把 `.brand` / `.brand-sub` / `.preview-meta` / `#loadStatus` / `#refreshButton` / `#externalButton`
  移动进去；`#previewName`、示例、二维码、诊断、登录桥按钮随 `.preview-meta` 一起在顶栏。
  **所有 id 与监听器不变**；卸载时只移除 header。
- **布局**：`.workspace.ph-workspace` → `grid-template-columns: 300px 1fr; grid-template-rows: 48px 1fr`；
  左栏是「一区一卡」的卡片栈（每张 surface 卡片 12px 圆角 + 极轻阴影，卡片之间用 8px 间距分隔，
  没有任何横向分割线；折叠项是卡内 `--p-surface-2` 下沉小面板），右栏是画布卡片（1px 边界 + 点阵底）。
  侧栏页脚（帮助/开发者工具/引擎信息/自动保存/重置/说明）由 `mountPanelTheme` 收进一张独立卡片。
- **视觉令牌**：`.pocket-h5-root` 定义 `--p-surface / --p-surface-2 / --p-surface-3 / --p-hover /
  --p-border / --p-text / --p-brand / --p-mask / --p-shadow-*`，全部**成对**写成
  `light-dark(浅色, 深色)`，并把上游 `--surface / --ink / --line / ...` 映射到这些令牌，
  让上游大量使用变量的规则自动获得暗色。
- **暗色来源**：不读 JS 主题服务、不做开关；`light-dark()` 跟随元素继承的 `color-scheme`，
  DSH 的 theme presenter 本来就会在 `<html>` 上设置它，Shadow DOM 内继承即可自动切换。
  构建期已移除此前 `:host { color-scheme: light }` 的强制浅色。
- **覆盖范围**：侧栏卡片/控件/开关/分段/滑杆、卡内折叠面板、画布点阵、对话框/帮助/toast、
  二维码/诊断/登录桥对话框细节色、滚动条、窄窗口断点（1080/860px）。
- **去横线**：分区之间不画 `border`/`::before` 分隔线，全部靠「卡片面层 + 间距」区分；
  卡内折叠项用下沉面层而不是虚线。

### 15.3 设备边框素材（用户提供的 iPhone 外框）

上游用 CSS 手绘手机外框（渐变边框 + 侧键 + 圆角屏幕）。现在改成用户提供的一张 iPhone 外框图片：

- 素材：`src/client/assets/bezel.webp`（62 KiB，1318×2717）。原始图 1318×2718、屏幕开口为
  1206×2622 的浅色区域（正好 402×874 @3x）；`tools/prepare-bezel.py` 把开口（含灵动岛）抠成透明、
  裁到外框 bbox、压成 WebP，并在 `bezel.json` 记录像素/逻辑几何（逻辑 = 像素 ÷ 3）。
- 几何：portrait 外框 439.333×905.667 逻辑 px，屏幕开口在 (18.667, 16.0)，右下留边 18.667/15.667；
  圆角取图片开口半径 270 px ÷ 3 = 90。landscape 是同一张图旋转 -90° 后的几何。
- 构建期做了两处 app.js 机械替换：
  1. `device` 的 `bodyWidthMm/bodyHeightMm` 由边框比例换算（72.777 / 150.032 mm，保证屏幕仍是
     402×874 逻辑 px、66.6×144.8 mm 真机屏幕尺寸）；
  2. `resizeDevice` 里原来「上下左右等边距」的 `padding` 改成按 `POCKET_BEZEL.portrait/landscape`
     的屏幕开口几何逐边定位（图片上下留边不对称）。
- 外观层：`.phone` 只保留布局盒，`::before` 画边框素材（横屏时 `rotate(-90deg)`），
  `.side-key` 隐藏；`.screen` 的圆角改为素材开口半径、去掉上游手绘的 5/6px 描边环。
- 素材只由 `tools/prepare-bezel.py` 生成，构建脚本会校验屏幕开口必须是 402×874 并把图片内联进
  `client.js`（不额外发请求）。

### 15.4 边框改为「盖板」+ iOS 标准控件（阶段 9 补充）

- **圆角由边框素材裁切，页面保持矩形**：`.screen` 的 `border-radius` 改为 `0`，边框图片的 `::before`
  叠在 `.screen` **上方**（`z-index: 5`）。页面四角被素材里不透明的内框/圆角盖住，
  不再用 CSS 圆角去拟合 squircle（原先两者不匹配，四角会露出白色或吃掉边框）。
- **iOS 状态栏**：状态栏 62pt 高、内容垂直居中、时间左内边距 54 / 右侧图标组右内边距 26；
  时间 17pt/600/等宽数字；信号 18×12（4 根圆角柱）、Wi‑Fi 17×12（3 段弧 + 点）、
  电池 27×13（25 体内宽 21 + 2 尖端，百分比在体内）。构建期替换了 `ui/index.html` 的状态栏标记，
  保留 `#batteryFill`/`#batteryText` 供 app.js 写入。
- **底部手势条**：134×5、圆角 2.5、距底 8pt（横屏 180×5、距底 7pt）。
- app.js 的电池填充宽度由 `24 * level` 改为 `21 * level`（iOS 电池体内宽）。

### 15.5 边框剪影裁切（阶段 11 补充）

矩形页面放在圆角外框下时，页面矩形的**包围盒四角会伸出手机外轮廓**（外框圆角比屏幕开口的
包围盒更靠内），表现为左上/右上角露白。修法：

- 从边框素材的 alpha 生成**机身剪影** `bezel-mask.webp`（把屏幕开口填实），旋转 90° 得到横屏版；
- `.phone` 用 `mask-image` + `mask-size: 100% 100%` 把整棵子树（页面 + 边框）裁到剪影内；
  页面仍是矩形，但只在手机外轮廓内可见，四角由外框圆角自然裁切；
- 投影从边框伪元素移到 `.device-slot` 的 `filter: drop-shadow(...)`，否则会被剪影裁掉；
- 剪影两张合计约 2.5 KiB，构建期内联。

### 15.6 顶栏重排（阶段 12 补充）

截图里的顶栏有两个问题：`.brand` 从 `.sidebar-brand` 移出后失去了 `display:flex`，里面的
`.brand-mark`（`display:grid`，块级）把名称挤到下一行；「H5 预览」副标签也混在品牌和网址之间。

- `.ph-brand .brand` 强制 `display:flex; flex-direction:row; nowrap`，图标 + 名称同一行；
- 隐藏多余副标签 `.brand-sub`；
- 头部改成「品牌 → spacer → 右组」：右组 `.ph-right` 内依次放 `.preview-meta`（网址 +
  示例/登录桥/诊断按钮）与 `.ph-actions`（状态胶囊 + 刷新/在系统浏览器打开），
  `margin-left:auto` 保证整组贴着右边界；
- 窄窗口断点：1180/1080/920px 依次收缩网址宽度，920px 以下隐藏网址只留状态与动作。

### 15.7 说明文字收进 ? 提示（阶段 10 补充）

原则：*Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.*

- 隐藏 `.settings-section .setting-hint` 与 `.sidebar-note`（静态说明、校准提示、布局提示、模拟器说明）；
- 每个分区标题/折叠项摘要旁加一个 15px 圆形 `?`（`.ph-help`，`cursor: help`）；
  hover / focus 出现 `.ph-tip` 浮层，点击可固定，Esc / 滚动 / 失焦关闭；
- 浮层内容 = 固定说明 +（可选）实时状态：`data-tip-from="#calibrationStatus"`、`#layoutHint`；
- 8 个提示点：预览地址、显示与尺寸、模拟设备、系统外观、页面布局、SOCKS5、校准、页脚（外观保存/说明）；
- 放在 `<summary>` 内的 `?` 会 `preventDefault + stopPropagation`，不会触发展开/收起；
- 工具提示用 `position: fixed` 渲染，避免被侧栏滚动容器裁切。

### 15.6 已知限制 / 注意

- 设备外框、屏幕边框、状态栏、灵动岛、手势条**不参与**主题映射（保持中性灰/用户设置色），
  这样黑暗模式下手机依然是「手机」而不是一块深色矩形。
- `light-dark()` 需要宿主设置 `color-scheme`；在 DSH 之外的浏览器页面打开时默认浅色。
- 顶栏动作在 `≤860px` 时隐藏「当前页面」区（只保留品牌 + 状态 + 动作），避免挤压。
- 外观层只改样式与节点位置；`ui/` 快照仍与上游逐字节一致，app.js 的两处几何替换在构建期完成。
- 设备外框图片比 iPhone 17 官方机身略厚：`显示约` 会显示约 72.8×150.0 mm（屏幕仍严格对应
  402×874 逻辑 px / 66.6×144.8 mm 真机屏幕）；如果想让机身数字对齐官方规格，需要换一张更薄的
  外框图，或改 `device` 的毫米数（会让屏幕物理尺寸略小于真机）。
