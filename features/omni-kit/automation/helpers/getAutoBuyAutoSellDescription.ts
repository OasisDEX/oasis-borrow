import type { LendingPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniAutoBSAutomationTypes } from 'features/omni-kit/automation/components/auto-buy-sell/types'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { one } from 'helpers/zero'
import type { TranslationType } from 'ts_modules/i18next'

const getTriggerExecutionPrice = ({
  triggerLtv,
  position,
  pricesDenomination,
}: {
  triggerLtv: BigNumber
  position: LendingPosition
  pricesDenomination: 'debt' | 'collateral'
}) => {
  if (!position || !triggerLtv) {
    return undefined
  }

  const debtToCollateralRatio = position.debtAmount.div(
    position.collateralAmount.times(triggerLtv.div(100)),
  )

  if (pricesDenomination === 'debt') {
    return one.div(debtToCollateralRatio)
  }

  return debtToCollateralRatio
}

export function getAutoBuyAutoSellDescription({
  triggerLtv,
  targetLtv,
  automationFormState,
  t,
  position,
  pricesDenomination,
  collateralToken,
  quoteToken,
  type,
}: {
  triggerLtv: BigNumber
  targetLtv: BigNumber
  automationFormState: OmniAutomationAutoBSFormState
  t: TranslationType
  position: LendingPosition
  pricesDenomination: 'debt' | 'collateral'
  collateralToken: string
  quoteToken: string
  type: OmniAutoBSAutomationTypes
}) {
  if (!triggerLtv || !targetLtv) {
    return ''
  }
  const executionPrice = getTriggerExecutionPrice({
    triggerLtv,
    position,
    pricesDenomination,
  })

  if (!executionPrice) {
    return ''
  }

  const denomination =
    pricesDenomination === 'debt'
      ? `${quoteToken}/${collateralToken}`
      : `${collateralToken}/${quoteToken}`

  const translationParams = {
    executionLTV: triggerLtv,
    targetLTV: targetLtv,
    denomination,
    executionPrice: formatCryptoBalance(executionPrice),
    maxBuyPrice: automationFormState.price ? formatCryptoBalance(automationFormState.price) : '',
    minSellPrice: automationFormState.price ? formatCryptoBalance(automationFormState.price) : '',
  }

  if (type === AutomationFeatures.AUTO_BUY) {
    if (automationFormState.price) {
      return t('auto-buy.set-trigger-description-ltv', translationParams)
    }
    if (automationFormState.useThreshold) {
      return t('auto-buy.set-trigger-description-ltv-no-threshold', translationParams)
    }
    return t('auto-buy.set-trigger-description-ltv-without-threshold', translationParams)
  }
  if (type === AutomationFeatures.AUTO_SELL) {
    if (automationFormState.price) {
      return t('auto-sell.set-trigger-description-ltv', translationParams)
    }
    if (automationFormState.useThreshold) {
      return t('auto-sell.set-trigger-description-ltv-no-threshold', translationParams)
    }
    return t('auto-sell.set-trigger-description-ltv-without-threshold', translationParams)
  }
  console.error('Invalid automation type, expected AUTO_BUY or AUTO_SELL')
  return ''
}
