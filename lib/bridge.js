/**
 * 登录桥底层实现：Safari Cookie 读取 + 只监听 127.0.0.1 的反向代理。
 *
 * - 纯 Node 内置模块，无第三方依赖；
 * - Cookie 只存在于内存：不写盘、不出现在 stdout/stderr 的任何日志里；
 * - 代理只转发到启动时给定的 target origin，Host 头不参与路由。
 *
 * Safari 二进制 Cookie 文件在真实环境里有两种常见布局（Apple 实际写出的
 * 布局，以及文档里常被简写的布局），解析器都接受：
 *
 *  1) 真实 Safari：文件头的每页表项是「页字节长度」，页从页表之后顺序排列，
 *     页首 4 字节固定为签名 `00 00 01 00`；cookie 记录固定头 56 字节
 *     （domain/name/path/value/comment/port-list 各 4 字节，随后 expiry、
 *     creation 两个 8 字节 Cocoa 浮点）。
 *  2) 简化文档布局：文件头的每页表项是「页偏移」，页首 4 字节是页长度，
 *     cookie 记录固定头 52 字节（没有 port-list 字段）。
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import { connect as netConnect, isIP } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { connect as tlsConnect } from 'node:tls'

/** Safari 真实 Cookie 文件位置（读取需要「完全磁盘访问权限」）。 */
const SAFARI_COOKIE_PATH = path.join(
  os.homedir(),
  'Library',
  'Containers',
  'com.apple.Safari',
  'Data',
  'Library',
  'Cookies',
  'Cookies.binarycookies',
)

const COOKIE_FILE_MAGIC = 'cook'
const MAX_COOKIE_PAGES = 10000
/** Cocoa/CFAbsoluteTime 与 Unix 纪元的秒差（2001-01-01T00:00:00Z）。 */
const COCOA_EPOCH_SECONDS = 978307200
/** 页头：4 字节签名/长度 + 4 字节 cookie 数。 */
const PAGE_HEADER_SIZE = 8
/** 简化布局的记录固定头。 */
const RECORD_HEADER_COMPACT = 52
/** 真实 Safari 的记录固定头（比简化布局多一个 4 字节 port-list 偏移）。 */
const RECORD_HEADER_SAFARI = 56
/** 真实 Safari 页首签名（字节 `00 00 01 00`，按小端读为 0x00010000）。 */
const SAFARI_PAGE_SIGNATURE_LE = 0x00010000
const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true })

/** 逐跳（hop-by-hop）请求头：代理不转发，由本地连接自己协商。 */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

/* ------------------------------------------------------------------ *
 * Cookie 形状
 * ------------------------------------------------------------------ */

/**
 * @typedef {object} Cookie
 * @property {string} name
 * @property {string} value
 * @property {string} domain 可能以 `.` 开头
 * @property {string} path
 * @property {boolean} secure
 * @property {boolean} httpOnly
 * @property {number} expires Unix 秒级时间戳；0 表示 session cookie
 */

/** 补齐 Cookie 字段，保证下游拿到固定形状。 */
function normalizeCookie(cookie) {
  const source = cookie !== null && typeof cookie === 'object' ? cookie : {}
  const expires = Number(source.expires)
  return {
    name: String(source.name ?? ''),
    value: String(source.value ?? ''),
    domain: String(source.domain ?? ''),
    path: String(source.path ?? '/'),
    secure: Boolean(source.secure),
    httpOnly: Boolean(source.httpOnly),
    expires: Number.isFinite(expires) && expires > 0 ? expires : 0,
  }
}

function normalizeCookieList(cookies) {
  if (!Array.isArray(cookies)) return []
  return cookies.map(normalizeCookie)
}

/* ------------------------------------------------------------------ *
 * Safari binarycookies 解析
 * ------------------------------------------------------------------ */

/**
 * 解析 Safari `Cookies.binarycookies` 内容。
 *
 * @param {Buffer|Uint8Array} buffer
 * @returns {Cookie[]} expires 为 Unix 秒（0 = session）
 * @throws {Error} 格式非法时抛出带简短原因的错误
 */
export function parseBinaryCookies(buffer) {
  const data = asBuffer(buffer)
  if (data.length < 8) throw new Error('binarycookies: 文件头不完整')
  if (data.toString('latin1', 0, 4) !== COOKIE_FILE_MAGIC) {
    throw new Error('binarycookies: 缺少 "cook" 魔数')
  }
  const pageCount = data.readUInt32BE(4)
  if (pageCount === 0) throw new Error('binarycookies: cookie 页数为 0')
  if (pageCount > MAX_COOKIE_PAGES) {
    throw new Error(`binarycookies: cookie 页数异常（${pageCount}）`)
  }
  const tableEnd = 8 + pageCount * 4
  if (tableEnd > data.length) throw new Error('binarycookies: 页表不完整')
  const entries = []
  for (let i = 0; i < pageCount; i += 1) {
    entries.push(data.readUInt32BE(8 + i * 4))
  }

  // 先按真实 Safari 布局（表项 = 页长度）解析，失败再按简化布局（表项 = 页偏移）。
  const bySize = parsePagesFromSizes(data, entries, tableEnd)
  if (bySize.cookies !== undefined) return bySize.cookies
  const byOffset = parsePagesFromOffsets(data, entries, tableEnd)
  if (byOffset.cookies !== undefined) return byOffset.cookies
  // 布局结构不符的错误信息价值低；优先报告页内记录的问题（如缺少 NUL）。
  const reason = (bySize.structural === false && bySize.error) ||
    (byOffset.structural === false && byOffset.error) ||
    bySize.error || byOffset.error || '未知原因'
  throw new Error(`binarycookies: 无法解析页结构（${reason}）`)
}

function asBuffer(input) {
  if (Buffer.isBuffer(input)) return input
  if (input instanceof Uint8Array) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength)
  }
  if (input instanceof ArrayBuffer) return Buffer.from(input)
  throw new Error('binarycookies: 需要 Buffer 或 Uint8Array 输入')
}

/** 真实 Safari 布局：表项是每页字节长度，页从页表之后顺序排列。 */
function parsePagesFromSizes(data, entries, tableEnd) {
  const pages = []
  let offset = tableEnd
  for (let i = 0; i < entries.length; i += 1) {
    const size = entries[i]
    if (size < PAGE_HEADER_SIZE || offset + size > data.length) {
      return { error: `第 ${i} 页长度 ${size} 越界`, structural: true }
    }
    if (data.readUInt32LE(offset) !== SAFARI_PAGE_SIGNATURE_LE) {
      return { error: `第 ${i} 页缺少 Safari 页头签名`, structural: true }
    }
    pages.push({ start: offset, size })
    offset += size
  }
  return collectPageCookies(data, pages)
}

/** 简化文档布局：表项是每页偏移，页首 4 字节是页长度。 */
function parsePagesFromOffsets(data, entries, tableEnd) {
  const pages = []
  let previousEnd = tableEnd
  for (let i = 0; i < entries.length; i += 1) {
    const start = entries[i]
    if (start < tableEnd || start < previousEnd) {
      return { error: `第 ${i} 页偏移 ${start} 越界或重叠`, structural: true }
    }
    if (start + PAGE_HEADER_SIZE > data.length) {
      return { error: `第 ${i} 页偏移 ${start} 越界`, structural: true }
    }
    let size = i + 1 < entries.length ? entries[i + 1] - start : data.length - start
    const declared = data.readUInt32LE(start)
    if (
      declared >= PAGE_HEADER_SIZE &&
      declared <= size &&
      start + declared <= data.length
    ) {
      size = declared
    }
    if (size < PAGE_HEADER_SIZE) return { error: `第 ${i} 页长度非法`, structural: true }
    pages.push({ start, size })
    previousEnd = start + size
  }
  return collectPageCookies(data, pages)
}

function collectPageCookies(data, pages) {
  const cookies = []
  for (const page of pages) {
    try {
      cookies.push(...parsePage(data, page.start, page.size))
    } catch (error) {
      return { error: error.message, structural: false }
    }
  }
  return { cookies }
}

function parsePage(data, pageStart, pageSize) {
  const pageEnd = pageStart + pageSize
  const cookieCount = data.readUInt32LE(pageStart + 4)
  const offsetTableSize = cookieCount * 4
  if (PAGE_HEADER_SIZE + offsetTableSize > pageSize) {
    throw new Error(`cookie 数 ${cookieCount} 超出页长度 ${pageSize}`)
  }
  const cookies = []
  for (let i = 0; i < cookieCount; i += 1) {
    const recordOffset = data.readUInt32LE(pageStart + PAGE_HEADER_SIZE + i * 4)
    cookies.push(parseCookieRecord(data, pageStart, recordOffset, pageEnd))
  }
  return cookies
}

function parseCookieRecord(data, pageStart, recordOffset, pageEnd) {
  if (recordOffset < PAGE_HEADER_SIZE) {
    throw new Error(`cookie 记录偏移 ${recordOffset} 越界`)
  }
  const start = pageStart + recordOffset
  if (start + RECORD_HEADER_COMPACT > pageEnd) {
    throw new Error(`cookie 记录偏移 ${recordOffset} 越界`)
  }
  const size = data.readUInt32LE(start)
  if (size < RECORD_HEADER_COMPACT) {
    throw new Error(`cookie 记录长度 ${size} 过小`)
  }
  if (start + size > pageEnd) {
    throw new Error(`cookie 记录长度 ${size} 超出所在页`)
  }

  const readField = (at) => data.readUInt32LE(start + at)
  const flags = readField(8)
  const domainOffset = readField(16)
  const nameOffset = readField(20)
  const pathOffset = readField(24)
  const valueOffset = readField(28)
  const commentOffset = readField(32)

  // 记录固定头长度：真实 Safari 的字符串从 56 开始，简化布局从 52 开始。
  const stringOffsets = [domainOffset, nameOffset, pathOffset, valueOffset]
    .filter((offset) => offset !== 0)
  const minStringOffset = stringOffsets.length === 0
    ? RECORD_HEADER_SAFARI
    : Math.min(...stringOffsets)
  const headerSize = minStringOffset >= RECORD_HEADER_SAFARI
    ? RECORD_HEADER_SAFARI
    : RECORD_HEADER_COMPACT
  if (size < headerSize) throw new Error(`cookie 记录长度 ${size} 小于固定头`)

  // expiry 在固定头之后：真实布局 40，简化布局 36（creation 紧随其后，忽略）。
  const expiryOffset = headerSize === RECORD_HEADER_SAFARI ? 40 : 36
  const expiry = data.readDoubleLE(start + expiryOffset)

  const domain = readRecordString(data, start, size, domainOffset, 'domain')
  const name = readRecordString(data, start, size, nameOffset, 'name')
  const cookiePath = readRecordString(data, start, size, pathOffset, 'path')
  const value = readRecordString(data, start, size, valueOffset, 'value')
  // comment 不返回，但同样校验，保证越界/不可解码的文件被拒绝。
  readRecordString(data, start, size, commentOffset, 'comment')

  return {
    name,
    value,
    domain,
    path: cookiePath,
    secure: (flags & 1) !== 0,
    httpOnly: (flags & 4) !== 0,
    expires: cocoaSecondsToUnix(expiry),
  }
}

function readRecordString(data, recordStart, recordSize, offset, label) {
  if (offset === 0) return ''
  if (offset >= recordSize) {
    throw new Error(`${label} 偏移 ${offset} 超出记录范围`)
  }
  const start = recordStart + offset
  const end = recordStart + recordSize
  const terminator = data.indexOf(0, start)
  if (terminator === -1 || terminator >= end) {
    throw new Error(`${label} 字符串缺少 NUL 结尾`)
  }
  try {
    return UTF8_DECODER.decode(data.subarray(start, terminator))
  } catch {
    throw new Error(`${label} 字符串不是合法 UTF-8`)
  }
}

function cocoaSecondsToUnix(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0
  return Math.round(seconds + COCOA_EPOCH_SECONDS)
}

/* ------------------------------------------------------------------ *
 * Safari Cookie 文件读取
 * ------------------------------------------------------------------ */

function expandHome(filePath) {
  if (filePath === '~') return os.homedir()
  if (filePath.startsWith('~/')) return path.join(os.homedir(), filePath.slice(2))
  return filePath
}

/**
 * 读取 Safari 的 Cookie 文件。
 *
 * @param {{ path?: string }} [options] 测试可用 `path` 覆盖默认位置
 * @returns {Promise<
 *   { ok: true, cookies: Cookie[] } |
 *   { ok: false, code: 'safari-permission'|'safari-missing'|'safari-parse-failed', message: string }
 * >}
 */
export async function readSafariCookies(options = {}) {
  const override = options !== null && typeof options === 'object' ? options.path : undefined
  const filePath = typeof override === 'string' && override !== ''
    ? expandHome(override)
    : SAFARI_COOKIE_PATH

  let data
  try {
    data = await readFile(filePath)
  } catch (error) {
    const code = error?.code
    if (code === 'EACCES' || code === 'EPERM') {
      return {
        ok: false,
        code: 'safari-permission',
        message:
          `没有权限读取 Safari Cookie 文件（${code}）。需要在「系统设置 → 隐私与安全性 → ` +
          '完全磁盘访问权限」里给 DSH 授权后重启 DSH。',
      }
    }
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return {
        ok: false,
        code: 'safari-missing',
        message: `找不到 Safari Cookie 文件：${filePath}`,
      }
    }
    return {
      ok: false,
      code: 'safari-parse-failed',
      message: `读取 Safari Cookie 文件失败（${code ?? '未知错误'}）。`,
    }
  }

  try {
    return { ok: true, cookies: parseBinaryCookies(data) }
  } catch (error) {
    return {
      ok: false,
      code: 'safari-parse-failed',
      message: `解析 Safari Cookie 文件失败：${error?.message ?? '未知原因'}`,
    }
  }
}

/* ------------------------------------------------------------------ *
 * Cookie 匹配与合并
 * ------------------------------------------------------------------ */

function stripDotPrefix(domain) {
  return String(domain).trim().toLowerCase().replace(/^\.+/, '').replace(/\.+$/, '')
}

function domainMatches(cookieDomain, hostname) {
  const domain = stripDotPrefix(cookieDomain)
  if (domain === '') return false
  if (domain === hostname) return true
  // IP 地址只做精确匹配，避免 "0.0.1" 之类的后缀误判。
  if (isIP(hostname) !== 0) return false
  return hostname.endsWith(`.${domain}`)
}

function pathMatches(cookiePath, targetPath) {
  const prefix = cookiePath === '' ? '/' : cookiePath
  if (prefix === '/') return true
  return targetPath.startsWith(prefix)
}

/**
 * 过滤出适用于 targetUrl 的 cookie：host 后缀匹配 + path 前缀 + 未过期。
 *
 * @param {Cookie[]} cookies
 * @param {string} targetUrl
 * @returns {Cookie[]}
 */
export function filterCookiesForUrl(cookies, targetUrl) {
  const url = new URL(String(targetUrl))
  const hostname = url.hostname.toLowerCase()
  const targetPath = url.pathname === '' ? '/' : url.pathname
  const nowSeconds = Date.now() / 1000
  const result = []
  if (!Array.isArray(cookies)) return result
  for (const raw of cookies) {
    const cookie = normalizeCookie(raw)
    if (cookie.name === '' || cookie.domain === '') continue
    if (!domainMatches(cookie.domain, hostname)) continue
    if (!pathMatches(cookie.path, targetPath)) continue
    if (cookie.expires !== 0 && cookie.expires <= nowSeconds) continue
    result.push(cookie)
  }
  return result
}

/** `Cookie` 头只允许可见 latin1 字符：去掉会在上游抛错的 value。 */
function isCookieHeaderSafe(text) {
  for (const character of text) {
    const code = character.codePointAt(0)
    if (code < 0x20 || code > 0xff || code === 0x7f) return false
  }
  return true
}

function parseCookieHeader(header) {
  if (typeof header !== 'string' || header.trim() === '') return []
  const pairs = []
  for (const part of header.split(';')) {
    const text = part.trim()
    if (text === '') continue
    const equals = text.indexOf('=')
    if (equals <= 0) continue
    const name = text.slice(0, equals).trim()
    if (name === '') continue
    pairs.push({ name, value: text.slice(equals + 1).trim() })
  }
  return pairs
}

/**
 * 浏览器 Cookie 头 + jar 合并成发给上游的 Cookie 头：jar 优先，
 * 浏览器里 jar 没有的名字也带上。
 *
 * @param {Cookie[]} jar
 * @param {string|undefined|null} browserCookieHeader
 * @returns {string}
 */
export function mergeCookieHeader(jar, browserCookieHeader) {
  const merged = []
  const seen = new Set()
  if (Array.isArray(jar)) {
    for (const raw of jar) {
      const cookie = normalizeCookie(raw)
      if (cookie.name === '' || seen.has(cookie.name)) continue
      seen.add(cookie.name)
      merged.push(`${cookie.name}=${cookie.value}`)
    }
  }
  for (const pair of parseCookieHeader(browserCookieHeader)) {
    if (seen.has(pair.name)) continue
    seen.add(pair.name)
    merged.push(`${pair.name}=${pair.value}`)
  }
  return merged.join('; ')
}

/* ------------------------------------------------------------------ *
 * 本机反向代理
 * ------------------------------------------------------------------ */

/**
 * 启动一个只代理固定 target origin 的本机反向代理。
 *
 * @param {{ target: string, cookies?: Cookie[], timeoutMs?: number }} options
 * @returns {Promise<{
 *   origin: string,
 *   port: number,
 *   cookieCount: number,
 *   setCookies: (cookies: Cookie[]) => void,
 *   close: () => Promise<void>,
 * }>}
 */
export async function createBridge({ target, cookies = [], timeoutMs = 20000 } = {}) {
  let targetUrl
  try {
    targetUrl = new URL(String(target ?? ''))
  } catch {
    throw new Error('createBridge: target 不是合法 URL')
  }
  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    throw new Error('createBridge: target 必须是 http(s) URL')
  }
  if (targetUrl.username !== '' || targetUrl.password !== '') {
    throw new Error('createBridge: target 不能包含账号密码')
  }

  const targetOrigin = targetUrl.origin
  const isHttps = targetUrl.protocol === 'https:'
  const upstreamHost = targetUrl.hostname.replace(/^\[|\]$/g, '')
  const upstreamPort = targetUrl.port === ''
    ? (isHttps ? 443 : 80)
    : Number(targetUrl.port)
  const transport = isHttps ? https : http
  const requestTimeoutMs = Number.isFinite(timeoutMs) && timeoutMs > 0
    ? timeoutMs
    : 20000

  let jar = normalizeCookieList(cookies)
  const sockets = new Set()
  const upstreamRequests = new Set()
  let proxyOrigin = ''
  let closePromise = null

  function cookieUrlFor(upstreamPath) {
    return new URL(upstreamPath, targetOrigin)
  }

  function upstreamHeaders(reqHeaders, upstreamPath, preserveUpgrade) {
    const headers = {}
    for (const [rawKey, value] of Object.entries(reqHeaders)) {
      if (value === undefined) continue
      const key = rawKey.toLowerCase()
      if (key === 'host' || key === 'cookie') continue
      if (HOP_BY_HOP_HEADERS.has(key) && !(preserveUpgrade && (key === 'connection' || key === 'upgrade'))) {
        continue
      }
      if (key === 'origin' || key === 'referer') {
        headers[key] = rewriteProxyOrigin(String(value), proxyOrigin, targetOrigin)
        continue
      }
      headers[key] = value
    }
    headers.host = targetUrl.host

    const cookieUrl = cookieUrlFor(upstreamPath)
    const applicable = filterCookiesForUrl(jar, cookieUrl.href)
    const merged = mergeCookieHeader(applicable, reqHeaders.cookie)
    const wireSafe = wireSafeCookieHeader(merged)
    if (wireSafe !== '') headers.cookie = wireSafe
    return headers
  }

  function handleRequest(req, res) {
    const upstreamPath = requestPath(req.url)
    let headers
    try {
      headers = upstreamHeaders(req.headers, upstreamPath, false)
    } catch {
      failResponse(res, 502, 'Bad Gateway')
      return
    }

    let upstreamRequest
    try {
      upstreamRequest = transport.request({
        protocol: targetUrl.protocol,
        hostname: upstreamHost,
        port: upstreamPort,
        method: req.method,
        path: upstreamPath,
        headers,
        timeout: requestTimeoutMs,
      })
    } catch {
      failResponse(res, 502, 'Bad Gateway')
      return
    }
    upstreamRequests.add(upstreamRequest)
    upstreamRequest.on('close', () => upstreamRequests.delete(upstreamRequest))

    let responded = false
    const abortUpstream = () => upstreamRequest.destroy()

    upstreamRequest.on('error', () => {
      if (responded) {
        res.destroy()
        return
      }
      responded = true
      failResponse(res, 502, 'Bad Gateway')
    })
    upstreamRequest.on('timeout', () => {
      if (!responded) {
        responded = true
        failResponse(res, 504, 'Gateway Timeout')
      }
      upstreamRequest.destroy()
    })
    upstreamRequest.on('response', (upstreamResponse) => {
      if (responded) {
        upstreamResponse.destroy()
        return
      }
      responded = true
      try {
        forwardResponse(upstreamResponse, res)
      } catch {
        upstreamResponse.destroy()
        failResponse(res, 502, 'Bad Gateway')
      }
    })

    req.on('error', abortUpstream)
    res.on('close', () => {
      if (!res.writableEnded) abortUpstream()
    })
    req.pipe(upstreamRequest)
  }

  function forwardResponse(upstreamResponse, res) {
    const responseHeaders = {}
    for (const [rawKey, value] of Object.entries(upstreamResponse.headers)) {
      if (value === undefined) continue
      const key = rawKey.toLowerCase()
      if (key === 'x-frame-options') continue
      if (HOP_BY_HOP_HEADERS.has(key)) continue
      if (key === 'content-security-policy') {
        const remaining = stripFrameAncestors(value)
        if (remaining.length === 1) responseHeaders[key] = remaining[0]
        else if (remaining.length > 1) responseHeaders[key] = remaining
        continue
      }
      if (key === 'location') {
        responseHeaders[key] = rewriteLocation(String(value), targetOrigin, proxyOrigin)
        continue
      }
      if (key === 'set-cookie') {
        const rawCookies = Array.isArray(value) ? value : [value]
        const rewritten = []
        for (const raw of rawCookies) {
          rewritten.push(rewriteSetCookie(raw))
          absorbSetCookie(raw, targetUrl, jar)
        }
        responseHeaders[key] = rewritten
        continue
      }
      responseHeaders[key] = value
    }

    res.writeHead(upstreamResponse.statusCode ?? 502, responseHeaders)
    upstreamResponse.on('error', () => res.destroy())
    res.on('close', () => upstreamResponse.destroy())
    upstreamResponse.pipe(res)
  }

  function handleUpgrade(req, socket, head) {
    const upstreamPath = requestPath(req.url)
    let headers
    try {
      headers = upstreamHeaders(req.headers, upstreamPath, true)
    } catch {
      socket.destroy()
      return
    }

    const lines = [`${req.method} ${upstreamPath} HTTP/1.1`]
    for (const [key, value] of Object.entries(headers)) {
      const values = Array.isArray(value) ? value : [value]
      for (const single of values) lines.push(`${key}: ${single}`)
    }
    const headText = `${lines.join('\r\n')}\r\n\r\n`

    const upstreamSocket = isHttps
      ? tlsConnect({ host: upstreamHost, port: upstreamPort, servername: upstreamHost })
      : netConnect({ host: upstreamHost, port: upstreamPort })
    sockets.add(upstreamSocket)

    let connected = false
    const failUpgrade = () => {
      if (socket.destroyed) return
      try {
        socket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\nContent-Length: 0\r\n\r\n')
      } catch {
        socket.destroy()
      }
    }
    const connectTimer = setTimeout(() => {
      if (!connected) {
        failUpgrade()
        upstreamSocket.destroy()
      }
    }, requestTimeoutMs)
    connectTimer.unref?.()

    upstreamSocket.once(isHttps ? 'secureConnect' : 'connect', () => {
      connected = true
      clearTimeout(connectTimer)
      upstreamSocket.write(headText)
      if (head !== undefined && head.length > 0) upstreamSocket.write(head)
      upstreamSocket.pipe(socket)
      socket.pipe(upstreamSocket)
    })
    upstreamSocket.on('error', () => {
      clearTimeout(connectTimer)
      if (!connected) failUpgrade()
      socket.destroy()
      upstreamSocket.destroy()
    })
    socket.on('error', () => {
      clearTimeout(connectTimer)
      upstreamSocket.destroy()
    })
    socket.on('close', () => {
      sockets.delete(socket)
      upstreamSocket.destroy()
    })
    upstreamSocket.on('close', () => {
      sockets.delete(upstreamSocket)
      socket.destroy()
    })
  }

  const server = http.createServer(handleRequest)
  server.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })
  server.on('upgrade', handleUpgrade)
  // 监听后极少数错误（如 EMFILE）不写日志，避免把错误细节漏给页面。
  server.on('error', () => {})

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject)
      resolve()
    })
  })
  const address = server.address()
  const port = typeof address === 'object' && address !== null ? address.port : 0
  proxyOrigin = `http://127.0.0.1:${port}`

  function setCookies(nextCookies) {
    jar = normalizeCookieList(nextCookies)
  }

  function close() {
    if (closePromise !== null) return closePromise
    closePromise = new Promise((resolve) => {
      try {
        server.close(() => resolve())
      } catch {
        resolve()
      }
      server.closeAllConnections?.()
      for (const request of upstreamRequests) request.destroy()
      upstreamRequests.clear()
      for (const socket of sockets) socket.destroy()
      sockets.clear()
    })
    return closePromise
  }

  return {
    origin: proxyOrigin,
    port,
    get cookieCount() {
      return jar.length
    },
    setCookies,
    close,
  }
}

/* ------------------------------------------------------------------ *
 * 代理内部工具
 * ------------------------------------------------------------------ */

function requestPath(rawUrl) {
  const raw = typeof rawUrl === 'string' && rawUrl !== '' ? rawUrl : '/'
  if (raw.startsWith('/')) return raw
  try {
    const parsed = new URL(raw)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return '/'
  }
}

function rewriteProxyOrigin(value, proxyOrigin, targetOrigin) {
  if (value === proxyOrigin) return targetOrigin
  if (value.startsWith(`${proxyOrigin}/`)) {
    return `${targetOrigin}${value.slice(proxyOrigin.length)}`
  }
  return value
}

function rewriteLocation(value, targetOrigin, proxyOrigin) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    // 相对 Location 原样返回。
    return value
  }
  if (parsed.origin !== targetOrigin) return value
  return `${proxyOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`
}

/** 删除 CSP 里的 frame-ancestors 指令，保留其余 directive。 */
function stripFrameAncestors(value) {
  const policies = Array.isArray(value) ? value : [value]
  const remaining = []
  for (const policy of policies) {
    const directives = String(policy)
      .split(';')
      .map((directive) => directive.trim())
      .filter((directive) => directive !== '')
      .filter((directive) => directive.split(/\s+/)[0].toLowerCase() !== 'frame-ancestors')
    if (directives.length > 0) remaining.push(directives.join('; '))
  }
  return remaining
}

function wireSafeCookieHeader(header) {
  if (header === '') return ''
  const pairs = []
  for (const part of header.split(';')) {
    const text = part.trim()
    if (text === '' || !isCookieHeaderSafe(text)) continue
    pairs.push(text)
  }
  return pairs.join('; ')
}

function failResponse(res, status, message) {
  if (res.headersSent || res.writableEnded || res.destroyed) {
    res.destroy()
    return
  }
  const body = `${message}\n`
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

function parseSetCookie(raw) {
  const parts = String(raw).split(';')
  const pair = parts.shift() ?? ''
  const equals = pair.indexOf('=')
  const name = equals === -1 ? '' : pair.slice(0, equals).trim()
  const value = equals === -1 ? '' : pair.slice(equals + 1).trim()
  const attributes = []
  for (const part of parts) {
    const attribute = part.trim()
    if (attribute !== '') attributes.push(attribute)
  }
  return { name, value, attributes }
}

/**
 * 转发 Set-Cookie 时去掉 Domain=、去掉 SameSite=None（否则浏览器会拒收），
 * 保留 Secure/HttpOnly 与其余属性。
 */
function rewriteSetCookie(raw) {
  const { name, value, attributes } = parseSetCookie(raw)
  if (name === '') return String(raw)
  const kept = []
  for (const attribute of attributes) {
    const equals = attribute.indexOf('=')
    const key = (equals === -1 ? attribute : attribute.slice(0, equals)).trim().toLowerCase()
    const attributeValue = equals === -1 ? '' : attribute.slice(equals + 1).trim()
    if (key === 'domain') continue
    if (key === 'samesite' && attributeValue.toLowerCase() === 'none') continue
    kept.push(attribute)
  }
  if (kept.length === 0) return `${name}=${value}`
  return `${name}=${value}; ${kept.join('; ')}`
}

function cookieKey(domain, cookiePath, name) {
  return `${String(domain).toLowerCase()}|${cookiePath}|${name}`
}

/** 把上游 Set-Cookie 解析进 jar，避免依赖浏览器回传。 */
function absorbSetCookie(raw, targetUrl, jar) {
  const { name, value, attributes } = parseSetCookie(raw)
  if (name === '') return

  let domain = targetUrl.hostname
  let cookiePath = '/'
  let secure = false
  let httpOnly = false
  let expires = 0
  let maxAge = null

  for (const attribute of attributes) {
    const equals = attribute.indexOf('=')
    const key = (equals === -1 ? attribute : attribute.slice(0, equals)).trim().toLowerCase()
    const attributeValue = equals === -1 ? '' : attribute.slice(equals + 1).trim()
    switch (key) {
      case 'domain':
        if (attributeValue !== '') domain = attributeValue
        break
      case 'path':
        cookiePath = attributeValue === '' ? '/' : attributeValue
        break
      case 'secure':
        secure = true
        break
      case 'httponly':
        httpOnly = true
        break
      case 'max-age': {
        const parsed = Number(attributeValue)
        if (Number.isFinite(parsed)) maxAge = parsed
        break
      }
      case 'expires': {
        const parsed = Date.parse(attributeValue)
        if (Number.isFinite(parsed)) expires = Math.round(parsed / 1000)
        break
      }
      default:
        break
    }
  }
  if (maxAge !== null) {
    expires = maxAge <= 0 ? -1 : Math.round(Date.now() / 1000 + maxAge)
  }

  const key = cookieKey(domain, cookiePath, name)
  const existingIndex = jar.findIndex(
    (cookie) => cookieKey(cookie.domain, cookie.path, cookie.name) === key,
  )
  const nowSeconds = Math.round(Date.now() / 1000)
  if (expires !== 0 && expires <= nowSeconds) {
    if (existingIndex !== -1) jar.splice(existingIndex, 1)
    return
  }
  const nextCookie = {
    name,
    value,
    domain,
    path: cookiePath,
    secure,
    httpOnly,
    expires: expires < 0 ? 0 : expires,
  }
  if (existingIndex === -1) jar.push(nextCookie)
  else jar[existingIndex] = nextCookie
}
