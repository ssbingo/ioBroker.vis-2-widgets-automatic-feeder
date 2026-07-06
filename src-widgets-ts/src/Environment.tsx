import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps } from '@iobroker/types-vis-2';

import FeederWidgetBase, { type FeederBaseRxData, type FeederBaseState } from './FeederWidgetBase';
import { feederCommonGroup } from './common';

interface EnvironmentRxData extends FeederBaseRxData {
    accent: string;
    noCard: boolean;
}

export default class Environment extends FeederWidgetBase<EnvironmentRxData, FeederBaseState> {
    static adapter: string;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.tickMs = 60000; // move the "now" marker on the day bar
    }

    // eslint-disable-next-line class-methods-use-this
    protected relIds(): string[] {
        return [
            'status.waterTemperature',
            'status.waterTemperatureDeep',
            'status.waterStratification',
            'status.oxygen',
            'status.sunrise',
            'status.sunset',
            'status.sunriseTs',
            'status.sunsetTs',
            'settings.o2Min',
        ];
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplAutomaticFeederEnvironment',
            visSet: 'vis-2-widgets-automatic-feeder',
            visName: 'Environment',
            visAttrs: [
                feederCommonGroup(),
                {
                    name: 'style',
                    label: 'group_style',
                    fields: [
                        { name: 'accent', type: 'color', label: 'accent', default: '#33c1cf' },
                        { name: 'noCard', type: 'checkbox', label: 'no_card', default: false },
                    ],
                },
            ],
            visDefaultStyle: { width: 320, height: 220 },
            visPrev: 'widgets/vis-2-widgets-automatic-feeder/img/vis-2-widgets-automatic-feeder.svg',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return Environment.getWidgetInfo();
    }

    static getI18nPrefix(): string {
        return `${Environment.adapter}_`;
    }

    private f1(key: string): string {
        const n = this.num(key);
        return n === null ? '–' : String(Math.round(n * 10) / 10);
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const accent = this.state.rxData.accent || '#33c1cf';
        const noCard = this.state.rxData.noCard === true;
        const t = (k: string): string => Environment.t(k);
        const styleVars = { '--af-accent': accent } as React.CSSProperties;

        if (!this.channel()) {
            return (
                <div
                    className={`af-card${noCard ? '' : ' af-bg'}`}
                    style={styleVars}
                >
                    <div className="af-label">{t('environment')}</div>
                    <div className="af-sub">{t('select_channel_hint')}</div>
                </div>
            );
        }

        const strat = this.num('status.waterStratification');
        const o2 = this.num('status.oxygen');
        const o2Min = this.num('settings.o2Min');
        const rise = this.num('status.sunriseTs') || 0;
        const set = this.num('status.sunsetTs') || 0;
        const now = Date.now();
        const showMarker = set > rise && rise > 0;
        const markerLeft = showMarker ? Math.min(100, Math.max(0, ((now - rise) / (set - rise)) * 100)) : 0;

        return (
            <div
                className={`af-card${noCard ? '' : ' af-bg'}`}
                style={styleVars}
            >
                <div className="af-label">{t('environment')}</div>
                <div className="af-tiles">
                    <div className="af-tile">
                        <div className="t">{t('water_shallow')}</div>
                        <div className="n">
                            {this.f1('status.waterTemperature')}
                            <small> °C</small>
                        </div>
                    </div>
                    <div className="af-tile">
                        <div className="t">{t('water_deep')}</div>
                        <div className="n">
                            {this.f1('status.waterTemperatureDeep')}
                            <small> °C</small>
                        </div>
                    </div>
                </div>
                <div className="af-strip">
                    <span
                        className={`af-pill ${strat !== null && Math.abs(strat) > 3 ? 'af-pill--warn' : 'af-pill--good'}`}
                    >
                        {t('stratification')} Δ {this.f1('status.waterStratification')} K
                    </span>
                    {o2 !== null ? (
                        <span className={`af-pill ${o2Min !== null && o2 < o2Min ? 'af-pill--crit' : 'af-pill--good'}`}>
                            O₂ {this.f1('status.oxygen')} mg/l
                        </span>
                    ) : null}
                </div>
                <div className="af-astro">
                    <div className="af-astro-bar">
                        {showMarker ? (
                            <div
                                className="af-astro-now"
                                style={{ left: `${markerLeft}%` }}
                            />
                        ) : null}
                    </div>
                    <div className="af-astro-lbl">
                        <span>☀ {this.hhmm(this.str('status.sunrise'))}</span>
                        <span>{this.hhmm(this.str('status.sunset'))} ☾</span>
                    </div>
                </div>
            </div>
        );
    }
}
