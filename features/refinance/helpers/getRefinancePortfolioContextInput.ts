import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { networkNameToIdMap } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import type {
  RefinanceContextInput,
  RefinanceContextInputAutomations,
} from 'features/refinance/contexts'
import type { MakerPoolId, SparkPoolId } from 'features/refinance/types'
import type { LendingProtocol } from 'lendingProtocols'

export const getRefinancePortfolioContextInput = ({
  borrowRate,
  primaryToken,
  secondaryToken,
  collateralPrice,
  debtPrice,
  poolId,
  pairId,
  network,
  address,
  slippage,
  collateral,
  debt,
  liquidationPrice,
  ltv,
  maxLtv,
  automations,
  contextId,
  positionId,
  protocol,
  productType,
}: {
  borrowRate: string
  primaryToken: string
  secondaryToken: string
  collateralPrice: string
  debtPrice: string
  poolId: MakerPoolId | SparkPoolId
  pairId: number
  network: NetworkNames
  address?: string
  slippage: number
  collateral: string
  debt: string
  liquidationPrice: string
  ltv: string
  maxLtv: string
  automations: RefinanceContextInputAutomations
  contextId: string
  positionId: string | number
  protocol: LendingProtocol
  productType: OmniProductType
}): RefinanceContextInput => {
  return {
    poolData: {
      borrowRate,
      collateralTokenSymbol: primaryToken,
      debtTokenSymbol: secondaryToken,
      maxLtv: new RiskRatio(new BigNumber(maxLtv), RiskRatio.TYPE.LTV),
      poolId,
      pairId,
    },
    environment: {
      tokenPrices: {
        [primaryToken]: collateralPrice,
        [secondaryToken]: debtPrice,
      },
      chainId: networkNameToIdMap[network],
      slippage,
      address,
    },
    position: {
      productType,
      protocol,
      positionId: { id: positionId.toString() },
      collateralAmount: collateral,
      debtAmount: debt,
      liquidationPrice: liquidationPrice,
      ltv: new RiskRatio(new BigNumber(ltv), RiskRatio.TYPE.LTV),
    },
    automations: automations,
    contextId,
  }
}
