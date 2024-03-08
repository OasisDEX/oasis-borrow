import type {
  AaveDepositBorrowArgsOmni,
  AaveDepositBorrowDependenciesOmni,
  AaveOpenDepositBorrowArgsOmni,
  AaveOpenDepositBorrowDependenciesOmni,
  AavePaybackWithdrawArgsOmni,
  AavePaybackWithdrawDependenciesOmni,
} from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'

const defaultPromise = Promise.resolve(undefined)

export const aaveActionOpenDepositBorrow = ({
  commonPayload,
  dependencies,
  protocolVersion,
}: {
  commonPayload: AaveOpenDepositBorrowArgsOmni
  dependencies: AaveOpenDepositBorrowDependenciesOmni
  protocolVersion?: string
}) => {
  if (!protocolVersion) {
    return defaultPromise
  }

  return strategies.aave.borrow.omni[protocolVersion as 'v2' | 'v3'].openDepositBorrow(
    commonPayload,
    dependencies,
  )
}

export const aaveActionDepositBorrow = ({
  commonPayload,
  dependencies,
  protocolVersion,
}: {
  commonPayload: AaveDepositBorrowArgsOmni
  dependencies: AaveDepositBorrowDependenciesOmni
  protocolVersion?: string
}) => {
  if (!protocolVersion) {
    return defaultPromise
  }

  return strategies.aave.borrow.omni[protocolVersion as 'v2' | 'v3'].depositBorrow(
    commonPayload,
    dependencies,
  )
}

export const aaveActionPaybackWithdraw = ({
  commonPayload,
  dependencies,
  protocolVersion,
}: {
  commonPayload: AavePaybackWithdrawArgsOmni
  dependencies: AavePaybackWithdrawDependenciesOmni
  protocolVersion?: string
}) => {
  if (!protocolVersion) {
    return defaultPromise
  }

  return strategies.aave.borrow.omni[protocolVersion as 'v2' | 'v3'].paybackWithdraw(
    commonPayload,
    dependencies,
  )
}
