/**
 * Host half · 版本检查（与 FlowPilot 同一套语义，去掉一键安装/重启）
 *
 * - `status()`：当前版本 / 构建身份 / 仓库 / 安装形态 / 最新 tag / 是否有更新 /
 *   最近检查时间 / 上次错误；面板只读这个结构。
 * - `check({force})`：`git ls-remote --tags --refs <repo>` 读取远端 tag（沿用本机 git 凭据），
 *   30 分钟缓存 + 并发去重；失败只记 lastError，不抛到路由层。
 * - `start()`：启动 5s 后静默检查一次，之后每 6 小时检查一次；返回 dispose。
 * - 不自动安装：更新动作由 `npm run release` / `public:sync` 或插件管理器完成，面板给出
 *   发布页与安装命令，避免在宿主进程里改自己的安装目录。
 *
 * 只依赖 node 内置模块；runGit / now / auto 可注入，便于单测。
 */
import { execFile } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 默认缓存 30 分钟，自动检查 6 小时。 */
export const UPDATE_CACHE_TTL_MS = 30 * 60 * 1000
export const UPDATE_AUTO_INTERVAL_MS = 6 * 60 * 60 * 1000
const GIT_TIMEOUT_MS = 15_000

/** 去掉 `git+` / `git@github.com:` / 尾部 `.git`。 */
export function normalizeRepoUrl(value) {
  if (typeof value !== 'string') return ''
  let text = value.trim()
  if (text === '') return ''
  if (text.startsWith('git+')) text = text.slice(4)
  if (text.startsWith('git@github.com:')) text = 'https://github.com/' + text.slice('git@github.com:'.length)
  if (text.endsWith('.git')) text = text.slice(0, -4)
  return text
}

/** 仓库地址 → 网页地址（GitHub/GitLab 等 https 地址直接可用）。 */
export function repoWebUrl(repo) {
  const normalized = normalizeRepoUrl(repo)
  if (!/^https?:\/\//i.test(normalized)) return ''
  return normalized.replace(/\/+$/, '')
}

/** `v1.2.3` / `1.2.3` / `1.2.3-beta.1` → 版本对象；非法返回 null。 */
export function parseVersion(value) {
  const text = value === undefined || value === null ? '' : String(value).trim()
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(text)
  if (!match) return null
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), pre: match[4] || '' }
}

/** 语义化版本比较：a>b → 1，a<b → -1，相等 → 0；无法解析的排在最后。 */
export function compareVersions(a, b) {
  const left = parseVersion(a)
  const right = parseVersion(b)
  if (left === null && right === null) return 0
  if (left === null) return -1
  if (right === null) return 1
  for (const key of ['major', 'minor', 'patch']) {
    if (left[key] !== right[key]) return left[key] > right[key] ? 1 : -1
  }
  if (left.pre === right.pre) return 0
  if (left.pre === '') return 1
  if (right.pre === '') return -1
  return left.pre > right.pre ? 1 : -1
}

/** `git ls-remote --tags --refs` 输出 → 版本倒序的 [{ version, tag }]。 */
export function extractTags(stdout) {
  const found = new Map()
  for (const line of String(stdout || '').split('\n')) {
    const match = /refs\/tags\/(v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(line.trim())
    if (match === null) continue
    const tag = match[1]
    const version = tag.replace(/^v/, '')
    if (parseVersion(version) === null) continue
    found.set(version, { version, tag })
  }
  return [...found.values()].sort((left, right) => compareVersions(right.version, left.version))
}

/** 读取 build-client.mjs 生成的 build-info.json；缺文件/损坏时回退 package.json。 */
export function readBuildInfo(pluginRoot, version) {
  const fallback = { version: version ?? null, label: version ?? null, channel: null, sha: null, dirty: null, builtAt: null }
  try {
    const raw = JSON.parse(readFileSync(join(pluginRoot, 'build-info.json'), 'utf8'))
    if (raw === null || typeof raw !== 'object') return fallback
    return {
      version: typeof raw.version === 'string' ? raw.version : fallback.version,
      label: typeof raw.label === 'string' ? raw.label : fallback.label,
      channel: typeof raw.channel === 'string' ? raw.channel : null,
      sha: typeof raw.sha === 'string' ? raw.sha : null,
      dirty: typeof raw.dirty === 'boolean' ? raw.dirty : null,
      builtAt: typeof raw.builtAt === 'string' ? raw.builtAt : null,
    }
  } catch {
    return fallback
  }
}

function readJsonFile(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

/** `<profile>/node_modules/dsh-pocket-h5` → `<profile>`；link 开发安装返回 null。 */
export function detectProfileDir(pluginRoot) {
  const marker = `${sep}node_modules${sep}dsh-pocket-h5`
  if (typeof pluginRoot !== 'string' || !pluginRoot.endsWith(marker)) return null
  const profileDir = pluginRoot.slice(0, pluginRoot.length - marker.length)
  const manifest = readJsonFile(join(profileDir, 'package.json'))
  if (manifest === null || typeof manifest !== 'object' || manifest.dsh === undefined) return null
  return profileDir
}

/** link 安装 / 工作树带 .git / build-info 标记 dev / 显式环境变量 → 本地开发版。 */
export function detectDevBuild({ mode, pluginRoot, env, buildInfo } = {}) {
  if (mode === 'link') return true
  const channel = String((env ?? process.env)?.POCKET_H5_CHANNEL ?? '').toLowerCase()
  if (channel === 'dev' || channel === 'beta' || channel === 'local') return true
  if (buildInfo !== null && buildInfo !== undefined) {
    if (buildInfo.channel === 'dev' || buildInfo.dirty === true) return true
  }
  if (typeof pluginRoot === 'string' && pluginRoot !== '') {
    try {
      if (existsSync(join(pluginRoot, '.git'))) return true
    } catch {
      /* ignore */
    }
  }
  return false
}

function execPromise(file, args, options) {
  return new Promise((resolve) => {
    try {
      execFile(file, args, options, (error, stdout, stderr) => {
        resolve({
          ok: !error,
          code: error && typeof error.code === 'number' ? error.code : error ? 1 : 0,
          stdout: String(stdout || ''),
          stderr: String(stderr || ''),
          message: error ? String(error.message || error) : '',
        })
      })
    } catch (error) {
      resolve({ ok: false, code: 1, stdout: '', stderr: '', message: String(error && error.message ? error.message : error) })
    }
  })
}

function defaultRunGit(repo, options = {}) {
  return execPromise(
    '/usr/bin/git',
    ['ls-remote', '--tags', '--refs', repo],
    {
      timeout: options.timeoutMs || GIT_TIMEOUT_MS,
      maxBuffer: 2 * 1024 * 1024,
      cwd: options.cwd,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never', GIT_ASKPASS: '/usr/bin/true' },
    },
  )
}

function defaultPluginRoot() {
  return dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
}

/**
 * 创建更新服务。
 * @param {object} [options]
 * @param {string} [options.pluginRoot]
 * @param {string} [options.version]
 * @param {string} [options.repo] - 覆盖 package.json 的仓库地址
 * @param {'profile'|'link'} [options.mode]
 * @param {object} [options.buildInfo]
 * @param {Function} [options.runGit] - (repo, {cwd,timeoutMs}) => Promise<{ok,stdout,stderr,message}>
 * @param {Function} [options.now]
 * @param {number} [options.cacheTtlMs]
 * @param {boolean} [options.auto] - 是否启动定时检查（默认 true）
 * @param {number} [options.startupDelayMs]
 * @param {number} [options.autoIntervalMs]
 * @param {Function} [options.logger]
 */
export function createUpdateService(options = {}) {
  const pluginRoot = options.pluginRoot || defaultPluginRoot()
  const manifest = readJsonFile(join(pluginRoot, 'package.json')) || {}
  const version = options.version || (typeof manifest.version === 'string' ? manifest.version : '0.0.0')
  const repo = options.repo !== undefined
    ? normalizeRepoUrl(options.repo)
    : normalizeRepoUrl(manifest.repository?.url || manifest.repository || '')
  const mode = options.mode || (detectProfileDir(pluginRoot) === null ? 'link' : 'profile')
  const buildInfo = options.buildInfo !== undefined
    ? Object.assign({ version, label: version, channel: null, sha: null, dirty: null, builtAt: null }, options.buildInfo || {})
    : readBuildInfo(pluginRoot, version)
  const devBuild = detectDevBuild({ mode, pluginRoot, env: options.env, buildInfo })
  const now = options.now || (() => Date.now())
  const cacheTtlMs = Number(options.cacheTtlMs) > 0 ? Number(options.cacheTtlMs) : UPDATE_CACHE_TTL_MS
  const runGit = options.runGit || ((repoUrl, runOptions) => defaultRunGit(repoUrl, runOptions))
  const logger = options.logger || console

  let cache = null
  let inflight = null
  let timer = null
  let startupTimer = null
  let disposed = false

  function isoOf(millis) {
    return millis === null || millis === undefined ? null : new Date(millis).toISOString()
  }

  function latest() {
    return cache !== null ? cache.latestVersion : null
  }

  function status() {
    const latestVersion = latest()
    const newer = latestVersion !== null && compareVersions(latestVersion, version) > 0
    const web = repoWebUrl(repo)
    const rawTag = cache !== null && cache.rawTag !== null ? cache.rawTag : (latestVersion !== null ? 'v' + latestVersion : null)
    return {
      ok: true,
      currentVersion: version,
      buildLabel: buildInfo.label || version,
      build: {
        version: buildInfo.version ?? version,
        label: buildInfo.label ?? version,
        channel: buildInfo.channel ?? null,
        sha: buildInfo.sha ?? null,
        dirty: buildInfo.dirty ?? null,
        builtAt: buildInfo.builtAt ?? null,
      },
      repo,
      repoWebUrl: web,
      mode,
      devBuild,
      latestVersion,
      latestTag: rawTag,
      updateAvailable: newer,
      releaseUrl: newer && rawTag !== null && web !== '' ? `${web}/releases/tag/${encodeURIComponent(rawTag)}` : null,
      releasesUrl: web !== '' ? `${web}/releases` : null,
      checkedAt: cache !== null ? isoOf(cache.checkedAt) : null,
      checkedAgeHours: cache !== null ? Math.round(((now() - cache.checkedAt) / 3_600_000) * 10) / 10 : null,
      autoCheck: options.auto !== false,
      autoIntervalHours: Math.round(((Number(options.autoIntervalMs) > 0 ? Number(options.autoIntervalMs) : UPDATE_AUTO_INTERVAL_MS) / 3_600_000) * 10) / 10,
      cacheTtlMinutes: Math.round(cacheTtlMs / 60_000),
      error: cache !== null ? cache.error : null,
    }
  }

  function recordError(code, message) {
    cache = {
      checkedAt: now(),
      latestVersion: null,
      rawTag: null,
      error: { code, message: String(message), at: isoOf(now()) },
    }
  }

  async function check(checkOptions = {}) {
    const force = checkOptions.force === true
    if (disposed) return status()
    if (inflight !== null) return inflight
    if (cache !== null && !force && now() - cache.checkedAt < cacheTtlMs) return status()
    if (repo === '') {
      recordError('UPDATE_NO_REPO', 'package.json 没有声明 repository，无法检查更新')
      return status()
    }
    inflight = (async () => {
      try {
        const result = await runGit(repo, { cwd: pluginRoot, timeoutMs: GIT_TIMEOUT_MS })
        if (result === null || result === undefined || result.ok !== true) {
          throw new Error((result && (result.message || result.stderr)) || 'git ls-remote 执行失败')
        }
        const tags = extractTags(result.stdout)
        if (tags.length === 0) {
          recordError('UPDATE_NO_TAGS', '远端仓库没有 vX.Y.Z 形式的发布 tag')
          return status()
        }
        cache = { checkedAt: now(), latestVersion: tags[0].version, rawTag: tags[0].tag, error: null }
        return status()
      } catch (error) {
        recordError('UPDATE_CHECK_FAILED', error && error.message ? error.message : error)
        return status()
      } finally {
        inflight = null
      }
    })()
    return inflight
  }

  function start() {
    if (options.auto === false) return () => {}
    const startupDelayMs = Number(options.startupDelayMs) >= 0 ? Number(options.startupDelayMs) : 5000
    const intervalMs = Number(options.autoIntervalMs) > 0 ? Number(options.autoIntervalMs) : UPDATE_AUTO_INTERVAL_MS
    const run = () => {
      check({ force: true }).catch((error) => {
        logger?.warn?.('[pocket-h5] 自动检查更新失败：' + (error && error.message ? error.message : error))
      })
    }
    startupTimer = setTimeout(run, startupDelayMs)
    startupTimer.unref?.()
    timer = setInterval(run, intervalMs)
    timer.unref?.()
    return function stop() {
      disposed = true
      if (startupTimer !== null) clearTimeout(startupTimer)
      if (timer !== null) clearInterval(timer)
      startupTimer = null
      timer = null
    }
  }

  return { status, check, start, version, repo }
}
