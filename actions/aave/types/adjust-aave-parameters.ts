import { IPosition, IRiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { ProductType, ProxyType } from 'features/aave/common'
import { AaveLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from '../../../blockchain/networkIds'

export interface AdjustAaveParameters {
  userAddress: string
  currentPosition: IPosition
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  amount: BigNumber
  proxyType: ProxyType
  positionType: ProductType
  protocol: AaveLendingProtocol
  networkId: NetworkIds,
}
