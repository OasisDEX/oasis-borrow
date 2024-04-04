import type { RiskRatio } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'
import type {
  RefinanceContextInput,
  RefinanceContextInputAutomations,
} from 'features/refinance/RefinanceContext'
import type { MakerPoolId } from 'features/refinance/types'
import { getChainInfoByChainId, PositionId, ProtocolName } from 'summerfi-sdk-common'

export const getMakerRefinanceContextInputs = ({
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
  automations,
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
  automations: RefinanceContextInputAutomations
  ilkType: string
}): RefinanceContextInput => {
  const chainInfo = getChainInfoByChainId(chainId)

  if (!chainInfo) {
    throw new Error(`ChainId ${chainId} is not supported`)
  }
  const positionId: PositionId = PositionId.createFrom({ id })

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
