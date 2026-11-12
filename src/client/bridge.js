/* ------------------------------------------------------------------ *
 * Pocket H5 —— 「登录桥」增值功能（client.js 的片段源，不是独立 ES 模块）
 *
 * 解决的问题：内嵌 iframe 用 DSH 应用自己的 Chromium 会话，拿不到 Safari 里
 * 已经登录的 Cookie。做法：Host 起一个只监听 127.0.0.1 的反向代理，把 Safari
 * 导入的 Cookie 注入上游请求；面板让 iframe 走这个代理（代理 origin 是
 * http://127.0.0.1:<随机端口>，root 挂载，页面里的绝对路径仍可用）。
 *
 * 边界（对话框里也写明）：
 *   - Cookie 只存在 Host 内存，停止/面板卸载/闲置 30 分钟即释放；
 *   - 只能带 Cookie 认证；页面里写死绝对地址、或调用其它域名 API 时不会经过代理；
 *   - 代理会剥离 X-Frame-Options 与 CSP frame-ancestors，让原本禁止嵌入的页面也能看；
 *   - 读 Safari Cookie 需要给 DSH 授「完全磁盘访问权限」；也支持手动粘贴 Cookie。
 * ------------------------------------------------------------------ */

const BRIDGE_CSS = `
/* ---- 登录桥（构建期追加，沿用工作台黑白灰） ---- */
.bridge-dialog { width: min(460px, calc(100vw - 40px)); padding: 24px 26px 22px; }
.bridge-dialog .dialog-heading h2 { margin: 8px 0 16px; font-size: 19px; letter-spacing: -.3px; }
.bridge-dialog .bridge-close { width: 32px; height: 32px; flex-shrink: 0; }
.bridge-body { display: flex; flex-direction: column; gap: 10px; font-size: 11.5px; line-height: 1.8; color: #565656; }
.bridge-target { font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; color: #4a4a4a; overflow-wrap: anywhere; }
.bridge-status { padding: 9px 11px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); font-size: 11px; line-height: 1.7; color: #5b5b5b; }
.bridge-status[data-tone="error"] { border-color: #bdbdbd; color: #2b2b2b; }
.bridge-status[data-tone="warn"] { border-color: #d0d0d0; color: #3d3d3d; }
.bridge-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.bridge-actions .outline-button { width: auto; flex: 1 1 200px; margin-top: 0; }
.bridge-actions .text-button { padding: 6px 4px; }
.bridge-manual { margin-top: 2px; }
.bridge-manual summary { cursor: pointer; font-size: 11px; color: #5f5f5f; }
.bridge-manual textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 64px;
  margin-top: 6px;
  padding: 8px 9px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface-2);
  font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #333333;
  resize: vertical;
}
.bridge-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-bottom: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 11px;
  color: #3d3d3d;
}
.bridge-banner .bridge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4a4a4a; flex-shrink: 0; }
.bridge-banner .bridge-banner-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bridge-banner .text-button { margin-left: auto; flex-shrink: 0; }
`

/** 桥接状态的展示文案（纯函数，便于冒烟测试）。 */
function bridgeBannerText(state) {
  if (!state || state.active !== true) return '登录桥未启用'
  const source = state.source === 'manual' ? '手动 Cookie' : 'Safari'
  return (
    '登录桥已启用 · ' +
    source +
    ' · ' +
    String(state.cookieCount ?? 0) +
    ' 个 Cookie · 预览经本机代理'
  )
}

/** 只允许 http/https 的预览地址走登录桥（dsh-app 示例页没有登录态可带）。 */
function bridgeCanTarget(url) {
  if (typeof url !== 'string' || url === '') return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 在面板里挂载「登录桥」按钮、对话框和状态条。
 * @param {ShadowRoot} shadow 面板 Shadow DOM
 * @returns {() => void} 清理函数（停止桥接并移除新增节点）
 */
function mountBridgeFeature(shadow) {
  const demoButton = shadow.getElementById('demoButton')
  const root = shadow.querySelector('.pocket-h5-root')
  const mainPanel = shadow.querySelector('.main-panel')
  if (!demoButton || !root || !mainPanel) return function () {}

  const endpoint = function () {
    return new URL('/pocket-h5/bridge.json', window.location.origin).href
  }

  const callBridge = async function (payload) {
    const response = await fetch(endpoint(), {
      method: payload === undefined ? 'GET' : 'POST',
      cache: 'no-store',
      headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    })
    return await response.json()
  }

  const button = document.createElement('button')
  button.id = 'bridgeButton'
  button.type = 'button'
  button.className = 'text-button small'
  button.title = '登录桥：用 Safari 已登录的 Cookie 经本机代理预览'
  button.setAttribute('aria-label', '登录桥')
  button.textContent = '登录桥'
  demoButton.insertAdjacentElement('afterend', button)

  // 顶部状态条（仅在桥接启用时出现）
  const banner = document.createElement('div')
  banner.id = 'bridgeBanner'
  banner.className = 'bridge-banner'
  banner.hidden = true
  banner.innerHTML =
    '<span class="bridge-dot" aria-hidden="true"></span>' +
    '<span class="bridge-banner-text" id="bridgeBannerText"></span>' +
    '<button type="button" class="text-button small" id="bridgeBannerStop">恢复直连</button>'
  const canvas = shadow.getElementById('canvas')
  if (canvas) mainPanel.insertBefore(banner, canvas)
  else mainPanel.append(banner)

  const dialog = document.createElement('dialog')
  dialog.id = 'bridgeDialog'
  dialog.className = 'bridge-dialog'
  dialog.innerHTML =
    '<div class="dialog-heading"><div><span class="eyebrow">登录态</span><h2>登录桥</h2></div>' +
    '<button type="button" class="icon-button bridge-close" aria-label="关闭登录桥">' +
    '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>' +
    '<div class="bridge-body">' +
    '<p class="bridge-target" id="bridgeTargetText"></p>' +
    '<div class="bridge-status" id="bridgeStatus" data-tone="info">正在读取状态…</div>' +
    '<div class="bridge-actions">' +
    '<button type="button" class="outline-button" id="bridgeStart">从 Safari 导入并开启桥接</button>' +
    '<button type="button" class="text-button small" id="bridgeRefresh">重新导入</button>' +
    '<button type="button" class="text-button small" id="bridgeStop">停止桥接</button>' +
    '</div>' +
    '<details class="bridge-manual"><summary>读取不到 Safari（或不想授权）？手动粘贴 Cookie</summary>' +
    '<textarea id="bridgeManualCookies" spellcheck="false" placeholder="从 DevTools 复制的完整 Cookie 请求头，例如：sid=...; token=..."></textarea>' +
    '<div class="bridge-actions"><button type="button" class="outline-button" id="bridgeManualStart">用手动 Cookie 开启桥接</button></div>' +
    '</details>' +
    '<p>只用 Cookie 认证；密码/扫码类登录仍需在预览里完成。停止、面板卸载或闲置 30 分钟会释放 Cookie。</p>' +
    '</div>'
  root.append(dialog)

  const statusEl = shadow.getElementById('bridgeStatus')
  const targetEl = shadow.getElementById('bridgeTargetText')
  const bannerText = shadow.getElementById('bridgeBannerText')
  const manualInput = shadow.getElementById('bridgeManualCookies')

  const setStatus = function (text, tone) {
    statusEl.textContent = text
    statusEl.setAttribute('data-tone', tone || 'info')
  }

  const showBanner = function (state) {
    if (!state || state.active !== true) {
      banner.hidden = true
      bannerText.textContent = ''
      return
    }
    banner.hidden = false
    bannerText.textContent = bridgeBannerText(state)
  }

  const previewFrame = function () {
    return shadow.getElementById('previewFrame')
  }

  /** 应用桥接状态：iframe 改为加载代理地址；关闭时恢复直连。 */
  const applyState = function (state, reload) {
    const frame = previewFrame()
    if (!state || state.active !== true) {
      window.pocketBridge = null
      showBanner(null)
      return
    }
    window.pocketBridge = { target: state.target, entryUrl: state.entryUrl }
    showBanner(state)
    if (frame && (reload || frame.getAttribute('src') !== state.entryUrl)) frame.src = state.entryUrl
    if (state.warning) setStatus(state.warning, 'warn')
  }

  const currentTarget = function () {
    return pocketPreviewTarget(shadow)
  }

  const openDialog = async function () {
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    const target = currentTarget()
    const demo = pocketDemoUrl()
    if (!bridgeCanTarget(target) || target === demo) {
      targetEl.textContent = '当前预览不是可登录的 http(s) 地址'
      setStatus('先输入并打开你的 H5 地址（内置示例没有登录态可带），再开启登录桥。', 'warn')
      return
    }
    targetEl.textContent = target
    try {
      const state = await callBridge()
      if (state.active === true && state.target === target) {
        setStatus(bridgeBannerText(state), 'ok')
      } else if (state.active === true) {
        setStatus('当前有一个针对其它地址的桥接在运行；开启会替换它。', 'warn')
      } else {
        setStatus('尚未开启。开启后会从 Safari 读取该站点的 Cookie（需要给 DSH 完全磁盘访问权限）。')
      }
    } catch (error) {
      setStatus('读取桥接状态失败：Host 半可能需要重启 DSH 才会生效。', 'error')
    }
  }

  const closeDialog = function () {
    if (typeof dialog.close === 'function') dialog.close()
    else dialog.removeAttribute('open')
  }

  const startWith = async function (payload) {
    setStatus('正在启动登录桥…')
    let state
    try {
      state = await callBridge(payload)
    } catch (error) {
      setStatus('无法调用登录桥接口：Host 半可能需要重启 DSH 才会生效。', 'error')
      return
    }
    if (state.ok !== true) {
      if (state.code === 'safari-permission') {
        setStatus(
          state.message ||
            '读取 Safari Cookie 被系统拒绝：请到「系统设置 → 隐私与安全性 → 完全磁盘访问权限」添加 DSH NEXT 并打开开关，然后重启 DSH；或改用下方「手动粘贴 Cookie」。',
          'error',
        )
      } else {
        setStatus(state.message || '登录桥启动失败', 'error')
      }
      return
    }
    applyState(state, true)
    setStatus(bridgeBannerText(state), 'ok')
    closeDialog()
  }

  const startButton = shadow.getElementById('bridgeStart')
  const refreshButton = shadow.getElementById('bridgeRefresh')
  const stopButton = shadow.getElementById('bridgeStop')
  const manualButton = shadow.getElementById('bridgeManualStart')
  const bannerStop = shadow.getElementById('bridgeBannerStop')
  const closeButton = shadow.querySelector('#bridgeDialog .bridge-close')

  const onStart = function () {
    const target = currentTarget()
    if (!bridgeCanTarget(target) || target === pocketDemoUrl()) {
      setStatus('先打开一个真实的 H5 地址再开启登录桥。', 'warn')
      return
    }
    startWith({ action: 'start', target }).catch(function (error) {
      setStatus(String(error && error.message ? error.message : error), 'error')
    })
  }

  const onManualStart = function () {
    const target = currentTarget()
    if (!bridgeCanTarget(target) || target === pocketDemoUrl()) {
      setStatus('先打开一个真实的 H5 地址再开启登录桥。', 'warn')
      return
    }
    const cookies = String(manualInput.value || '').trim()
    if (cookies === '') {
      setStatus('先把浏览器里的 Cookie 请求头粘贴到文本框。', 'warn')
      return
    }
    startWith({ action: 'start', target, cookies }).catch(function (error) {
      setStatus(String(error && error.message ? error.message : error), 'error')
    })
  }

  const onRefresh = async function () {
    setStatus('正在从 Safari 重新导入…')
    try {
      const state = await callBridge({ action: 'refresh' })
      if (state.ok !== true) {
        setStatus(state.message || '重新导入失败', 'error')
        return
      }
      applyState(state, true)
      setStatus(bridgeBannerText(state), 'ok')
    } catch (error) {
      setStatus('重新导入失败：Host 半可能未加载。', 'error')
    }
  }

  const onStop = async function () {
    try {
      await callBridge({ action: 'stop' })
    } catch (error) {
      // Host 不可用时也要把面板恢复成直连。
    }
    const target = window.pocketBridge && window.pocketBridge.target
    window.pocketBridge = null
    showBanner(null)
    const frame = previewFrame()
    if (frame && bridgeCanTarget(target)) frame.src = target
    setStatus('已停止桥接，恢复直连（直连时没有 Safari 登录态）。')
  }

  button.addEventListener('click', function () {
    openDialog().catch(function ignore() {})
  })
  startButton.addEventListener('click', onStart)
  manualButton.addEventListener('click', onManualStart)
  refreshButton.addEventListener('click', function () {
    onRefresh().catch(function ignore() {})
  })
  stopButton.addEventListener('click', function () {
    onStop().catch(function ignore() {})
  })
  bannerStop.addEventListener('click', function () {
    onStop().catch(function ignore() {})
  })
  closeButton.addEventListener('click', closeDialog)
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return
    const rect = dialog.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog()
  })

  // 面板重新进入时恢复仍然存活的桥接（例如切换面板后又切回来）。
  callBridge()
    .then(function (state) {
      if (state.active !== true) return
      const target = currentTarget()
      window.pocketBridge = { target: state.target, entryUrl: state.entryUrl }
      showBanner(state)
      const frame = previewFrame()
      if (frame && state.entryUrl) frame.src = state.entryUrl
    })
    .catch(function ignore() {})

  return function disposeBridgeFeature() {
    const wasActive = window.pocketBridge !== null && window.pocketBridge !== undefined
    window.pocketBridge = null
    if (wasActive) {
      callBridge({ action: 'stop' }).catch(function ignore() {})
    }
    button.remove()
    banner.remove()
    dialog.remove()
  }
}
