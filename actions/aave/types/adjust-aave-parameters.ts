import { IPosition, IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProductType, ProxyType } from 'features/aave/types'
import { AaveLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from '../../../blockchain/networks'

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
