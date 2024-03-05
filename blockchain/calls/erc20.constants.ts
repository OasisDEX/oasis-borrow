import { amountFromWei } from '@oasisdex/utils'
import { BigNumber } from 'bignumber.js'

export const MIN_ALLOWANCE = new BigNumber('0xffffffffffffffffffffffffffffffff')

export const maxUint256 = amountFromWei(
  new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16),
)
