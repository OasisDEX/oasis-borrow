import type { NetworkConfig } from 'blockchain/networks'
import { getOmniPositionUrl } from 'features/omni-kit/helpers'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

interface GetOmniAutomationSidebarPrimaryButtonActionsParams {
  collateralAddress: string
  collateralToken: string
  currentStep: string
  editingStep: string
  isOpening: boolean
  isOracless: boolean
  isStepWithTransaction: boolean
  isTxSuccess: boolean
  label?: string
  network: NetworkConfig
  onDefault: () => void
  onDisconnected: () => void
  onSelectTransition: () => void
  onSwitchNetwork: () => void
  onUpdated: () => void
  pairId: number
  productType: OmniProductType
  protocol: LendingProtocol
  pseudoProtocol?: string
  quoteAddress: string
  quoteToken: string
  openFlowResolvedDpmId?: string
  shouldSwitchNetwork: boolean
  walletAddress?: string
}

export function getOmniAutomationSidebarPrimaryButtonActions({
  collateralAddress,
  collateralToken,
  currentStep,
  editingStep,
  isOpening,
  isOracless,
  isStepWithTransaction,
  isTxSuccess,
  label,
  network,
  onDefault,
  onDisconnected,
  onSelectTransition,
  onSwitchNetwork,
  onUpdated,
  pairId,
  productType,
  protocol,
  pseudoProtocol,
  quoteAddress,
  quoteToken,
  openFlowResolvedDpmId,
  shouldSwitchNetwork,
  walletAddress,
}: GetOmniAutomationSidebarPrimaryButtonActionsParams) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { action: onDisconnected }
    case shouldSwitchNetwork && currentStep === editingStep:
      return { action: onSwitchNetwork }
    case isTxSuccess && isOpening:
      return {
        url: getOmniPositionUrl({
          collateralAddress,
          collateralToken,
          isPoolOracless: isOracless,
          label,
          networkName: network.name,
          pairId,
          positionId: openFlowResolvedDpmId,
          productType,
          protocol,
          pseudoProtocol,
          quoteAddress,
          quoteToken: quoteToken,
        }),
      }
    case isStepWithTransaction && isTxSuccess:
      return { action: onUpdated }
    case isStepWithTransaction:
      return { action: onSelectTransition }
    default:
      return { action: onDefault }
  }
}
