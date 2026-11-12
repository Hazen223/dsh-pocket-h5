/**
 * 登录桥单元/集成测试（无测试框架，node 直接运行）。
 *
 *   node dsh-pocket-h5/tests/bridge-unit.mjs
 *
 * 失败时打印 `not ok - <case>: <reason>` 并以 exit code 1 退出。
 * 测试不依赖当前工作目录；不读取真实 Safari 之外的文件（真实 Safari 读取
 * 只在该测试进程所在机器上做只读探测）。
 */

import assert from 'node:assert/strict'
import { once } from 'node:events'
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import http from 'node:http'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

import {
  createBridge,
  filterCookiesForUrl,
  mergeCookieHeader,
  parseBinaryCookies,
  readSafariCookies,
} from '../lib/bridge.js'

/* ------------------------------------------------------------------ *
 * 极简测试框架
 * ------------------------------------------------------------------ */

let total = 0
let failed = 0

async function test(name, body) {
  total += 1
  try {
    const note = await body()
    console.log(`ok - ${name}${typeof note === 'string' ? ` (${note})` : ''}`)
  } catch (error) {
    failed += 1
    console.log(`not ok - ${name}: ${error?.message ?? String(error)}`)
    if (process.env.BRIDGE_TEST_VERBOSE === '1') console.error(error)
  }
}

/* ------------------------------------------------------------------ *
 * Safari binarycookies fixture 构造
 *
 * 构造两种布局，供往返测试：
 *  - safari：真实 Safari 布局（页表 = 页长度，页首签名，记录头 56 字节）
 *  - spec：任务规格里的简化布局（页表 = 页偏移，页首页长度，记录头 52 字节）
 * ------------------------------------------------------------------ */

const COCOA_EPOCH_SECONDS = 978307200

function cocoaSeconds(unixSeconds) {
  const seconds = Number(unixSeconds) || 0
  return seconds > 0 ? seconds - COCOA_EPOCH_SECONDS : 0
}

function buildCookieRecord(cookie, { headerSize, dropTrailingNul = false }) {
  const strings = [
    Buffer.from(`${cookie.domain ?? ''}\0`, 'utf8'),
    Buffer.from(`${cookie.name ?? ''}\0`, 'utf8'),
    Buffer.from(`${cookie.path ?? '/'}\0`, 'utf8'),
    Buffer.from(`${cookie.value ?? ''}\0`, 'utf8'),
  ]
  const offsets = []
  let cursor = headerSize
  for (const chunk of strings) {
    offsets.push(cursor)
    cursor += chunk.length
  }
  const recordSize = cursor
  const header = Buffer.alloc(headerSize)
  header.writeUInt32LE(recordSize, 0)
  header.writeUInt32LE(0, 4)
  header.writeUInt32LE((cookie.secure ? 1 : 0) | (cookie.httpOnly ? 4 : 0), 8)
  header.writeUInt32LE(0, 12)
  header.writeUInt32LE(offsets[0], 16)
  header.writeUInt32LE(offsets[1], 20)
  header.writeUInt32LE(offsets[2], 24)
  header.writeUInt32LE(offsets[3], 28)
  header.writeUInt32LE(0, 32) // comment offset：无
  const expiry = cocoaSeconds(cookie.expires)
  const expiryOffset = headerSize === 56 ? 40 : 36
  header.writeDoubleLE(expiry, expiryOffset)
  header.writeDoubleLE(expiry, expiryOffset + 8)
  let record = Buffer.concat([header, ...strings])
  if (dropTrailingNul) {
    record = Buffer.from(record.subarray(0, record.length - 1))
    record.writeUInt32LE(record.length, 0)
  }
  return record
}

function buildCookiePage(cookies, { headerSize, pageHeader, dropTrailingNul = false }) {
  const records = cookies.map((cookie, index) =>
    buildCookieRecord(cookie, {
      headerSize,
      dropTrailingNul: dropTrailingNul && index === cookies.length - 1,
    }),
  )
  const offsets = []
  let cursor = 8 + records.length * 4
  for (const record of records) {
    offsets.push(cursor)
    cursor += record.length
  }
  const pageSize = cursor
  const page = Buffer.alloc(pageSize)
  page.writeUInt32LE(pageHeader === 'signature' ? 0x00010000 : pageSize, 0)
  page.writeUInt32LE(records.length, 4)
  offsets.forEach((offset, index) => page.writeUInt32LE(offset, 8 + index * 4))
  records.forEach((record, index) => record.copy(page, offsets[index]))
  return page
}

function splitPages(cookies, pageCount) {
  const groups = Array.from({ length: pageCount }, () => [])
  if (cookies.length === 0) return groups
  const perPage = Math.ceil(cookies.length / pageCount)
  cookies.forEach((cookie, index) => {
    groups[Math.min(Math.floor(index / perPage), pageCount - 1)].push(cookie)
  })
  return groups
}

function buildCookieFile(cookies, { pages = 1, layout = 'safari', dropTrailingNul = false } = {}) {
  const groups = splitPages(cookies, pages)
  const headerSize = layout === 'safari' ? 56 : 52
  const pageHeader = layout === 'safari' ? 'signature' : 'size'
  const pageBuffers = groups.map((group, index) =>
    buildCookiePage(group, {
      headerSize,
      pageHeader,
      dropTrailingNul: dropTrailingNul && index === groups.length - 1,
    }),
  )
  const tableEnd = 8 + groups.length * 4
  const header = Buffer.alloc(tableEnd)
  header.write('cook', 0, 'latin1')
  header.writeUInt32BE(groups.length, 4)
  let cursor = tableEnd
  groups.forEach((group, index) => {
    if (layout === 'safari') {
      header.writeUInt32BE(pageBuffers[index].length, 8 + index * 4)
    } else {
      header.writeUInt32BE(cursor, 8 + index * 4)
      cursor += pageBuffers[index].length
    }
  })
  return Buffer.concat([header, ...pageBuffers])
}

function normalizeExpected(cookie) {
  return {
    name: cookie.name ?? '',
    value: cookie.value ?? '',
    domain: cookie.domain ?? '',
    path: cookie.path ?? '/',
    secure: Boolean(cookie.secure),
    httpOnly: Boolean(cookie.httpOnly),
    expires: Number(cookie.expires) > 0 ? Number(cookie.expires) : 0,
  }
}

/* ------------------------------------------------------------------ *
 * 小工具
 * ------------------------------------------------------------------ */

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject)
      resolve()
    })
  })
}

function stopServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve())
  })
}

function httpRequest(url, { method = 'GET', headers = {}, timeout = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const request = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: `${parsed.pathname}${parsed.search}`,
        method,
        headers,
      },
      (response) => {
        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          })
        })
      },
    )
    request.setTimeout(timeout, () => request.destroy(new Error('client timeout')))
    request.on('error', reject)
    request.end()
  })
}

async function waitFor(predicate, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (predicate()) return
    await delay(10)
  }
  throw new Error(`等待条件超时（${timeoutMs}ms）`)
}

async function closedPort() {
  const server = net.createServer()
  await listen(server)
  const port = server.address().port
  await stopServer(server)
  return port
}

function makeCookie(overrides = {}) {
  return {
    name: 'c',
    value: 'v',
    domain: 'example.com',
    path: '/',
    secure: false,
    httpOnly: false,
    expires: 0,
    ...overrides,
  }
}

/* ------------------------------------------------------------------ *
 * fixture 上游服务
 * ------------------------------------------------------------------ */

async function startUpstream() {
  const records = []
  const sockets = new Set()

  const record = (req) => {
    let pathname = '/'
    try {
      pathname = new URL(req.url, 'http://127.0.0.1').pathname
    } catch {
      pathname = req.url
    }
    records.push({ path: pathname, headers: req.headers })
  }

  const server = http.createServer((req, res) => {
    record(req)
    const pathname = records[records.length - 1].path
    if (pathname === '/') {
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'x-frame-options': 'DENY',
        'content-security-policy': "default-src 'self'; frame-ancestors 'none'",
      })
      res.end('<!doctype html><h1>fixture upstream</h1>')
      return
    }
    if (pathname === '/set') {
      res.writeHead(200, {
        'content-type': 'text/plain',
        'set-cookie': ['token=xyz; Path=/; HttpOnly; SameSite=None; Secure'],
      })
      res.end('set')
      return
    }
    if (pathname === '/redirect') {
      const origin = `http://127.0.0.1:${server.address().port}`
      res.writeHead(302, { location: `${origin}/next` })
      res.end()
      return
    }
    if (pathname === '/next') {
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.end('next')
      return
    }
    if (pathname === '/slow') {
      // 故意不响应：用于 504 超时测试。
      return
    }
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('not found')
  })

  server.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })
  server.on('upgrade', (req, socket) => {
    record(req)
    socket.on('close', () => sockets.delete(socket))
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n\r\n',
    )
    socket.write('hello-from-upstream')
  })

  await listen(server)
  const origin = `http://127.0.0.1:${server.address().port}`
  return { server, records, sockets, origin }
}

async function stopUpstream(upstream) {
  for (const socket of upstream.sockets) socket.destroy()
  upstream.sockets.clear()
  await stopServer(upstream.server)
}

/* ------------------------------------------------------------------ *
 * 测试
 * ------------------------------------------------------------------ */

async function main() {
  const multiPageCookies = [
    {
      name: 'sid',
      value: 'abc',
      domain: '.example.com',
      path: '/',
      secure: true,
      httpOnly: true,
      expires: 1760000000,
    },
    {
      name: 'pref',
      value: '中文值',
      domain: 'a.example.com',
      path: '/app',
      secure: false,
      httpOnly: false,
      expires: 0,
    },
    {
      name: 'token',
      value: 'x=y',
      domain: '127.0.0.1',
      path: '/next',
      secure: false,
      httpOnly: true,
      expires: 1790000000,
    },
  ]

  await test('parseBinaryCookies: 真实 Safari 布局多页往返（Secure/HttpOnly/中文/过期时间）', () => {
    const data = buildCookieFile(multiPageCookies, { pages: 2, layout: 'safari' })
    assert.deepEqual(parseBinaryCookies(data), multiPageCookies.map(normalizeExpected))
  })

  await test('parseBinaryCookies: 简化规格布局多页往返', () => {
    const data = buildCookieFile(multiPageCookies, { pages: 2, layout: 'spec' })
    assert.deepEqual(parseBinaryCookies(data), multiPageCookies.map(normalizeExpected))
  })

  await test('parseBinaryCookies: 缺失尾部 NUL 抛错', () => {
    const data = buildCookieFile([multiPageCookies[0]], { layout: 'spec', dropTrailingNul: true })
    assert.throws(() => parseBinaryCookies(data), /NUL/)
  })

  await test('parseBinaryCookies: 魔数错误抛错', () => {
    const data = Buffer.alloc(32)
    data.write('c00k', 0, 'latin1')
    assert.throws(() => parseBinaryCookies(data), /cook|魔数/)
  })

  await test('parseBinaryCookies: 文件头/页表被截断抛错', () => {
    const data = buildCookieFile(multiPageCookies, { pages: 2, layout: 'safari' })
    assert.throws(() => parseBinaryCookies(data.subarray(0, 4)), /文件头/)
    assert.throws(() => parseBinaryCookies(data.subarray(0, 10)), /页表|文件头/)
  })

  await test('filterCookiesForUrl: 精确 host', () => {
    const cookies = [
      makeCookie({ name: 'exact', domain: 'example.com' }),
      makeCookie({ name: 'sub', domain: 'a.example.com' }),
    ]
    assert.deepEqual(
      filterCookiesForUrl(cookies, 'https://example.com/x').map((cookie) => cookie.name),
      ['exact'],
    )
  })

  await test('filterCookiesForUrl: 父域 .example.com 匹配子域', () => {
    const cookies = [
      makeCookie({ name: 'parent', domain: '.example.com' }),
      makeCookie({ name: 'bare', domain: 'example.com' }),
    ]
    assert.deepEqual(
      filterCookiesForUrl(cookies, 'https://sub.example.com/x').map((cookie) => cookie.name),
      ['parent', 'bare'],
    )
  })

  await test('filterCookiesForUrl: 无关域不匹配（后缀必须按域边界）', () => {
    // `notexample.com` 不能因为以 `example.com` 结尾就被 `.example.com` 命中。
    assert.deepEqual(
      filterCookiesForUrl([makeCookie({ name: 'parent', domain: '.example.com' })], 'https://notexample.com/x'),
      [],
    )
    assert.deepEqual(
      filterCookiesForUrl([makeCookie({ name: 'sibling', domain: 'notexample.com' })], 'https://example.com/'),
      [],
    )
    assert.deepEqual(
      filterCookiesForUrl([makeCookie({ name: 'other', domain: 'other.com' })], 'https://example.com/'),
      [],
    )
  })

  await test('filterCookiesForUrl: path 前缀', () => {
    const cookies = [makeCookie({ name: 'app', path: '/app' }), makeCookie({ name: 'root', path: '/' })]
    assert.deepEqual(
      filterCookiesForUrl(cookies, 'https://example.com/app/page').map((cookie) => cookie.name),
      ['app', 'root'],
    )
    assert.deepEqual(
      filterCookiesForUrl([cookies[0]], 'https://example.com/other').map((cookie) => cookie.name),
      [],
    )
  })

  await test('filterCookiesForUrl: 过期过滤（session 保留、未来保留）', () => {
    const now = Math.floor(Date.now() / 1000)
    const cookies = [
      makeCookie({ name: 'expired', expires: now - 3600 }),
      makeCookie({ name: 'future', expires: now + 3600 }),
      makeCookie({ name: 'session', expires: 0 }),
    ]
    assert.deepEqual(
      filterCookiesForUrl(cookies, 'https://example.com/').map((cookie) => cookie.name),
      ['future', 'session'],
    )
  })

  await test('filterCookiesForUrl: IP 主机精确匹配', () => {
    const cookies = [
      makeCookie({ name: 'ip', domain: '127.0.0.1' }),
      makeCookie({ name: 'suffix', domain: '0.0.1' }),
      makeCookie({ name: 'localhost', domain: 'localhost' }),
    ]
    assert.deepEqual(
      filterCookiesForUrl(cookies, 'http://127.0.0.1:5173/x').map((cookie) => cookie.name),
      ['ip'],
    )
  })

  await test('mergeCookieHeader: jar 优先，浏览器独有名字保留', () => {
    const jar = [
      { name: 'a', value: '1' },
      { name: 'b', value: '2' },
    ]
    assert.equal(mergeCookieHeader(jar, 'b=9; c=3'), 'a=1; b=2; c=3')
  })

  await test('mergeCookieHeader: 只有浏览器头 / 空输入', () => {
    assert.equal(mergeCookieHeader([], 'x=1; y=2'), 'x=1; y=2')
    assert.equal(mergeCookieHeader([], ''), '')
    assert.equal(mergeCookieHeader([], undefined), '')
    assert.equal(mergeCookieHeader([], null), '')
    assert.equal(mergeCookieHeader([{ name: 'a', value: '1' }], ''), 'a=1')
    assert.equal(mergeCookieHeader([], 'z=a=b'), 'z=a=b')
  })

  await test('readSafariCookies: 缺失文件 → safari-missing', async () => {
    const missingPath = path.join(os.tmpdir(), `pocket-bridge-missing-${process.pid}-${Date.now()}.binarycookies`)
    const result = await readSafariCookies({ path: missingPath })
    assert.equal(result.ok, false)
    assert.equal(result.code, 'safari-missing')
    assert.ok(typeof result.message === 'string' && result.message.includes('Safari'))
  })

  await test('readSafariCookies: 路径覆盖成功读取 fixture', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'pocket-bridge-'))
    try {
      const file = path.join(dir, 'Cookies.binarycookies')
      await writeFile(file, buildCookieFile(multiPageCookies, { pages: 2, layout: 'safari' }))
      const result = await readSafariCookies({ path: file })
      assert.equal(result.ok, true)
      assert.deepEqual(result.cookies, multiPageCookies.map(normalizeExpected))
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  })

  await test('readSafariCookies: EACCES/EPERM → safari-permission', async () => {
    if (typeof process.getuid === 'function' && process.getuid() === 0) return '跳过：root 不受文件权限限制'
    const dir = await mkdtemp(path.join(os.tmpdir(), 'pocket-bridge-'))
    const file = path.join(dir, 'Cookies.binarycookies')
    try {
      await writeFile(file, buildCookieFile([multiPageCookies[0]], { layout: 'safari' }))
      await chmod(file, 0o000)
      const result = await readSafariCookies({ path: file })
      assert.equal(result.ok, false)
      assert.equal(result.code, 'safari-permission')
      assert.ok(result.message.includes('完全磁盘访问权限'), 'message 需说明完全磁盘访问权限')
    } finally {
      await chmod(file, 0o600).catch(() => {})
      await rm(dir, { recursive: true, force: true })
    }
  })

  await test('readSafariCookies: 本机默认路径可读取或返回已知错误码', async () => {
    const result = await readSafariCookies()
    if (result.ok) {
      assert.ok(Array.isArray(result.cookies))
      return `ok，${result.cookies.length} 个 cookie`
    }
    assert.ok(
      ['safari-permission', 'safari-missing', 'safari-parse-failed'].includes(result.code),
      `未知 code：${result.code}`,
    )
    assert.ok(typeof result.message === 'string' && result.message.length > 0)
    return `code=${result.code}`
  })

  /* 代理集成测试：需要一个 fixture 上游。 */

  const upstream = await startUpstream()
  const sidCookie = () => ({
    name: 'sid',
    value: 'abc',
    domain: '127.0.0.1',
    path: '/',
    secure: false,
    httpOnly: true,
    expires: 0,
  })
  const lastRecord = (pathname) =>
    upstream.records.filter((record) => record.path === pathname).at(-1)

  const withBridge = async (cookies, body, options = {}) => {
    const bridge = await createBridge({ target: `${upstream.origin}/`, cookies, ...options })
    try {
      return await body(bridge)
    } finally {
      await bridge.close()
    }
  }

  try {
    await test('proxy: GET / 注入 Cookie、剥离 XFO、改写 origin/referer、保留 host', async () => {
      await withBridge([sidCookie()], async (bridge) => {
        const response = await httpRequest(`${bridge.origin}/`, {
          headers: {
            origin: bridge.origin,
            referer: `${bridge.origin}/page`,
          },
        })
        assert.equal(response.status, 200)
        assert.equal(response.headers['x-frame-options'], undefined)
        assert.equal(response.headers['content-security-policy'], "default-src 'self'")
        assert.ok(response.body.includes('fixture upstream'))

        const record = lastRecord('/')
        assert.equal(record.headers.cookie, 'sid=abc')
        assert.equal(record.headers.origin, upstream.origin)
        assert.equal(record.headers.referer, `${upstream.origin}/page`)
        assert.equal(record.headers.host, new URL(upstream.origin).host)
      })
    })

    await test('proxy: 浏览器 Cookie 头合并（jar 优先）', async () => {
      await withBridge([sidCookie()], async (bridge) => {
        await httpRequest(`${bridge.origin}/next`, {
          headers: { cookie: 'sid=browser; extra=browser' },
        })
        assert.equal(lastRecord('/next').headers.cookie, 'sid=abc; extra=browser')
      })
    })

    await test('proxy: /set 的 Set-Cookie 去掉 Domain/SameSite=None，保留 HttpOnly/Secure', async () => {
      await withBridge([sidCookie()], async (bridge) => {
        const response = await httpRequest(`${bridge.origin}/set`)
        const setCookie = response.headers['set-cookie']
        assert.ok(Array.isArray(setCookie) && setCookie.length === 1, '应转发一条 Set-Cookie')
        const value = setCookie[0]
        assert.match(value, /^token=xyz/)
        assert.doesNotMatch(value, /domain=/i)
        assert.doesNotMatch(value, /samesite/i)
        assert.match(value, /httponly/i)
        assert.match(value, /secure/i)
        assert.match(value, /path=\//i)
        assert.equal(bridge.cookieCount, 2, 'jar 应吸收上游新增 cookie')
      })
    })

    await test('proxy: /redirect 的绝对 Location 改写成代理 origin', async () => {
      await withBridge([sidCookie()], async (bridge) => {
        const response = await httpRequest(`${bridge.origin}/redirect`)
        assert.equal(response.status, 302)
        assert.equal(response.headers.location, `${bridge.origin}/next`)
      })
    })

    await test('proxy: /set 之后 /next 由 jar 回灌 token=xyz', async () => {
      await withBridge([sidCookie()], async (bridge) => {
        await httpRequest(`${bridge.origin}/set`)
        await httpRequest(`${bridge.origin}/next`)
        const cookie = lastRecord('/next').headers.cookie
        assert.ok(cookie.includes('sid=abc'), `缺少 sid：${cookie}`)
        assert.ok(cookie.includes('token=xyz'), `缺少 token：${cookie}`)
      })
    })

    await test('proxy: setCookies 替换 jar', async () => {
      await withBridge([sidCookie()], async (bridge) => {
        bridge.setCookies([
          {
            name: 'sid',
            value: 'new',
            domain: '127.0.0.1',
            path: '/',
            secure: false,
            httpOnly: false,
            expires: 0,
          },
        ])
        assert.equal(bridge.cookieCount, 1)
        await httpRequest(`${bridge.origin}/next`)
        assert.equal(lastRecord('/next').headers.cookie, 'sid=new')
      })
    })

    await test('proxy: upgrade 隧道双向转发并注入 Cookie', async () => {
      await withBridge([sidCookie()], async (bridge) => {
        const socket = net.connect({ host: '127.0.0.1', port: bridge.port })
        const chunks = []
        socket.on('data', (chunk) => chunks.push(chunk))
        await once(socket, 'connect')
        socket.write(
          'GET /socket HTTP/1.1\r\n' +
            `Host: 127.0.0.1:${bridge.port}\r\n` +
            'Upgrade: websocket\r\n' +
            'Connection: Upgrade\r\n' +
            'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n' +
            'Sec-WebSocket-Version: 13\r\n\r\n',
        )
        await waitFor(() => Buffer.concat(chunks).includes('hello-from-upstream'))
        const text = Buffer.concat(chunks).toString('latin1')
        assert.match(text, /^HTTP\/1\.1 101/)
        assert.equal(lastRecord('/socket').headers.cookie, 'sid=abc')
        socket.destroy()
      })
    })

    await test('proxy: 上游连接失败 → 502 纯文本', async () => {
      const port = await closedPort()
      const bridge = await createBridge({ target: `http://127.0.0.1:${port}/` })
      try {
        const response = await httpRequest(`${bridge.origin}/x`)
        assert.equal(response.status, 502)
        assert.match(response.body, /Bad Gateway/)
        assert.doesNotMatch(response.body, /ECONNREFUSED/)
      } finally {
        await bridge.close()
      }
    })

    await test('proxy: 上游超时 → 504 纯文本', async () => {
      const bridge = await createBridge({ target: `${upstream.origin}/`, timeoutMs: 250 })
      try {
        const response = await httpRequest(`${bridge.origin}/slow`)
        assert.equal(response.status, 504)
        assert.match(response.body, /Gateway Timeout/)
      } finally {
        await bridge.close()
      }
    })

    await test('proxy: close() 释放端口且可重复调用', async () => {
      const bridge = await createBridge({ target: `${upstream.origin}/` })
      await bridge.close()
      await assert.rejects(httpRequest(`${bridge.origin}/`))
      await bridge.close() // 不允许抛错
    })
  } finally {
    await stopUpstream(upstream)
  }

  console.log(`# tests ${total}`)
  console.log(`# pass ${total - failed}`)
  if (failed !== 0) {
    console.log(`# fail ${failed}`)
    process.exitCode = 1
  } else {
    console.log('# all tests passed')
  }
}

await main()
