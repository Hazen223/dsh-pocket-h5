/* ------------------------------------------------------------------ *
 * Pocket H5 —— 面板外观层（client.js 的片段源，不是独立 ES 模块）
 *
 * 把上游「整页表单」重排成 FlowPilot 风格的工作台：
 *   48px 顶栏（品牌 + 当前页面 + 状态 + 动作）/ 左侧设置卡片 / 右侧手机画布卡片，
 *   三层表面（base / surface / surface-2）+ 12px 圆角 + 4 栅格间距，颜色一律用
 *   light-dark() 成对声明 —— 跟随 DSH 的 color-scheme，自动明暗切换。
 * 只做外观与 DOM 重排：所有上游 id、事件、预览逻辑保持不变。
 * ------------------------------------------------------------------ */

const PANEL_THEME_CSS = String.raw`
/* ==================================================================
 * 1. 设计令牌：light-dark() 成对声明，跟随宿主 color-scheme
 * ================================================================== */
.ph-workspace,
.ph-topbar,
.pocket-h5-root {
  --p-base: light-dark(#f6f7f8, #17181a);
  --p-surface: light-dark(#ffffff, #1d1f23);
  --p-surface-2: light-dark(#f1f2f3, #0d0e10);
  --p-surface-3: light-dark(#e8eaec, #2a2c32);
  --p-hover: light-dark(#f1f2f3, #24262b);
  --p-pressed: light-dark(#e8eaec, #2a2c32);
  --p-border: light-dark(#eceef0, rgba(241, 242, 243, 0.08));
  --p-border-strong: light-dark(#dfe1e4, rgba(227, 229, 231, 0.16));
  --p-text: light-dark(#0d0e10, #f0f1f2);
  --p-text-dim: light-dark(#61666d, rgba(240, 241, 242, 0.62));
  --p-text-tertiary: light-dark(#9499a0, rgba(240, 241, 242, 0.45));
  --p-brand: light-dark(#0d0e10, #f0f1f2);
  --p-on-brand: light-dark(#ffffff, #0d0e10);
  --p-mask: light-dark(rgba(13, 14, 16, 0.44), rgba(0, 0, 0, 0.62));
  --p-dot: light-dark(#dcdcdc, rgba(255, 255, 255, 0.09));
  --p-shadow-1: 0 1px 2px light-dark(rgba(13, 14, 16, 0.06), rgba(0, 0, 0, 0.36));
  --p-shadow-2: 0 4px 16px light-dark(rgba(13, 14, 16, 0.1), rgba(0, 0, 0, 0.46));
  --p-shadow-3: 0 16px 48px light-dark(rgba(13, 14, 16, 0.16), rgba(0, 0, 0, 0.56));
  --p-radius: 12px;
  --p-radius-sm: 8px;
  --p-radius-xs: 6px;
  --p-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* 兼容上游 :root 变量名：全部指向新面层，旧规则自动跟随明暗 */
.pocket-h5-root {
  --ink: var(--p-text);
  --ink-2: var(--p-text-dim);
  --muted: var(--p-text-dim);
  --faint: var(--p-text-tertiary);
  --line: var(--p-border);
  --line-strong: var(--p-border-strong);
  --surface: var(--p-surface);
  --surface-2: var(--p-surface-2);
  --surface-3: var(--p-surface-3);
  --accent: var(--p-brand);
  --radius: 8px;
  --sidebar-w: 300px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--p-text);
  background: var(--p-base);
  -webkit-font-smoothing: antialiased;
}

/* ==================================================================
 * 2. 骨架：48px 顶栏 + 左侧设置卡 + 右侧画布卡（FlowPilot 三栏节奏）
 * ================================================================== */
.workspace.ph-workspace {
  grid-template-columns: 300px minmax(0, 1fr);
  grid-template-rows: 48px minmax(0, 1fr);
  gap: 0 12px;
  padding: 0 16px 16px;
  background: var(--p-base);
  transition: none;
}
.ph-topbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  height: 48px;
  padding: 0;
  background: transparent;
}
.ph-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: none;
  min-width: 0;
}
.ph-brand .brand {
  gap: 8px;
  font-size: 14.5px;
  font-weight: 650;
  letter-spacing: -0.2px;
  color: var(--p-text);
  text-decoration: none;
}
.ph-brand .brand-mark {
  width: 26px;
  height: 28px;
  border-radius: 8px;
  background: var(--p-brand);
  color: var(--p-on-brand);
  box-shadow: none;
}
.ph-brand .brand-mark svg { width: 16px; height: 16px; }
.ph-brand .brand-dot { color: var(--p-text-tertiary); }
.ph-brand .brand-sub {
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--p-surface-2);
  font-size: 10.5px;
  letter-spacing: 0.02em;
  color: var(--p-text-dim);
}
.ph-spacer { flex: 1 1 auto; min-width: 8px; }
.ph-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
  min-width: 0;
}

/* 顶栏里的当前页面 + 小按钮（原 .preview-meta） */
.ph-topbar .preview-meta {
  margin: 0;
  padding: 0 2px;
  gap: 6px;
  font-size: 11.5px;
  color: var(--p-text-tertiary);
  flex: 0 1 auto;
  overflow: hidden;
}
.ph-topbar .preview-meta > #previewName {
  max-width: 220px;
  font: 11px var(--p-mono);
  color: var(--p-text-dim);
}
.ph-topbar .preview-meta .preview-dot { background: var(--p-text-tertiary); }
.ph-topbar .preview-meta .text-button { margin-left: 0; }
.ph-topbar .text-button {
  padding: 4px 8px;
  border-radius: var(--p-radius-xs);
  font-size: 11.5px;
  color: var(--p-text-dim);
}
.ph-topbar .text-button:hover { color: var(--p-text); background: var(--p-surface-2); }

/* 顶栏状态：压缩成胶囊，长文案省略 */
.ph-topbar #loadStatus {
  flex: none;
  max-width: 280px;
  min-height: 26px;
  margin: 0;
  padding: 0 10px;
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  background: var(--p-surface-2);
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--p-text-dim);
}
.ph-topbar #loadStatus::before { background: var(--p-text-tertiary); }
.ph-topbar .icon-button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
  color: var(--p-text-dim);
}
.ph-topbar .icon-button:hover { background: var(--p-hover); color: var(--p-text); }
.ph-topbar .icon-button svg { width: 16px; height: 16px; }

/* 左栏：不再是一张长卡片，而是「一区一卡」的卡片栈（无横向分隔线） */
.sidebar {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 2px 0 10px;
  border: 0;
  border-radius: 0;
  background: transparent;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}
.sidebar::-webkit-scrollbar { width: 8px; }
.sidebar::-webkit-scrollbar-thumb { border-radius: 999px; background: var(--p-border-strong); }
.sidebar::-webkit-scrollbar-track { background: transparent; }

/* 右栏：画布卡片 */
.main-panel {
  grid-column: 2;
  grid-row: 2;
  border: 1px solid var(--p-border);
  border-radius: var(--p-radius);
  background: var(--p-base);
  overflow: hidden;
}
.main-panel .canvas {
  padding: 20px;
  background-color: var(--p-base);
  background-image: radial-gradient(var(--p-dot) 0.7px, transparent 0.7px);
  background-size: 20px 20px;
}

/* ==================================================================
 * 2.5 设备外框：用边框图片当「手机壳」盖在长方形页面之上
 *     .screen 是普通矩形（无圆角），边框图片叠在其上方，用不透明的
 *     内框/圆角遮住页面四角 —— 圆角来自素材本身，不靠 CSS 拟合。
 * ================================================================== */
.phone {
  background: none !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: visible !important;
}
.phone::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  background-image: var(--p-bezel-image);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  filter: drop-shadow(0 16px 30px light-dark(rgba(13, 14, 16, 0.18), rgba(0, 0, 0, 0.55)));
}
/* 横屏：同一张竖屏边框旋转 -90°（顶部 → 左侧），几何由 app.js 的边距保证 */
.phone.landscape::before {
  inset: auto;
  left: 50%;
  top: 50%;
  width: var(--p-bezel-w);
  height: var(--p-bezel-h);
  transform: translate(-50%, -50%) rotate(-90deg);
}
.phone .side-key { display: none !important; }
.phone .screen {
  border-radius: 0 !important;
  box-shadow: none !important;
}

/* ==================================================================
 * 3. 功能分区 = 独立卡片（一区一卡，全部依靠面层与间距分隔，不用横线）
 * ================================================================== */
.settings-section,
details.settings-section {
  flex: none;
  margin: 0;
  padding: 12px;
  border: 0;
  border-radius: var(--p-radius);
  background: var(--p-surface);
  box-shadow: var(--p-shadow-1);
}
.address-section { padding-top: 12px; }
.section-label {
  margin: 0 0 10px;
  padding: 0;
  justify-content: flex-start;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--p-text-tertiary);
  line-height: 1.4;
}
.section-label > .ph-help { margin-left: 5px; }
.appearance-section > summary::after { margin-left: auto; }
.fold > summary .summary-title { flex: 0 1 auto; }
.fold > summary .summary-badge { margin-left: auto; }
.fold > summary > .ph-help { margin-left: 5px; }
.fold > summary::after { margin-left: 0; }
/* 折叠形分区（系统外观）的标题行也当分区标题用 */
details.appearance-section > summary.section-label { margin: 0; }
details.appearance-section[open] > summary.section-label { margin: 0 0 10px; }
.field-label {
  margin: 0 0 6px;
  padding: 0 2px;
  font-size: 11.5px;
  color: var(--p-text-dim);
}
.setting-hint {
  margin-top: 8px;
  padding: 0 2px;
  font-size: 11px;
  line-height: 1.7;
  color: var(--p-text-tertiary);
}

/* ==================================================================
 * 4. 控件：无描边面层 + 8px 圆角 + 36px 高度
 * ================================================================== */
.address-toolbar { gap: 8px; }
.address-box {
  height: 36px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
  transition: background 0.15s, box-shadow 0.15s;
}
.address-box:focus-within {
  background: var(--p-surface);
  border-color: var(--p-border-strong);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-brand) 10%, transparent);
}
.address-box:has(input[aria-invalid="true"]) {
  border-color: var(--p-border-strong);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--p-brand) 14%, transparent);
}
.address-box svg { width: 15px; height: 15px; color: var(--p-text-tertiary); }
.address-box input {
  font: 12.5px var(--p-mono);
  color: var(--p-text);
}
.address-box input::placeholder { font-size: 12px; color: var(--p-text-tertiary); }

.address-buttons { gap: 8px; }
.load-button {
  height: 36px;
  padding: 0 12px;
  border-radius: var(--p-radius-sm);
  background: var(--p-brand);
  color: var(--p-on-brand);
  font-size: 12.5px;
  font-weight: 500;
  box-shadow: none;
}
.load-button:hover { background: color-mix(in srgb, var(--p-brand) 88%, var(--p-base)); }
.load-button:active { transform: none; }
.load-button:disabled { opacity: 0.45; }

.icon-button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
  color: var(--p-text-dim);
}
.icon-button:hover { background: var(--p-hover); color: var(--p-text); border-color: transparent; }
.icon-button:active { transform: none; }

.outline-button {
  height: 34px;
  margin-top: 8px;
  border: 0;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
  font-size: 12px;
  color: var(--p-text-dim);
}
.outline-button:hover { background: var(--p-hover); color: var(--p-text); border-color: transparent; }
.outline-button:active { transform: none; }

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
summary:focus-visible,
textarea:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--p-brand) 55%, transparent);
  outline-offset: 1px;
}

/* 折叠区（代理 / 校准 / 屏幕规格）：卡片内的下沉小面板，不再用虚线分隔 */
.fold {
  margin-top: 10px;
  padding: 8px 10px;
  border-top: 0;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
}
.fold > summary {
  padding: 1px 0;
  border-radius: var(--p-radius-xs);
  font-size: 11.5px;
  color: var(--p-text-dim);
}
.fold > summary:hover { color: var(--p-text); }
.fold > summary::after { border-color: var(--p-text-tertiary); }
.fold[open] > summary { margin-bottom: 8px; }
.fold > .field,
.fold > .field-grid { margin-top: 8px; }
.summary-badge {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--p-surface-2);
  color: var(--p-text-tertiary);
}

/* 表单控件 */
.field { margin-top: 10px; }
.field > span { margin-bottom: 5px; font-size: 11.5px; color: var(--p-text-dim); }
.field input,
.calibration-input input,
.bridge-manual textarea {
  height: 34px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
  font-size: 12px;
  color: var(--p-text);
}
.field input::placeholder,
.calibration-input input::placeholder { color: var(--p-text-tertiary); font-size: 11.5px; }
.field input:focus,
.calibration-input input:focus {
  background: var(--p-surface);
  border-color: var(--p-border-strong);
}
select {
  height: 34px;
  padding: 0 30px 0 10px;
  border: 1px solid transparent;
  border-radius: var(--p-radius-sm);
  background-color: var(--p-surface-2);
  color: var(--p-text);
  font-size: 12px;
}
select:hover { border-color: transparent; background-color: var(--p-hover); }
.color-control select { background-color: var(--p-surface-2); }

/* 开关 / 分段 / 滑杆 */
.setting-row {
  min-height: 36px;
  margin: 2px 0;
  font-size: 12.5px;
  color: var(--p-text);
}
.setting-row small { font-size: 10.5px; color: var(--p-text-tertiary); }
.setting-row input:checked + .switch { background: var(--p-brand); }
.switch {
  width: 32px;
  height: 18px;
  background: var(--p-surface-3);
}
.switch::before {
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-1);
}
.setting-row input:checked + .switch::before { transform: translateX(14px); background: var(--p-on-brand); }
.setting-row input:disabled + .switch { opacity: 0.45; }
.segments {
  padding: 3px;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
}
.segments button,
.segments button[aria-pressed="false"] {
  padding: 6px 0;
  border-radius: var(--p-radius-xs);
  font-size: 11.5px;
  color: var(--p-text-dim);
}
.segments button[aria-pressed="true"] {
  background: var(--p-surface);
  color: var(--p-text);
  box-shadow: var(--p-shadow-1);
}
.inline-controls { margin-top: 12px; font-size: 12.5px; color: var(--p-text); }
.inline-value { font-size: 11.5px; color: var(--p-text-dim); }
.color-control span { font: 10.5px var(--p-mono); color: var(--p-text-tertiary); }
.range-input { margin: 10px 0 2px; accent-color: var(--p-brand); }

/* 模拟设备 */
.device-card {
  padding: 10px 12px;
  border: 0;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface-2);
}
.device-info strong { font-size: 12.5px; color: var(--p-text); }
.device-info small { font-size: 10.5px; color: var(--p-text-tertiary); }
.mini-phone { border-color: var(--p-border-strong); background: var(--p-surface-3); box-shadow: inset 0 0 0 2px var(--p-surface-2); }
.mini-phone span { background: var(--p-text-tertiary); }
.device-check { color: var(--p-text-dim); }
.device-content { font: 11.5px var(--p-mono); color: var(--p-text-tertiary); }
.spec-line { font-size: 11px; color: var(--p-text-tertiary); }
.spec-line strong,
.spec-line > span:last-child { font: 11px var(--p-mono); color: var(--p-text-dim); }

/* 显示比例读数 */
.scale-readout strong { font-size: 12.5px; font-weight: 600; color: var(--p-text); }
.scale-readout > span { font: 11px var(--p-mono); color: var(--p-text-dim); }
.calibration-ruler { border-color: var(--p-text-tertiary); }
.calibration-ruler:before { background: var(--p-text-tertiary); }

/* 侧栏底部：单独一张小卡片 */
.ph-sidebar-foot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: none;
  margin-top: auto;
  padding: 10px 12px;
  border-radius: var(--p-radius);
  background: var(--p-surface);
  box-shadow: var(--p-shadow-1);
}
.ph-sidebar-foot .sidebar-help {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0;
  padding: 0;
  border-top: 0;
}
.ph-sidebar-foot .sidebar-help button { padding: 4px 2px; font-size: 11.5px; color: var(--p-text-dim); }
.ph-sidebar-foot .sidebar-help button:hover { color: var(--p-text); background: transparent; }
.ph-sidebar-foot .sidebar-bottom {
  gap: 6px;
  margin: 0;
  padding: 0;
  font-size: 10.5px;
  color: var(--p-text-tertiary);
}
.ph-sidebar-foot .saved-dot { background: var(--p-text-tertiary); }
.ph-sidebar-foot .sidebar-bottom button { color: var(--p-text-dim); border-radius: var(--p-radius-xs); }
.ph-sidebar-foot .sidebar-bottom button:hover { background: var(--p-surface-2); color: var(--p-text); }
.ph-sidebar-foot .sidebar-note {
  margin: 0;
  padding: 0;
  font-size: 10.5px;
  line-height: 1.6;
  color: var(--p-text-tertiary);
}
.ph-sidebar-foot #engineInfo,
.ph-sidebar-foot #devToolsButton { margin: 0; }

/* ==================================================================
 * 5. 对话框 / 帮助 / toast（含二维码、诊断、登录桥对话框）
 * ================================================================== */
dialog {
  border: 1px solid var(--p-border-strong);
  border-radius: var(--p-radius);
  background: var(--p-surface);
  color: var(--p-text);
  box-shadow: var(--p-shadow-3);
}
dialog::backdrop { background: var(--p-mask); }
.eyebrow { font-size: 10px; letter-spacing: 1.4px; color: var(--p-text-tertiary); }
.dialog-heading h2 { font-size: 19px; font-weight: 600; letter-spacing: -0.4px; color: var(--p-text); }
.help-content { color: var(--p-text-dim); }
.help-content h3 { font-size: 12.5px; color: var(--p-text); }
.help-content p { font-size: 11.5px; line-height: 1.85; color: var(--p-text-dim); }
.help-content code {
  background: var(--p-surface-2);
  color: var(--p-text-dim);
}
.help-content .help-footnote { color: var(--p-text-tertiary); }
.help-note { background: var(--p-surface-2); }
.help-step > b { color: var(--p-text-tertiary); }
.help-footnote a { color: var(--p-text-dim); }
.toast {
  width: calc(300px - 24px);
  background: light-dark(#1d1f23, #f0f1f2);
  color: light-dark(#f0f1f2, #0d0e10);
  box-shadow: var(--p-shadow-2);
}
.help-backdrop { background: var(--p-mask); }

/* ==================================================================
 * 5.5 iOS 状态栏与底部手势条：按 Apple 标准几何重画
 *     - 状态栏 62pt 高，内容垂直居中：时间左内边距 54、右侧图标组右内边距 26；
 *     - 时间 17pt / 600 / 无衬线，数字等宽；
 *     - 信号 18x12（4 根圆角柱）、Wi-Fi 17x12（3 段弧 + 点）、电池 27x13（25 身 + 2 尖端）；
 *     - 底部手势条 134x5、圆角 2.5、距底 8pt。
 * ================================================================== */
.status-bar {
  height: 62px;
  padding: 0 26px 0 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--ink);
  background: var(--bar-color);
  pointer-events: none;
}
.status-time {
  width: auto;
  min-width: 0;
  font-size: 17px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.2px;
  font-variant-numeric: tabular-nums;
  text-align: left;
}
.status-right {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 20px;
  flex: none;
}
.status-right svg { stroke: none; fill: currentColor; }
.signal { width: 18px; height: 12px; }
.wifi { width: 17px; height: 12px; margin-top: 0; }
.wifi path { stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; fill: none; }
.wifi circle { fill: currentColor; }
.battery {
  box-sizing: border-box;
  width: 27px;
  height: 13px;
  margin-right: 2px;
  padding: 2px;
  border: 1px solid currentColor;
  border-radius: 4.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.battery:after {
  content: "";
  position: absolute;
  right: -3px;
  top: 3.6px;
  width: 2px;
  height: 5px;
  border-radius: 0 2px 2px 0;
  background: currentColor;
  opacity: 0.4;
}
.battery-fill {
  position: absolute;
  left: 2px;
  top: 2px;
  bottom: 2px;
  width: 21px;
  border-radius: 2.4px;
  background: currentColor;
  z-index: 0;
}
#batteryText {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
}
.dynamic-island {
  top: 12px;
  width: 126px;
  height: 36px;
  border-radius: 18px;
}
.dynamic-island span {
  right: 10px;
  top: 10px;
  width: 12px;
  height: 12px;
}
.home-area {
  height: 34px;
  background: var(--bar-color);
}
.home-area > span {
  width: 134px;
  height: 5px;
  border-radius: 2.5px;
  bottom: 8px;
  background: var(--ink);
  opacity: 1;
}
.landscape .home-area { height: 21px; }
.landscape .home-area span { width: 180px; bottom: 7px; }

/* ==================================================================
 * 5.6 侧栏说明：能省的副标题/说明全部收进圆形「?」的 hover 提示
 *     —— 布局本身说明用法，必要的解释按需出现。
 * ================================================================== */
.ph-help {
  flex: none;
  width: 13px;
  height: 13px;
  margin-left: 5px;
  padding: 0;
  border: 1px solid var(--p-border-strong);
  border-radius: 50%;
  background: transparent;
  color: var(--p-text-tertiary);
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}
.ph-help:hover,
.ph-help:focus-visible {
  color: var(--p-text);
  border-color: var(--p-text-tertiary);
  background: var(--p-hover);
  outline: none;
}
.ph-tip,
.ph-tip[popover] {
  position: fixed;
  inset: auto;
  margin: 0;
  z-index: 60;
  max-width: 268px;
  padding: 8px 10px;
  border: 1px solid var(--p-border-strong);
  border-radius: var(--p-radius-sm);
  background: var(--p-surface);
  color: var(--p-text-dim);
  font-size: 11.5px;
  line-height: 1.7;
  box-shadow: var(--p-shadow-2);
  pointer-events: none;
}
.ph-tip-text { margin: 0; }
.ph-tip-status {
  margin: 5px 0 0;
  padding-top: 5px;
  border-top: 1px solid var(--p-border);
  color: var(--p-text-tertiary);
  font-size: 11px;
}
/* 静态说明与脚注不再占版面：内容已在对应 ? 提示里 */
.settings-section .setting-hint,
.sidebar-note { display: none !important; }

/* 二维码 / 诊断 / 登录桥 的细节配色（结构由各自片段提供） */
.qr-dialog .qr-frame { border-color: var(--p-border); background: #ffffff; }
.qr-dialog .qr-empty { color: var(--p-text-tertiary); }
.qr-dialog .qr-url { color: var(--p-text-dim); }
.qr-dialog .qr-hint { color: var(--p-text-tertiary); }
.qr-dialog .qr-hint b { color: var(--p-text-dim); }
.diagnose-dialog .diagnose-loading { color: var(--p-text-tertiary); }
.diagnose-dialog .diagnose-title { color: var(--p-text); }
.diagnose-dialog .diagnose-badge { background: var(--p-surface-2); color: var(--p-text-dim); }
.diagnose-dialog .diagnose-lines li,
.diagnose-dialog .diagnose-tips li { color: var(--p-text-dim); }
.diagnose-dialog .diagnose-tips { border-top-color: var(--p-border-strong); }
.diagnose-dialog .diagnose-tips li b { color: var(--p-text); }
.bridge-dialog .bridge-target { color: var(--p-text-dim); }
.bridge-dialog .bridge-status { border-color: var(--p-border); background: var(--p-surface-2); color: var(--p-text-dim); }
.bridge-dialog .bridge-manual summary { color: var(--p-text-dim); }
.bridge-banner { border-bottom: 1px solid var(--p-border); background: var(--p-surface-2); color: var(--p-text-dim); }
.bridge-banner .bridge-dot { background: var(--p-text-tertiary); }

/* ==================================================================
 * 6. 窄窗口
 * ================================================================== */
@media (max-width: 1080px) {
  .workspace.ph-workspace { grid-template-columns: 272px minmax(0, 1fr); }
  .ph-topbar .preview-meta > #previewName { max-width: 150px; }
  .ph-topbar #loadStatus { max-width: 200px; }
}
@media (max-width: 860px) {
  .workspace.ph-workspace { grid-template-columns: 244px minmax(0, 1fr); padding: 0 10px 10px; gap: 0 10px; }
  .ph-brand .brand-sub { display: none; }
  .ph-topbar .preview-meta { display: none; }
  .ph-topbar #loadStatus { max-width: 150px; }
}
`

/**
 * 重排上游 DOM：把品牌 / 当前页面 / 状态 / 刷新 / 新窗口移到 48px 顶栏，
 * 其余保持原节点与 id（app.js 的事件绑定完全不变）。
 * @param {ShadowRoot} shadow
 * @returns {() => void} 清理函数
 */
function mountPanelTheme(shadow) {
  const workspace = shadow.querySelector('.workspace')
  const sidebar = shadow.querySelector('.sidebar')
  if (!workspace || !sidebar) return function () {}

  // 设备边框素材与几何（构建期由 assets/bezel.json 注入）
  const root = shadow.querySelector('.pocket-h5-root')
  if (root && typeof POCKET_BEZEL_IMAGE === 'string') {
    root.style.setProperty('--p-bezel-image', 'url("' + POCKET_BEZEL_IMAGE + '")')
    root.style.setProperty('--p-bezel-w', POCKET_BEZEL.portrait.outerW + 'px')
    root.style.setProperty('--p-bezel-h', POCKET_BEZEL.portrait.outerH + 'px')
  }

  const brandRow = shadow.querySelector('.sidebar-brand')
  const meta = shadow.querySelector('.preview-meta')
  const status = shadow.getElementById('loadStatus')
  const refresh = shadow.getElementById('refreshButton')
  const external = shadow.getElementById('externalButton')

  const header = document.createElement('header')
  header.className = 'ph-topbar'

  const brand = document.createElement('div')
  brand.className = 'ph-brand'
  const mark = brandRow && brandRow.querySelector('.brand')
  const sub = brandRow && brandRow.querySelector('.brand-sub')
  if (mark) brand.append(mark)
  if (sub) brand.append(sub)
  header.append(brand)
  if (meta) header.append(meta)
  const spacer = document.createElement('div')
  spacer.className = 'ph-spacer'
  header.append(spacer)
  const actions = document.createElement('div')
  actions.className = 'ph-actions'
  if (status) actions.append(status)
  if (refresh) actions.append(refresh)
  if (external) actions.append(external)
  header.append(actions)

  workspace.insertBefore(header, workspace.firstChild)
  workspace.classList.add('ph-workspace')
  if (brandRow) brandRow.remove()

  // 侧栏页脚（帮助/自动保存/重置/说明）收进一张独立卡片，避免用分割线。
  const foot = document.createElement('div')
  foot.className = 'ph-sidebar-foot'
  for (const node of [
    shadow.querySelector('.sidebar-help'),
    shadow.getElementById('devToolsButton'),
    shadow.getElementById('engineInfo'),
    shadow.querySelector('.sidebar-bottom'),
    shadow.querySelector('.sidebar-note'),
  ]) {
    if (node) foot.append(node)
  }
  sidebar.append(foot)

  // 必要的说明收进圆形「?」提示：hover / focus 出现，点击可固定，Esc 关闭。
  const HELP_ITEMS = [
    {
      target: '#addressTitle',
      tip: '输入端口、localhost:3000/path 或完整 URL；⌘/Ctrl + Enter 打开。最近地址保存在本机。',
    },
    {
      target: '#displayTitle',
      tip: '100% 按显示器换算成真机物理大小（macOS 由 Host 读取显示器尺寸）。有偏差时用「校准实际尺寸」量一次即可。',
      dynamic: '#calibrationStatus',
    },
    {
      target: '#deviceTitle',
      tip: '模拟 iPhone 17：402×874 逻辑像素、1206×2622 物理像素、460 PPI、@3x；切换横竖屏会同步调整内容区。',
    },
    {
      target: '.appearance-section > summary',
      tip: '状态栏、手势条、文字与背景只改变模拟外观；安全区参考线不会注入或修改 H5 的 env(safe-area-inset-*)。',
    },
    {
      target: '#layoutTitle',
      tip: '「预留」让系统栏独立占位；「全屏页面」让 H5 铺满并被系统栏覆盖。参考线只是提示，不改变页面。',
      dynamic: '#layoutHint',
    },
    {
      target: '#proxyDetails > summary',
      tip: '面板版无法设置 iframe 请求的代理（沿用宿主浏览器的网络设置）；这里保留配置项，但不会修改系统代理。',
    },
    {
      target: '#calibrationDetails > summary',
      tip: '用真实尺子量出 200px 线段的长度并填入毫米数；校准按显示器保存在本机，之后 100% 就是真机物理大小。',
    },
    {
      target: '.sidebar-bottom',
      tip: '外观与布局预览，不是 iOS 模拟器；外观、地址与校准只保存在本机浏览器。',
    },
  ]

  if (!root) return function disposePanelThemeWithoutHelp() {
    workspace.classList.remove('ph-workspace')
    header.remove()
  }

  const tip = document.createElement('div')
  tip.className = 'ph-tip'
  // Popover API：提示层进入浏览器 top layer，不会被侧栏文字/滚动容器盖住或裁切。
  tip.setAttribute('popover', 'manual')
  tip.setAttribute('role', 'tooltip')
  root.append(tip)
  const supportsPopover = typeof tip.showPopover === 'function'
  if (!supportsPopover) tip.hidden = true

  const buttons = []
  let pinned = false
  const hideTip = function () {
    if (supportsPopover) {
      try {
        if (tip.matches(':popover-open')) tip.hidePopover()
      } catch (error) {
        /* 面板已卸载时忽略 */
      }
    } else {
      tip.hidden = true
    }
    pinned = false
  }
  const showTip = function (button) {
    const staticText = button.getAttribute('data-tip') || ''
    const dynamicSelector = button.getAttribute('data-tip-from')
    const dynamicEl = dynamicSelector ? shadow.querySelector(dynamicSelector) : null
    const dynamicText = dynamicEl && dynamicEl.textContent ? dynamicEl.textContent.trim() : ''
    tip.replaceChildren()
    const first = document.createElement('p')
    first.className = 'ph-tip-text'
    first.textContent = staticText
    tip.append(first)
    if (dynamicText !== '') {
      const status = document.createElement('p')
      status.className = 'ph-tip-status'
      status.textContent = dynamicText
      tip.append(status)
    }
    const rect = button.getBoundingClientRect()
    if (supportsPopover) {
      tip.style.visibility = 'hidden'
      if (!tip.matches(':popover-open')) tip.showPopover()
    } else {
      tip.hidden = false
      tip.style.visibility = 'hidden'
    }
    const width = tip.offsetWidth
    const height = tip.offsetHeight
    const margin = 10
    // 左对齐到问号，但不超出窗口；默认在下方，空间不足时翻到上方并右对齐
    let left = Math.min(rect.left, window.innerWidth - width - margin)
    left = Math.max(left, margin)
    let top = rect.bottom + 8
    if (top + height > window.innerHeight - margin) top = Math.max(margin, rect.top - height - 8)
    tip.style.left = left + 'px'
    tip.style.top = top + 'px'
    tip.style.visibility = 'visible'
  }

  for (const item of HELP_ITEMS) {
    const target = shadow.querySelector(item.target)
    if (!target) continue
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'ph-help'
    button.textContent = '?'
    button.setAttribute('aria-label', '说明')
    button.setAttribute('data-tip', item.tip)
    if (item.dynamic) button.setAttribute('data-tip-from', item.dynamic)
    button.addEventListener('mouseenter', function () { showTip(button) })
    button.addEventListener('mouseleave', function () { if (!pinned) hideTip() })
    button.addEventListener('focus', function () { showTip(button) })
    button.addEventListener('blur', function () { if (!pinned) hideTip() })
    button.addEventListener('click', function (event) {
      // 放在 <summary> 里时不要触发展开/收起
      event.preventDefault()
      event.stopPropagation()
      if (pinned) { hideTip(); return }
      pinned = true
      showTip(button)
    })
    const summaryTitle = target.matches('summary') ? target.querySelector('.summary-title') : null
    if (summaryTitle) summaryTitle.insertAdjacentElement('afterend', button)
    else target.append(button)
    buttons.push(button)
  }
  const onKeyDown = function (event) { if (event.key === 'Escape') hideTip() }
  const onScroll = function () { hideTip() }
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', hideTip)
  shadow.addEventListener('scroll', onScroll, true)

  return function disposePanelTheme() {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', hideTip)
    shadow.removeEventListener('scroll', onScroll, true)
    for (const button of buttons) button.remove()
    tip.remove()
    workspace.classList.remove('ph-workspace')
    header.remove()
  }
}
