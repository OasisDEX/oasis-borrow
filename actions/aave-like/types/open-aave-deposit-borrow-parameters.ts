import { Tokens } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/types'
import { AaveLikeLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from '../../../blockchain/networks'

export interface OpenAaveDepositBorrowParameters {
  collateralToken: Tokens
  debtToken: Tokens
  depositToken: Tokens
  slippage: BigNumber
  collateralAmount: BigNumber
  borrowAmount: BigNumber
  proxyAddress: string
  userAddress: string
  token?: string
  proxyType: ProxyType
  protocol: AaveLikeLendingProtocol
  networkId: NetworkIds
  positionType: 'Borrow'
}
