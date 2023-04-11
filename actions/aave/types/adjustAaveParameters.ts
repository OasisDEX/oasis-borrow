import { IPosition, IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { ProductType, ProxyType } from 'features/aave/common'
import { AaveLendingProtocol } from 'lendingProtocols'

export interface AdjustAaveParameters {
  context: Context
  currentPosition: IPosition
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  amount: BigNumber
  proxyType: ProxyType
  positionType: ProductType
  protocol: AaveLendingProtocol

}
