import { IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { ProxyType } from 'features/aave/common'
import { AaveLendingProtocol } from 'lendingProtocols'

export interface OpenMultiplyAaveParameters {
  context: Context
  amount: BigNumber
  collateralToken: string
  debtToken: string
  depositToken: string
  token?: string // required for transaction parameters machine - set as deposit token
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  proxyType: ProxyType
  positionType: 'Multiply' | 'Earn' | 'Borrow'
  protocol: AaveLendingProtocol
}
