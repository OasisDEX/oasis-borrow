import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { networkNameToIdMap } from 'blockchain/networks'
import type {
  RefinanceContextInput,
  RefinanceContextInputAutomations,
} from 'features/refinance/contexts'
import type { MakerPoolId, SparkPoolId } from 'features/refinance/types'
import type { PositionType } from 'summerfi-sdk-common'

import { protocolNameToLendingProtocol } from './protocolNameToLendingProtocol'

export const getRefinanceContextInput = ({
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
  positionType,
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
  positionType: PositionType | undefined
}): RefinanceContextInput => {
  const lendingProtocol = protocolNameToLendingProtocol(poolId.protocol.name)

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
      lendingProtocol,
      positionId: { id: positionId.toString() },
      collateralAmount: collateral,
      debtAmount: debt,
      liquidationPrice: liquidationPrice,
      ltv: new RiskRatio(new BigNumber(ltv), RiskRatio.TYPE.LTV),
      positionType,
    },
    automations: automations,
    contextId,
  }
}
