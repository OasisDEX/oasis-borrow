import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { ManageTokenInput, ProxyType } from 'features/aave/common'
import { NetworkIds } from '../../../blockchain/networks'
import { AaveLendingProtocol } from '../../../lendingProtocols'

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
  protocol: AaveLendingProtocol
}
