import type BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

export const resolvePaybackAmount = ({
  paybackAmount,
  quoteBalance,
}: {
  paybackAmount?: BigNumber
  quoteBalance: BigNumber
}) => (paybackAmount?.gt(quoteBalance) ? quoteBalance : paybackAmount || zero)
