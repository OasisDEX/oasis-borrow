import type { BigNumber } from 'bignumber.js'

interface DaiAllowanceChange {
  kind: 'daiAllowance'
  daiAllowanceAmount?: BigNumber
}
interface DaiAllowanceUnlimitedChange {
  kind: 'daiAllowanceUnlimited'
}
interface DaiAllowancePaybackChange {
  kind: 'daiAllowanceAsPaybackAmount'
}
interface DaiAllowanceReset {
  kind: 'daiAllowanceReset'
}
interface CollateralAllowanceChange {
  kind: 'collateralAllowance'
  collateralAllowanceAmount?: BigNumber
}
interface CollateralAllowanceUnlimitedChange {
  kind: 'collateralAllowanceUnlimited'
}
interface CollateralAllowanceDepositChange {
  kind: 'collateralAllowanceAsDepositAmount'
}
interface CollateralAllowanceReset {
  kind: 'collateralAllowanceReset'
}

export type ManageVaultAllowanceChange =
  | DaiAllowanceChange
  | DaiAllowanceUnlimitedChange
  | DaiAllowancePaybackChange
  | DaiAllowanceReset
  | CollateralAllowanceChange
  | CollateralAllowanceUnlimitedChange
  | CollateralAllowanceDepositChange
  | CollateralAllowanceReset
