import React from 'react';

import type { RxRenderWidgetProps, RxWidgetInfo } from '@iobroker/types-vis-2';

import FeederWidgetBase, { type FeederBaseRxData, type FeederBaseState } from './FeederWidgetBase';
import { feederCommonGroup } from './common';

type DynamicFeedingRxData = FeederBaseRxData;

export default class SeasonBanner extends FeederWidgetBase<DynamicFeedingRxData, FeederBaseState> {
    static adapter: string;

    // eslint-disable-next-line class-methods-use-this
    protected relIds(): string[] {
        return [
            'status.winterActive',
            'status.pauseActive',
            'status.pauseActiveUntil',
            'status.pauseManual',
            'settings.winterWindow',
        ];
    }

    static getWidgetInfo(): RxWidgetInfo {
        return {
            id: 'tplAutomaticFeederBanner',
            visSet: 'vis-2-widgets-automatic-feeder',
            visName: 'SeasonBanner',
            visAttrs: [feederCommonGroup()],
            visDefaultStyle: { width: 460, height: 44 },
            visPrev: 'widgets/vis-2-widgets-automatic-feeder/img/vis-widget-demo.png',
        };
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return SeasonBanner.getWidgetInfo();
    }

    static getI18nPrefix(): string {
        return `${SeasonBanner.adapter}_`;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);
        const t = (k: string): string => SeasonBanner.t(k);

        if (!this.channel()) {
            return <div className="af-banner af-banner--good">{t('select_channel_hint')}</div>;
        }

        const pauseManual = this.bool('status.pauseManual');
        const pauseActive = this.bool('status.pauseActive');
        const winter = this.bool('status.winterActive');

        let kind = 'good';
        let text = t('auto_active');
        if (pauseManual) {
            kind = 'crit';
            text = t('pause_manual_banner');
        } else if (pauseActive) {
            kind = 'warn';
            text = `${t('pause_active_banner')} ${this.str('status.pauseActiveUntil')}`;
        } else if (winter) {
            kind = 'info';
            text = t('winter_active_banner');
        }

        return (
            <div className={`af-banner af-banner--${kind}`}>
                <span className="dot" />
                <span>{text}</span>
            </div>
        );
    }
}
