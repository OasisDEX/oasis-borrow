import type { NetworkIds } from 'blockchain/networks'
import { getNetworkById } from 'blockchain/networks'
import type { RefinanceContextInput } from 'features/refinance/contexts/RefinanceGeneralContext'
import { getRefinanceContextInput } from 'features/refinance/helpers'
import { getAaveLikePoolId } from 'features/refinance/helpers/getAaveLikePoolId'
import { getAaveLikePositionId } from 'features/refinance/helpers/getAaveLikePositionId'
import { getEmode } from 'features/refinance/helpers/getEmode'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import type { LendingProtocol } from 'lendingProtocols'
import { getChainInfoByChainId, type PositionType } from 'summerfi-sdk-common'

export const useAaveSparkRefinanceContextInputs = ({
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
  lendingProtocol,
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
  lendingProtocol: LendingProtocol
}): RefinanceContextInput => {
  const chainFamily = getChainInfoByChainId(networkId)
  if (!chainFamily) {
    throw new Error(`ChainId ${networkId} is not supported`)
  }
  const collateralToken = mapTokenToSdkToken(chainFamily.chainInfo, collateralTokenSymbol)
  const debtToken = mapTokenToSdkToken(chainFamily.chainInfo, debtTokenSymbol)
  const emodeType = getEmode(collateralToken, debtToken)

  const poolId = getAaveLikePoolId(
    lendingProtocol,
    chainFamily.chainInfo,
    collateralToken,
    debtToken,
    emodeType,
  )
  const positionId = getAaveLikePositionId(lendingProtocol, vaultId)

  const morphoTriggerId: `morphoblue-${string}` = `morphoblue-${marketId}`

  const triggerFlags = triggerData.flags.aave3
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
