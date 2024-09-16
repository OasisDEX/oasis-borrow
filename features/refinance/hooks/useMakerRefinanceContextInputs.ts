import {
  getChainInfoByChainId,
  type ILendingPoolId,
  type ILendingPositionId,
  type LendingPositionType,
} from '@summer_fi/summerfi-sdk-common'
import type { NetworkIds } from 'blockchain/networks'
import { getNetworkById } from 'blockchain/networks'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import type { RefinanceContextInput } from 'features/refinance/contexts/RefinanceGeneralContext'
import { getRefinanceContextInput } from 'features/refinance/helpers'
import { getMakerPoolId } from 'features/refinance/helpers/getMakerPoolId'
import { getMakerPositionId } from 'features/refinance/helpers/getMakerPositionId'
import { mapTokenToSdkToken } from 'features/refinance/helpers/mapTokenToSdkToken'

export const useMakerRefinanceContextInputs = ({
  address,
  networkId,
  collateralAmount,
  collateralTokenSymbol,
  debtAmount,
  id,
  slippage,
  collateralPrice,
  ethPrice,
  borrowRate,
  liquidationPrice,
  ltv,
  maxLtv,
  ilkType,
  positionType: type,
  isOwner,
}: {
  address?: string
  networkId: NetworkIds
  collateralAmount: string
  collateralTokenSymbol: string
  debtAmount: string
  id: string
  slippage: number
  collateralPrice: string
  ethPrice: string
  liquidationPrice: string
  borrowRate: string
  ltv: string
  maxLtv: string
  ilkType: string
  isOwner: boolean
  positionType: LendingPositionType
}): RefinanceContextInput => {
  const { triggerData } = useAutomationContext()

  const chainFamily = getChainInfoByChainId(networkId)
  if (!chainFamily) {
    throw new Error(`ChainFamily with networkId ${networkId} is not supported`)
  }
  const debtTokenSymbol = 'DAI'
  const collateralToken = mapTokenToSdkToken(chainFamily.chainInfo, collateralTokenSymbol)
  const debtToken = mapTokenToSdkToken(chainFamily.chainInfo, debtTokenSymbol)

  const poolId = getMakerPoolId(
    chainFamily.chainInfo,
    ilkType,
    collateralToken,
    debtToken,
  ) as any as ILendingPoolId
  const positionId = getMakerPositionId(id) as any as ILendingPositionId

  const automations = {
    stopLoss: {
      enabled: triggerData.stopLossTriggerData.isStopLossEnabled,
    },
    autoSell: {
      enabled: triggerData.autoSellTriggerData.isTriggerEnabled,
    },
    autoBuy: {
      enabled: triggerData.autoBuyTriggerData.isTriggerEnabled,
    },
    takeProfit: {
      enabled: triggerData.autoTakeProfitTriggerData.isTriggerEnabled,
    },
    constantMultiple: {
      enabled: triggerData.constantMultipleTriggerData.isTriggerEnabled,
    },
  }

  const network = getNetworkById(networkId).name

  return getRefinanceContextInput({
    borrowRate,
    primaryToken: collateralTokenSymbol,
    secondaryToken: debtTokenSymbol,
    collateralPrice,
    debtPrice: '1',
    ethPrice,
    poolId,
    pairId: 1,
    network,
    address,
    slippage,
    collateralAmount: collateralAmount,
    debtAmount: debtAmount,
    positionId,
    liquidationPrice,
    ltv,
    maxLtv,
    automations,
    contextId: id,
    positionType: type,
    isOwner,
    owner: undefined,
  })
}
