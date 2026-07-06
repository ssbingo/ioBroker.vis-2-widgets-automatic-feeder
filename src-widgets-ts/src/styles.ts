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
.af-pill--crit{background:rgba(244,67,54,.16);color:#f44336}
.af-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.af-tiles--4{grid-template-columns:repeat(4,1fr)}
.af-tile{background:#3a414e;border-radius:10px;padding:9px 11px}
.af-tile .t{font-size:10.5px;color:#9aa3b0;text-transform:uppercase;letter-spacing:.06em}
.af-tile .n{font-size:20px;font-weight:700;font-variant-numeric:tabular-nums;margin-top:2px;color:#fff}
.af-tile .n small{font-size:12px;color:#9aa3b0;font-weight:500}
.af-strip{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.af-astro{margin-top:12px}
.af-astro-bar{position:relative;height:15px;border-radius:8px;overflow:hidden;
  background:linear-gradient(90deg,#191d25 0 14%,#2f5a63 24%,#4aa0ad 50%,#2f5a63 78%,#191d25 88% 100%)}
.af-astro-now{position:absolute;top:-2px;bottom:-2px;width:2px;background:#fff;box-shadow:0 0 6px #fff}
.af-astro-lbl{display:flex;justify-content:space-between;font-size:10.5px;color:#9aa3b0;margin-top:5px;font-variant-numeric:tabular-nums}
.af-banner{height:100%;box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:0 14px;
  border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#2e353d;color:#fff;
  font-family:Arial,sans-serif;font-size:13px;box-shadow:0 0 10px #000}
.af-banner .dot{width:9px;height:9px;border-radius:50%;flex:0 0 auto}
.af-banner--good .dot{background:#4caf50;box-shadow:0 0 8px #4caf50}
.af-banner--warn{border-color:rgba(241,196,15,.4)}
.af-banner--warn .dot{background:#f1c40f;box-shadow:0 0 8px #f1c40f}
.af-banner--crit{border-color:rgba(244,67,54,.4)}
.af-banner--crit .dot{background:#f44336;box-shadow:0 0 8px #f44336}
.af-banner--info{border-color:rgba(130,177,255,.4)}
.af-banner--info .dot{background:#82b1ff;box-shadow:0 0 8px #82b1ff}
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
