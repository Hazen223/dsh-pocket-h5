#!/usr/bin/env node
/**
 * Pocket H5 本地一键发布（复用 FlowPilot 的发布流程：这个私有仓库的 hosted runner
 * 拿不到配额，tag 推送后 run 会永远 queued，所以发布动作全部在本地完成）。
 *
 * 用法：
 *   node tools/release.mjs --version=0.2.0        # 门禁 → 升版本 → 构建 → 提交 → 打 tag → 推送 → 建 Release（含产物）
 *   node tools/release.mjs --version=0.2.0 --dry-run
 *   node tools/release.mjs --version=0.2.0 --skip-gate --no-release
 *   node tools/release.mjs --resume=v0.1.0        # 只给已有 tag 补 Release 资产（修历史发布用）
 *
 * 约定：
 *   - 只允许在干净的 main 上发布（build-info.json 属于构建产物，被 gitignore，不计入脏）；
 *   - gate = `npm run release:check`（build + host smoke + client smoke）；
 *   - 产物：client.js + build-info.json，一起挂到 GitHub Release；
 *   - 版本号写进 package.json，client.js 里的版本随之重建，提交做一次 amend 让 tag 内容自洽。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const skipGate = args.includes('--skip-gate')
const noRelease = args.includes('--no-release')
const versionArg = (args.find((item) => item.startsWith('--version=')) || '').split('=')[1]
const resumeArg = (args.find((item) => item.startsWith('--resume=')) || '').split('=')[1]
const repo = readPkg().repository && typeof readPkg().repository === 'object' ? readPkg().repository.url : readPkg().repository

function readPkg() {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
}

function run(cmd, cmdArgs, options = {}) {
  const shown = [cmd, ...cmdArgs].join(' ')
  if (dryRun && options.allowDryRun !== false) {
    console.log(`  [dry-run] ${shown}`)
    return ''
  }
  try {
    const out = execFileSync(cmd, cmdArgs, {
      cwd: options.cwd || root,
      encoding: 'utf8',
      stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    })
    return out === null || out === undefined ? '' : String(out).trim()
  } catch (error) {
    if (options.tolerate === true) return ''
    const detail = error && error.stderr ? String(error.stderr).trim() : String(error && error.message ? error.message : error)
    console.error(`\n✗ 命令失败：${shown}\n${detail}`)
    process.exit(1)
  }
}

function git(args2) {
  return run('git', args2)
}

function semver(value) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(value || '').trim())
  return m ? { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) } : null
}

function compare(a, b) {
  const x = semver(a)
  const y = semver(b)
  if (x === null || y === null) return 0
  return x.major - y.major || x.minor - y.minor || x.patch - y.patch
}

function repoSlug() {
  const url = typeof repo === 'string' ? repo : ''
  const m = /github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/.exec(url)
  return m ? `${m[1]}/${m[2]}` : ''
}

/** Release 标题只写版本号（与 tag 完全一致），解释说明只放在正文里；发现被改过就改回来。 */
function ensureReleaseTitle(slug, tag) {
  const raw = run('gh', ['release', 'view', tag, '-R', slug, '--json', 'name'], { tolerate: true })
  let name = ''
  try {
    name = JSON.parse(raw || '{}').name || ''
  } catch {
    name = ''
  }
  if (name === tag) return
  if (dryRun) {
    console.log(`  [dry-run] gh release edit ${tag} --title ${tag}`)
    return
  }
  run('gh', ['release', 'edit', tag, '-R', slug, '--title', tag], { inherit: true, allowDryRun: false })
  console.log(`  标题已规范为 ${tag}（原为「${name}」）`)
}

function pushFile(path) {
  return existsSync(join(root, path)) ? path : null
}

function buildNotes(tag) {
  const prev = (() => {
    try {
      return execFileSync('git', ['describe', '--tags', '--abbrev=0', `${tag}^`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    } catch {
      return ''
    }
  })()
  const range = prev === '' ? 'HEAD' : `${prev}..HEAD`
  const log = execFileSync('git', ['log', '--no-merges', '--pretty=format:- %s (%h)', range], { cwd: root, encoding: 'utf8' }).trim()
  const build = readFileSync(join(root, 'build-info.json'), 'utf8').trim()
  return [`## 变更（${range}）`, '', log, '', '## 构建', '', '```json', build, '```', ''].join('\n')
}

/* ---------------- resume：只给已有 tag 补 Release / 资产 ---------------- */
if (resumeArg) {
  const tag = resumeArg
  const slug = repoSlug()
  console.log(`补发布 ${tag}（${slug}）`)
  // 从 tag 对应的干净工作树构建，保证产物就是发布版本本身（不含当前未提交改动）
  let workdir = root
  let worktree = ''
  const headTag = (() => {
    try {
      return execFileSync('git', ['describe', '--exact-match', '--tags', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    } catch {
      return ''
    }
  })()
  const treeDirty = (() => {
    try {
      return execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() !== ''
    } catch {
      return true
    }
  })()
  if (headTag !== tag || treeDirty) {
    worktree = join(tmpdir(), 'fp-release-worktree');
    console.log(`▸ HEAD 不是 ${tag}（或工作区有未提交改动），用临时工作树构建干净产物`)
    run('git', ['worktree', 'remove', '--force', worktree], { tolerate: true })
    run('git', ['worktree', 'add', '--force', worktree, tag], { inherit: true, allowDryRun: false })
    workdir = worktree
  }
  run('node', ['build-client.mjs'], { cwd: workdir, inherit: true, allowDryRun: false })
  const assetFiles = ['client.js', 'build-info.json']
    .map((file) => join(workdir, file))
    .filter((file) => existsSync(file))
  const assets = assetFiles.map((file) => file)
  const exists = run('gh', ['release', 'view', tag, '-R', slug, '--json', 'tagName'], { tolerate: true }).includes(tag)
  if (exists) {
    run('gh', ['release', 'upload', tag, ...assets, '-R', slug, '--clobber'], { inherit: true, allowDryRun: false })
  } else {
    const notesFile = join(workdir, '.release-notes.md')
    writeFileSync(notesFile, buildNotes(tag), 'utf8')
    run('gh', ['release', 'create', tag, ...assets, '-R', slug, '--title', tag, '--notes-file', notesFile], { inherit: true, allowDryRun: false })
    try {
      unlinkSync(notesFile)
    } catch {
      /* 清理失败忽略 */
    }
  }
  if (worktree !== '') run('git', ['worktree', 'remove', '--force', worktree], { tolerate: true })
  ensureReleaseTitle(slug, tag)
  console.log(`✓ 已完成 ${tag} 的 Release 资产：${assetFiles.map((file) => file.split('/').pop()).join('、')}`)
  process.exit(0)
}

/* ---------------- 正常发布 ---------------- */
const pkg = readPkg()
const target = String(versionArg || '').trim()
if (semver(target) === null) {
  console.error('✗ 请用 --version=x.y.z 指定目标版本（纯数字三段）')
  process.exit(1)
}
if (compare(target, pkg.version) <= 0) {
  console.error(`✗ 目标版本 ${target} 必须大于当前 ${pkg.version}`)
  process.exit(1)
}

console.log(`发布 v${target}（当前 ${pkg.version}）${dryRun ? ' [dry-run]' : ''}`)

/* 1) 预检：干净、在 main、与远端一致 */
const dirty = run('git', ['status', '--porcelain'], { allowDryRun: false })
if (dirty !== '') {
  console.error(`✗ 工作区不干净，先提交或还原：\n${dirty}`)
  process.exit(1)
}
const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { allowDryRun: false })
if (branch !== 'main') {
  console.error(`✗ 只能在 main 上发布（当前 ${branch}）`)
  process.exit(1)
}
if (!dryRun) {
  run('git', ['fetch', 'origin', '--tags'], { inherit: true })
  const head = run('git', ['rev-parse', 'HEAD'], { allowDryRun: false })
  const remote = run('git', ['rev-parse', 'origin/main'], { allowDryRun: false })
  if (head !== remote) {
    console.error('✗ 本地 main 与 origin/main 不一致，先 pull/push 对齐后再发布')
    process.exit(1)
  }
}

/* 2) 门禁 */
if (!skipGate && !dryRun) {
  console.log('\n▸ 门禁：npm run release:check')
  run('npm', ['run', 'release:check'], { inherit: true, allowDryRun: false })
}

/* 3) 升版本 + 提交（先提交版本，再构建，让 client.js 里的版本与 tag 一致） */
console.log(`\n▸ 升级版本 ${pkg.version} → ${target}`)
pkg.version = target
if (!dryRun) writeFileSync(join(root, 'package.json'), JSON.stringify(pkg, null, 2) + '\n', 'utf8')
run('git', ['add', 'package.json'])
run('git', ['commit', '-m', `chore(release): v${target}`])

/* 4) 构建（build-info 的 sha 指向 release 提交），把产物并入同一提交 */
console.log('\n▸ 构建产物')
run('node', ['build-client.mjs'], { inherit: true, allowDryRun: false })
run('git', ['add', 'client.js'])
const staged = run('git', ['diff', '--cached', '--name-only'], { allowDryRun: false })
if (staged !== '') {
  run('git', ['commit', '--amend', '--no-edit'])
} else {
  console.log('  （client.js 无变化，跳过 amend）')
}
// amend 后提交号变了：重建一次，让 build-info.json 的 sha 指向最终发布提交（client.js 内容不变，仍可复现）
run('node', ['build-client.mjs'], { inherit: true, allowDryRun: false })

/* 5) 打 tag 并推送 */
console.log(`\n▸ 打 tag v${target}`)
run('git', ['tag', '-a', `v${target}`, '-m', `v${target}`])
if (!dryRun) {
  console.log('\n▸ 推送 main + tag')
  run('git', ['push', 'origin', 'main'], { inherit: true })
  run('git', ['push', 'origin', `v${target}`], { inherit: true })
}

/* 6) GitHub Release（含产物） */
if (!noRelease && !dryRun) {
  const slug = repoSlug()
  const assets = ['client.js', 'build-info.json'].filter((file) => pushFile(file) !== null)
  const notesFile = join(root, '.release-notes.md')
  if (!dryRun) writeFileSync(notesFile, buildNotes(`v${target}`), 'utf8')
  console.log(`\n▸ 创建 GitHub Release（${assets.join('、')}）`)
  run('gh', ['release', 'create', `v${target}`, ...assets, '-R', slug, '--title', `v${target}`, '--notes-file', notesFile, '--verify-tag'], {
    inherit: true,
    allowDryRun: false,
  })
  ensureReleaseTitle(slug, `v${target}`)
  try {
    unlinkSync(notesFile)
  } catch {
    /* 清理失败忽略 */
  }
}

if (dryRun && !noRelease) {
  console.log(`\n[dry-run] gh release create v${target} client.js build-info.json -R ${repoSlug()} --notes-file .release-notes.md --verify-tag`)
}
console.log(`\n✓ 发布完成：v${target}`)
