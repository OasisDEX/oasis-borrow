import { IPosition, PositionType } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ProxyType } from 'features/aave/common'
import { AaveLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from 'blockchain/networkIds'

export interface CloseAaveParameters {
  currentPosition: IPosition
  slippage: BigNumber
  proxyAddress: string
  userAddress: string
  token: string
  amount: BigNumber
  proxyType: ProxyType
  shouldCloseToCollateral: boolean
  protocol: AaveLendingProtocol
  networkId: NetworkIds
  positionType: PositionType
}
