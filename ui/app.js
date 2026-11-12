const $ = id => document.getElementById(id);
const defaults = { status: true, home: true, theme: 'dark', barColor: '#ffffff', battery: 100, layout: 'inset', guides: false, landscape: false, zoom: '1' };
const device = { ppi: 460, pixelRatio: 3, bodyWidthMm: 71.5, bodyHeightMm: 149.6 };
const storageKey = 'pocket-h5-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { /* Private mode and unavailable storage are supported. */ }
const state = { ...defaults };
for (const key of ['status', 'home', 'guides', 'landscape']) if (typeof saved.settings?.[key] === 'boolean') state[key] = saved.settings[key];
if (['dark', 'light'].includes(saved.settings?.theme)) state.theme = saved.settings.theme;
if (['#ffffff', '#ededed', '#111111'].includes(saved.settings?.barColor)) state.barColor = saved.settings.barColor;
if (Number.isFinite(saved.settings?.battery)) state.battery = Math.max(0, Math.min(100, Math.round(saved.settings.battery)));
if (['inset', 'overlay'].includes(saved.settings?.layout)) state.layout = saved.settings.layout;
if (saved.scaleVersion === 2 && ['fit', '0.5', '0.75', '1', '1.25', '1.5'].includes(saved.settings?.zoom)) state.zoom = saved.settings.zoom;
const calibrations = {};
if (saved.calibrations && typeof saved.calibrations === 'object') {
  for (const [key, value] of Object.entries(saved.calibrations)) {
    if (key.length < 250 && Number.isFinite(value) && value >= 16 && value <= 1100) calibrations[key] = value;
  }
}
let history = Array.isArray(saved.history) ? saved.history.filter(item => typeof item === 'string').slice(0, 8) : [];
let currentUrl = new URL('/demo.html', location.href).href;
let toastTimer;
let loadingTimer;
let proxyRequest = 0;
let pendingProxy = null;
let navigationMessage = '';
if (window.pocketDesktop) {
  const desktop = window.pocketDesktop;
  const guest = document.createElement('webview');
  guest.id = 'previewFrame';
  guest.setAttribute('aria-label', 'H5 页面预览');
  guest.setAttribute('partition', 'persist:pocket-chromium');
  guest.setAttribute('allowpopups', '');
  $('previewFrame').replaceWith(guest);
  window.pocketProxyAvailable = true;
  const updateMetrics = value => { window.pocketDisplayMetrics = value; window.dispatchEvent(new Event('pocketdisplaychange')); };
  desktop.onMetrics(updateMetrics);
  desktop.metrics().then(updateMetrics).catch(() => {});
  desktop.onRefresh(() => $('refreshButton').click());
  desktop.onNavigation(result => {
    clearTimeout(loadingTimer);
    navigationMessage = result.loading ? '正在加载 H5…' : result.error ? `加载失败 · ${result.error}` : result.statusCode >= 590 && result.statusCode <= 599 ? `代理转发失败 · HTTP ${result.statusCode} · 请检查代理连接与认证` : result.statusCode >= 400 ? `服务器返回 HTTP ${result.statusCode} · 请检查页面地址或开发服务` : `预览中 · HTTP ${result.statusCode}`;
    $('loadStatus').textContent = navigationMessage;
  });
  $('engineInfo').hidden = false;
  $('engineInfo').textContent = `Chromium ${desktop.chromium} · ${desktop.arch === 'arm64' ? 'Apple Silicon' : 'Intel'}`;
  $('devToolsButton').hidden = false;
  $('devToolsButton').addEventListener('click', () => desktop.devTools());
}

function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify({ settings: state, url: currentUrl, history, calibrations, scaleVersion: 2, proxyEndpoint: {host: $('proxyHost').value, port: $('proxyPort').value} })); }
  catch { /* The tool works without persistent storage. */ }
}

function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3600);
}

function normalizeAddress(value) {
  let input = value.trim();
  if (!input) throw new Error('先输入 H5 地址或端口，例如 5173。');
  if (/^\d{1,5}$/.test(input)) {
    const port = Number(input);
    if (port < 1 || port > 65535) throw new Error('端口范围是 1–65535。');
    input = `http://127.0.0.1:${port}`;
  } else if (input.startsWith(':')) {
    input = `http://127.0.0.1${input}`;
  } else if (!/^https?:\/\//i.test(input)) {
    // Reject explicit non-web schemes while allowing host:port shorthand.
    if (/^[a-z][a-z\d+.-]*:/i.test(input) && !/^[^/:]+:\d+(?:[/?#]|$)/.test(input)) throw new Error('仅支持 HTTP 或 HTTPS 页面地址。');
    input = `http://${input}`;
  }
  let url;
  try { url = new URL(input); } catch { throw new Error('地址格式有误，请检查主机、端口和路径。'); }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error('仅支持 HTTP 或 HTTPS 页面地址。');
  if (url.username || url.password) throw new Error('请使用不包含账号密码的地址，在 H5 页面中登录。');
  const loopback = hostname => ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
  const isThisServer = url.origin === location.origin || (loopback(url.hostname) && loopback(location.hostname) && url.port === location.port);
  if (isThisServer && ['/', '/index.html'].includes(url.pathname)) throw new Error('这是预览工具自己的地址，请输入你的 H5 服务端口。');
  return url.href;
}

function isDemo(url) { return url === new URL('/demo.html', location.href).href; }

function updateHistory() {
  $('recentAddresses').replaceChildren(...history.map(value => {
    const option = document.createElement('option'); option.value = value; return option;
  }));
}

function navigate(url, remember = true) {
  navigationMessage = '';
  currentUrl = url;
  const demo = isDemo(url);
  $('addressInput').value = demo ? '' : url;
  $('addressInput').removeAttribute('aria-invalid');
  $('previewName').textContent = demo ? '内置示例' : new URL(url).host;
  $('previewName').title = url;
  $('loadStatus').textContent = demo ? '示例预览中' : '已发送预览请求';
  clearTimeout(loadingTimer);
  loadingTimer = setTimeout(() => { $('loadStatus').textContent = '加载较慢 · 可在新窗口检查 H5 服务'; }, 12000);
  $('previewFrame').src = url;
  if (remember && !demo) {
    history = [url, ...history.filter(item => item !== url)].slice(0, 8);
    updateHistory();
  }
  persist();
}

function displayScale() {
  const metrics = window.pocketDisplayMetrics;
  const key = metrics?.displayKey || `browser:${window.screen.width}x${window.screen.height}@${window.devicePixelRatio || 1}`;
  const manual = calibrations[key];
  const system = Number.isFinite(metrics?.cssPixelsPerInch) && metrics.cssPixelsPerInch >= 16 && metrics.cssPixelsPerInch <= 1100 ? metrics.cssPixelsPerInch : null;
  return { key, ppi: manual || system || 96, manual: Boolean(manual), system: Boolean(system) };
}

function resizeDevice() {
  const canvas = $('canvas');
  const width = state.landscape ? 874 : 402;
  const height = state.landscape ? 402 : 874;
  const logicalPixelsPerMm = device.ppi / device.pixelRatio / 25.4;
  const outerWidth = (state.landscape ? device.bodyHeightMm : device.bodyWidthMm) * logicalPixelsPerMm;
  const outerHeight = (state.landscape ? device.bodyWidthMm : device.bodyHeightMm) * logicalPixelsPerMm;
  const style = getComputedStyle(canvas);
  const availableWidth = canvas.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 8;
  const availableHeight = canvas.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 8;
  const display = displayScale();
  // A logical phone pixel occupies 3 / 460 inches on the real iPhone.
  const actualSizeScale = device.pixelRatio * display.ppi / device.ppi;
  const scale = state.zoom === 'fit' ? Math.max(.05, Math.min(availableWidth / outerWidth, availableHeight / outerHeight)) : Number(state.zoom) * actualSizeScale;
  $('phone').style.width = `${outerWidth}px`;
  $('phone').style.height = `${outerHeight}px`;
  $('phone').style.padding = `${(outerHeight - height) / 2 - 1}px ${(outerWidth - width) / 2 - 1}px`;
  $('phone').style.transform = `scale(${scale})`;
  $('deviceSlot').style.width = `${outerWidth * scale}px`;
  $('deviceSlot').style.height = `${outerHeight * scale}px`;
  $('deviceSlot').style.marginLeft = state.zoom === 'fit' ? '' : '0';
  // Keep oversized fixed-zoom devices reachable from their left edge.
  canvas.style.alignItems = outerWidth * scale > availableWidth ? 'flex-start' : 'center';
  $('scaleLabel').textContent = state.zoom === 'fit' ? `适应窗口 · 真机的 ${Math.round(scale / actualSizeScale * 100)}%` : `${Math.round(Number(state.zoom) * 100)}% · ${state.zoom === '1' ? '真机大小' : '相对真机'}`;
  const physicalRatio = scale / actualSizeScale;
  const shownWidth = (state.landscape ? device.bodyHeightMm : device.bodyWidthMm) * physicalRatio;
  const shownHeight = (state.landscape ? device.bodyWidthMm : device.bodyHeightMm) * physicalRatio;
  $('physicalSize').textContent = `显示约 ${shownWidth.toFixed(1)} × ${shownHeight.toFixed(1)} mm`;
  $('calibrationStatus').textContent = display.manual ? '当前显示器已手动校准' : display.system ? '已按系统显示器尺寸估算，可用尺子微调' : '暂按标准屏幕估算，需用尺子校准实际大小';
}

function render() {
  const width = state.landscape ? 874 : 402;
  const height = state.landscape ? 402 : 874;
  const top = state.status && !state.landscape ? 62 : 0;
  const bottom = state.home ? (state.landscape ? 21 : 34) : 0;
  const side = state.status && state.landscape ? 62 : 0;
  const inset = state.layout === 'inset';
  const screen = $('screen');
  screen.style.width = `${width}px`;
  screen.style.height = `${height}px`;
  screen.style.setProperty('--bar-color', state.barColor);
  screen.style.setProperty('--ink', state.theme === 'dark' ? '#161616' : '#ffffff');
  screen.style.setProperty('--safe-top', `${top}px`);
  screen.style.setProperty('--safe-bottom', `${bottom}px`);
  screen.style.setProperty('--safe-side', `${side}px`);
  screen.style.background = state.barColor;
  screen.classList.toggle('overlay', !inset);
  $('phone').classList.toggle('landscape', state.landscape);
  $('statusBar').hidden = !state.status;
  $('island').hidden = !state.status;
  $('homeArea').hidden = !state.home;
  $('guides').hidden = !state.guides;
  $('screenSpec').textContent = `${width} × ${height}`;
  $('viewportLabel').textContent = `${width - (inset ? side * 2 : 0)} × ${height - (inset ? top + bottom : 0)} 内容区`;
  const frame = $('previewFrame');
  frame.style.left = `${inset ? side : 0}px`;
  frame.style.top = `${inset ? top : 0}px`;
  frame.style.width = `${width - (inset ? side * 2 : 0)}px`;
  frame.style.height = `${height - (inset ? top + bottom : 0)}px`;
  $('batteryFill').style.width = `${24 * state.battery / 100}px`;
  const fill = state.battery <= 20 ? '#777777' : (state.theme === 'dark' ? '#161616' : '#ffffff');
  $('batteryFill').style.background = fill;
  $('batteryText').textContent = String(state.battery);
  $('batteryText').style.color = state.battery < 55 ? (state.theme === 'dark' ? '#161616' : '#ffffff') : (state.theme === 'dark' ? '#ffffff' : '#161616');
  $('batteryOutput').value = String(state.battery);
  $('rotateButton').querySelector('span').textContent = state.landscape ? '切换为竖屏' : '切换为横屏';
  for (const [id, key] of [['statusToggle', 'status'], ['homeToggle', 'home'], ['guideToggle', 'guides']]) $(id).checked = state[key];
  $('layoutMode').value = state.layout;
  $('zoomSelect').value = state.zoom;
  $('barColor').value = state.barColor;
  $('colorValue').textContent = state.barColor.toUpperCase();
  $('batteryLevel').value = state.battery;
  document.querySelectorAll('[data-theme]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === state.theme)));
  $('layoutHint').textContent = inset ? '系统栏独立显示，页面内容不会被遮挡。' : '系统栏覆盖页面；参考线不改变 H5 的安全区变量。';
  requestAnimationFrame(resizeDevice);
}

$('addressForm').addEventListener('submit', event => {
  event.preventDefault();
  try { navigate(normalizeAddress($('addressInput').value)); }
  catch (error) { toast(error.message); $('addressInput').setAttribute('aria-invalid', 'true'); $('addressInput').focus(); }
});
$('addressInput').addEventListener('input', () => $('addressInput').removeAttribute('aria-invalid'));
$('previewFrame').addEventListener('load', () => {
  clearTimeout(loadingTimer);
  $('loadStatus').textContent = navigationMessage || (isDemo(currentUrl) ? '示例预览中' : '预览中 · 若空白请查看帮助');
});
$('refreshButton').addEventListener('click', () => { if (window.pocketDesktop) window.pocketDesktop.reload(); else navigate(currentUrl, false); toast('已重新请求 H5 页面'); });
$('externalButton').addEventListener('click', () => window.open(currentUrl, '_blank', 'noopener,noreferrer'));
$('demoButton').addEventListener('click', () => { navigate(new URL('/demo.html', location.href).href, false); toast('已打开内置示例'); });
$('rotateButton').addEventListener('click', () => { state.landscape = !state.landscape; render(); persist(); });
for (const [id, key] of [['statusToggle', 'status'], ['homeToggle', 'home'], ['guideToggle', 'guides']]) {
  $(id).addEventListener('change', event => { state[key] = event.target.checked; render(); persist(); });
}
for (const [id, key] of [['layoutMode', 'layout'], ['zoomSelect', 'zoom'], ['barColor', 'barColor']]) {
  $(id).addEventListener('input', event => { state[key] = event.target.value; render(); persist(); });
}
$('batteryLevel').addEventListener('input', event => { state.battery = Number(event.target.value); render(); persist(); });
$('themeOptions').addEventListener('click', event => {
  const button = event.target.closest('[data-theme]');
  if (!button) return;
  state.theme = button.dataset.theme; render(); persist();
});
$('resetButton').addEventListener('click', () => { Object.assign(state, defaults); render(); persist(); toast('已恢复默认外观'); });
$('calibrationForm').addEventListener('submit', event => {
  event.preventDefault();
  const millimeters = Number($('measuredLength').value);
  if (!Number.isFinite(millimeters) || millimeters < 5 || millimeters > 300) { toast('请输入 5–300 mm 的实际测量长度'); return; }
  const cssWidth = $('calibrationRuler').getBoundingClientRect().width;
  calibrations[displayScale().key] = cssWidth * 25.4 / millimeters;
  state.zoom = '1';
  render(); persist();
  toast('已校准，100% 现在对应真机物理大小');
});
$('clearCalibration').addEventListener('click', () => { delete calibrations[displayScale().key]; $('measuredLength').value = ''; render(); persist(); });
window.addEventListener('pocketdisplaychange', () => { $('measuredLength').value = ''; resizeDevice(); });
window.addEventListener('resize', resizeDevice);

function proxySupported() { return window.pocketProxyAvailable === true && Boolean(window.pocketDesktop || window.webkit?.messageHandlers?.pocketProxy); }
function updateProxyAvailability() {
  const available = proxySupported();
  $('proxyForm').querySelectorAll('input,button').forEach(element => { element.disabled = !available; });
  if (!available) $('proxyStatus').textContent = '此功能需要 macOS 14+ 的 Pocket 独立应用';
}
function sendProxyRequest(action, config = {}) {
  if (!proxySupported()) return;
  const requestId = ++proxyRequest;
  clearTimeout(pendingProxy?.timer);
  pendingProxy = {requestId, action, timer: setTimeout(() => { $('applyProxy').disabled = false; $('proxyStatus').textContent = '未收到应用响应，请重新应用配置'; pendingProxy = null; }, 8000)};
  $('applyProxy').disabled = true;
  const message = {action, requestId, ...config};
  if (window.pocketDesktop) window.pocketDesktop.proxy(message)
    .then(detail => window.dispatchEvent(new CustomEvent('pocketproxyresult', {detail})))
    .catch(() => window.dispatchEvent(new CustomEvent('pocketproxyresult', {detail: {requestId, ok: false, message: '应用未能应用代理，请重试'}})));
  else window.webkit.messageHandlers.pocketProxy.postMessage(message);
}
window.addEventListener('pocketproxyresult', event => {
  const result = event.detail;
  if (!pendingProxy || result?.requestId !== pendingProxy.requestId) return;
  const action = pendingProxy.action;
  clearTimeout(pendingProxy.timer); pendingProxy = null;
  $('applyProxy').disabled = !proxySupported();
  if (!result.ok) { $('proxyStatus').textContent = result.message || '代理配置失败'; return; }
  $('proxyEnabled').checked = result.enabled;
  $('proxyBadge').textContent = result.enabled ? '已应用' : '未启用';
  $('proxyStatus').textContent = result.enabled ? '配置已应用；连接状态以页面实际加载结果为准' : '未启用应用内代理，使用系统网络设置';
  if (action === 'apply') { persist(); navigate(currentUrl, false); toast(result.enabled ? '已应用 SOCKS5，正在重新加载预览' : '已关闭应用内代理'); }
});
$('proxyForm').addEventListener('submit', event => {
  event.preventDefault();
  const enabled = $('proxyEnabled').checked;
  const host = $('proxyHost').value.trim().replace(/^\[|\]$/g, '');
  const port = Number($('proxyPort').value);
  if (enabled && (!host || !/^[a-z\d._:-]+$/i.test(host) || !Number.isInteger(port) || port < 1 || port > 65535)) { $('proxyStatus').textContent = '请填写有效的服务器主机名或 IP，以及 1–65535 的端口'; return; }
  const username = $('proxyUsername').value;
  const password = $('proxyPassword').value;
  if (enabled && ((password && !username) || new TextEncoder().encode(username).length > 255 || new TextEncoder().encode(password).length > 255)) { $('proxyStatus').textContent = '使用密码时请同时填写账号；账号和密码各不能超过 255 字节'; return; }
  $('proxyStatus').textContent = '正在应用代理配置…';
  sendProxyRequest('apply', {enabled, host, port, username, password});
});
if (typeof saved.proxyEndpoint?.host === 'string' && /^[a-z\d._:-]{1,253}$/i.test(saved.proxyEndpoint.host)) $('proxyHost').value = saved.proxyEndpoint.host;
if (/^\d{1,5}$/.test(String(saved.proxyEndpoint?.port))) $('proxyPort').value = saved.proxyEndpoint.port;
window.addEventListener('pocketdisplaychange', updateProxyAvailability);
updateProxyAvailability();
sendProxyRequest('status');
function openHelp() {
  const dialog = $('helpDialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else {
    dialog.classList.add('fallback-dialog');
    dialog.setAttribute('open', '');
    $('helpBackdrop').hidden = false;
    $('closeHelpButton').focus();
  }
}
function closeHelp() {
  const dialog = $('helpDialog');
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
  $('helpBackdrop').hidden = true;
}
for (const id of ['helpButton', 'troubleshootButton']) $(id).addEventListener('click', openHelp);
$('closeHelpButton').addEventListener('click', closeHelp);
$('helpBackdrop').addEventListener('click', closeHelp);
$('helpDialog').addEventListener('click', event => { if (event.target === $('helpDialog')) { const rect = $('helpDialog').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeHelp(); } });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('helpDialog').hasAttribute('open')) closeHelp();
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !$('helpDialog').hasAttribute('open')) {
    event.preventDefault();
    const form = $('addressForm');
    if (typeof form.requestSubmit === 'function') form.requestSubmit();
    else form.dispatchEvent(new Event('submit', { cancelable: true }));
  }
});
new ResizeObserver(resizeDevice).observe($('canvas'));
updateHistory();
render();
const requested = new URLSearchParams(location.search).get('url') || saved.url;
let firstUrl = new URL('/demo.html', location.href).href;
if (requested) { try { firstUrl = normalizeAddress(requested); } catch { /* Fall back to the included demo. */ } }
navigate(firstUrl, false);
