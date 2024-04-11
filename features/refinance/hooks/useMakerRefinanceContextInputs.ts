import type { NetworkIds } from 'blockchain/networks'
import { getNetworkById } from 'blockchain/networks'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import type { OmniProductType } from 'features/omni-kit/types'
import type { RefinanceContextInput } from 'features/refinance/contexts/RefinanceGeneralContext'
import { getRefinancePortfolioContextInput } from 'features/refinance/helpers'
import type { MakerPoolId } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import type { PositionId } from 'summerfi-sdk-common'
import { getChainInfoByChainId, ProtocolName } from 'summerfi-sdk-common'

export const useMakerRefinanceContextInputs = ({
  address,
  chainId,
  collateralAmount,
  collateralToken,
  debtAmount,
  id,
  slippage,
  collateralPrice,
  borrowRate,
  liquidationPrice,
  ltv,
  maxLtv,
  ilkType,
  productType,
}: {
  address?: string
  chainId: NetworkIds
  collateralAmount: string
  collateralToken: string
  debtAmount: string
  id: string
  slippage: number
  collateralPrice: string
  liquidationPrice: string
  borrowRate: string
  ltv: string
  maxLtv: string
  ilkType: string
  productType: OmniProductType
}): RefinanceContextInput => {
  const { triggerData } = useAutomationContext()

  const chainInfo = getChainInfoByChainId(chainId)

  if (!chainInfo) {
    throw new Error(`ChainId ${chainId} is not supported`)
  }
  const positionId: PositionId = {
    id,
  }

  const poolId: MakerPoolId = {
    protocol: {
      name: ProtocolName.Maker,
      chainInfo,
    },
    vaultId: positionId.id,
    ilkType: ilkType,
  }
  const collateralTokenSymbol = collateralToken
  const debtTokenSymbol = 'DAI'

  const automations = {
    stopLoss: {
      enabled: triggerData.stopLossTriggerData.isStopLossEnabled,
    },
    autoSell: {
      enabled: triggerData.autoSellTriggerData.isTriggerEnabled,
    },
    autoBuy: {
      enabled: triggerData.autoBuyTriggerData.isTriggerEnabled,
    },
    takeProfit: {
      enabled: triggerData.autoTakeProfitTriggerData.isTriggerEnabled,
    },
    constantMultiple: {
      enabled: triggerData.constantMultipleTriggerData.isTriggerEnabled,
    },
  }

  const network = getNetworkById(chainId).name

  return getRefinancePortfolioContextInput({
    borrowRate,
    primaryToken: collateralTokenSymbol,
    secondaryToken: debtTokenSymbol,
    collateralPrice,
    debtPrice: '1',
    poolId,
    pairId: 1,
    network,
    address,
    slippage,
    collateral: collateralAmount,
    debt: debtAmount,
    positionId: id,
    liquidationPrice,
    ltv,
    maxLtv,
    automations,
    contextId: id,
    protocol: LendingProtocol.Maker,
    productType,
  })
}
