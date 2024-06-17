import type { AaveLikePositionV2, LendingPosition } from '@oasisdex/dma-library'
import { getChainInfoByChainId, type PositionType } from '@summer_fi/summerfi-sdk-common'
import type { NetworkIds } from 'blockchain/networks'
import { getNetworkById } from 'blockchain/networks'
import type { RefinanceContextInput } from 'features/refinance/contexts/RefinanceGeneralContext'
import {
  getAaveLikePoolId,
  getAaveLikePositionId,
  getRefinanceContextInput,
} from 'features/refinance/helpers'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { LendingProtocol } from 'lendingProtocols'

export const useAaveLikeRefinanceContextInputs = ({
  address,
  networkId,
  collateralTokenSymbol,
  debtTokenSymbol,
  vaultId,
  slippage,
  collateralPrice,
  debtPrice,
  ethPrice,
  positionType,
  isOwner,
  pairId,
  owner,
  triggerData,
  lendingProtocol,
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
  isOwner: boolean
  positionType: PositionType
  pairId: number
  owner: string
  triggerData: GetTriggersResponse
  lendingProtocol: LendingProtocol.AaveV3 | LendingProtocol.SparkV3
  position: LendingPosition
  dpmProxy?: string
}): RefinanceContextInput => {
  const chainFamily = getChainInfoByChainId(networkId)
  if (!chainFamily) {
    throw new Error(`ChainId ${networkId} is not supported`)
  }

  const castedPosition = position as AaveLikePositionV2

  const borrowRate = castedPosition.borrowRate.toString()
  const ltv = castedPosition.riskRatio.loanToValue.toString()
  const maxLtv = castedPosition.maxRiskRatio.loanToValue.toString()
  const liquidationPrice = castedPosition.liquidationPrice.toString()
  const collateralAmount = castedPosition.collateralAmount.toString()
  const debtAmount = castedPosition.debtAmount.toString()

  const collateralToken = mapTokenToSdkToken(chainFamily.chainInfo, collateralTokenSymbol)
  const debtToken = mapTokenToSdkToken(chainFamily.chainInfo, debtTokenSymbol)
  const emodeType = getEmode(collateralToken, debtToken, lendingProtocol)

  const poolId = getAaveLikePoolId(
    lendingProtocol,
    chainFamily.chainInfo,
    collateralToken,
    debtToken,
    emodeType,
  )

  const positionId = getAaveLikePositionId(lendingProtocol, vaultId)

  const flag = {
    [LendingProtocol.AaveV3]: 'aave3',
    [LendingProtocol.SparkV3]: 'spark',
  }[lendingProtocol]

  const triggerFlags = triggerData.flags[flag as 'aave3' | 'spark']
  if (!triggerFlags) {
    throw new Error(`Trigger flags for ${lendingProtocol} are undefined`)
  }

  if (!dpmProxy) {
    throw new Error(`Dpm proxy not defined`)
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
    collateralAmount,
    debtAmount,
    positionId,
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
