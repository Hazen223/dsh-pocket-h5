/**
 * Host-half smoke test: no dependencies, no test runner.
 *
 * Builds a fake cordis context, captures the route registered by `apply`,
 * then calls the captured handler directly with fake request/response objects.
 *
 * Run with: node tests/host-smoke.mjs
 */
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

async function request(handler, method, url) {
  const res = makeRes()
  await handler({ method, url }, res)
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
