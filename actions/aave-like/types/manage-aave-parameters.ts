import { IPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ManagePositionForm, ProxyType } from 'features/aave/types'
import { NetworkIds } from '../../../blockchain/networks'
import { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'

export interface ManageAaveParameters {
  currentPosition: IPosition
  slippage: BigNumber
  proxyAddress: string
  userAddress: string,
  manageTokenInput?: ManagePositionForm
  amount: BigNumber
  token?: string
  proxyType: ProxyType
  shouldCloseToCollateral: boolean
  networkId: NetworkIds,
  protocol: AaveLendingProtocol | SparkLendingProtocol
}
