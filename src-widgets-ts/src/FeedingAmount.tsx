import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import FeederWidgetBase, { type FeederBaseRxData, type FeederBaseState } from './FeederWidgetBase';
import { feederCommonGroup } from './common';

interface FeedingAmountRxData extends FeederBaseRxData {
    accent: string;
    noCard: boolean;
}

/**
 * Display widget for the adapter's feeding-amount model (Phase A advisory / Phase B control) of one
 * switch: recommended daily ration, the temperature-derived percentage, the estimated total weight
 * and — in control mode — the per-feeding portion and motor run-times. Read-only; the model's inputs
 * are edited in the admin or in the FeedingAmountSettings widget. Mirrors lib/feeding-amount.js.
 */
export default class FeedingAmount extends FeederWidgetBase<FeedingAmountRxData, FeederBaseState> {
    static adapter: string;

    // eslint-disable-next-line class-methods-use-this
    protected relIds(): string[] {
        return [
            'status.fishTotalWeight',
            'status.feedPercentToday',
            'status.feedTargetGramsToday',
            'status.feedingsPerDayToday',
            'status.feedTargetPortionGrams',
            'status.feedTargetSecondsToday',
            'status.feedEffectiveDurationSec',
            'status.activeFeedName',
            'status.activeFeedSize',
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
        const feed = this.str('status.activeFeedName');
        const feedSize = this.num('status.activeFeedSize');

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

        const control = (dailySec !== null && dailySec > 0) || (perFeedingSec !== null && perFeedingSec > 0);
        // exact values from the adapter (v1.16.0+); fall back to a derivation for older adapters
        const feedingsDp = this.num('status.feedingsPerDayToday');
        const portionDp = this.num('status.feedTargetPortionGrams');
        const feedings =
            feedingsDp !== null ? feedingsDp : control && perFeedingSec ? Math.round(dailySec! / perFeedingSec) : null;
        const portion =
            portionDp !== null ? portionDp : grams !== null && feedings && feedings > 0 ? grams / feedings : null;

        const r = (n: number | null, d = 0): string =>
            n === null ? '–' : String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d));

        return (
            <div
                className={`af-card${noCard ? '' : ' af-bg'}`}
                style={styleVars}
            >
                <div className="af-label">
                    <span>{t('feeding_amount')}</span>
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
                        {this.tile(t('next_portion'), r(portion, portion !== null && portion < 10 ? 1 : 0), 'g', true)}
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
                        {this.tile(t('next_portion'), r(portion, portion !== null && portion < 10 ? 1 : 0), 'g', true)}
                    </div>
                )}

                <div className="af-row">
                    <span className="k">{feed ? t('feed') : control ? t('runtime_day') : t('total_weight')}</span>
                    <span className="v">
                        {feed ? (
                            <>
                                <b>{feed}</b>
                                {feedSize ? <> · {feedSize} mm</> : null}
                                {feedings ? <> · {feedings}×</> : null}
                            </>
                        ) : control ? (
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
