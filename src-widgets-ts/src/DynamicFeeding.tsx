import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import FeederWidgetBase, { type FeederBaseRxData, type FeederBaseState } from './FeederWidgetBase';
import { feederCommonGroup } from './common';

interface DynamicFeedingRxData extends FeederBaseRxData {
    accent: string;
    noCard: boolean;
}

export default class DynamicFeeding extends FeederWidgetBase<DynamicFeedingRxData, FeederBaseState> {
    static adapter: string;

    // eslint-disable-next-line class-methods-use-this
    protected relIds(): string[] {
        return [
            'settings.dynamicEnabled',
            'settings.dynamicSource',
            'status.dynamicAvgTemperature',
            'status.dynamicRate',
            'status.dynamicIntervalMin',
            'status.dynamicDurationSec',
        ];
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplAutomaticFeederDynamic',
            visSet: 'vis-2-widgets-automatic-feeder',
            visName: 'DynamicFeeding',
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
            visDefaultStyle: { width: 460, height: 150 },
            visPrev: 'widgets/vis-2-widgets-automatic-feeder/img/vis-2-widgets-automatic-feeder.svg',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return DynamicFeeding.getWidgetInfo();
    }

    static getI18nPrefix(): string {
        return `${DynamicFeeding.adapter}_`;
    }

    // eslint-disable-next-line class-methods-use-this
    private tile(label: string, value: string, unit: string, color?: string): React.JSX.Element {
        return (
            <div className="af-tile">
                <div className="t">{label}</div>
                <div
                    className="n"
                    style={color ? { color } : undefined}
                >
                    {value}
                    <small> {unit}</small>
                </div>
            </div>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const accent = this.state.rxData.accent || '#33c1cf';
        const noCard = this.state.rxData.noCard === true;
        const t = (k: string): string => DynamicFeeding.t(k);
        const styleVars = { '--af-accent': accent } as React.CSSProperties;

        if (!this.channel()) {
            return (
                <div
                    className={`af-card${noCard ? '' : ' af-bg'}`}
                    style={styleVars}
                >
                    <div className="af-label">{t('dynamic_feeding')}</div>
                    <div className="af-sub">{t('select_channel_hint')}</div>
                </div>
            );
        }

        const enabled = this.bool('settings.dynamicEnabled');
        const source = this.str('settings.dynamicSource') === 'air' ? t('source_air') : t('source_water');
        const avg = this.num('status.dynamicAvgTemperature');
        const rate = this.num('status.dynamicRate');
        const interval = this.num('status.dynamicIntervalMin');
        const dur = this.num('status.dynamicDurationSec');
        const f = (n: number | null, d = 1): string =>
            n === null ? '–' : String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d));

        return (
            <div
                className={`af-card${noCard ? '' : ' af-bg'}`}
                style={styleVars}
            >
                <div className="af-label">
                    {t('dynamic_feeding')} · {t('q10_model')}
                    <span
                        className="af-pill"
                        style={{ background: 'rgba(255,255,255,.08)', color: '#9aa3b0' }}
                    >
                        {t('source')}: {source}
                    </span>
                </div>
                {enabled ? (
                    <div className="af-tiles af-tiles--4">
                        {this.tile(t('avg_temp'), f(avg), '°C', accent)}
                        {this.tile(t('rate'), f(rate, 2), '×')}
                        {this.tile(t('interval'), f(interval, 0), 'min')}
                        {this.tile(t('portion_short'), f(dur, 0), 's')}
                    </div>
                ) : (
                    <div className="af-sub">{t('dynamic_off')}</div>
                )}
            </div>
        );
    }
}
