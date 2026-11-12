/* ------------------------------------------------------------------
 * Pocket H5 · DSH 面板 client bundle —— 由 build-client.mjs 生成，不要手改。
 * 界面与行为来自 ui/ 下的上游快照；转换规则见 docs/adaptation.md。
 * ------------------------------------------------------------------ */
window.__ModuleLoader__.load({
  id: "dsh-pocket-h5",
  factory(require) {
    const React = require("react");
    const h = React.createElement;

    /* ---- 上游 styles.css（shadow 作用域适配） ---- */
    const CSS = `/* ------------------------------------------------------------------
   Pocket · H5 预览工作台
   纯黑白灰界面。左侧承载全部操作，右侧只留手机预览。
   ------------------------------------------------------------------ */

:host {
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-synthesis: none;
  color: #1f1f1f;
  background: #f4f4f4;
  --ink: #1f1f1f;
  --ink-2: #3d3d3d;
  --muted: #6c6c6c;
  --faint: #767676;
  --line: #e6e6e6;
  --line-strong: #d9d9d9;
  --surface: #ffffff;
  --surface-2: #f6f6f6;
  --surface-3: #efefef;
  --accent: #242424;
  --radius: 8px;
  --sidebar-w: 296px;
}

* { box-sizing: border-box; }
:host {
  display: block;
  height: 100%;
  margin: 0;
  overflow: hidden;
}
button, input, select { font: inherit; }
button, a, input, select { -webkit-tap-highlight-color: transparent; }
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
}
a { color: inherit; }
button:disabled { opacity: .4; cursor: default; }
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
summary:focus-visible {
  outline: 2px solid #8f8f8f;
  outline-offset: 2px;
}
svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.65;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}
h2 { margin: 0; }
p { margin: 0; }
.icon-library { position: absolute; width: 0; height: 0; overflow: hidden; }
[hidden] { display: none !important; }

/* ---------------- 布局骨架 ---------------- */

.workspace {
  display: grid;
  grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
  padding: 20px 20px 12px;
  background: var(--surface);
  border-right: 1px solid var(--line);
  overflow: auto;
  overscroll-behavior: contain;
}
.sidebar > * { flex-shrink: 0; }

.main-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: #f4f4f4;
}

/* ---------------- 品牌 ---------------- */

.sidebar-brand {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 16px;
  margin-bottom: 4px;
}
.sidebar-brand .brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -.5px;
  text-decoration: none;
  color: var(--ink);
}
.brand-mark {
  width: 30px;
  height: 33px;
  border-radius: 9px;
  background: var(--accent);
  color: #ffffff;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 4px #00000012;
}
.brand-mark svg { width: 20px; height: 20px; }
.brand-dot { color: #7d7d7d; }
.brand-sub { font-size: 10.5px; color: var(--faint); letter-spacing: .3px; }

/* ---------------- 分区 ---------------- */

.settings-section {
  padding: 17px 0;
  border-top: 1px solid var(--line);
}
.address-section { border-top: 0; padding-top: 12px; }

.section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 13px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: .3px;
  color: #2a2a2a;
  line-height: 1.4;
}

.field-label {
  display: block;
  margin: 0 0 6px;
  font-size: 11px;
  color: var(--muted);
}

.setting-hint {
  margin-top: 8px;
  font-size: 11.5px;
  line-height: 1.75;
  color: #757575;
}

/* ---------------- 预览地址 ---------------- */

.address-toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
}
.address-box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 11px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.address-box:focus-within {
  background: #ffffff;
  border-color: #9a9a9a;
  box-shadow: 0 0 0 3px #9a9a9a1f;
}
.address-box:has(input[aria-invalid="true"]) {
  border-color: #4a4a4a;
  box-shadow: 0 0 0 3px #4a4a4a1a;
}
.address-box svg { width: 16px; height: 16px; color: #9a9a9a; }
.address-box input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  outline: 0 !important;
  font: 12.5px ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: .2px;
  color: #2e2e2e;
}
.address-box input::placeholder {
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
  font-size: 12px;
  color: #9a9a9a;
}

.address-buttons { display: flex; gap: 8px; }
.load-button {
  flex: 1;
  height: 42px;
  padding: 0 15px;
  justify-content: space-between;
  background: var(--accent);
  color: #ffffff;
  border-radius: var(--radius);
  font-size: 12.5px;
  font-weight: 500;
  box-shadow: 0 1px 2px #00000014;
  transition: background .15s, transform .1s;
}
.load-button:hover { background: #3b3b3b; }
.load-button:active { transform: translateY(1px); }
.load-button svg { width: 16px; height: 16px; }

.icon-button {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  color: #5f5f5f;
  transition: background .15s, color .15s, border-color .15s;
}
.icon-button:hover { background: var(--surface-2); color: var(--ink); border-color: var(--line-strong); }
.icon-button:active { transform: translateY(1px); }
.icon-button svg { width: 18px; height: 18px; }

.preview-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  margin-top: 10px;
  font-size: 11px;
  color: var(--muted);
}
.preview-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #8c8c8c;
}
.preview-meta > #previewName {
  max-width: 172px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #4a4a4a;
}
.preview-meta .text-button { margin-left: auto; }

.text-button {
  padding: 5px 4px;
  border-radius: 6px;
  font-size: 11.5px;
  color: #5c5c5c;
  transition: background .15s, color .15s;
}
.text-button:hover { color: var(--ink); background: var(--surface-2); }
.text-button svg { width: 15px; height: 15px; }
.text-button.small { padding: 3px 0 3px 8px; font-size: 11px; }

.status-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  margin-top: 10px;
  padding: 7px 10px;
  border: 1px solid #ededed;
  border-radius: 6px;
  background: var(--surface-2);
  font-size: 11px;
  line-height: 1.5;
  color: #5b5b5b;
}
.status-pill::before {
  content: "";
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #9a9a9a;
}

/* ---------------- 折叠区（details） ---------------- */

details { margin: 0; }
details > summary { list-style: none; cursor: pointer; }
details > summary::-webkit-details-marker { display: none; }

.fold { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--line-strong); }
.fold > summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 500;
  color: #4d4d4d;
  transition: color .15s;
}
.fold > summary:hover { color: var(--ink); }
.fold > summary::after {
  content: "";
  width: 6px;
  height: 6px;
  margin-left: auto;
  flex-shrink: 0;
  border-right: 1.5px solid #8a8a8a;
  border-bottom: 1.5px solid #8a8a8a;
  transform: rotate(45deg);
  transition: transform .18s;
}
.fold[open] > summary::after { transform: rotate(225deg); }
.fold[open] > summary { margin-bottom: 12px; }

.summary-title { flex: 1; min-width: 0; }
.summary-badge {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--surface-3);
  font-size: 10px;
  font-weight: 400;
  color: #5f5f5f;
}

/* ---------------- 代理表单 ---------------- */

.proxy-details > summary { font-size: 11.5px; }
.proxy-details .setting-row { margin: 0 0 4px; }
.proxy-details input:disabled,
.proxy-details button:disabled { opacity: .45; }

.field { display: block; margin-top: 12px; }
.field > span {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--muted);
}
.field input {
  display: block;
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--surface-2);
  outline-offset: 2px;
  font-size: 12px;
  color: #333333;
  transition: border-color .15s, background .15s;
}
.field input:focus { background: #ffffff; border-color: #9e9e9e; }
.field input::placeholder { color: #a5a5a5; font-size: 11.5px; }
.field-grid { display: grid; grid-template-columns: minmax(0, 1fr) 78px; gap: 8px; }
.field-grid .field { margin-top: 12px; }

.outline-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 38px;
  margin-top: 12px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: #ffffff;
  font-size: 12px;
  color: #333333;
  transition: background .15s, border-color .15s, transform .1s;
}
.outline-button:hover { background: var(--surface-2); border-color: var(--line-strong); }
.outline-button:active { transform: translateY(1px); }
.outline-button svg { width: 15px; height: 15px; }

/* ---------------- 显示与尺寸 ---------------- */

.display-section select { width: 100%; }
#calibrationStatus:empty { display: none; }
.scale-readout {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 10px 0 2px;
}
.scale-readout strong { font-size: 12px; font-weight: 600; color: #2b2b2b; }
.scale-readout > span { font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; color: #6e6e6e; }

.calibration-details { margin-top: 14px; }
.calibration-details > summary { padding: 3px 0; }
.ruler-wrap { overflow: auto; margin: 6px 0; padding: 14px 2px 10px; }
.calibration-ruler {
  position: relative;
  width: 200px;
  min-width: 200px;
  height: 14px;
  border-left: 1px solid #5c5c5c;
  border-right: 1px solid #5c5c5c;
}
.calibration-ruler:before {
  content: "";
  position: absolute;
  top: 6px;
  left: 0;
  right: 0;
  height: 1px;
  background: #5c5c5c;
}
.calibration-input { display: flex; align-items: stretch; gap: 8px; }
.calibration-input input {
  flex: 1;
  width: 80px;
  min-width: 0;
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  font-size: 12px;
  color: #333333;
}
.calibration-input .load-button { flex: 0 0 72px; height: 38px; padding: 0 12px; justify-content: center; }
.calibration-details .text-button { margin-top: 6px; padding-left: 0; }
.calibration-details .load-button { margin-top: 0; }

/* ---------------- 模拟设备 ---------------- */

.device-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 13px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--surface-2);
}
.device-info strong { font-size: 12.5px; font-weight: 600; color: #2b2b2b; }
.device-info small { display: block; margin-top: 3px; font-size: 10.5px; color: var(--faint); }
.mini-phone {
  position: relative;
  width: 22px;
  height: 38px;
  border: 2px solid #8a8a8a;
  border-radius: 6px;
  background: #e9e9e9;
  box-shadow: inset 0 0 0 2px var(--surface-2);
}
.mini-phone span {
  position: absolute;
  top: 3px;
  left: 4px;
  width: 8px;
  height: 3px;
  border-radius: 3px;
  background: #8a8a8a;
}
.device-check { width: 16px; height: 16px; margin-left: auto; color: #4a4a4a; }

.device-section .outline-button { margin-top: 10px; }
.device-content {
  margin-top: 9px;
  font: 11.5px ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #757575;
}
.spec-details { margin-top: 12px; padding-top: 10px; }
.spec-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  font-size: 11px;
  color: #767676;
}
.spec-line strong,
.spec-line > span:last-child {
  font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
  font-weight: 500;
  color: #444444;
}

/* ---------------- 系统外观 ---------------- */

.appearance-section { padding: 17px 0; }
.appearance-section > summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  cursor: pointer;
}
.appearance-section > summary::after {
  content: "";
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-right: 1.5px solid #8a8a8a;
  border-bottom: 1.5px solid #8a8a8a;
  transform: rotate(45deg);
  transition: transform .18s;
}
.appearance-section[open] > summary::after { transform: rotate(225deg); }
.appearance-section[open] > summary { margin-bottom: 14px; }

.setting-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 40px;
  margin: 6px 0;
  font-size: 12px;
  color: #2f2f2f;
  cursor: pointer;
}
.setting-row small { display: block; margin-top: 3px; font-size: 10.5px; color: var(--faint); }
.setting-row input {
  position: absolute;
  right: 0;
  z-index: 1;
  width: 38px;
  height: 24px;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}
.switch {
  position: relative;
  width: 34px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 20px;
  background: #dedede;
  transition: background .18s;
}
.switch::before {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px #00000026;
  transition: transform .18s;
}
.setting-row input:checked + .switch { background: var(--accent); }
.setting-row input:checked + .switch::before { transform: translateX(14px); }
.setting-row input:focus-visible + .switch { outline: 2px solid #8f8f8f; outline-offset: 2px; }
.setting-row input:disabled + .switch { opacity: .45; }

.segments {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 7px;
  background: var(--surface-3);
}
.segments button {
  flex: 1;
  padding: 7px 0;
  border-radius: 5px;
  font-size: 11.5px;
  color: #6b6b6b;
  background: none;
  transition: background .15s, color .15s;
}
.segments button[aria-pressed="true"] {
  background: #ffffff;
  color: var(--ink);
  font-weight: 500;
  box-shadow: 0 1px 3px #0000001a;
}

.inline-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 15px;
  font-size: 12px;
  color: #3a3a3a;
}
.inline-value { font-size: 11.5px; color: var(--muted); }
.color-control { display: flex; align-items: center; gap: 8px; }
.color-control select { width: auto; padding: 7px 28px 7px 10px; font-size: 11.5px; }
.color-control span { font: 10.5px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--faint); }

.range-input {
  width: 100%;
  height: 3px;
  display: block;
  margin: 12px 0 2px;
  accent-color: var(--accent);
  cursor: pointer;
}

/* 通用下拉框 */
select {
  appearance: none;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 9px 30px 9px 11px;
  background: #ffffff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23888888' viewBox='0 0 12 12'%3E%3Cpath d='m3 5 3 3 3-3'/%3E%3C/svg%3E") no-repeat right 10px center;
  font-size: 12px;
  color: #3a3a3a;
  cursor: pointer;
  transition: border-color .15s;
}
select:hover { border-color: var(--line-strong); }
.color-control select { background-color: #ffffff; }

/* ---------------- 页面布局 ---------------- */

.layout-settings select { width: 100%; }
.layout-settings .setting-row { margin: 10px 0 0; }
.layout-settings .setting-hint { margin-top: 6px; }

/* ---------------- 侧栏底部 ---------------- */

.sidebar-help {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
}
.sidebar-help button { padding: 6px 0; font-size: 11.5px; }

.sidebar-bottom {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding: 14px 0 4px;
  font-size: 10.5px;
  color: var(--faint);
  white-space: nowrap;
}
.saved-dot { width: 5px; height: 5px; border-radius: 50%; background: #9c9c9c; }
.sidebar-bottom button {
  margin-left: auto;
  padding: 4px 6px;
  border-radius: 5px;
  font-size: 10.5px;
  color: #6f6f6f;
  transition: background .15s, color .15s;
}
.sidebar-bottom button:hover { background: var(--surface-2); color: var(--ink); }
.sidebar-note { margin-top: 2px; font-size: 10.5px; line-height: 1.7; color: #7d7d7d; }

#engineInfo { margin-top: 8px; }

/* ---------------- 预览画布 ---------------- */

.canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  padding: 24px;
  background-color: #f2f2f2;
  background-image: radial-gradient(#dcdcdc .7px, transparent .7px);
  background-size: 20px 20px;
  overscroll-behavior: contain;
}
.device-slot { position: relative; flex-shrink: 0; margin: auto 0; }

/* 手机外观：仅颜色为中性灰，几何尺寸保持不变 */
.phone {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
  background: linear-gradient(140deg, #8c8c8c, #4a4a4a 28%, #6f6f6f 56%, #3a3a3a 85%, #858585);
  border: 1px solid #666666;
  border-radius: 64px;
  box-shadow: 0 0 0 1px #dcdcdc, 0 24px 48px -12px #00000026, 0 4px 12px #00000014, inset 0 0 0 3px #9a9a9a;
  transform-origin: top left;
}

.screen {
  position: relative;
  width: 402px;
  height: 874px;
  border-radius: 53px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 0 0 5px #111111, 0 0 0 6px #4d4d4d;
  isolation: isolate;
  --bar-color: #ffffff;
  --ink: #191919;
  --safe-top: 62px;
  --safe-bottom: 34px;
  --safe-side: 0px;
}

.side-key {
  position: absolute;
  display: block;
  width: 3px;
  background: linear-gradient(90deg, #6f6f6f, #a3a3a3);
  border: 1px solid #666666;
  border-radius: 3px;
}
.key-action { height: 26px; left: -3px; top: 98px; }
.key-volume-up { height: 50px; left: -3px; top: 149px; }
.key-volume-down { height: 50px; left: -3px; top: 211px; }
.key-power { height: 72px; right: -3px; top: 181px; }

#previewFrame {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: #ffffff;
  display: block;
}

.status-bar {
  height: 62px;
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  width: 100%;
  color: var(--ink);
  background: var(--bar-color);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 28px 0 34px;
}
.status-time {
  width: 56px;
  font-size: 16px;
  line-height: 20px;
  font-weight: 650;
  letter-spacing: .15px;
  text-align: center;
}
.status-right { display: flex; align-items: center; gap: 7px; height: 20px; }
.status-right svg { stroke: none; fill: currentColor; }
.signal { width: 18px; height: 13px; }
.wifi { width: 17px; height: 14px; margin-top: -1px; }
.battery {
  width: 28px;
  height: 14px;
  border: 1px solid currentColor;
  border-radius: 4px;
  position: relative;
  margin-right: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.battery:after {
  content: "";
  position: absolute;
  right: -3px;
  top: 4px;
  width: 2px;
  height: 5px;
  background: currentColor;
  border-radius: 0 2px 2px 0;
  opacity: .55;
}
.battery-fill { position: absolute; inset: 1px auto 1px 1px; width: 24px; background: currentColor; border-radius: 2px; }
#batteryText {
  position: relative;
  z-index: 1;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: -.6px;
  color: var(--bar-color);
}

.dynamic-island {
  position: absolute;
  z-index: 4;
  top: 11px;
  left: 50%;
  transform: translateX(-50%);
  width: 126px;
  height: 36px;
  border-radius: 24px;
  background: #0a0a0a;
  box-shadow: inset 0 0 0 1px #1c1c1c;
  pointer-events: none;
}
.dynamic-island span {
  position: absolute;
  right: 11px;
  top: 11px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 65% 35%, #333333 0%, #171717 35%, #050505 75%);
  border: 1px solid #202020;
}

.home-area {
  position: absolute;
  z-index: 3;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 34px;
  background: var(--bar-color);
  pointer-events: none;
}
.home-area > span {
  position: absolute;
  bottom: 8px;
  left: 50%;
  width: 136px;
  height: 5px;
  border-radius: 5px;
  background: var(--ink);
  transform: translateX(-50%);
}
.screen.overlay .status-bar,
.screen.overlay .home-area { background: transparent; }

.safe-guides {
  position: absolute;
  inset: 0;
  z-index: 5;
  border-left: var(--safe-side) solid #a0a0a022;
  border-right: var(--safe-side) solid #a0a0a022;
  pointer-events: none;
  color: #818181;
  font-size: 8px;
  letter-spacing: .5px;
}
.guide-top {
  position: absolute;
  top: 0;
  width: 100%;
  height: var(--safe-top);
  background: #a0a0a015;
  border-bottom: 1px dashed #999999;
}
.guide-top span { position: absolute; right: 7px; bottom: 3px; }
.guide-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: var(--safe-bottom);
  background: #a0a0a015;
  border-top: 1px dashed #999999;
}
.guide-bottom span { position: absolute; right: 7px; top: 3px; }

/* 横屏 */
.landscape .status-bar { display: none; }
.landscape .dynamic-island {
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 126px;
}
.landscape .dynamic-island span { right: 11px; top: 11px; }
.landscape .home-area { height: 21px; }
.landscape .home-area span { width: 180px; bottom: 7px; }
.landscape .guide-top { display: none; }

/* ---------------- 提示与说明 ---------------- */

.toast {
  position: absolute;
  z-index: 20;
  left: 12px;
  bottom: 12px;
  width: calc(var(--sidebar-w) - 24px);
  padding: 11px 14px;
  border-radius: 9px;
  background: #2c2c2c;
  color: #ffffff;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  box-shadow: 0 8px 28px #00000033;
}

.dialog-heading { display: flex; justify-content: space-between; gap: 10px; }
.eyebrow { display: block; font-size: 10px; letter-spacing: 1.5px; color: #737373; }
.dialog-heading h2 { margin: 8px 0 24px; font-size: 22px; font-weight: 550; letter-spacing: -.6px; }
.help-content { color: #565656; }
.help-step { display: flex; gap: 16px; margin: 18px 0; }
.help-step > b { padding-top: 2px; font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; color: #9a9a9a; }
.help-content h3 { margin: 0 0 6px; font-size: 12.5px; font-weight: 600; color: #2e2e2e; }
.help-content p { margin: 0; font-size: 11.5px; line-height: 1.9; color: #6f6f6f; }
.help-content code {
  padding: 2px 4px;
  border-radius: 3px;
  background: #f3f3f3;
  font: 10.5px ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #555555;
  overflow-wrap: anywhere;
}
.help-note { margin-top: 22px; padding: 16px 18px; border-radius: 9px; background: #f6f6f6; }
.help-note p + p { margin-top: 7px; }
.help-content .help-footnote { margin-top: 18px; font-size: 11px; line-height: 1.85; color: #757575; }
.help-footnote a { display: block; margin-top: 8px; color: #6f6f6f; }

dialog:not([open]) { display: none; }
dialog {
  width: calc(100vw - 32px);
  max-width: 600px;
  max-height: 85dvh;
  padding: 28px 32px;
  overflow: auto;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  color: #3e3e3e;
  box-shadow: 0 30px 100px #00000024;
}
dialog::backdrop { background: #2d2d2d42; backdrop-filter: blur(5px); }
.help-backdrop { position: absolute; inset: 0; z-index: 29; background: #2d2d2d42; }
.fallback-dialog[open] {
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  z-index: 30;
  max-height: 85vh;
  overflow: auto;
}

/* ---------------- 窄窗口适配 ---------------- */

@media (min-width: 1600px) {
  :host { --sidebar-w: 308px; }
  .sidebar { padding-left: 24px; padding-right: 24px; }
}

@media (max-width: 1100px) {
  :host { --sidebar-w: 272px; }
  .sidebar { padding: 16px 15px 10px; }
  .preview-meta > #previewName { max-width: 142px; }
}

@media (max-height: 820px) {
  .sidebar-brand { padding-bottom: 12px; }
  .settings-section { padding: 13px 0; }
  .address-section { padding-top: 8px; }
  .section-label { margin-bottom: 10px; }
  .canvas { padding: 18px; }
}

@media (max-width: 760px) {
  :host { --sidebar-w: 236px; }
  .sidebar { padding: 14px 12px 8px; }
  .address-box,
  .address-buttons .load-button,
  .address-buttons .icon-button { height: 38px; }
  .address-buttons .icon-button { width: 38px; }
  .address-buttons { gap: 6px; }
  .preview-meta > #previewName { max-width: 112px; }
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; scroll-behavior: auto !important; }
}

/* ---- DSH 面板容器（构建期追加；上游样式保持原样） ---- */
.pocket-h5-root {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
`;

    /* ---- 上游 index.html <body>（图标已内联展开） ---- */
    const MARKUP = `<div class="workspace">
    <aside class="sidebar" aria-label="预览设置">
      <div class="sidebar-brand">
        <div class="brand" aria-label="Pocket"><span class="brand-mark"><svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 19h2"/></svg></span><span>Pocket<span class="brand-dot">.</span></span></div>
        <span class="brand-sub">H5 预览</span>
      </div>

      <section class="settings-section address-section" aria-labelledby="addressTitle">
        <h2 id="addressTitle" class="section-label">预览地址</h2>
        <form id="addressForm" class="address-toolbar">
          <div class="address-box"><svg viewBox="0 0 24 24"><path d="m10 13 4-4m-6 6-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 10a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-1 1" transform="translate(1 2) scale(.9)"/></svg><input id="addressInput" aria-label="H5 地址或端口" placeholder="端口或地址，如 5173" autocomplete="off" spellcheck="false" list="recentAddresses"><datalist id="recentAddresses"></datalist></div>
          <div class="address-buttons">
            <button class="load-button" type="submit">打开预览<svg viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></button>
            <button id="refreshButton" type="button" class="icon-button" title="刷新 H5 页面 · ⌘R" aria-label="刷新 H5 页面"><svg viewBox="0 0 24 24"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17"/></svg></button>
            <button id="externalButton" type="button" class="icon-button" title="在系统浏览器打开 H5（使用系统浏览器登录态）" aria-label="在系统浏览器打开 H5（使用系统浏览器登录态）"><svg viewBox="0 0 24 24"><path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></svg></button>
          </div>
        </form>
        <div class="preview-meta"><span class="preview-dot"></span><span id="previewName">内置示例</span><button id="demoButton" class="text-button small">示例</button></div>
        <p id="loadStatus" class="status-pill" role="status">准备预览</p>
        <details id="proxyDetails" class="fold proxy-details">
          <summary><span class="summary-title">SOCKS5 代理</span><span id="proxyBadge" class="summary-badge">未启用</span></summary>
          <form id="proxyForm">
            <label class="setting-row" for="proxyEnabled"><span>使用应用内代理</span><input id="proxyEnabled" type="checkbox" role="switch"><span class="switch" aria-hidden="true"></span></label>
            <div class="field-grid">
              <label class="field" for="proxyHost"><span>服务器</span><input id="proxyHost" type="text" value="127.0.0.1" autocomplete="off" spellcheck="false" maxlength="253" aria-label="代理服务器"></label>
              <label class="field field-port" for="proxyPort"><span>端口</span><input id="proxyPort" type="number" min="1" max="65535" step="1" value="1080" aria-label="代理端口"></label>
            </div>
            <label class="field" for="proxyUsername"><span>账号（可选）</span><input id="proxyUsername" class="proxy-field" type="text" autocomplete="off" maxlength="255" placeholder="无认证可留空"></label>
            <label class="field" for="proxyPassword"><span>密码（可选）</span><input id="proxyPassword" class="proxy-field" type="password" autocomplete="off" maxlength="255" placeholder="仅本次运行使用"></label>
            <button id="applyProxy" type="submit" class="outline-button">应用代理配置</button>
            <p id="proxyStatus" class="setting-hint" role="status">面板版不支持应用内代理：iframe 请求沿用宿主浏览器的网络设置。</p>
            <p class="setting-hint">面板版不会修改系统或浏览器代理；示例与预览请求沿用宿主网络设置。</p>
          </form>
        </details>
      </section>

      <section class="settings-section display-section" aria-labelledby="displayTitle">
        <h2 id="displayTitle" class="section-label">显示与尺寸</h2>
        <label class="field-label" for="zoomSelect">显示比例</label>
        <select id="zoomSelect"><option value="fit">适应窗口</option><option value="0.5">50%</option><option value="0.75">75%</option><option value="1" selected>100% · 真机大小</option><option value="1.25">125%</option><option value="1.5">150%</option></select>
        <div class="scale-readout"><strong id="scaleLabel">100% · 真机大小</strong><span id="physicalSize">机身 71.5 × 149.6 mm</span></div>
        <p id="calibrationStatus" class="setting-hint"></p>
        <details id="calibrationDetails" class="fold calibration-details">
          <summary><span class="summary-title">校准实际尺寸</span></summary>
          <p class="setting-hint">用尺子量出下方线段从左到右的长度，再填入测量值。</p>
          <div class="ruler-wrap"><div id="calibrationRuler" class="calibration-ruler" aria-label="待测量的校准线段"></div></div>
          <form id="calibrationForm">
            <label class="field-label" for="measuredLength">测得长度（毫米）</label>
            <div class="calibration-input"><input id="measuredLength" type="number" min="5" max="300" step="0.1" placeholder="例如 42.3" required><button class="load-button" type="submit">应用</button></div>
          </form>
          <button id="clearCalibration" class="text-button small">恢复系统估计</button>
          <p class="setting-hint">换显示器或修改浏览器缩放后，请检查尺寸。校准仅保存在本机。</p>
        </details>
      </section>

      <section class="settings-section device-section" aria-labelledby="deviceTitle">
        <h2 id="deviceTitle" class="section-label">模拟设备</h2>
        <div class="device-card">
          <div class="mini-phone"><span></span></div>
          <div class="device-info"><strong>iPhone 17</strong><small>6.3 英寸 · 标准版</small></div>
          <svg class="device-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
        </div>
        <button id="rotateButton" class="outline-button"><svg viewBox="0 0 24 24"><rect x="7" y="5" width="10" height="16" rx="2" transform="rotate(-35 12 13)"/><path d="M15 2a9 9 0 0 1 7 8m-4-3 4 3 1-5"/></svg><span>切换为横屏</span></button>
        <p id="viewportLabel" class="device-content">402 × 778 内容区</p>
        <details class="fold spec-details">
          <summary><span class="summary-title">屏幕规格</span></summary>
          <div class="spec-line"><span>逻辑屏幕</span><strong id="screenSpec">402 × 874</strong></div>
          <div class="spec-line"><span>物理分辨率</span><span>1206 × 2622</span></div>
          <div class="spec-line"><span>屏幕密度</span><span>460 PPI · @3x</span></div>
        </details>
      </section>

      <details class="settings-section appearance-section">
        <summary class="section-label">系统外观</summary>
        <label class="setting-row" for="statusToggle"><span>iOS 状态栏<small>时间、信号和电池</small></span><input id="statusToggle" type="checkbox" role="switch" checked><span class="switch" aria-hidden="true"></span></label>
        <label class="setting-row" for="homeToggle"><span>底部手势条</span><input id="homeToggle" type="checkbox" role="switch" checked><span class="switch" aria-hidden="true"></span></label>
        <div class="field-label">状态栏文字</div>
        <div class="segments" id="themeOptions" aria-label="状态栏文字颜色"><button data-theme="dark" aria-pressed="true">深色</button><button data-theme="light" aria-pressed="false">浅色</button></div>
        <div class="inline-controls"><label for="barColor">状态栏背景</label><div class="color-control"><select id="barColor" aria-label="状态栏背景"><option value="#ffffff">白色</option><option value="#ededed">浅灰</option><option value="#111111">黑色</option></select><span id="colorValue">#FFFFFF</span></div></div>
        <label class="inline-controls" for="batteryLevel"><span>电池电量</span><span class="inline-value"><output id="batteryOutput">100</output>%</span></label>
        <input class="range-input" id="batteryLevel" type="range" min="0" max="100" value="100" aria-label="电池电量">
      </details>

      <section class="settings-section layout-settings" aria-labelledby="layoutTitle">
        <h2 id="layoutTitle" class="section-label">页面布局</h2>
        <label class="field-label" for="layoutMode">页面显示方式</label>
        <select id="layoutMode"><option value="inset">预留状态栏与底部空间</option><option value="overlay">全屏页面 · 系统栏覆盖</option></select>
        <label class="setting-row" for="guideToggle"><span>安全区参考线</span><input id="guideToggle" type="checkbox" role="switch"><span class="switch" aria-hidden="true"></span></label>
        <p class="setting-hint" id="layoutHint">系统栏独立显示，页面内容不会被遮挡。</p>
      </section>

      <div class="sidebar-help"><button id="helpButton" class="text-button"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/></svg>使用说明</button><button id="troubleshootButton" class="text-button">页面无法打开？</button></div>
      <button id="devToolsButton" class="outline-button" hidden>打开开发者工具</button>
      <p id="engineInfo" class="setting-hint" hidden></p>
      <div class="sidebar-bottom"><span class="saved-dot"></span>外观自动保存<button id="resetButton" title="恢复默认外观，保留显示器校准">重置外观</button></div>
      <p class="sidebar-note">外观与布局预览 · 非 iOS 模拟器</p>
    </aside>

    <main class="main-panel" aria-label="手机预览">
      <div class="canvas" id="canvas">
        <div id="deviceSlot" class="device-slot"><div id="phone" class="phone">
          <span class="side-key key-action"></span><span class="side-key key-volume-up"></span><span class="side-key key-volume-down"></span><span class="side-key key-power"></span>
          <div id="screen" class="screen">
            <iframe id="previewFrame" title="H5 页面预览" src="about:blank" allow="clipboard-read; clipboard-write; fullscreen; autoplay" allowfullscreen></iframe>
            <div id="statusBar" class="status-bar"><span class="status-time">9:41</span><div class="status-right"><svg class="signal" viewBox="0 0 20 14" aria-label="信号满格"><rect x="0" y="8" width="3" height="6" rx="1"/><rect x="5" y="5.5" width="3" height="8.5" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" width="3" height="14" rx="1"/></svg><svg class="wifi" viewBox="0 0 20 15" aria-label="Wi-Fi"><path d="M1 5a14 14 0 0 1 18 0M4 8.5a9 9 0 0 1 12 0M7.2 12a4 4 0 0 1 5.6 0" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="10" cy="14" r="1.1"/></svg><span class="battery"><span id="batteryFill" class="battery-fill"></span><span id="batteryText">100</span></span></div></div>
            <div id="island" class="dynamic-island"><span></span></div>
            <div id="homeArea" class="home-area"><span></span></div>
            <div id="guides" class="safe-guides" hidden><div class="guide-top"><span>顶部参考区</span></div><div class="guide-bottom"><span>底部参考区</span></div></div>
          </div>
        </div></div>
      </div>
    </main>
  </div>

  <div id="helpBackdrop" class="help-backdrop" hidden></div>
  <dialog id="helpDialog"><div class="dialog-heading"><div><span class="eyebrow">使用指南</span><h2>让每个 H5，都有一部手机。</h2></div><button id="closeHelpButton" class="icon-button" aria-label="关闭说明"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div><div class="help-content"><div class="help-step"><b>01</b><div><h3>启动你的 H5，再输入地址</h3><p>直接输入 <code>5173</code>、<code>localhost:3000/path</code> 或完整的 HTTP / HTTPS 地址。本工具不会替你启动 H5 项目。端口指向当前这台电脑。</p></div></div><div class="help-step"><b>02</b><div><h3>按实际逻辑尺寸检查布局</h3><p>竖屏为 402 × 874。默认预留顶部 62px、底部 34px，内容区为 402 × 778；横屏预留左右各 62px、底部 21px。这些系统栏和安全区是可视化参考值。</p></div></div><div class="help-step"><b>03</b><div><h3>检查遮挡，或专注页面</h3><p>「全屏页面」会让 H5 铺满屏幕，再覆盖状态栏与手势条。参考线只作提示，不会修改 H5 的 CSS，也不会把模拟值注入 <code>env(safe-area-inset-*)</code>。</p></div></div><div class="help-note"><h3>如果页面空白</h3><p>先点击「在新窗口打开」按钮，确认 H5 服务正在运行。目标页面的 <code>X-Frame-Options</code> 或 CSP <code>frame-ancestors</code> 可能禁止嵌入，需要在你自己的开发服务里允许此预览地址。HTTPS 页面也可能拦截 HTTP 嵌入。</p><p>嵌入页加载事件不代表页面一定成功显示。本工具不绕过网站限制；请只在自己的开发项目中调整设置。</p></div><div class="help-note"><h3>需要登录的页面</h3><p>预览使用 DSH 应用自己的浏览器会话：在预览里登录一次会保留，重启 DSH 后一般仍在。若页面禁止被嵌入（X-Frame-Options / CSP frame-ancestors）或登录需要弹窗，登录无法在预览内完成——可点地址栏旁的「在系统浏览器打开」使用系统浏览器的登录态，或用手机扫码。</p></div><p class="help-footnote">画布沿用桌面浏览器的渲染引擎、User-Agent、设备像素比和输入方式。@3x 是规格说明；缩放不改变 iframe 的 CSS 尺寸。涉及 Safari、键盘、触摸、相机和真实安全区时，请在 iPhone 上验证。<a href="https://www.apple.com/iphone-17/specs/" target="_blank" rel="noopener noreferrer">查看 Apple 屏幕规格 ↗</a></p></div></dialog>
  <div id="toast" class="toast" role="status" hidden></div>`;


    /* ---- 内置二维码编码器（vendor/qrcode · node-qrcode 1.5.4 · MIT；来源见 vendor/qrcode/PROVENANCE.md） ---- */
    const QR_MODULE_FACTORIES = {
      "node_modules/dijkstrajs/dijkstra": function (module, exports, require) {
        'use strict';

        /******************************************************************************
         * Created 2008-08-19.
         *
         * Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
         *
         * Copyright (C) 2008
         *   Wyatt Baldwin <self@wyattbaldwin.com>
         *   All rights reserved
         *
         * Licensed under the MIT license.
         *
         *   http://www.opensource.org/licenses/mit-license.php
         *
         * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
         * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
         * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
         * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
         * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
         * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
         * THE SOFTWARE.
         *****************************************************************************/
        var dijkstra = {
          single_source_shortest_paths: function(graph, s, d) {
            // Predecessor map for each node that has been encountered.
            // node ID => predecessor node ID
            var predecessors = {};

            // Costs of shortest paths from s to all nodes encountered.
            // node ID => cost
            var costs = {};
            costs[s] = 0;

            // Costs of shortest paths from s to all nodes encountered; differs from
            // `costs` in that it provides easy access to the node that currently has
            // the known shortest path from s.
            // XXX: Do we actually need both `costs` and `open`?
            var open = dijkstra.PriorityQueue.make();
            open.push(s, 0);

            var closest,
                u, v,
                cost_of_s_to_u,
                adjacent_nodes,
                cost_of_e,
                cost_of_s_to_u_plus_cost_of_e,
                cost_of_s_to_v,
                first_visit;
            while (!open.empty()) {
              // In the nodes remaining in graph that have a known cost from s,
              // find the node, u, that currently has the shortest path from s.
              closest = open.pop();
              u = closest.value;
              cost_of_s_to_u = closest.cost;

              // Get nodes adjacent to u...
              adjacent_nodes = graph[u] || {};

              // ...and explore the edges that connect u to those nodes, updating
              // the cost of the shortest paths to any or all of those nodes as
              // necessary. v is the node across the current edge from u.
              for (v in adjacent_nodes) {
                if (adjacent_nodes.hasOwnProperty(v)) {
                  // Get the cost of the edge running from u to v.
                  cost_of_e = adjacent_nodes[v];

                  // Cost of s to u plus the cost of u to v across e--this is *a*
                  // cost from s to v that may or may not be less than the current
                  // known cost to v.
                  cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

                  // If we haven't visited v yet OR if the current known cost from s to
                  // v is greater than the new cost we just found (cost of s to u plus
                  // cost of u to v across e), update v's cost in the cost list and
                  // update v's predecessor in the predecessor list (it's now u).
                  cost_of_s_to_v = costs[v];
                  first_visit = (typeof costs[v] === 'undefined');
                  if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                    costs[v] = cost_of_s_to_u_plus_cost_of_e;
                    open.push(v, cost_of_s_to_u_plus_cost_of_e);
                    predecessors[v] = u;
                  }
                }
              }
            }

            if (typeof d !== 'undefined' && typeof costs[d] === 'undefined') {
              var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
              throw new Error(msg);
            }

            return predecessors;
          },

          extract_shortest_path_from_predecessor_list: function(predecessors, d) {
            var nodes = [];
            var u = d;
            var predecessor;
            while (u) {
              nodes.push(u);
              predecessor = predecessors[u];
              u = predecessors[u];
            }
            nodes.reverse();
            return nodes;
          },

          find_path: function(graph, s, d) {
            var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
            return dijkstra.extract_shortest_path_from_predecessor_list(
              predecessors, d);
          },

          /**
           * A very naive priority queue implementation.
           */
          PriorityQueue: {
            make: function (opts) {
              var T = dijkstra.PriorityQueue,
                  t = {},
                  key;
              opts = opts || {};
              for (key in T) {
                if (T.hasOwnProperty(key)) {
                  t[key] = T[key];
                }
              }
              t.queue = [];
              t.sorter = opts.sorter || T.default_sorter;
              return t;
            },

            default_sorter: function (a, b) {
              return a.cost - b.cost;
            },

            /**
             * Add a new item to the queue and ensure the highest priority element
             * is at the front of the queue.
             */
            push: function (value, cost) {
              var item = {value: value, cost: cost};
              this.queue.push(item);
              this.queue.sort(this.sorter);
            },

            /**
             * Return the highest priority element in the queue.
             */
            pop: function () {
              return this.queue.shift();
            },

            empty: function () {
              return this.queue.length === 0;
            }
          }
        };


        // node.js module exports
        if (typeof module !== 'undefined') {
          module.exports = dijkstra;
        }
      },
      "lib/core/alignment-pattern": function (module, exports, require) {
        /**
         * Alignment pattern are fixed reference pattern in defined positions
         * in a matrix symbology, which enables the decode software to re-synchronise
         * the coordinate mapping of the image modules in the event of moderate amounts
         * of distortion of the image.
         *
         * Alignment patterns are present only in QR Code symbols of version 2 or larger
         * and their number depends on the symbol version.
         */

        const getSymbolSize = require('./utils').getSymbolSize

        /**
         * Calculate the row/column coordinates of the center module of each alignment pattern
         * for the specified QR Code version.
         *
         * The alignment patterns are positioned symmetrically on either side of the diagonal
         * running from the top left corner of the symbol to the bottom right corner.
         *
         * Since positions are simmetrical only half of the coordinates are returned.
         * Each item of the array will represent in turn the x and y coordinate.
         * @see {@link getPositions}
         *
         * @param  {Number} version QR Code version
         * @return {Array}          Array of coordinate
         */
        exports.getRowColCoords = function getRowColCoords (version) {
          if (version === 1) return []

          const posCount = Math.floor(version / 7) + 2
          const size = getSymbolSize(version)
          const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2
          const positions = [size - 7] // Last coord is always (size - 7)

          for (let i = 1; i < posCount - 1; i++) {
            positions[i] = positions[i - 1] - intervals
          }

          positions.push(6) // First coord is always 6

          return positions.reverse()
        }

        /**
         * Returns an array containing the positions of each alignment pattern.
         * Each array's element represent the center point of the pattern as (x, y) coordinates
         *
         * Coordinates are calculated expanding the row/column coordinates returned by {@link getRowColCoords}
         * and filtering out the items that overlaps with finder pattern
         *
         * @example
         * For a Version 7 symbol {@link getRowColCoords} returns values 6, 22 and 38.
         * The alignment patterns, therefore, are to be centered on (row, column)
         * positions (6,22), (22,6), (22,22), (22,38), (38,22), (38,38).
         * Note that the coordinates (6,6), (6,38), (38,6) are occupied by finder patterns
         * and are not therefore used for alignment patterns.
         *
         * let pos = getPositions(7)
         * // [[6,22], [22,6], [22,22], [22,38], [38,22], [38,38]]
         *
         * @param  {Number} version QR Code version
         * @return {Array}          Array of coordinates
         */
        exports.getPositions = function getPositions (version) {
          const coords = []
          const pos = exports.getRowColCoords(version)
          const posLength = pos.length

          for (let i = 0; i < posLength; i++) {
            for (let j = 0; j < posLength; j++) {
              // Skip if position is occupied by finder patterns
              if ((i === 0 && j === 0) || // top-left
                  (i === 0 && j === posLength - 1) || // bottom-left
                  (i === posLength - 1 && j === 0)) { // top-right
                continue
              }

              coords.push([pos[i], pos[j]])
            }
          }

          return coords
        }
      },
      "lib/core/alphanumeric-data": function (module, exports, require) {
        const Mode = require('./mode')

        /**
         * Array of characters available in alphanumeric mode
         *
         * As per QR Code specification, to each character
         * is assigned a value from 0 to 44 which in this case coincides
         * with the array index
         *
         * @type {Array}
         */
        const ALPHA_NUM_CHARS = [
          '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
          'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
          'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
          ' ', '$', '%', '*', '+', '-', '.', '/', ':'
        ]

        function AlphanumericData (data) {
          this.mode = Mode.ALPHANUMERIC
          this.data = data
        }

        AlphanumericData.getBitsLength = function getBitsLength (length) {
          return 11 * Math.floor(length / 2) + 6 * (length % 2)
        }

        AlphanumericData.prototype.getLength = function getLength () {
          return this.data.length
        }

        AlphanumericData.prototype.getBitsLength = function getBitsLength () {
          return AlphanumericData.getBitsLength(this.data.length)
        }

        AlphanumericData.prototype.write = function write (bitBuffer) {
          let i

          // Input data characters are divided into groups of two characters
          // and encoded as 11-bit binary codes.
          for (i = 0; i + 2 <= this.data.length; i += 2) {
            // The character value of the first character is multiplied by 45
            let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45

            // The character value of the second digit is added to the product
            value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1])

            // The sum is then stored as 11-bit binary number
            bitBuffer.put(value, 11)
          }

          // If the number of input data characters is not a multiple of two,
          // the character value of the final character is encoded as a 6-bit binary number.
          if (this.data.length % 2) {
            bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6)
          }
        }

        module.exports = AlphanumericData
      },
      "lib/core/bit-buffer": function (module, exports, require) {
        function BitBuffer () {
          this.buffer = []
          this.length = 0
        }

        BitBuffer.prototype = {

          get: function (index) {
            const bufIndex = Math.floor(index / 8)
            return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1
          },

          put: function (num, length) {
            for (let i = 0; i < length; i++) {
              this.putBit(((num >>> (length - i - 1)) & 1) === 1)
            }
          },

          getLengthInBits: function () {
            return this.length
          },

          putBit: function (bit) {
            const bufIndex = Math.floor(this.length / 8)
            if (this.buffer.length <= bufIndex) {
              this.buffer.push(0)
            }

            if (bit) {
              this.buffer[bufIndex] |= (0x80 >>> (this.length % 8))
            }

            this.length++
          }
        }

        module.exports = BitBuffer
      },
      "lib/core/bit-matrix": function (module, exports, require) {
        /**
         * Helper class to handle QR Code symbol modules
         *
         * @param {Number} size Symbol size
         */
        function BitMatrix (size) {
          if (!size || size < 1) {
            throw new Error('BitMatrix size must be defined and greater than 0')
          }

          this.size = size
          this.data = new Uint8Array(size * size)
          this.reservedBit = new Uint8Array(size * size)
        }

        /**
         * Set bit value at specified location
         * If reserved flag is set, this bit will be ignored during masking process
         *
         * @param {Number}  row
         * @param {Number}  col
         * @param {Boolean} value
         * @param {Boolean} reserved
         */
        BitMatrix.prototype.set = function (row, col, value, reserved) {
          const index = row * this.size + col
          this.data[index] = value
          if (reserved) this.reservedBit[index] = true
        }

        /**
         * Returns bit value at specified location
         *
         * @param  {Number}  row
         * @param  {Number}  col
         * @return {Boolean}
         */
        BitMatrix.prototype.get = function (row, col) {
          return this.data[row * this.size + col]
        }

        /**
         * Applies xor operator at specified location
         * (used during masking process)
         *
         * @param {Number}  row
         * @param {Number}  col
         * @param {Boolean} value
         */
        BitMatrix.prototype.xor = function (row, col, value) {
          this.data[row * this.size + col] ^= value
        }

        /**
         * Check if bit at specified location is reserved
         *
         * @param {Number}   row
         * @param {Number}   col
         * @return {Boolean}
         */
        BitMatrix.prototype.isReserved = function (row, col) {
          return this.reservedBit[row * this.size + col]
        }

        module.exports = BitMatrix
      },
      "lib/core/byte-data": function (module, exports, require) {
        const Mode = require('./mode')

        function ByteData (data) {
          this.mode = Mode.BYTE
          if (typeof (data) === 'string') {
            this.data = new TextEncoder().encode(data)
          } else {
            this.data = new Uint8Array(data)
          }
        }

        ByteData.getBitsLength = function getBitsLength (length) {
          return length * 8
        }

        ByteData.prototype.getLength = function getLength () {
          return this.data.length
        }

        ByteData.prototype.getBitsLength = function getBitsLength () {
          return ByteData.getBitsLength(this.data.length)
        }

        ByteData.prototype.write = function (bitBuffer) {
          for (let i = 0, l = this.data.length; i < l; i++) {
            bitBuffer.put(this.data[i], 8)
          }
        }

        module.exports = ByteData
      },
      "lib/core/error-correction-code": function (module, exports, require) {
        const ECLevel = require('./error-correction-level')
        
        const EC_BLOCKS_TABLE = [
        // L  M  Q  H
          1, 1, 1, 1,
          1, 1, 1, 1,
          1, 1, 2, 2,
          1, 2, 2, 4,
          1, 2, 4, 4,
          2, 4, 4, 4,
          2, 4, 6, 5,
          2, 4, 6, 6,
          2, 5, 8, 8,
          4, 5, 8, 8,
          4, 5, 8, 11,
          4, 8, 10, 11,
          4, 9, 12, 16,
          4, 9, 16, 16,
          6, 10, 12, 18,
          6, 10, 17, 16,
          6, 11, 16, 19,
          6, 13, 18, 21,
          7, 14, 21, 25,
          8, 16, 20, 25,
          8, 17, 23, 25,
          9, 17, 23, 34,
          9, 18, 25, 30,
          10, 20, 27, 32,
          12, 21, 29, 35,
          12, 23, 34, 37,
          12, 25, 34, 40,
          13, 26, 35, 42,
          14, 28, 38, 45,
          15, 29, 40, 48,
          16, 31, 43, 51,
          17, 33, 45, 54,
          18, 35, 48, 57,
          19, 37, 51, 60,
          19, 38, 53, 63,
          20, 40, 56, 66,
          21, 43, 59, 70,
          22, 45, 62, 74,
          24, 47, 65, 77,
          25, 49, 68, 81
        ]
        
        const EC_CODEWORDS_TABLE = [
        // L  M  Q  H
          7, 10, 13, 17,
          10, 16, 22, 28,
          15, 26, 36, 44,
          20, 36, 52, 64,
          26, 48, 72, 88,
          36, 64, 96, 112,
          40, 72, 108, 130,
          48, 88, 132, 156,
          60, 110, 160, 192,
          72, 130, 192, 224,
          80, 150, 224, 264,
          96, 176, 260, 308,
          104, 198, 288, 352,
          120, 216, 320, 384,
          132, 240, 360, 432,
          144, 280, 408, 480,
          168, 308, 448, 532,
          180, 338, 504, 588,
          196, 364, 546, 650,
          224, 416, 600, 700,
          224, 442, 644, 750,
          252, 476, 690, 816,
          270, 504, 750, 900,
          300, 560, 810, 960,
          312, 588, 870, 1050,
          336, 644, 952, 1110,
          360, 700, 1020, 1200,
          390, 728, 1050, 1260,
          420, 784, 1140, 1350,
          450, 812, 1200, 1440,
          480, 868, 1290, 1530,
          510, 924, 1350, 1620,
          540, 980, 1440, 1710,
          570, 1036, 1530, 1800,
          570, 1064, 1590, 1890,
          600, 1120, 1680, 1980,
          630, 1204, 1770, 2100,
          660, 1260, 1860, 2220,
          720, 1316, 1950, 2310,
          750, 1372, 2040, 2430
        ]
        
        /**
         * Returns the number of error correction block that the QR Code should contain
         * for the specified version and error correction level.
         *
         * @param  {Number} version              QR Code version
         * @param  {Number} errorCorrectionLevel Error correction level
         * @return {Number}                      Number of error correction blocks
         */
        exports.getBlocksCount = function getBlocksCount (version, errorCorrectionLevel) {
          switch (errorCorrectionLevel) {
            case ECLevel.L:
              return EC_BLOCKS_TABLE[(version - 1) * 4 + 0]
            case ECLevel.M:
              return EC_BLOCKS_TABLE[(version - 1) * 4 + 1]
            case ECLevel.Q:
              return EC_BLOCKS_TABLE[(version - 1) * 4 + 2]
            case ECLevel.H:
              return EC_BLOCKS_TABLE[(version - 1) * 4 + 3]
            default:
              return undefined
          }
        }
        
        /**
         * Returns the number of error correction codewords to use for the specified
         * version and error correction level.
         *
         * @param  {Number} version              QR Code version
         * @param  {Number} errorCorrectionLevel Error correction level
         * @return {Number}                      Number of error correction codewords
         */
        exports.getTotalCodewordsCount = function getTotalCodewordsCount (version, errorCorrectionLevel) {
          switch (errorCorrectionLevel) {
            case ECLevel.L:
              return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0]
            case ECLevel.M:
              return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1]
            case ECLevel.Q:
              return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2]
            case ECLevel.H:
              return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3]
            default:
              return undefined
          }
        }
      },
      "lib/core/error-correction-level": function (module, exports, require) {
        exports.L = { bit: 1 }
        exports.M = { bit: 0 }
        exports.Q = { bit: 3 }
        exports.H = { bit: 2 }

        function fromString (string) {
          if (typeof string !== 'string') {
            throw new Error('Param is not a string')
          }

          const lcStr = string.toLowerCase()

          switch (lcStr) {
            case 'l':
            case 'low':
              return exports.L

            case 'm':
            case 'medium':
              return exports.M

            case 'q':
            case 'quartile':
              return exports.Q

            case 'h':
            case 'high':
              return exports.H

            default:
              throw new Error('Unknown EC Level: ' + string)
          }
        }

        exports.isValid = function isValid (level) {
          return level && typeof level.bit !== 'undefined' &&
            level.bit >= 0 && level.bit < 4
        }

        exports.from = function from (value, defaultValue) {
          if (exports.isValid(value)) {
            return value
          }

          try {
            return fromString(value)
          } catch (e) {
            return defaultValue
          }
        }
      },
      "lib/core/finder-pattern": function (module, exports, require) {
        const getSymbolSize = require('./utils').getSymbolSize
        const FINDER_PATTERN_SIZE = 7

        /**
         * Returns an array containing the positions of each finder pattern.
         * Each array's element represent the top-left point of the pattern as (x, y) coordinates
         *
         * @param  {Number} version QR Code version
         * @return {Array}          Array of coordinates
         */
        exports.getPositions = function getPositions (version) {
          const size = getSymbolSize(version)

          return [
            // top-left
            [0, 0],
            // top-right
            [size - FINDER_PATTERN_SIZE, 0],
            // bottom-left
            [0, size - FINDER_PATTERN_SIZE]
          ]
        }
      },
      "lib/core/format-info": function (module, exports, require) {
        const Utils = require('./utils')

        const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0)
        const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1)
        const G15_BCH = Utils.getBCHDigit(G15)

        /**
         * Returns format information with relative error correction bits
         *
         * The format information is a 15-bit sequence containing 5 data bits,
         * with 10 error correction bits calculated using the (15, 5) BCH code.
         *
         * @param  {Number} errorCorrectionLevel Error correction level
         * @param  {Number} mask                 Mask pattern
         * @return {Number}                      Encoded format information bits
         */
        exports.getEncodedBits = function getEncodedBits (errorCorrectionLevel, mask) {
          const data = ((errorCorrectionLevel.bit << 3) | mask)
          let d = data << 10

          while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
            d ^= (G15 << (Utils.getBCHDigit(d) - G15_BCH))
          }

          // xor final data with mask pattern in order to ensure that
          // no combination of Error Correction Level and data mask pattern
          // will result in an all-zero data string
          return ((data << 10) | d) ^ G15_MASK
        }
      },
      "lib/core/galois-field": function (module, exports, require) {
        const EXP_TABLE = new Uint8Array(512)
        const LOG_TABLE = new Uint8Array(256)
        /**
         * Precompute the log and anti-log tables for faster computation later
         *
         * For each possible value in the galois field 2^8, we will pre-compute
         * the logarithm and anti-logarithm (exponential) of this value
         *
         * ref {@link https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders#Introduction_to_mathematical_fields}
         */
        ;(function initTables () {
          let x = 1
          for (let i = 0; i < 255; i++) {
            EXP_TABLE[i] = x
            LOG_TABLE[x] = i

            x <<= 1 // multiply by 2

            // The QR code specification says to use byte-wise modulo 100011101 arithmetic.
            // This means that when a number is 256 or larger, it should be XORed with 0x11D.
            if (x & 0x100) { // similar to x >= 256, but a lot faster (because 0x100 == 256)
              x ^= 0x11D
            }
          }

          // Optimization: double the size of the anti-log table so that we don't need to mod 255 to
          // stay inside the bounds (because we will mainly use this table for the multiplication of
          // two GF numbers, no more).
          // @see {@link mul}
          for (let i = 255; i < 512; i++) {
            EXP_TABLE[i] = EXP_TABLE[i - 255]
          }
        }())

        /**
         * Returns log value of n inside Galois Field
         *
         * @param  {Number} n
         * @return {Number}
         */
        exports.log = function log (n) {
          if (n < 1) throw new Error('log(' + n + ')')
          return LOG_TABLE[n]
        }

        /**
         * Returns anti-log value of n inside Galois Field
         *
         * @param  {Number} n
         * @return {Number}
         */
        exports.exp = function exp (n) {
          return EXP_TABLE[n]
        }

        /**
         * Multiplies two number inside Galois Field
         *
         * @param  {Number} x
         * @param  {Number} y
         * @return {Number}
         */
        exports.mul = function mul (x, y) {
          if (x === 0 || y === 0) return 0

          // should be EXP_TABLE[(LOG_TABLE[x] + LOG_TABLE[y]) % 255] if EXP_TABLE wasn't oversized
          // @see {@link initTables}
          return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]]
        }
      },
      "lib/core/kanji-data": function (module, exports, require) {
        const Mode = require('./mode')
        const Utils = require('./utils')

        function KanjiData (data) {
          this.mode = Mode.KANJI
          this.data = data
        }

        KanjiData.getBitsLength = function getBitsLength (length) {
          return length * 13
        }

        KanjiData.prototype.getLength = function getLength () {
          return this.data.length
        }

        KanjiData.prototype.getBitsLength = function getBitsLength () {
          return KanjiData.getBitsLength(this.data.length)
        }

        KanjiData.prototype.write = function (bitBuffer) {
          let i

          // In the Shift JIS system, Kanji characters are represented by a two byte combination.
          // These byte values are shifted from the JIS X 0208 values.
          // JIS X 0208 gives details of the shift coded representation.
          for (i = 0; i < this.data.length; i++) {
            let value = Utils.toSJIS(this.data[i])

            // For characters with Shift JIS values from 0x8140 to 0x9FFC:
            if (value >= 0x8140 && value <= 0x9FFC) {
              // Subtract 0x8140 from Shift JIS value
              value -= 0x8140

            // For characters with Shift JIS values from 0xE040 to 0xEBBF
            } else if (value >= 0xE040 && value <= 0xEBBF) {
              // Subtract 0xC140 from Shift JIS value
              value -= 0xC140
            } else {
              throw new Error(
                'Invalid SJIS character: ' + this.data[i] + '\n' +
                'Make sure your charset is UTF-8')
            }

            // Multiply most significant byte of result by 0xC0
            // and add least significant byte to product
            value = (((value >>> 8) & 0xff) * 0xC0) + (value & 0xff)

            // Convert result to a 13-bit binary string
            bitBuffer.put(value, 13)
          }
        }

        module.exports = KanjiData
      },
      "lib/core/mask-pattern": function (module, exports, require) {
        /**
         * Data mask pattern reference
         * @type {Object}
         */
        exports.Patterns = {
          PATTERN000: 0,
          PATTERN001: 1,
          PATTERN010: 2,
          PATTERN011: 3,
          PATTERN100: 4,
          PATTERN101: 5,
          PATTERN110: 6,
          PATTERN111: 7
        }

        /**
         * Weighted penalty scores for the undesirable features
         * @type {Object}
         */
        const PenaltyScores = {
          N1: 3,
          N2: 3,
          N3: 40,
          N4: 10
        }

        /**
         * Check if mask pattern value is valid
         *
         * @param  {Number}  mask    Mask pattern
         * @return {Boolean}         true if valid, false otherwise
         */
        exports.isValid = function isValid (mask) {
          return mask != null && mask !== '' && !isNaN(mask) && mask >= 0 && mask <= 7
        }

        /**
         * Returns mask pattern from a value.
         * If value is not valid, returns undefined
         *
         * @param  {Number|String} value        Mask pattern value
         * @return {Number}                     Valid mask pattern or undefined
         */
        exports.from = function from (value) {
          return exports.isValid(value) ? parseInt(value, 10) : undefined
        }

        /**
        * Find adjacent modules in row/column with the same color
        * and assign a penalty value.
        *
        * Points: N1 + i
        * i is the amount by which the number of adjacent modules of the same color exceeds 5
        */
        exports.getPenaltyN1 = function getPenaltyN1 (data) {
          const size = data.size
          let points = 0
          let sameCountCol = 0
          let sameCountRow = 0
          let lastCol = null
          let lastRow = null

          for (let row = 0; row < size; row++) {
            sameCountCol = sameCountRow = 0
            lastCol = lastRow = null

            for (let col = 0; col < size; col++) {
              let module = data.get(row, col)
              if (module === lastCol) {
                sameCountCol++
              } else {
                if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5)
                lastCol = module
                sameCountCol = 1
              }

              module = data.get(col, row)
              if (module === lastRow) {
                sameCountRow++
              } else {
                if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5)
                lastRow = module
                sameCountRow = 1
              }
            }

            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5)
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5)
          }

          return points
        }

        /**
         * Find 2x2 blocks with the same color and assign a penalty value
         *
         * Points: N2 * (m - 1) * (n - 1)
         */
        exports.getPenaltyN2 = function getPenaltyN2 (data) {
          const size = data.size
          let points = 0

          for (let row = 0; row < size - 1; row++) {
            for (let col = 0; col < size - 1; col++) {
              const last = data.get(row, col) +
                data.get(row, col + 1) +
                data.get(row + 1, col) +
                data.get(row + 1, col + 1)

              if (last === 4 || last === 0) points++
            }
          }

          return points * PenaltyScores.N2
        }

        /**
         * Find 1:1:3:1:1 ratio (dark:light:dark:light:dark) pattern in row/column,
         * preceded or followed by light area 4 modules wide
         *
         * Points: N3 * number of pattern found
         */
        exports.getPenaltyN3 = function getPenaltyN3 (data) {
          const size = data.size
          let points = 0
          let bitsCol = 0
          let bitsRow = 0

          for (let row = 0; row < size; row++) {
            bitsCol = bitsRow = 0
            for (let col = 0; col < size; col++) {
              bitsCol = ((bitsCol << 1) & 0x7FF) | data.get(row, col)
              if (col >= 10 && (bitsCol === 0x5D0 || bitsCol === 0x05D)) points++

              bitsRow = ((bitsRow << 1) & 0x7FF) | data.get(col, row)
              if (col >= 10 && (bitsRow === 0x5D0 || bitsRow === 0x05D)) points++
            }
          }

          return points * PenaltyScores.N3
        }

        /**
         * Calculate proportion of dark modules in entire symbol
         *
         * Points: N4 * k
         *
         * k is the rating of the deviation of the proportion of dark modules
         * in the symbol from 50% in steps of 5%
         */
        exports.getPenaltyN4 = function getPenaltyN4 (data) {
          let darkCount = 0
          const modulesCount = data.data.length

          for (let i = 0; i < modulesCount; i++) darkCount += data.data[i]

          const k = Math.abs(Math.ceil((darkCount * 100 / modulesCount) / 5) - 10)

          return k * PenaltyScores.N4
        }

        /**
         * Return mask value at given position
         *
         * @param  {Number} maskPattern Pattern reference value
         * @param  {Number} i           Row
         * @param  {Number} j           Column
         * @return {Boolean}            Mask value
         */
        function getMaskAt (maskPattern, i, j) {
          switch (maskPattern) {
            case exports.Patterns.PATTERN000: return (i + j) % 2 === 0
            case exports.Patterns.PATTERN001: return i % 2 === 0
            case exports.Patterns.PATTERN010: return j % 3 === 0
            case exports.Patterns.PATTERN011: return (i + j) % 3 === 0
            case exports.Patterns.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0
            case exports.Patterns.PATTERN101: return (i * j) % 2 + (i * j) % 3 === 0
            case exports.Patterns.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 === 0
            case exports.Patterns.PATTERN111: return ((i * j) % 3 + (i + j) % 2) % 2 === 0

            default: throw new Error('bad maskPattern:' + maskPattern)
          }
        }

        /**
         * Apply a mask pattern to a BitMatrix
         *
         * @param  {Number}    pattern Pattern reference number
         * @param  {BitMatrix} data    BitMatrix data
         */
        exports.applyMask = function applyMask (pattern, data) {
          const size = data.size

          for (let col = 0; col < size; col++) {
            for (let row = 0; row < size; row++) {
              if (data.isReserved(row, col)) continue
              data.xor(row, col, getMaskAt(pattern, row, col))
            }
          }
        }

        /**
         * Returns the best mask pattern for data
         *
         * @param  {BitMatrix} data
         * @return {Number} Mask pattern reference number
         */
        exports.getBestMask = function getBestMask (data, setupFormatFunc) {
          const numPatterns = Object.keys(exports.Patterns).length
          let bestPattern = 0
          let lowerPenalty = Infinity

          for (let p = 0; p < numPatterns; p++) {
            setupFormatFunc(p)
            exports.applyMask(p, data)

            // Calculate penalty
            const penalty =
              exports.getPenaltyN1(data) +
              exports.getPenaltyN2(data) +
              exports.getPenaltyN3(data) +
              exports.getPenaltyN4(data)

            // Undo previously applied mask
            exports.applyMask(p, data)

            if (penalty < lowerPenalty) {
              lowerPenalty = penalty
              bestPattern = p
            }
          }

          return bestPattern
        }
      },
      "lib/core/mode": function (module, exports, require) {
        const VersionCheck = require('./version-check')
        const Regex = require('./regex')

        /**
         * Numeric mode encodes data from the decimal digit set (0 - 9)
         * (byte values 30HEX to 39HEX).
         * Normally, 3 data characters are represented by 10 bits.
         *
         * @type {Object}
         */
        exports.NUMERIC = {
          id: 'Numeric',
          bit: 1 << 0,
          ccBits: [10, 12, 14]
        }

        /**
         * Alphanumeric mode encodes data from a set of 45 characters,
         * i.e. 10 numeric digits (0 - 9),
         *      26 alphabetic characters (A - Z),
         *   and 9 symbols (SP, $, %, *, +, -, ., /, :).
         * Normally, two input characters are represented by 11 bits.
         *
         * @type {Object}
         */
        exports.ALPHANUMERIC = {
          id: 'Alphanumeric',
          bit: 1 << 1,
          ccBits: [9, 11, 13]
        }

        /**
         * In byte mode, data is encoded at 8 bits per character.
         *
         * @type {Object}
         */
        exports.BYTE = {
          id: 'Byte',
          bit: 1 << 2,
          ccBits: [8, 16, 16]
        }

        /**
         * The Kanji mode efficiently encodes Kanji characters in accordance with
         * the Shift JIS system based on JIS X 0208.
         * The Shift JIS values are shifted from the JIS X 0208 values.
         * JIS X 0208 gives details of the shift coded representation.
         * Each two-byte character value is compacted to a 13-bit binary codeword.
         *
         * @type {Object}
         */
        exports.KANJI = {
          id: 'Kanji',
          bit: 1 << 3,
          ccBits: [8, 10, 12]
        }

        /**
         * Mixed mode will contain a sequences of data in a combination of any of
         * the modes described above
         *
         * @type {Object}
         */
        exports.MIXED = {
          bit: -1
        }

        /**
         * Returns the number of bits needed to store the data length
         * according to QR Code specifications.
         *
         * @param  {Mode}   mode    Data mode
         * @param  {Number} version QR Code version
         * @return {Number}         Number of bits
         */
        exports.getCharCountIndicator = function getCharCountIndicator (mode, version) {
          if (!mode.ccBits) throw new Error('Invalid mode: ' + mode)

          if (!VersionCheck.isValid(version)) {
            throw new Error('Invalid version: ' + version)
          }

          if (version >= 1 && version < 10) return mode.ccBits[0]
          else if (version < 27) return mode.ccBits[1]
          return mode.ccBits[2]
        }

        /**
         * Returns the most efficient mode to store the specified data
         *
         * @param  {String} dataStr Input data string
         * @return {Mode}           Best mode
         */
        exports.getBestModeForData = function getBestModeForData (dataStr) {
          if (Regex.testNumeric(dataStr)) return exports.NUMERIC
          else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC
          else if (Regex.testKanji(dataStr)) return exports.KANJI
          else return exports.BYTE
        }

        /**
         * Return mode name as string
         *
         * @param {Mode} mode Mode object
         * @returns {String}  Mode name
         */
        exports.toString = function toString (mode) {
          if (mode && mode.id) return mode.id
          throw new Error('Invalid mode')
        }

        /**
         * Check if input param is a valid mode object
         *
         * @param   {Mode}    mode Mode object
         * @returns {Boolean} True if valid mode, false otherwise
         */
        exports.isValid = function isValid (mode) {
          return mode && mode.bit && mode.ccBits
        }

        /**
         * Get mode object from its name
         *
         * @param   {String} string Mode name
         * @returns {Mode}          Mode object
         */
        function fromString (string) {
          if (typeof string !== 'string') {
            throw new Error('Param is not a string')
          }

          const lcStr = string.toLowerCase()

          switch (lcStr) {
            case 'numeric':
              return exports.NUMERIC
            case 'alphanumeric':
              return exports.ALPHANUMERIC
            case 'kanji':
              return exports.KANJI
            case 'byte':
              return exports.BYTE
            default:
              throw new Error('Unknown mode: ' + string)
          }
        }

        /**
         * Returns mode from a value.
         * If value is not a valid mode, returns defaultValue
         *
         * @param  {Mode|String} value        Encoding mode
         * @param  {Mode}        defaultValue Fallback value
         * @return {Mode}                     Encoding mode
         */
        exports.from = function from (value, defaultValue) {
          if (exports.isValid(value)) {
            return value
          }

          try {
            return fromString(value)
          } catch (e) {
            return defaultValue
          }
        }
      },
      "lib/core/numeric-data": function (module, exports, require) {
        const Mode = require('./mode')

        function NumericData (data) {
          this.mode = Mode.NUMERIC
          this.data = data.toString()
        }

        NumericData.getBitsLength = function getBitsLength (length) {
          return 10 * Math.floor(length / 3) + ((length % 3) ? ((length % 3) * 3 + 1) : 0)
        }

        NumericData.prototype.getLength = function getLength () {
          return this.data.length
        }

        NumericData.prototype.getBitsLength = function getBitsLength () {
          return NumericData.getBitsLength(this.data.length)
        }

        NumericData.prototype.write = function write (bitBuffer) {
          let i, group, value

          // The input data string is divided into groups of three digits,
          // and each group is converted to its 10-bit binary equivalent.
          for (i = 0; i + 3 <= this.data.length; i += 3) {
            group = this.data.substr(i, 3)
            value = parseInt(group, 10)

            bitBuffer.put(value, 10)
          }

          // If the number of input digits is not an exact multiple of three,
          // the final one or two digits are converted to 4 or 7 bits respectively.
          const remainingNum = this.data.length - i
          if (remainingNum > 0) {
            group = this.data.substr(i)
            value = parseInt(group, 10)

            bitBuffer.put(value, remainingNum * 3 + 1)
          }
        }

        module.exports = NumericData
      },
      "lib/core/polynomial": function (module, exports, require) {
        const GF = require('./galois-field')

        /**
         * Multiplies two polynomials inside Galois Field
         *
         * @param  {Uint8Array} p1 Polynomial
         * @param  {Uint8Array} p2 Polynomial
         * @return {Uint8Array}    Product of p1 and p2
         */
        exports.mul = function mul (p1, p2) {
          const coeff = new Uint8Array(p1.length + p2.length - 1)

          for (let i = 0; i < p1.length; i++) {
            for (let j = 0; j < p2.length; j++) {
              coeff[i + j] ^= GF.mul(p1[i], p2[j])
            }
          }

          return coeff
        }

        /**
         * Calculate the remainder of polynomials division
         *
         * @param  {Uint8Array} divident Polynomial
         * @param  {Uint8Array} divisor  Polynomial
         * @return {Uint8Array}          Remainder
         */
        exports.mod = function mod (divident, divisor) {
          let result = new Uint8Array(divident)

          while ((result.length - divisor.length) >= 0) {
            const coeff = result[0]

            for (let i = 0; i < divisor.length; i++) {
              result[i] ^= GF.mul(divisor[i], coeff)
            }

            // remove all zeros from buffer head
            let offset = 0
            while (offset < result.length && result[offset] === 0) offset++
            result = result.slice(offset)
          }

          return result
        }

        /**
         * Generate an irreducible generator polynomial of specified degree
         * (used by Reed-Solomon encoder)
         *
         * @param  {Number} degree Degree of the generator polynomial
         * @return {Uint8Array}    Buffer containing polynomial coefficients
         */
        exports.generateECPolynomial = function generateECPolynomial (degree) {
          let poly = new Uint8Array([1])
          for (let i = 0; i < degree; i++) {
            poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]))
          }

          return poly
        }
      },
      "lib/core/qrcode": function (module, exports, require) {
        const Utils = require('./utils')
        const ECLevel = require('./error-correction-level')
        const BitBuffer = require('./bit-buffer')
        const BitMatrix = require('./bit-matrix')
        const AlignmentPattern = require('./alignment-pattern')
        const FinderPattern = require('./finder-pattern')
        const MaskPattern = require('./mask-pattern')
        const ECCode = require('./error-correction-code')
        const ReedSolomonEncoder = require('./reed-solomon-encoder')
        const Version = require('./version')
        const FormatInfo = require('./format-info')
        const Mode = require('./mode')
        const Segments = require('./segments')

        /**
         * QRCode for JavaScript
         *
         * modified by Ryan Day for nodejs support
         * Copyright (c) 2011 Ryan Day
         *
         * Licensed under the MIT license:
         *   http://www.opensource.org/licenses/mit-license.php
         *
        //---------------------------------------------------------------------
        // QRCode for JavaScript
        //
        // Copyright (c) 2009 Kazuhiko Arase
        //
        // URL: http://www.d-project.com/
        //
        // Licensed under the MIT license:
        //   http://www.opensource.org/licenses/mit-license.php
        //
        // The word "QR Code" is registered trademark of
        // DENSO WAVE INCORPORATED
        //   http://www.denso-wave.com/qrcode/faqpatent-e.html
        //
        //---------------------------------------------------------------------
        */

        /**
         * Add finder patterns bits to matrix
         *
         * @param  {BitMatrix} matrix  Modules matrix
         * @param  {Number}    version QR Code version
         */
        function setupFinderPattern (matrix, version) {
          const size = matrix.size
          const pos = FinderPattern.getPositions(version)

          for (let i = 0; i < pos.length; i++) {
            const row = pos[i][0]
            const col = pos[i][1]

            for (let r = -1; r <= 7; r++) {
              if (row + r <= -1 || size <= row + r) continue

              for (let c = -1; c <= 7; c++) {
                if (col + c <= -1 || size <= col + c) continue

                if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                  (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                  (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                  matrix.set(row + r, col + c, true, true)
                } else {
                  matrix.set(row + r, col + c, false, true)
                }
              }
            }
          }
        }

        /**
         * Add timing pattern bits to matrix
         *
         * Note: this function must be called before {@link setupAlignmentPattern}
         *
         * @param  {BitMatrix} matrix Modules matrix
         */
        function setupTimingPattern (matrix) {
          const size = matrix.size

          for (let r = 8; r < size - 8; r++) {
            const value = r % 2 === 0
            matrix.set(r, 6, value, true)
            matrix.set(6, r, value, true)
          }
        }

        /**
         * Add alignment patterns bits to matrix
         *
         * Note: this function must be called after {@link setupTimingPattern}
         *
         * @param  {BitMatrix} matrix  Modules matrix
         * @param  {Number}    version QR Code version
         */
        function setupAlignmentPattern (matrix, version) {
          const pos = AlignmentPattern.getPositions(version)

          for (let i = 0; i < pos.length; i++) {
            const row = pos[i][0]
            const col = pos[i][1]

            for (let r = -2; r <= 2; r++) {
              for (let c = -2; c <= 2; c++) {
                if (r === -2 || r === 2 || c === -2 || c === 2 ||
                  (r === 0 && c === 0)) {
                  matrix.set(row + r, col + c, true, true)
                } else {
                  matrix.set(row + r, col + c, false, true)
                }
              }
            }
          }
        }

        /**
         * Add version info bits to matrix
         *
         * @param  {BitMatrix} matrix  Modules matrix
         * @param  {Number}    version QR Code version
         */
        function setupVersionInfo (matrix, version) {
          const size = matrix.size
          const bits = Version.getEncodedBits(version)
          let row, col, mod

          for (let i = 0; i < 18; i++) {
            row = Math.floor(i / 3)
            col = i % 3 + size - 8 - 3
            mod = ((bits >> i) & 1) === 1

            matrix.set(row, col, mod, true)
            matrix.set(col, row, mod, true)
          }
        }

        /**
         * Add format info bits to matrix
         *
         * @param  {BitMatrix} matrix               Modules matrix
         * @param  {ErrorCorrectionLevel}    errorCorrectionLevel Error correction level
         * @param  {Number}    maskPattern          Mask pattern reference value
         */
        function setupFormatInfo (matrix, errorCorrectionLevel, maskPattern) {
          const size = matrix.size
          const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern)
          let i, mod

          for (i = 0; i < 15; i++) {
            mod = ((bits >> i) & 1) === 1

            // vertical
            if (i < 6) {
              matrix.set(i, 8, mod, true)
            } else if (i < 8) {
              matrix.set(i + 1, 8, mod, true)
            } else {
              matrix.set(size - 15 + i, 8, mod, true)
            }

            // horizontal
            if (i < 8) {
              matrix.set(8, size - i - 1, mod, true)
            } else if (i < 9) {
              matrix.set(8, 15 - i - 1 + 1, mod, true)
            } else {
              matrix.set(8, 15 - i - 1, mod, true)
            }
          }

          // fixed module
          matrix.set(size - 8, 8, 1, true)
        }

        /**
         * Add encoded data bits to matrix
         *
         * @param  {BitMatrix}  matrix Modules matrix
         * @param  {Uint8Array} data   Data codewords
         */
        function setupData (matrix, data) {
          const size = matrix.size
          let inc = -1
          let row = size - 1
          let bitIndex = 7
          let byteIndex = 0

          for (let col = size - 1; col > 0; col -= 2) {
            if (col === 6) col--

            while (true) {
              for (let c = 0; c < 2; c++) {
                if (!matrix.isReserved(row, col - c)) {
                  let dark = false

                  if (byteIndex < data.length) {
                    dark = (((data[byteIndex] >>> bitIndex) & 1) === 1)
                  }

                  matrix.set(row, col - c, dark)
                  bitIndex--

                  if (bitIndex === -1) {
                    byteIndex++
                    bitIndex = 7
                  }
                }
              }

              row += inc

              if (row < 0 || size <= row) {
                row -= inc
                inc = -inc
                break
              }
            }
          }
        }

        /**
         * Create encoded codewords from data input
         *
         * @param  {Number}   version              QR Code version
         * @param  {ErrorCorrectionLevel}   errorCorrectionLevel Error correction level
         * @param  {ByteData} data                 Data input
         * @return {Uint8Array}                    Buffer containing encoded codewords
         */
        function createData (version, errorCorrectionLevel, segments) {
          // Prepare data buffer
          const buffer = new BitBuffer()

          segments.forEach(function (data) {
            // prefix data with mode indicator (4 bits)
            buffer.put(data.mode.bit, 4)

            // Prefix data with character count indicator.
            // The character count indicator is a string of bits that represents the
            // number of characters that are being encoded.
            // The character count indicator must be placed after the mode indicator
            // and must be a certain number of bits long, depending on the QR version
            // and data mode
            // @see {@link Mode.getCharCountIndicator}.
            buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version))

            // add binary data sequence to buffer
            data.write(buffer)
          })

          // Calculate required number of bits
          const totalCodewords = Utils.getSymbolTotalCodewords(version)
          const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)
          const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8

          // Add a terminator.
          // If the bit string is shorter than the total number of required bits,
          // a terminator of up to four 0s must be added to the right side of the string.
          // If the bit string is more than four bits shorter than the required number of bits,
          // add four 0s to the end.
          if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
            buffer.put(0, 4)
          }

          // If the bit string is fewer than four bits shorter, add only the number of 0s that
          // are needed to reach the required number of bits.

          // After adding the terminator, if the number of bits in the string is not a multiple of 8,
          // pad the string on the right with 0s to make the string's length a multiple of 8.
          while (buffer.getLengthInBits() % 8 !== 0) {
            buffer.putBit(0)
          }

          // Add pad bytes if the string is still shorter than the total number of required bits.
          // Extend the buffer to fill the data capacity of the symbol corresponding to
          // the Version and Error Correction Level by adding the Pad Codewords 11101100 (0xEC)
          // and 00010001 (0x11) alternately.
          const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8
          for (let i = 0; i < remainingByte; i++) {
            buffer.put(i % 2 ? 0x11 : 0xEC, 8)
          }

          return createCodewords(buffer, version, errorCorrectionLevel)
        }

        /**
         * Encode input data with Reed-Solomon and return codewords with
         * relative error correction bits
         *
         * @param  {BitBuffer} bitBuffer            Data to encode
         * @param  {Number}    version              QR Code version
         * @param  {ErrorCorrectionLevel} errorCorrectionLevel Error correction level
         * @return {Uint8Array}                     Buffer containing encoded codewords
         */
        function createCodewords (bitBuffer, version, errorCorrectionLevel) {
          // Total codewords for this QR code version (Data + Error correction)
          const totalCodewords = Utils.getSymbolTotalCodewords(version)

          // Total number of error correction codewords
          const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)

          // Total number of data codewords
          const dataTotalCodewords = totalCodewords - ecTotalCodewords

          // Total number of blocks
          const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel)

          // Calculate how many blocks each group should contain
          const blocksInGroup2 = totalCodewords % ecTotalBlocks
          const blocksInGroup1 = ecTotalBlocks - blocksInGroup2

          const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks)

          const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks)
          const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1

          // Number of EC codewords is the same for both groups
          const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1

          // Initialize a Reed-Solomon encoder with a generator polynomial of degree ecCount
          const rs = new ReedSolomonEncoder(ecCount)

          let offset = 0
          const dcData = new Array(ecTotalBlocks)
          const ecData = new Array(ecTotalBlocks)
          let maxDataSize = 0
          const buffer = new Uint8Array(bitBuffer.buffer)

          // Divide the buffer into the required number of blocks
          for (let b = 0; b < ecTotalBlocks; b++) {
            const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2

            // extract a block of data from buffer
            dcData[b] = buffer.slice(offset, offset + dataSize)

            // Calculate EC codewords for this data block
            ecData[b] = rs.encode(dcData[b])

            offset += dataSize
            maxDataSize = Math.max(maxDataSize, dataSize)
          }

          // Create final data
          // Interleave the data and error correction codewords from each block
          const data = new Uint8Array(totalCodewords)
          let index = 0
          let i, r

          // Add data codewords
          for (i = 0; i < maxDataSize; i++) {
            for (r = 0; r < ecTotalBlocks; r++) {
              if (i < dcData[r].length) {
                data[index++] = dcData[r][i]
              }
            }
          }

          // Apped EC codewords
          for (i = 0; i < ecCount; i++) {
            for (r = 0; r < ecTotalBlocks; r++) {
              data[index++] = ecData[r][i]
            }
          }

          return data
        }

        /**
         * Build QR Code symbol
         *
         * @param  {String} data                 Input string
         * @param  {Number} version              QR Code version
         * @param  {ErrorCorretionLevel} errorCorrectionLevel Error level
         * @param  {MaskPattern} maskPattern     Mask pattern
         * @return {Object}                      Object containing symbol data
         */
        function createSymbol (data, version, errorCorrectionLevel, maskPattern) {
          let segments

          if (Array.isArray(data)) {
            segments = Segments.fromArray(data)
          } else if (typeof data === 'string') {
            let estimatedVersion = version

            if (!estimatedVersion) {
              const rawSegments = Segments.rawSplit(data)

              // Estimate best version that can contain raw splitted segments
              estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel)
            }

            // Build optimized segments
            // If estimated version is undefined, try with the highest version
            segments = Segments.fromString(data, estimatedVersion || 40)
          } else {
            throw new Error('Invalid data')
          }

          // Get the min version that can contain data
          const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel)

          // If no version is found, data cannot be stored
          if (!bestVersion) {
            throw new Error('The amount of data is too big to be stored in a QR Code')
          }

          // If not specified, use min version as default
          if (!version) {
            version = bestVersion

          // Check if the specified version can contain the data
          } else if (version < bestVersion) {
            throw new Error('\n' +
              'The chosen QR Code version cannot contain this amount of data.\n' +
              'Minimum version required to store current data is: ' + bestVersion + '.\n'
            )
          }

          const dataBits = createData(version, errorCorrectionLevel, segments)

          // Allocate matrix buffer
          const moduleCount = Utils.getSymbolSize(version)
          const modules = new BitMatrix(moduleCount)

          // Add function modules
          setupFinderPattern(modules, version)
          setupTimingPattern(modules)
          setupAlignmentPattern(modules, version)

          // Add temporary dummy bits for format info just to set them as reserved.
          // This is needed to prevent these bits from being masked by {@link MaskPattern.applyMask}
          // since the masking operation must be performed only on the encoding region.
          // These blocks will be replaced with correct values later in code.
          setupFormatInfo(modules, errorCorrectionLevel, 0)

          if (version >= 7) {
            setupVersionInfo(modules, version)
          }

          // Add data codewords
          setupData(modules, dataBits)

          if (isNaN(maskPattern)) {
            // Find best mask pattern
            maskPattern = MaskPattern.getBestMask(modules,
              setupFormatInfo.bind(null, modules, errorCorrectionLevel))
          }

          // Apply mask pattern
          MaskPattern.applyMask(maskPattern, modules)

          // Replace format info bits with correct values
          setupFormatInfo(modules, errorCorrectionLevel, maskPattern)

          return {
            modules: modules,
            version: version,
            errorCorrectionLevel: errorCorrectionLevel,
            maskPattern: maskPattern,
            segments: segments
          }
        }

        /**
         * QR Code
         *
         * @param {String | Array} data                 Input data
         * @param {Object} options                      Optional configurations
         * @param {Number} options.version              QR Code version
         * @param {String} options.errorCorrectionLevel Error correction level
         * @param {Function} options.toSJISFunc         Helper func to convert utf8 to sjis
         */
        exports.create = function create (data, options) {
          if (typeof data === 'undefined' || data === '') {
            throw new Error('No input text')
          }

          let errorCorrectionLevel = ECLevel.M
          let version
          let mask

          if (typeof options !== 'undefined') {
            // Use higher error correction level as default
            errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M)
            version = Version.from(options.version)
            mask = MaskPattern.from(options.maskPattern)

            if (options.toSJISFunc) {
              Utils.setToSJISFunction(options.toSJISFunc)
            }
          }

          return createSymbol(data, version, errorCorrectionLevel, mask)
        }
      },
      "lib/core/reed-solomon-encoder": function (module, exports, require) {
        const Polynomial = require('./polynomial')

        function ReedSolomonEncoder (degree) {
          this.genPoly = undefined
          this.degree = degree

          if (this.degree) this.initialize(this.degree)
        }

        /**
         * Initialize the encoder.
         * The input param should correspond to the number of error correction codewords.
         *
         * @param  {Number} degree
         */
        ReedSolomonEncoder.prototype.initialize = function initialize (degree) {
          // create an irreducible generator polynomial
          this.degree = degree
          this.genPoly = Polynomial.generateECPolynomial(this.degree)
        }

        /**
         * Encodes a chunk of data
         *
         * @param  {Uint8Array} data Buffer containing input data
         * @return {Uint8Array}      Buffer containing encoded data
         */
        ReedSolomonEncoder.prototype.encode = function encode (data) {
          if (!this.genPoly) {
            throw new Error('Encoder not initialized')
          }

          // Calculate EC for this data block
          // extends data size to data+genPoly size
          const paddedData = new Uint8Array(data.length + this.degree)
          paddedData.set(data)

          // The error correction codewords are the remainder after dividing the data codewords
          // by a generator polynomial
          const remainder = Polynomial.mod(paddedData, this.genPoly)

          // return EC data blocks (last n byte, where n is the degree of genPoly)
          // If coefficients number in remainder are less than genPoly degree,
          // pad with 0s to the left to reach the needed number of coefficients
          const start = this.degree - remainder.length
          if (start > 0) {
            const buff = new Uint8Array(this.degree)
            buff.set(remainder, start)

            return buff
          }

          return remainder
        }

        module.exports = ReedSolomonEncoder
      },
      "lib/core/regex": function (module, exports, require) {
        const numeric = '[0-9]+'
        const alphanumeric = '[A-Z $%*+\\-./:]+'
        let kanji = '(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|' +
          '[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|' +
          '[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|' +
          '[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+'
        kanji = kanji.replace(/u/g, '\\u')

        const byte = '(?:(?![A-Z0-9 $%*+\\-./:]|' + kanji + ')(?:.|[\r\n]))+'

        exports.KANJI = new RegExp(kanji, 'g')
        exports.BYTE_KANJI = new RegExp('[^A-Z0-9 $%*+\\-./:]+', 'g')
        exports.BYTE = new RegExp(byte, 'g')
        exports.NUMERIC = new RegExp(numeric, 'g')
        exports.ALPHANUMERIC = new RegExp(alphanumeric, 'g')

        const TEST_KANJI = new RegExp('^' + kanji + '$')
        const TEST_NUMERIC = new RegExp('^' + numeric + '$')
        const TEST_ALPHANUMERIC = new RegExp('^[A-Z0-9 $%*+\\-./:]+$')

        exports.testKanji = function testKanji (str) {
          return TEST_KANJI.test(str)
        }

        exports.testNumeric = function testNumeric (str) {
          return TEST_NUMERIC.test(str)
        }

        exports.testAlphanumeric = function testAlphanumeric (str) {
          return TEST_ALPHANUMERIC.test(str)
        }
      },
      "lib/core/segments": function (module, exports, require) {
        const Mode = require('./mode')
        const NumericData = require('./numeric-data')
        const AlphanumericData = require('./alphanumeric-data')
        const ByteData = require('./byte-data')
        const KanjiData = require('./kanji-data')
        const Regex = require('./regex')
        const Utils = require('./utils')
        const dijkstra = require('dijkstrajs')

        /**
         * Returns UTF8 byte length
         *
         * @param  {String} str Input string
         * @return {Number}     Number of byte
         */
        function getStringByteLength (str) {
          return unescape(encodeURIComponent(str)).length
        }

        /**
         * Get a list of segments of the specified mode
         * from a string
         *
         * @param  {Mode}   mode Segment mode
         * @param  {String} str  String to process
         * @return {Array}       Array of object with segments data
         */
        function getSegments (regex, mode, str) {
          const segments = []
          let result

          while ((result = regex.exec(str)) !== null) {
            segments.push({
              data: result[0],
              index: result.index,
              mode: mode,
              length: result[0].length
            })
          }

          return segments
        }

        /**
         * Extracts a series of segments with the appropriate
         * modes from a string
         *
         * @param  {String} dataStr Input string
         * @return {Array}          Array of object with segments data
         */
        function getSegmentsFromString (dataStr) {
          const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr)
          const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr)
          let byteSegs
          let kanjiSegs

          if (Utils.isKanjiModeEnabled()) {
            byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr)
            kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr)
          } else {
            byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr)
            kanjiSegs = []
          }

          const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs)

          return segs
            .sort(function (s1, s2) {
              return s1.index - s2.index
            })
            .map(function (obj) {
              return {
                data: obj.data,
                mode: obj.mode,
                length: obj.length
              }
            })
        }

        /**
         * Returns how many bits are needed to encode a string of
         * specified length with the specified mode
         *
         * @param  {Number} length String length
         * @param  {Mode} mode     Segment mode
         * @return {Number}        Bit length
         */
        function getSegmentBitsLength (length, mode) {
          switch (mode) {
            case Mode.NUMERIC:
              return NumericData.getBitsLength(length)
            case Mode.ALPHANUMERIC:
              return AlphanumericData.getBitsLength(length)
            case Mode.KANJI:
              return KanjiData.getBitsLength(length)
            case Mode.BYTE:
              return ByteData.getBitsLength(length)
          }
        }

        /**
         * Merges adjacent segments which have the same mode
         *
         * @param  {Array} segs Array of object with segments data
         * @return {Array}      Array of object with segments data
         */
        function mergeSegments (segs) {
          return segs.reduce(function (acc, curr) {
            const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null
            if (prevSeg && prevSeg.mode === curr.mode) {
              acc[acc.length - 1].data += curr.data
              return acc
            }

            acc.push(curr)
            return acc
          }, [])
        }

        /**
         * Generates a list of all possible nodes combination which
         * will be used to build a segments graph.
         *
         * Nodes are divided by groups. Each group will contain a list of all the modes
         * in which is possible to encode the given text.
         *
         * For example the text '12345' can be encoded as Numeric, Alphanumeric or Byte.
         * The group for '12345' will contain then 3 objects, one for each
         * possible encoding mode.
         *
         * Each node represents a possible segment.
         *
         * @param  {Array} segs Array of object with segments data
         * @return {Array}      Array of object with segments data
         */
        function buildNodes (segs) {
          const nodes = []
          for (let i = 0; i < segs.length; i++) {
            const seg = segs[i]

            switch (seg.mode) {
              case Mode.NUMERIC:
                nodes.push([seg,
                  { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
                  { data: seg.data, mode: Mode.BYTE, length: seg.length }
                ])
                break
              case Mode.ALPHANUMERIC:
                nodes.push([seg,
                  { data: seg.data, mode: Mode.BYTE, length: seg.length }
                ])
                break
              case Mode.KANJI:
                nodes.push([seg,
                  { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
                ])
                break
              case Mode.BYTE:
                nodes.push([
                  { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
                ])
            }
          }

          return nodes
        }

        /**
         * Builds a graph from a list of nodes.
         * All segments in each node group will be connected with all the segments of
         * the next group and so on.
         *
         * At each connection will be assigned a weight depending on the
         * segment's byte length.
         *
         * @param  {Array} nodes    Array of object with segments data
         * @param  {Number} version QR Code version
         * @return {Object}         Graph of all possible segments
         */
        function buildGraph (nodes, version) {
          const table = {}
          const graph = { start: {} }
          let prevNodeIds = ['start']

          for (let i = 0; i < nodes.length; i++) {
            const nodeGroup = nodes[i]
            const currentNodeIds = []

            for (let j = 0; j < nodeGroup.length; j++) {
              const node = nodeGroup[j]
              const key = '' + i + j

              currentNodeIds.push(key)
              table[key] = { node: node, lastCount: 0 }
              graph[key] = {}

              for (let n = 0; n < prevNodeIds.length; n++) {
                const prevNodeId = prevNodeIds[n]

                if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
                  graph[prevNodeId][key] =
                    getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) -
                    getSegmentBitsLength(table[prevNodeId].lastCount, node.mode)

                  table[prevNodeId].lastCount += node.length
                } else {
                  if (table[prevNodeId]) table[prevNodeId].lastCount = node.length

                  graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) +
                    4 + Mode.getCharCountIndicator(node.mode, version) // switch cost
                }
              }
            }

            prevNodeIds = currentNodeIds
          }

          for (let n = 0; n < prevNodeIds.length; n++) {
            graph[prevNodeIds[n]].end = 0
          }

          return { map: graph, table: table }
        }

        /**
         * Builds a segment from a specified data and mode.
         * If a mode is not specified, the more suitable will be used.
         *
         * @param  {String} data             Input data
         * @param  {Mode | String} modesHint Data mode
         * @return {Segment}                 Segment
         */
        function buildSingleSegment (data, modesHint) {
          let mode
          const bestMode = Mode.getBestModeForData(data)

          mode = Mode.from(modesHint, bestMode)

          // Make sure data can be encoded
          if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
            throw new Error('"' + data + '"' +
              ' cannot be encoded with mode ' + Mode.toString(mode) +
              '.\n Suggested mode is: ' + Mode.toString(bestMode))
          }

          // Use Mode.BYTE if Kanji support is disabled
          if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
            mode = Mode.BYTE
          }

          switch (mode) {
            case Mode.NUMERIC:
              return new NumericData(data)

            case Mode.ALPHANUMERIC:
              return new AlphanumericData(data)

            case Mode.KANJI:
              return new KanjiData(data)

            case Mode.BYTE:
              return new ByteData(data)
          }
        }

        /**
         * Builds a list of segments from an array.
         * Array can contain Strings or Objects with segment's info.
         *
         * For each item which is a string, will be generated a segment with the given
         * string and the more appropriate encoding mode.
         *
         * For each item which is an object, will be generated a segment with the given
         * data and mode.
         * Objects must contain at least the property "data".
         * If property "mode" is not present, the more suitable mode will be used.
         *
         * @param  {Array} array Array of objects with segments data
         * @return {Array}       Array of Segments
         */
        exports.fromArray = function fromArray (array) {
          return array.reduce(function (acc, seg) {
            if (typeof seg === 'string') {
              acc.push(buildSingleSegment(seg, null))
            } else if (seg.data) {
              acc.push(buildSingleSegment(seg.data, seg.mode))
            }

            return acc
          }, [])
        }

        /**
         * Builds an optimized sequence of segments from a string,
         * which will produce the shortest possible bitstream.
         *
         * @param  {String} data    Input string
         * @param  {Number} version QR Code version
         * @return {Array}          Array of segments
         */
        exports.fromString = function fromString (data, version) {
          const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled())

          const nodes = buildNodes(segs)
          const graph = buildGraph(nodes, version)
          const path = dijkstra.find_path(graph.map, 'start', 'end')

          const optimizedSegs = []
          for (let i = 1; i < path.length - 1; i++) {
            optimizedSegs.push(graph.table[path[i]].node)
          }

          return exports.fromArray(mergeSegments(optimizedSegs))
        }

        /**
         * Splits a string in various segments with the modes which
         * best represent their content.
         * The produced segments are far from being optimized.
         * The output of this function is only used to estimate a QR Code version
         * which may contain the data.
         *
         * @param  {string} data Input string
         * @return {Array}       Array of segments
         */
        exports.rawSplit = function rawSplit (data) {
          return exports.fromArray(
            getSegmentsFromString(data, Utils.isKanjiModeEnabled())
          )
        }
      },
      "lib/core/utils": function (module, exports, require) {
        let toSJISFunction
        const CODEWORDS_COUNT = [
          0, // Not used
          26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
          404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
          1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
          2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
        ]

        /**
         * Returns the QR Code size for the specified version
         *
         * @param  {Number} version QR Code version
         * @return {Number}         size of QR code
         */
        exports.getSymbolSize = function getSymbolSize (version) {
          if (!version) throw new Error('"version" cannot be null or undefined')
          if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40')
          return version * 4 + 17
        }

        /**
         * Returns the total number of codewords used to store data and EC information.
         *
         * @param  {Number} version QR Code version
         * @return {Number}         Data length in bits
         */
        exports.getSymbolTotalCodewords = function getSymbolTotalCodewords (version) {
          return CODEWORDS_COUNT[version]
        }

        /**
         * Encode data with Bose-Chaudhuri-Hocquenghem
         *
         * @param  {Number} data Value to encode
         * @return {Number}      Encoded value
         */
        exports.getBCHDigit = function (data) {
          let digit = 0

          while (data !== 0) {
            digit++
            data >>>= 1
          }

          return digit
        }

        exports.setToSJISFunction = function setToSJISFunction (f) {
          if (typeof f !== 'function') {
            throw new Error('"toSJISFunc" is not a valid function.')
          }

          toSJISFunction = f
        }

        exports.isKanjiModeEnabled = function () {
          return typeof toSJISFunction !== 'undefined'
        }

        exports.toSJIS = function toSJIS (kanji) {
          return toSJISFunction(kanji)
        }
      },
      "lib/core/version-check": function (module, exports, require) {
        /**
         * Check if QR Code version is valid
         *
         * @param  {Number}  version QR Code version
         * @return {Boolean}         true if valid version, false otherwise
         */
        exports.isValid = function isValid (version) {
          return !isNaN(version) && version >= 1 && version <= 40
        }
      },
      "lib/core/version": function (module, exports, require) {
        const Utils = require('./utils')
        const ECCode = require('./error-correction-code')
        const ECLevel = require('./error-correction-level')
        const Mode = require('./mode')
        const VersionCheck = require('./version-check')

        // Generator polynomial used to encode version information
        const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0)
        const G18_BCH = Utils.getBCHDigit(G18)

        function getBestVersionForDataLength (mode, length, errorCorrectionLevel) {
          for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
            if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
              return currentVersion
            }
          }

          return undefined
        }

        function getReservedBitsCount (mode, version) {
          // Character count indicator + mode indicator bits
          return Mode.getCharCountIndicator(mode, version) + 4
        }

        function getTotalBitsFromDataArray (segments, version) {
          let totalBits = 0

          segments.forEach(function (data) {
            const reservedBits = getReservedBitsCount(data.mode, version)
            totalBits += reservedBits + data.getBitsLength()
          })

          return totalBits
        }

        function getBestVersionForMixedData (segments, errorCorrectionLevel) {
          for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
            const length = getTotalBitsFromDataArray(segments, currentVersion)
            if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
              return currentVersion
            }
          }

          return undefined
        }

        /**
         * Returns version number from a value.
         * If value is not a valid version, returns defaultValue
         *
         * @param  {Number|String} value        QR Code version
         * @param  {Number}        defaultValue Fallback value
         * @return {Number}                     QR Code version number
         */
        exports.from = function from (value, defaultValue) {
          if (VersionCheck.isValid(value)) {
            return parseInt(value, 10)
          }

          return defaultValue
        }

        /**
         * Returns how much data can be stored with the specified QR code version
         * and error correction level
         *
         * @param  {Number} version              QR Code version (1-40)
         * @param  {Number} errorCorrectionLevel Error correction level
         * @param  {Mode}   mode                 Data mode
         * @return {Number}                      Quantity of storable data
         */
        exports.getCapacity = function getCapacity (version, errorCorrectionLevel, mode) {
          if (!VersionCheck.isValid(version)) {
            throw new Error('Invalid QR Code version')
          }

          // Use Byte mode as default
          if (typeof mode === 'undefined') mode = Mode.BYTE

          // Total codewords for this QR code version (Data + Error correction)
          const totalCodewords = Utils.getSymbolTotalCodewords(version)

          // Total number of error correction codewords
          const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)

          // Total number of data codewords
          const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8

          if (mode === Mode.MIXED) return dataTotalCodewordsBits

          const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version)

          // Return max number of storable codewords
          switch (mode) {
            case Mode.NUMERIC:
              return Math.floor((usableBits / 10) * 3)

            case Mode.ALPHANUMERIC:
              return Math.floor((usableBits / 11) * 2)

            case Mode.KANJI:
              return Math.floor(usableBits / 13)

            case Mode.BYTE:
            default:
              return Math.floor(usableBits / 8)
          }
        }

        /**
         * Returns the minimum version needed to contain the amount of data
         *
         * @param  {Segment} data                    Segment of data
         * @param  {Number} [errorCorrectionLevel=H] Error correction level
         * @param  {Mode} mode                       Data mode
         * @return {Number}                          QR Code version
         */
        exports.getBestVersionForData = function getBestVersionForData (data, errorCorrectionLevel) {
          let seg

          const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M)

          if (Array.isArray(data)) {
            if (data.length > 1) {
              return getBestVersionForMixedData(data, ecl)
            }

            if (data.length === 0) {
              return 1
            }

            seg = data[0]
          } else {
            seg = data
          }

          return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl)
        }

        /**
         * Returns version information with relative error correction bits
         *
         * The version information is included in QR Code symbols of version 7 or larger.
         * It consists of an 18-bit sequence containing 6 data bits,
         * with 12 error correction bits calculated using the (18, 6) Golay code.
         *
         * @param  {Number} version QR Code version
         * @return {Number}         Encoded version info bits
         */
        exports.getEncodedBits = function getEncodedBits (version) {
          if (!VersionCheck.isValid(version) || version < 7) {
            throw new Error('Invalid QR Code version')
          }

          let d = version << 12

          while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
            d ^= (G18 << (Utils.getBCHDigit(d) - G18_BCH))
          }

          return (version << 12) | d
        }
      },
    };
    const QR_MODULE_CACHE = {};
    function qrLoad(id) {
      if (QR_MODULE_CACHE[id]) return QR_MODULE_CACHE[id].exports;
      const factory = QR_MODULE_FACTORIES[id];
      if (typeof factory !== "function") throw new Error("pocket-h5 qr: missing module " + id);
      const module = { exports: {} };
      QR_MODULE_CACHE[id] = module;
      factory(module, module.exports, qrRequireFrom(id));
      return module.exports;
    }
    function qrRequireFrom(fromId) {
      const directory = fromId.split("/").slice(0, -1).join("/");
      return function qrRequire(spec) {
        if (spec === "dijkstrajs") return qrLoad("node_modules/dijkstrajs/dijkstra");
        if (spec.slice(0, 2) === "./" || spec.slice(0, 3) === "../") {
          const parts = directory === "" ? [] : directory.split("/");
          for (const segment of spec.split("/")) {
            if (segment === "." || segment === "") continue;
            else if (segment === "..") parts.pop();
            else parts.push(segment);
          }
          return qrLoad(parts.join("/").replace(/\.js$/, ""));
        }
        throw new Error("pocket-h5 qr: unsupported module " + spec);
      };
    }
    function createQrMatrix(text) {
      const qr = qrLoad("lib/core/qrcode").create(String(text), { errorCorrectionLevel: "M" });
      return { size: qr.modules.size, data: qr.modules.data, version: qr.version };
    }

    /* ---- 上游 app.js（Electron 桥替换为面板宿主适配） ---- */
    function mountPocketH5(root, DEMO_URL) {
      const realDocument = globalThis.document;
      const realWindow = globalThis.window;
      // 面板里 document 指向 ShadowRoot：getElementById / querySelectorAll / addEventListener 都在面板内生效。
      const document = root;
      let pocketAnimationFrame = 0;
      // 记录 window 上的监听器，卸载面板时全部移除（上游代码本身不返回清理函数）。
      const listeners = [];
      const window = new Proxy(realWindow, {
        get(target, property) {
          if (property === "addEventListener") {
            return function trackedAddEventListener(type, listener, options) {
              listeners.push([type, listener, options]);
              target.addEventListener(type, listener, options);
            };
          }
          const value = target[property];
          return typeof value === "function" ? value.bind(target) : value;
        },
      });

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
      let currentUrl = DEMO_URL;
      let toastTimer;
      let loadingTimer;
      let proxyRequest = 0;
      let pendingProxy = null;
      let navigationMessage = '';
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

      function isDemo(url) { return url === DEMO_URL; }

      function updateHistory() {
        $('recentAddresses').replaceChildren(...history.map(value => {
          const option = realDocument.createElement('option'); option.value = value; return option;
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
        pocketAnimationFrame = requestAnimationFrame(resizeDevice);
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
      $('refreshButton').addEventListener('click', () => { navigate(currentUrl, false); toast('已重新请求 H5 页面'); });
      $('externalButton').addEventListener('click', () => window.open(currentUrl, '_blank', 'noopener,noreferrer'));
      $('demoButton').addEventListener('click', () => { navigate(DEMO_URL, false); toast('已打开内置示例'); });
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
        if (!available) $('proxyStatus').textContent = "面板版不支持应用内代理：iframe 请求沿用宿主浏览器的网络设置。";
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
      const canvasObserver = new ResizeObserver(resizeDevice);
        canvasObserver.observe($('canvas'));
      updateHistory();
      render();
      const requested = saved.url;
      let firstUrl = DEMO_URL;
      if (requested) { try { firstUrl = normalizeAddress(requested); } catch { /* Fall back to the included demo. */ } }
      navigate(firstUrl, false);

      return function disposePocketH5() {
        for (let index = 0; index < listeners.length; index += 1) {
          try { realWindow.removeEventListener(listeners[index][0], listeners[index][1], listeners[index][2]); }
          catch (error) { /* 面板已失效时忽略 */ }
        }
        listeners.length = 0;
        clearTimeout(toastTimer);
        clearTimeout(loadingTimer);
        if (pendingProxy && pendingProxy.timer) clearTimeout(pendingProxy.timer);
        if (pocketAnimationFrame) cancelAnimationFrame(pocketAnimationFrame);
        try { canvasObserver.disconnect(); } catch (error) { /* 忽略 */ }
      };
    }

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

    /* ------------------------------------------------------------------ *
     * Pocket H5 —— DSH 面板外壳（client.js 的片段源，不是独立 ES 模块）
     *
     * 由 build-client.mjs 原样插入 `window.__ModuleLoader__.load(...).factory` 内部，
     * 因此这里可以直接使用已声明的 React / h / CSS / MARKUP / mountPocketH5。
     *
     * 职责只有三件事：
     *   1) 把上游工作台装进面板内的 Shadow DOM（样式与宿主完全隔离）；
     *   2) 注册主面板 main(key=pocket-h5) 与左侧栏入口 sidebar.panellist(id=pocket-h5)；
     *   3) 卸载时释放工作台的监听器 / 定时器 / 观察器。
     * 预览本身仍由工作台里的 <iframe id="previewFrame"> 加载用户 H5，与上游一致。
     * ------------------------------------------------------------------ */

    const POCKET_PANEL_ID = 'pocket-h5'
    const POCKET_PANEL_LABEL = 'Pocket H5'

    /**
     * 从 Host 的显示器探测结果里挑出当前窗口所在的那块屏幕。
     *
     * Host 返回 CoreGraphics 的 `{ pixelWidth/pixelHeight, widthMm/heightMm }`：
     * CoreGraphics 的 pixelWidth 是「模式宽度」，与浏览器的 CSS 像素宽度一致
     * （Retina 的 looks-like 模式也如此），所以用 screen.width/height 精确匹配即可。
     * 匹配不到时：只有一块屏就用它，否则返回 null（退回浏览器估算 + 尺子校准）。
     */
    function pickHostDisplay(displays, screenWidth, screenHeight) {
      if (!Array.isArray(displays) || displays.length === 0) return null
      const usable = displays.filter(
        (display) =>
          display &&
          Number(display.pixelWidth) > 0 &&
          Number(display.pixelHeight) > 0 &&
          Number(display.widthMm) > 0,
      )
      if (usable.length === 0) return null
      const exact = usable.find(
        (display) => display.pixelWidth === screenWidth && display.pixelHeight === screenHeight,
      )
      if (exact) return exact
      if (usable.length === 1) return usable[0]
      return null
    }

    /** 一个 CSS 像素对应的物理密度（CSS px / inch），range 与上游 displayScale 校验一致。 */
    function hostCssPixelsPerInch(display) {
      const widthMm = Number(display && display.widthMm)
      const pixelWidth = Number(display && display.pixelWidth)
      if (!Number.isFinite(widthMm) || !Number.isFinite(pixelWidth) || widthMm <= 0 || pixelWidth <= 0) return null
      const ppi = pixelWidth / (widthMm / 25.4)
      return ppi >= 16 && ppi <= 1100 ? ppi : null
    }

    /**
     * 取 Host 的显示器物理尺寸并交给上游 app.js：
     * app.js 的 displayScale() 本来就支持 `window.pocketDisplayMetrics`（Electron 时代的
     * preload 桥），这里用同形状的数据填上，再派发它监听的 `pocketdisplaychange`。
     * 这样面板里的 `100%` 也是真机物理大小，无需尺子校准；拿不到时保持原估算。
     */
    async function applyHostDisplayMetrics() {
      let payload = null
      try {
        const endpoint = new URL('/pocket-h5/display.json', window.location.origin).href
        const response = await fetch(endpoint, { cache: 'no-store' })
        if (response.ok) payload = await response.json()
      } catch (error) {
        return false
      }
      const display = pickHostDisplay(payload && payload.displays, window.screen.width, window.screen.height)
      const ppi = hostCssPixelsPerInch(display)
      if (ppi === null) return false
      window.pocketDisplayMetrics = {
        displayKey: 'host:' + display.id + ':' + display.pixelWidth + 'x' + display.pixelHeight,
        cssPixelsPerInch: ppi,
      }
      try {
        window.dispatchEvent(new Event('pocketdisplaychange'))
      } catch (error) {
        /* 事件不可用时下一次 resize/render 也会读到新值 */
      }
      return true
    }

    /**
     * 首次进面板时取一次显示器尺寸；窗口在显示器之间移动 / 缩放变化（resize）
     * 时再取一次，保证 100% 始终对应当前这块屏。
     * @returns {() => void} 清理函数
     */
    function watchHostDisplayMetrics() {
      let timer = 0
      const refresh = function () {
        clearTimeout(timer)
        timer = setTimeout(function () {
          applyHostDisplayMetrics().catch(function ignore() {})
        }, 250)
      }
      applyHostDisplayMetrics().catch(function ignore() {})
      window.addEventListener('resize', refresh)
      return function stopHostDisplayMetrics() {
        clearTimeout(timer)
        window.removeEventListener('resize', refresh)
      }
    }

    /** demo 页面由 Host 半注册在 /pocket-h5/demo.html（同源，避免 data: 与跨域策略）。 */
    function pocketDemoUrl() {
      try {
        return new URL('/pocket-h5/demo.html', window.location.origin).href
      } catch (error) {
        return '/pocket-h5/demo.html'
      }
    }

    /** 主面板：Shadow DOM 承载上游工作台，卸载时执行 mountPocketH5 返回的 dispose。 */
    function PocketH5Panel() {
      const hostRef = React.useRef(null)
      React.useEffect(function mountPanel() {
        const host = hostRef.current
        if (!host) return undefined
        let shadow = host.shadowRoot
        if (!shadow) shadow = host.attachShadow({ mode: 'open' })
        // 面板重新进入（含 React 严格模式重复执行）时重建干净的工作台。
        shadow.replaceChildren()

        const style = document.createElement('style')
        style.setAttribute('data-pocket-h5-style', '')
        style.textContent = CSS + QR_CSS + DIAGNOSIS_CSS
        const root = document.createElement('div')
        root.className = 'pocket-h5-root'
        root.innerHTML = MARKUP
        shadow.append(style, root)

        let dispose = null
        let disposeQr = null
        let disposeDiagnose = null
        let disposeDisplay = null
        try {
          dispose = mountPocketH5(shadow, pocketDemoUrl())
          // Host 能读到真实显示器毫米尺寸时，100% 就是真机大小；失败保持浏览器估算。
          disposeDisplay = watchHostDisplayMetrics()
          // 上游工作台之外新增的「手机扫码」入口；失败不影响预览本身。
          disposeQr = mountQrFeature(shadow)
          // 「诊断」入口：解释页面为什么打不开（禁止嵌入 / 需要登录）。
          disposeDiagnose = mountDiagnoseFeature(shadow)
        } catch (error) {
          console.error('[pocket-h5] 工作台初始化失败', error)
        }
        return function unmountPanel() {
          try {
            if (typeof dispose === 'function') dispose()
          } catch (error) {
            console.error('[pocket-h5] 工作台清理失败', error)
          }
          try {
            if (typeof disposeQr === 'function') disposeQr()
          } catch (error) {
            console.error('[pocket-h5] 二维码入口清理失败', error)
          }
          try {
            if (typeof disposeDiagnose === 'function') disposeDiagnose()
          } catch (error) {
            console.error('[pocket-h5] 诊断入口清理失败', error)
          }
          try {
            if (typeof disposeDisplay === 'function') disposeDisplay()
          } catch (error) {
            console.error('[pocket-h5] 显示器监听清理失败', error)
          }
        }
      }, [])
      return h('div', {
        ref: hostRef,
        className: 'pocket-h5-panel',
        style: { flex: '1 1 auto', minHeight: 0, minWidth: 0, height: '100%', display: 'block' },
      })
    }

    /** 侧栏图标：复用上游 i-phone 图形（圆角手机 + 听筒/Home 短线），跟随侧栏文字颜色。 */
    function PocketH5Glyph(props) {
      const size = props && Number(props.size) > 0 ? Number(props.size) : 18
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        h('rect', { x: 6, y: 2, width: 12, height: 20, rx: 3 }),
        h('path', { d: 'M10 5h4M11 19h2' }),
      )
    }

    /**
     * 槽位注册。main 用 keyed 槽位（key 必须与 sidebar.panellist 的 id 相同，
     * 宿主点击侧栏图标时调用 layout.selectPanel('pocket-h5') 才能命中）。
     */
    function pocketApply(ctx) {
      const guard = (label, register) => {
        try {
          register()
        } catch (error) {
          console.warn('[pocket-h5] 槽位注册失败（' + label + '）：', error)
        }
      }
      guard('main', function () {
        ctx.slots.inject('main', function () {
          return ctx.slots.register({ name: 'main', key: POCKET_PANEL_ID }, PocketH5Panel)
        })
      })
      guard('sidebar.panellist', function () {
        ctx.slots.inject('sidebar.panellist', function () {
          return ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: POCKET_PANEL_ID,
              order: 95,
              label: POCKET_PANEL_LABEL,
            },
            PocketH5Glyph,
          )
        })
      })
    }

    return {
      inject: ["slots"],
      apply: pocketApply,
      // 离线冒烟测试入口（tests/client-smoke.mjs 使用；渲染不读取）。
      __test: { createQrMatrix: createQrMatrix, qrSvgMarkup: qrSvgMarkup, pickHostDisplay: pickHostDisplay, hostCssPixelsPerInch: hostCssPixelsPerInch, summarizeProbe: summarizeProbe },
    };
  },
});
