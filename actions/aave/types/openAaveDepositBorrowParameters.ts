import { AAVETokens } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { ProxyType } from 'features/aave/common'

export interface OpenAaveDepositBorrowParameters {
  context: Context
  collateralToken: AAVETokens
  debtToken: AAVETokens
  slippage: BigNumber
  collateralAmount: BigNumber
  borrowAmount: BigNumber
  proxyAddress: string
  proxyType: ProxyType
}
