import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps } from '@iobroker/types-vis-2';

import FeederWidgetBase, { type FeederBaseRxData, type FeederBaseState } from './FeederWidgetBase';
import { feederCommonGroup } from './common';

interface FeedingAmountRxData extends FeederBaseRxData {
    accent: string;
    editable: boolean;
    noCard: boolean;
}

interface FeedingAmountState extends FeederBaseState {
    editing: boolean;
    /** local edit buffer so typing/toggling stays responsive (settings.* only update after a restart) */
    ed: Record<string, number | boolean>;
}

/** Fish size classes (cm) and the temperature bands, matching the adapter's feeding-amount model. */
const FISH_SIZES = [15, 20, 30, 40, 50, 60];
const TEMP_BANDS: { key: string; label: string }[] = [
    { key: 'feedPctBelow15', label: '<15 °C' },
    { key: 'feedPct15', label: '15–18' },
    { key: 'feedPct18', label: '18–21' },
    { key: 'feedPct21', label: '21–23' },
    { key: 'feedPct23', label: '23–28' },
    { key: 'feedPct28', label: '28–30' },
    { key: 'feedPct30', label: '>30 °C' },
];
const SETTING_IDS = [
    'settings.amountModelEnabled',
    'settings.amountControlEnabled',
    'settings.dispenseGramsPerSec',
    ...FISH_SIZES.map(s => `settings.fishCount${s}`),
    ...TEMP_BANDS.map(b => `settings.${b.key}`),
];

/**
 * Displays the adapter's feeding-amount model (Phase A advisory / Phase B control) for one switch
 * and — via an edit toggle — lets the user change the model inputs (fish counts, temperature
 * percentages, the Phase-A/B switches and the dispense rate), writing to the adapter's writable
 * `switches.<id>.settings.*` states. Mirrors lib/feeding-amount.js.
 */
export default class FeedingAmount extends FeederWidgetBase<FeedingAmountRxData, FeedingAmountState> {
    static adapter: string;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, editing: false, ed: {} };
    }

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
            ...SETTING_IDS,
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
                        { name: 'editable', type: 'checkbox', label: 'editable', default: true },
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

    // snapshot the current settings values into the local edit buffer, then open the editor
    private openEditor = (): void => {
        const ed: Record<string, number | boolean> = {
            amountModelEnabled: this.bool('settings.amountModelEnabled'),
            amountControlEnabled: this.bool('settings.amountControlEnabled'),
            dispenseGramsPerSec: this.num('settings.dispenseGramsPerSec') ?? 0,
        };
        for (const s of FISH_SIZES) {
            ed[`fishCount${s}`] = this.num(`settings.fishCount${s}`) ?? 0;
        }
        for (const b of TEMP_BANDS) {
            ed[b.key] = this.num(`settings.${b.key}`) ?? 0;
        }
        this.setState({ editing: true, ed });
    };

    private closeEditor = (): void => {
        this.setState({ editing: false });
    };

    private setEditNum(key: string, raw: string, integer: boolean): void {
        let v = raw === '' ? 0 : Number(raw);
        if (!Number.isFinite(v) || v < 0) {
            v = 0;
        }
        if (integer) {
            v = Math.floor(v);
        }
        this.setState(s => ({ ed: { ...s.ed, [key]: v } }));
        this.write(`settings.${key}`, v);
    }

    private setEditBool(key: string, checked: boolean): void {
        this.setState(s => ({ ed: { ...s.ed, [key]: checked } }));
        this.write(`settings.${key}`, checked);
    }

    private renderEditor(t: (k: string) => string, noCard: boolean, styleVars: React.CSSProperties): React.JSX.Element {
        const ed = this.state.ed;
        const numField = (key: string, label: string, integer: boolean, step: number): React.JSX.Element => (
            <label
                className="af-fld"
                key={key}
            >
                <span>{label}</span>
                <input
                    className="af-num"
                    type="number"
                    min={0}
                    step={step}
                    value={String(ed[key] ?? 0)}
                    onChange={e => this.setEditNum(key, e.target.value, integer)}
                />
            </label>
        );
        return (
            <div
                className={`af-card${noCard ? '' : ' af-bg'}`}
                style={styleVars}
            >
                <div className="af-label">
                    <span>{t('feeding_amount')}</span>
                    <button
                        type="button"
                        className="af-editlink"
                        onClick={this.closeEditor}
                    >
                        {t('done')} ✓
                    </button>
                </div>
                <div className="af-ed">
                    <div className="af-toggle">
                        <div className="af-toggle-t">{t('model_enabled')}</div>
                        <input
                            className="af-chk"
                            type="checkbox"
                            checked={ed.amountModelEnabled === true}
                            onChange={e => this.setEditBool('amountModelEnabled', e.target.checked)}
                        />
                    </div>
                    <div className="af-toggle">
                        <div className="af-toggle-t">{t('control_enabled')}</div>
                        <input
                            className="af-chk"
                            type="checkbox"
                            checked={ed.amountControlEnabled === true}
                            onChange={e => this.setEditBool('amountControlEnabled', e.target.checked)}
                        />
                    </div>

                    <div className="af-edsec">{t('fish_counts')}</div>
                    <div className="af-grid">{FISH_SIZES.map(s => numField(`fishCount${s}`, `${s} cm`, true, 1))}</div>

                    <div className="af-edsec">{t('temp_percents')}</div>
                    <div className="af-grid">{TEMP_BANDS.map(b => numField(b.key, b.label, false, 0.1))}</div>

                    {ed.amountControlEnabled === true ? (
                        <>
                            <div className="af-edsec">{t('dispense_rate')}</div>
                            <div
                                className="af-grid"
                                style={{ gridTemplateColumns: 'minmax(80px,140px)' }}
                            >
                                {numField('dispenseGramsPerSec', 'g/s', false, 0.1)}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        );
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const accent = this.state.rxData.accent || '#f2a63c';
        const noCard = this.state.rxData.noCard === true;
        const editable = this.state.rxData.editable !== false;
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

        if (this.state.editing) {
            return this.renderEditor(t, noCard, styleVars);
        }

        const weight = this.num('status.fishTotalWeight');
        const pct = this.num('status.feedPercentToday');
        const grams = this.num('status.feedTargetGramsToday');
        const dailySec = this.num('status.feedTargetSecondsToday');
        const perFeedingSec = this.num('status.feedEffectiveDurationSec');

        const editLink = editable ? (
            <button
                type="button"
                className="af-editlink"
                onClick={this.openEditor}
            >
                ✎ {t('edit')}
            </button>
        ) : null;

        // model off/inactive: adapter clears weight to 0 and percent/grams to null
        const active = grams !== null || pct !== null || (weight !== null && weight > 0);
        if (!active) {
            return (
                <div
                    className={`af-card${noCard ? '' : ' af-bg'}`}
                    style={styleVars}
                >
                    <div className="af-label">
                        <span>{t('feeding_amount')}</span>
                        {editLink}
                    </div>
                    <div className="af-sub">{t('amount_model_off')}</div>
                </div>
            );
        }

        // control mode (Phase B) is inferred from the run-time states the adapter only fills then
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
                    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`af-pill ${control ? 'af-pill--warn' : ''}`}>
                            {control ? t('controls_feeding') : t('advisory')}
                        </span>
                        {editLink}
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
