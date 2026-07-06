import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

import { injectStyles } from './styles';
import { channelOf, feederCommonGroup } from './common';

const SUB_IDS = ['status.pauseManual', 'status.feedingActive'];

interface FeedControlRxData {
    instance: string;
    switchId: string;
    accent: string;
    noCard: boolean;
    maxDuration: number;
    showPause: boolean;
}

interface FeedControlState extends VisRxWidgetState {
    fv: Record<string, ioBroker.StateValue | null>;
    dur: number;
    armed: boolean;
    fired: boolean;
}

export default class FeedControl extends (window.visRxWidget as typeof VisRxWidget)<
    FeedControlRxData,
    FeedControlState
> {
    static adapter: string;
    private subscribedIds: string[] = [];
    private mounted = false;
    private armTimer: ReturnType<typeof setTimeout> | null = null;
    private firedTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = {
            ...this.state,
            fv: {},
            dur: 5,
            armed: false,
            fired: false,
        };
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplAutomaticFeederControl',
            visSet: 'vis-2-widgets-automatic-feeder',
            visName: 'FeedControl',
            visAttrs: [
                feederCommonGroup(),
                {
                    name: 'style',
                    label: 'group_style',
                    fields: [
                        { name: 'accent', type: 'color', label: 'accent', default: '#33c1cf' },
                        { name: 'maxDuration', type: 'number', label: 'max_duration', default: 30, min: 1, max: 3600 },
                        { name: 'showPause', type: 'checkbox', label: 'show_pause', default: true },
                        { name: 'noCard', type: 'checkbox', label: 'no_card', default: false },
                    ],
                },
            ],
            visDefaultStyle: { width: 300, height: 240 },
            visPrev: 'widgets/vis-2-widgets-automatic-feeder/img/vis-2-widgets-automatic-feeder.svg',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return FeedControl.getWidgetInfo();
    }

    static getI18nPrefix(): string {
        return `${FeedControl.adapter}_`;
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.mounted = true;
        injectStyles();
        void this.subscribeFeeder();
    }

    componentWillUnmount(): void {
        this.mounted = false;
        if (this.armTimer) {
            clearTimeout(this.armTimer);
        }
        if (this.firedTimer) {
            clearTimeout(this.firedTimer);
        }
        this.unsubscribeFeeder();
        super.componentWillUnmount();
    }

    onRxDataChanged(): void {
        void this.subscribeFeeder();
    }

    private channelIds(): string[] {
        const ch = channelOf(this.state.rxData);
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
        const ch = channelOf(this.state.rxData);
        const key = ch && id.startsWith(`${ch}.`) ? id.substring(ch.length + 1) : id;
        this.setState(s => ({ fv: { ...s.fv, [key]: state ? state.val : null } }));
    }

    private write(sub: string, val: ioBroker.StateValue): void {
        const ch = channelOf(this.state.rxData);
        if (!ch) {
            return;
        }
        void this.props.context.socket.setState(`${ch}.${sub}`, val, false);
    }

    private onFeedClick = (): void => {
        if (this.state.armed) {
            // second click -> trigger
            if (this.armTimer) {
                clearTimeout(this.armTimer);
                this.armTimer = null;
            }
            this.write('feedFor', this.state.dur);
            this.setState({ armed: false, fired: true });
            this.firedTimer = setTimeout(() => this.mounted && this.setState({ fired: false }), 2500);
        } else {
            // first click -> arm confirmation
            this.setState({ armed: true, fired: false });
            this.armTimer = setTimeout(() => this.mounted && this.setState({ armed: false }), 4000);
        }
    };

    private onPauseChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.write('settings.pauseNow', e.target.checked);
    };

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        const accent = this.state.rxData.accent || '#33c1cf';
        const noCard = this.state.rxData.noCard === true;
        const showPause = this.state.rxData.showPause !== false;
        const max = Number(this.state.rxData.maxDuration) || 30;
        const t = (k: string): string => FeedControl.t(k);
        const styleVars = { '--af-accent': accent } as React.CSSProperties;

        if (!channelOf(this.state.rxData)) {
            return (
                <div
                    className={`af-card${noCard ? '' : ' af-bg'}`}
                    style={styleVars}
                >
                    <div className="af-label">{t('feed_control')}</div>
                    <div className="af-sub">{t('select_channel_hint')}</div>
                </div>
            );
        }

        const paused = this.state.fv['status.pauseManual'] === true;
        const btnLabel = this.state.fired
            ? t('triggered')
            : this.state.armed
              ? `${t('confirm')}: ${this.state.dur} s ?`
              : t('feed_now');

        return (
            <div
                className={`af-card${noCard ? '' : ' af-bg'}`}
                style={styleVars}
            >
                <div className="af-label">{t('control')}</div>

                <button
                    type="button"
                    className="af-btn"
                    onClick={this.onFeedClick}
                >
                    {btnLabel}
                </button>

                <div className="af-row">
                    <span className="k">{t('portion')}</span>
                    <span className="v">{this.state.dur} s</span>
                </div>
                <input
                    className="af-slider"
                    type="range"
                    min={1}
                    max={max}
                    value={this.state.dur}
                    onChange={e => this.setState({ dur: Number(e.target.value) })}
                />

                {showPause ? (
                    <>
                        <div className="af-div" />
                        <div className="af-toggle">
                            <div>
                                <div className="af-toggle-t">{t('suspend_feeding')}</div>
                                <div className="af-toggle-s">{t('suspend_feeding_hint')}</div>
                            </div>
                            <input
                                className="af-chk"
                                type="checkbox"
                                checked={paused}
                                onChange={this.onPauseChange}
                            />
                        </div>
                    </>
                ) : null}
            </div>
        );
    }
}
