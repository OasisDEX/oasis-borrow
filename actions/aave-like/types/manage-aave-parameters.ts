import { IPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { ManageTokenInput, ProxyType } from 'features/aave/types'
import { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'

export interface ManageAaveParameters {
  currentPosition: IPosition
  slippage: BigNumber
  proxyAddress: string
  userAddress: string,
  manageTokenInput?: ManageTokenInput
  amount: BigNumber
  token?: string
  proxyType: ProxyType
  shouldCloseToCollateral: boolean
  networkId: NetworkIds,
  protocol: AaveLendingProtocol | SparkLendingProtocol
}
