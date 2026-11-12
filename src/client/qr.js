/* ------------------------------------------------------------------ *
 * Pocket H5 —— 「手机扫码」增值功能（client.js 的片段源，不是独立 ES 模块）
 *
 * 上游工作台只做桌面预览。真机验收时经常需要把同一个 H5 在手机上打开，
 * 所以这里在地址栏加一个二维码按钮：把当前预览地址渲染成二维码，手机扫一下即可打开。
 *
 * 设计约束：
 *   - 完全离线：二维码用 vendor/qrcode（node-qrcode 1.5.4 的矩阵内核，MIT）在本地生成，
 *     不把 H5 地址发给任何在线服务；由 build-client.mjs 打包进 client.js。
 *   - 不引入新依赖、不弹新窗口：按钮与对话框都加在面板自己的 Shadow DOM 里，
 *     沿用上游的黑白灰视觉与 .icon-button / dialog 样式。
 *   - 手机能不能打开取决于地址：127.0.0.1 / localhost 在手机上指向手机自己，
 *     所以对话框会明确提示改用电脑的局域网 IP。
 * ------------------------------------------------------------------ */

const QR_CSS = `
/* ---- 手机扫码（构建期追加，沿用工作台黑白灰） ---- */
.qr-dialog { width: min(372px, calc(100vw - 40px)); padding: 24px 26px 22px; }
.qr-dialog .dialog-heading h2 { margin: 8px 0 18px; font-size: 19px; letter-spacing: -.3px; }
.qr-dialog .qr-close { width: 32px; height: 32px; flex-shrink: 0; }
.qr-body { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.qr-frame {
  display: grid;
  place-items: center;
  width: 232px;
  height: 232px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #ffffff;
}
.qr-frame svg { width: 100%; height: 100%; display: block; stroke: none; }
.qr-frame svg * { stroke: none; }
.qr-empty { font-size: 11.5px; line-height: 1.8; color: #757575; text-align: center; padding: 0 8px; }
.qr-url {
  max-width: 100%;
  font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #4a4a4a;
  text-align: center;
  overflow-wrap: anywhere;
}
.qr-hint { font-size: 11px; line-height: 1.85; color: #757575; }
.qr-hint b { font-weight: 600; color: #4a4a4a; }
`

/** 静区（二维码四周留白）模块数；扫码器需要 4 个模块的静区才稳定。 */
const QR_QUIET_MODULES = 4

/** 由打包进 client.js 的 vendor/qrcode 生成的 { size, data } 矩阵。 */
function qrMatrix(text) {
  return createQrMatrix(text)
}

/** 把矩阵画成内联 SVG（1 个模块 = 1 个用户单位，crispEdges 保证不糊）。 */
function qrSvgMarkup(text) {
  const qr = qrMatrix(text)
  const size = qr.size
  const total = size + QR_QUIET_MODULES * 2
  const parts = []
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (qr.data[y * size + x]) parts.push('M' + (x + QR_QUIET_MODULES) + ' ' + (y + QR_QUIET_MODULES) + 'h1v1h-1z')
    }
  }
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total +
    '" shape-rendering="crispEdges" role="img" aria-label="预览地址二维码">' +
    '<rect width="' + total + '" height="' + total + '" fill="#ffffff"/>' +
    '<path d="' + parts.join('') + '" fill="#161616"/>' +
    '</svg>'
  )
}

/** 手机能否访问：loopback 地址在手机上指向手机自己，必须换成局域网 IP。 */
function qrIsLoopbackHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1'
}

/**
 * 在面板里挂载二维码按钮与对话框。
 * @param {ShadowRoot} shadow 面板 Shadow DOM（工作台标记已注入）
 * @returns {() => void} 清理函数（面板卸载/严格模式重建时移除本功能添加的节点）
 */
function mountQrFeature(shadow) {
  const addressButtons = shadow.querySelector('.address-buttons')
  const root = shadow.querySelector('.pocket-h5-root')
  if (!addressButtons || !root) return function () {}

  const button = document.createElement('button')
  button.id = 'qrButton'
  button.type = 'button'
  button.className = 'icon-button'
  button.title = '生成二维码 · 手机扫码打开'
  button.setAttribute('aria-label', '生成二维码')
  button.innerHTML =
    '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/>' +
    '<rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>' +
    '<rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
  addressButtons.append(button)

  const dialog = document.createElement('dialog')
  dialog.id = 'qrDialog'
  dialog.className = 'qr-dialog'
  dialog.innerHTML =
    '<div class="dialog-heading"><div><span class="eyebrow">手机预览</span><h2>扫码在手机上打开</h2></div>' +
    '<button type="button" class="icon-button qr-close" aria-label="关闭二维码">' +
    '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>' +
    '<div class="qr-body"><div class="qr-frame" id="qrFrame"></div>' +
    '<p class="qr-url" id="qrUrl"></p><p class="qr-hint" id="qrHint"></p></div>'
  root.append(dialog)

  const frame = shadow.getElementById('qrFrame')
  const urlLine = shadow.getElementById('qrUrl')
  const hint = shadow.getElementById('qrHint')

  const open = function () {
    const preview = shadow.getElementById('previewFrame')
    const source = preview && preview.getAttribute('src') ? preview.getAttribute('src') : ''
    const demoUrl = pocketDemoUrl()
    let url = ''
    let problem = ''
    if (!source || source === 'about:blank' || source === demoUrl || source.indexOf('dsh-app:') === 0) {
      problem = '当前是内置示例。先在上方输入你的 H5 地址并「打开预览」，再生成二维码。'
    } else {
      try {
        url = new URL(source).href
      } catch (error) {
        problem = '当前预览地址无法生成二维码，请重新输入。'
      }
    }

    if (problem) {
      frame.innerHTML = '<span class="qr-empty">' + problem + '</span>'
      urlLine.textContent = ''
      hint.innerHTML = ''
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
      return
    }

    frame.innerHTML = qrSvgMarkup(url)
    urlLine.textContent = url
    const parsed = new URL(url)
    hint.innerHTML = qrIsLoopbackHost(parsed.hostname)
      ? '手机与电脑需在同一局域网。<b>' + parsed.hostname + '</b> 在手机上指向手机自己，' +
        '请把地址改成电脑的局域网 IP（例如 <b>192.168.1.23:' + (parsed.port || '80') + '</b>）后重新预览，' +
        '并确认 H5 开发服务监听在 0.0.0.0 或局域网地址上。'
      : '手机与电脑需能互相访问该地址；H5 开发服务需监听局域网地址，而不是只监听本机。'
    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')
  }

  const close = function () {
    if (typeof dialog.close === 'function') dialog.close()
    else dialog.removeAttribute('open')
  }

  button.addEventListener('click', open)
  dialog.querySelector('.qr-close').addEventListener('click', close)
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return
    const rect = dialog.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
  })

  return function disposeQrFeature() {
    button.remove()
    dialog.remove()
  }
}
