import {
  AjnaCommonDependencies,
  AjnaCommonPayload,
  AjnaPool,
  AjnaPosition,
  normalizeValue,
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

const DEFAULT_LTV_ON_NEW_POOL = new BigNumber(0.05)

export const ajnaOpenMultiply = ({
  state,
  commonPayload,
  dependencies,
  chainId,
  collateralToken,
  quoteToken,
  walletAddress,
  pool,
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

  const minRiskRatio = normalizeValue(
    pool.poolMinDebtAmount.div(depositAmount!.times(commonPayload.collateralPrice)),
  )

  return strategies.ajna.multiply.open(
    {
      ...commonPayload,
      collateralAmount: depositAmount!,
      riskRatio: new RiskRatio(
        loanToValue || (minRiskRatio.isZero() ? DEFAULT_LTV_ON_NEW_POOL : minRiskRatio),
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
        ETH: getNetworkContracts(NetworkIds.MAINNET, chainId).tokens.ETH.address,
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
}: {
  state: AjnaMultiplyFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
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
      position: position as AjnaPosition,
    },
    dependencies,
  )
}

export const ajnaCloseMultiply = ({
  commonPayload,
  dependencies,
  position,
}: {
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  position: AjnaGenericPosition
}) => {
  return strategies.ajna.multiply.close(
    {
      ...commonPayload,
      collateralAmount: zero,
      position: position as AjnaPosition,
      riskRatio: new RiskRatio(zero, RiskRatio.TYPE.LTV),
    },
    dependencies,
  )
}
