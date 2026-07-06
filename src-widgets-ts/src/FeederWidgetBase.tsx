import type { VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

import { injectStyles } from './styles';
import { channelOf } from './common';

export interface FeederBaseRxData {
    instance?: string;
    switchId?: string;
}

export interface FeederBaseState extends VisRxWidgetState {
    fv: Record<string, ioBroker.StateValue | null>;
    tick: number;
}

/**
 * Common base for all Automatic-Feeder widgets: resolves the switch channel from the
 * instance/switchId attributes, subscribes to the relative sub-states, keeps their values
 * in `this.state.fv`, and offers small read/write/format helpers. Set `tickMs > 0` to get a
 * periodic re-render (for live countdowns).
 */
export default abstract class FeederWidgetBase<
    TRxData extends FeederBaseRxData,
    TState extends FeederBaseState,
> extends (window.visRxWidget as typeof VisRxWidget)<TRxData, TState> {
    protected subscribedIds: string[] = [];
    protected fMounted = false;
    protected tickTimer: ReturnType<typeof setInterval> | null = null;
    protected tickMs = 0;

    /** Sub-state ids (relative to the switch channel) this widget needs. */
    protected abstract relIds(): string[];

    /**
     * Applies a partial state update. setState's key inference does not work through the
     * abstract TState generic, so relax the updater type in exactly one place here.
     */
    private applyPartial(updater: (s: FeederBaseState) => Partial<FeederBaseState>): void {
        (this.setState as unknown as (u: (s: FeederBaseState) => Partial<FeederBaseState>) => void)(updater);
    }

    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, fv: {}, tick: 0 };
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.fMounted = true;
        injectStyles();
        void this.subscribeFeeder();
        if (this.tickMs > 0) {
            this.tickTimer = setInterval(
                () => this.fMounted && this.applyPartial(s => ({ tick: s.tick + 1 })),
                this.tickMs,
            );
        }
    }

    componentWillUnmount(): void {
        this.fMounted = false;
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

    protected channel(): string {
        return channelOf(this.state.rxData);
    }

    private feederIds(): string[] {
        const ch = this.channel();
        return ch ? this.relIds().map(s => `${ch}.${s}`) : [];
    }

    protected async subscribeFeeder(): Promise<void> {
        this.unsubscribeFeeder();
        const ids = this.feederIds();
        if (!ids.length) {
            this.applyPartial(() => ({ fv: {} }));
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

    protected unsubscribeFeeder(): void {
        if (this.subscribedIds.length) {
            try {
                this.props.context.socket.unsubscribeState(this.subscribedIds, this.onFeederState);
            } catch {
                /* ignore */
            }
            this.subscribedIds = [];
        }
    }

    protected onFeederState = (id: string, state: ioBroker.State | null | undefined): void => {
        this.applyState(id, state);
    };

    protected applyState(id: string, state: ioBroker.State | null | undefined): void {
        if (!this.fMounted) {
            return;
        }
        const ch = this.channel();
        const key = ch && id.startsWith(`${ch}.`) ? id.substring(ch.length + 1) : id;
        this.applyPartial(s => ({ fv: { ...s.fv, [key]: state ? state.val : null } }));
    }

    protected write(sub: string, val: ioBroker.StateValue): void {
        const ch = this.channel();
        if (ch) {
            void this.props.context.socket.setState(`${ch}.${sub}`, val, false);
        }
    }

    protected num(key: string): number | null {
        const v = this.state.fv[key];
        return v === null || v === undefined || v === '' ? null : Number(v);
    }

    protected str(key: string): string {
        const v = this.state.fv[key];
        return typeof v === 'string' ? v : '';
    }

    protected bool(key: string): boolean {
        return this.state.fv[key] === true;
    }

    // "DD.MM.YYYY HH:MM:SS" -> "HH:MM"
    // eslint-disable-next-line class-methods-use-this
    protected hhmm(v: string): string {
        return typeof v === 'string' && v.length > 15 ? v.substring(11, 16) : v || '–';
    }
}
