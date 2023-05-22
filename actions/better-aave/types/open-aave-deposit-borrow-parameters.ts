import { AAVETokens } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/common'
import { AaveLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from 'blockchain/networkIds'

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
