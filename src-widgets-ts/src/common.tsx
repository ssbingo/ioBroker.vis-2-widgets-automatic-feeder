import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import type {
    RxWidgetInfoAttributesField,
    RxWidgetInfoCustomComponentProperties,
    WidgetData,
} from '@iobroker/types-vis-2';

const ADAPTER = 'automatic-feeder';

// Minimal structural socket type (avoids the duplicate @iobroker/adapter-react-v5
// copies clashing on LegacyConnection's private members).
type SocketLike = { getObject: (id: string) => Promise<ioBroker.Object | null | undefined> };

interface SwitchDef {
    id: string;
    name: string;
}

/** Extracts the plain instance number from either "0" or "automatic-feeder.0". */
export function instanceNumber(rx: { instance?: string }): string {
    const raw = rx?.instance !== undefined && rx.instance !== '' ? String(rx.instance) : '0';
    return raw.split('.').pop() || '0';
}

/** Builds the switch channel id from the widget data, or '' if the switch is not chosen yet. */
export function channelOf(rx: { instance?: string; switchId?: string }): string {
    const sid = rx?.switchId;
    return sid ? `${ADAPTER}.${instanceNumber(rx)}.switches.${sid}` : '';
}

/** Reads the configured switches (id + friendly name) of a feeder instance. */
async function readSwitches(socket: SocketLike, instance: string): Promise<SwitchDef[]> {
    try {
        const obj = await socket.getObject(`system.adapter.${ADAPTER}.${instance}`);
        const switches = ((obj?.native?.switches as Array<{ id?: string; name?: string }>) || []).filter(
            s => s && s.id,
        );
        return switches.map((s, i) => ({
            id: String(s.id),
            name: (s.name && s.name.trim()) || String(s.id) || `Switch ${i + 1}`,
        }));
    } catch {
        return [];
    }
}

/** A food type from the adapter's central feed list (AdapterConfig.feeds). */
export interface FeedDef {
    id: string;
    name: string;
    vendor: string;
    size: number;
    protein: number;
    fat: number;
    fibre: number;
    ash: number;
    url: string;
}

/**
 * Reads the adapter's central feed list (`native.feeds`, adapter v1.18.0+). Each switch's
 * `settings.activeFeed` references an entry by `id`.
 */
export async function readFeedList(socket: SocketLike, instance: string): Promise<FeedDef[]> {
    try {
        const obj = await socket.getObject(`system.adapter.${ADAPTER}.${instance}`);
        const feeds = (obj?.native?.feeds as Array<Partial<FeedDef>>) || [];
        return feeds
            .filter(f => f && f.id)
            .map(f => ({
                id: String(f.id),
                name: String(f.name ?? ''),
                vendor: String(f.vendor ?? ''),
                size: Number(f.size) || 0,
                protein: Number(f.protein) || 0,
                fat: Number(f.fat) || 0,
                fibre: Number(f.fibre) || 0,
                ash: Number(f.ash) || 0,
                url: String(f.url ?? ''),
            }));
    } catch {
        return [];
    }
}

/** Attribute dropdown that lets the user pick a feeder switch by its friendly name. */
function SwitchSelect(props: {
    socket: SocketLike;
    data: WidgetData;
    onDataChange: (newData: WidgetData) => void;
    label: string;
}): React.JSX.Element {
    const { socket, data, onDataChange, label } = props;
    const [switches, setSwitches] = useState<SwitchDef[]>([]);
    const instance = instanceNumber(data as { instance?: string });

    useEffect(() => {
        let active = true;
        void readSwitches(socket, instance).then(list => active && setSwitches(list));
        return () => {
            active = false;
        };
    }, [socket, instance]);

    const value = (data.switchId as string) || '';

    return (
        <FormControl
            fullWidth
            variant="standard"
            size="small"
        >
            <InputLabel>{label}</InputLabel>
            <Select
                value={switches.some(s => s.id === value) ? value : ''}
                onChange={e => onDataChange({ ...data, switchId: e.target.value })}
            >
                {switches.length ? (
                    switches.map(s => (
                        <MenuItem
                            key={s.id}
                            value={s.id}
                        >
                            {s.name}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem
                        value=""
                        disabled
                    >
                        —
                    </MenuItem>
                )}
            </Select>
        </FormControl>
    );
}

/** The shared "common" attribute group (instance + switch-by-name) used by every feeder widget. */
export function feederCommonGroup(): { name: string; fields: RxWidgetInfoAttributesField[] } {
    return {
        name: 'common',
        fields: [
            {
                name: 'instance',
                type: 'instance',
                label: 'feeder_instance',
                adapter: ADAPTER,
                isShort: true,
                default: '0',
            },
            {
                name: 'switchId',
                type: 'custom',
                label: 'switch',
                component: (
                    field: RxWidgetInfoAttributesField,
                    data: WidgetData,
                    onDataChange: (newData: WidgetData) => void,
                    compProps: RxWidgetInfoCustomComponentProperties,
                ): React.JSX.Element => (
                    <SwitchSelect
                        socket={compProps.context.socket}
                        data={data}
                        onDataChange={onDataChange}
                        label={(field as { label?: string }).label || 'switch'}
                    />
                ),
            },
        ] as RxWidgetInfoAttributesField[],
    };
}

/**
 * Koi water-temperature bands keyed to the biology from the pondpump research
 * (ioBroker.pondpump → doc/research/wassertemperaturen-im-koiteich.md), not a neutral cold→warm
 * gradient: the growth optimum (23–26 °C) is the strongest green; the cold 8–13 °C "Aeromonas
 * window" — pathogens active but the koi immune system not — is flagged amber (caution) even though
 * it is cold; both temperature extremes go red. `max` is the exclusive upper °C bound; `key` is the
 * i18n key for the band's biological meaning.
 */
const TEMP_BANDS: { max: number; color: string; key: string }[] = [
    { max: 2, color: '#f0645a', key: 'temp_lethal_cold' },
    { max: 4, color: '#ff8c42', key: 'temp_borderline' },
    { max: 8, color: '#4aa8ff', key: 'temp_winter_rest' },
    { max: 13, color: '#ffca3a', key: 'temp_aeromonas' },
    { max: 17, color: '#35c4c4', key: 'temp_transition' },
    { max: 23, color: '#8ed081', key: 'temp_normal' },
    { max: 26, color: '#3fbf5a', key: 'temp_optimum' },
    { max: 28, color: '#8ed081', key: 'temp_upper_normal' },
    { max: 30, color: '#ff8c42', key: 'temp_heat_stress' },
    { max: Infinity, color: '#f0645a', key: 'temp_danger' },
];

function tempBandIndex(t: number): number {
    for (let i = 0; i < TEMP_BANDS.length; i++) {
        if (t < TEMP_BANDS[i].max) {
            return i;
        }
    }
    return TEMP_BANDS.length - 1;
}

/** Water-temperature colour for the koi biology band at `t` (°C). */
export function tempColor(t: number): string {
    return TEMP_BANDS[tempBandIndex(t)].color;
}

/** i18n key for the biological meaning of the koi water-temperature band at `t` (°C). */
export function tempBandKey(t: number): string {
    return TEMP_BANDS[tempBandIndex(t)].key;
}
