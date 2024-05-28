import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { networkNameToIdMap } from 'blockchain/networks'
import type {
  RefinanceContextInput,
  RefinanceContextInputAutomations,
} from 'features/refinance/contexts'
import type { ILendingPoolId, IPositionId, PositionType } from 'summerfi-sdk-common'

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
  owner,
  isOwner,
}: {
  borrowRate: string
  primaryToken: string
  secondaryToken: string
  collateralPrice: string
  debtPrice: string
  ethPrice: string
  poolId: ILendingPoolId
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
  positionId: IPositionId
  owner: string | undefined
  isOwner: boolean
  positionType: PositionType
}): RefinanceContextInput => {
  const chainId = networkNameToIdMap[network]
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
      chainId,
      slippage,
      address,
      isOwner,
    },
    position: {
      lendingProtocol,
      positionId,
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
      owner: owner,
    },
    automations: automations,
    contextId,
  }
}
