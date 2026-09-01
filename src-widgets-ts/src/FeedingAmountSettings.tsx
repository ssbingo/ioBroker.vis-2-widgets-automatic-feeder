import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo, VisRxWidgetProps } from '@iobroker/types-vis-2';

import FeederWidgetBase, { type FeederBaseRxData, type FeederBaseState } from './FeederWidgetBase';
import { feederCommonGroup, instanceNumber, readFeedProfiles } from './common';
import FISH_ICONS from './fishIcons';

interface FASRxData extends FeederBaseRxData {
    noCard: boolean;
}

interface FASState extends FeederBaseState {
    /** local edit buffer: settings.* only update after an adapter restart, so keep typing responsive */
    ed: Record<string, number | boolean | string>;
    profiles: { name: string; gramsPerSec: number }[];
}

const FISH_SIZES = [15, 20, 30, 40, 50, 60];
const WEIGHT: Record<number, number> = { 15: 60, 20: 125, 30: 350, 40: 1000, 50: 2000, 60: 4000 };
const TEMP_BANDS: { key: string; label: string }[] = [
    { key: 'feedPctBelow15', label: '<15°' },
    { key: 'feedPct15', label: '15–18°' },
    { key: 'feedPct18', label: '18–21°' },
    { key: 'feedPct21', label: '21–23°' },
    { key: 'feedPct23', label: '23–28°' },
    { key: 'feedPct28', label: '28–30°' },
    { key: 'feedPct30', label: '>30°' },
];
const BOOL_KEYS = new Set(['amountModelEnabled', 'amountControlEnabled']);
const SETTING_KEYS = [
    'amountModelEnabled',
    'amountControlEnabled',
    'feedDailyMaxGrams',
    'activeFeed',
    ...FISH_SIZES.map(s => `fishCount${s}`),
    ...TEMP_BANDS.map(b => b.key),
];

/**
 * Editor widget for the adapter's feeding-amount model: fish counts (with icons), temperature
 * percentages, the Phase-A/B switches, the daily cap and a feed switcher (feed profiles). All
 * inputs write to the adapter's writable `switches.<id>.settings.*` states. Feed profiles are
 * defined in the adapter admin; this widget switches the active one via `settings.activeFeed`.
 */
export default class FeedingAmountSettings extends FeederWidgetBase<FASRxData, FASState> {
    static adapter: string;

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, ed: {}, profiles: [] };
    }

    // eslint-disable-next-line class-methods-use-this
    protected relIds(): string[] {
        return SETTING_KEYS.map(k => `settings.${k}`);
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplAutomaticFeederAmountSettings',
            visSet: 'vis-2-widgets-automatic-feeder',
            visName: 'FeedingAmountSettings',
            visAttrs: [
                feederCommonGroup(),
                {
                    name: 'style',
                    label: 'group_style',
                    fields: [{ name: 'noCard', type: 'checkbox', label: 'no_card', default: false }],
                },
            ],
            visDefaultStyle: { width: 470, height: 620 },
            visPrev: 'widgets/vis-2-widgets-automatic-feeder/img/vis-2-widgets-automatic-feeder.svg',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return FeedingAmountSettings.getWidgetInfo();
    }

    static getI18nPrefix(): string {
        return `${FeedingAmountSettings.adapter}_`;
    }

    componentDidMount(): void {
        super.componentDidMount();
        void this.loadProfiles();
    }

    onRxDataChanged(): void {
        super.onRxDataChanged();
        this.setState({ ed: {}, profiles: [] });
        void this.loadProfiles();
    }

    private async loadProfiles(): Promise<void> {
        const sid = this.state.rxData.switchId;
        if (!sid) {
            return;
        }
        const profiles = await readFeedProfiles(
            this.props.context.socket,
            instanceNumber(this.state.rxData),
            String(sid),
        );
        if (this.fMounted) {
            this.setState({ profiles });
        }
    }

    // seed the edit buffer from incoming settings values the user has not touched yet
    protected applyState(id: string, state: ioBroker.State | null | undefined): void {
        super.applyState(id, state);
        const ch = this.channel();
        const prefix = `${ch}.settings.`;
        if (!ch || !id.startsWith(prefix)) {
            return;
        }
        const key = id.substring(prefix.length);
        if (key in this.state.ed) {
            return;
        }
        const v = state ? state.val : null;
        let val: number | boolean | string;
        if (BOOL_KEYS.has(key)) {
            val = v === true;
        } else if (key === 'feedDailyMaxGrams') {
            val = v === null || v === undefined || v === '' ? '' : Number(v);
        } else {
            val = v === null || v === undefined || v === '' ? 0 : Number(v);
        }
        this.setState(s => ({ ed: { ...s.ed, [key]: val } }));
    }

    private setEd(key: string, val: number | boolean | string): void {
        this.setState(s => ({ ed: { ...s.ed, [key]: val } }));
    }

    private edNum(key: string, dflt: number): number {
        const v = this.state.ed[key];
        if (v === undefined) {
            const n = this.num(`settings.${key}`);
            return n === null ? dflt : n;
        }
        return typeof v === 'number' ? v : Number(v) || 0;
    }

    private edBool(key: string): boolean {
        const v = this.state.ed[key];
        return v === undefined ? this.bool(`settings.${key}`) : v === true;
    }

    private writeBool(key: string, checked: boolean): void {
        this.setEd(key, checked);
        this.write(`settings.${key}`, checked);
    }

    private writeNum(key: string, raw: string, integer: boolean): void {
        let v = raw === '' ? 0 : Number(raw);
        if (!Number.isFinite(v) || v < 0) {
            v = 0;
        }
        if (integer) {
            v = Math.floor(v);
        }
        this.setEd(key, v);
        this.write(`settings.${key}`, v);
    }

    private writeCap(raw: string): void {
        if (raw === '') {
            this.setEd('feedDailyMaxGrams', '');
            this.write('settings.feedDailyMaxGrams', null);
            return;
        }
        const v = Math.max(0, Number(raw) || 0);
        this.setEd('feedDailyMaxGrams', v);
        this.write('settings.feedDailyMaxGrams', v);
    }

    private setActiveFeed(i: number): void {
        this.setEd('activeFeed', i);
        this.write('settings.activeFeed', i);
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const t = (k: string): string => FeedingAmountSettings.t(k);
        // match the vis-2 colour mode like the other widgets (dark / light)
        const dark = this.props.context.themeType === 'dark';
        const noCard = this.state.rxData.noCard === true;
        const cardCls = `fas-card${dark ? ' fas-dark' : ''}${noCard ? ' fas-flat' : ''}`;

        if (!this.channel()) {
            return (
                <div className={cardCls}>
                    <div className="fas-title">{t('feeding_amount')}</div>
                    <div className="fas-note">{t('select_channel_hint')}</div>
                </div>
            );
        }

        const modelOn = this.edBool('amountModelEnabled');
        const controlOn = this.edBool('amountControlEnabled');
        const activeFeed = this.edNum('activeFeed', 0);
        const profiles = this.state.profiles;

        const totalG = FISH_SIZES.reduce((sum, s) => sum + this.edNum(`fishCount${s}`, 0) * WEIGHT[s], 0);

        return (
            <div className={cardCls}>
                <div className="fas-title">{t('feeding_amount')}</div>

                <div className="fas-switch">
                    <span className="lab">
                        {t('model_enabled')}
                        <small>{t('advisory_hint')}</small>
                    </span>
                    <input
                        className="fas-tgl"
                        type="checkbox"
                        checked={modelOn}
                        onChange={e => this.writeBool('amountModelEnabled', e.target.checked)}
                    />
                </div>
                <div className="fas-note">{t('settings_write_hint')}</div>

                <div className={modelOn ? '' : 'fas-off'}>
                    <div className="fas-h">{t('fish_counts')}</div>
                    <div className="fas-fishlist">
                        {FISH_SIZES.map(s => {
                            const cnt = this.edNum(`fishCount${s}`, 0);
                            return (
                                <div
                                    className="fas-fish"
                                    key={s}
                                >
                                    <div className="fas-fico">
                                        <img
                                            src={FISH_ICONS[s]}
                                            alt=""
                                        />
                                    </div>
                                    <div className="fas-flab">
                                        {s} cm
                                        <small>≈ {WEIGHT[s]} g</small>
                                    </div>
                                    <input
                                        className="fas-cnt"
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={String(cnt)}
                                        onChange={e => this.writeNum(`fishCount${s}`, e.target.value, true)}
                                    />
                                    <span className="fas-sub">{cnt * WEIGHT[s]} g</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="fas-total">
                        <span className="k">{t('total_weight')}</span>
                        <span className="v">{Math.round(totalG / 100) / 10} kg</span>
                    </div>

                    {profiles.length ? (
                        <>
                            <div className="fas-h">{t('active_feed')}</div>
                            <div className="fas-seg">
                                {profiles.map((p, i) => (
                                    <button
                                        type="button"
                                        key={i}
                                        className={activeFeed === i ? 'on' : ''}
                                        onClick={() => this.setActiveFeed(i)}
                                    >
                                        <span className="fn">{p.name || `#${i + 1}`}</span>
                                        <span className="fm">{p.gramsPerSec} g/s</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : null}

                    <div className="fas-h">{t('temp_percents')}</div>
                    <div className="fas-tiers">
                        {TEMP_BANDS.map(b => (
                            <div
                                className="fas-tier"
                                key={b.key}
                            >
                                <span>{b.label}</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                    value={String(this.edNum(b.key, 0))}
                                    onChange={e => this.writeNum(b.key, e.target.value, false)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="fas-h">{t('control_phase_b')}</div>
                    <div className="fas-switch">
                        <span className="lab">
                            {t('control_enabled')}
                            <small>{t('control_hint')}</small>
                        </span>
                        <input
                            className="fas-tgl"
                            type="checkbox"
                            checked={controlOn}
                            onChange={e => this.writeBool('amountControlEnabled', e.target.checked)}
                        />
                    </div>
                    {controlOn ? (
                        <div className="fas-ctl">
                            <label htmlFor="fas-cap">{t('daily_max')}</label>
                            <input
                                id="fas-cap"
                                className="fas-in"
                                type="number"
                                min={0}
                                step={1}
                                placeholder={t('off')}
                                value={
                                    this.state.ed.feedDailyMaxGrams === undefined
                                        ? (this.num('settings.feedDailyMaxGrams') ?? '')
                                        : String(this.state.ed.feedDailyMaxGrams)
                                }
                                onChange={e => this.writeCap(e.target.value)}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}
