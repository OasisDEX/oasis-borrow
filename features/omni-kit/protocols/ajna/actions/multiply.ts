import type { AjnaCommonDependencies, AjnaCommonPayload, AjnaPool } from '@oasisdex/dma-library'
import { normalizeValue, RiskRatio, strategies } from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { omniSwapVersionMap } from 'features/omni-kit/constants'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { getOneInchCall } from 'helpers/swap'

const DEFAULT_LTV_ON_NEW_POOL = new BigNumber(0.05)

export const ajnaActionOpenMultiply = ({
  state,
  commonPayload,
  dependencies,
  networkId,
  collateralToken,
  quoteToken,
  walletAddress,
  pool,
  slippage,
}: {
  state: OmniMultiplyFormState
  commonPayload: AjnaCommonPayload
  dependencies: AjnaCommonDependencies
  collateralToken: string
  quoteToken: string
  networkId: OmniSupportedNetworkIds
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
      getSwapData: getOneInchCall(
        getNetworkContracts(networkId).swapAddress,
        networkId,
        omniSwapVersionMap[networkId],
      ),
      operationExecutor: getNetworkContracts(networkId).operationExecutor.address,
      addresses: {
        DAI: getNetworkContracts(networkId).tokens.DAI.address,
        // Currently tokens.ETH is being mapped to WETH
        ETH: getNetworkContracts(networkId, 1).tokens.ETH_ACTUAL.address,
        WSTETH: getNetworkContracts(networkId).tokens.WSTETH.address,
        USDC: getNetworkContracts(networkId).tokens.USDC.address,
        WBTC: getNetworkContracts(networkId).tokens.WBTC.address,
      },
    },
  )
}
