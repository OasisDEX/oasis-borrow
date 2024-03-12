import type BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'react-i18next'

interface OmniCardDataAutoBSTriggerExecutionLtvParams {
  automationFeature: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY
  collateralToken: string
  currentExecutionLTV?: BigNumber
  afterTxExecutionLTV?: BigNumber
  nextPrice?: BigNumber
  denomination: string
}

export function useOmniCardDataAutoBSTriggerExecutionLtv({
  automationFeature,
  collateralToken,
  currentExecutionLTV,
  afterTxExecutionLTV,
  nextPrice,
  denomination,
}: OmniCardDataAutoBSTriggerExecutionLtvParams): OmniContentCardBase {
  const { t } = useTranslation()

  const titleKey =
    automationFeature === AutomationFeatures.AUTO_SELL
      ? 'auto-sell.trigger-ltv-to-sell-token'
      : 'auto-buy.trigger-ltv-to-buy-token'

  return {
    title: t(titleKey, { token: collateralToken }),
    value: currentExecutionLTV ? formatDecimalAsPercent(currentExecutionLTV) : '-',
    ...(afterTxExecutionLTV && {
      change: [formatDecimalAsPercent(afterTxExecutionLTV), t('system.cards.common.after')],
    }),
    ...(nextPrice && {
      footnote: [
        t(
          automationFeature === AutomationFeatures.AUTO_SELL
            ? 'auto-sell.next-sell-price'
            : 'auto-buy.next-buy-price',
          {
            amount: nextPrice && `${formatCryptoBalance(nextPrice)} ${denomination}`,
          },
        ),
      ],
    }),
  }
}
