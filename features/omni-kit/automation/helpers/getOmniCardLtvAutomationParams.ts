import BigNumber from 'bignumber.js'
import { lambdaPriceDenomination } from 'features/aave/constants'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniCardLtvAutomationData } from 'features/omni-kit/components/details-section'
import type { AutomationMetadataValues } from 'features/omni-kit/types'

export const getOmniCardLtvAutomationParams = ({
  collateralAmount,
  debtAmount,
  automationMetadata,
}: {
  collateralAmount: BigNumber
  debtAmount: BigNumber
  automationMetadata?: AutomationMetadataValues
}): OmniCardLtvAutomationData | undefined => {
  if (!automationMetadata) {
    return undefined
  }

  if (automationMetadata.triggers.trailingStopLoss) {
    const executionPrice = new BigNumber(
      automationMetadata.triggers.trailingStopLoss.dynamicParams.executionPrice ?? 0,
    )

    return {
      isStopLossLikeEnabled: true,
      stopLossLikeTriggerLevel: debtAmount.div(
        collateralAmount.times(executionPrice.div(lambdaPriceDenomination)),
      ),
      stopLossType: AutomationFeatures.TRAILING_STOP_LOSS,
    }
  }
  if (automationMetadata.triggers.stopLoss) {
    return {
      isStopLossLikeEnabled: true,
      stopLossLikeTriggerLevel:
        automationMetadata.triggers.stopLoss.decodedMappedParams.ltv ||
        automationMetadata.triggers.stopLoss.decodedMappedParams.executionLtv,
      stopLossType: AutomationFeatures.STOP_LOSS,
    }
  }
  return undefined
}
