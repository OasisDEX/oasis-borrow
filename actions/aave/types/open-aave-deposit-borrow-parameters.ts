import { AAVETokens } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from '../../../blockchain/networks'

export interface OpenAaveDepositBorrowParameters {
  collateralToken: AAVETokens
  debtToken: AAVETokens
  depositToken: AAVETokens
  slippage: BigNumber
  collateralAmount: BigNumber
  borrowAmount: BigNumber
  proxyAddress: string
  userAddress: string
  proxyType: ProxyType
  protocol: AaveLendingProtocol
  networkId: NetworkIds
  positionType: 'Borrow'
}
