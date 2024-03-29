import type BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent, formatLtvDecimalAsPercent } from 'helpers/formatters/format'

export type OmniCardLtvAutomationData = {
  isStopLossLikeEnabled: boolean
  stopLossLikeTriggerLevel?: BigNumber
  stopLossType: AutomationFeatures.TRAILING_STOP_LOSS | AutomationFeatures.STOP_LOSS
}

interface OmniCardDataLtvParams extends OmniContentCardDataWithModal {
  afterLtv?: BigNumber
  ltv: BigNumber
  maxLtv?: BigNumber
  automation?: OmniCardLtvAutomationData
}

export function useOmniCardDataLtv({
  afterLtv,
  ltv,
  maxLtv,
  automation,
  modal,
}: OmniCardDataLtvParams): OmniContentCardBase {
  let footnote

  if (maxLtv) {
    footnote = [{ key: 'omni-kit.content-card.ltv.footnote' }, formatDecimalAsPercent(maxLtv)]
  }

  if (automation && automation.stopLossLikeTriggerLevel) {
    footnote = [
      {
        key: `omni-kit.content-card.ltv.footnote-${
          {
            [AutomationFeatures.STOP_LOSS]: 'stop-loss-ltv',
            [AutomationFeatures.TRAILING_STOP_LOSS]: 'trailing-stop-loss-ltv',
          }[automation.stopLossType]
        }`,
      },
      formatDecimalAsPercent(automation.stopLossLikeTriggerLevel),
    ]
  }

  return {
    title: { key: 'omni-kit.content-card.ltv.title' },
    value: formatLtvDecimalAsPercent(ltv),
    ...(afterLtv && {
      change: [formatLtvDecimalAsPercent(afterLtv)],
    }),
    ...(footnote && {
      footnote,
    }),
    modal,
  }
}
