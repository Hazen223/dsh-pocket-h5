# Pocket H5 面板：独立验证记录

> 验证者：reviewer（独立于实现者）。验证对象：本仓库工作副本。
> 时间：2026-11-12 11:41–11:50（Asia/Shanghai）。环境：macOS，`node v22.23.1`，无浏览器控制权。
> 方法：命令级运行 + 静态代码核对 + 与 DSH 运行时契约（app.asar 内实现、profile 侧已安装包）
> 逐项对照 + 对运行中的 Host 做只读 HTTP 探测。**未修改任何实现文件**；只写了 `docs/` 下文档。

## 0. 结论摘要

| 项目 | 结论 |
| --- | --- |
| `node --check client.js` / `node --check index.js` | 通过（exit 0） |
| `node build-client.mjs` 幂等性 | **幂等**：连续两次构建，`client.js` 的 sha256 不变（65719 字节） |
| 构建内置自检 | 通过（51 个 app.js DOM id 全存在、`node --check` 通过）；但缺 移植规格 要求的「CSS 花括号配对」检查（见 R3） |
| `node tests/host-smoke.mjs` | **10/10 通过** |
| 独立补充 Host 探针（本轮新写） | **18/18 通过**（含响应体与 `ui/demo.html` 逐字节一致、安全问题面） |
| 运行中的 Host 实测（127.0.0.1:65383） | **Host 半已生效**：`GET /pocket-h5/demo.html` 200、`text/html`，响应体 sha256 与 `ui/demo.html` 相同；别名 200；未知 404；POST 405；HEAD 无 body |
| `client.js` 静态核对（任务清单 7 项 + 补充 49 项） | **56/56 通过**（见 §3） |
| `docs/adaptation.md` 映射逐条对照 | 12 行**全部有实现**；发现 12 处文档与代码不一致/缺失，已修正文档（见 §4、§9） |
| `ui/` 原样性 | 与上游原目录四个文件 **sha256 逐一相同** |
| 渲染/交互视觉验证 | **未做**（无浏览器控制；client Slots inspect 两次均 10s 超时），见 §6 |
| 总体 | **代码与 Host 半验证通过；浏览器内渲染与交互未验证**。另有 2 个低危待修项（R1、R2）与若干风险记录（§7）。 |

> 上表是阶段 2 的快照。阶段 3（手机扫码 + R1/R2/R3/R5 修复）见 §11，阶段 4
> （Host 侧显示器物理尺寸探测）见 §12；两节也更新了 R1–R9 的状态。

## 1. 命令级验证

### 1.1 语法检查

```sh
$ node --check client.js   # exit 0
$ node --check index.js    # exit 0
$ node --check build-client.mjs  # exit 0
```

### 1.2 构建与幂等性

构建前 `sha256(client.js) = 24abac3ba8788966a98becf230336cb5766e104d83958607626ab4a04ee53f3b`；
连续运行两次：

```sh
$ node build-client.mjs
[build] ✓ app.js 引用的 51 个 DOM id 全部存在于标记中
[build] ✓ node --check client.js
[build] client.js 已生成：65719 字节 · 标记 64 个 id · CSS 1013 行 · app.js 301 行
$ node build-client.mjs        # 第二次输出完全相同
$ shasum -a 256 client.js      # 仍是 24abac3b…（两次构建 + 构建前相同）
```

结论：**构建可重复、字节级幂等**，没有时间戳/随机量；`client.js` 65,719 字节、1,604 行。

### 1.3 Host 冒烟测试（项目自带）

```sh
$ node tests/host-smoke.mjs
ok - apply registers one prefix route at /pocket-h5
ok - apply returns a disposer
ok - GET /pocket-h5/demo.html -> 200 text/html
ok - GET /pocket-h5/demo alias -> 200
ok - GET /pocket-h5/nope -> 404
ok - POST /pocket-h5/demo.html -> 405
ok - HEAD /pocket-h5/demo.html -> 200 with empty body
ok - encoded traversal is rejected
ok - malformed percent-encoding -> 400
ok - disposer removes the registered route
all host smoke checks passed
```

### 1.4 独立补充 Host 探针（本轮新写，不依赖项目测试）

用假 ctx 捕获 `apply` 注册的路由并直接调用 handler，另加 18 项断言：全部通过。关键结果：

- `GET /pocket-h5/demo.html` → 200，`text/html; charset=utf-8`，`Cache-Control: no-store`，
  `Content-Length=8758`，**响应体与 `ui/demo.html` 用 `Buffer.compare` 比较完全相等**；
  响应头**没有** `Content-Security-Policy` / `X-Frame-Options`（不会自己阻止 iframe 嵌入）。
- 带 query（`?from=panel`）、别名 `/pocket-h5/demo` 均 200；`GET /pocket-h5`、
  `/pocket-h5/demo.html/extra`、`/pocket-h5/assets/app.js`、`/pocket-h5//demo.html` 均 404。
- `DELETE`/`PUT`/`OPTIONS` → 405 且 `Allow: GET, HEAD`；`HEAD` 200 且无 body；`HEAD` 未知路径 404。
- 百分号编码：`/%64emo.html` 解码后 200；`%252e%252e`、`%2e%2e` → 404；
  `..%2fdemo.html`、`%00demo.html` → 400；`/pocket-h5/a\b` → 404（URL 解析把 `\` 归一为 `/`）。
- 返回值：`apply` 返回 disposer，disposer 后路由确实注销。

### 1.5 运行中的 Host 实测（只读 HTTP）

对当前 DSH 进程的 Host（`http://127.0.0.1:65383`）直接探测：

```text
GET /pocket-h5/demo.html            -> 200, text/html; charset=utf-8, Content-Length: 8758,
                                       Cache-Control: no-store, X-Content-Type-Options: nosniff
GET /pocket-h5/demo                 -> 200 text/html
GET /pocket-h5/nope                 -> 404
POST /pocket-h5/demo.html           -> 405
HEAD /pocket-h5/demo.html           -> 200, 无 body
```

并把返回体保存后比对：`sha256(返回体) = a02ea379…315531`，与 `ui/demo.html` **完全相同**。
这证明：**Host 半已安装并在这个进程里注册了路由，demo 页可被同源 iframe 直接加载**。

旁证（不是结论依据）：`/` 返回 401（浏览器访问需宿主授权），未认证 `curl /plugins/<任意包名>/client.js`
对 `dsh-flowpilot`、`dsh-plugin-magi`、`dsh-bili-scroll`、`dsh-pocket-h5` **一律 404**，
说明该 bundle 路由无法用未认证请求探测，不能用它判断客户端是否加载。

## 2. 安装状态（旁证，不做安装操作）

未执行安装/卸载，只做只读观察：

- `~/.dsh/profiles/desktop/package.json` 的 `dependencies` 含
  `"dsh-pocket-h5": "link:<本仓库目录>"`，
  `dsh.profile.bundles` 列表含 `dsh-pocket-h5`；
- `~/.dsh/profiles/desktop/node_modules/dsh-pocket-h5` 是指向本目录的符号链接；
- `cordis_inspect_query`（host / Config / listConfigs，name=`dsh-pocket-h5`）返回
  `{ id: "include:pocket-h5", patchId: "pocket-h5", name: "dsh-pocket-h5",
     packageDir: "…/profiles/desktop/node_modules/dsh-pocket-h5", status: "absent" }`。
  `status: "absent"` 表示该条目没有 Config schema（对照：已工作的 `dsh-plugin-magi` 同样 absent），
  **不是**「未安装」；`patchId=pocket-h5` 与 移植规格 的 loader row id 一致。

## 3. `client.js` 静态核对

任务清单要求的 7 项逐条 + 补充检查，共 56 项，全部通过（独立脚本从 `client.js` 中提取
`CSS`/`MARKUP` 常量、重新统计 id、重算 CSS 花括号，不复用构建脚本的自检结论）：

| # | 检查项 | 结果 | 证据 |
| --- | --- | --- | --- |
| 1 | `window.__ModuleLoader__.load` 的 id 与包名一致 | ✅ | `client.js:5-6` `id: "dsh-pocket-h5"`；`package.json:2` `name: "dsh-pocket-h5"` |
| 2 | CSS 里存在 `:host` 且作用域正确 | ✅ | `client.js:17,38,984,989,1003` 共 5 处（`:root`→`:host` 含 3 个媒体查询）；`:host{display:block;height:100%;…}` 在 38 行；另有 `color-scheme: light`（18 行） |
| 3 | 无 `new URL('/demo.html', location.href)` 依赖 | ✅ | grep 该字面量 = 0；4 处已换成 `DEMO_URL`（`client.js:1186,1228,1353,1463`）；demo 地址由 `pocketDemoUrl()` 用 `window.location.origin` 构造（1497-1503） |
| 4 | 无 `<use href` 残留 | ✅ | `grep -c '<use' client.js` = 0；`<symbol>` 已展开（上游 11 个 symbol，展开后 markup 无 `<symbol`） |
| 5 | 无 `@deepseek-ai/` 的 require/import | ✅ | `grep -c '@deepseek-ai/' client.js` = 0；唯一 require 是 `require("react")`（`client.js:8`） |
| 6 | 未向 `document.head` 注入样式 | ✅ | `grep -c 'document.head' client.js` = 0；样式 `<style>` 只 `shadow.append(style, root)`（`client.js:1516-1522`） |
| 7 | `apply` 只有 `main` + `sidebar.panellist` 两处 `ctx.slots.inject` | ✅ | `ctx.slots.inject(` 恰好 2 处（`client.js:1580,1585`）；`ctx.slots.register(` 恰好 2 处（1581,1586）；返回 `{ inject: ["slots"], apply }`（`client.js:1599-1603`） |
| 8 | 卸载路径移除 window 监听器/定时器/ResizeObserver | ✅（有 1 处缺口，见 R1） | `disposePocketH5`（1467-1478）遍历 `listeners` 调 `realWindow.removeEventListener`；`clearTimeout(toastTimer)`、`clearTimeout(loadingTimer)`、`pendingProxy.timer`、`canvasObserver.disconnect()` |

补充检查（全部通过）：

- **CSS**：花括号配对（`final=0,min=0`）；无 `:root` 残留；无 `100vh/100dvh`；无 `position: fixed`；
  无 `webview` 规则；`.pocket-h5-root` 容器规则存在；上游关键选择器保留
  （`.workspace/.sidebar/.toast/.dynamic-island/.calibration-ruler/@media (max-width:760px)`）。
- **标记**：无 `<script>`、无 `<a class="brand"`、品牌已改 `<div class="brand"`（`client.js:1030`）、
  无 icon-library 元素、含 `iframe#previewFrame`（1130）、无 webview 元素、64 个 id 无重复。
- **id 覆盖**：从 `mountPocketH5` 函数体中重新抽出 `$('id')` 引用 = **51 个**，全部存在于标记。
- **app.js 转换**：Electron 桥创建 webview 的代码已删；`pocketDesktop.reload` 已删；
  `document.createElement` 仅剩 `realDocument.createElement`（`client.js:1232`，ShadowRoot 无 createElement）；
  `ResizeObserver` 拆为 `const canvasObserver`（1458-1459）。
- **面板外壳**：`attachShadow({mode:'open'})`（1512）；`shadow.replaceChildren()`（1514）；
  `PocketH5Panel` 卸载执行 dispose（1516-1531 区段）；侧栏图标 24×24、`stroke="currentColor"`、
  复用上游 `i-phone` 图形（1546-1568）。
- **代理降级**：标记与运行时代码都改成面板版文案（1057、1386）；
  但表单下方第二条提示仍是上游原文（1058，见 R2）。
- **无其它全局副作用**：`grep document.body` / `documentElement` / `activeElement` / `shortcuts` 均为 0。

## 4. `docs/adaptation.md` 映射逐条对照

### 4.1 移植规格 的 12 行映射（左：移植规格 行；右：代码落点与结论）

| 上游 Electron 接口 | 代码落点（证据行号） | 结论 |
| --- | --- | --- |
| 本地 http server 提供服务 | Client：`PocketH5Panel`/`mountPocketH5`（`client.js:1146,1506`）；Host：`index.js:114-119` 注册 `{kind:'prefix',path:'/pocket-h5'}`，handler 只放行 demo（`index.js:51-107`） | ✅ 一致（文档原先写成只注册 `/pocket-h5/demo.html`，已修正；实际还含别名 `/pocket-h5/demo`） |
| `pocket:metrics` | `displayScale()`（`client.js:1255-1257`）：`window.pocketDisplayMetrics` 恒 `undefined` → 回退 `browser:${screen.width}x${screen.height}@${dpr}` + 96 ppi；校准逻辑原样（`calibrations` key 同） | ✅ 一致 |
| `pocket:proxy` | Electron 块已删（`build-client.mjs:182-191`）→ `window.pocketProxyAvailable` 永不置 true → `proxySupported()` false（`client.js:1382`）→ 表单禁用 + 文案（1057、1383-1387）；代理降级文案在标记与 JS 两处都替换 | ✅ 一致（残留 2 处小问题：R2、R4） |
| `pocket:devtools` | `#devToolsButton` 标记带 `hidden`（`client.js:1119`），Electron 块删除后无代码取消 hidden | ✅ 一致 |
| `pocket:reload` | 刷新按钮回调只剩浏览器分支 `navigate(currentUrl, false)`（`client.js:1351`） | ✅ 一致（文档原说「else 分支」，实际是整行替换成单分支） |
| `pocket:navigation` | `$('previewFrame').addEventListener('load', …)`（`client.js:1347`）；`navigationMessage` 只在被删的 Electron 块里赋值 → 恒空 | ✅ 一致 |
| `pocket:refresh`（菜单 ⌘R） | 无任何快捷键注册（`grep shortcuts` = 0）；刷新走面板按钮 | ✅ 一致 |
| `pocket:display` | `window.addEventListener('resize', resizeDevice)`（1380）+ `ResizeObserver(resizeDevice).observe($('canvas'))`（1458-1459） | ✅ 一致 |
| `localStorage('pocket-h5-v1')` | `storageKey='pocket-h5-v1'`（1169）、读取（1171）、`persist()`（1192-1194） | ✅ 一致 |
| webview + `persist:pocket-chromium` | `<iframe id="previewFrame">` 原样保留（1130）；webview 创建代码已删（grep webview=0） | ✅ 一致 |
| 桌面菜单/单实例/退出 | 面板无相关代码；生命周期交给 DSH Loader；面板只清理自己的监听器/定时器/observer（1467-1478） | ✅ 一致 |
| （移植规格 面板组件约束） | `useRef` 挂 div：`height:100%; flex:1 1 auto; minHeight:0`（`client.js:1538-1542`）；不写 head、不操作宿主 DOM；只 `require('react')` | ✅ 一致（图标接收 `{size,active}` 但只用 size，见 R6） |

### 4.2 对照中发现并修正的文档不一致（共 12 处，均已在 `docs/adaptation.md` 修正）

| # | 文档原文 | 实际代码 | 处理 |
| --- | --- | --- | --- |
| D1 | 「品牌链接 `href="/"` 指向宿主根」 | 构建期已改 `<div class="brand">`（`build-client.mjs:113-117`；`client.js:1030`），不会导航宿主 | 文档已改（Lead 也指出过这条） |
| D2 | Host「注册 `/pocket-h5/demo.html`」 | 注册 prefix `/pocket-h5`，只放行 `demo.html` 与别名 `demo` | 文档已改 |
| D3 | CSS 转换清单缺 `.fallback-dialog[open]`、`color-scheme: light`、icon-library 移除 | `build-client.mjs:143,151-154,106-107`；生成 CSS 无 `position:fixed` | 文档已补 |
| D4 | JS 转换清单缺 `document.createElement→realDocument.createElement`、刷新行简化 | `build-client.mjs:197-199,211-213`；`client.js:1232,1351` | 文档已补 |
| D5 | 自检含「CSS 花括号配对」 | 构建脚本**没有**该检查（只查 `:host` 数量、无 fixed、`.pocket-h5-root`、id、use、node --check） | 文档改为「尚未内置，由独立验证核对」；记为 R3 |
| D6 | `fallback-dialog` 仍为 `position:fixed` | 同样被改成 `absolute`（`build-client.mjs:151-154`） | 文档已改 |
| D7 | 混合内容限制只写了 HTTPS 场景 | 桌面 `dsh-app://app`（registered `secure`）：loopback http 可嵌，局域网 http 会被拦 | 文档已补三种场景 |
| D8 | `DEMO_URL = location.origin + …` 未说明桌面 origin | 桌面为 `dsh-app://app/`（`secure` 自定义协议），非 `/`、`/index.html`、`/assets/*` 的请求由 `forwardWebRequest` 转发到 Host | 文档已补 |
| D9 | 未写图标 `active` 未消费 | `PocketH5Glyph` 只读 `size`（`client.js:1546-1568`） | 文档已补 |
| D10 | 代理降级未提第二条上游提示 | `client.js:1058` 仍是「仅作用于 Pocket；本机地址直连…」 | 文档已补并记为 R2 |
| D11 | 「选择器本身零改动」 | `:root`/`body` 两处边界选择器被改写 | 文档改为「除这两处外零改动」 |
| D12 | §7 行 1「预期实现位置」只写 demo.html 路由 | 实际 prefix 路由 + 别名 | 文档已按实现重写 |

> 说明：以上修改只发生在 `docs/`，未触碰 `ui/`、`src/`、`build-client.mjs`、`client.js`、`index.js`、
> `package.json` 等实现文件。

## 5. 上游原样性

与上游项目目录（Pocket · H5 预览工作台）
逐文件比对 sha256：

```text
IDENTICAL index.html   (02f412c3…)
IDENTICAL styles.css   (dc8eaca0…)
IDENTICAL app.js       (4bbe8716…)
IDENTICAL demo.html    (a02ea379…)
```

上游 `package.json` 版本 `pocket-h5@1.2.0`，与 `ui/PROVENANCE.md` 记载一致。
即「原样复用上游文件、只在构建期适配」的说法成立。

## 6. 未验证项（重要，不要当成已验证）

1. **渲染与交互完全没有视觉验证。** 无浏览器控制；`cordis_inspect_query`（client / Slots /
   listSubTree，root=`main`、`sidebar.panellist`）两次均在 10s 超时——GUI 页面当前没有向
   inspect 提供响应。因此以下都未确认：
   - 侧栏是否出现「Pocket H5」图标、顺序/标签是否正确；
   - 点击图标后 `main` 区是否切到面板、`layout.selectPanel('pocket-h5')` 是否命中；
   - Shadow DOM 内的上游界面是否完整渲染（尺寸、滚动、手机画布居中、toast/dialog 位置）；
   - 面板卸载后是否有可见残留或控制台异常（R1 的 rAF 竞态是否实际触发）。
2. **桌面 `dsh-app://app` 路径未做运行时验证。** 只核对了代码契约（协议注册、转发函数、
   `pocketDemoUrl` 用 `location.origin`）；真实 Electron 窗口里 iframe 是否加载
   `dsh-app://app/pocket-h5/demo.html`、以及混合内容行为，未实测。
3. **未认证 curl 无法探测客户端 bundle 路由**（所有插件的 `/plugins/*` 都 404），
   因此「client.js 是否真的被 GUI 下载并 `__ModuleLoader__.load`」只有静态与契约证据，
   没有运行时证据。
4. **代理禁用态的视觉**：表单应全部 `disabled`、按钮不可点、两条提示的矛盾观感（R2）未看。
5. **尺寸校准的真实物理精度**（96 ppi 估算 + 尺子校准）、**`X-Frame-Options`/`frame-ancestors`
   空白页面**、**HTTPS/混合内容拦截**、**新窗口打开**等浏览器行为未实测。
6. **Host 冒烟以外**：真实 Host 上只验证了 GET/HEAD/POST/404/405 与响应体；未验证
   `ctx.effect` 在真实 Loader reload 时的注销/重注册行为（代码契约正确，未运行时验证）。

## 7. 缺陷与风险（只报给 Lead，未修实现；阶段 2 快照）

> R1–R5 的后续状态见 §11.3 与 §12.6（R1/R2/R3/R5 已修）。

| # | 严重度 | 问题 | 证据 | 建议 |
| --- | --- | --- | --- | --- |
| R1 | 低 | `render()` 里的 `requestAnimationFrame(resizeDevice)` 未跟踪；`dispose` 不 `cancelAnimationFrame`。卸载竞态下回调会在已移除的 shadow 上执行 `getComputedStyle(null)` → 控制台 TypeError | `client.js:1338`（rAF）、`1467-1478`（dispose 只清 listeners/timers/observer） | 构建期包装 rAF 记录 id 并在 dispose 里 cancel（或 `render` 用变量保存 rAF） |
| R2 | 低 | 代理表单第二条提示仍是上游原文「仅作用于 Pocket；本机地址直连。账号密码不保存到磁盘。」，与上一条「面板版不支持应用内代理」矛盾，用户会误以为代理可用 | `client.js:1058`；构建只替换了「需要 macOS 14+ 独立应用」（`build-client.mjs:119-121,201-203`） | 构建期一并替换该行文案（或删除），并在 `docs` 降级说明里保持同步 |
| R3 | 低 | 移植规格 要求构建自检包含「CSS 花括号配对」，`build-client.mjs` 未实现；`docs/adaptation.md` 曾声称有 | `build-client.mjs:169-171,233-242,314`（无花括号检查） | 补一个简单的 `{}` 计数检查（本轮独立验证已确认当前 CSS 是配对的） |
| R4 | 信息 | `sendProxyRequest` 内仍保留 `if (window.pocketDesktop) … else window.webkit.messageHandlers…` 死分支 | `client.js:1389` 前置 `if (!proxySupported()) return;`，`1395-1398` 不可达 | 可在构建期清掉，纯代码卫生，无运行时风险 |
| R5 | 低 | `?url=` 直开逻辑读 `location.search`，在面板里拿到的是**宿主页面**查询串；宿主 URL 带 `?url=` 会改变面板首帧地址 | `client.js:1462` | 构建期去掉该读取（或只保留 `saved.url`）；当前已当已知行为写入文档 |
| R6 | 信息 | 侧栏图标接收 `{size, active}` 但未消费 `active`；选中态依赖宿主 `currentColor` 继承 | `client.js:1546-1568` | 如需自绘选中态再消费 `active`；不影响功能 |
| R7 | 信息 | 面板高度依赖宿主 `main` 槽容器提供确定高度（宿主 `centerCol` 是 flex 列容器，静态成立） | `app.asar` 内 `.centerCol{display:flex;flex-direction:column;min-height:0;overflow:hidden}`；`client.js:1538-1542` | 安装后在 GUI 里目视确认面板是否撑满 |
| R8 | 信息 | `.icon-library` 规则残留在 CSS（元素已删） | `client.js:78` | 无害死规则，可不管 |

## 8. 与运行时契约的核对（结论的依据）

为避免只看「代码自洽」，把实现依赖的宿主 API 与运行中的 DSH 对了一遍：

- **Slot API**：`@deepseek-ai/dsh-client-ui-slots` 的 `register(options, component)`（`lib/index.js:64`）：
  keyed 必须给 `key`，list 必须给 `id`；`main` 在运行时被声明为
  `{kind:"keyed", scope:"root"}`，`sidebar.panellist` 是 list（从运行中 app.asar 的布局/侧栏代码读取）。
  运行中的侧栏用 `renderSlot("sidebar.panellist", { size, active }, { only: id })` 渲染图标；
  官方内置面板的真实写法是 `ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({name,id,order,label}, Icon))`、
  `main` 用 `{name:"main", key:id}` —— 与我们的注册形状一致。
- **`ctx.slots.inject(name, cb)`**：在 slot 声明生命周期内注册，cb 返回 disposer；与运行中插件写法一致。
- **cordis**：对象插件 `{ inject: ["slots"], apply }` 合法（`README.md:50`、`lib/types/registry.d.ts`）；
  `ctx.effect(execute, label)` 签名（`@deepseek-ai/cordis/lib/index.js:1168`）与 `index.js:116-119` 用法一致。
- **webServer**：`register(route: WebRoute)`，`kind` 为 `exact|prefix`，prefix 匹配 `p` 与 `p/…`
  （`@deepseek-ai/dsh-host-webserver/lib/index.js:53-66,193-200`；运行中 Service 目录也是同一签名），
  `index.js` 的 `{kind:'prefix',path:'/pocket-h5'}` 用法正确。
- **dsh-app 协议**：运行中桌面端把 `dsh-app` 注册为 `{standard:true,secure:true,supportFetchAPI:true,…}`；
  `/`、`/index.html`、`/assets/*` 由本地 dist 提供，其余 `dsh-app://app/*` 由
  `forwardWebRequest(request, auth.url, auth.cookie, auth.token)` 转发到 Host（要求渲染进程头 +
  origin `dsh-app://app`）。所以 `pocketDemoUrl()` 在桌面端得到 `dsh-app://app/pocket-h5/demo.html`，
  会落到 `index.js` 的 demo 路由；响应头原样保留（无 CSP/frame-ancestors，不会自阻 iframe）。
- **构建产物加载链**：`package.json` 有 `dsh.client.platform="web"` 与 `exports["./client"]="./client.js"`
  （`package.json:28-35,11-17`）；`dsh-client-modules` 按这个链条下发 bundle（`lib/index.js:250-291`）；
  factory id = 包名，两者一致（本轮已核对）。

## 9. 复验指引（下次回归跑这些）

```sh
cd <本仓库目录>
node --check client.js && node --check index.js
node build-client.mjs && shasum -a 256 client.js     # 阶段 4 期望 d9365d07…（改 ui/、src/、vendor 或构建规则后才会变）
node tests/host-smoke.mjs                            # 阶段 4 为 13 项 ok
node tests/client-smoke.mjs                          # 阶段 4 为 48 项 ok
# 运行中的 Host（端口以 GUI URL 为准；bundle 更新后必须重启 DSH 进程）：
curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' http://127.0.0.1:<port>/pocket-h5/demo.html
curl -sS http://127.0.0.1:<port>/pocket-h5/display.json    # 旧模块会 404；新模块 200 JSON
# 浏览器：刷新 GUI → 侧栏「Pocket H5」→ 面板；若 client Slots inspect 可用，确认
#   main 的 key "pocket-h5" 与 sidebar.panellist 的 id "pocket-h5" 占用者
```

静态复核用的独立脚本（当时写在 `/tmp/verify-pocket.mjs`、`/tmp/verify-host.mjs`、
`/tmp/verify-stage3.mjs`、`/tmp/verify-stage4.mjs`，未随包交付）；与本包强相关的断言已在上文给出，
可照表重写。

## 10. 最终结论（阶段 2 快照）

- **构建、语法、幂等性、Host 路由**：验证通过；Host 半在运行中的 DSH 进程里**确实生效**
  （demo 路由 200 且内容与 `ui/demo.html` 完全一致）。
- **client.js 静态质量**：任务要求的检查点全部满足，隔离（Shadow DOM）、作用域（`:host`）、
  降级（代理/devtools/导航）、清理路径（listeners/timers/observer）都有对应实现；
  另有 2 个低危待修项 R1/R2、1 个构建自检缺口 R3，以及 3 条信息级风险（R4-R6）
  ——R1/R2/R3/R5 已在阶段 3 修复，见 §11.3。
- **未验证**：浏览器内的渲染与交互、桌面 `dsh-app://` 实际加载、客户端 bundle 的运行时下发。
  按 移植规格 的验收口径，这部分应明确标注为「无浏览器控制 → 渲染未做视觉验证」，
  需要在安装后的 GUI 里做一次人工目视/点击确认。

## 11. 阶段 3 复验（手机扫码新增能力 + R1/R2/R3/R5 修复）

> 时间：2026-11-12 11:51–11:56。快照：`client.js` 164,055 字节，
> sha256 `6c7f9f19a9e837838cd10915ebf783aa2433c1037b8154e7faab33e58217ed9b`
> （**已被阶段 4 的 d9365d07… 取代**，以下为当时的验证记录）。

### 11.1 命令与结果

```sh
node build-client.mjs   # 连跑两次，字节一致：
# ✓ styles.css 花括号配对（221 组）   ✓ app.js 51 个 DOM id 全部存在
# ✓ vendor/qrcode 打包 23 个模块      ✓ node --check client.js
# client.js 已生成：164055 字节 · 标记 64 个 id · CSS 1013 行 · app.js 301 行
node --check client.js && node --check index.js       # 均 exit 0
node tests/host-smoke.mjs                             # 10/10 ok（当时版本）
node tests/client-smoke.mjs                           # 38/38 ok（实际输出条数，见 §11.4）
```

### 11.2 二维码打包与来源（独立核对）

- `client.js` 内 `QR_MODULE_FACTORIES` 共 **23** 个工厂：`vendor/qrcode/lib/core/*.js` 22 个
  + `node_modules/dijkstrajs/dijkstra`；与 `vendor` 文件一一对应（独立计数）。
- 内核入口：`qrLoad("lib/core/qrcode").create(text, { errorCorrectionLevel: "M" })`；
  渲染由 `src/client/qr.js` 的 `qrSvgMarkup()` 完成（1 模块 = 1 用户单位、4 模块静区、
  `shape-rendering="crispEdges"`）。
- **与运行中 DSH 的 asar 逐字节对比**（独立脚本解析 app.asar header 后抽取）：
  `node_modules/qrcode/lib/core/*.js` **22/22 sha256 相同**；`dijkstrajs/dijkstra.js` 相同；
  `dijkstrajs/LICENSE.md` 相同；asar 内 `qrcode@1.5.4`（MIT）、`dijkstrajs@1.0.3`（MIT），
  与 `vendor/qrcode/PROVENANCE.md` 的记载一致；只保留了 core（未打包 canvas/pngjs/fs/yargs
  渲染器与 CLI）。
- 运行时依赖：`client.js` 中非相对 `require` 只有 `react` 与 `dijkstrajs`（后者由内置
  `qrRequireFrom` 解析到打包模块，不是新外部依赖）。
- 独立 QR 行为探针 22/22：用 `__ModuleLoader__` + React stub 实例化 factory 后，对
  `127.0.0.1` / 局域网 IP / 长 URL / https 四种地址，矩阵与 `vendor` Node 模块**逐位一致**；
  size 合法（21+4k）、SVG viewBox=size+8、静区/`crispEdges`/fill 正确、确定性、长 URL 版本增长、
  dark 模块数与 SVG 路径数一致、apply 注册回归。
- 静态核对：`QR_CSS` 使用次数 = 2（声明 + `style.textContent = CSS + QR_CSS`），只进 shadow 的
  `<style>`；`document.head` = 0；QR 片段只用 `shadow.*` + `createElement` + `pocketDemoUrl()`，
  不新增 window 监听器/localStorage/fetch/window.open；按钮 `type=button`；关闭路径含关闭按钮、
  点遮罩、原生 `<dialog>` Escape；卸载 `button.remove()` + `dialog.remove()`。
  独立脚本 59/60，唯一失败即 **R9**（见下表）。

### 11.3 R1–R11 状态（阶段 3 时点）

| # | 状态 | 证据 |
| --- | --- | --- |
| R1 rAF 未清理 | **已修** | `client.js` 有 `let pocketAnimationFrame = 0`、`pocketAnimationFrame = requestAnimationFrame(resizeDevice)`、dispose 里 `cancelAnimationFrame(pocketAnimationFrame)`；client-smoke 有断言 |
| R2 代理第二条提示 | **已修** | `client.js:1058` 已是「面板版不会修改系统或浏览器代理；示例与预览请求沿用宿主网络设置。」；旧文案 grep = 0；构建脚本替换两处 |
| R3 缺 CSS 花括号自检 | **已修** | `build-client.mjs` 新增 `{`/`}` 计数检查，构建输出「✓ styles.css 花括号配对（221 组）」；独立重算 final=0 |
| R4 不可达 Electron 分支 | 未变（信息级） | `client.js` 仍有 `window.pocketDesktop` 2 处，均在 `proxySupported()` / `sendProxyRequest()` 的不可达分支 |
| R5 `?url=` 读宿主查询串 | **已修** | `client.js` 无 `new URLSearchParams(location.search)`；`const requested = saved.url;` |
| R6 图标未消费 active | 未变（信息级） | 图标组件仍只读 `size` |
| R7 高度依赖宿主槽容器 | 未变（静态成立，未视觉验证） | 见 §6/§12 未验证项 |
| R8 `.icon-library` 死规则 | 未变（信息级） | 生成 CSS 仍保留该规则，元素已删 |
| **R9 新发现（许可）** | **未修** | `vendor/qrcode/` 没有 node-qrcode 的许可全文文件；asar 内 `node_modules/qrcode/license`（1076B，MIT 全文）存在而 vendor 未保留。PROVENANCE 只写了包名/版本/许可，MIT 要求随再分发保留版权与许可声明。建议把 asar 的 `license` 复制为 `vendor/qrcode/LICENSE`（dijkstrajs 的 `LICENSE.md` 已保留） |
| **R10 新发现（信息）** | — | QR 对话框 `showModal()` 不可用时的降级分支只设 `open` 属性，没有绝对定位样式（上游 help dialog 有 `.fallback-dialog`）；Chromium/Electron 不会走到 |
| **R11 新发现（文档）** | — | `README.md` 第 18 行仍写「index.js 注册 /pocket-h5/demo.html」（实际是 prefix `/pocket-h5` + 别名），第 59-60 行的构建自检清单未包含花括号/vendor/QR 检查；README 不在本验证者的写权限内，仅报告 |

### 11.4 与 Lead 报告不一致之处

- `tests/client-smoke.mjs` 实际输出 **38** 条 `ok -`（不是 Lead 所说的 43 项）；全部通过。
  可能是计数口径不同（源码里含条件分支/内联断言）。本条只作记录，不影响功能。

## 12. 阶段 4 复验（Host 侧显示器物理尺寸探测）

> 时间：2026-11-12 12:00–12:03。快照：`client.js` **168,272 字节**，
> sha256 `d9365d0759204aad184d3745f314757fc45aa699c46f3bf095c4ccdd6992d7e4`
> （本机连跑两次 `node build-client.mjs` 均得到同一哈希）。

### 12.1 命令与结果

```sh
$ node build-client.mjs                      # 两次
[build] ✓ styles.css 花括号配对（221 组）
[build] ✓ app.js 引用的 51 个 DOM id 全部存在于标记中
[build] ✓ vendor/qrcode 打包 23 个模块
[build] ✓ node --check client.js
[build] client.js 已生成：168272 字节 · 标记 64 个 id · CSS 1013 行 · app.js 301 行
$ node --check client.js && node --check index.js    # 均 exit 0
$ node tests/host-smoke.mjs                          # 13/13 ok
$ node tests/client-smoke.mjs                        # 48/48 ok
```

**测试项数与 Lead 报告不一致**：Lead 说 host-smoke「11→14 项」、client-smoke「共 51 项」；
实际输出的 `ok -` 行数为 **13** 与 **48**（全部通过）。拆解：host-smoke = 阶段 3 的 10 项
+ display GET（内含 ppi 合理性）/HEAD/POST 3 项 = 13；client-smoke = 阶段 3 的 38 项
+ display 暴露 2 项 + `pickHostDisplay` 6 项 + ppi 换算/边界 2 项 = 48。
建议 Lead 核对计数口径（不影响功能）。

### 12.2 Host 半：真实探测输出（假 ctx 直接调用 handler）

在本机（macOS，Darwin）直接执行 `index.js` 的 handler，得到**真实** CoreGraphics 数据：

```json
{"ok":true,"platform":"darwin","displays":[{"id":1,"widthMm":301.2141,"heightMm":195.6298,"pixelWidth":1512,"pixelHeight":982}]}
```

- `pixelWidth×25.4/widthMm = 127.500` CSS px/inch——与 Lead 所说的 127.50 一致；
  也解释了用户反馈的「预览偏小」：旧逻辑用 96 ppi，96/127.5 ≈ **75.3%**。
- 响应：`200`、`application/json; charset=utf-8`、`no-store`、`nosniff`、`Content-Length` 正确。
- 冷启动探测 ~70–92ms（一次 python 进程），30s 缓存命中 ~1ms，body 相同。
- `HEAD /pocket-h5/display.json` → 200、无 body、仍带 `Content-Length`；
  `POST`/`PUT`/`DELETE`/`OPTIONS` → 405 + `Allow: GET, HEAD`。
- 非 macOS 语义：在测试进程里临时把 `process.platform` 改为 `linux` 后请求，
  返回 `{"ok":false,"platform":"linux","displays":[]}`（200）。
- 隐私/安全：body 只含 `id/widthMm/heightMm/pixelWidth/pixelHeight` 与 `ok/platform`，
  不含用户名/窗口/主机名/路径/token；探测脚本是**常量**，`execFile('/usr/bin/python3',
  ['-c', DISPLAY_PROBE])` 不接受任何请求输入；4s 超时；python 缺失/失败时 `catch` 置空并
  缓存 30s（静默降级），不抛错、不写文件。
- 既有路由回归：`demo.html` 仍 200 且响应体与 `ui/demo.html` 逐字节一致（sha `a02ea379…`）；
  别名 200；未知路径 404；非演示路径 POST 405；`%64isplay.json` 命中；`display.json%00` 400。

### 12.3 Client 半：匹配/换算/桥接（真实打包产物）

用 `__ModuleLoader__` + React stub 实例化 `client.js` 后核对其 `__test` 与静态契约：

- `pickHostDisplay`（6 种情况全对）：CSS 尺寸精确命中当前屏 / 命中第二块屏 /
  多屏都不匹配 → `null` / 只有一块屏回退用它 / 空数组与 `null` → `null` / 非法几何被过滤。
- `hostCssPixelsPerInch`：本机面板数据 → **127.5000**；非法几何 → `null`；
  边界 16 与 1100 接受、15.9 与 1100.1 拒绝（与上游 `displayScale()` 的 16–1100 校验一致）。
- 桥接：`fetch('/pocket-h5/display.json', {cache:'no-store'})` → 填
  `window.pocketDisplayMetrics = { displayKey: 'host:1:1512x982', cssPixelsPerInch: 127.5 }`
  → `window.dispatchEvent(new Event('pocketdisplaychange'))`；上游 `displayScale()` 原样读取
  `metrics?.displayKey` / `metrics?.cssPixelsPerInch`，取不到才回退 `96`（`client.js:3789-3793`，
  上游 app.js 未被改动）。
- `watchHostDisplayMetrics`：进面板先取一次；监听 `window resize` 去抖 **250ms** 重取；
  卸载时 `clearTimeout` + `removeEventListener`；`PocketH5Panel` 的 effect 返回路径调用
  `disposeDisplay()`（`client.js:4271` 定义 watch、`4321` 挂载、`4339` 卸载清理）。
- 依赖/隔离回归：非相对 require 仍只有 `react`+`dijkstrajs`；QR 23 模块仍在；
  `document.head` = 0；`:host`=5；`style.textContent = CSS + QR_CSS`；vendor/QUIET/crispEdges 不变。
- 构建自检新增 display 接入断言（`build-client.mjs` 检查 `panelSource` 含
  `applyHostDisplayMetrics`）。

### 12.4 真实尺寸数学（独立复算）

- `logicalPixelsPerMm = 460/3/25.4 = 6.0367`；机身 CSS 宽 `71.5mm × 6.0367 = 431.62 px`。
- 127.5 ppi 时 `actualSizeScale = 3×127.5/460 = 0.831521`；渲染宽
  `431.62×0.831521 = 358.91 CSS px`；在 127.5 ppi 屏上物理宽
  `358.91/127.5×25.4 = 71.50 mm` ✅（与 iPhone 17 机身 71.5mm 相同）。
- 旧 96 ppi 逻辑在同一真实屏上：`431.62×(3×96/460) = 270.2 CSS px` →
  `270.2/127.5×25.4 = 53.84 mm` = **71.5mm 的 75.3%**，与用户「偏小」反馈吻合。

### 12.5 「运行中的 Host 需重启」实测证据

本机当前 DSH 进程启动于 **11:56:45**，而 `index.js` 修改于 **11:59**、`client.js` 于 **12:00**
（进程比模块旧）。运行中的 Host（本次 GUI 端口 `127.0.0.1:55357`；旧端口 65383 已不可连接）实测：

```text
GET /pocket-h5/demo.html          -> 200 text/html            （旧模块的既有路由）
GET /pocket-h5/display.json       -> 404 text/plain            （旧模块没有该路由）
POST /pocket-h5/display.json      -> 405                        （旧模块的方法守卫先返回）
```

即：**Host 仍在跑旧模块**，与 Lead 的 `plugin_manager` 返回 `restart-required / module-comparison`
一致；重启 DSH 进程后新路由才会生效（仅刷新页面不够）。
（该结论用「进程启动时间早于文件 mtime」+「新路由 404 / 旧路由 200」独立佐证，未依赖
plugin_manager 的返回。）

### 12.6 阶段 4 后的 R1–R9 状态

- R1、R2、R3、R5：仍为**已修**状态（本轮回归重新确认：`cancelAnimationFrame`、新代理提示、
  build 花括号自检、无 `location.search` 读取）。
- R4、R6、R7、R8：未变（信息级/未视觉验证）。
- **R9（vendor/qrcode 许可全文缺失）仍未修**（本轮再次确认 vendor 根没有 license 文件）。
- **新增 R12（低，逻辑边界）**：`applyHostDisplayMetrics()` 失败/匹配不到时直接 `return false`，
  不会清空上一次成功设置的 `window.pocketDisplayMetrics`。如果面板先在一块屏探测成功、随后
  移到另一块屏且新探测失败，上游 `displayScale()` 会继续用**上一块屏的 displayKey/ppi**（可能偏大
  或偏小，且校准 key 也是旧的）。建议失败时清空/标记 stale（或只在 displayKey 变化时保留）。
- **新增 R13（低，事件边界）**：重取只挂在 `window resize` 上；两块屏**布局尺寸相同**时移动窗口
  可能不触发 resize，因此不会立即重取（重开面板或手动 resize 可刷新）。Lead 的「跨显示器
  移动/resize 会重新探测」在多数情况下成立，但不是所有跨屏移动都必然触发。
- **新增 R14（信息，历史校准）**：Host 探测生效后 `displayScale()` 的 key 变为 `host:<id>:<w>x<h>`；
  用户此前在阶段 2 用 `browser:...` key 存的手动校准不会自动套用到新 key（无害——Host 值通常更准，
  需要手动纠偏时在 host key 下重新量一次即可）。

### 12.7 未验证项（阶段 4）

1. **重启后的真实渲染与 100% 目视**：本会话无法重启桌面进程/无浏览器控制，未看到面板里
   机身是否真的约 71.5mm（数学与探测数据已核对，渲染未验证）。
2. **Client 在 `dsh-app://app` 下 fetch `/pocket-h5/display.json` 的真实链路**：代码路径与
   桌面协议转发实现已核对（asar），但未在重启后的桌面窗口里实测。
3. **二维码**：视觉显示与真实手机扫码互通仍未验证（阶段 3 遗留）。
4. 未认证 curl 无法探测 `/plugins/*`（所有插件都 404），因此「GUI 是否已加载新 client bundle」
   也没有运行时证据；需要重启 + 刷新后人工确认。

---

## 13. 阶段 5（登录/嵌入诊断与入口措辞）

> 时间：2026-11-12 20:29–20:45（Asia/Shanghai）。触发：用户反馈「有些页面需要登录才能用，
> 内置浏览器能否调用目标机器浏览器或继承登录态？」

### 13.1 结论（先回答问题）

- **继承系统浏览器登录态：不可行**。Safari/Chrome 的 Cookie 属于各自应用、由系统钥匙串加密，
  DSH 页面侧与 Host（Node）都没有合法读取入口；这属于浏览器安全边界，未实现、也不建议实现。
- **调用系统浏览器：已有能力**。地址栏右侧按钮在 DSH 桌面端由 `shell.openExternal`
  打开系统默认浏览器（`lib/main.js` 中 `openExternal` 白名单 http/https/mailto，
  `setWindowOpenHandler` 统一转交），登录态在系统浏览器那边；但页面不在手机框里。
- **内嵌预览的登录态属于 DSH 应用自己的持久 Chromium 会话**
  （`~/.dsh/electron-user-data/` 下有持久 Cookie 库），在预览里登录一次后一般会保留；
  失败通常是三种原因：站点禁止 iframe 嵌入、登录被重定向/401、弹窗式 OAuth 被系统浏览器接管
  （上游 Electron 版能用同会话子窗口回传 Cookie，面板没有创建窗口的 API）。
- 因此本轮交付的不是「继承」，而是**把原因诊断清楚 + 把已有入口命名准确**。

### 13.2 实现

- Host `index.js`：新增 `PROBE_PATH = '/pocket-h5/probe.json'`、`looksLikeLogin()`、
  `assessFraming()`、`probeUrl()`。手动跟随 ≤5 次跳转、总超时 6s，只读响应头并 cancel 正文，
  不发送 Cookie/凭据；返回 framing（X-Frame-Options / CSP frame-ancestors 判定）与
  login（跳转链命中登录词或 401/403）。非法 scheme/URL → `{ok:false, code}`。
- Client `src/client/diagnose.js`（factory 片段）：`summarizeProbe()` 纯函数把探测结果翻译成
  「标题 + 事实 + 建议」；`mountDiagnoseFeature()` 在「示例」旁插入「诊断」按钮 + 对话框，
  卸载时移除；样式只进面板 Shadow DOM。
- 构建期（`build-client.mjs`）：上游「在新窗口打开 H5」→「在系统浏览器打开 H5（使用系统浏览器登录态）」
  （title/aria-label 同步）；帮助弹窗插入「需要登录的页面」说明；`__test.summarizeProbe` 暴露给测试。
- 文档：README 增加「登录态与嵌入」小节；`docs/adaptation.md` 增加 §7 映射行、§8 降级第 3 条、
  §10 限制与 §13 完整说明。

### 13.3 验证（可复现）

```text
node build-client.mjs          # 两次运行字节一致，client.js 168272 → 179319 B
shasum -a 256 client.js        # 6ffa35eb63756c86a6267e9fb626122ac90329aee4af34f584cb6043abdcd125
node --check client.js         # ok
node --check index.js          # ok
node tests/host-smoke.mjs      # 21/21 ok（新增 8 项 probe：plain/DENY/CSP none/登录跳转/401/404/非法 scheme/不可达）
node tests/client-smoke.mjs    # 62/62 ok（新增 14 项：summarizeProbe 10 + 产物静态断言 4）
```

真实地址探测（假 ctx 直接调 handler，实际发起请求）：

```text
https://example.com/   => ok:true status:200 framing:true  login:false
https://github.com/    => ok:true status:200 framing:false reason:X-Frame-Options: DENY
http://127.0.0.1:1/    => ok:false code:fetch-failed message:无法从 DSH 宿主机访问该地址
```

### 13.4 重启证据（运行中的 Host 仍是旧模块）

修改 `index.js` 后、重启前对当前 GUI（`http://127.0.0.1:49208`）做了只读探测：

```text
GET /pocket-h5/display.json  => 200   （阶段 4 的代码，已在上一轮重启后生效）
GET /pocket-h5/probe.json    => 404   （阶段 5 新路由，运行中的 Host 未加载）
```

→ 与 `plugin_manager` 的 `restart-required / module-comparison` 一致：Host 模块不热重载，
需要**完全退出并重开 DSH**；`client.js` 侧刷新 GUI 即可，但 Host 新路由必须重启。

### 13.5 未验证项（阶段 5）

1. 诊断对话框的实际渲染与交互（按钮位置、遮罩、关闭）——无浏览器控制，未做视觉验证。
2. 重启后桌面 `dsh-app://app` 下 `fetch('/pocket-h5/probe.json')` 的真实链路与面板内结果渲染。
3. 真实内网站点（X-Frame-Options / SSO 登录）的探测结果与用户侧观感。
4. 手机扫码与「在系统浏览器打开」在桌面端的实际行为（上一轮遗留）。

---

## 14. 阶段 6（登录桥：Safari Cookie + 本机反向代理）

> 时间：2026-11-12 20:29–21:10（Asia/Shanghai）。触发：用户要求「继承 Safari/Chrome 已登录状态，
> 在这个 App 里预览」。用户选择「方案 A（本机代理）+ Safari 自动导入」。

### 14.1 结论

- 浏览器没有跨应用读取登录态的 API；Safari Cookie 库受 TCC 保护（本机 DSH 进程读它返回
  `Operation not permitted`）。因此实现为：**从本机 Cookie 文件（或手动粘贴）取 Cookie，
  Host 起本机反向代理注入 Cookie，面板 iframe 走代理**——不改 DSH、不改浏览器安全模型。
- 自动导入需要用户给 DSH 授「完全磁盘访问权限」并重启；未授权时返回可操作错误，并提供
  「手动粘贴 Cookie」兜底（无需任何权限）。

### 14.2 实现与测试

```text
lib/bridge.js           946 行，纯 node 内置；无磁盘写入、无 console 日志
src/client/bridge.js    登录桥按钮/对话框/状态条/恢复直连；pocketPreviewTarget 统一目标解析
index.js                GET|POST /pocket-h5/bridge.json（start/refresh/stop，单一活动桥，30min 闲置回收）
build-client.mjs        navigate() 桥感知（目标地址照记，实际加载 entryUrl）；bundle 注入 bridge 片段
```

```text
node tests/bridge-unit.mjs   # 27/27 ok
node tests/host-smoke.mjs    # 30/30 ok（新增 9 项 bridge：状态/启动/注入/XFO 剥离/Set-Cookie 改写/
                             #   jar 回灌/重定向改写/停止/端口关闭/Safari 权限错误）
node tests/client-smoke.mjs  # 77/77 ok（新增 15 项：bridgeBannerText/bridgeCanTarget + 产物静态断言）
node build-client.mjs        # 幂等通过；client.js 196586 B，sha256 632b4447…48b4e（dirty dev 构建）
```

真实 Safari 读取（本机当前未授权 FDA）：

```text
{"ok":false,"code":"safari-permission","message":"没有权限读取 Safari Cookie 文件（EPERM）。需要在
「系统设置 → 隐私与安全性 → 完全磁盘访问权限」里给 DSH 授权后重启 DSH。"}
```

### 14.3 登录桥行为证据（host-smoke 实跑）

- 手动 Cookie 启动：`cookieCount=2`，`proxyUrl` 为 `http://127.0.0.1:<随机端口>`；
- 经代理请求 `/bridge-echo`：上游收到 `sid=abc`（注入成功），响应里 `X-Frame-Options` 被剥离、
  CSP 不含 `frame-ancestors`；
- `/bridge-set` 的 `Set-Cookie: token=xyz; Path=/; HttpOnly; SameSite=None; Secure` → 代理响应去掉
  `Domain`/`SameSite=None`，保留 HttpOnly/Secure/Path；随后 `/bridge-next` 由 jar 回灌 `token=xyz`；
- `/bridge-redirect` 的绝对 `Location` 改写成代理 origin；
- `POST {action:'stop'}` 后代理端口拒绝连接；
- WebSocket `upgrade` 隧道注入 Cookie（bridge-unit 用例）。

### 14.4 重启证据（运行中的 Host 仍是旧模块）

```text
GET /pocket-h5/display.json  => 200
GET /pocket-h5/probe.json    => 200
GET /pocket-h5/bridge.json   => 404   （阶段 6 新路由，运行中的 Host 未加载）
```

→ Host 代码变更不热重载：需**完全退出并重开 DSH**；client.js 刷新 GUI 即可。
建议顺序：先给 DSH 授「完全磁盘访问权限」，再退出/重开 DSH（一次完成授权生效 + 新 Host 加载）。

### 14.5 未验证项（阶段 6）

1. 登录桥对话框/状态条的实际渲染与交互（无浏览器控制）。
2. 授权 FDA 并重启后，`readSafariCookies()` 在真实 Host 进程里的读取结果（本机当前是 EPERM）。
3. 真实目标站点（Cookie 认证、含 X-Frame-Options/SSO）的端到端登录预览。
4. 页面内绝对跨域地址、WebSocket HMR 在真实 Vite/H5 项目中的表现（单测覆盖隧道，真实站点未验证）。
5. 手动粘贴 Cookie 的真实浏览器复制流程（DevTools/Copy as cURL）。
