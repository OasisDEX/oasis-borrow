import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { ManageTokenInput, ProxyType } from 'features/aave/common'

export interface ManageAaveParameters {
  context: Context
  currentPosition: IPosition
  slippage: BigNumber
  proxyAddress: string
  manageTokenInput?: ManageTokenInput
  amount: BigNumber
  token?: string
  proxyType: ProxyType
  shouldCloseToCollateral: boolean
}
