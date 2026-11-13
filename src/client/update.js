/* ------------------------------------------------------------------ *
 * Pocket H5 —— 「版本与更新」（client.js 的片段源，不是独立 ES 模块）
 *
 * 和 FlowPilot 同一套语义：当前版本 / 构建身份 / 最新 tag / 是否有更新 /
 * 最近检查时间；Host 侧每 6 小时自动检查、面板打开时按需检查。
 * 面板只展示与打开发布页、复制安装命令；不在宿主进程里改自己的安装目录。
 * ------------------------------------------------------------------ */

const UPDATE_API = '/pocket-h5/update.json'
const UPDATE_STORAGE_KEY = 'pocket-h5-update-v1'
const UPDATE_AUTO_INTERVAL_MS = 6 * 60 * 60 * 1000

const UPDATE_CSS = `
/* ---- 版本与更新（构建期追加） ---- */
.ph-version-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--p-border);
  font-size: 10.5px;
  color: var(--p-text-tertiary);
}
.ph-version {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  padding: 0;
  border: 0;
  border-radius: var(--p-radius-xs);
  background: transparent;
  color: var(--p-text-tertiary);
  font-size: 10.5px;
  cursor: pointer;
}
.ph-version b {
  font: 10.5px var(--p-mono);
  font-weight: 500;
  color: var(--p-text-dim);
}
.ph-version:hover { color: var(--p-text); }
.ph-version:hover b { color: var(--p-text); }
.ph-update-badge {
  margin-left: auto;
  padding: 2px 8px;
  border: 0;
  border-radius: 999px;
  background: var(--p-surface-2);
  color: var(--p-text);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}
.ph-update-badge:hover { background: var(--p-hover); }
.update-dialog { width: min(480px, calc(100vw - 40px)); padding: 24px 26px 22px; }
.update-dialog .dialog-heading h2 { margin: 8px 0 16px; font-size: 19px; letter-spacing: -0.3px; }
.update-dialog .update-close { width: 32px; height: 32px; flex-shrink: 0; }
.update-body { display: flex; flex-direction: column; gap: 12px; font-size: 11.5px; line-height: 1.7; color: var(--p-text-dim); }
.update-grid { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 6px 10px; margin: 0; }
.update-grid dt { color: var(--p-text-tertiary); }
.update-grid dd { margin: 0; min-width: 0; overflow-wrap: anywhere; color: var(--p-text-dim); }
.update-grid dd b { font-weight: 600; color: var(--p-text); }
.update-grid dd code { font: 10.5px var(--p-mono); color: var(--p-text-dim); }
.update-status {
  padding: 9px 11px;
  border: 1px solid var(--p-border);
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
  color: var(--p-text-dim);
  font-size: 11px;
  line-height: 1.7;
}
.update-status[data-tone="warn"] { color: var(--p-text); font-weight: 500; }
.update-status[data-tone="error"] { color: var(--p-text); }
.update-command {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
}
.update-command code {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  font: 10.5px var(--p-mono);
  color: var(--p-text-dim);
}
.update-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.update-actions .outline-button { flex: 1 1 160px; margin-top: 0; }
.update-auto {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  font-size: 11.5px;
  color: var(--p-text-dim);
  cursor: pointer;
}
.update-auto input { accent-color: var(--p-brand); }
.update-note { font-size: 10.5px; line-height: 1.7; color: var(--p-text-tertiary); }
`

/* ---------------- 纯函数（便于冒烟测试） ---------------- */

function updateVersionLabel(status) {
  if (!status || typeof status.currentVersion !== 'string' || status.currentVersion === '') return '—'
  return 'v' + status.currentVersion
}

function updateBuildText(status) {
  if (!status) return '—'
  const label = typeof status.buildLabel === 'string' && status.buildLabel !== '' ? status.buildLabel : status.currentVersion
  const channel = status.build && typeof status.build.channel === 'string' && status.build.channel !== '' ? status.build.channel : null
  return channel === null ? label : label + ' · ' + channel
}

function updateBadgeLabel(status) {
  if (!status || status.updateAvailable !== true) return ''
  const latest = typeof status.latestVersion === 'string' && status.latestVersion !== '' ? status.latestVersion : ''
  return latest === '' ? '可更新' : 'v' + latest + ' 可更新'
}

/** 从 GitHub 网页地址取 `owner/repo`（安装命令用）。 */
function updateRepoSlug(status) {
  const web = status && typeof status.repoWebUrl === 'string' ? status.repoWebUrl : ''
  const match = /^https?:\/\/[^/]+\/([^/]+)\/([^/#?]+)/.exec(web)
  if (match === null) return ''
  return match[1] + '/' + match[2].replace(/\.git$/, '')
}

function updateInstallCommand(status) {
  if (!status || status.updateAvailable !== true) return ''
  const slug = updateRepoSlug(status)
  const tag = typeof status.latestTag === 'string' && status.latestTag !== '' ? status.latestTag : 'v' + status.latestVersion
  if (slug === '') return ''
  return 'plugin_manager install_bundle target=github:' + slug + '#' + tag
}

function updateNeedsCheck(status, now, intervalMs) {
  const interval = Number(intervalMs) > 0 ? Number(intervalMs) : UPDATE_AUTO_INTERVAL_MS
  if (!status || typeof status.checkedAt !== 'string' || status.checkedAt === '') return true
  const checked = Date.parse(status.checkedAt)
  if (!Number.isFinite(checked)) return true
  return now - checked > interval
}

/* ---------------- 设置持久化 ---------------- */

function updateReadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(UPDATE_STORAGE_KEY) || '{}')
    if (raw === null || typeof raw !== 'object') return { autoCheck: true }
    return { autoCheck: raw.autoCheck !== false }
  } catch (error) {
    return { autoCheck: true }
  }
}

function updateWriteSettings(settings) {
  try {
    localStorage.setItem(UPDATE_STORAGE_KEY, JSON.stringify({ autoCheck: settings.autoCheck !== false }))
  } catch (error) {
    /* 存储不可用时保持默认 */
  }
}

/* ---------------- UI ---------------- */

/**
 * 在面板里挂载「版本与更新」：侧栏页脚一行版本，点击打开对话框。
 * @param {ShadowRoot} shadow
 * @returns {() => void}
 */
function mountUpdateFeature(shadow) {
  const sidebar = shadow.querySelector('.sidebar')
  const foot = shadow.querySelector('.ph-sidebar-foot')
  const root = shadow.querySelector('.pocket-h5-root')
  if (!sidebar || !root) return function () {}
  const host = foot || sidebar

  const settings = updateReadSettings()
  let status = null
  let autoTimer = null
  let disposed = false

  const row = document.createElement('div')
  row.id = 'updateRow'
  row.className = 'ph-version-row'
  row.innerHTML =
    '<button type="button" class="ph-version" id="updateVersionButton">Pocket H5 <b id="updateVersionText">—</b></button>' +
    '<button type="button" class="ph-update-badge" id="updateBadge" hidden></button>'
  host.append(row)

  const dialog = document.createElement('dialog')
  dialog.id = 'updateDialog'
  dialog.className = 'update-dialog'
  dialog.innerHTML =
    '<div class="dialog-heading"><div><span class="eyebrow">版本</span><h2>版本与更新</h2></div>' +
    '<button type="button" class="icon-button update-close" aria-label="关闭版本信息">' +
    '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>' +
    '<div class="update-body">' +
    '<dl class="update-grid">' +
    '<dt>当前</dt><dd><b id="updateCurrent">—</b> <span id="updateBuild"></span></dd>' +
    '<dt>最新</dt><dd id="updateLatest">—</dd>' +
    '<dt>检查</dt><dd id="updateChecked">尚未检查</dd>' +
    '<dt>仓库</dt><dd><code id="updateRepo">—</code></dd>' +
    '</dl>' +
    '<div class="update-status" id="updateStatus" data-tone="info">读取版本状态…</div>' +
    '<div class="update-command" id="updateCommandRow" hidden><code id="updateCommand"></code>' +
    '<button type="button" class="text-button small" id="updateCopy">复制</button></div>' +
    '<label class="update-auto"><input type="checkbox" id="updateAuto" ' + (settings.autoCheck ? 'checked' : '') + '> 自动检查更新（每 6 小时）</label>' +
    '<div class="update-actions">' +
    '<button type="button" class="outline-button" id="updateCheck">检查更新</button>' +
    '<button type="button" class="text-button small" id="updateRelease">打开发布页</button>' +
    '<button type="button" class="text-button small" id="updateReload">刷新状态</button>' +
    '</div>' +
    '<p class="update-note">更新不会自动安装：按发布的 tag 重新安装（复制上方命令到插件管理）或更新本机源码后重启 DSH。' +
    '自动检查只在后台读取远端 tag，不下载任何文件。</p>' +
    '</div>'
  root.append(dialog)

  const versionText = shadow.getElementById('updateVersionText')
  const badge = shadow.getElementById('updateBadge')
  const currentEl = shadow.getElementById('updateCurrent')
  const buildEl = shadow.getElementById('updateBuild')
  const latestEl = shadow.getElementById('updateLatest')
  const checkedEl = shadow.getElementById('updateChecked')
  const repoEl = shadow.getElementById('updateRepo')
  const statusEl = shadow.getElementById('updateStatus')
  const commandRow = shadow.getElementById('updateCommandRow')
  const commandEl = shadow.getElementById('updateCommand')
  const autoInput = shadow.getElementById('updateAuto')

  const setStatus = function (text, tone) {
    statusEl.textContent = text
    statusEl.setAttribute('data-tone', tone || 'info')
  }

  const relativeTime = function (iso) {
    if (typeof iso !== 'string' || iso === '') return '尚未检查'
    const time = Date.parse(iso)
    if (!Number.isFinite(time)) return '尚未检查'
    const minutes = Math.max(0, Math.round((Date.now() - time) / 60000))
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return minutes + ' 分钟前'
    const hours = Math.round(minutes / 60)
    if (hours < 48) return hours + ' 小时前'
    return Math.round(hours / 24) + ' 天前'
  }

  const render = function () {
    if (status === null) {
      versionText.textContent = '—'
      return
    }
    versionText.textContent = updateVersionLabel(status)
    currentEl.textContent = updateVersionLabel(status)
    buildEl.textContent = updateBuildText(status)
    latestEl.textContent = status.latestVersion ? 'v' + status.latestVersion : '—'
    checkedEl.textContent = relativeTime(status.checkedAt) + (status.checkedAgeHours !== null && status.checkedAgeHours > 6 ? ' · 已过期' : '')
    repoEl.textContent = status.repoWebUrl || status.repo || '—'
    const badgeText = updateBadgeLabel(status)
    badge.hidden = badgeText === ''
    badge.textContent = badgeText
    const command = updateInstallCommand(status)
    commandRow.hidden = command === ''
    commandEl.textContent = command
    if (status.error !== null) {
      setStatus('检查失败：' + status.error.message + '（可稍后重试）', 'error')
    } else if (status.updateAvailable) {
      setStatus('发现新版本 v' + status.latestVersion + '：安装后用「刷新状态」确认，重启 DSH 生效。', 'warn')
    } else if (status.devBuild) {
      setStatus('本地开发版（' + updateBuildText(status) + '）：可以检查远端 tag；更新代码后重启 DSH 即可。', 'info')
    } else if (status.latestVersion) {
      setStatus('已是最新：当前 v' + status.currentVersion + '。', 'info')
    } else {
      setStatus('尚未检查远端版本；点「检查更新」读取发布 tag。', 'info')
    }
    if (autoInput.checked !== settings.autoCheck) autoInput.checked = settings.autoCheck
  }

  const request = async function (payload, signal) {
    const options = {
      method: payload === undefined ? 'GET' : 'POST',
      cache: 'no-store',
      headers: { accept: 'application/json' },
      signal,
    }
    if (payload !== undefined) {
      options.headers['content-type'] = 'application/json'
      options.body = JSON.stringify(payload)
    }
    const response = await fetch(new URL(UPDATE_API, window.location.origin).href, options)
    return await response.json()
  }

  const loadStatus = async function () {
    try {
      const next = await request()
      if (next && next.ok === true) status = next
    } catch (error) {
      /* Host 未重启等情况下保持旧状态 */
    }
    render()
  }

  const runCheck = async function (manual) {
    if (manual) setStatus('正在检查远端版本…')
    try {
      const next = await request({ action: 'check', force: true })
      if (next && next.ok === true) status = next
      render()
    } catch (error) {
      setStatus('检查失败：无法调用更新接口（Host 半可能需要重启 DSH）', 'error')
    }
  }

  const armAutoTimer = function () {
    if (autoTimer !== null) {
      clearInterval(autoTimer)
      autoTimer = null
    }
    if (!settings.autoCheck) return
    autoTimer = setInterval(function () {
      if (!disposed) runCheck(false).catch(function ignore() {})
    }, UPDATE_AUTO_INTERVAL_MS)
  }

  const openDialog = async function () {
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
    await loadStatus()
    autoInput.checked = settings.autoCheck
    if (settings.autoCheck && updateNeedsCheck(status, Date.now(), UPDATE_AUTO_INTERVAL_MS)) {
      runCheck(false).catch(function ignore() {})
    }
  }

  const closeDialog = function () {
    if (typeof dialog.close === 'function') dialog.close()
    else dialog.removeAttribute('open')
  }

  const onCopy = async function () {
    const command = commandEl.textContent || ''
    if (command === '') return
    try {
      await navigator.clipboard.writeText(command)
      setStatus('安装命令已复制到剪贴板。', 'info')
    } catch (error) {
      setStatus('无法访问剪贴板，请手动选中命令复制。', 'error')
    }
  }

  const onAutoChange = function () {
    settings.autoCheck = autoInput.checked === true
    updateWriteSettings(settings)
    armAutoTimer()
    if (settings.autoCheck) runCheck(false).catch(function ignore() {})
    else setStatus('已关闭自动检查；仍可手动检查。', 'info')
  }

  shadow.getElementById('updateVersionButton').addEventListener('click', function () {
    openDialog().catch(function ignore() {})
  })
  badge.addEventListener('click', function () {
    openDialog().catch(function ignore() {})
  })
  shadow.querySelector('#updateDialog .update-close').addEventListener('click', closeDialog)
  shadow.getElementById('updateCheck').addEventListener('click', function () {
    runCheck(true).catch(function ignore() {})
  })
  shadow.getElementById('updateReload').addEventListener('click', function () {
    loadStatus().catch(function ignore() {})
  })
  shadow.getElementById('updateRelease').addEventListener('click', function () {
    const url = status && (status.releaseUrl || status.releasesUrl)
    if (typeof url === 'string' && url !== '') window.open(url, '_blank', 'noopener,noreferrer')
  })
  shadow.getElementById('updateCopy').addEventListener('click', function () {
    onCopy().catch(function ignore() {})
  })
  autoInput.addEventListener('change', onAutoChange)
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return
    const rect = dialog.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog()
  })

  // 首次进入：读状态；自动检查开启且已过期（或从未检查）→ 触发一次后台检查。
  loadStatus()
    .then(function () {
      if (settings.autoCheck && updateNeedsCheck(status, Date.now(), UPDATE_AUTO_INTERVAL_MS)) {
        return runCheck(false)
      }
      return undefined
    })
    .catch(function ignore() {})
  armAutoTimer()

  return function disposeUpdateFeature() {
    disposed = true
    if (autoTimer !== null) clearInterval(autoTimer)
    autoTimer = null
    row.remove()
    dialog.remove()
  }
}
