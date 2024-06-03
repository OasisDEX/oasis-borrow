import { RiskRatio } from '@oasisdex/dma-library'
import type { ILendingPoolId, IPositionId, PositionType } from '@summer_fi/summerfi-sdk-common'
import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { networkNameToIdMap } from 'blockchain/networks'
import type {
  RefinanceContextInput,
  RefinanceContextInputAutomations,
} from 'features/refinance/contexts'
import type { DpmRefinanceFormState } from 'features/refinance/state/refinanceFormReducto.types'

import { getLendingProtocolByProtocolName } from './protocolNameToLendingProtocol'

/**
 *
 * @remarks
 * This method is part of the refinance feature
 *
 * @param dpm - dpm should be passed as parameter only for positions (protocols) that already uses DPM for position creation
 *    so in general only in the scope of Maker we shouldn't pass here dpm
 *
 * @returns Refinance context input needed to initialize refinance UI
 *
 */
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
  dpm,
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
  dpm?: DpmRefinanceFormState
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
      dpm,
    },
    automations: automations,
    contextId,
  }
}
