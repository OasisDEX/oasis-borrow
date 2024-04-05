import type { RiskRatio } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import type { RefinanceContextInput } from 'features/refinance/RefinanceContext'
import type { MakerPoolId } from 'features/refinance/types'
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
  ltv: RiskRatio
  maxLtv: RiskRatio
  ilkType: string
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

  const tokenPrices = {
    [collateralTokenSymbol]: collateralPrice,
    [debtTokenSymbol]: '1',
  }

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

  return {
    poolData: {
      poolId,
      collateralTokenSymbol,
      debtTokenSymbol,
      borrowRate,
      maxLtv,
    },
    environment: {
      address,
      chainId,
      slippage,
      tokenPrices,
    },
    position: {
      positionId,
      collateralAmount,
      debtAmount,
      liquidationPrice,
      ltv,
    },
    automations,
  }
}
