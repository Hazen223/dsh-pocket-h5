/* ------------------------------------------------------------------ *
 * Pocket H5 —— 「预览诊断」增值功能（client.js 的片段源，不是独立 ES 模块）
 *
 * 用户经常遇到「页面打不开」，但原因完全不同：站点禁止被 iframe 嵌入、
 * 被重定向到登录页、服务没启动、或登录需要弹窗。上游工具只能提示「页面可能
 * 通过 X-Frame-Options 禁止嵌入」，没有诊断入口。这里加一个「诊断」按钮：
 * 由 Host 半请求目标地址（只读响应头），把结论翻译成人话并给出下一步操作。
 * ------------------------------------------------------------------ */

const DIAGNOSIS_CSS = `
/* ---- 预览诊断（构建期追加，沿用工作台黑白灰） ---- */
.diagnose-dialog { width: min(430px, calc(100vw - 40px)); padding: 24px 26px 22px; }
.diagnose-dialog .dialog-heading h2 { margin: 8px 0 18px; font-size: 19px; letter-spacing: -.3px; }
.diagnose-dialog .diagnose-close { width: 32px; height: 32px; flex-shrink: 0; }
.diagnose-body { display: flex; flex-direction: column; gap: 10px; font-size: 11.5px; line-height: 1.8; color: #565656; }
.diagnose-loading { color: #757575; }
.diagnose-title { margin: 0; font-size: 13px; font-weight: 600; color: #2e2e2e; }
.diagnose-title[data-tone="error"] { color: #1f1f1f; }
.diagnose-title[data-tone="warn"] { color: #3a3a3a; }
.diagnose-lines, .diagnose-tips { margin: 0; padding-left: 16px; }
.diagnose-lines li, .diagnose-tips li { margin: 3px 0; overflow-wrap: anywhere; }
.diagnose-tips { border-top: 1px dashed var(--line-strong); padding-top: 10px; }
.diagnose-tips li b { font-weight: 600; color: #4a4a4a; }
.diagnose-badge {
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--surface-3);
  font-size: 10px;
  color: #4a4a4a;
}
`

/** 纯函数：把 Host 的探测结果翻译成标题 + 事实 + 建议（无 DOM，便于冒烟测试）。 */
function summarizeProbe(payload) {
  if (!payload || payload.ok !== true) {
    return {
      tone: 'error',
      title: '诊断没有完成',
      badge: '无法访问',
      lines: [payload && typeof payload.message === 'string' ? payload.message : '没有拿到诊断结果'],
      tips: ['先确认 H5 开发服务已在本机启动，地址与端口正确。', '如果刚更新过插件，Host 半需要重启 DSH 才会提供诊断接口。'],
    }
  }

  const lines = []
  const redirects = Array.isArray(payload.redirects) ? payload.redirects : []
  lines.push('HTTP ' + payload.status + (redirects.length > 0 ? '（经过 ' + redirects.length + ' 次跳转）' : ''))
  if (payload.finalUrl && payload.finalUrl !== payload.requestedUrl) lines.push('最终地址：' + payload.finalUrl)
  if (redirects.length > 0 && redirects[0].to) lines.push('第一次跳转：' + redirects[0].to)
  const framing = payload.framing || {}
  const login = payload.login || {}

  if (framing.allowed === false) {
    lines.push('嵌入限制：' + (framing.reason || '站点不允许被 iframe 嵌入'))
    return {
      tone: 'error',
      title: '站点禁止被嵌入',
      badge: '禁止 iframe',
      lines,
      tips: [
        '在 H5 开发服务里去掉 <b>X-Frame-Options</b>，或把 CSP 的 <b>frame-ancestors</b> 设为允许 <b>dsh-app://app</b>（浏览器版 GUI 再加 http://127.0.0.1:&lt;端口&gt;）。',
        '临时查看可以点「在系统浏览器打开」或用手机扫码；工具不会绕过站点限制。',
      ],
    }
  }

  if (login.detected === true) {
    lines.push('登录信号：' + (login.reason || '页面需要登录'))
    return {
      tone: 'warn',
      title: '页面需要登录',
      badge: '登录',
      lines,
      tips: [
        '在预览里直接登录一次：登录态保存在 DSH 应用自己的浏览器会话里，重启 DSH 后一般仍在。',
        '若登录依赖弹窗 / 第三方 SSO：弹窗会被系统浏览器接管，登录结果回传不到预览——请用「在系统浏览器打开」或手机扫码。',
      ],
    }
  }

  lines.push('嵌入限制：' + (framing.reason || '未发现限制'))
  lines.push('登录信号：' + (login.reason || '未检测到登录跳转'))
  return {
    tone: 'ok',
    title: '页面可以嵌入，未检测到登录跳转',
    badge: '看起来正常',
    lines,
    tips: [
      '如果预览仍然空白：可能是页面 JS 反嵌入、HTTPS 页面嵌入 HTTP 内容，或目标服务只接受特定来源。',
      '先用「在系统浏览器打开」确认站点本身可访问，再回到预览里登录。',
    ],
  }
}

/**
 * 在面板里挂载「诊断」按钮与结果对话框。
 * @param {ShadowRoot} shadow 面板 Shadow DOM（工作台标记已注入）
 * @returns {() => void} 清理函数
 */
function mountDiagnoseFeature(shadow) {
  const demoButton = shadow.getElementById('demoButton')
  const root = shadow.querySelector('.pocket-h5-root')
  if (!demoButton || !root) return function () {}

  const button = document.createElement('button')
  button.id = 'diagnoseButton'
  button.type = 'button'
  button.className = 'text-button small'
  button.title = '诊断当前预览地址：为什么打不开 / 是否需要登录'
  button.setAttribute('aria-label', '诊断当前预览地址')
  button.textContent = '诊断'
  demoButton.insertAdjacentElement('afterend', button)

  const dialog = document.createElement('dialog')
  dialog.id = 'diagnoseDialog'
  dialog.className = 'diagnose-dialog'
  dialog.innerHTML =
    '<div class="dialog-heading"><div><span class="eyebrow">预览诊断</span><h2>为什么打不开？</h2></div>' +
    '<button type="button" class="icon-button diagnose-close" aria-label="关闭诊断">' +
    '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>' +
    '<div class="diagnose-body" id="diagnoseBody"></div>'
  root.append(dialog)

  const bodyEl = shadow.getElementById('diagnoseBody')

  const clearBody = function () {
    bodyEl.replaceChildren()
  }

  const renderLoading = function (message) {
    clearBody()
    const loading = document.createElement('p')
    loading.className = 'diagnose-loading'
    loading.textContent = message
    bodyEl.append(loading)
  }

  const renderSummary = function (summary) {
    clearBody()
    const badge = document.createElement('span')
    badge.className = 'diagnose-badge'
    badge.textContent = summary.badge || (summary.tone === 'ok' ? '正常' : '注意')
    const title = document.createElement('p')
    title.className = 'diagnose-title'
    title.setAttribute('data-tone', summary.tone || 'ok')
    title.textContent = summary.title
    const lines = document.createElement('ul')
    lines.className = 'diagnose-lines'
    for (const line of summary.lines || []) {
      const item = document.createElement('li')
      item.textContent = line
      lines.append(item)
    }
    bodyEl.append(badge, title, lines)
    const tips = summary.tips || []
    if (tips.length > 0) {
      const tipList = document.createElement('ul')
      tipList.className = 'diagnose-tips'
      for (const tip of tips) {
        const item = document.createElement('li')
        // tips 是插件内固定文案（含少量 <b> 强调），不是用户输入。
        item.innerHTML = tip
        tipList.append(item)
      }
      bodyEl.append(tipList)
    }
  }

  const run = async function () {
    const preview = shadow.getElementById('previewFrame')
    const source = preview && preview.getAttribute('src') ? preview.getAttribute('src') : ''
    const demoUrl = pocketDemoUrl()
    if (!source || source === 'about:blank' || source === demoUrl || source.indexOf('dsh-app:') === 0) {
      renderSummary({
        tone: 'warn',
        title: '当前是内置示例',
        badge: '无地址',
        lines: ['先在上方输入并打开你的 H5 地址，再运行诊断。'],
        tips: [],
      })
      return
    }

    renderLoading('正在从 DSH 宿主机诊断该地址…')
    let payload = null
    try {
      const endpoint = new URL('/pocket-h5/probe.json', window.location.origin)
      endpoint.searchParams.set('url', source)
      const response = await fetch(endpoint.href, { cache: 'no-store' })
      payload = await response.json()
    } catch (error) {
      payload = { ok: false, message: '无法调用诊断接口：Host 半可能需要重启 DSH 才会生效' }
    }
    renderSummary(summarizeProbe(payload))
  }

  const open = function () {
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    run().catch(function ignore() {})
  }

  const close = function () {
    if (typeof dialog.close === 'function') dialog.close()
    else dialog.removeAttribute('open')
  }

  button.addEventListener('click', open)
  dialog.querySelector('.diagnose-close').addEventListener('click', close)
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return
    const rect = dialog.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
  })

  return function disposeDiagnoseFeature() {
    button.remove()
    dialog.remove()
  }
}
