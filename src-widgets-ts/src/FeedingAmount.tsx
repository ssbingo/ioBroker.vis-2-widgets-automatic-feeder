import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import FeederWidgetBase, { type FeederBaseRxData, type FeederBaseState } from './FeederWidgetBase';
import { feederCommonGroup } from './common';

interface FeedingAmountRxData extends FeederBaseRxData {
    accent: string;
    noCard: boolean;
}

/**
 * Displays the adapter's feeding-amount model (Phase A advisory / Phase B control) for one switch:
 * estimated total fish weight, the temperature-derived feeding percentage, the recommended daily
 * ration and — in control mode — the resulting per-feeding portion and motor run-times. Read-only;
 * the model's inputs live in the adapter config. Mirrors lib/feeding-amount.js.
 */
export default class FeedingAmount extends FeederWidgetBase<FeedingAmountRxData, FeederBaseState> {
    static adapter: string;

    // eslint-disable-next-line class-methods-use-this
    protected relIds(): string[] {
        return [
            'status.fishTotalWeight',
            'status.feedPercentToday',
            'status.feedTargetGramsToday',
            'status.feedTargetSecondsToday',
            'status.feedEffectiveDurationSec',
        ];
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplAutomaticFeederAmount',
            visSet: 'vis-2-widgets-automatic-feeder',
            visName: 'FeedingAmount',
            visAttrs: [
                feederCommonGroup(),
                {
                    name: 'style',
                    label: 'group_style',
                    fields: [
                        { name: 'accent', type: 'color', label: 'accent', default: '#f2a63c' },
                        { name: 'noCard', type: 'checkbox', label: 'no_card', default: false },
                    ],
                },
            ],
            visDefaultStyle: { width: 460, height: 190 },
            visPrev: 'widgets/vis-2-widgets-automatic-feeder/img/vis-2-widgets-automatic-feeder.svg',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return FeedingAmount.getWidgetInfo();
    }

    static getI18nPrefix(): string {
        return `${FeedingAmount.adapter}_`;
    }

    // eslint-disable-next-line class-methods-use-this
    private tile(label: string, value: string, unit: string, hi?: boolean): React.JSX.Element {
        return (
            <div className="af-tile">
                <div className="t">{label}</div>
                <div
                    className="n"
                    style={hi ? { color: 'var(--af-accent)' } : undefined}
                >
                    {value}
                    <small> {unit}</small>
                </div>
            </div>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const accent = this.state.rxData.accent || '#f2a63c';
        const noCard = this.state.rxData.noCard === true;
        const t = (k: string): string => FeedingAmount.t(k);
        const styleVars = { '--af-accent': accent } as React.CSSProperties;

        if (!this.channel()) {
            return (
                <div
                    className={`af-card${noCard ? '' : ' af-bg'}`}
                    style={styleVars}
                >
                    <div className="af-label">{t('feeding_amount')}</div>
                    <div className="af-sub">{t('select_channel_hint')}</div>
                </div>
            );
        }

        const weight = this.num('status.fishTotalWeight');
        const pct = this.num('status.feedPercentToday');
        const grams = this.num('status.feedTargetGramsToday');
        const dailySec = this.num('status.feedTargetSecondsToday');
        const perFeedingSec = this.num('status.feedEffectiveDurationSec');

        // model off/inactive: adapter clears weight to 0 and percent/grams to null
        const active = grams !== null || pct !== null || (weight !== null && weight > 0);
        if (!active) {
            return (
                <div
                    className={`af-card${noCard ? '' : ' af-bg'}`}
                    style={styleVars}
                >
                    <div className="af-label">{t('feeding_amount')}</div>
                    <div className="af-sub">{t('amount_model_off')}</div>
                </div>
            );
        }

        // control mode (Phase B) is inferred from the run-time states the adapter only fills then
        const control = (dailySec !== null && dailySec > 0) || (perFeedingSec !== null && perFeedingSec > 0);
        const feedings = control && perFeedingSec ? Math.round(dailySec! / perFeedingSec) : null;
        const portion = grams !== null && feedings && feedings > 0 ? grams / feedings : null;

        const r = (n: number | null, d = 0): string =>
            n === null ? '–' : String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d));

        return (
            <div
                className={`af-card${noCard ? '' : ' af-bg'}`}
                style={styleVars}
            >
                <div className="af-label">
                    {t('feeding_amount')}
                    <span className={`af-pill ${control ? 'af-pill--warn' : ''}`}>
                        {control ? t('controls_feeding') : t('advisory')}
                    </span>
                </div>

                <div className="af-count">
                    {r(grams)}
                    <small style={{ fontSize: 14, color: '#9aa3b0', fontWeight: 700 }}> {t('per_day')}</small>
                </div>

                {control ? (
                    <div className="af-tiles af-tiles--4">
                        {this.tile(t('next_portion'), r(portion), 'g', true)}
                        {this.tile(
                            t('duration_each'),
                            r(perFeedingSec, perFeedingSec !== null && perFeedingSec < 10 ? 1 : 0),
                            's',
                        )}
                        {this.tile(t('rate_today'), r(pct, 1), '%')}
                        {this.tile(t('runtime_day'), r(dailySec), 's')}
                    </div>
                ) : (
                    <div className="af-tiles">
                        {this.tile(t('total_weight'), r(weight === null ? null : weight / 1000, 1), 'kg')}
                        {this.tile(t('rate_today'), r(pct, 1), '%')}
                    </div>
                )}

                <div className="af-row">
                    <span className="k">{control ? t('runtime_day') : t('total_weight')}</span>
                    <span className="v">
                        {control ? (
                            <>
                                <b>{feedings ?? '–'}</b> × {t('per_day')}
                            </>
                        ) : (
                            `${r(weight === null ? null : weight / 1000, 1)} kg`
                        )}
                    </span>
                </div>

                {pct === null ? (
                    <div className="af-sub">{t('water_temp_unknown')}</div>
                ) : control && perFeedingSec === 0 && grams !== null && grams > 0 ? (
                    <div
                        className="af-sub"
                        style={{ color: '#f1c40f' }}
                    >
                        {t('rate_not_calibrated')}
                    </div>
                ) : null}
            </div>
        );
    }
}
