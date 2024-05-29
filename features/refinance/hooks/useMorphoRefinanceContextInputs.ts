import type { LendingPosition, MorphoBluePosition } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'
import { getNetworkById } from 'blockchain/networks'
import type { RefinanceContextInput } from 'features/refinance/contexts/RefinanceGeneralContext'
import { getMorphoPositionId, getRefinanceContextInput } from 'features/refinance/helpers'
import { getMorphoPoolId } from 'features/refinance/helpers/getMorphoPoolId'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { getChainInfoByChainId, type PositionType } from 'summerfi-sdk-common'

export const useMorphoRefinanceContextInputs = ({
  address,
  networkId,
  collateralTokenSymbol,
  debtTokenSymbol,
  vaultId,
  slippage,
  collateralPrice,
  debtPrice,
  ethPrice,
  marketId,
  positionType,
  isOwner,
  pairId,
  owner,
  triggerData,
  position,
  dpmProxy,
}: {
  address?: string
  networkId: NetworkIds
  collateralTokenSymbol: string
  debtTokenSymbol: string
  vaultId: string
  slippage: number
  collateralPrice: string
  debtPrice: string
  ethPrice: string
  marketId?: string
  isOwner: boolean
  positionType: PositionType
  pairId: number
  owner: string
  triggerData: GetTriggersResponse
  position: LendingPosition
  dpmProxy?: string
}): RefinanceContextInput => {
  const castedPosition = position as MorphoBluePosition

  const borrowRate = castedPosition.borrowRate.toString()
  const ltv = castedPosition.riskRatio.loanToValue.toString()
  const maxLtv = castedPosition.maxRiskRatio.loanToValue.toString()
  const liquidationPrice = castedPosition.liquidationPrice.toString()
  const collateralAmount = castedPosition.collateralAmount.toString()
  const debtAmount = castedPosition.debtAmount.toString()

  const chainFamily = getChainInfoByChainId(networkId)
  if (!chainFamily) {
    throw new Error(`ChainId ${networkId} is not supported`)
  }

  if (!marketId) {
    throw new Error(`Market Id not defined`)
  }

  if (!dpmProxy) {
    throw new Error(`Dpm proxy not defined`)
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
    dpm: {
      id: positionId.id,
      address: dpmProxy,
    },
  })
}
