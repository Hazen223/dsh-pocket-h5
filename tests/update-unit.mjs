#!/usr/bin/env node
/**
 * Host 版本检查服务单测（无外网、无 git）：注入 runGit / now，断言缓存、错误、版本比较。
 * 运行：node tests/update-unit.mjs
 */
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, sep } from 'node:path'
import {
  compareVersions,
  createUpdateService,
  detectDevBuild,
  detectProfileDir,
  extractTags,
  normalizeRepoUrl,
  parseVersion,
  readBuildInfo,
  repoWebUrl,
} from '../lib/update.js'

const failures = []
const check = (condition, label) => {
  if (condition) console.log('ok - ' + label)
  else {
    failures.push(label)
    console.error('not ok - ' + label)
  }
}

/* ---------------- 纯函数 ---------------- */
check(normalizeRepoUrl('git+https://github.com/a/b.git') === 'https://github.com/a/b', 'normalizeRepoUrl strips git+ and .git')
check(normalizeRepoUrl('git@github.com:a/b.git') === 'https://github.com/a/b', 'normalizeRepoUrl expands git@github.com')
check(normalizeRepoUrl(undefined) === '' && normalizeRepoUrl('') === '', 'normalizeRepoUrl handles empty input')
check(repoWebUrl('https://github.com/a/b') === 'https://github.com/a/b', 'repoWebUrl keeps https URLs')
check(repoWebUrl('git@github.com:a/b') === 'https://github.com/a/b', 'repoWebUrl normalizes scp-like URLs')

const v = parseVersion('v1.2.3')
check(v && v.major === 1 && v.minor === 2 && v.patch === 3 && v.pre === '', 'parseVersion parses v1.2.3')
check(parseVersion('1.2.3-beta.1')?.pre === 'beta.1', 'parseVersion keeps prerelease')
check(parseVersion('nope') === null && parseVersion('1.2') === null, 'parseVersion rejects invalid')

check(compareVersions('1.2.3', '1.2.3') === 0, 'compareVersions equal')
check(compareVersions('1.2.4', '1.2.3') === 1, 'compareVersions patch newer')
check(compareVersions('1.3.0', '1.2.9') === 1, 'compareVersions minor newer')
check(compareVersions('2.0.0', '10.0.0') === -1, 'compareVersions numeric not lexical')
check(compareVersions('1.2.3', '1.2.3-beta.1') === 1, 'compareVersions release beats prerelease')
check(compareVersions('bad', '1.0.0') === -1, 'compareVersions unknown sorts last')

const tags = extractTags([
  'abcdef\trefs/tags/v0.1.0',
  '111111\trefs/tags/v0.3.0',
  '222222\trefs/tags/v0.2.0',
  '333333\trefs/tags/v0.3.0^{}',
  '444444\trefs/tags/notes',
].join('\n'))
check(tags.length === 3 && tags[0].version === '0.3.0' && tags[1].version === '0.2.0', 'extractTags sorts releases and ignores noise')
check(extractTags('') .length === 0, 'extractTags handles empty output')

/* ---------------- 临时插件目录 ---------------- */
const tmp = mkdtempSync(join(tmpdir(), 'pocket-h5-update-'))
const pluginRoot = join(tmp, 'plugin')
mkdirSync(pluginRoot, { recursive: true })
writeFileSync(join(pluginRoot, 'package.json'), JSON.stringify({
  name: 'dsh-pocket-h5',
  version: '1.2.3',
  repository: { type: 'git', url: 'https://github.com/example/pocket-h5.git' },
}))

check(readBuildInfo(pluginRoot, '1.2.3').label === '1.2.3', 'readBuildInfo falls back to package version without build-info.json')
writeFileSync(join(pluginRoot, 'build-info.json'), JSON.stringify({
  version: '1.2.3', label: '1.2.3+abc1234', channel: 'release', sha: 'abc1234', dirty: false, builtAt: '2026-01-01T00:00:00.000Z',
}))
const info = readBuildInfo(pluginRoot, '1.2.3')
check(info.label === '1.2.3+abc1234' && info.sha === 'abc1234', 'readBuildInfo reads build-info.json')

const profile = join(tmp, 'profiles', 'desktop')
mkdirSync(join(profile, 'node_modules', 'dsh-pocket-h5'), { recursive: true })
writeFileSync(join(profile, 'package.json'), JSON.stringify({ name: 'profile', dsh: { profile: {} } }))
check(detectProfileDir(join(profile, 'node_modules', 'dsh-pocket-h5')) === profile, 'detectProfileDir finds the profile root')
check(detectProfileDir(pluginRoot) === null, 'detectProfileDir returns null for a link checkout')
check(detectDevBuild({ mode: 'link' }) === true, 'detectDevBuild marks link installs as dev')
check(detectDevBuild({ mode: 'profile', buildInfo: { channel: 'dev' } }) === true, 'detectDevBuild sees a dev build channel')
check(detectDevBuild({ mode: 'profile', buildInfo: { channel: 'release', dirty: false } }) === false, 'detectDevBuild treats a clean release build as release')

/* ---------------- 服务：状态 / 检查 / 缓存 / 错误 ---------------- */
let gitCalls = 0
let gitResult = { ok: true, stdout: 'refs/tags/v1.3.0\nrefs/tags/v1.2.3\n', stderr: '', message: '' }
const service = createUpdateService({
  pluginRoot,
  auto: false,
  now: () => 1000,
  runGit: async () => {
    gitCalls += 1
    return gitResult
  },
})
const initial = service.status()
check(initial.currentVersion === '1.2.3', 'status reports the current version')
check(initial.repo === 'https://github.com/example/pocket-h5', 'status normalizes the repository')
check(initial.latestVersion === null && initial.updateAvailable === false, 'status starts without a latest version')
check(initial.mode === 'link' && initial.devBuild === true, 'status reports link install and devBuild')

const checked = await service.check({ force: true })
check(checked.latestVersion === '1.3.0' && checked.updateAvailable === true, 'check reads the newest tag and flags an update')
check(checked.latestTag === 'v1.3.0', 'check keeps the raw tag')
check(checked.releaseUrl === 'https://github.com/example/pocket-h5/releases/tag/v1.3.0', 'check builds the release URL')
check(checked.checkedAt === new Date(1000).toISOString(), 'check records the check time')
check(gitCalls === 1, 'check runs git once')

await service.check()
check(gitCalls === 1, 'check reuses the cached result inside the TTL')
await service.check({ force: true })
check(gitCalls === 2, 'check with force bypasses the cache')

gitResult = { ok: false, stdout: '', stderr: 'boom', message: 'git failed' }
const failed = await service.check({ force: true })
check(failed.latestVersion === null && failed.updateAvailable === false, 'failed check clears the latest version')
check(failed.error && failed.error.code === 'UPDATE_CHECK_FAILED' && failed.error.message.includes('git failed'), 'failed check records an error')

gitResult = { ok: true, stdout: '', stderr: '', message: '' }
const noTags = await service.check({ force: true })
check(noTags.error && noTags.error.code === 'UPDATE_NO_TAGS', 'check without tags records UPDATE_NO_TAGS')

const noRepo = createUpdateService({ pluginRoot: pluginRoot + '-norepo', auto: false, runGit: async () => ({ ok: true, stdout: '', stderr: '', message: '' }) })
mkdirSync(pluginRoot + '-norepo', { recursive: true })
writeFileSync(join(pluginRoot + '-norepo', 'package.json'), JSON.stringify({ name: 'dsh-pocket-h5', version: '1.0.0' }))
const noRepoStatus = await noRepo.check({ force: true })
check(noRepoStatus.error && noRepoStatus.error.code === 'UPDATE_NO_REPO', 'check without a repository records UPDATE_NO_REPO')

/* ---------------- 自动检查 ---------------- */
let autoCalls = 0
const autoService = createUpdateService({
  pluginRoot,
  auto: true,
  startupDelayMs: 0,
  autoIntervalMs: 25,
  runGit: async () => {
    autoCalls += 1
    return { ok: true, stdout: 'refs/tags/v1.2.3\n', stderr: '', message: '' }
  },
})
const stop = autoService.start()
await new Promise((resolve) => setTimeout(resolve, 80))
check(autoCalls >= 2, 'auto check runs on startup and on the interval')
stop()
const afterStop = autoCalls
await new Promise((resolve) => setTimeout(resolve, 60))
check(autoCalls === afterStop, 'stop() clears the auto check timers')

rmSync(tmp, { recursive: true, force: true })

if (failures.length > 0) {
  console.error(`\n${failures.length} update check(s) failed`)
  process.exit(1)
}
console.log('\nall update checks passed')
