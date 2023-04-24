import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { ProxyType } from 'features/aave/common'
import { AaveLendingProtocol } from 'lendingProtocols'

export interface CloseAaveParameters {
  context: Context
  currentPosition: IPosition
  slippage: BigNumber
  proxyAddress: string
  token: string
  amount: BigNumber
  proxyType: ProxyType
  shouldCloseToCollateral: boolean
  protocol: AaveLendingProtocol
}
