// Tap Multi-Select (v1.0.0)
// While the mode is ON, taps are re-dispatched to the page as mouse
// events carrying ctrlKey, so sites that implement Ctrl+click
// multi-selection on PC work the same way with touch.
// The mode is toggled from the popup or the in-page floating button.
(() => {
  "use strict";
  const STORAGE_KEY = "tms_enabled";
  const BTN_ID = "tms-floating-toggle";
  let enabled = false;
  let btnEl = null;

  // ---------- mode state ----------
  function applyState(on) {
    enabled = !!on;
    renderButton();
  }
  try {
    chrome.storage.local.get(STORAGE_KEY, (r) => applyState(r && r[STORAGE_KEY]));
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]) applyState(changes[STORAGE_KEY].newValue);
    });
  } catch (e) { /* storage unavailable: stay OFF */ }

  function setMode(on) {
    applyState(on);
    try { chrome.storage.local.set({ [STORAGE_KEY]: !!on }); } catch (e) {}
  }

  // ---------- floating toggle button ----------
  // Shown on every page so the mode can be switched without opening
  // the toolbar popup (important on mobile browsers).
  function renderButton() {
    if (!document.documentElement) return;
    if (!btnEl) {
      btnEl = document.createElement("button");
      btnEl.id = BTN_ID;
      btnEl.type = "button";
      const s = btnEl.style;
      s.position = "fixed"; s.right = "12px"; s.bottom = "84px"; s.zIndex = "2147483647";
      s.padding = "10px 14px"; s.borderRadius = "999px"; s.border = "2px solid #fff";
      s.fontSize = "14px"; s.fontWeight = "700"; s.lineHeight = "1.2";
      s.boxShadow = "0 2px 8px rgba(0,0,0,.35)"; s.cursor = "pointer";
      s.touchAction = "manipulation"; s.userSelect = "none"; s.webkitUserSelect = "none";
      btnEl.addEventListener("click", (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        setMode(!enabled);
      }, true);
      document.documentElement.appendChild(btnEl);
    }
    btnEl.textContent = enabled ? "☑ 複数選択 ON" : "☐ 複数選択 OFF";
    btnEl.style.background = enabled ? "#1a73e8" : "rgba(60,60,60,.85)";
    btnEl.style.color = "#fff";
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderButton, { once: true });
  } else { renderButton(); }
  // Some pages replace <html> content late; re-attach if the button vanished.
  setInterval(() => { if (btnEl && !btnEl.isConnected) { btnEl = null; renderButton(); } }, 3000);

  // ---------- event rewriting ----------
  function isOwnUi(el) { return btnEl && (el === btnEl || btnEl.contains(el)); }

  // Elements whose native tap behaviour must not be rewritten:
  // text fields would lose focus, and native listboxes/file inputs
  // do not respond to synthetic modifier clicks anyway.
  function isExempt(el) {
    let n = el;
    for (let d = 0; n && d < 6; d += 1) {
      if (n.nodeType === 1) {
        const tag = n.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
        if (n.isContentEditable) return true;
      }
      n = n.parentElement;
    }
    return false;
  }

  function synth(type, src) {
    return new MouseEvent(type, {
      bubbles: true, cancelable: true, composed: true, view: window,
      detail: src.detail || 1, button: 0, buttons: type === "mousedown" ? 1 : 0,
      clientX: src.clientX, clientY: src.clientY,
      screenX: src.screenX, screenY: src.screenY,
      ctrlKey: true, metaKey: false, shiftKey: false, altKey: false
    });
  }

  // Intercept the mouse-event trio produced by a tap and re-dispatch
  // it with ctrlKey set. The originals are swallowed only while the
  // mode is ON, so normal browsing is untouched when OFF.
  for (const type of ["mousedown", "mouseup", "click"]) {
    document.addEventListener(type, (ev) => {
      if (!enabled || !ev.isTrusted || ev.ctrlKey || ev.metaKey) return;
      if (ev.button !== 0) return;
      const t = ev.target;
      if (!t || isOwnUi(t) || isExempt(t)) return;
      ev.stopPropagation();
      ev.preventDefault();
      t.dispatchEvent(synth(type, ev));
    }, true);
  }
})();
