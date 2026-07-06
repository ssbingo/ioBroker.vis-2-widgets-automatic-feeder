// Shared CSS for all Automatic-Feeder widgets. Injected once per page.
const CSS = `
.af-card{box-sizing:border-box;height:100%;width:100%;display:flex;flex-direction:column;
  font-family:Arial,Helvetica,sans-serif;color:#fff;border-radius:15px;padding:12px 14px;overflow:hidden}
.af-card.af-bg{background:#2e353d;box-shadow:0 0 10px #000}
.af-label{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#9aa3b0;font-weight:700;
  display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.af-pill{font-size:11px;padding:3px 9px;border-radius:999px;font-weight:700;display:inline-flex;align-items:center;gap:6px}
.af-pill--good{background:rgba(76,175,80,.18);color:#4caf50}
.af-pill--warn{background:rgba(241,196,15,.16);color:#f1c40f}
.af-graphic{display:flex;align-items:center;justify-content:flex-start;gap:10px;padding-left:6px;margin:2px 0 4px}
.af-graphic svg{height:84px;width:auto;display:block}
.af-timer{flex:0 0 auto;width:56px;height:56px;border-radius:50%;display:flex;align-items:baseline;
  justify-content:center;gap:1px;border:2px solid var(--af-accent-a);background:var(--af-accent-b)}
.af-timer .n{font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;color:var(--af-accent)}
.af-timer .u{font-size:12px;color:#9aa3b0}
.af-lower{margin-top:auto}
.af-count{font-size:32px;font-weight:700;color:var(--af-accent);font-variant-numeric:tabular-nums;line-height:1.15;margin:2px 0;letter-spacing:-.01em}
.af-sub{font-size:14px;color:#9aa3b0}
.af-sub b{color:#fff}
.af-div{height:1px;background:rgba(255,255,255,.08);margin:10px 0}
.af-row{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:13px;margin-top:6px}
.af-row .k{color:#9aa3b0;flex:0 0 auto}
.af-row .v{font-weight:700;font-variant-numeric:tabular-nums;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.af-fan{transform-origin:100px 62px}
.af-graphic.af-feeding .af-fan{animation:af-spin .7s linear infinite}
@keyframes af-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.af-water{animation:af-wave 3.5s ease-in-out infinite}
@keyframes af-wave{0%,100%{opacity:.55}50%{opacity:.95}}
@media (prefers-reduced-motion:reduce){.af-graphic.af-feeding .af-fan,.af-water{animation:none}}
.af-btn{width:100%;padding:13px;border:0;border-radius:10px;background:linear-gradient(160deg,var(--af-accent),#2aa7b6);
  color:#06333a;font-family:Arial,sans-serif;font-weight:700;font-size:15.5px;cursor:pointer;box-shadow:0 6px 16px -6px rgba(51,193,207,.5)}
.af-btn:active{filter:brightness(1.15)}
.af-btn:disabled{opacity:.5;cursor:default}
.af-slider{width:100%;accent-color:var(--af-accent);height:22px;margin-top:4px}
.af-toggle{display:flex;justify-content:space-between;align-items:center;gap:10px}
.af-toggle-t{font-size:13.5px;font-weight:700}
.af-toggle-s{font-size:11px;color:#9aa3b0;line-height:1.35;max-width:26ch}
.af-chk{appearance:none;-webkit-appearance:none;width:50px;height:28px;flex:0 0 auto;border-radius:999px;
  background:#4a515e;position:relative;cursor:pointer;outline:none;transition:background .2s}
.af-chk:checked{background:var(--af-accent)}
.af-chk::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#eef2f4;transition:left .2s}
.af-chk:checked::after{left:25px}
`;

/** Injects the shared widget CSS (keyframes + classes) once per page. */
export function injectStyles(): void {
    if (typeof document === 'undefined' || document.getElementById('af-feeder-styles')) {
        return;
    }
    const el = document.createElement('style');
    el.id = 'af-feeder-styles';
    el.appendChild(document.createTextNode(CSS));
    document.head.appendChild(el);
}
