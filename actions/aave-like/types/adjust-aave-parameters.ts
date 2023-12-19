import { IPosition, IRiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ManageTokenInput, ProductType, ProxyType } from 'features/aave/types'
import { AaveLendingProtocol, AaveLikeLendingProtocol } from 'lendingProtocols'
import { NetworkIds } from '../../../blockchain/networks'

export interface AdjustAaveParameters {
  userAddress: string
  currentPosition: IPosition
  riskRatio: IRiskRatio
  slippage: BigNumber
  proxyAddress: string
  manageTokenInput: ManageTokenInput
  amount: BigNumber
  proxyType: ProxyType
  positionType: ProductType
  protocol: AaveLikeLendingProtocol
  networkId: NetworkIds,
}
