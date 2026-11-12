#!/usr/bin/env node
/**
 * Pocket H5 —— DSH 面板 client bundle 构建器。
 *
 * 输入（上游原样拷贝，见 ui/PROVENANCE.md，不做手工修改）：
 *   ui/index.html   工作台的 DOM 标记（含 SVG symbol 图标库）
 *   ui/styles.css   工作台的完整视觉层（1000 行，原样复用）
 *   ui/app.js       工作台的浏览器逻辑（原样复用，Electron 分支由本脚本剥离）
 *   src/client/panel.js  面板外壳（React 组件 / 侧栏图标 / 槽位注册，client.js 的片段）
 *
 * 输出：client.js —— Harness web loader 期望的浏览器产物：一个 id 等于包名的工厂，
 * 由 __ModuleLoader__ 延迟实例化。构建过程只做「宿主适配」转换，逐条规则可从本文件审查：
 *
 *   1. Markdown？不是。DOM 标记：
 *      - 提取 <body> 内容，去掉 <script>；
 *      - 把 <symbol> 展开进 <use>（Shadow DOM 里 fragment use 不可靠），此后不残留 <use>；
 *      - 品牌链接 <a href="/"> 改成不可导航的 <div>（面板内点击不能把宿主页面带走）；
 *      - 代理提示文案改为面板版说明（能力降级见 docs/adaptation.md）。
 *   2. styles.css：
 *      - :root → :host，body 规则改写为 :host 全高；
 *      - .workspace 的 100vh/100dvh → 100%（面板没有视口高度）；
 *      - .toast / .help-backdrop 的 position:fixed → absolute（相对面板，而不是宿主视口）；
 *      - 删除 webview 专属规则；追加 .pocket-h5-root 定位容器。
 *   3. app.js：
 *      - 删除 if (window.pocketDesktop) 整块（Electron preload 桥）；
 *      - 4 处 demo 地址改为注入的 DEMO_URL（Host 路由 /pocket-h5/demo.html）；
 *      - 刷新按钮只走浏览器分支；
 *      - document.createElement → realDocument.createElement（shadow root 没有 createElement）；
 *      - ResizeObserver 拆成可清理变量。
 *   4. 包装 mountPocketH5(root, DEMO_URL)：document 指向 ShadowRoot，window 用 Proxy 记录
 *      监听器；函数返回 dispose()，面板卸载时移除监听器 / 清定时器 / 断开观察器。
 *
 * 构建自带静态校验（id 引用齐全、无 <use>、id 一致、node --check）。任何校验失败即退出非 0。
 */
import { execFileSync } from 'node:child_process'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const outPath = join(root, 'client.js')

/** 面板版代理降级文案（界面保留 SOCKS5 分区，但禁用并说明原因）。 */
const PANEL_PROXY_HINT = '面板版不支持应用内代理：iframe 请求沿用宿主浏览器的网络设置。'

const failures = []
function fail(message) {
  failures.push(message)
  console.error('[build] ✗ ' + message)
}
function ok(message) {
  console.log('[build] ✓ ' + message)
}
function read(relative) {
  return readFile(join(root, relative), 'utf8')
}
function count(text, needle) {
  return text.split(needle).length - 1
}
function indent(text, spaces) {
  const prefix = ' '.repeat(spaces)
  return text
    .replace(/\s+$/, '')
    .split('\n')
    .map((line) => (line === '' ? '' : prefix + line))
    .join('\n')
}
/** 把任意文本安全地放进一个普通模板字面量。 */
function templateLiteral(text) {
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
  return '`' + escaped + '`'
}

/* ------------------------------------------------------------------ *
 * 1. DOM 标记：上游 index.html <body>
 * ------------------------------------------------------------------ */

function buildMarkup(html) {
  const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/)
  if (!bodyMatch) {
    fail('ui/index.html 缺少 <body>')
    return ''
  }
  let body = bodyMatch[1]

  const symbols = new Map()
  for (const match of body.matchAll(/<symbol id="([^"]+)" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g)) {
    symbols.set(match[1], { viewBox: match[2], inner: match[3] })
  }
  if (symbols.size === 0) fail('ui/index.html 没有找到 <symbol> 图标定义')

  body = body.replace(/<svg\b([^>]*)>\s*<use href="#([A-Za-z0-9_-]+)"\s*\/><\/svg>/g, (_all, attrs, id) => {
    const symbol = symbols.get(id)
    if (!symbol) {
      fail('未知图标 symbol：' + id)
      return ''
    }
    const cleanAttrs = attrs.replace(/\s*viewBox="[^"]*"/g, '')
    return `<svg${cleanAttrs} viewBox="${symbol.viewBox}">${symbol.inner}</svg>`
  })
  if (/<use\b/.test(body)) fail('标记里仍有未展开的 <use>，Shadow DOM 下无法解析')

  body = body.replace(/<svg class="icon-library"[\s\S]*?<\/svg>\s*/, '')
  if (/icon-library/.test(body)) fail('图标库 <svg class="icon-library"> 未移除')

  const before = body
  body = body.replace(/<script\b[\s\S]*?<\/script>/g, '')
  if (body === before) fail('ui/index.html 里没有找到 <script>（预期有 app.js module 标签）')

  body = body.replace(
    /<a class="brand" href="\/" aria-label="Pocket 首页">([\s\S]*?)<\/a>/,
    '<div class="brand" aria-label="Pocket">$1</div>',
  )
  if (body.includes('<a class="brand"')) fail('品牌链接未能改成不可导航元素')

  const proxyHintBefore = '需要 macOS 14+ 独立应用'
  if (!body.includes(proxyHintBefore)) fail('代理提示文案（' + proxyHintBefore + '）未找到')
  body = body.split(proxyHintBefore).join(PANEL_PROXY_HINT)

  // 「新窗口打开」在 DSH 桌面端实际由 shell.openExternal 交给系统默认浏览器，
  // 用的是系统浏览器的登录态；把入口文案写准（title 与 aria-label 同文）。
  const externalLabelBefore = '在新窗口打开 H5'
  if (!body.includes(externalLabelBefore)) fail('「在新窗口打开 H5」按钮文案未找到')
  body = body.split(externalLabelBefore).join('在系统浏览器打开 H5（使用系统浏览器登录态）')

  // 帮助弹窗补一段「需要登录的页面」说明（登录态边界与替代路径）。
  const helpFootnote = '<p class="help-footnote">'
  if (!body.includes(helpFootnote)) fail('帮助弹窗的 help-footnote 锚点未找到')
  body = body.replace(
    helpFootnote,
    '<div class="help-note"><h3>需要登录的页面</h3><p>预览使用 DSH 应用自己的浏览器会话：在预览里登录一次会保留，重启 DSH 后一般仍在。若页面禁止被嵌入（X-Frame-Options / CSP frame-ancestors）或登录需要弹窗，登录无法在预览内完成——可点地址栏旁的「在系统浏览器打开」使用系统浏览器的登录态，或用手机扫码。</p></div>' +
      helpFootnote,
  )

  // 上游代理分区第二条提示假设「应用内会改系统代理」，面板里不成立，换成真实行为。
  const proxyNoteBefore = '仅作用于 Pocket；本机地址直连。账号密码不保存到磁盘。'
  if (!body.includes(proxyNoteBefore)) fail('代理分区第二条提示未找到')
  body = body.split(proxyNoteBefore).join('面板版不会修改系统或浏览器代理；示例与预览请求沿用宿主网络设置。')

  if (!body.includes('id="previewFrame"')) fail('标记缺少 #previewFrame')
  if (!body.includes('id="phone"')) fail('标记缺少 #phone')
  return body.trim()
}

/* ------------------------------------------------------------------ *
 * 2. 样式：上游 styles.css
 * ------------------------------------------------------------------ */

function buildCss(source) {
  let css = source
  const replaceAll = (from, to) => {
    if (!css.includes(from)) {
      fail('ui/styles.css 缺少片段：' + JSON.stringify(from))
      return
    }
    css = css.split(from).join(to)
  }

  replaceAll(':root {', ':host {')
  replaceAll(':host {\n  font-family:', ':host {\n  color-scheme: light;\n  font-family:')
  replaceAll(
    'body { margin: 0; overflow: hidden; }',
    ':host {\n  display: block;\n  height: 100%;\n  margin: 0;\n  overflow: hidden;\n}',
  )
  replaceAll('  height: 100vh;\n  height: 100dvh;', '  height: 100%;')
  replaceAll('.toast {\n  position: fixed;', '.toast {\n  position: absolute;')
  replaceAll('.help-backdrop { position: fixed;', '.help-backdrop { position: absolute;')
  replaceAll(
    '.fallback-dialog[open] {\n  display: block;\n  position: fixed;',
    '.fallback-dialog[open] {\n  display: block;\n  position: absolute;',
  )

  const webviewRule = 'webview#previewFrame { display: flex; }\n'
  if (!css.includes(webviewRule)) fail('ui/styles.css 缺少 webview#previewFrame 规则')
  css = css.split(webviewRule).join('')

  css += `
/* ---- DSH 面板容器（构建期追加；上游样式保持原样） ---- */
.pocket-h5-root {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
`
  // 4 个 :root（含 3 个媒体查询）+ 1 个由 body 改写来的 :host。
  if (count(css, ':host {') !== 5) fail('styles.css :host 转换数量异常（预期 5 个），实际 ' + count(css, ':host {'))
  if (count(css, 'position: fixed') !== 0) fail('styles.css 仍有 position: fixed（会相对宿主视口定位）')
  if (count(css, '{') !== count(css, '}')) {
    fail('styles.css 花括号不配对：{ ' + count(css, '{') + ' / } ' + count(css, '}'))
  } else {
    ok('styles.css 花括号配对（' + count(css, '{') + ' 组）')
  }
  return css
}

/* ------------------------------------------------------------------ *
 * 3. 逻辑：上游 app.js
 * ------------------------------------------------------------------ */

function buildApp(source) {
  let code = source

  const bridgeStart = code.indexOf('if (window.pocketDesktop) {')
  const persistStart = code.indexOf('function persist() {')
  if (bridgeStart < 0 || persistStart < 0 || persistStart < bridgeStart) {
    fail('ui/app.js 找不到 Electron preload 桥区块（if (window.pocketDesktop) { … }）')
  } else {
    code = code.slice(0, bridgeStart) + code.slice(persistStart)
  }
  if (code.includes('desktop.onMetrics') || code.includes("createElement('webview')")) {
    fail('Electron 桥区块未被完整移除')
  }

  const demoLiteral = "new URL('/demo.html', location.href).href"
  if (count(code, demoLiteral) !== 4) fail('demo 地址字面量数量异常（预期 4），实际 ' + count(code, demoLiteral))
  code = code.split(demoLiteral).join('DEMO_URL')

  const refreshLine = 'if (window.pocketDesktop) window.pocketDesktop.reload(); else navigate(currentUrl, false);'
  if (!code.includes(refreshLine)) fail('刷新按钮的 Electron 分支未找到')
  code = code.split(refreshLine).join('navigate(currentUrl, false);')

  const proxyHint = "'此功能需要 macOS 14+ 的 Pocket 独立应用'"
  if (!code.includes(proxyHint)) fail('app.js 的代理不可用文案未找到')
  code = code.split(proxyHint).join(JSON.stringify(PANEL_PROXY_HINT))

  const observerLine = "new ResizeObserver(resizeDevice).observe($('canvas'));"
  if (!code.includes(observerLine)) fail('app.js 的 ResizeObserver 语句未找到')
  code = code.split(observerLine).join(
    'const canvasObserver = new ResizeObserver(resizeDevice);\n  canvasObserver.observe($(\'canvas\'));',
  )

  // resizeDevice 是通过 requestAnimationFrame 排队的；记录 id 以便卸载时取消，
  // 否则面板卸载竞态里可能对已移除的 DOM 执行 resizeDevice（R1）。
  const rafLine = 'requestAnimationFrame(resizeDevice);'
  if (count(code, rafLine) !== 1) fail('app.js 的 requestAnimationFrame 语句数量异常：' + count(code, rafLine))
  code = code.split(rafLine).join('pocketAnimationFrame = requestAnimationFrame(resizeDevice);')

  // 面板没有自己的查询串；上游 ?url= 直开在面板里读到的是宿主页面参数（R5），去掉。
  const queryLine = "const requested = new URLSearchParams(location.search).get('url') || saved.url;"
  if (!code.includes(queryLine)) fail('app.js 的 ?url= 读取行未找到')
  code = code.split(queryLine).join('const requested = saved.url;')

  // 登录桥启用时，navigate 仍记录原始目标地址，但实际加载代理地址；
  // 这样刷新按钮、示例按钮、地址栏语义都保持「目标地址」。
  const frameSrcLine = "$('previewFrame').src = url;"
  if (count(code, frameSrcLine) !== 1) fail('app.js 的 iframe src 赋值行数量异常：' + count(code, frameSrcLine))
  code = code.split(frameSrcLine).join(
    "const bridged = window.pocketBridge && window.pocketBridge.target === url ? window.pocketBridge.entryUrl : null;\n  $('previewFrame').src = bridged || url;",
  )

  const createElementCount = count(code, 'document.createElement(')
  if (createElementCount !== 1) fail('document.createElement 出现 ' + createElementCount + ' 次（预期 1 次，用于 datalist option）')
  code = code.split('document.createElement(').join('realDocument.createElement(')

  if (code.includes('pocketDesktop.reload')) fail('仍残留 pocketDesktop.reload')
  return code
}

/* ------------------------------------------------------------------ *
 * 组装 client.js
 * ------------------------------------------------------------------ */

const pkg = JSON.parse(await read('package.json'))

/* 构建身份：与 FlowPilot 相同约定——client.js 只内嵌版本号（可复现），
 * 完整身份（sha / dirty / channel / 时间）写进 build-info.json，供 Release 资产与排障使用。 */
function gitOutput(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

function computeBuildInfo(version) {
  const sha = gitOutput(['rev-parse', '--short', 'HEAD']) || 'unknown'
  const statusLines = gitOutput(['status', '--porcelain']).split('\n').filter(Boolean)
  const dirty = statusLines.some((line) => {
    const file = line.slice(3).trim()
    return file !== 'client.js' && file !== 'build-info.json'
  })
  const explicit = String(process.env.POCKET_H5_CHANNEL ?? '').toLowerCase()
  const channel = ['dev', 'beta', 'release'].includes(explicit) ? explicit : dirty ? 'dev' : 'release'
  const suffix = channel === 'dev' ? '-dev' : channel === 'beta' ? '-beta' : ''
  return { version, label: `${version}${suffix}+${sha}${dirty ? '.dirty' : ''}`, channel, sha, dirty, builtAt: new Date().toISOString() }
}

const BUILD_INFO = computeBuildInfo(pkg.version)
const html = await read('ui/index.html')
const cssSource = await read('ui/styles.css')
const appSource = await read('ui/app.js')
const panelSource = await read('src/client/panel.js')
const qrSource = await read('src/client/qr.js')
const diagnoseSource = await read('src/client/diagnose.js')
const bridgeSource = await read('src/client/bridge.js')

const markup = buildMarkup(html)
const css = buildCss(cssSource)
const appCode = buildApp(appSource)

const appIds = new Set([...appCode.matchAll(/\$\('([A-Za-z0-9_-]+)'\)/g)].map((match) => match[1]))
const markupIds = new Set([...markup.matchAll(/\bid="([A-Za-z0-9_-]+)"/g)].map((match) => match[1]))
const missingIds = [...appIds].filter((id) => !markupIds.has(id))
if (missingIds.length > 0) fail('app.js 引用了标记里不存在的 id：' + missingIds.join(', '))
else ok(`app.js 引用的 ${appIds.size} 个 DOM id 全部存在于标记中`)

if (/<use\b/.test(markup)) fail('生成标记里仍有 <use>')
if (!css.includes('.pocket-h5-root')) fail('生成样式缺少 .pocket-h5-root')
if (!/slots\.inject\(\s*['"]main['"]/.test(panelSource)) fail('面板片段缺少 main 槽位注册')
if (!panelSource.includes('sidebar.panellist')) fail('面板片段缺少 sidebar.panellist 槽位注册')
if (!panelSource.includes('mountQrFeature(shadow)')) fail('面板片段没有挂载二维码入口')
if (!panelSource.includes('CSS + QR_CSS')) fail('面板片段没有注入二维码样式')
if (!qrSource.includes('function mountQrFeature')) fail('qr.js 缺少 mountQrFeature')
if (!qrSource.includes('createQrMatrix')) fail('qr.js 没有使用打包的二维码内核')
if (!panelSource.includes('applyHostDisplayMetrics')) fail('面板片段没有接 Host 的显示器物理尺寸')
if (!panelSource.includes('mountDiagnoseFeature(shadow)')) fail('面板片段没有挂载诊断入口')
if (!panelSource.includes('CSS + QR_CSS + DIAGNOSIS_CSS + BRIDGE_CSS')) fail('面板片段没有注入登录桥样式')
if (!panelSource.includes('mountBridgeFeature(shadow)')) fail('面板片段没有挂载登录桥')
if (!panelSource.includes('function pocketPreviewTarget')) fail('面板片段缺少登录桥目标解析')
if (!bridgeSource.includes('function mountBridgeFeature')) fail('bridge.js 缺少 mountBridgeFeature')
if (!bridgeSource.includes('function bridgeBannerText')) fail('bridge.js 缺少 bridgeBannerText')
if (!diagnoseSource.includes('function summarizeProbe')) fail('diagnose.js 缺少 summarizeProbe')
if (markup.includes('在新窗口打开 H5')) fail('「在新窗口打开」文案未替换')
if (!markup.includes('需要登录的页面')) fail('帮助弹窗缺少登录说明')

/* ------------------------------------------------------------------ *
 * 4. 内置二维码编码器：vendor/qrcode（node-qrcode 1.5.4 内核，MIT）
 *    把 CJS 模块原地包成工厂，配一个最小 require 解析器，避免运行时依赖。
 * ------------------------------------------------------------------ */

const qrModuleEntries = []
{
  const coreDir = join(root, 'vendor', 'qrcode', 'lib', 'core')
  const dijkstraFile = join(root, 'vendor', 'qrcode', 'node_modules', 'dijkstrajs', 'dijkstra.js')
  qrModuleEntries.push(['node_modules/dijkstrajs/dijkstra', dijkstraFile])
  for (const name of (await readdir(coreDir)).filter((entry) => entry.endsWith('.js')).sort()) {
    qrModuleEntries.push(['lib/core/' + name.replace(/\.js$/, ''), join(coreDir, name)])
  }
}
if (qrModuleEntries.length < 20) fail('vendor/qrcode 模块数量异常：' + qrModuleEntries.length)

const qrFactories = []
for (const [id, file] of qrModuleEntries) {
  const source = await readFile(file, 'utf8')
  if (/require\(['"](?!\.|dijkstrajs)/.test(source)) fail('vendor/qrcode 模块 ' + id + ' 含未支持的依赖')
  qrFactories.push(
    '      ' + JSON.stringify(id) + ': function (module, exports, require) {\n' +
      indent(source.trimEnd(), 8) +
      '\n      },',
  )
}
ok('vendor/qrcode 打包 ' + qrModuleEntries.length + ' 个模块')

const qrRuntime = [
  '    /* ---- 内置二维码编码器（vendor/qrcode · node-qrcode 1.5.4 · MIT；来源见 vendor/qrcode/PROVENANCE.md） ---- */',
  '    const QR_MODULE_FACTORIES = {',
  ...qrFactories,
  '    };',
  '    const QR_MODULE_CACHE = {};',
  '    function qrLoad(id) {',
  '      if (QR_MODULE_CACHE[id]) return QR_MODULE_CACHE[id].exports;',
  '      const factory = QR_MODULE_FACTORIES[id];',
  '      if (typeof factory !== "function") throw new Error("pocket-h5 qr: missing module " + id);',
  '      const module = { exports: {} };',
  '      QR_MODULE_CACHE[id] = module;',
  '      factory(module, module.exports, qrRequireFrom(id));',
  '      return module.exports;',
  '    }',
  '    function qrRequireFrom(fromId) {',
  '      const directory = fromId.split("/").slice(0, -1).join("/");',
  '      return function qrRequire(spec) {',
  '        if (spec === "dijkstrajs") return qrLoad("node_modules/dijkstrajs/dijkstra");',
  '        if (spec.slice(0, 2) === "./" || spec.slice(0, 3) === "../") {',
  '          const parts = directory === "" ? [] : directory.split("/");',
  '          for (const segment of spec.split("/")) {',
  '            if (segment === "." || segment === "") continue;',
  '            else if (segment === "..") parts.pop();',
  '            else parts.push(segment);',
  '          }',
  '          return qrLoad(parts.join("/").replace(/\\.js$/, ""));',
  '        }',
  '        throw new Error("pocket-h5 qr: unsupported module " + spec);',
  '      };',
  '    }',
  '    function createQrMatrix(text) {',
  '      const qr = qrLoad("lib/core/qrcode").create(String(text), { errorCorrectionLevel: "M" });',
  '      return { size: qr.modules.size, data: qr.modules.data, version: qr.version };',
  '    }',
  '',
].join('\n')

const bundle = [
  '/* ------------------------------------------------------------------',
  ' * Pocket H5 · DSH 面板 client bundle —— 由 build-client.mjs 生成，不要手改。',
  ' * 界面与行为来自 ui/ 下的上游快照；转换规则见 docs/adaptation.md。',
  ' * ------------------------------------------------------------------ */',
  'window.__ModuleLoader__.load({',
  '  id: ' + JSON.stringify(pkg.name) + ',',
  '  factory(require) {',
  '    const React = require("react");',
  '    const h = React.createElement;',
  '    const POCKET_H5_VERSION = ' + JSON.stringify(pkg.version) + ';',
  '',
  '    /* ---- 上游 styles.css（shadow 作用域适配） ---- */',
  '    const CSS = ' + templateLiteral(css) + ';',
  '',
  '    /* ---- 上游 index.html <body>（图标已内联展开） ---- */',
  '    const MARKUP = ' + templateLiteral(markup) + ';',
  '',
  '',
  qrRuntime,
  '    /* ---- 上游 app.js（Electron 桥替换为面板宿主适配） ---- */',
  '    function mountPocketH5(root, DEMO_URL) {',
  '      const realDocument = globalThis.document;',
  '      const realWindow = globalThis.window;',
  '      // 面板里 document 指向 ShadowRoot：getElementById / querySelectorAll / addEventListener 都在面板内生效。',
  '      const document = root;',
  '      let pocketAnimationFrame = 0;',
  '      // 记录 window 上的监听器，卸载面板时全部移除（上游代码本身不返回清理函数）。',
  '      const listeners = [];',
  '      const window = new Proxy(realWindow, {',
  '        get(target, property) {',
  '          if (property === "addEventListener") {',
  '            return function trackedAddEventListener(type, listener, options) {',
  '              listeners.push([type, listener, options]);',
  '              target.addEventListener(type, listener, options);',
  '            };',
  '          }',
  '          const value = target[property];',
  '          return typeof value === "function" ? value.bind(target) : value;',
  '        },',
  '      });',
  '',
  indent(appCode, 6),
  '',
  '      return function disposePocketH5() {',
  '        for (let index = 0; index < listeners.length; index += 1) {',
  '          try { realWindow.removeEventListener(listeners[index][0], listeners[index][1], listeners[index][2]); }',
  '          catch (error) { /* 面板已失效时忽略 */ }',
  '        }',
  '        listeners.length = 0;',
  '        clearTimeout(toastTimer);',
  '        clearTimeout(loadingTimer);',
  '        if (pendingProxy && pendingProxy.timer) clearTimeout(pendingProxy.timer);',
  '        if (pocketAnimationFrame) cancelAnimationFrame(pocketAnimationFrame);',
  '        try { canvasObserver.disconnect(); } catch (error) { /* 忽略 */ }',
  '      };',
  '    }',
  '',
  indent(qrSource, 4),
  '',
  indent(diagnoseSource, 4),
  '',
  indent(bridgeSource, 4),
  '',
  indent(panelSource, 4),
  '',
  '    return {',
  '      inject: ["slots"],',
  '      apply: pocketApply,',
  '      version: POCKET_H5_VERSION,',
  '      // 离线冒烟测试入口（tests/client-smoke.mjs 使用；渲染不读取）。',
  '      __test: { createQrMatrix: createQrMatrix, qrSvgMarkup: qrSvgMarkup, pickHostDisplay: pickHostDisplay, hostCssPixelsPerInch: hostCssPixelsPerInch, summarizeProbe: summarizeProbe, bridgeBannerText: bridgeBannerText, bridgeCanTarget: bridgeCanTarget },',
  '    };',
  '  },',
  '});',
  '',
].join('\n')

if (failures.length > 0) {
  console.error(`\n[build] 失败：${failures.length} 个转换/校验问题，未写出 client.js。`)
  process.exit(1)
}

await writeFile(outPath, bundle, 'utf8')
await writeFile(join(root, 'build-info.json'), JSON.stringify(BUILD_INFO, null, 2) + '\n', 'utf8')
execFileSync(process.execPath, ['--check', outPath], { stdio: 'inherit' })
ok('node --check client.js')

console.log(`[build] build-info: ${BUILD_INFO.label}（channel=${BUILD_INFO.channel}, sha=${BUILD_INFO.sha}, dirty=${BUILD_INFO.dirty}）`)
const bytes = Buffer.byteLength(bundle, 'utf8')
console.log(
  `[build] client.js 已生成：${bytes} 字节 · 标记 ${markupIds.size} 个 id · CSS ${css.split('\n').length} 行 · app.js ${appCode.split('\n').length} 行`,
)
