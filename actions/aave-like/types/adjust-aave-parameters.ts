import { IPosition, IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { ProductType, ProxyType } from 'features/aave/types'
import { AaveLendingProtocol, AaveLikeLendingProtocol } from 'lendingProtocols'

export interface AdjustAaveParameters {
  userAddress: string
  currentPosition: IPosition
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  amount: BigNumber
  proxyType: ProxyType
  positionType: ProductType
  protocol: AaveLikeLendingProtocol
  networkId: NetworkIds,
}
