import { AAVETokens } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol, AaveLikeLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
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
  token?: string
  proxyType: ProxyType
  protocol: AaveLikeLendingProtocol
  networkId: NetworkIds
  positionType: 'Borrow'
}
