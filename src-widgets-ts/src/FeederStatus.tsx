import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

// Sub-states (relative to the switch channel) this widget reads.
const SUB_IDS = [
    'status.feedingActive',
    'status.feedingEndsTs',
    'status.nextFeeding',
    'status.nextFeedingTs',
    'status.lastFeeding',
    'status.lastResult',
    'status.blocked',
    'status.blockReasonCode',
    'status.blockReason',
    'status.error',
    'status.sunrise',
    'status.sunset',
    'settings.dynamicEnabled',
];

interface FeederStatusRxData {
    channel: string;
    accent: string;
    timerPosition: 'left' | 'right';
    animation: boolean;
    noCard: boolean;
}

interface FeederStatusState extends VisRxWidgetState {
    fv: Record<string, ioBroker.StateValue | null>;
    tick: number;
}

/** Injects the widget's CSS (keyframes + classes) once per page. */
function injectStyles(): void {
    if (typeof document === 'undefined' || document.getElementById('af-feeder-styles')) {
        return;
    }
    const css = `
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
`;
    const el = document.createElement('style');
    el.id = 'af-feeder-styles';
    el.appendChild(document.createTextNode(css));
    document.head.appendChild(el);
}

export default class FeederStatus extends (window.visRxWidget as typeof VisRxWidget)<
    FeederStatusRxData,
    FeederStatusState
> {
    static adapter: string;
    private subscribedIds: string[] = [];
    private tickTimer: ReturnType<typeof setInterval> | null = null;
    private mounted = false;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = {
            ...this.state,
            fv: {},
            tick: 0,
        };
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplAutomaticFeederStatus',
            visSet: 'vis-2-widgets-automatic-feeder',
            visSetLabel: 'vis2_automatic_feeder', // set label (defined once in the set)
            visSetColor: '#33c1cf',
            visSetIcon: 'widgets/vis-2-widgets-automatic-feeder/img/vis-2-widgets-automatic-feeder.svg',
            visName: 'FeederStatus',
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        {
                            name: 'channel',
                            type: 'id',
                            label: 'switch_channel',
                            tooltip: 'switch_channel_tooltip',
                        },
                    ],
                },
                {
                    name: 'style',
                    label: 'group_style',
                    fields: [
                        { name: 'accent', type: 'color', label: 'accent', default: '#33c1cf' },
                        {
                            name: 'timerPosition',
                            type: 'select',
                            label: 'timer_position',
                            options: [
                                { value: 'right', label: 'right' },
                                { value: 'left', label: 'left' },
                            ],
                            default: 'right',
                        },
                        { name: 'animation', type: 'checkbox', label: 'animation', default: true },
                        { name: 'noCard', type: 'checkbox', label: 'no_card', default: false },
                    ],
                },
            ],
            visDefaultStyle: {
                width: 320,
                height: 340,
            },
            visPrev: 'widgets/vis-2-widgets-automatic-feeder/img/vis-widget-demo.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return FeederStatus.getWidgetInfo();
    }

    static getI18nPrefix(): string {
        return `${FeederStatus.adapter}_`;
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.mounted = true;
        injectStyles();
        void this.subscribeFeeder();
        this.tickTimer = setInterval(() => this.mounted && this.setState(s => ({ tick: s.tick + 1 })), 1000);
    }

    componentWillUnmount(): void {
        this.mounted = false;
        if (this.tickTimer) {
            clearInterval(this.tickTimer);
            this.tickTimer = null;
        }
        this.unsubscribeFeeder();
        super.componentWillUnmount();
    }

    onRxDataChanged(): void {
        void this.subscribeFeeder();
    }

    private channelIds(): string[] {
        const ch = this.state.rxData.channel;
        return ch ? SUB_IDS.map(s => `${ch}.${s}`) : [];
    }

    private async subscribeFeeder(): Promise<void> {
        this.unsubscribeFeeder();
        const ids = this.channelIds();
        if (!ids.length) {
            this.setState({ fv: {} });
            return;
        }
        this.subscribedIds = ids;
        try {
            await this.props.context.socket.subscribeState(ids, this.onFeederState);
        } catch {
            /* ignore */
        }
        // seed initial values
        for (const id of ids) {
            try {
                const st = await this.props.context.socket.getState(id);
                this.applyState(id, st);
            } catch {
                /* ignore */
            }
        }
    }

    private unsubscribeFeeder(): void {
        if (this.subscribedIds.length) {
            try {
                this.props.context.socket.unsubscribeState(this.subscribedIds, this.onFeederState);
            } catch {
                /* ignore */
            }
            this.subscribedIds = [];
        }
    }

    private onFeederState = (id: string, state: ioBroker.State | null | undefined): void => {
        this.applyState(id, state);
    };

    private applyState(id: string, state: ioBroker.State | null | undefined): void {
        if (!this.mounted) {
            return;
        }
        const ch = this.state.rxData.channel;
        const key = ch && id.startsWith(`${ch}.`) ? id.substring(ch.length + 1) : id;
        this.setState(s => ({ fv: { ...s.fv, [key]: state ? state.val : null } }));
    }

    private num(key: string): number | null {
        const v = this.state.fv[key];
        return v === null || v === undefined || v === '' ? null : Number(v);
    }

    private str(key: string): string {
        const v = this.state.fv[key];
        return typeof v === 'string' ? v : '';
    }

    private bool(key: string): boolean {
        return this.state.fv[key] === true;
    }

    // "DD.MM.YYYY HH:MM:SS" -> "HH:MM"
    // eslint-disable-next-line class-methods-use-this
    private hhmm(v: string): string {
        return typeof v === 'string' && v.length > 15 ? v.substring(11, 16) : v || '–';
    }

    private renderGraphic(accent: string, feeding: boolean, endsTs: number | null): React.JSX.Element {
        const now = Date.now();
        const secLeft = endsTs ? Math.ceil((endsTs - now) / 1000) : 0;
        const showTimer = feeding && endsTs !== null && secLeft > 0;
        const blade = 'M100 61 C96.5 54 96.5 50 100 48 C103.5 50 103.5 54 100 61 Z';
        const svg = (
            <svg
                viewBox="0 0 200 96"
                preserveAspectRatio="xMidYMid meet"
            >
                <rect
                    className="af-water"
                    x="8"
                    y="80"
                    width="184"
                    height="14"
                    rx="6"
                    fill="rgba(51,193,207,0.16)"
                />
                <ellipse
                    className="af-water"
                    cx="62"
                    cy="81"
                    rx="20"
                    ry="2.6"
                    fill="rgba(51,193,207,0.30)"
                />
                <ellipse
                    className="af-water"
                    cx="140"
                    cy="81"
                    rx="20"
                    ry="2.6"
                    fill="rgba(51,193,207,0.30)"
                />
                <ellipse
                    cx="66"
                    cy="76"
                    rx="20"
                    ry="7"
                    fill="#4a515e"
                />
                <ellipse
                    cx="134"
                    cy="76"
                    rx="20"
                    ry="7"
                    fill="#4a515e"
                />
                <ellipse
                    cx="66"
                    cy="74"
                    rx="20"
                    ry="4"
                    fill="#5a6270"
                />
                <ellipse
                    cx="134"
                    cy="74"
                    rx="20"
                    ry="4"
                    fill="#5a6270"
                />
                <rect
                    x="60"
                    y="69"
                    width="80"
                    height="6"
                    rx="3"
                    fill="#3a414e"
                />
                <rect
                    x="74"
                    y="13"
                    width="52"
                    height="30"
                    rx="5"
                    fill="#3a414e"
                    stroke="#5a6270"
                    strokeWidth="1"
                />
                <rect
                    x="70"
                    y="7"
                    width="60"
                    height="8"
                    rx="4"
                    fill="#5a6270"
                />
                <circle
                    cx="100"
                    cy="11"
                    r="2"
                    fill={accent}
                />
                <rect
                    x="81"
                    y="21"
                    width="30"
                    height="3"
                    rx="1.5"
                    fill="rgba(255,255,255,0.07)"
                />
                <path
                    d="M76 43 H124 L108 55 H92 Z"
                    fill="#2f3540"
                />
                <circle
                    cx="100"
                    cy="62"
                    r="13"
                    fill="#20252d"
                    stroke={accent}
                    strokeWidth="1.5"
                />
                <g className="af-fan">
                    <path
                        d={blade}
                        fill={accent}
                        transform="rotate(0 100 62)"
                    />
                    <path
                        d={blade}
                        fill={accent}
                        transform="rotate(120 100 62)"
                    />
                    <path
                        d={blade}
                        fill="#2aa7b6"
                        transform="rotate(240 100 62)"
                    />
                    <circle
                        cx="100"
                        cy="62"
                        r="3.2"
                        fill="#dff3f5"
                    />
                </g>
            </svg>
        );
        const timer = (
            <div
                className="af-timer"
                style={{ visibility: showTimer ? 'visible' : 'hidden' }}
            >
                <span className="n">{showTimer ? secLeft : '–'}</span>
                <span className="u">s</span>
            </div>
        );
        const left = this.state.rxData.timerPosition === 'left';
        const anim = this.state.rxData.animation !== false;
        return (
            <div className={`af-graphic${feeding && anim ? ' af-feeding' : ''}`}>
                {left ? timer : null}
                {svg}
                {left ? null : timer}
            </div>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        const accent = this.state.rxData.accent || '#33c1cf';
        const noCard = this.state.rxData.noCard === true;
        const t = (k: string): string => FeederStatus.t(k);

        if (!this.state.rxData.channel) {
            return (
                <div
                    className={`af-card${noCard ? '' : ' af-bg'}`}
                    style={{ '--af-accent': accent } as React.CSSProperties}
                >
                    <div className="af-label">{t('feeder_status')}</div>
                    <div className="af-sub">{t('select_channel_hint')}</div>
                </div>
            );
        }

        const feeding = this.bool('status.feedingActive');
        const blocked = this.bool('status.blocked');
        const endsTs = this.num('status.feedingEndsTs');
        const nextTs = this.num('status.nextFeedingTs');
        const dyn = this.bool('settings.dynamicEnabled');
        const error = this.bool('status.error');
        const now = Date.now();

        let countdown = '—';
        if (nextTs && nextTs > now) {
            const mins = Math.max(0, Math.ceil((nextTs - now) / 60000));
            countdown =
                mins >= 60
                    ? `${Math.floor(mins / 60)} h ${`0${mins % 60}`.slice(-2)} min`
                    : `${t('in_about')} ${mins} min`;
        }

        const styleVars = {
            '--af-accent': accent,
            '--af-accent-a': `${accent}8c`,
            '--af-accent-b': `${accent}1a`,
        } as React.CSSProperties;

        return (
            <div
                className={`af-card${noCard ? '' : ' af-bg'}`}
                style={styleVars}
            >
                <div className="af-label">
                    {t('status')}
                    <span className={`af-pill ${blocked ? 'af-pill--warn' : 'af-pill--good'}`}>
                        {blocked ? `● ${t('blocked')}` : `● ${t('ready')}`}
                    </span>
                </div>

                {this.renderGraphic(accent, feeding, endsTs)}

                <div className="af-lower">
                    <div className="af-sub">{t('next_feeding')}</div>
                    <div className="af-count">{countdown}</div>
                    <div className="af-sub">
                        {t('at')} <b>{this.hhmm(this.str('status.nextFeeding'))}</b> {t('oclock')} ·{' '}
                        {dyn ? t('dynamic_interval') : t('schedule')}
                    </div>
                    <div className="af-div" />
                    <div className="af-row">
                        <span className="k">{t('last_feeding')}</span>
                        <span className="v">
                            {this.hhmm(this.str('status.lastFeeding'))}{' '}
                            <span style={{ color: error ? '#f44336' : '#4caf50' }}>{error ? '✗' : '✓'}</span>
                        </span>
                    </div>
                    <div className="af-row">
                        <span className="k">{t('result')}</span>
                        <span
                            className="v"
                            style={{ color: error ? '#f44336' : '#4caf50', maxWidth: '62%' }}
                        >
                            {this.str('status.lastResult') || '–'}
                        </span>
                    </div>
                    <div className="af-row">
                        <span className="k">{t('astro_window')}</span>
                        <span className="v">
                            {this.hhmm(this.str('status.sunrise'))} – {this.hhmm(this.str('status.sunset'))}
                        </span>
                    </div>
                    {blocked ? (
                        <div className="af-row">
                            <span className="k">{t('reason')}</span>
                            <span
                                className="v"
                                style={{ color: '#f1c40f', maxWidth: '62%' }}
                            >
                                {this.str('status.blockReason') || '–'}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}
