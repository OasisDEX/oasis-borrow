import {
  omniOptimizationLikeAutomationFeatures,
  omniProtectionLikeAutomationFeatures,
} from 'features/omni-kit/constants'
import { isPoolSupportingMultiply } from 'features/omni-kit/protocols/ajna/helpers'
import { morphoMarketsWithAutomation } from 'features/omni-kit/protocols/morpho-blue/settings'
import type { OmniProtocolSettings, OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { hasCommonElement } from 'helpers/hasCommonElement'
import { LendingProtocol } from 'lendingProtocols'

interface IsSupportingAutomationParams {
  collateralToken: string
  networkId: OmniSupportedNetworkIds
  poolId?: string
  protocol: LendingProtocol
  quoteToken: string
  settings: OmniProtocolSettings
}

interface IsSupportingAutomationResponse {
  isSupportingProtection: boolean
  isSupportingOptimization: boolean
}

const defaultIsSupportingAutomationResponse: IsSupportingAutomationResponse = {
  isSupportingProtection: false,
  isSupportingOptimization: false,
}

export function isSupportingAutomation({
  collateralToken,
  networkId,
  poolId,
  protocol,
  quoteToken,
  settings,
}: IsSupportingAutomationParams): IsSupportingAutomationResponse {
  const supportedTokens = settings.supportedMultiplyTokens[networkId]
  const availableAutomations = settings.availableAutomations?.[networkId] ?? []

  const isMultiplySupported = isPoolSupportingMultiply({
    collateralToken,
    quoteToken,
    supportedTokens,
  })

  if (!isMultiplySupported) return defaultIsSupportingAutomationResponse
  else {
    const isSupportingAutomationResponse = {
      isSupportingProtection: hasCommonElement(
        availableAutomations,
        omniProtectionLikeAutomationFeatures,
      ),
      isSupportingOptimization: hasCommonElement(
        availableAutomations,
        omniOptimizationLikeAutomationFeatures,
      ),
    }

    // switch instead of if assuming other protocols might require specific conditions as well soon
    switch (protocol) {
      case LendingProtocol.MorphoBlue: {
        return morphoMarketsWithAutomation.includes(poolId)
          ? isSupportingAutomationResponse
          : defaultIsSupportingAutomationResponse
      }
      default:
        return isSupportingAutomationResponse
    }
  }
}
