import type { AjnaCommonDependencies, AjnaCommonPayload, AjnaPool } from '@oasisdex/dma-library'
import { normalizeValue, RiskRatio, strategies } from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import type { MultiplyFormState } from 'features/ajna/positions/multiply/state/multiplyFormReducto.types'
import { getOneInchCall } from 'helpers/swap'

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
  state: MultiplyFormState
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

  /**
   * Works when deposit amount is high, and pool min debt amount is low
   * However, when deposit amount is low and pool min debt amount is high it easily
   * results in LTVs > 100%
   * Suggested 0.5 LTV which frequently will be in breach of the pool min debt amount
   * However, multiply pool validation should point the user in the correct direction
   */
  const initialLTV = normalizeValue(
    pool.poolMinDebtAmount.div(depositAmount!.times(commonPayload.collateralPrice)),
  ).gt(1)
    ? new BigNumber(0.5)
    : normalizeValue(
        pool.poolMinDebtAmount.div(depositAmount!.times(commonPayload.collateralPrice)),
      )

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
