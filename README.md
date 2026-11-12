# Pocket H5 · DSH 面板

把独立的 **Pocket · H5 预览工作台**（上游 Electron / 浏览器版）复用为 DeepSeek Harness Web UI 里的一个
插件面板：左侧栏「Pocket H5」入口 + 主面板里的整套工作台（iPhone 17 尺寸、状态栏/灵动岛/安全区、
横竖屏、画布缩放与真机物理尺寸校准），并补了两个上游没有的入口：**手机扫码**（把当前预览地址
生成二维码，真机扫一下就能打开）和**预览诊断**（页面打不开时，直接告诉你「站点禁止被嵌入」还是
「被跳转到登录页」，以及登录态为什么不能照搬系统浏览器）。

- 上游来源与版本：`ui/PROVENANCE.md`（`index.html` 144 行 / `styles.css` 1000 行 / `app.js` 323 行 / `demo.html` 原样快照）
- 复用与宿主适配说明：`docs/adaptation.md`
- 独立验证记录：`docs/verification.md`

## 结构

```
dsh-pocket-h5/
├── package.json          # bundle 清单：dsh.bundle.patch + dsh.client
├── cordis.patch.yml      # 插入 loader 行 id=pocket-h5
├── index.js              # Host 半：ctx.webServer 注册 /pocket-h5/demo.html 与 /pocket-h5/display.json
├── client.js             # 构建产物（面板 React + 上游界面/逻辑），勿手改
├── build-client.mjs      # 构建器：把 ui/ 快照机械适配成 client.js
├── src/client/panel.js   # 面板外壳：Shadow DOM 挂载 + 槽位注册 + 侧栏图标 + Host 显示器尺寸回填
├── src/client/qr.js      # 新增能力：地址栏二维码按钮 + 手机扫码对话框
├── src/client/diagnose.js # 新增能力：「诊断」按钮 + 嵌入/登录原因诊断对话框
├── ui/                   # 上游原样快照（复用源，不手改）
├── vendor/qrcode/        # 离线二维码编码器（node-qrcode 1.5.4 内核，MIT；PROVENANCE.md + LICENSE）
├── locale/{zh,en}.json   # 插件管理页显示的名称与描述
├── icon.svg              # 插件图标（复用上游手机图形）
├── tests/host-smoke.mjs  # Host 路由冒烟测试（21 项：demo/display/probe + 方法/HEAD/穿越边界）
├── tests/client-smoke.mjs # 客户端 bundle 冒烟测试（62 项：factory/槽位/二维码/尺寸匹配/诊断摘要）
└── docs/                 # 复用/适配说明 + 验证记录
```

## 工作方式

- **面板**：`main` keyed slot（key `pocket-h5`）+ `sidebar.panellist`（id `pocket-h5`，order 95）。
  面板组件把上游 `styles.css` 与 `index.html` 标记装进面板内的 **Shadow DOM**（样式与宿主隔离），
  再运行由 `ui/app.js` 机械转换出的 `mountPocketH5()`。
- **预览**：仍是 `<iframe id="previewFrame">`，输入端口 / `localhost:3000/path` / 完整 HTTP(S) 地址即可。
- **内置示例**：`ui/demo.html` 由 Host 半通过同源路由 `/pocket-h5/demo.html` 提供。
- **持久化**：外观、最近地址、显示器校准仍写在 `localStorage('pocket-h5-v1')`（宿主同源）。
- **预览诊断（新增）**：预览地址旁的「诊断」按钮。Host 半请求目标地址（只读响应头、不跟随无限跳转、
  6 秒超时），面板直接给出结论：`X-Frame-Options` / CSP `frame-ancestors` 是否禁止嵌入、是否被重定向到
  登录页（或 401/403）、服务是否根本访问不到，并给出下一步建议。
- **手机扫码（新增）**：地址栏右侧「二维码」按钮。二维码在本地生成（不联网、不把地址发给任何服务），
  地址若是 `127.0.0.1` / `localhost` 会提示改成电脑的局域网 IP；H5 开发服务需监听 `0.0.0.0`/局域网地址。
- **真机尺寸（新增，Host 适配）**：上游 Electron 版用原生辅助程序读显示器毫米尺寸，浏览器页面读不到。
  面板的 Host 半因此在 macOS 上通过 CoreGraphics 探测当前显示器（`/pocket-h5/display.json`），
  Client 把它填进上游已有的 `window.pocketDisplayMetrics` 桥 → `100%` 就是真机物理大小，无需校准。
  非 macOS 或探测失败时退回浏览器估算（96 CSS px/英寸）+ 工作台自带尺子校准。

### 与上游 Electron 外壳的差异（能力降级，详见 docs/adaptation.md）

| 能力 | 面板版 |
| --- | --- |
| 应用内 SOCKS5 代理（Electron session proxy） | **不可用**：保留分区但禁用；iframe 请求沿用宿主浏览器网络设置，不静默回退 |
| 原生显示器毫米度量 | 适配为 Host 侧 CoreGraphics 探测（macOS）+ Client 填上游 `pocketDisplayMetrics` 桥；其它平台退回 `screen` 估算 + 尺子校准 |
| 开发者工具 | 不可用，按钮保持隐藏 |
| webview 导航事件 / 独立存储分区 | 退化为 iframe `load` 事件与宿主同源 Cookie |
| 独立窗口、菜单快捷键、单实例锁 | 由宿主负责；面板卸载时清理监听器/定时器/观察器 |

## 构建

无依赖，需要 Node.js（与 Harness 相同版本即可）：

```sh
node build-client.mjs
```

构建会读 `ui/` 快照与 `vendor/qrcode/`，做可审查的宿主适配转换（规则逐条写在 `build-client.mjs`
文件头），随后自检：`$('id')` 引用齐全、无 `<use>`、`:host` 转换数量、CSS 花括号配对、
23 个二维码模块已打包、`node --check client.js`。

验证命令：

```sh
node tests/host-smoke.mjs     # 21 项：demo/display/probe 路由、方法、HEAD、穿越与编码边界、登录/嵌入判定
node tests/client-smoke.mjs   # 62 项：loader/factory、两处槽位、二维码内核与 vendor 逐位一致、显示器匹配、诊断摘要
```

## 安装 / 打开

从 GitHub 安装（其他机器）：

```text
plugin_manager install_bundle target=github:Hazen223/dsh-pocket-h5
```

本地开发时安装本目录（`install_bundle` 的 target 传目录路径）；已在作者机器的 `desktop` profile 安装。
更新 `client.js` 后：

```sh
node build-client.mjs      # 重新生成 client.js
```

然后刷新 GUI（⌘R）让浏览器侧重新加载插件模块（修改 `client.js` 刷新即可；修改 **Host 半 `index.js`**
需要重启 DSH 进程——运行中的 Host 不会热重载，`plugin_manager` 会返回 `restart-required`）。

打开方式：左侧栏点击 **Pocket H5**；输入 H5 开发服务地址，点击「打开预览」。

## 登录态与嵌入（为什么不直接继承系统浏览器登录态）

- **预览用的是 DSH 应用自己的 Chromium 会话**（持久 Cookie 库在 `~/.dsh/electron-user-data/`）：
  在预览里登录一次，之后（含重启 DSH）一般仍在。
- **不能读取 Safari / Chrome 的登录态**：Cookie 属于各自应用、由系统钥匙串加密，插件/宿主没有合法的
  跨应用读取入口；这是浏览器安全边界，本插件也不做。
- **「在系统浏览器打开」**：地址栏右侧按钮实际由 DSH 桌面端 `shell.openExternal` 交给系统默认浏览器，
  用的是系统浏览器的登录态——但页面不在手机框里，只用于验证站点/完成登录。
- **上游 Electron 版 vs 面板**：上游能创建同会话子窗口处理弹窗登录并把 Cookie 回传给预览；DSH 桌面端
  会把 `window.open` 交给系统浏览器，因此「弹窗式登录 / 第三方 SSO」在预览里无法完成。需要这类登录时，
  用系统浏览器或手机扫码；或者在 H5 开发侧放开 `frame-ancestors` 并改成不依赖弹窗的登录。
- 不确定原因时，点面板里的「诊断」：它会区分「站点禁止嵌入」「被跳转到登录页」「服务访问不到」。

## 已知限制

- 面板界面沿用上游中文文案，未接入 DSH locale；工作台保留自身黑白灰浅色视觉，不随宿主深浅色切换。
- 目标 H5 若设置 `X-Frame-Options` / CSP `frame-ancestors` 会空白（与上游一致，工具不绕过站点限制）。
- 桌面端页面 origin 是 `dsh-app://app`（安全上下文），预览非 loopback 的 `http://` 地址可能被浏览器按
  混合内容拦截；`127.0.0.1` / `localhost` 不受影响（被视为可信来源）。跨设备请在 H5 侧用 HTTPS，或在浏览器版
  GUI（`http://127.0.0.1:...`）中使用。
- **尺寸校准**：macOS 上面板会通过 Host 读取显示器物理尺寸，`100%` 默认就是真机大小
  （这是上游 Electron 版的能力，浏览器页面自身读不到）。只有非 macOS 或 Host 探测失败时才需要
  「显示与尺寸 → 校准实际尺寸」量一次 200px 线段；手动校准优先于系统估算，点「恢复系统估计」可回到自动值。
  若尺寸仍偏小，先确认读数区显示「已按系统显示器尺寸估算」而不是「暂按标准屏幕估算」。
- 跨域 iframe 无法读取真实导航结果，状态条文案以 `load` 事件和地址为准，不代表页面完全正常。
- 显示器尺寸探测失败时不会清掉上一次的探测值（多屏切换后若新屏探测失败，可能暂时沿用旧屏密度）；
  在同尺寸的两块屏之间移动窗口可能不触发 resize 重取——可切换一次面板或改一下窗口大小来刷新。
- macOS 之外的平台没有 CoreGraphics 探测，`100%` 仍按 96 CSS px/英寸估算，需要尺子校准一次。

## License

本仓库代码以 **MIT** 发布（见 `LICENSE`，Copyright © 2026 Hazen223）。

- `ui/` 是上游 **Pocket · H5 预览工作台**（作者自有的独立项目）的原样快照，随仓库附带以保证构建可复现；
  如上游项目另有许可证，以该许可证为准（见 `ui/PROVENANCE.md`）。
- `vendor/qrcode/` 是 [node-qrcode](https://github.com/soldair/node-qrcode) 1.5.4 的矩阵内核及其依赖
  `dijkstrajs` 1.0.3，两者均为 **MIT**，原始许可文本见 `vendor/qrcode/LICENSE` 与
  `vendor/qrcode/node_modules/dijkstrajs/LICENSE.md`。
- `client.js` 是生成产物（由 `build-client.mjs` 生成），与源码同许可。
