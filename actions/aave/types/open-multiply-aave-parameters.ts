import { IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from 'blockchain/networks'

export interface OpenMultiplyAaveParameters {
  amount: BigNumber
  collateralToken: string
  debtToken: string
  depositToken: string
  token?: string // required for transaction parameters machine - set as deposit token
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  userAddress: string
  proxyType: ProxyType
  positionType: 'Multiply' | 'Earn' | 'Borrow'
  protocol: AaveLendingProtocol
  networkId: NetworkIds
}
