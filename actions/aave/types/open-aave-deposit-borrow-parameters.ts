import { AAVETokens } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/common'
import { AaveLendingProtocol } from '../../../lendingProtocols'
import { NetworkIds } from '../../../blockchain/networks'

export interface OpenAaveDepositBorrowParameters {
  collateralToken: AAVETokens
  debtToken: AAVETokens
  slippage: BigNumber
  collateralAmount: BigNumber
  borrowAmount: BigNumber
  proxyAddress: string
  userAddress: string
  proxyType: ProxyType
  protocol: AaveLendingProtocol
  networkId: NetworkIds
}
