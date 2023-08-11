import { AAVETokens, IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from 'blockchain/networks'

export interface OpenMultiplyAaveParameters {
  amount: BigNumber
  collateralToken: AAVETokens
  debtToken: AAVETokens
  depositToken: AAVETokens
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  userAddress: string
  proxyType: ProxyType
  positionType: 'Multiply' | 'Earn',
  protocol: AaveLendingProtocol
  networkId: NetworkIds
}
