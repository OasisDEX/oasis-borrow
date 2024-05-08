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

import { getLendingProtocolByProtocolName } from './protocolNameToLendingProtocol'

export const getRefinanceContextInput = ({
  borrowRate,
  primaryToken,
  secondaryToken,
  collateralPrice,
  debtPrice,
  ethPrice,
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
  isOwner,
}: {
  borrowRate: string
  primaryToken: string
  secondaryToken: string
  collateralPrice: string
  debtPrice: string
  ethPrice: string
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
  isOwner: boolean
  positionType: PositionType
}): RefinanceContextInput => {
  const lendingProtocol = getLendingProtocolByProtocolName(poolId.protocol.name)

  return {
    poolData: {
      collateralTokenSymbol: primaryToken,
      debtTokenSymbol: secondaryToken,
      maxLtv: new RiskRatio(new BigNumber(maxLtv), RiskRatio.TYPE.LTV),
      poolId,
      pairId,
    },
    environment: {
      chainId: networkNameToIdMap[network],
      slippage,
      address,
      isOwner,
    },
    position: {
      lendingProtocol,
      positionId: { id: positionId.toString() },
      collateralAmount: collateral,
      debtAmount: debt,
      liquidationPrice: liquidationPrice,
      ltv: new RiskRatio(new BigNumber(ltv), RiskRatio.TYPE.LTV),
      positionType,
      borrowRate,
      supplyRate: '0', // Refinance: for Maker we hardcode 0% supply rate, other protocols we need to get it from chain
      protocolPrices: {
        [primaryToken]: collateralPrice,
        [secondaryToken]: debtPrice,
        ETH: ethPrice,
      },
    },
    automations: automations,
    contextId,
  }
}
