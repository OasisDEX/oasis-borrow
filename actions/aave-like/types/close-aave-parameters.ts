import { IPosition, PositionType } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/types'
import { AaveLendingProtocol, AaveLikeLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from '../../../blockchain/networks'

export interface CloseAaveParameters {
  currentPosition: IPosition
  slippage: BigNumber
  proxyAddress: string
  userAddress: string
  token: string
  amount: BigNumber
  proxyType: ProxyType
  shouldCloseToCollateral: boolean
  protocol: AaveLikeLendingProtocol
  networkId: NetworkIds
  positionType: PositionType
}
