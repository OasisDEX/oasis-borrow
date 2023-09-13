import {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaPosition,
  RiskRatio,
  strategies,
} from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { AjnaGenericPosition } from 'features/ajna/common/types'
import { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'

export const ajnaClose = ({
  state,
  commonPayload,
  dependencies,
  position,
  slippage,
  collateralToken,
  quoteToken,
}: {
  state: AjnaMultiplyFormState | AjnaBorrowFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  slippage: BigNumber
  collateralToken: string
  quoteToken: string
}) => {
  return strategies.ajna.multiply.close(
    {
      ...commonPayload,
      position: position as AjnaPosition,
      quoteTokenSymbol: quoteToken,
      collateralTokenSymbol: collateralToken,
      slippage,
      user: commonPayload.dpmProxyAddress,
      shouldCloseToCollateral: state.closeTo === 'collateral',
    },
    {
      ...dependencies,
      getSwapData: getOneInchCall(getNetworkContracts(NetworkIds.MAINNET, 1).swapAddress),
      operationExecutor: getNetworkContracts(NetworkIds.MAINNET, 1).operationExecutor.address,
      addresses: {
        DAI: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.DAI.address,
        // Currently tokens.ETH is being mapped to WETH
        ETH: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.ETH_ACTUAL.address,
        WSTETH: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.WSTETH.address,
        USDC: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.USDC.address,
        WBTC: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.WBTC.address,
      },
    },
  )
}

export const ajnaAdjust = ({
  state,
  commonPayload,
  dependencies,
  position,
  slippage,
  collateralToken,
  quoteToken,
}: {
  state: AjnaMultiplyFormState | AjnaBorrowFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
  slippage: BigNumber
  collateralToken: string
  quoteToken: string
}) => {
  const { loanToValue, depositAmount, withdrawAmount } = state

  return strategies.ajna.multiply.adjust(
    {
      ...commonPayload,
      collateralAmount: depositAmount || withdrawAmount || zero,
      riskRatio: new RiskRatio(
        loanToValue || (position as AjnaPosition).riskRatio.loanToValue,
        RiskRatio.TYPE.LTV,
      ),
      quoteTokenSymbol: quoteToken,
      collateralTokenSymbol: collateralToken,
      user: commonPayload.dpmProxyAddress,
      slippage,
      position: position as AjnaPosition,
    },
    {
      ...dependencies,
      getSwapData: getOneInchCall(getNetworkContracts(NetworkIds.MAINNET, 1).swapAddress),
      operationExecutor: getNetworkContracts(NetworkIds.MAINNET, 1).operationExecutor.address,
      addresses: {
        DAI: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.DAI.address,
        // Currently tokens.ETH is being mapped to WETH
        ETH: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.ETH_ACTUAL.address,
        WSTETH: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.WSTETH.address,
        USDC: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.USDC.address,
        WBTC: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.WBTC.address,
      },
    },
  )
}
