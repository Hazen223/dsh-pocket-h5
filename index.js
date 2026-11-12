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
