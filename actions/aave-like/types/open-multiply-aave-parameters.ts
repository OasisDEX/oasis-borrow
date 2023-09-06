import { IRiskRatio,Tokens } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol } from 'lendingProtocols'

export interface OpenMultiplyAaveParameters {
  amount: BigNumber
  collateralToken: Tokens
  debtToken: Tokens
  depositToken: Tokens
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  userAddress: string
  token?: string
  proxyType: ProxyType
  positionType: 'Multiply' | 'Earn',
  protocol: AaveLendingProtocol
  networkId: NetworkIds
}
