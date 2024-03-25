import type BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'react-i18next'

interface OmniCardDataAutoBSTriggerTargetLtvParams {
  automationFeature: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY
  collateralToken: string
  currentTargetLTV?: BigNumber
  afterTxTargetLTV?: BigNumber
  thresholdPrice?: BigNumber
  denomination: string
}

export function useOmniCardDataAutoBSTriggerTargetLtv({
  automationFeature,
  currentTargetLTV,
  afterTxTargetLTV,
  thresholdPrice,
  denomination,
}: OmniCardDataAutoBSTriggerTargetLtvParams): OmniContentCardBase {
  const { t } = useTranslation()

  const contentCardBase: OmniContentCardBase = {
    title: t(
      automationFeature === AutomationFeatures.AUTO_SELL
        ? 'auto-sell.target-ltv-after-selling'
        : 'auto-buy.target-ltv-after-buying',
    ),
    value: currentTargetLTV ? formatDecimalAsPercent(currentTargetLTV) : '-',
    ...(afterTxTargetLTV && {
      change: [formatDecimalAsPercent(afterTxTargetLTV), t('system.cards.common.after')],
    }),
  }

  if (thresholdPrice) {
    contentCardBase.footnote = [
      t(
        automationFeature === AutomationFeatures.AUTO_SELL
          ? 'auto-sell.continual-sell-threshold-v2'
          : 'auto-buy.continual-buy-threshold-v2',
        {
          amount: thresholdPrice && `${formatCryptoBalance(thresholdPrice)}`,
          denomination: denomination,
        },
      ),
    ]
  }

  if (currentTargetLTV && !thresholdPrice) {
    contentCardBase.footnote = [
      t(
        automationFeature === AutomationFeatures.AUTO_SELL
          ? 'auto-sell.continual-sell-no-threshold'
          : 'auto-buy.continual-buy-no-threshold',
      ),
    ]
  }

  return contentCardBase
}
