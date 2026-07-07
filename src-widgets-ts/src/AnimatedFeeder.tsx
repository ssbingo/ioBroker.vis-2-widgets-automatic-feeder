import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps } from '@iobroker/types-vis-2';

import FeederWidgetBase, { type FeederBaseRxData, type FeederBaseState } from './FeederWidgetBase';
import { channelOf, feederCommonGroup } from './common';
import { injectStyles } from './styles';

// Native drawing raster (matches the built-in feeder graphic). The widget scales
// via CSS while this internal raster keeps the aspect ratio and the pixel geometry.
const W = 383;
const H = 563;
const IMG_TOP = 8;
const IMG_H = 478;
const FLOOR_Y = 559;
const GRAVITY = 0.22;
const SPAWN_SPREAD = 16;
const SPAWN_INTERVAL = 260;

// Built-in, license-free feeder graphic (own work). Inlined as a data URI so the
// fallback always loads regardless of how vis-2 serves widget assets. A custom
// image (the "image" attribute) overrides it.
const BUILT_IN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 383 478" width="383" height="478"><defs><linearGradient id="lt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3e44"/><stop offset="0.55" stop-color="#26292e"/><stop offset="1" stop-color="#1b1d21"/></linearGradient><linearGradient id="lr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17191c"/><stop offset="0.5" stop-color="#2e3238"/><stop offset="1" stop-color="#131518"/></linearGradient><linearGradient id="bd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9dbdd"/><stop offset="0.18" stop-color="#f4f5f6"/><stop offset="0.45" stop-color="#ffffff"/><stop offset="0.75" stop-color="#eceeef"/><stop offset="1" stop-color="#cfd2d5"/></linearGradient><linearGradient id="bs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.10"/><stop offset="0.25" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.06"/></linearGradient><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#33373d"/><stop offset="0.5" stop-color="#212429"/><stop offset="1" stop-color="#101215"/></linearGradient><linearGradient id="ou" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0e1013"/><stop offset="0.5" stop-color="#2b2f35"/><stop offset="1" stop-color="#0e1013"/></linearGradient></defs><g><rect x="250" y="352" width="96" height="30" rx="10" fill="url(#rg)"/><rect x="336" y="340" width="14" height="54" rx="5" fill="#1b1e22"/><rect x="338" y="344" width="4" height="46" rx="2" fill="#33373d" opacity="0.8"/></g><g><path d="M73 118 L309 118 L253 392 L129 392 Z" fill="url(#bd)" opacity="0.96"/><path d="M73 118 L309 118 L253 392 L129 392 Z" fill="url(#bs)"/><ellipse cx="191" cy="392" rx="62" ry="12" fill="#e4e6e8"/><ellipse cx="191" cy="392" rx="62" ry="12" fill="url(#bs)"/><path d="M92 130 L138 380" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.55"/><path d="M84 172 Q191 190 298 172" fill="none" stroke="#c6c9cc" stroke-width="2" opacity="0.7"/></g><g><ellipse cx="191" cy="102" rx="152" ry="30" fill="url(#lr)"/><path d="M39 98 Q39 66 191 66 Q343 66 343 98 Q343 122 191 126 Q39 122 39 98 Z" fill="url(#lt)"/><ellipse cx="150" cy="84" rx="80" ry="10" fill="#fff" opacity="0.08"/><rect x="176" y="34" width="30" height="34" rx="9" fill="url(#lr)"/><path d="M158 46 Q191 30 224 46" fill="none" stroke="#26292e" stroke-width="12" stroke-linecap="round"/><rect x="182" y="38" width="6" height="24" rx="3" fill="#3f444b" opacity="0.7"/></g><g><path d="M118 358 Q191 344 264 358 L264 396 Q191 412 118 396 Z" fill="url(#rg)"/><path d="M118 358 Q191 344 264 358" fill="none" stroke="#454a52" stroke-width="3" opacity="0.9"/><circle cx="256" cy="378" r="5" fill="#0c0e10"/><circle cx="256" cy="378" r="2" fill="#3a3f46"/></g><g><path d="M158 400 L224 400 L216 446 L166 446 Z" fill="url(#ou)"/><ellipse cx="191" cy="446" rx="25" ry="7" fill="#050607"/><ellipse cx="191" cy="446" rx="17" ry="4.5" fill="#000"/><path d="M170 404 L176 442" stroke="#4a4f57" stroke-width="4" stroke-linecap="round" opacity="0.6"/></g></svg>`;
// base64 (not ";utf8,"): the bare "utf8" token is non-standard and Firefox
// refuses to load such data URIs, while base64 is accepted by every browser.
// BUILT_IN_SVG is pure ASCII, so btoa() is safe.
const BUILT_IN_URL =
    typeof btoa === 'function'
        ? `data:image/svg+xml;base64,${btoa(BUILT_IN_SVG)}`
        : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(BUILT_IN_SVG)}`;

interface AnimatedFeederRxData extends FeederBaseRxData {
    accent: string;
    image: string;
    clickToFeed: boolean;
    feedDuration: number;
    animation: boolean;
    noCard: boolean;
    spawnX: number;
    spawnY: number;
    ringX: number;
    ringY: number;
    ringSize: number;
}

interface Pellet {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    shade: number;
}

type PauseMode = 'none' | 'manual' | 'time' | 'winter';

export default class AnimatedFeeder extends FeederWidgetBase<AnimatedFeederRxData, FeederBaseState> {
    static adapter: string;

    private ctx: CanvasRenderingContext2D | null = null;
    private dpr = 1;
    private raf: number | null = null;
    private running = false;
    private secondTimer: ReturnType<typeof setInterval> | null = null;
    private armTimer: ReturnType<typeof setTimeout> | null = null;
    private pellets: Pellet[] = [];
    private lastSpawn = 0;
    private prevFeeding = false;
    private derivedDurationMs = 0; // fallback when the adapter has no feedingDurationSec
    private armed = false;
    private img: HTMLImageElement | null = null;
    private imgReady = false;
    private imgSrc = '';
    private reduceMotion = false;

    // eslint-disable-next-line class-methods-use-this
    protected relIds(): string[] {
        return [
            'status.feedingActive',
            'status.feedingEndsTs',
            'status.feedingDurationSec',
            'status.winterActive',
            'status.pauseManual',
            'status.pauseActive',
        ];
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplAutomaticFeederAnimated',
            visSet: 'vis-2-widgets-automatic-feeder',
            visName: 'AnimatedFeeder',
            visAttrs: [
                feederCommonGroup(),
                {
                    name: 'behaviour',
                    label: 'group_behaviour',
                    fields: [
                        { name: 'clickToFeed', type: 'checkbox', label: 'click_to_feed', default: true },
                        { name: 'feedDuration', type: 'number', label: 'feed_duration', default: 5, min: 1, max: 3600 },
                        { name: 'animation', type: 'checkbox', label: 'animation', default: true },
                    ],
                },
                {
                    name: 'style',
                    label: 'group_style',
                    fields: [
                        { name: 'accent', type: 'color', label: 'accent', default: '#33c1cf' },
                        { name: 'image', type: 'image', label: 'image' },
                        { name: 'noCard', type: 'checkbox', label: 'no_card', default: false },
                    ],
                },
                {
                    name: 'geometry',
                    label: 'group_geometry',
                    fields: [
                        { name: 'spawnX', type: 'number', label: 'spawn_x', default: 50, min: 0, max: 100 },
                        { name: 'spawnY', type: 'number', label: 'spawn_y', default: 80, min: 0, max: 100 },
                        { name: 'ringX', type: 'number', label: 'ring_x', default: 50, min: 0, max: 100 },
                        { name: 'ringY', type: 'number', label: 'ring_y', default: 44, min: 0, max: 100 },
                        { name: 'ringSize', type: 'number', label: 'ring_size', default: 20, min: 5, max: 45 },
                    ],
                },
            ],
            visDefaultStyle: { width: 300, height: 440 },
            visPrev: 'widgets/vis-2-widgets-automatic-feeder/img/feeder-stylized.svg',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return AnimatedFeeder.getWidgetInfo();
    }

    static getI18nPrefix(): string {
        return `${AnimatedFeeder.adapter}_`;
    }

    constructor(props: VisRxWidgetProps) {
        super(props);
        try {
            this.reduceMotion =
                typeof window !== 'undefined' &&
                !!window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch {
            this.reduceMotion = false;
        }
    }

    componentDidMount(): void {
        super.componentDidMount();
        injectStyles();
        // one redraw per second keeps the countdown number ticking even when the
        // (pellet) animation loop is not running (reduced motion / animation off).
        this.secondTimer = setInterval(() => this.ctx && this.draw(false), 1000);
        // NOTE: the 2D context is set up in setupCanvas() (the <canvas> ref
        // callback), NOT here. In the vis-2 runtime the canvas can mount AFTER
        // componentDidMount — e.g. the first render shows the "select channel"
        // card (no canvas) and the canvas only appears once the channel resolves.
        // Doing the setup in the ref callback guarantees ctx is bound whenever the
        // canvas actually attaches to the DOM.
    }

    // Ref callback for the <canvas>: fires with the element on mount and with
    // null on unmount. This is where the 2D context, DPR scaling, image and the
    // draw loop are (re)initialised.
    private setupCanvas = (canvas: HTMLCanvasElement | null): void => {
        if (this.raf !== null) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }
        this.running = false;
        if (!canvas) {
            this.ctx = null;
            return;
        }
        this.dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2);
        canvas.width = W * this.dpr;
        canvas.height = H * this.dpr;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            this.ctx = null;
            return;
        }
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        this.ctx = ctx;
        this.loadImage();
        this.draw(false);
        this.ensureLoop();
    };

    componentWillUnmount(): void {
        if (this.raf !== null) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }
        this.running = false;
        if (this.secondTimer) {
            clearInterval(this.secondTimer);
            this.secondTimer = null;
        }
        if (this.armTimer) {
            clearTimeout(this.armTimer);
            this.armTimer = null;
        }
        super.componentWillUnmount();
    }

    onRxDataChanged(): void {
        super.onRxDataChanged();
        this.loadImage();
        this.draw(false);
        this.ensureLoop();
    }

    // a live-value change may need to restart the (idle-stopped) animation loop
    protected applyState(id: string, state: ioBroker.State | null | undefined): void {
        super.applyState(id, state);
        this.ensureLoop();
    }

    private loadImage(): void {
        const src = (this.state.rxData.image && String(this.state.rxData.image)) || BUILT_IN_URL;
        if (src === this.imgSrc && this.img) {
            return;
        }
        this.imgSrc = src;
        this.imgReady = false;
        const img = new Image();
        img.onload = () => {
            if (this.imgSrc === src) {
                this.imgReady = true;
                this.draw(false);
            }
        };
        img.onerror = () => {
            if (this.imgSrc === src) {
                // failed / unreachable image: keep the widget working without it
                this.imgReady = false;
            }
        };
        img.src = src;
        this.img = img;
    }

    private pauseMode(): PauseMode {
        if (this.bool('status.pauseManual')) {
            return 'manual';
        }
        if (this.bool('status.pauseActive')) {
            return 'time';
        }
        if (this.bool('status.winterActive')) {
            return 'winter';
        }
        return 'none';
    }

    private isFeeding(): boolean {
        const endsTs = this.num('status.feedingEndsTs') || 0;
        return this.bool('status.feedingActive') && endsTs > Date.now();
    }

    private shouldAnimate(): boolean {
        return (this.isFeeding() && !this.reduceMotion) || this.pellets.length > 0;
    }

    private ensureLoop(): void {
        if (!this.running && this.ctx) {
            this.running = true;
            this.raf = requestAnimationFrame(this.frame);
        }
    }

    private frame = (): void => {
        this.draw(true);
        if (this.ctx && this.shouldAnimate()) {
            this.raf = requestAnimationFrame(this.frame);
        } else {
            this.running = false;
            this.raf = null;
            // final static frame so the last pellets/ring state is clean
            this.draw(false);
        }
    };

    private spawnBurst(sx: number, sy: number): void {
        const n = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) {
            this.pellets.push({
                x: sx + (Math.random() - 0.5) * 2 * SPAWN_SPREAD,
                y: sy + Math.random() * 6,
                vx: (Math.random() - 0.5) * 0.9,
                vy: 0.6 + Math.random() * 1.0,
                r: 3.0 + Math.random() * 3.0,
                shade: 28 + Math.floor(Math.random() * 48),
            });
        }
    }

    private draw(advance: boolean): void {
        const ctx = this.ctx;
        if (!ctx) {
            return;
        }
        const rx = this.state.rxData;
        const accent = rx.accent || '#33c1cf';
        const now = Date.now();
        const feeding = this.isFeeding();
        const mode = this.pauseMode();

        // feeding-start edge → remember the duration for the progress ring
        if (feeding && !this.prevFeeding) {
            const endsTs = this.num('status.feedingEndsTs') || 0;
            this.derivedDurationMs = Math.max(1000, endsTs - now);
            if (this.state.rxData.animation !== false && !this.reduceMotion) {
                this.lastSpawn = 0;
            }
        }
        this.prevFeeding = feeding;

        ctx.clearRect(0, 0, W, H);
        if (this.img && this.imgReady) {
            try {
                ctx.drawImage(this.img, 0, IMG_TOP, W, IMG_H);
            } catch {
                // e.g. a custom viewBox-only SVG reports 0×0 intrinsic size in
                // Firefox and drawImage throws — never let that blank the rest of
                // the frame (ring / hint / pellets).
                this.imgReady = false;
            }
        }

        if (mode !== 'none') {
            this.drawPauseSymbol(mode);
        } else if (feeding) {
            if (advance && rx.animation !== false && !this.reduceMotion) {
                const t = now;
                if (t - this.lastSpawn > SPAWN_INTERVAL) {
                    this.spawnBurst(this.pct(rx.spawnX, 50) * W, this.pct(rx.spawnY, 80) * H);
                    this.lastSpawn = t;
                }
            }
            this.drawCountdown(now, accent);
        }

        if (advance) {
            this.advancePellets();
        }
        this.drawPellets();

        if (rx.clickToFeed !== false && mode === 'none' && !feeding) {
            this.drawFeedHint();
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private pct(v: number | undefined, def: number): number {
        const n = typeof v === 'number' ? v : Number(v);
        return (isFinite(n) ? n : def) / 100;
    }

    private ring(): { x: number; y: number; r: number } {
        const rx = this.state.rxData;
        return {
            x: this.pct(rx.ringX, 50) * W,
            y: this.pct(rx.ringY, 44) * H,
            r: this.pct(rx.ringSize, 20) * W,
        };
    }

    private advancePellets(): void {
        for (let i = this.pellets.length - 1; i >= 0; i--) {
            const p = this.pellets[i];
            p.vy += GRAVITY;
            p.x += p.vx;
            p.y += p.vy;
            if (p.y > FLOOR_Y) {
                this.pellets.splice(i, 1);
            }
        }
    }

    private drawPellets(): void {
        const ctx = this.ctx!;
        for (const p of this.pellets) {
            let alpha = 1;
            if (p.y > FLOOR_Y - 50) {
                alpha = (FLOOR_Y - p.y) / 50;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.shade},${p.shade},${p.shade},${alpha.toFixed(2)})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150,150,150,${(alpha * 0.5).toFixed(2)})`;
            ctx.fill();
        }
    }

    private drawCountdown(now: number, accent: string): void {
        const ctx = this.ctx!;
        const { x, y, r } = this.ring();
        const endsTs = this.num('status.feedingEndsTs') || 0;
        const durSec = this.num('status.feedingDurationSec');
        const totalMs = durSec && durSec > 0 ? durSec * 1000 : this.derivedDurationMs;
        const remainMs = Math.max(0, endsTs - now);
        const frac = totalMs > 0 ? Math.max(0, Math.min(1, remainMs / totalMs)) : 0;
        const secs = Math.ceil(remainMs / 1000);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20,24,29,0.62)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, r - 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 7;
        ctx.stroke();

        if (frac > 0) {
            ctx.beginPath();
            ctx.arc(x, y, r - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac, false);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.round(r * 0.67)}px "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(secs), x, y - r * 0.08);
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.font = '600 15px "Segoe UI", Roboto, sans-serif';
        ctx.fillText(AnimatedFeeder.t('seconds'), x, y + r * 0.42);
    }

    private drawDisc(): void {
        const ctx = this.ctx!;
        const { x, y, r } = this.ring();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20,24,29,0.62)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, r - 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    private drawRedCross(): void {
        const ctx = this.ctx!;
        const { x, y, r } = this.ring();
        const d = r * 0.62;
        ctx.strokeStyle = 'rgba(214,48,49,0.92)';
        ctx.lineWidth = r * 0.14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - d, y - d);
        ctx.lineTo(x + d, y + d);
        ctx.moveTo(x + d, y - d);
        ctx.lineTo(x - d, y + d);
        ctx.stroke();
    }

    private drawPauseSymbol(mode: PauseMode): void {
        this.drawDisc();
        if (mode === 'winter') {
            this.drawSnowflake();
        } else if (mode === 'time') {
            this.drawClock();
        } else {
            this.drawHand();
        }
        this.drawRedCross();
    }

    private drawSnowflake(): void {
        const ctx = this.ctx!;
        const { x, y, r } = this.ring();
        const L = r * 0.58;
        const B = L * 0.32;
        ctx.strokeStyle = 'rgba(190,222,255,0.95)';
        ctx.lineWidth = r * 0.077;
        ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            const ca = Math.cos(a);
            const sa = Math.sin(a);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + ca * L, y + sa * L);
            ctx.stroke();
            const bx = x + ca * L * 0.6;
            const by = y + sa * L * 0.6;
            for (let s = -1; s <= 1; s += 2) {
                const ba = a + (s * Math.PI) / 4;
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + Math.cos(ba) * B, by + Math.sin(ba) * B);
                ctx.stroke();
            }
        }
        ctx.beginPath();
        ctx.arc(x, y, r * 0.064, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(190,222,255,0.95)';
        ctx.fill();
    }

    private drawClock(): void {
        const ctx = this.ctx!;
        const { x, y, r } = this.ring();
        const cr = r * 0.54;
        ctx.strokeStyle = 'rgba(219,228,238,0.95)';
        ctx.lineWidth = r * 0.077;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x, y, cr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - cr * 0.66);
        ctx.moveTo(x, y);
        ctx.lineTo(x + cr * 0.5, y + cr * 0.22);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r * 0.06, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(219,228,238,0.95)';
        ctx.fill();
    }

    private drawHand(): void {
        const ctx = this.ctx!;
        const { x, y, r } = this.ring();
        ctx.save();
        ctx.translate(x, y + r * 0.08);
        ctx.scale(r / 90, r / 90);
        ctx.fillStyle = 'rgba(235,238,242,0.95)';
        ctx.beginPath();
        ctx.moveTo(-30, 40);
        ctx.quadraticCurveTo(-34, 8, -30, -4);
        ctx.lineTo(30, -4);
        ctx.quadraticCurveTo(36, 14, 26, 42);
        ctx.quadraticCurveTo(0, 54, -30, 40);
        ctx.fill();
        const fingers = [
            { x: -27, h: 40 },
            { x: -11, h: 50 },
            { x: 5, h: 48 },
            { x: 21, h: 38 },
        ];
        for (const f of fingers) {
            this.roundRect(f.x - 6.5, -4 - f.h, 13, f.h + 10, 6.5);
        }
        ctx.save();
        ctx.translate(-36, 14);
        ctx.rotate(-0.55);
        this.roundRect(-7, -26, 14, 34, 7);
        ctx.restore();
        ctx.restore();
    }

    private roundRect(x: number, y: number, w: number, h: number, r: number): void {
        const ctx = this.ctx!;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    }

    private drawFeedHint(): void {
        const ctx = this.ctx!;
        const label = this.armed
            ? `${AnimatedFeeder.t('confirm')}: ${Number(this.state.rxData.feedDuration) || 5} s ?`
            : AnimatedFeeder.t('tap_to_feed');
        const accent = this.state.rxData.accent || '#33c1cf';
        ctx.font = '600 15px "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tw = ctx.measureText(label).width;
        const pw = tw + 34;
        const px = (W - pw) / 2;
        const py = H - 44;
        ctx.beginPath();
        this.roundRectStroke(px, py, pw, 30, 15);
        ctx.fillStyle = this.armed ? accent : 'rgba(20,24,29,0.72)';
        ctx.fill();
        ctx.fillStyle = this.armed ? '#ffffff' : 'rgba(255,255,255,0.85)';
        ctx.fillText(label, W / 2, py + 15);
    }

    private roundRectStroke(x: number, y: number, w: number, h: number, r: number): void {
        const ctx = this.ctx!;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    private onCanvasClick = (): void => {
        if (this.state.rxData.clickToFeed === false || !channelOf(this.state.rxData)) {
            return;
        }
        if (this.pauseMode() !== 'none' || this.isFeeding()) {
            return;
        }
        if (this.armed) {
            this.armed = false;
            if (this.armTimer) {
                clearTimeout(this.armTimer);
                this.armTimer = null;
            }
            const dur = Math.max(1, Number(this.state.rxData.feedDuration) || 5);
            const ch = channelOf(this.state.rxData);
            void this.props.context.socket.setState(`${ch}.feedFor`, dur, false);
        } else {
            this.armed = true;
            this.armTimer = setTimeout(() => {
                this.armed = false;
                this.draw(false);
            }, 4000);
        }
        this.draw(false);
    };

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const accent = this.state.rxData.accent || '#33c1cf';
        const noCard = this.state.rxData.noCard === true;
        const clickable = this.state.rxData.clickToFeed !== false;
        const t = (k: string): string => AnimatedFeeder.t(k);

        if (!this.channel()) {
            return (
                <div
                    className={`af-card${noCard ? '' : ' af-bg'}`}
                    style={{ '--af-accent': accent } as React.CSSProperties}
                >
                    <div className="af-label">{t('animated_feeder')}</div>
                    <div className="af-sub">{t('select_channel_hint')}</div>
                </div>
            );
        }

        return (
            <div
                className={`af-animcard${noCard ? '' : ' af-bg'}`}
                style={{ '--af-accent': accent } as React.CSSProperties}
            >
                <canvas
                    ref={this.setupCanvas}
                    width={W}
                    height={H}
                    className="af-anim-canvas"
                    style={{ cursor: clickable ? 'pointer' : 'default' }}
                    onClick={this.onCanvasClick}
                />
            </div>
        );
    }
}
