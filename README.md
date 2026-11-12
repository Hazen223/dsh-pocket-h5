# Pocket H5 · DSH 面板

把独立的 **Pocket · H5 预览工作台**（上游 Electron / 浏览器版）复用为 DeepSeek Harness Web UI 里的一个
插件面板：左侧栏「Pocket H5」入口 + 主面板里的整套工作台（iPhone 17 尺寸、状态栏/灵动岛/安全区、
横竖屏、画布缩放与真机物理尺寸校准），并补了两个上游没有的入口：**手机扫码**（把当前预览地址
生成二维码，真机扫一下就能打开）、**预览诊断**（页面打不开时，直接告诉你「站点禁止被嵌入」还是
「被跳转到登录页」）和**登录桥**（把 Safari 里已登录的 Cookie 经本机代理注入预览，需要登录的页面
也能在手机框里看）。界面重排为 FlowPilot 风格的工作台（顶栏 + 左侧设置卡 + 右侧画布卡），
并跟随 DSH 主题自动切换浅色/黑暗模式。

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
├── src/client/bridge.js  # 新增能力：「登录桥」按钮 + 登录态代理对话框/状态条
├── src/client/theme.js   # 外观层：FlowPilot 风格骨架 + light-dark() 明暗令牌 + 设备边框背景
├── src/client/assets/    # 设备边框素材 (bezel.webp) 与几何 (bezel.json)，见其 README
├── lib/bridge.js         # Host 登录桥：Safari binarycookies 解析 + 本机反向代理
├── ui/                   # 上游原样快照（复用源，不手改）
├── vendor/qrcode/        # 离线二维码编码器（node-qrcode 1.5.4 内核，MIT；PROVENANCE.md + LICENSE）
├── locale/{zh,en}.json   # 插件管理页显示的名称与描述
├── icon.svg              # 插件图标（复用上游手机图形）
├── tests/host-smoke.mjs  # Host 冒烟测试（30 项：demo/display/probe/bridge + 方法/HEAD/穿越边界）
├── tests/client-smoke.mjs # 客户端 bundle 冒烟测试（103 项：factory/槽位/二维码/尺寸/诊断/登录桥/外观层/边框/控件/帮助）
├── tests/bridge-unit.mjs # 登录桥单测（27 项：Cookie 解析/过滤/代理注入/头部改写/隧道）
└── docs/                 # 复用/适配说明 + 验证记录
```

## 工作方式

- **面板**：`main` keyed slot（key `pocket-h5`）+ `sidebar.panellist`（id `pocket-h5`，order 95）。
  面板组件把上游 `styles.css` 与 `index.html` 标记装进面板内的 **Shadow DOM**（样式与宿主隔离），
  再运行由 `ui/app.js` 机械转换出的 `mountPocketH5()`。
- **预览**：仍是 `<iframe id="previewFrame">`，输入端口 / `localhost:3000/path` / 完整 HTTP(S) 地址即可。
- **内置示例**：`ui/demo.html` 由 Host 半通过同源路由 `/pocket-h5/demo.html` 提供。
- **持久化**：外观、最近地址、显示器校准仍写在 `localStorage('pocket-h5-v1')`（宿主同源）。
- **登录桥（新增）**：预览地址旁的「登录桥」按钮。Host 起一个只监听 `127.0.0.1` 的反向代理，
  把从 Safari 读取的该站点 Cookie 注入上游请求，iframe 改走代理 → 需要登录的页面在面板里也能打开。
  Cookie 只在 Host 内存中；停止桥接、切换面板或闲置 30 分钟后释放。读 Safari Cookie 需要
  「完全磁盘访问权限」；也支持手动粘贴 Cookie 头（不需要任何系统权限）。
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
node tests/host-smoke.mjs     # 30 项：demo/display/probe/bridge 路由、方法、HEAD、穿越、Cookie 注入与错误边界
node tests/client-smoke.mjs   # 103 项：loader/factory、槽位、二维码、显示器匹配、诊断摘要、登录桥助手、外观层、边框几何、标准控件、? 提示
node tests/bridge-unit.mjs    # 27 项：Safari binarycookies、域名/路径过滤、代理注入、Set-Cookie/Location 改写、隧道
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

## 外观与黑暗模式

界面重排为 FlowPilot 风格的工作台（`src/client/theme.js`）：

- **48px 顶栏**：品牌 + 当前页面 + 预览状态 + 刷新 / 在系统浏览器打开；二维码、诊断、登录桥按钮
  也收在顶栏的当前页面旁边（原来的侧栏小按钮区）。
- **左侧设置区 = 一区一卡**：预览地址、显示与尺寸、模拟设备、系统外观、页面布局各是一张独立
  圆角卡片（不再用横线分隔），卡片内折叠项（代理/校准/屏幕规格）是下沉的小面板；分组标题是小号
  加字距灰字，控件统一 34–36px 高的无描边面层，主按钮为黑/白反色（跟随主题）。底部帮助/自动保存/
  重置也单独成一张卡片。
- **说明文字不进版面**：遵循「Avoid unnecessary secondary labels and descriptions」——静态说明、
  校准/布局提示都不再常驻，收进分区标题旁的**圆形 ? 图标**里，hover / focus 出现（点击可固定，
  Esc 关闭）；需要时还会附上当前实时状态（如校准状态、布局模式说明）。
- **右侧画布卡**：点阵背景 + 手机预览，卡片 12px 圆角 + 1px 边界。
- **设备外框**：用**你提供的 iPhone 外框图片**（`src/client/assets/bezel.webp`，屏幕开口已抠成透明）
  当「手机壳」**盖在长方形页面之上**：页面本身是矩形、没有 CSS 圆角，四角由不透明的边框内框自然裁切
  （素材开口是 iOS 的 squircle，比 CSS 圆角更准）。屏幕开口按 402×874 @3x 的几何定位，横屏时同一张图
  旋转 90°；换边框只需把新图交给 `python3 tools/prepare-bezel.py <frame.png>`。
- **iOS 标准状态栏 / 手势条**：按 Apple 的几何重画——状态栏 62pt 高、时间 17pt/600、左内边距 54，
  信号 18×12 / Wi‑Fi 17×12 / 电池 27×13（百分比在电池体内），底部手势条 134×5、圆角 2.5、距底 8pt。
- **黑暗模式**：所有颜色用 `light-dark()` 成对声明（`--p-*` 令牌），跟随 DSH 的 `color-scheme`
  自动切换，不需要单独开关；在 DSH 设置里切到深色主题即可看到。设备外框/状态栏保持中性灰，
  不参与主题映射（它们是「被预览的手机」，不是面板 chrome）。
- 上游 `ui/styles.css` 仍是基础层（手机几何、控件结构），外观层在其后覆盖；所有上游 id 与事件
  绑定保持不变，顶栏只是把品牌/页面/状态/刷新/新窗口节点移动到新的 header 里。

## 登录态与登录桥（在面板里用 Safari 的登录状态）

### 能做什么

- **登录桥**：面板里的「登录桥」按钮。Host 起一个只监听 `127.0.0.1` 的随机端口反向代理，
  把 Safari 里该站点的 Cookie 注入发往目标站的请求；iframe 改走代理，所以原本需要登录的页面
  在手机框里也能显示。代理同时会剥离 `X-Frame-Options` / CSP `frame-ancestors`，让「禁止被嵌入」
  的站点也能看。
- **Cookie 来源**：
  - 自动：从 Safari 的 Cookie 库读取（首次需要给 DSH 授「完全磁盘访问权限」）；
  - 手动：在登录桥对话框里粘贴 `Cookie` 请求头（例如 DevTools 里任意请求的 `Cookie:` 或
    「Copy as cURL」里的 `-H 'Cookie: …'`），不需要任何系统权限。
- **边界**：Cookie 只存在 Host 内存、不写盘、不打印；停止桥接 / 切换面板 / 闲置 30 分钟即释放；
  只对 Cookie 认证有效（密码、扫码、OAuth 弹窗仍需在预览里完成或走系统浏览器）。

### 使用步骤

1. 在 Safari（或 Chrome）里正常登录目标站点；
2. 打开面板 → 输入并打开该站点地址 → 点「登录桥」→「从 Safari 导入并开启桥接」；
3. 顶部出现「登录桥已启用」状态条即生效；「恢复直连」回到不带登录态的直接预览；
4. 如果读不到 Safari Cookie：按提示到「系统设置 → 隐私与安全性 → 完全磁盘访问权限」添加
   `DSH NEXT` 并打开开关，**退出并重开 DSH**；或直接用「手动粘贴 Cookie」。

### 为什么不能「直接继承」系统浏览器登录态

- Safari/Chrome 的 Cookie 属于各自应用、由系统钥匙串加密，插件与 Host 没有合法的跨应用 API；
  登录桥是在这个约束下用「读本机 Cookie + 本机代理」绕出的可用路径，不是浏览器原生能力。
- 内嵌预览本身没有自己的浏览器配置目录，登录桥启用前它用的是 DSH 应用的 Chromium 会话
  （在预览里登录一次也会保留）。
- **上游 Electron 版 vs 面板**：上游能创建同会话子窗口处理弹窗登录并回传 Cookie；DSH 桌面端会把
  `window.open` 交给系统浏览器。弹窗式登录请用「在系统浏览器打开」或手机扫码。

## 已知限制

- 面板界面沿用上游中文文案，未接入 DSH locale。
- **视觉层**：面板跟随 DSH 的主题（浅色/黑暗）自动切换，不单独提供主题开关；设备预览里的
  状态栏背景/文字颜色仍是工作台自己的设置项，不随宿主主题变化。
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
- **登录桥只代理一个 target origin**：页面里写死的绝对地址（指向其它域名/CDN）不会经过代理，
  这些请求没有登录态；只带 Cookie 认证，Bearer/localStorage 类的登录态不会自动带入。
- **登录桥改变页面 origin**（`http://127.0.0.1:<代理端口>`）：依赖 `location.origin` 或精确
  `referer` 校验的页面可能需要验证；代理会改写请求的 origin/referer 与响应的 Location 以尽量兼容。

## 版本与发布

版本号写在 `package.json`；发布走本地脚本（私有仓库没有 Actions runner 配额，tag 推送后 run 会一直 queued）：

```bash
npm run build                          # 生成 client.js + build-info.json
npm test                               # host smoke + client smoke
npm run release -- --version=0.2.0     # 门禁 → 升版本 → 构建 → 提交 → tag → push → Release（附产物）
npm run release -- --version=0.2.0 --dry-run   # 只打印计划
npm run release -- --resume=v0.2.0     # 只给已有 tag 补 Release 资产
```

- 构建身份：`client.js` 只内嵌版本号（字节级可复现）；完整身份（sha / dirty / channel / 时间）写进 `build-info.json`（已 gitignore，进 Release 资产）；
- Release 标题只写版本号（如 `v0.2.0`），变更说明放正文；
- 资产：`client.js` + `build-info.json`；固定版本安装用 `#v0.2.0`。

## 公共脱敏版

公共镜像 `Hazen223/dsh-pocket-h5-public` 由脚本生成（与 FlowPilot 同一套流程）：

```bash
node tools/public-sync.mjs --version=0.2.0 --out=/tmp/ph5-public-gen   # 只生成，便于 review
node tools/public-sync.mjs --source=v0.2.0 --version=0.2.0 --push      # 生成 → 提交 → tag → 推送 → Release
```

- 脱敏：私有仓库地址 → 公共仓库、移除作者机器相关表述、`/Users/…` → `/Users/x`；
- 生成后自动跑禁词扫描（命中即中止）+ 构建 + host/client smoke；
- 公共仓库不带 `.github`（Actions 只在私有仓库手动触发），Release 标题只写版本号、附 `client.js` + `build-info.json`。

## License

本仓库代码以 **MIT** 发布（见 `LICENSE`，Copyright © 2026 Hazen223）。

- `ui/` 是上游 **Pocket · H5 预览工作台**（作者自有的独立项目）的原样快照，随仓库附带以保证构建可复现；
  如上游项目另有许可证，以该许可证为准（见 `ui/PROVENANCE.md`）。
- `vendor/qrcode/` 是 [node-qrcode](https://github.com/soldair/node-qrcode) 1.5.4 的矩阵内核及其依赖
  `dijkstrajs` 1.0.3，两者均为 **MIT**，原始许可文本见 `vendor/qrcode/LICENSE` 与
  `vendor/qrcode/node_modules/dijkstrajs/LICENSE.md`。
- `client.js` 是生成产物（由 `build-client.mjs` 生成），与源码同许可。
