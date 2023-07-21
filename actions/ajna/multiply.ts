import {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaPool,
  AjnaPosition,
  RiskRatio,
  strategies,
} from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { AjnaGenericPosition } from 'features/ajna/common/types'
import { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'

export const DEFAULT_LTV_ON_NEW_POOL = new BigNumber(0.05)

export const ajnaOpenMultiply = ({
  state,
  commonPayload,
  dependencies,
  chainId,
  collateralToken,
  quoteToken,
  walletAddress,
  slippage,
}: {
  state: AjnaMultiplyFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  collateralToken: string
  quoteToken: string
  chainId: number
  walletAddress: string
  pool: AjnaPool
  slippage: BigNumber
}) => {
  const { depositAmount, loanToValue } = state

  // Align initial LTV of simulation with slider initial LTV
  // Avoids discrepancy between Order Form Info and slider
  // Slider also has logic that will iteratively adjust LTV towards a sensible value
  // Without requiring user input
  const initialLTV = DEFAULT_LTV_ON_NEW_POOL

  return strategies.ajna.multiply.open(
    {
      ...commonPayload,
      collateralAmount: depositAmount!,
      riskRatio: new RiskRatio(
        loanToValue || (initialLTV.isZero() ? DEFAULT_LTV_ON_NEW_POOL : initialLTV),
        RiskRatio.TYPE.LTV,
      ),
      slippage,
      collateralTokenSymbol: collateralToken,
      quoteTokenSymbol: quoteToken,
      user: walletAddress,
    },
    {
      ...dependencies,
      getSwapData: getOneInchCall(getNetworkContracts(NetworkIds.MAINNET, chainId).swapAddress),
      operationExecutor: getNetworkContracts(NetworkIds.MAINNET, chainId).operationExecutor.address,
      addresses: {
        DAI: getNetworkContracts(NetworkIds.MAINNET, chainId).tokens.DAI.address,
        // Currently tokens.ETH is being mapped to WETH
        ETH: getNetworkContracts(NetworkIds.MAINNET, 1).tokens.ETH_ACTUAL.address,
        WSTETH: getNetworkContracts(NetworkIds.MAINNET, chainId).tokens.WSTETH.address,
        USDC: getNetworkContracts(NetworkIds.MAINNET, chainId).tokens.USDC.address,
        WBTC: getNetworkContracts(NetworkIds.MAINNET, chainId).tokens.WBTC.address,
      },
    },
  )
}

export const ajnaAdjustMultiply = ({
  state,
  commonPayload,
  dependencies,
  position,
  slippage,
  collateralToken,
  quoteToken,
}: {
  state: AjnaMultiplyFormState
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

export const ajnaCloseMultiply = ({
  state,
  commonPayload,
  dependencies,
  position,
  slippage,
  collateralToken,
  quoteToken,
}: {
  state: AjnaMultiplyFormState
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
