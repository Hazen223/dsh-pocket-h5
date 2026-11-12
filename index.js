/**
 * Host half of the Pocket H5 preview bundle.
 *
 * It serves the demo page (`ui/demo.html`) on the harness web server so the
 * panel can embed it in an iframe from the same origin. Everything else —
 * the Shadow DOM workbench and its slot registrations — lives in `client.js`.
 *
 * @module
 */
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

/** Loader row / sidebar entry id shared with the Client half. */
export const name = 'pocket-h5'

/** The demo page needs the harness HTTP server to serve it. */
export const inject = ['webServer']

/** Prefix route owned by this bundle. */
const ROUTE_PATH = '/pocket-h5'

/** Readable paths that resolve to the bundled demo page. */
const DEMO_PATHS = new Set([`${ROUTE_PATH}/demo.html`, `${ROUTE_PATH}/demo`])

/** Host metrics endpoint: display physical size for true-size 100% preview. */
const DISPLAY_PATH = `${ROUTE_PATH}/display.json`

/** Embed diagnosis endpoint: why a preview URL cannot show (framing / login). */
const PROBE_PATH = `${ROUTE_PATH}/probe.json`
const PROBE_MAX_REDIRECTS = 5
const PROBE_TIMEOUT_MS = 6000

const runFile = promisify(execFile)

/**
 * CoreGraphics display probe (macOS only).
 *
 * The upstream Electron app shipped an Objective-C helper reading
 * `CGDisplayScreenSize` so `100%` means real device size. A browser page cannot
 * read that, so the Host does it once here: width in mm + current mode width in
 * CSS pixels (CoreGraphics reports the display mode, which equals browser CSS
 * pixels for Retina "looks like" modes). The Client turns it into
 * `cssPixelsPerInch`, matching the shape the upstream app.js already consumes.
 */
const DISPLAY_PROBE = `
import ctypes, json
cg = ctypes.CDLL('/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics')
class CGSize(ctypes.Structure):
    _fields_ = [('width', ctypes.c_double), ('height', ctypes.c_double)]
cg.CGGetActiveDisplayList.argtypes = [ctypes.c_uint32, ctypes.POINTER(ctypes.c_uint32), ctypes.POINTER(ctypes.c_uint32)]
cg.CGGetActiveDisplayList.restype = ctypes.c_int32
cg.CGDisplayScreenSize.argtypes = [ctypes.c_uint32]
cg.CGDisplayScreenSize.restype = CGSize
cg.CGDisplayPixelsWide.argtypes = [ctypes.c_uint32]
cg.CGDisplayPixelsWide.restype = ctypes.c_size_t
cg.CGDisplayPixelsHigh.argtypes = [ctypes.c_uint32]
cg.CGDisplayPixelsHigh.restype = ctypes.c_size_t
ids = (ctypes.c_uint32 * 16)()
count = ctypes.c_uint32(0)
if cg.CGGetActiveDisplayList(16, ids, ctypes.byref(count)) != 0:
    raise SystemExit(1)
out = []
for index in range(count.value):
    display = ids[index]
    size = cg.CGDisplayScreenSize(display)
    if size.width <= 0 or size.height <= 0:
        continue
    out.append({
        'id': int(display),
        'widthMm': round(size.width, 4),
        'heightMm': round(size.height, 4),
        'pixelWidth': int(cg.CGDisplayPixelsWide(display)),
        'pixelHeight': int(cg.CGDisplayPixelsHigh(display)),
    })
print(json.dumps(out))
`

/** A URL whose redirect/path looks like a login gate. */
function looksLikeLogin(url) {
  try {
    const parsed = new URL(url)
    const haystack = (parsed.pathname + parsed.search).toLowerCase()
    return /(^|[/?&=._-])(login|signin|sign-in|sso|oauth|authorize|passport|cas|auth)([/?&=._-]|$)/.test(haystack)
  } catch {
    return false
  }
}

/**
 * Judge whether the target response forbids being framed by the panel.
 *
 * The panel page origin is `dsh-app://app` (browser surface: the loopback HTTP
 * origin), so any http(s) target is cross-origin: `SAMEORIGIN`/`DENY` and a
 * `frame-ancestors` list that does not include that origin all block embedding.
 * Absence of a header does not guarantee rendering (JS bust-out still possible).
 */
function assessFraming(headers) {
  const xFrameOptions = String(headers.get('x-frame-options') ?? '').toLowerCase()
  const csp = String(headers.get('content-security-policy') ?? '')
  const frameAncestorsRaw = (csp.match(/(?:^|;)\s*frame-ancestors\s+([^;]+)/i) ?? [])[1] ?? ''
  const frameAncestors = frameAncestorsRaw.trim().toLowerCase()
  if (xFrameOptions.includes('deny')) {
    return { allowed: false, reason: 'X-Frame-Options: DENY', xFrameOptions, frameAncestors }
  }
  if (xFrameOptions.includes('sameorigin')) {
    return { allowed: false, reason: 'X-Frame-Options: SAMEORIGIN（面板是 dsh-app://app，属于跨源）', xFrameOptions, frameAncestors }
  }
  if (frameAncestors !== '') {
    if (frameAncestors.includes("'none'") || frameAncestors === 'none') {
      return { allowed: false, reason: "CSP frame-ancestors 'none'", xFrameOptions, frameAncestors }
    }
    if (frameAncestors.includes('*') || frameAncestors.includes('dsh-app:')) {
      return { allowed: true, reason: 'CSP frame-ancestors 允许 dsh-app://app', xFrameOptions, frameAncestors }
    }
    return {
      allowed: false,
      reason: 'CSP frame-ancestors 未包含 dsh-app://app：' + frameAncestors.slice(0, 120),
      xFrameOptions,
      frameAncestors,
    }
  }
  return { allowed: true, reason: '未发现 X-Frame-Options / frame-ancestors 限制', xFrameOptions, frameAncestors }
}

/**
 * Probe a preview URL from the Host: status, redirect chain, framing policy and
 * whether it redirects to a login gate. Only response headers are read (the body
 * is cancelled), no cookies/credentials are sent, redirects and time are bounded.
 * @param {string} rawUrl - absolute http(s) URL from the panel
 */
async function probeUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || rawUrl === '' || rawUrl.length > 2048) {
    return { ok: false, code: 'invalid-url', message: '地址为空或过长' }
  }
  let target
  try {
    target = new URL(rawUrl)
  } catch {
    return { ok: false, code: 'invalid-url', message: '地址格式有误' }
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return { ok: false, code: 'invalid-protocol', message: '只诊断 http/https 地址' }
  }
  if (target.username || target.password) {
    return { ok: false, code: 'invalid-url', message: '地址不能包含账号密码' }
  }

  const deadline = Date.now() + PROBE_TIMEOUT_MS
  const redirects = []
  let current = target.href
  let response = null
  for (let hop = 0; hop <= PROBE_MAX_REDIRECTS; hop += 1) {
    let res
    try {
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        cache: 'no-store',
        signal: AbortSignal.timeout(Math.max(1200, deadline - Date.now())),
      })
    } catch (error) {
      const name = error && typeof error.name === 'string' ? error.name : 'Error'
      return {
        ok: false,
        code: name === 'TimeoutError' ? 'timeout' : 'fetch-failed',
        message:
          name === 'TimeoutError'
            ? '诊断超时：目标地址没有在 6 秒内响应'
            : '无法从 DSH 宿主机访问该地址（服务未启动、端口不对或网络不通）',
      }
    }
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      await res.body?.cancel()
      if (location === null || hop === PROBE_MAX_REDIRECTS) {
        response = res
        break
      }
      const next = new URL(location, current).href
      redirects.push({ status: res.status, from: current, to: next })
      current = next
      continue
    }
    response = res
    break
  }
  if (response === null) {
    return { ok: false, code: 'too-many-redirects', message: `跳转超过 ${PROBE_MAX_REDIRECTS} 次` }
  }

  const framing = assessFraming(response.headers)
  const loginRedirected = redirects.some((item) => looksLikeLogin(item.to)) || looksLikeLogin(current)
  const status = response.status
  const requiresLogin = loginRedirected || status === 401 || status === 403
  await response.body?.cancel()
  return {
    ok: true,
    requestedUrl: target.href,
    finalUrl: current,
    status,
    redirects,
    framing,
    login: {
      detected: requiresLogin,
      redirected: loginRedirected,
      reason: loginRedirected
        ? '跳转链里出现登录相关地址'
        : status === 401 || status === 403
          ? `目标返回 HTTP ${status}，通常表示需要登录或无权限`
          : '未检测到登录跳转',
    },
  }
}

/** Cached probe result: display geometry barely changes; 30s avoids repeated spawns. */
let displayCache = null

/**
 * Read the physical display list once per cache window.
 * @returns {Promise<Array<{id:number,widthMm:number,heightMm:number,pixelWidth:number,pixelHeight:number}>>}
 */
async function readDisplays() {
  if (process.platform !== 'darwin') return []
  const now = Date.now()
  if (displayCache !== null && now - displayCache.at < 30000) return displayCache.value
  let value = []
  try {
    const { stdout } = await runFile('/usr/bin/python3', ['-c', DISPLAY_PROBE], { timeout: 4000 })
    const parsed = JSON.parse(stdout)
    if (Array.isArray(parsed)) value = parsed
  } catch {
    // No python3 (or CoreGraphics unavailable): the Client falls back to the
    // browser estimate plus the built-in ruler calibration.
    value = []
  }
  displayCache = { at: now, value }
  return value
}

/**
 * Absolute path of the bundled demo page, resolved from this module rather
 * than from `process.cwd()`: the harness may be started from any directory.
 */
const DEMO_FILE = fileURLToPath(new URL('./ui/demo.html', import.meta.url))

/** A UTF-8 plain-text response; HEAD responses carry headers but no body. */
function sendPlain(res, status, message, method, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  })
  if (method === 'HEAD') res.end()
  else res.end(message)
}

/**
 * Answer `/pocket-h5/*` requests.
 *
 * Only GET/HEAD are accepted, and only the demo page is exposed. The request
 * path never touches the filesystem: it is parsed against a fixed base, its
 * percent-encoding is validated, and traversal segments are rejected. The
 * demo file path is a module-relative constant.
 */
async function handler(req, res) {
  let method = 'GET'
  try {
    method = String(req.method ?? 'GET').toUpperCase()
    if (method !== 'GET' && method !== 'HEAD') {
      sendPlain(res, 405, 'Method Not Allowed', method, { Allow: 'GET, HEAD' })
      return
    }

    let pathname
    try {
      pathname = decodeURIComponent(
        new URL(String(req.url ?? '/'), 'http://x').pathname,
      )
    } catch {
      // Malformed percent-encoding: reject instead of guessing at a path.
      sendPlain(res, 400, 'Bad Request', method)
      return
    }

    // NUL, backslashes and `..` segments are never part of an allowed route.
    if (
      pathname.includes('\0') ||
      pathname.includes('\\') ||
      /(^|\/)\.\.(\/|$)/.test(pathname)
    ) {
      sendPlain(res, 400, 'Bad Request', method)
      return
    }

    if (pathname === PROBE_PATH) {
      let rawUrl = ''
      try {
        rawUrl = new URL(String(req.url ?? '/'), 'http://x').searchParams.get('url') ?? ''
      } catch {
        rawUrl = ''
      }
      const result = await probeUrl(rawUrl)
      const body = JSON.stringify(result)
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Length': Buffer.byteLength(body),
      })
      if (method === 'HEAD') res.end()
      else res.end(body)
      return
    }

    if (pathname === DISPLAY_PATH) {
      const displays = await readDisplays()
      const body = JSON.stringify({ ok: displays.length > 0, platform: process.platform, displays })
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Length': Buffer.byteLength(body),
      })
      if (method === 'HEAD') res.end()
      else res.end(body)
      return
    }

    if (!DEMO_PATHS.has(pathname)) {
      sendPlain(res, 404, 'Not Found', method)
      return
    }

    let body
    try {
      body = await readFile(DEMO_FILE)
    } catch {
      // Do not echo the filesystem error (path, stack) to the client.
      sendPlain(res, 500, 'Internal Server Error', method)
      return
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': body.length,
    })
    if (method === 'HEAD') res.end()
    else res.end(body)
  } catch {
    if (res.headersSent === true) res.end()
    else sendPlain(res, 500, 'Internal Server Error', method)
  }
}

/**
 * Register the demo-page route on the harness web server.
 * @param {object} ctx - Cordis context with `webServer` injected.
 * @returns {() => void} disposer removing the route
 */
export function apply(ctx) {
  const route = { kind: 'prefix', path: ROUTE_PATH, handler }
  return ctx.effect(
    () => ctx.webServer.register(route),
    'pocket-h5: demo page route',
  )
}
