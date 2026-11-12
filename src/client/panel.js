/* ------------------------------------------------------------------ *
 * Pocket H5 —— DSH 面板外壳（client.js 的片段源，不是独立 ES 模块）
 *
 * 由 build-client.mjs 原样插入 `window.__ModuleLoader__.load(...).factory` 内部，
 * 因此这里可以直接使用已声明的 React / h / CSS / MARKUP / mountPocketH5。
 *
 * 职责只有三件事：
 *   1) 把上游工作台装进面板内的 Shadow DOM（样式与宿主完全隔离）；
 *   2) 注册主面板 main(key=pocket-h5) 与左侧栏入口 sidebar.panellist(id=pocket-h5)；
 *   3) 卸载时释放工作台的监听器 / 定时器 / 观察器。
 * 预览本身仍由工作台里的 <iframe id="previewFrame"> 加载用户 H5，与上游一致。
 * ------------------------------------------------------------------ */

const POCKET_PANEL_ID = 'pocket-h5'
const POCKET_PANEL_LABEL = 'Pocket H5'

/**
 * 从 Host 的显示器探测结果里挑出当前窗口所在的那块屏幕。
 *
 * Host 返回 CoreGraphics 的 `{ pixelWidth/pixelHeight, widthMm/heightMm }`：
 * CoreGraphics 的 pixelWidth 是「模式宽度」，与浏览器的 CSS 像素宽度一致
 * （Retina 的 looks-like 模式也如此），所以用 screen.width/height 精确匹配即可。
 * 匹配不到时：只有一块屏就用它，否则返回 null（退回浏览器估算 + 尺子校准）。
 */
function pickHostDisplay(displays, screenWidth, screenHeight) {
  if (!Array.isArray(displays) || displays.length === 0) return null
  const usable = displays.filter(
    (display) =>
      display &&
      Number(display.pixelWidth) > 0 &&
      Number(display.pixelHeight) > 0 &&
      Number(display.widthMm) > 0,
  )
  if (usable.length === 0) return null
  const exact = usable.find(
    (display) => display.pixelWidth === screenWidth && display.pixelHeight === screenHeight,
  )
  if (exact) return exact
  if (usable.length === 1) return usable[0]
  return null
}

/** 一个 CSS 像素对应的物理密度（CSS px / inch），range 与上游 displayScale 校验一致。 */
function hostCssPixelsPerInch(display) {
  const widthMm = Number(display && display.widthMm)
  const pixelWidth = Number(display && display.pixelWidth)
  if (!Number.isFinite(widthMm) || !Number.isFinite(pixelWidth) || widthMm <= 0 || pixelWidth <= 0) return null
  const ppi = pixelWidth / (widthMm / 25.4)
  return ppi >= 16 && ppi <= 1100 ? ppi : null
}

/**
 * 取 Host 的显示器物理尺寸并交给上游 app.js：
 * app.js 的 displayScale() 本来就支持 `window.pocketDisplayMetrics`（Electron 时代的
 * preload 桥），这里用同形状的数据填上，再派发它监听的 `pocketdisplaychange`。
 * 这样面板里的 `100%` 也是真机物理大小，无需尺子校准；拿不到时保持原估算。
 */
async function applyHostDisplayMetrics() {
  let payload = null
  try {
    const endpoint = new URL('/pocket-h5/display.json', window.location.origin).href
    const response = await fetch(endpoint, { cache: 'no-store' })
    if (response.ok) payload = await response.json()
  } catch (error) {
    return false
  }
  const display = pickHostDisplay(payload && payload.displays, window.screen.width, window.screen.height)
  const ppi = hostCssPixelsPerInch(display)
  if (ppi === null) return false
  window.pocketDisplayMetrics = {
    displayKey: 'host:' + display.id + ':' + display.pixelWidth + 'x' + display.pixelHeight,
    cssPixelsPerInch: ppi,
  }
  try {
    window.dispatchEvent(new Event('pocketdisplaychange'))
  } catch (error) {
    /* 事件不可用时下一次 resize/render 也会读到新值 */
  }
  return true
}

/**
 * 首次进面板时取一次显示器尺寸；窗口在显示器之间移动 / 缩放变化（resize）
 * 时再取一次，保证 100% 始终对应当前这块屏。
 * @returns {() => void} 清理函数
 */
function watchHostDisplayMetrics() {
  let timer = 0
  const refresh = function () {
    clearTimeout(timer)
    timer = setTimeout(function () {
      applyHostDisplayMetrics().catch(function ignore() {})
    }, 250)
  }
  applyHostDisplayMetrics().catch(function ignore() {})
  window.addEventListener('resize', refresh)
  return function stopHostDisplayMetrics() {
    clearTimeout(timer)
    window.removeEventListener('resize', refresh)
  }
}

/**
 * 当前预览的「真实目标地址」。
 * 登录桥启用时 iframe 实际加载的是代理地址（`window.pocketBridge.entryUrl`），
 * 二维码、诊断、登录桥本身都应该针对原始目标，而不是代理地址。
 * @param {ShadowRoot} shadow
 */
function pocketPreviewTarget(shadow) {
  const frame = shadow.getElementById('previewFrame')
  const src = frame && frame.getAttribute('src') ? frame.getAttribute('src') : ''
  const bridge = window.pocketBridge
  if (bridge && src === bridge.entryUrl) return bridge.target
  return src
}

/** demo 页面由 Host 半注册在 /pocket-h5/demo.html（同源，避免 data: 与跨域策略）。 */
function pocketDemoUrl() {
  try {
    return new URL('/pocket-h5/demo.html', window.location.origin).href
  } catch (error) {
    return '/pocket-h5/demo.html'
  }
}

/** 主面板：Shadow DOM 承载上游工作台，卸载时执行 mountPocketH5 返回的 dispose。 */
function PocketH5Panel() {
  const hostRef = React.useRef(null)
  React.useEffect(function mountPanel() {
    const host = hostRef.current
    if (!host) return undefined
    let shadow = host.shadowRoot
    if (!shadow) shadow = host.attachShadow({ mode: 'open' })
    // 面板重新进入（含 React 严格模式重复执行）时重建干净的工作台。
    shadow.replaceChildren()

    const style = document.createElement('style')
    style.setAttribute('data-pocket-h5-style', '')
    style.textContent = CSS + QR_CSS + DIAGNOSIS_CSS + BRIDGE_CSS + PANEL_THEME_CSS
    const root = document.createElement('div')
    root.className = 'pocket-h5-root'
    root.innerHTML = MARKUP
    shadow.append(style, root)

    let dispose = null
    let disposeTheme = null
    let disposeQr = null
    let disposeDiagnose = null
    let disposeBridge = null
    let disposeDisplay = null
    try {
      dispose = mountPocketH5(shadow, pocketDemoUrl())
      // 外观层：把品牌/当前页面/状态/动作移到 48px 顶栏，并套上 FlowPilot 风格面层。
      disposeTheme = mountPanelTheme(shadow)
      // Host 能读到真实显示器毫米尺寸时，100% 就是真机大小；失败保持浏览器估算。
      disposeDisplay = watchHostDisplayMetrics()
      // 上游工作台之外新增的「手机扫码」入口；失败不影响预览本身。
      disposeQr = mountQrFeature(shadow)
      // 「诊断」入口：解释页面为什么打不开（禁止嵌入 / 需要登录）。
      disposeDiagnose = mountDiagnoseFeature(shadow)
      // 「登录桥」入口：用 Safari 已登录 Cookie 经本机代理预览。
      disposeBridge = mountBridgeFeature(shadow)
    } catch (error) {
      console.error('[pocket-h5] 工作台初始化失败', error)
    }
    return function unmountPanel() {
      try {
        if (typeof dispose === 'function') dispose()
      } catch (error) {
        console.error('[pocket-h5] 工作台清理失败', error)
      }
      try {
        if (typeof disposeQr === 'function') disposeQr()
      } catch (error) {
        console.error('[pocket-h5] 二维码入口清理失败', error)
      }
      try {
        if (typeof disposeDiagnose === 'function') disposeDiagnose()
      } catch (error) {
        console.error('[pocket-h5] 诊断入口清理失败', error)
      }
      try {
        if (typeof disposeBridge === 'function') disposeBridge()
      } catch (error) {
        console.error('[pocket-h5] 登录桥清理失败', error)
      }
      try {
        if (typeof disposeTheme === 'function') disposeTheme()
      } catch (error) {
        console.error('[pocket-h5] 外观层清理失败', error)
      }
      try {
        if (typeof disposeDisplay === 'function') disposeDisplay()
      } catch (error) {
        console.error('[pocket-h5] 显示器监听清理失败', error)
      }
    }
  }, [])
  return h('div', {
    ref: hostRef,
    className: 'pocket-h5-panel',
    style: { flex: '1 1 auto', minHeight: 0, minWidth: 0, height: '100%', display: 'block' },
  })
}

/** 侧栏图标：复用上游 i-phone 图形（圆角手机 + 听筒/Home 短线），跟随侧栏文字颜色。 */
function PocketH5Glyph(props) {
  const size = props && Number(props.size) > 0 ? Number(props.size) : 18
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    h('rect', { x: 6, y: 2, width: 12, height: 20, rx: 3 }),
    h('path', { d: 'M10 5h4M11 19h2' }),
  )
}

/**
 * 槽位注册。main 用 keyed 槽位（key 必须与 sidebar.panellist 的 id 相同，
 * 宿主点击侧栏图标时调用 layout.selectPanel('pocket-h5') 才能命中）。
 */
function pocketApply(ctx) {
  const guard = (label, register) => {
    try {
      register()
    } catch (error) {
      console.warn('[pocket-h5] 槽位注册失败（' + label + '）：', error)
    }
  }
  guard('main', function () {
    ctx.slots.inject('main', function () {
      return ctx.slots.register({ name: 'main', key: POCKET_PANEL_ID }, PocketH5Panel)
    })
  })
  guard('sidebar.panellist', function () {
    ctx.slots.inject('sidebar.panellist', function () {
      return ctx.slots.register(
        {
          name: 'sidebar.panellist',
          id: POCKET_PANEL_ID,
          order: 95,
          label: POCKET_PANEL_LABEL,
        },
        PocketH5Glyph,
      )
    })
  })
}
