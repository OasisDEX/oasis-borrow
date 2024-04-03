import type { RiskRatio } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'
import type {
  RefinanceContextInput,
  RefinanceContextInputAutomations,
} from 'features/refinance/RefinanceContext'
import type { MakerPoolId, PositionId } from 'summerfi-sdk-common'
import { getChainInfoByChainId, ILKType, ProtocolName } from 'summerfi-sdk-common'

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
}): RefinanceContextInput => {
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
    // ilkType
    // TODO: hardcoded as endpoint is not supporting all ilks and failing
    ilkType: ILKType.ETH_A,
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
