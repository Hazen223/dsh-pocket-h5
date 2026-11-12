#!/usr/bin/env node
/**
 * Client half smoke test — runs `client.js` the way the Harness web loader does,
 * without a browser:
 *
 *   1. execute the bundle against a `window.__ModuleLoader__` stub;
 *   2. instantiate the lazy factory with a minimal React stub;
 *   3. call apply(ctx) with a fake slot registry and assert the exact
 *      registrations the host needs (main keyed slot + sidebar entry);
 *   4. check the generated CSS/MARKUP made it into the factory without loss.
 *
 * It cannot verify rendering or layout; that needs the real page (see
 * docs/verification.md).
 */
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'

const root = dirname(fileURLToPath(import.meta.url))
const bundlePath = join(root, '..', 'client.js')
const pkg = JSON.parse(await readFile(join(root, '..', 'package.json'), 'utf8'))

const failures = []
const check = (condition, message) => {
  if (condition) console.log('ok - ' + message)
  else {
    failures.push(message)
    console.error('not ok - ' + message)
  }
}

/* ---- 1. loader stub: capture the registration instead of instantiating ---- */
let definition = null
const windowStub = {
  __ModuleLoader__: {
    load(value) {
      definition = value
    },
  },
}
runInNewContext(await readFile(bundlePath, 'utf8'), { window: windowStub, console, TextEncoder, TextDecoder, URL, URLSearchParams })

check(definition !== null, 'bundle calls window.__ModuleLoader__.load()')
check(definition?.id === pkg.name, `factory id equals package name (${pkg.name})`)
check(typeof definition?.factory === 'function', 'factory is a function')

/* ---- 2. instantiate the factory with a minimal React stub ---- */
const reactStub = {
  createElement: (type, props, ...children) => ({ type, props, children }),
  useRef: (initial) => ({ current: initial }),
  useEffect: () => {},
}
let factoryError = null
let client = null
try {
  client = definition.factory((name) => {
    if (name === 'react') return reactStub
    throw new Error('unexpected require: ' + name)
  })
} catch (error) {
  factoryError = error
}
check(factoryError === null, 'factory executes without throwing' + (factoryError ? ` (${factoryError.message})` : ''))
check(typeof client?.apply === 'function', 'client exports apply()')
check(Array.isArray(client?.inject) && client.inject.includes('slots'), "client injects the 'slots' service")

/* ---- 3. fake slot registry: the host-facing contract ---- */
const injected = []
const registrations = []
const fakeCtx = {
  slots: {
    inject(slot, callback) {
      injected.push(slot)
      callback()
      return () => {}
    },
    register(options, component) {
      registrations.push({ options, component })
      return () => {}
    },
  },
}
let applyError = null
try {
  client.apply(fakeCtx)
} catch (error) {
  applyError = error
}
check(applyError === null, 'apply(ctx) executes without throwing' + (applyError ? ` (${applyError.message})` : ''))
check(
  injected.includes('main') && injected.includes('sidebar.panellist'),
  'apply injects main and sidebar.panellist',
)

const main = registrations.find((entry) => entry.options?.name === 'main')
const sidebar = registrations.find((entry) => entry.options?.name === 'sidebar.panellist')
check(main?.options?.key === 'pocket-h5', 'main registration uses key pocket-h5')
check(sidebar?.options?.id === 'pocket-h5', 'sidebar registration uses id pocket-h5')
check(sidebar?.options?.label === 'Pocket H5', 'sidebar label is Pocket H5')
check(sidebar?.options?.order === 95, 'sidebar order is 95')
check(typeof main?.component === 'function', 'main panel component is a function')
check(typeof sidebar?.component === 'function', 'sidebar icon component is a function')

/* ---- 4. offline QR encoder (vendor/qrcode) ---- */
const qrTest = client?.__test ?? {}
check(typeof qrTest.createQrMatrix === 'function', 'client exposes the bundled QR encoder for smoke tests')
check(typeof qrTest.qrSvgMarkup === 'function', 'client exposes the QR SVG renderer for smoke tests')

if (typeof qrTest.createQrMatrix === 'function') {
  const url = 'http://127.0.0.1:5173'
  const qr = qrTest.createQrMatrix(url)
  check(qr && qr.size >= 21 && qr.size % 4 === 1, `QR matrix has a valid module size (${qr?.size})`)
  check(qr && qr.data && qr.data.length === qr.size * qr.size, 'QR matrix data length matches size²')
  check(
    qr && Array.from(qr.data).every((cell) => cell === 0 || cell === 1),
    'QR matrix cells are binary',
  )

  const isDark = (matrix, x, y) => matrix.data[y * matrix.size + x] === 1
  const finderOk = (matrix, left, top) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const ring = x === 0 || x === 6 || y === 0 || y === 6
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
        const expected = ring || core ? 1 : 0
        if ((isDark(matrix, left + x, top + y) ? 1 : 0) !== expected) return false
      }
    }
    return true
  }
  check(finderOk(qr, 0, 0), 'QR finder pattern at top-left')
  check(finderOk(qr, qr.size - 7, 0), 'QR finder pattern at top-right')
  check(finderOk(qr, 0, qr.size - 7), 'QR finder pattern at bottom-left')

  const again = qrTest.createQrMatrix(url)
  check(again.size === qr.size && again.data.join(',') === qr.data.join(','), 'QR output is deterministic')

  const longUrl = 'http://192.168.1.23:5173/some/very/long/dev/path?query=value&another=1'
  const longer = qrTest.createQrMatrix(longUrl)
  check(longer.size >= qr.size, 'longer URLs pick a larger QR version')

  // 打包进来的内核必须与 vendor 下的 Node 模块逐位一致（防止最小 require 打包器走样）。
  const requireVendor = createRequire(import.meta.url)
  const vendorCreate = requireVendor('../vendor/qrcode/lib/core/qrcode.js').create
  const reference = vendorCreate(url, { errorCorrectionLevel: 'M' })
  check(
    reference.modules.size === qr.size &&
      Array.from(reference.modules.data).join(',') === Array.from(qr.data).join(','),
    'bundled QR encoder matches the vendored Node module bit for bit',
  )

  const svg = qrTest.qrSvgMarkup(url)
  check(svg.startsWith('<svg') && svg.endsWith('</svg>'), 'QR renders as an inline SVG')
  check(svg.includes('shape-rendering="crispEdges"'), 'QR SVG uses crispEdges for sharp modules')
  check(svg.includes('viewBox="0 0 ' + (qr.size + 8) + ' ' + (qr.size + 8) + '"'), 'QR SVG includes the 4-module quiet zone')
}

/* ---- 5. host display metrics matching (true-size 100%) ---- */
const pickDisplay = qrTest.pickHostDisplay
const cssPpi = qrTest.hostCssPixelsPerInch
check(typeof pickDisplay === 'function', 'client exposes display matching for smoke tests')
check(typeof cssPpi === 'function', 'client exposes display ppi conversion for smoke tests')

if (typeof pickDisplay === 'function' && typeof cssPpi === 'function') {
  // Real probe shape from a 14" MacBook Pro (CoreGraphics: mode width 1512, panel 301.2mm).
  const builtin = { id: 1, pixelWidth: 1512, pixelHeight: 982, widthMm: 301.214, heightMm: 195.63 }
  const external = { id: 3, pixelWidth: 1920, pixelHeight: 1080, widthMm: 527.0, heightMm: 296.0 }
  const displays = [builtin, external]
  check(pickDisplay(displays, 1512, 982)?.id === 1, 'display matching picks the window screen by CSS size')
  check(pickDisplay(displays, 1920, 1080)?.id === 3, 'display matching picks a second display')
  check(pickDisplay(displays, 2560, 1440) === null, 'display matching refuses an unknown multi-display size')
  check(pickDisplay([external], 1512, 982)?.id === 3, 'display matching falls back to the only display')
  check(pickDisplay([], 1512, 982) === null, 'display matching handles an empty probe result')
  check(pickDisplay(null, 1512, 982) === null, 'display matching handles a missing payload')
  const ppi = cssPpi(builtin)
  check(ppi > 127 && ppi < 128, `CSS ppi converts mm to px/inch (${ppi?.toFixed(2)})`)
  check(cssPpi({ pixelWidth: 0, widthMm: 300 }) === null, 'CSS ppi rejects invalid geometry')
}

/* ---- 6. embed/login diagnosis summary (pure) ---- */
const summarize = qrTest.summarizeProbe
check(typeof summarize === 'function', 'client exposes the diagnosis summarizer for smoke tests')

if (typeof summarize === 'function') {
  const blocked = summarize({
    ok: true,
    requestedUrl: 'http://127.0.0.1:5173/',
    finalUrl: 'http://127.0.0.1:5173/',
    status: 200,
    redirects: [],
    framing: { allowed: false, reason: 'X-Frame-Options: DENY' },
    login: { detected: false, reason: '未检测到登录跳转' },
  })
  check(blocked.tone === 'error' && blocked.title.includes('禁止'), 'diagnosis: framing block is an error')
  check(blocked.lines.some((line) => line.includes('X-Frame-Options')), 'diagnosis: framing reason is reported')

  const loginGate = summarize({
    ok: true,
    requestedUrl: 'http://127.0.0.1:5173/',
    finalUrl: 'http://127.0.0.1:5173/login',
    status: 200,
    redirects: [{ status: 302, from: 'http://127.0.0.1:5173/', to: 'http://127.0.0.1:5173/login' }],
    framing: { allowed: true, reason: '未发现限制' },
    login: { detected: true, reason: '跳转链里出现登录相关地址' },
  })
  check(loginGate.tone === 'warn' && loginGate.title.includes('登录'), 'diagnosis: login gate is a warning')
  check(loginGate.lines.some((line) => line.includes('最终地址')), 'diagnosis: login redirect target is reported')
  check(
    loginGate.tips.some((tip) => tip.includes('在预览里直接登录')),
    'diagnosis: login tips point at logging in inside the preview',
  )

  const both = summarize({
    ok: true,
    requestedUrl: 'http://x/',
    finalUrl: 'http://x/login',
    status: 200,
    redirects: [],
    framing: { allowed: false, reason: 'X-Frame-Options: SAMEORIGIN' },
    login: { detected: true, reason: '跳转链里出现登录相关地址' },
  })
  check(both.tone === 'error' && both.title.includes('禁止'), 'diagnosis: framing block wins over login signal')

  const fine = summarize({
    ok: true,
    requestedUrl: 'http://x/',
    finalUrl: 'http://x/',
    status: 200,
    redirects: [],
    framing: { allowed: true, reason: '未发现 X-Frame-Options / frame-ancestors 限制' },
    login: { detected: false, reason: '未检测到登录跳转' },
  })
  check(fine.tone === 'ok', 'diagnosis: healthy page is ok')

  const failed = summarize({ ok: false, code: 'fetch-failed', message: '无法从 DSH 宿主机访问该地址' })
  check(failed.tone === 'error' && failed.lines[0].includes('无法'), 'diagnosis: unreachable host is an error')
  const empty = summarize(null)
  check(empty.tone === 'error' && empty.title.includes('没有完成'), 'diagnosis: missing payload is handled')
}

/* ---- 7. login bridge helpers (pure) + bundled wiring ---- */
const bridgeBannerText = qrTest.bridgeBannerText
const bridgeCanTarget = qrTest.bridgeCanTarget
check(typeof bridgeBannerText === 'function', 'client exposes bridge banner text for smoke tests')
check(typeof bridgeCanTarget === 'function', 'client exposes bridge target guard for smoke tests')

if (typeof bridgeBannerText === 'function' && typeof bridgeCanTarget === 'function') {
  check(bridgeBannerText(null) === '登录桥未启用', 'bridge: inactive banner text')
  const activeText = bridgeBannerText({ active: true, source: 'safari', cookieCount: 12 })
  check(activeText.includes('Safari') && activeText.includes('12'), 'bridge: safari banner reports cookie count')
  const manualText = bridgeBannerText({ active: true, source: 'manual', cookieCount: 3 })
  check(manualText.includes('手动 Cookie'), 'bridge: manual banner names the source')
  check(bridgeCanTarget('http://127.0.0.1:5173/app') === true, 'bridge: http target accepted')
  check(bridgeCanTarget('https://example.com/') === true, 'bridge: https target accepted')
  check(bridgeCanTarget('dsh-app://app/pocket-h5/demo.html') === false, 'bridge: dsh-app target rejected')
  check(bridgeCanTarget('about:blank') === false, 'bridge: about:blank rejected')
  check(bridgeCanTarget('') === false, 'bridge: empty target rejected')
}

/* ---- 8. device bezel geometry (user-provided iPhone frame) ---- */
const bezel = qrTest.bezelMetrics
check(bezel && typeof bezel === 'object', 'client exposes the device bezel geometry for smoke tests')
if (bezel) {
  check(bezel.portrait.screenW === 402 && bezel.portrait.screenH === 874, 'bezel: screen opening is 402x874 logical px')
  check(Math.abs(bezel.portrait.outerW - 439.3333) < 0.01, `bezel: portrait outer width (${bezel.portrait.outerW})`)
  check(Math.abs(bezel.portrait.outerH - 905.6667) < 0.01, `bezel: portrait outer height (${bezel.portrait.outerH})`)
  const right = bezel.portrait.outerW - bezel.portrait.screenX - bezel.portrait.screenW
  const bottom = bezel.portrait.outerH - bezel.portrait.screenY - bezel.portrait.screenH
  check(Math.abs(right - 18.6666) < 0.01 && Math.abs(bottom - 15.6667) < 0.01, 'bezel: portrait side/bottom margins')
  check(bezel.landscape.outerW === bezel.portrait.outerH && bezel.landscape.outerH === bezel.portrait.outerW, 'bezel: landscape outer box is the rotated portrait box')
  check(bezel.landscape.screenW === 874 && bezel.landscape.screenH === 402, 'bezel: landscape screen opening is rotated')
  check(bezel.radius > 0, 'bezel: screen corner radius is provided')
}

/* ---- 9. generated assets are present and plausible ---- */
const source = await readFile(bundlePath, 'utf8')
check(source.includes(':host {'), 'generated CSS carries the :host scope')
check(source.includes('data-pocket-h5-style'), 'panel injects its own shadow-root style tag')
check(!source.includes('<use href'), 'no unresolved SVG <use> references')
check(!source.includes("require('@deepseek-ai/") && !source.includes('require("@deepseek-ai/'), 'no Harness Client package imports')
check(!source.includes('document.head'), 'panel does not write global document.head styles')
check(source.includes('srcdoc') === false, 'demo is served by URL, not srcdoc')
check(source.includes('QR_MODULE_FACTORIES'), 'vendored QR modules are bundled into the client')
check(source.includes('id="qrButton"') || source.includes("button.id = 'qrButton'"), 'QR button is created in the panel')
check(source.includes('cancelAnimationFrame(pocketAnimationFrame)'), 'dispose cancels the pending resize animation frame')
check(source.includes('面板版不会修改系统或浏览器代理'), 'proxy hint matches the panel behaviour')
check(source.includes('id = \'diagnoseButton\''), 'diagnosis button is created in the panel')
check(source.includes('summarizeProbe'), 'diagnosis summarizer is bundled')
check(source.includes('在系统浏览器打开 H5'), 'external-open button names the system browser')
check(source.includes('需要登录的页面'), 'help dialog explains login and framing limits')
check(source.includes("button.id = 'bridgeButton'"), 'login-bridge button is created in the panel')
check(source.includes('bridgeBanner'), 'login-bridge banner is bundled')
check(source.includes('function pocketPreviewTarget'), 'bridged preview resolves back to the real target')
check(source.includes('window.pocketBridge'), 'navigation is bridge-aware (refresh keeps the proxy)')
check(source.includes('完全磁盘访问'), 'permission guidance for Safari cookies is included')
check(source.includes('PANEL_THEME_CSS'), 'FlowPilot-style appearance layer is bundled')
check(source.includes('light-dark('), 'appearance tokens use light-dark() for dark mode')
check(source.includes('ph-topbar'), 'brand/status/actions are moved into a top bar')
check(source.includes('grid-template-columns: 300px minmax(0, 1fr)'), 'workspace uses the sidebar + canvas card layout')
check(source.includes('mountPanelTheme'), 'appearance layer is mounted with the panel')
check(source.includes('data:image/webp;base64,'), 'device bezel image is inlined into the bundle')
check(source.includes('POCKET_BEZEL.portrait'), 'device geometry is bezel-based, not a hand-drawn frame')
check(source.includes('--p-bezel-image'), 'theme layer paints the bezel as the phone background')
check(source.includes('border-radius: 0 !important'), 'screen is rectangular; the bezel overlay clips the corners')
check(source.includes('class="status-time"'), 'status bar uses the Apple-standard time element')
check(source.includes('viewBox="0 0 18 12"'), 'status bar signal icon uses the standard 18x12 geometry')
check(source.includes('cy="11.4"'), 'status bar Wi-Fi icon uses the standard arcs + dot')
check(source.includes('21 * state.battery'), 'battery fill width matches the iOS battery body')
check(source.includes('width: 134px'), 'home indicator uses the standard 134px width')
check(source.includes('className = \'ph-help\''), 'sidebar explanations are moved into circular ? buttons')
check(source.includes('.ph-tip'), 'help buttons show a styled hover tooltip')
check(source.includes("settings-section .setting-hint"), 'secondary hint paragraphs are hidden from the layout')
check(source.includes('data-tip-from'), 'help tooltips can append live status text')
check(source.includes('--p-bezel-mask'), 'rectangular page is clipped to the bezel silhouette')
check(source.includes('POCKET_BEZEL_MASK_LANDSCAPE'), 'landscape silhouette is bundled too')
check(source.includes('mask-size: 100% 100%'), 'silhouette mask is stretched to the phone box')
check(source.includes('SF Pro Text'), 'status bar text uses the SF Pro system font stack')
check(source.includes('ph-right'), 'top bar groups URL + actions on the right edge')
check(source.includes('flex-direction: row !important'), 'brand mark and name stay on one row')
check(source.includes('.ph-brand .brand-sub'), 'the redundant H5 preview pill is hidden')

if (failures.length > 0) {
  console.error(`\n${failures.length} client smoke check(s) failed`)
  process.exit(1)
}
console.log('\nall client smoke checks passed')
