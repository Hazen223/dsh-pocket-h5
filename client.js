/* ------------------------------------------------------------------
 * Pocket H5 · DSH 面板 client bundle —— 由 build-client.mjs 生成，不要手改。
 * 界面与行为来自 ui/ 下的上游快照；转换规则见 docs/adaptation.md。
 * ------------------------------------------------------------------ */
window.__ModuleLoader__.load({
  id: "dsh-pocket-h5",
  factory(require) {
    const React = require("react");
    const h = React.createElement;
    const POCKET_H5_VERSION = "0.2.0";

    /* ---- 上游 styles.css（shadow 作用域适配） ---- */
    const CSS = `/* ------------------------------------------------------------------
   Pocket · H5 预览工作台
   纯黑白灰界面。左侧承载全部操作，右侧只留手机预览。
   ------------------------------------------------------------------ */

:host {
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


    /* ---- 设备边框（用户提供的 iPhone 外框；屏幕开口已抠空，几何见 src/client/assets/README.md） ---- */
    const POCKET_BEZEL_IMAGE = "data:image/webp;base64,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0iXb96NmTO84B72kvY895KDHdjPuoBx0Z0JzPSAI7+6oGY+SUP/Qzfzk0impiJ2fSK3KXeuSRVvdFq3Xj0jC94ZmRxtR6I6a3QPnoOFW3+yhRQ4u+3tudSaUg+AarW+QhW+WVjfBl0tZRQLc6hpJ2MONJoKdY6wchO7Q6KhHJOEbamE4JQvruGt0HIbYmbYArqWhbqeFxM04tNcCcT0NcdRkKCdx6LCFGY4undKK+G21gH730sVb7bVZm2chwX6b7WkWAnYbkZF2FIe222wTh3eaaCsP7TbxTh7aLGpAHLK3OrfYTEMwW6C6suEsZPA6rhu2lYUklX1abnHZlVfE6/w/h4S710Bl3Xlou4GHNSUk2CAPb7XQWiDaRnVlFog2S6mbJ6Jdv66b9YFoy1Rr3gWidVTldZyHNopLDRsE4vWBoWrNCkQ03CQQLyZ1ikR9Ay8S0XRaxzwRTWYN1hKRGnSRyH3dMMV5qKyrygtxyZVYxI4F9Qt0yTLu3HUzEvEa9WuRaIaqFpFoSv00Es1wVYfzkOeF6gXKQ5q7bm4C8azBlEQ8RVVdJCrUzyLRFNdoqkxUPyERTxp0kajUaRKJpi2ckTociCZ1iERc6rouEvV1pVNGKigQdXUSibg0YKnDkOpCcamTIhGoJhSLaikSdc0UhgquIhKLjNxACklE4tJAkQhUE4pFtTJRwTUFnIhEtUnEolpkpKKUZCUi1xGJRb0iUUMRiUtdASckTCJuICKx6rqQFIqvlrTyf1LVEkchg+pW/r9yrzKLLE/q1RJFIUGpW/nf/5X//e9JgFE8Wvnf/ywoQAFp5X//r0AqZaSV//1f+d9///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9t604EBnVrfzvv//++++///7777///vuPljDCWNnIgLEK6VgYMUjBSGdfeNJP5J+SjRff9AAIFI0+ZURAfmwi8gZWQpqTkWchaR6SZiGpRxGpIyOnpD4kCSsjZeSUBFZCKoiQ5IQkMnJKSsnCSkhXSxaKSCv/+++///7777///vvvv//++++///777/8D/vfff//99/9XWj8At1Ry434lRXAKyaSR9yeShkAppAZp5JhIGnIaaZA08t5E0n6lkbaTRr4zkfStPWmk311+s1NIevvBBx92xJFHrE0c2Y0b//n3v/393+CUESYAEihlJBQlTIOksTE2OOCU0QP+999///3333///ffff//9999///3333///ffff//9999//+/27354McG/A0Wjr7yDLRGOP/gSRD7+GGArHu0ZISsdbRgQ8XhGRp6CS0IyIiD3ZOQJiki9iMiF1dsUkkpIkp2RyMgxSRkJKSOFZIWkAk5IK//777///vvvv//++++///ApJK3kbiwMcjaSiknId7/3Q03+8udvfC0befbovgRf/lI2esvPZKThLCOVPiNRQpJWcEvIFiggrfzvv//++++///7777///vvvv//++++///7777///vvvv//++++///4jFUEppAZpZN+vpJhKciKJNLITSfvvV1JDaaRIGnmfcQppj1ASiTTyvkTSbWAlkL4z2CGjYTEkjP5w2bWzxIiBhHF8y6FTu2rEoz5P2tiNmwFuJI3cSCQJK4VkxAP+999///3333///ffff//9Hz3Kikgr//ufAuUlYijBSJN3PzLvGX5pOpLR1w5tKAPZ+ENPEectKxh9hNdFQAERjA88ISGvk5EXIWkakjpnpJ6rJHUhqSgkcZUkhaQuJJWQpJjkiISIyOIqScgRSSgirfzv/8r//vvvv//++++///7777///vvvv//++++///7777///vvvv//++3+idQhJ3YxEIyQdhCMfF8bC0QPzV4WjnS9+IZwKjb/9Lxzde/KrSB8bzP/977///vv/73///ffff//999//f/+fDo2SSJFkslNIJo0cQSmkBmlk36+kofuV1EgkOZG0HyeR9pFG3ouSSPtJI283SiHdhUghf2NfVxLpd696UpZC4mmzF2RBmvEirJQRf/wIgnmWSB0bhuz0EVBDVgLJIolsEslKI5kH/O+///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvv//++++///7777///vvvf7ItRglp5X///ffff//9999///3333///ffff//9X/nff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//9999///3333///ffff//zrxWSuEqyQ9LK//777//pXTgirfzvv//+//vff//99//v184ssPN7L+UqJIVkh6SV4J2SHInsOq5u7AZWItLQgEjcIBS7zldKGkKRqkKxqXYmamhHogFXgfOQbapMIjYZucEQiTQ0UR6iTSJ2nUNSKG5gJyIPdVc6dl1wikihPyeJSCW5AJ5QklNEDgXwBI7dX8iTRJ3+8iSRuv3ZKSJ6iaRQQDdJ1OkvpIm6/bmXJOr1R0gShQK6ThF1UH+kifpWVymiXgE5KeKA+gnNJFET90MnkdROEnXoO2slifL+3MIJonohKeJGf7RQgqhdhEkQ9wpoK0VUL6BJ7E6xwK9RQCO6NG67PzWcIur15w5OD4Um6oemEkR5D/d1QIK4K/rWoRNErRpZP26QpYcaNdwPhyJBJPpvkCCug/tqE9JDB6i/w5Clh/YpsNkhPXyA++s1k0QFup0gOiwiHDo9tFeE6ySROFR6aKcAUSc9vFmAU0SuFwAH0Tm9AjezW8hudAlcbxUg7aeHOCjCCaJ6rYDAYXJIhxS659QQhWTsheTQQRFB21lyaKsI2FFayGK7EO+SHN4tRPVuasj7hdA8TA1puxD3NlNDbBUCy9E5tQIzwUYxWokueRv2ixCspobYLAK8nBiyNophITFEo1eExWJiSJtZEcCawQkhVlSItdZ2WmiJguvrpIStBbkQa0FkCSHmRbGesYnbaRW4ybMUPSccV+JW84U9gkgHu7td2EKO0kHZFsXVgtNBXi5uZVdKB2m8uNacSAjfL45pUsJTxXnejswpFdh5rjgmiS1pm8+jwsZQOmh1i+Inewmh8RwXpe1V0sH3RPH5dEJoysU5u58Qus0AHZ/TKfCbRSqM244tYbuwJFyYx/JUUH5P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";
    const POCKET_BEZEL = {"pixelRatio":3,"ppi":460,"screenWidth":402,"screenHeight":874,"radius":90,"portrait":{"outerW":439.3333,"outerH":905.6667,"screenX":18.6667,"screenY":16,"screenW":402,"screenH":874},"landscape":{"outerW":905.6667,"outerH":439.3333,"screenX":16,"screenY":18.6667,"screenW":874,"screenH":402}};

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
      const device = { ppi: 460, pixelRatio: 3, bodyWidthMm: 72.776516, bodyHeightMm: 150.025658 }; // 外框尺寸来自 src/client/assets/bezel.json
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
        const bridged = window.pocketBridge && window.pocketBridge.target === url ? window.pocketBridge.entryUrl : null;
        $('previewFrame').src = bridged || url;
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
        const bezel = state.landscape ? POCKET_BEZEL.landscape : POCKET_BEZEL.portrait;
        // 屏幕开口在边框图片里上下留边不对称，按素材几何定位 .screen
        $('phone').style.padding = `${bezel.screenY}px ${bezel.outerW - bezel.screenX - bezel.screenW}px ${bezel.outerH - bezel.screenY - bezel.screenH}px ${bezel.screenX}px`;
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
        const source = pocketPreviewTarget(shadow)
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
        const source = pocketPreviewTarget(shadow)
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
     * Pocket H5 —— 「登录桥」增值功能（client.js 的片段源，不是独立 ES 模块）
     *
     * 解决的问题：内嵌 iframe 用 DSH 应用自己的 Chromium 会话，拿不到 Safari 里
     * 已经登录的 Cookie。做法：Host 起一个只监听 127.0.0.1 的反向代理，把 Safari
     * 导入的 Cookie 注入上游请求；面板让 iframe 走这个代理（代理 origin 是
     * http://127.0.0.1:<随机端口>，root 挂载，页面里的绝对路径仍可用）。
     *
     * 边界（对话框里也写明）：
     *   - Cookie 只存在 Host 内存，停止/面板卸载/闲置 30 分钟即释放；
     *   - 只能带 Cookie 认证；页面里写死绝对地址、或调用其它域名 API 时不会经过代理；
     *   - 代理会剥离 X-Frame-Options 与 CSP frame-ancestors，让原本禁止嵌入的页面也能看；
     *   - 读 Safari Cookie 需要给 DSH 授「完全磁盘访问权限」；也支持手动粘贴 Cookie。
     * ------------------------------------------------------------------ */

    const BRIDGE_CSS = `
    /* ---- 登录桥（构建期追加，沿用工作台黑白灰） ---- */
    .bridge-dialog { width: min(460px, calc(100vw - 40px)); padding: 24px 26px 22px; }
    .bridge-dialog .dialog-heading h2 { margin: 8px 0 16px; font-size: 19px; letter-spacing: -.3px; }
    .bridge-dialog .bridge-close { width: 32px; height: 32px; flex-shrink: 0; }
    .bridge-body { display: flex; flex-direction: column; gap: 10px; font-size: 11.5px; line-height: 1.8; color: #565656; }
    .bridge-target { font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; color: #4a4a4a; overflow-wrap: anywhere; }
    .bridge-status { padding: 9px 11px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface-2); font-size: 11px; line-height: 1.7; color: #5b5b5b; }
    .bridge-status[data-tone="error"] { border-color: #bdbdbd; color: #2b2b2b; }
    .bridge-status[data-tone="warn"] { border-color: #d0d0d0; color: #3d3d3d; }
    .bridge-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .bridge-actions .outline-button { width: auto; flex: 1 1 200px; margin-top: 0; }
    .bridge-actions .text-button { padding: 6px 4px; }
    .bridge-manual { margin-top: 2px; }
    .bridge-manual summary { cursor: pointer; font-size: 11px; color: #5f5f5f; }
    .bridge-manual textarea {
      box-sizing: border-box;
      width: 100%;
      min-height: 64px;
      margin-top: 6px;
      padding: 8px 9px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--surface-2);
      font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
      color: #333333;
      resize: vertical;
    }
    .bridge-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      border-bottom: 1px solid var(--line);
      background: var(--surface-2);
      font-size: 11px;
      color: #3d3d3d;
    }
    .bridge-banner .bridge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4a4a4a; flex-shrink: 0; }
    .bridge-banner .bridge-banner-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bridge-banner .text-button { margin-left: auto; flex-shrink: 0; }
    `

    /** 桥接状态的展示文案（纯函数，便于冒烟测试）。 */
    function bridgeBannerText(state) {
      if (!state || state.active !== true) return '登录桥未启用'
      const source = state.source === 'manual' ? '手动 Cookie' : 'Safari'
      return (
        '登录桥已启用 · ' +
        source +
        ' · ' +
        String(state.cookieCount ?? 0) +
        ' 个 Cookie · 预览经本机代理'
      )
    }

    /** 只允许 http/https 的预览地址走登录桥（dsh-app 示例页没有登录态可带）。 */
    function bridgeCanTarget(url) {
      if (typeof url !== 'string' || url === '') return false
      try {
        const parsed = new URL(url)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    }

    /**
     * 在面板里挂载「登录桥」按钮、对话框和状态条。
     * @param {ShadowRoot} shadow 面板 Shadow DOM
     * @returns {() => void} 清理函数（停止桥接并移除新增节点）
     */
    function mountBridgeFeature(shadow) {
      const demoButton = shadow.getElementById('demoButton')
      const root = shadow.querySelector('.pocket-h5-root')
      const mainPanel = shadow.querySelector('.main-panel')
      if (!demoButton || !root || !mainPanel) return function () {}

      const endpoint = function () {
        return new URL('/pocket-h5/bridge.json', window.location.origin).href
      }

      const callBridge = async function (payload) {
        const response = await fetch(endpoint(), {
          method: payload === undefined ? 'GET' : 'POST',
          cache: 'no-store',
          headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
          body: payload === undefined ? undefined : JSON.stringify(payload),
        })
        return await response.json()
      }

      const button = document.createElement('button')
      button.id = 'bridgeButton'
      button.type = 'button'
      button.className = 'text-button small'
      button.title = '登录桥：用 Safari 已登录的 Cookie 经本机代理预览'
      button.setAttribute('aria-label', '登录桥')
      button.textContent = '登录桥'
      demoButton.insertAdjacentElement('afterend', button)

      // 顶部状态条（仅在桥接启用时出现）
      const banner = document.createElement('div')
      banner.id = 'bridgeBanner'
      banner.className = 'bridge-banner'
      banner.hidden = true
      banner.innerHTML =
        '<span class="bridge-dot" aria-hidden="true"></span>' +
        '<span class="bridge-banner-text" id="bridgeBannerText"></span>' +
        '<button type="button" class="text-button small" id="bridgeBannerStop">恢复直连</button>'
      const canvas = shadow.getElementById('canvas')
      if (canvas) mainPanel.insertBefore(banner, canvas)
      else mainPanel.append(banner)

      const dialog = document.createElement('dialog')
      dialog.id = 'bridgeDialog'
      dialog.className = 'bridge-dialog'
      dialog.innerHTML =
        '<div class="dialog-heading"><div><span class="eyebrow">登录态</span><h2>登录桥</h2></div>' +
        '<button type="button" class="icon-button bridge-close" aria-label="关闭登录桥">' +
        '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>' +
        '<div class="bridge-body">' +
        '<p class="bridge-target" id="bridgeTargetText"></p>' +
        '<div class="bridge-status" id="bridgeStatus" data-tone="info">正在读取状态…</div>' +
        '<div class="bridge-actions">' +
        '<button type="button" class="outline-button" id="bridgeStart">从 Safari 导入并开启桥接</button>' +
        '<button type="button" class="text-button small" id="bridgeRefresh">重新导入</button>' +
        '<button type="button" class="text-button small" id="bridgeStop">停止桥接</button>' +
        '</div>' +
        '<details class="bridge-manual"><summary>读取不到 Safari（或不想授权）？手动粘贴 Cookie</summary>' +
        '<textarea id="bridgeManualCookies" spellcheck="false" placeholder="从 DevTools 复制的完整 Cookie 请求头，例如：sid=...; token=..."></textarea>' +
        '<div class="bridge-actions"><button type="button" class="outline-button" id="bridgeManualStart">用手动 Cookie 开启桥接</button></div>' +
        '</details>' +
        '<p>只用 Cookie 认证；密码/扫码类登录仍需在预览里完成。停止、面板卸载或闲置 30 分钟会释放 Cookie。</p>' +
        '</div>'
      root.append(dialog)

      const statusEl = shadow.getElementById('bridgeStatus')
      const targetEl = shadow.getElementById('bridgeTargetText')
      const bannerText = shadow.getElementById('bridgeBannerText')
      const manualInput = shadow.getElementById('bridgeManualCookies')

      const setStatus = function (text, tone) {
        statusEl.textContent = text
        statusEl.setAttribute('data-tone', tone || 'info')
      }

      const showBanner = function (state) {
        if (!state || state.active !== true) {
          banner.hidden = true
          bannerText.textContent = ''
          return
        }
        banner.hidden = false
        bannerText.textContent = bridgeBannerText(state)
      }

      const previewFrame = function () {
        return shadow.getElementById('previewFrame')
      }

      /** 应用桥接状态：iframe 改为加载代理地址；关闭时恢复直连。 */
      const applyState = function (state, reload) {
        const frame = previewFrame()
        if (!state || state.active !== true) {
          window.pocketBridge = null
          showBanner(null)
          return
        }
        window.pocketBridge = { target: state.target, entryUrl: state.entryUrl }
        showBanner(state)
        if (frame && (reload || frame.getAttribute('src') !== state.entryUrl)) frame.src = state.entryUrl
        if (state.warning) setStatus(state.warning, 'warn')
      }

      const currentTarget = function () {
        return pocketPreviewTarget(shadow)
      }

      const openDialog = async function () {
        if (typeof dialog.showModal === 'function') dialog.showModal()
        else dialog.setAttribute('open', '')
        const target = currentTarget()
        const demo = pocketDemoUrl()
        if (!bridgeCanTarget(target) || target === demo) {
          targetEl.textContent = '当前预览不是可登录的 http(s) 地址'
          setStatus('先输入并打开你的 H5 地址（内置示例没有登录态可带），再开启登录桥。', 'warn')
          return
        }
        targetEl.textContent = target
        try {
          const state = await callBridge()
          if (state.active === true && state.target === target) {
            setStatus(bridgeBannerText(state), 'ok')
          } else if (state.active === true) {
            setStatus('当前有一个针对其它地址的桥接在运行；开启会替换它。', 'warn')
          } else {
            setStatus('尚未开启。开启后会从 Safari 读取该站点的 Cookie（需要给 DSH 完全磁盘访问权限）。')
          }
        } catch (error) {
          setStatus('读取桥接状态失败：Host 半可能需要重启 DSH 才会生效。', 'error')
        }
      }

      const closeDialog = function () {
        if (typeof dialog.close === 'function') dialog.close()
        else dialog.removeAttribute('open')
      }

      const startWith = async function (payload) {
        setStatus('正在启动登录桥…')
        let state
        try {
          state = await callBridge(payload)
        } catch (error) {
          setStatus('无法调用登录桥接口：Host 半可能需要重启 DSH 才会生效。', 'error')
          return
        }
        if (state.ok !== true) {
          if (state.code === 'safari-permission') {
            setStatus(
              state.message ||
                '读取 Safari Cookie 被系统拒绝：请到「系统设置 → 隐私与安全性 → 完全磁盘访问权限」添加 DSH NEXT 并打开开关，然后重启 DSH；或改用下方「手动粘贴 Cookie」。',
              'error',
            )
          } else {
            setStatus(state.message || '登录桥启动失败', 'error')
          }
          return
        }
        applyState(state, true)
        setStatus(bridgeBannerText(state), 'ok')
        closeDialog()
      }

      const startButton = shadow.getElementById('bridgeStart')
      const refreshButton = shadow.getElementById('bridgeRefresh')
      const stopButton = shadow.getElementById('bridgeStop')
      const manualButton = shadow.getElementById('bridgeManualStart')
      const bannerStop = shadow.getElementById('bridgeBannerStop')
      const closeButton = shadow.querySelector('#bridgeDialog .bridge-close')

      const onStart = function () {
        const target = currentTarget()
        if (!bridgeCanTarget(target) || target === pocketDemoUrl()) {
          setStatus('先打开一个真实的 H5 地址再开启登录桥。', 'warn')
          return
        }
        startWith({ action: 'start', target }).catch(function (error) {
          setStatus(String(error && error.message ? error.message : error), 'error')
        })
      }

      const onManualStart = function () {
        const target = currentTarget()
        if (!bridgeCanTarget(target) || target === pocketDemoUrl()) {
          setStatus('先打开一个真实的 H5 地址再开启登录桥。', 'warn')
          return
        }
        const cookies = String(manualInput.value || '').trim()
        if (cookies === '') {
          setStatus('先把浏览器里的 Cookie 请求头粘贴到文本框。', 'warn')
          return
        }
        startWith({ action: 'start', target, cookies }).catch(function (error) {
          setStatus(String(error && error.message ? error.message : error), 'error')
        })
      }

      const onRefresh = async function () {
        setStatus('正在从 Safari 重新导入…')
        try {
          const state = await callBridge({ action: 'refresh' })
          if (state.ok !== true) {
            setStatus(state.message || '重新导入失败', 'error')
            return
          }
          applyState(state, true)
          setStatus(bridgeBannerText(state), 'ok')
        } catch (error) {
          setStatus('重新导入失败：Host 半可能未加载。', 'error')
        }
      }

      const onStop = async function () {
        try {
          await callBridge({ action: 'stop' })
        } catch (error) {
          // Host 不可用时也要把面板恢复成直连。
        }
        const target = window.pocketBridge && window.pocketBridge.target
        window.pocketBridge = null
        showBanner(null)
        const frame = previewFrame()
        if (frame && bridgeCanTarget(target)) frame.src = target
        setStatus('已停止桥接，恢复直连（直连时没有 Safari 登录态）。')
      }

      button.addEventListener('click', function () {
        openDialog().catch(function ignore() {})
      })
      startButton.addEventListener('click', onStart)
      manualButton.addEventListener('click', onManualStart)
      refreshButton.addEventListener('click', function () {
        onRefresh().catch(function ignore() {})
      })
      stopButton.addEventListener('click', function () {
        onStop().catch(function ignore() {})
      })
      bannerStop.addEventListener('click', function () {
        onStop().catch(function ignore() {})
      })
      closeButton.addEventListener('click', closeDialog)
      dialog.addEventListener('click', function (event) {
        if (event.target !== dialog) return
        const rect = dialog.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog()
      })

      // 面板重新进入时恢复仍然存活的桥接（例如切换面板后又切回来）。
      callBridge()
        .then(function (state) {
          if (state.active !== true) return
          const target = currentTarget()
          window.pocketBridge = { target: state.target, entryUrl: state.entryUrl }
          showBanner(state)
          const frame = previewFrame()
          if (frame && state.entryUrl) frame.src = state.entryUrl
        })
        .catch(function ignore() {})

      return function disposeBridgeFeature() {
        const wasActive = window.pocketBridge !== null && window.pocketBridge !== undefined
        window.pocketBridge = null
        if (wasActive) {
          callBridge({ action: 'stop' }).catch(function ignore() {})
        }
        button.remove()
        banner.remove()
        dialog.remove()
      }
    }

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
     * 2.5 设备外框：用用户提供的 iPhone 边框图片替代上游 CSS 手绘外框
     *     .phone 仍是上游布局盒（宽高/内边距由 app.js 按边框几何计算），
     *     ::before 只负责画边框，.screen 落在图片的屏幕开口上。
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
      z-index: 0;
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
      border-radius: var(--p-screen-radius);
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
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--p-text-tertiary);
      line-height: 1.4;
    }
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
        root.style.setProperty('--p-screen-radius', POCKET_BEZEL.radius + 'px')
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

      return function disposePanelTheme() {
        workspace.classList.remove('ph-workspace')
        header.remove()
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

    /**
     * 当前预览的「真实目标地址」。
     * 登录桥启用时 iframe 实际加载的是代理地址（`window.pocketBridge.entryUrl`），
     * 二维码、诊断、登录桥本身都应该针对原始目标，而不是代理地址。
     * @param {ShadowRoot} shadow
     */
    function pocketPreviewTarget(shadow) {
      const frame = shadow.getElementById('previewFrame')
      const src = frame && frame.getAttribute('src') ? frame.getAttribute('src') : ''
      const bridge = window.pocketBridge
      if (bridge && src === bridge.entryUrl) return bridge.target
      return src
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
        style.textContent = CSS + QR_CSS + DIAGNOSIS_CSS + BRIDGE_CSS + PANEL_THEME_CSS
        const root = document.createElement('div')
        root.className = 'pocket-h5-root'
        root.innerHTML = MARKUP
        shadow.append(style, root)

        let dispose = null
        let disposeTheme = null
        let disposeQr = null
        let disposeDiagnose = null
        let disposeBridge = null
        let disposeDisplay = null
        try {
          dispose = mountPocketH5(shadow, pocketDemoUrl())
          // 外观层：把品牌/当前页面/状态/动作移到 48px 顶栏，并套上 FlowPilot 风格面层。
          disposeTheme = mountPanelTheme(shadow)
          // Host 能读到真实显示器毫米尺寸时，100% 就是真机大小；失败保持浏览器估算。
          disposeDisplay = watchHostDisplayMetrics()
          // 上游工作台之外新增的「手机扫码」入口；失败不影响预览本身。
          disposeQr = mountQrFeature(shadow)
          // 「诊断」入口：解释页面为什么打不开（禁止嵌入 / 需要登录）。
          disposeDiagnose = mountDiagnoseFeature(shadow)
          // 「登录桥」入口：用 Safari 已登录 Cookie 经本机代理预览。
          disposeBridge = mountBridgeFeature(shadow)
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
            if (typeof disposeBridge === 'function') disposeBridge()
          } catch (error) {
            console.error('[pocket-h5] 登录桥清理失败', error)
          }
          try {
            if (typeof disposeTheme === 'function') disposeTheme()
          } catch (error) {
            console.error('[pocket-h5] 外观层清理失败', error)
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
      version: POCKET_H5_VERSION,
      // 离线冒烟测试入口（tests/client-smoke.mjs 使用；渲染不读取）。
      __test: { createQrMatrix: createQrMatrix, qrSvgMarkup: qrSvgMarkup, pickHostDisplay: pickHostDisplay, hostCssPixelsPerInch: hostCssPixelsPerInch, summarizeProbe: summarizeProbe, bridgeBannerText: bridgeBannerText, bridgeCanTarget: bridgeCanTarget, bezelMetrics: POCKET_BEZEL },
    };
  },
});
