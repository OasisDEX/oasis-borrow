import type { NetworkIds } from 'blockchain/networks'
import { getNetworkById } from 'blockchain/networks'
import type { RefinanceContextInput } from 'features/refinance/contexts/RefinanceGeneralContext'
import { getRefinanceContextInput } from 'features/refinance/helpers'
import { getMorphoPoolId } from 'features/refinance/helpers/getMorphoPoolId'
import { getMorphoPositionId } from 'features/refinance/helpers/getMorphoPositionId'
import type { DpmFormState } from 'features/refinance/state/refinanceFormReducto.types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { getChainInfoByChainId, type PositionType } from 'summerfi-sdk-common'

export const useMorphoRefinanceContextInputs = ({
  address,
  networkId,
  collateralTokenSymbol,
  debtTokenSymbol,
  collateralAmount,
  debtAmount,
  vaultId,
  slippage,
  collateralPrice,
  debtPrice,
  ethPrice,
  borrowRate,
  liquidationPrice,
  ltv,
  maxLtv,
  marketId,
  positionType,
  isOwner,
  pairId,
  owner,
  triggerData,
}: {
  address?: string
  networkId: NetworkIds
  collateralTokenSymbol: string
  debtTokenSymbol: string
  collateralAmount: string
  debtAmount: string
  vaultId: string
  slippage: number
  collateralPrice: string
  debtPrice: string
  ethPrice: string
  liquidationPrice: string
  borrowRate: string
  ltv: string
  maxLtv: string
  marketId: string
  isOwner: boolean
  positionType: PositionType
  pairId: number
  owner: string
  triggerData: GetTriggersResponse
  dpm?: DpmFormState
}): RefinanceContextInput => {
  const chainFamily = getChainInfoByChainId(networkId)
  if (!chainFamily) {
    throw new Error(`ChainId ${networkId} is not supported`)
  }
  const poolId = getMorphoPoolId(chainFamily.chainInfo, marketId)
  const positionId = getMorphoPositionId(vaultId)

  const morphoTriggerId: `morphoblue-${string}` = `morphoblue-${marketId}`

  const triggerFlags = triggerData.flags[morphoTriggerId]
  if (!triggerFlags) {
    throw new Error(`Trigger flags for Morpho ${morphoTriggerId} are undefined`)
  }

  const automations = {
    stopLoss: {
      enabled: triggerFlags.isStopLossEnabled,
    },
    autoSell: {
      enabled: triggerFlags.isBasicSellEnabled,
    },
    autoBuy: {
      enabled: triggerFlags.isBasicBuyEnabled,
    },
    takeProfit: {
      enabled: triggerFlags.isPartialTakeProfitEnabled,
    },
    constantMultiple: {
      enabled: false,
    },
  }

  const network = getNetworkById(networkId).name

  return getRefinanceContextInput({
    borrowRate,
    primaryToken: collateralTokenSymbol,
    secondaryToken: debtTokenSymbol,
    collateralPrice,
    debtPrice,
    ethPrice,
    poolId,
    pairId,
    network,
    address,
    slippage,
    collateral: collateralAmount,
    debt: debtAmount,
    positionId: positionId,
    liquidationPrice,
    ltv,
    maxLtv,
    automations,
    contextId: vaultId,
    positionType,
    isOwner,
    owner,
  })
}
