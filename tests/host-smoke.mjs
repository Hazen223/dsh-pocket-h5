/**
 * Host-half smoke test: no dependencies, no test runner.
 *
 * Builds a fake cordis context, captures the route registered by `apply`,
 * then calls the captured handler directly with fake request/response objects.
 *
 * Run with: node tests/host-smoke.mjs
 */
import { createServer } from 'node:http'

import { apply } from '../index.js'

const failures = []

function check(name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push(`${name}: ${message}`)
    console.error(`not ok - ${name}: ${message}`)
  }
}

function makeRes() {
  return {
    status: undefined,
    headers: undefined,
    body: undefined,
    writeHead(status, headers) {
      this.status = status
      this.headers = headers ?? {}
    },
    end(chunk) {
      this.body = chunk
    },
  }
}

async function request(handler, method, url, body) {
  const res = makeRes()
  await handler({ method, url, body }, res)
  return res
}

const disposers = []
let route
const ctx = {
  webServer: {
    register(captured) {
      route = captured
      return () => {
        route = undefined
      }
    },
  },
  effect(fn) {
    const disposer = fn()
    disposers.push(disposer)
    return disposer
  },
}

const returned = apply(ctx)

check('apply registers one prefix route at /pocket-h5', () => {
  if (route === undefined) throw new Error('no route captured')
  if (route.kind !== 'prefix') throw new Error(`kind is ${String(route.kind)}`)
  if (route.path !== '/pocket-h5') throw new Error(`path is ${String(route.path)}`)
  if (typeof route.handler !== 'function') throw new Error('handler is not a function')
})

check('apply returns a disposer', () => {
  if (typeof returned !== 'function') throw new Error(`got ${typeof returned}`)
})

const handler = route?.handler

if (typeof handler !== 'function') {
  console.error('not ok - no handler captured; remaining checks skipped')
  failures.push('handler not captured')
} else {
  const getDemo = await request(handler, 'GET', '/pocket-h5/demo.html')
  check('GET /pocket-h5/demo.html -> 200 text/html', () => {
    if (getDemo.status !== 200) throw new Error(`status ${String(getDemo.status)}`)
    const contentType = String(getDemo.headers?.['Content-Type'] ?? '')
    if (!contentType.includes('text/html')) throw new Error(`content-type ${contentType}`)
    const cacheControl = String(getDemo.headers?.['Cache-Control'] ?? '')
    if (!cacheControl.includes('no-store')) throw new Error(`cache-control ${cacheControl}`)
    const nosniff = String(getDemo.headers?.['X-Content-Type-Options'] ?? '')
    if (nosniff !== 'nosniff') throw new Error(`x-content-type-options ${nosniff}`)
    const body = String(getDemo.body ?? '').toLowerCase()
    if (!body.includes('<!doctype html')) throw new Error('body has no doctype')
  })

  const getDemoAlias = await request(handler, 'GET', '/pocket-h5/demo')
  check('GET /pocket-h5/demo alias -> 200', () => {
    if (getDemoAlias.status !== 200) throw new Error(`status ${String(getDemoAlias.status)}`)
  })

  const getUnknown = await request(handler, 'GET', '/pocket-h5/nope')
  check('GET /pocket-h5/nope -> 404', () => {
    if (getUnknown.status !== 404) throw new Error(`status ${String(getUnknown.status)}`)
  })

  const postDemo = await request(handler, 'POST', '/pocket-h5/demo.html')
  check('POST /pocket-h5/demo.html -> 405', () => {
    if (postDemo.status !== 405) throw new Error(`status ${String(postDemo.status)}`)
    if (!String(postDemo.headers?.Allow ?? '').includes('GET')) throw new Error('no Allow header')
  })

  const headDemo = await request(handler, 'HEAD', '/pocket-h5/demo.html')
  check('HEAD /pocket-h5/demo.html -> 200 with empty body', () => {
    if (headDemo.status !== 200) throw new Error(`status ${String(headDemo.status)}`)
    const body = headDemo.body
    const empty =
      body === undefined || body === null || body === '' || body.length === 0
    if (!empty) throw new Error(`body length ${String(body.length)}`)
  })

  // WHATWG URL normalizes percent-encoded dot segments before we see the
  // pathname, so this lands on a non-demo path (404) instead of the explicit
  // traversal branch; either status proves the request is rejected.
  const traversal = await request(handler, 'GET', '/pocket-h5/%2e%2e/demo.html')
  check('encoded traversal is rejected', () => {
    if (traversal.status !== 400 && traversal.status !== 404) {
      throw new Error(`status ${String(traversal.status)}`)
    }
    const body = String(traversal.body ?? '').toLowerCase()
    if (body.includes('<!doctype html')) throw new Error('traversal served the demo page')
  })

  const malformed = await request(handler, 'GET', '/pocket-h5/%zz')
  check('malformed percent-encoding -> 400', () => {
    if (malformed.status !== 400) throw new Error(`status ${String(malformed.status)}`)
  })

  // Display probe: lets the panel convert CSS px to real device size.
  const gotDisplay = await request(handler, 'GET', '/pocket-h5/display.json')
  check('GET /pocket-h5/display.json -> 200 JSON display probe', () => {
    if (gotDisplay.status !== 200) throw new Error(`status ${String(gotDisplay.status)}`)
    const contentType = String(gotDisplay.headers?.['Content-Type'] ?? '')
    if (!contentType.includes('application/json')) throw new Error(`content-type ${contentType}`)
    const cacheControl = String(gotDisplay.headers?.['Cache-Control'] ?? '')
    if (!cacheControl.includes('no-store')) throw new Error(`cache-control ${cacheControl}`)
    const payload = JSON.parse(String(gotDisplay.body ?? '{}'))
    if (typeof payload.ok !== 'boolean') throw new Error('ok flag missing')
    if (!Array.isArray(payload.displays)) throw new Error('displays is not an array')
    if (payload.platform !== process.platform) throw new Error(`platform ${String(payload.platform)}`)
    if (process.platform === 'darwin') {
      if (payload.displays.length === 0) throw new Error('no display probed on darwin')
      const display = payload.displays[0]
      for (const key of ['id', 'widthMm', 'heightMm', 'pixelWidth', 'pixelHeight']) {
        if (!(key in display)) throw new Error(`display missing ${key}`)
      }
      const ppi = display.pixelWidth / (display.widthMm / 25.4)
      if (!(ppi >= 16 && ppi <= 1100)) throw new Error(`implausible css ppi ${ppi}`)
    }
  })

  const headDisplay = await request(handler, 'HEAD', '/pocket-h5/display.json')
  check('HEAD /pocket-h5/display.json -> 200 with empty body', () => {
    if (headDisplay.status !== 200) throw new Error(`status ${String(headDisplay.status)}`)
    const body = headDisplay.body
    if (!(body === undefined || body === null || body === '' || body.length === 0)) {
      throw new Error(`body length ${String(body.length)}`)
    }
  })

  const postDisplay = await request(handler, 'POST', '/pocket-h5/display.json')
  check('POST /pocket-h5/display.json -> 405', () => {
    if (postDisplay.status !== 405) throw new Error(`status ${String(postDisplay.status)}`)
  })

  // Embed/login diagnosis: local fixture server for the response policies.
  const fixture = createServer((req, res) => {
    if (req.url === '/plain') {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('<!doctype html><title>ok</title>')
    } else if (req.url === '/deny') {
      res.writeHead(200, { 'Content-Type': 'text/html', 'X-Frame-Options': 'DENY' })
      res.end('deny')
    } else if (req.url === '/csp') {
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
      })
      res.end('csp')
    } else if (req.url === '/protected') {
      res.writeHead(302, { Location: '/login?next=%2F' })
      res.end()
    } else if (req.url === '/login') {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end('login')
    } else if (req.url === '/unauthorized') {
      res.writeHead(401, { 'Content-Type': 'text/html' })
      res.end('no')
    } else if (req.url === '/bridge-echo') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'",
      })
      res.end(JSON.stringify({ cookie: String(req.headers.cookie ?? '') }))
    } else if (req.url === '/bridge-set') {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': 'token=xyz; Path=/; HttpOnly; SameSite=None; Secure',
      })
      res.end(JSON.stringify({ ok: true }))
    } else if (req.url === '/bridge-next') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ cookie: String(req.headers.cookie ?? '') }))
    } else if (req.url === '/bridge-redirect') {
      res.writeHead(302, { Location: `http://127.0.0.1:${fixturePort}/bridge-next` })
      res.end()
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end('nope')
    }
  })
  await new Promise((resolve) => fixture.listen(0, '127.0.0.1', resolve))
  const fixturePort = fixture.address().port
  const probe = async (path) => {
    const target = `http://127.0.0.1:${fixturePort}${path}`
    const res = await request(handler, 'GET', `/pocket-h5/probe.json?url=${encodeURIComponent(target)}`)
    if (res.status !== 200) throw new Error(`probe endpoint status ${String(res.status)}`)
    return JSON.parse(String(res.body ?? '{}'))
  }

  try {
    const plain = await probe('/plain')
    check('probe plain page -> framing allowed, no login', () => {
      if (plain.ok !== true) throw new Error('not ok')
      if (plain.framing?.allowed !== true) throw new Error(`framing ${JSON.stringify(plain.framing)}`)
      if (plain.login?.detected !== false) throw new Error('unexpected login signal')
      if (plain.status !== 200) throw new Error(`status ${String(plain.status)}`)
    })

    const deny = await probe('/deny')
    check('probe X-Frame-Options DENY -> framing blocked', () => {
      if (deny.framing?.allowed !== false) throw new Error('framing allowed')
      if (!String(deny.framing?.reason ?? '').includes('DENY')) throw new Error('reason missing DENY')
    })

    const csp = await probe('/csp')
    check("probe CSP frame-ancestors 'none' -> framing blocked", () => {
      if (csp.framing?.allowed !== false) throw new Error('framing allowed')
      if (!String(csp.framing?.reason ?? '').includes('frame-ancestors')) throw new Error('reason missing frame-ancestors')
    })

    const login = await probe('/protected')
    check('probe login redirect -> login detected with redirect chain', () => {
      if (login.login?.detected !== true) throw new Error('login not detected')
      if (!Array.isArray(login.redirects) || login.redirects.length !== 1) throw new Error('redirect chain missing')
      if (!String(login.finalUrl ?? '').includes('/login')) throw new Error(`finalUrl ${String(login.finalUrl)}`)
    })

    const unauthorized = await probe('/unauthorized')
    check('probe HTTP 401 -> login detected', () => {
      if (unauthorized.login?.detected !== true) throw new Error('401 not treated as login gate')
    })

    const notFound = await probe('/nope')
    check('probe HTTP 404 -> ok payload with status', () => {
      if (notFound.ok !== true) throw new Error('not ok')
      if (notFound.status !== 404) throw new Error(`status ${String(notFound.status)}`)
    })

    const invalidScheme = await probe('/plain')
    const badScheme = await request(handler, 'GET', `/pocket-h5/probe.json?url=${encodeURIComponent('file:///etc/passwd')}`)
    const badSchemePayload = JSON.parse(String(badScheme.body ?? '{}'))
    check('probe rejects non-http schemes', () => {
      if (badSchemePayload.ok !== false) throw new Error('file: URL accepted')
      if (badSchemePayload.code !== 'invalid-protocol') throw new Error(`code ${String(badSchemePayload.code)}`)
      if (invalidScheme.ok !== true) throw new Error('fixture sanity failed')
    })

    const closedPort = await request(
      handler,
      'GET',
      `/pocket-h5/probe.json?url=${encodeURIComponent('http://127.0.0.1:1/')}`,
    )
    const closedPayload = JSON.parse(String(closedPort.body ?? '{}'))
    check('probe reports unreachable target', () => {
      if (closedPayload.ok !== false) throw new Error('unreachable target reported ok')
      if (closedPayload.code !== 'fetch-failed' && closedPayload.code !== 'timeout') {
        throw new Error(`code ${String(closedPayload.code)}`)
      }
    })

    // ---- 登录桥：手动 Cookie 启动、注入、头部剥离、Location/Set-Cookie 改写、停止 ----
    const bridgeGet = await request(handler, 'GET', '/pocket-h5/bridge.json')
    check('GET /pocket-h5/bridge.json -> 200 inactive state', () => {
      if (bridgeGet.status !== 200) throw new Error(`status ${String(bridgeGet.status)}`)
      const payload = JSON.parse(String(bridgeGet.body ?? '{}'))
      if (payload.ok !== true || payload.active !== false) throw new Error(`state ${JSON.stringify(payload)}`)
    })

    const bridgeStart = await request(
      handler,
      'POST',
      '/pocket-h5/bridge.json',
      JSON.stringify({
        action: 'start',
        target: `http://127.0.0.1:${fixturePort}/`,
        cookies: 'sid=abc; theme=dark',
      }),
    )
    const bridgeState = JSON.parse(String(bridgeStart.body ?? '{}'))
    check('POST bridge start with manual cookies -> active bridge', () => {
      if (bridgeStart.status !== 200) throw new Error(`status ${String(bridgeStart.status)}`)
      if (bridgeState.ok !== true || bridgeState.active !== true) throw new Error(`state ${JSON.stringify(bridgeState)}`)
      if (bridgeState.cookieCount !== 2) throw new Error(`cookieCount ${String(bridgeState.cookieCount)}`)
      if (!String(bridgeState.proxyUrl ?? '').startsWith('http://127.0.0.1:')) throw new Error(`proxyUrl ${String(bridgeState.proxyUrl)}`)
      if (!String(bridgeState.entryUrl ?? '').startsWith(String(bridgeState.proxyUrl))) throw new Error('entryUrl not on proxy origin')
    })

    if (bridgeState.ok === true && bridgeState.active === true) {
      const proxied = await fetch(new URL('/bridge-echo', bridgeState.proxyUrl))
      const proxiedBody = await proxied.json()
      check('bridge proxies the page and injects the imported cookie', () => {
        if (proxied.status !== 200) throw new Error(`status ${String(proxied.status)}`)
        if (!String(proxiedBody.cookie ?? '').includes('sid=abc')) throw new Error(`upstream cookie ${String(proxiedBody.cookie)}`)
        if (proxied.headers.get('x-frame-options') !== null) throw new Error('x-frame-options was not stripped')
        const csp = String(proxied.headers.get('content-security-policy') ?? '')
        if (csp.includes('frame-ancestors')) throw new Error(`frame-ancestors still present: ${csp}`)
      })

      const setRes = await fetch(new URL('/bridge-set', bridgeState.proxyUrl))
      const setCookie = String(setRes.headers.get('set-cookie') ?? '')
      check('bridge rewrites Set-Cookie for the proxy origin', () => {
        if (!setCookie.includes('token=xyz')) throw new Error(`set-cookie ${setCookie}`)
        if (setCookie.toLowerCase().includes('domain=')) throw new Error('domain was not removed')
        if (setCookie.toLowerCase().includes('samesite=none')) throw new Error('SameSite=None was not dropped')
        if (!setCookie.toLowerCase().includes('httponly')) throw new Error('HttpOnly was lost')
      })

      await setRes.arrayBuffer()
      const next = await fetch(new URL('/bridge-next', bridgeState.proxyUrl))
      const nextBody = await next.json()
      check('bridge keeps upstream session cookies in its own jar', () => {
        if (!String(nextBody.cookie ?? '').includes('token=xyz')) throw new Error(`upstream cookie ${String(nextBody.cookie)}`)
      })

      const redirect = await fetch(new URL('/bridge-redirect', bridgeState.proxyUrl), { redirect: 'manual' })
      check('bridge rewrites upstream redirects to the proxy origin', () => {
        const location = String(redirect.headers.get('location') ?? '')
        if (!location.startsWith(String(bridgeState.proxyUrl))) throw new Error(`location ${location}`)
        if (!location.endsWith('/bridge-next')) throw new Error(`location ${location}`)
      })

      const bridgeStop = await request(handler, 'POST', '/pocket-h5/bridge.json', JSON.stringify({ action: 'stop' }))
      const stoppedState = JSON.parse(String(bridgeStop.body ?? '{}'))
      check('POST bridge stop -> inactive', () => {
        if (stoppedState.active !== false) throw new Error(`state ${JSON.stringify(stoppedState)}`)
      })
      await new Promise((resolve) => setTimeout(resolve, 100))
      let reachable = true
      try {
        await fetch(new URL('/bridge-next', bridgeState.proxyUrl), { signal: AbortSignal.timeout(1000) })
      } catch {
        reachable = false
      }
      check('stopped bridge no longer accepts connections', () => {
        if (reachable) throw new Error('proxy still reachable after stop')
      })
    }

    // Safari 自动导入：本机未授完全磁盘访问时应返回可操作的错误；已授权则应成功。
    const safariStart = await request(
      handler,
      'POST',
      '/pocket-h5/bridge.json',
      JSON.stringify({ action: 'start', target: `http://127.0.0.1:${fixturePort}/` }),
    )
    const safariState = JSON.parse(String(safariStart.body ?? '{}'))
    check('Safari import reports permission or succeeds', () => {
      if (safariStart.status !== 200) throw new Error(`status ${String(safariStart.status)}`)
      if (safariState.ok === true) return
      if (safariState.code !== 'safari-permission' && safariState.code !== 'safari-missing') {
        throw new Error(`unexpected code ${String(safariState.code)}`)
      }
      if (safariState.code === 'safari-permission' && !String(safariState.message ?? '').includes('完全磁盘访问')) {
        throw new Error('permission message lacks the Full Disk Access hint')
      }
    })
    await request(handler, 'POST', '/pocket-h5/bridge.json', JSON.stringify({ action: 'stop' }))
  } finally {
    await request(handler, 'POST', '/pocket-h5/bridge.json', JSON.stringify({ action: 'stop' }))
    await new Promise((resolve) => fixture.close(resolve))
  }
}

// Dispose the fake registration to exercise the returned disposer.
try {
  returned()
  check('disposer removes the registered route', () => {
    if (route !== undefined) throw new Error('route still registered')
  })
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  failures.push(`dispose: ${message}`)
  console.error(`not ok - dispose: ${message}`)
}

if (failures.length > 0) {
  console.error(`\n${String(failures.length)} check(s) failed`)
  process.exitCode = 1
} else {
  console.log('\nall host smoke checks passed')
}
