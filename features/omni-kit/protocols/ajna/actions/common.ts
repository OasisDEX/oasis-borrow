import type { AjnaCommonDependencies, AjnaCommonPayload, AjnaPosition } from '@oasisdex/dma-library'
import { RiskRatio, strategies } from '@oasisdex/dma-library'
import type { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { omniSwapVersionMap } from 'features/omni-kit/constants'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { getOneInchCall } from 'helpers/swap'
import { zero } from 'helpers/zero'

export const ajnaActionClose = ({
  collateralToken,
  commonPayload,
  dependencies,
  networkId,
  position,
  quoteToken,
  slippage,
  state,
}: {
  collateralToken: string
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  networkId: OmniSupportedNetworkIds
  position: AjnaGenericPosition
  quoteToken: string
  slippage: BigNumber
  state: OmniMultiplyFormState | OmniBorrowFormState
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
      getSwapData: getOneInchCall(
        getNetworkContracts(networkId).swapAddress,
        networkId,
        omniSwapVersionMap[networkId],
      ),
      operationExecutor: getNetworkContracts(networkId).operationExecutor.address,
      addresses: {
        DAI: getNetworkContracts(networkId).tokens.DAI.address,
        // Currently tokens.ETH is being mapped to WETH
        ETH: getNetworkContracts(networkId).tokens.ETH_ACTUAL.address,
        WSTETH: getNetworkContracts(networkId).tokens.WSTETH.address,
        USDC: getNetworkContracts(networkId).tokens.USDC.address,
        WBTC: getNetworkContracts(networkId).tokens.WBTC.address,
      },
    },
  )
}

export const ajnaActionAdjust = ({
  collateralToken,
  commonPayload,
  dependencies,
  networkId,
  position,
  quoteToken,
  slippage,
  state,
}: {
  collateralToken: string
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  networkId: OmniSupportedNetworkIds
  position: AjnaGenericPosition
  quoteToken: string
  slippage: BigNumber
  state: OmniMultiplyFormState | OmniBorrowFormState
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
      getSwapData: getOneInchCall(
        getNetworkContracts(networkId).swapAddress,
        networkId,
        omniSwapVersionMap[networkId],
      ),
      operationExecutor: getNetworkContracts(networkId).operationExecutor.address,
      addresses: {
        DAI: getNetworkContracts(networkId).tokens.DAI.address,
        // Currently tokens.ETH is being mapped to WETH
        ETH: getNetworkContracts(networkId).tokens.ETH_ACTUAL.address,
        WSTETH: getNetworkContracts(networkId).tokens.WSTETH.address,
        USDC: getNetworkContracts(networkId).tokens.USDC.address,
        WBTC: getNetworkContracts(networkId).tokens.WBTC.address,
      },
    },
  )
}
