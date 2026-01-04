/*
  anti-devtools.js
  Attempts to block context menu, common DevTools shortcuts, and detect DevTools opening.
  Note: This is a best-effort deterrent and cannot provide real security against a determined user.
*/
/*
(() => {
  'use strict';

  // Skip on mobile/touch devices to avoid false positives and broken UX
  try {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if (isMobile) return;
  } catch { return; }

  // Disable context menu, selection, basic clipboard, and drag
  try {
    // Allow normal clipboard operations and selection to avoid breaking forms
    document.addEventListener('contextmenu', e => e.preventDefault(), true);
  } catch {}

  // Block common DevTools and view-source key combos
  try {
    document.addEventListener('keydown', (e) => {
      const k = e.key || '';
      const code = e.keyCode || 0;
      const ctrl = e.ctrlKey || e.metaKey; // support Cmd on macOS
      const shift = e.shiftKey;

      // F12
      if (code === 123) return e.preventDefault();

      // Ctrl+Shift+I/J/C/K (DevTools, Console, Inspector, JS console)
      if (ctrl && shift && ['I','J','C','K'].includes(k.toUpperCase())) return e.preventDefault();

      // Ctrl+U (view source) / Ctrl+S (save) / Ctrl+P (print)
      if (ctrl && ['U','S','P'].includes(k.toUpperCase())) return e.preventDefault();

      // Ctrl+Shift+E (extensions devtools)
      if (ctrl && shift && k.toUpperCase() === 'E') return e.preventDefault();

      // Ctrl+Shift+M (toggle device toolbar)
      if (ctrl && shift && k.toUpperCase() === 'M') return e.preventDefault();
    }, true);
  } catch {}

  let devtoolsTriggered = false;
  const handleDetected = () => {
    if (devtoolsTriggered) return;
    devtoolsTriggered = true;
    try {
      // Cover page and freeze interactions
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#0b1220;z-index:2147483647;display:flex;align-items:center;justify-content:center;color:#e2e8f0;font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;font-size:16px;text-align:center;padding:24px;';
      overlay.textContent = 'DevTools e Ispeziona sono disabilitati.';
      document.documentElement.appendChild(overlay);
    } catch {}
    // Optional: navigate away or reload after a short delay
    try { setTimeout(() => { try { location.href = '/'; } catch {} }, 350); } catch {}
  };

  // Detect DevTools via window dimension heuristics and a debugger timing trap
  const detectDevtools = () => {
    // Heuristic 1: large gap suggests docked devtools panel
    const threshold = 160;
    const openBySize =
      (window.outerWidth - window.innerWidth > threshold) ||
      (window.outerHeight - window.innerHeight > threshold);

    // Heuristic 2: debugger statement only pauses when DevTools are open
    let openByTiming = false;
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    const duration = performance.now() - start;
    if (duration > 100) openByTiming = true;

    if (openBySize || openByTiming) {
      handleDetected();
    }
  };

  try {
    setInterval(detectDevtools, 1000);
  } catch {}

  // Prevent opening via printing shortcut invoking print dialog
  try {
    window.onbeforeprint = () => { handleDetected(); return false; };
  } catch {}
})();
*/
