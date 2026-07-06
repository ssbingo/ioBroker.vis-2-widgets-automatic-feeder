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
