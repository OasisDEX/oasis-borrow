import type BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'react-i18next'

interface OmniCardDataAutoBSTriggerExecutionLtvParams {
  afterTxExecutionLTV?: BigNumber
  automationFeature: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY
  collateralToken: string
  currentExecutionLTV?: BigNumber
  denomination: string
  executionPrice?: BigNumber
}

export function useOmniCardDataAutoBSTriggerExecutionLtv({
  afterTxExecutionLTV,
  automationFeature,
  collateralToken,
  currentExecutionLTV,
  denomination,
  executionPrice,
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
    ...(executionPrice && {
      footnote: [
        t(
          automationFeature === AutomationFeatures.AUTO_SELL
            ? 'auto-sell.next-sell-price'
            : 'auto-buy.next-buy-price',
          {
            amount: executionPrice && `${formatCryptoBalance(executionPrice)} ${denomination}`,
          },
        ),
      ],
    }),
  }
}
