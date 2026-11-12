#!/usr/bin/env node
/**
 * Pocket H5 公共脱敏版生成器（与 FlowPilot 的 public-sync 同一套流程）。
 *
 * 复制 → 脱敏 → 构建 → host/client smoke → 禁词扫描 →（可选）推送公共仓库并建 Release。
 *
 * 用法：
 *   node tools/public-sync.mjs --version=0.2.0 --out=/tmp/ph5-public-gen    # 只生成，先 review
 *   node tools/public-sync.mjs --source=v0.2.0 --version=0.2.0 --push       # 生成 → 提交 → tag → 推送 → Release
 *
 * 用法约定：
 *   - --source=<git ref>：用该 ref 的干净树生成（发布时用 tag，保证与私有仓库版本一致）；
 *   - 生成后禁词扫描不通过会直接退出，不会推送；
 *   - 公共仓库不带 .github（Actions 只在私有仓库手动触发），Release 标题只写版本号。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const argOf = (name) => (args.find((item) => item.startsWith(`--${name}=`)) || '').split('=').slice(1).join('=')
const version = argOf('version') || JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
const source = argOf('source')
const outDir = resolve(argOf('out') || join(tmpdir(), 'ph5-public-gen'))
const push = args.includes('--push')
const repoSlug = argOf('repo') || 'Hazen223/dsh-pocket-h5-public'

/* ---------------- 脱敏规则（顺序敏感） ---------------- */
const REPLACEMENTS = [
  // 私有仓库 → 公共仓库（负向断言避免二次替换成 -public-public）
  [/Hazen223\/dsh-pocket-h5(?!-public)/g, 'Hazen223/dsh-pocket-h5-public'],
  // 作者机器相关表述（公共读者不需要）
  ['已在作者机器的 `desktop` profile 安装', '已在 `desktop` profile 安装'],
  ['私有仓库没有 Actions runner 配额，tag 推送后 run 会一直 queued', '发布由脱敏同步脚本生成（公共仓库同样保留手动触发的 Actions）'],
  // 本机路径兜底
  [/\/Users\/vladimirrick[^\s'"`)\]]*/g, '/Users/x'],
]

/** 公共版 README 顶部说明（随版本更新）。 */
function readmeBanner() {
  return [
    '> **关于本仓库**：这是 Pocket H5 的**脱敏公共版**：私有仓库地址已改为本仓库、作者机器相关表述已移除，其余内容与私有版本一致。',
    '> 上游快照来源：Pocket · H5 预览工作台（作者自有的独立 Electron / 浏览器项目，见 `ui/PROVENANCE.md`），未重写视觉层。',
    `> 功能与私有仓库的 v${version} 一致。`,
  ].join('\n')
}

/* 生成后必须为 0 的禁词（命中即中止） */
const FORBIDDEN = [
  /vladimirrick/,
  /\/Users\//,
  /github\.com\/Hazen223\/dsh-pocket-h5(?!-public)/,
  /Hazen223\/dsh-pocket-h5(?!-public)/,
  /已在作者机器的/,
]

function run(cmd, cmdArgs, cwd = root, inherit = false) {
  const out = execFileSync(cmd, cmdArgs, { cwd, encoding: 'utf8', stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'] })
  return out === null ? '' : String(out).trim()
}

function sanitizeText(text) {
  let out = text
  for (const [from, to] of REPLACEMENTS) out = typeof from === 'string' ? out.split(from).join(to) : out.replace(from, to)
  return out
}

const SKIP_FILES = new Set(['.DS_Store', 'build-info.json', '.release-notes.md'])
const SKIP_DIRS = new Set(['.git', 'node_modules', '.github'])

function copyTree(from, to, rel = '') {
  for (const name of readdirSync(join(from, rel))) {
    if (SKIP_FILES.has(name)) continue
    const relPath = rel === '' ? name : `${rel}/${name}`
    const absFrom = join(from, relPath)
    if (statSync(absFrom).isDirectory()) {
      if (SKIP_DIRS.has(relPath)) continue
      if (relPath === 'tools' && readdirSync(absFrom).every((item) => item === 'release.mjs' || item === 'public-sync.mjs')) continue
      mkdirSync(join(to, relPath), { recursive: true })
      copyTree(from, to, relPath)
      continue
    }
    if (relPath === 'tools/release.mjs' || relPath === 'tools/public-sync.mjs') continue
    let text = ''
    try {
      text = readFileSync(absFrom, 'utf8')
    } catch {
      continue
    }
    const target = join(to, relPath)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, sanitizeText(text), 'utf8')
  }
}

/* ---------------- 1) 取源码（可选 git ref） ---------------- */
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })
let srcRoot = root
let worktree = ''
if (source) {
  worktree = join(tmpdir(), `ph5-public-src-${Date.now()}`)
  run('git', ['worktree', 'add', '--force', worktree, source], root, true)
  srcRoot = worktree
}
console.log(`▸ 源：${source ? `git ${source}` : '当前工作区'} → ${outDir}`)
copyTree(srcRoot, outDir)
if (worktree !== '') run('git', ['worktree', 'remove', '--force', worktree], root)

/* ---------------- 2) README / package.json 收尾 ---------------- */
const readmePath = join(outDir, 'README.md')
if (existsSync(readmePath)) {
  let readme = readFileSync(readmePath, 'utf8')
  // 公共版不保留「公共脱敏版发布」内部工作流小节（对应的脚本也不在公共仓库）
  readme = readme.replace(/## 公共脱敏版[\s\S]*?(?=\n## )/, '')
  readme = readme.replace(/^(# [^\n]*\n)/, `$1\n${readmeBanner()}\n`)
  writeFileSync(readmePath, sanitizeText(readme), 'utf8')
}
const pkgPath = join(outDir, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
pkg.version = version
if (Array.isArray(pkg.files)) {
  if (!pkg.files.includes('LICENSE')) pkg.files.push('LICENSE')
  if (!existsSync(join(outDir, 'tools'))) pkg.files = pkg.files.filter((item) => item !== 'tools')
}
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')

/* ---------------- 3) 构建 + 冒烟 ---------------- */
console.log('▸ 构建公共版 client.js')
run('node', ['build-client.mjs'], outDir, true)
run('node', ['tests/host-smoke.mjs'], outDir, true)
run('node', ['tests/client-smoke.mjs'], outDir, true)
run('node', ['--check', 'index.js'], outDir, true)

/* ---------------- 4) 禁词扫描 ---------------- */
const hits = []
function scan(dir, rel = '') {
  for (const name of readdirSync(join(dir, rel))) {
    const relPath = rel === '' ? name : `${rel}/${name}`
    const abs = join(dir, relPath)
    if (statSync(abs).isDirectory()) {
      scan(dir, relPath)
      continue
    }
    let text = ''
    try {
      text = readFileSync(abs, 'utf8')
    } catch {
      continue
    }
    for (const pattern of FORBIDDEN) {
      const m = pattern.exec(text)
      if (m) hits.push(`${relPath}: 命中 ${String(pattern)}（${m[0]}）`)
    }
  }
}
scan(outDir)
if (hits.length > 0) {
  console.error('\n✗ 禁词扫描未通过，已中止（不会推送）：')
  for (const hit of hits.slice(0, 20)) console.error('  - ' + hit)
  process.exit(1)
}
console.log('▸ 禁词扫描通过（私有仓库地址 / 作者机器表述 / 本机路径 均为 0）')

if (!push) {
  console.log(`\n✓ 已生成公共版：${outDir}（未推送；review 后用 --push 发布 v${version}）`)
  process.exit(0)
}

/* ---------------- 5) 推送到公共仓库 ---------------- */
console.log(`\n▸ 推送到 ${repoSlug}（v${version}）`)
const cloneDir = join(tmpdir(), `ph5-public-push-${Date.now()}`)
run('git', ['clone', '-q', `https://github.com/${repoSlug}.git`, cloneDir], root, true)
for (const name of readdirSync(cloneDir)) {
  if (name === '.git') continue
  rmSync(join(cloneDir, name), { recursive: true, force: true })
}
for (const name of readdirSync(outDir)) {
  const src = join(outDir, name)
  const dst = join(cloneDir, name)
  if (statSync(src).isDirectory()) {
    mkdirSync(dst, { recursive: true })
    run('cp', ['-R', `${src}/.`, dst], root)
  } else {
    copyFileSync(src, dst)
  }
}
const GIT_ID = ['-c', 'user.name=Hazen223', '-c', 'user.email=hazen223@users.noreply.github.com']
run('git', ['add', '-A'], cloneDir)
if (run('git', ['status', '--porcelain'], cloneDir) !== '') {
  run('git', [...GIT_ID, 'commit', '-q', '-m', `Pocket H5 v${version}（公共脱敏版）`], cloneDir, true)
} else {
  console.log('（内容与 public 仓库一致，无需提交）')
}
// 在 clone 内重建：build-info 的 sha 指向公共仓库这次提交（client.js 本身只含版本号，可复现）
run('node', ['build-client.mjs'], cloneDir, true)
run('git', [...GIT_ID, 'tag', '-f', '-a', `v${version}`, '-m', `v${version}`], cloneDir, true)
run('git', ['push', 'origin', 'main'], cloneDir, true)
run('git', ['push', 'origin', `v${version}`, '--force'], cloneDir, true)

const assets = [join(cloneDir, 'client.js'), join(cloneDir, 'build-info.json')].filter((file) => existsSync(file))
const notesFile = join(cloneDir, '.release-notes.md')
const buildInfo = readFileSync(join(cloneDir, 'build-info.json'), 'utf8').trim()
writeFileSync(
  notesFile,
  [`## Pocket H5 v${version}（公共脱敏版）`, '', '## 构建', '', '```json', buildInfo, '```', ''].join('\n'),
  'utf8',
)
const existing = (() => {
  try {
    return run('gh', ['release', 'view', `v${version}`, '-R', repoSlug, '--json', 'tagName'], root)
  } catch {
    return ''
  }
})()
if (existing.includes(`v${version}`)) {
  run('gh', ['release', 'upload', `v${version}`, ...assets, '-R', repoSlug, '--clobber'], root, true)
  run('gh', ['release', 'edit', `v${version}`, '-R', repoSlug, '--title', `v${version}`], root, true)
} else {
  run('gh', ['release', 'create', `v${version}`, ...assets, '-R', repoSlug, '--title', `v${version}`, '--notes-file', notesFile], root, true)
}
rmSync(cloneDir, { recursive: true, force: true })
console.log(`\n✓ 已发布 ${repoSlug} v${version}（标题只写版本号，附 client.js + build-info.json）`)
