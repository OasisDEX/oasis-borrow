import type {
  SparkDepositBorrowArgsOmni,
  SparkDepositBorrowDependenciesOmni,
  SparkOpenDepositBorrowArgsOmni,
  SparkOpenDepositBorrowDependenciesOmni,
  SparkPaybackWithdrawArgsOmni,
  SparkPaybackWithdrawDependenciesOmni,
} from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'

export const sparkActionOpenDepositBorrow = ({
  commonPayload,
  dependencies,
}: {
  commonPayload: SparkOpenDepositBorrowArgsOmni
  dependencies: SparkOpenDepositBorrowDependenciesOmni
}) => {
  return strategies.spark.omni.borrow.openDepositBorrow(commonPayload, dependencies)
}

export const sparkActionDepositBorrow = ({
  commonPayload,
  dependencies,
}: {
  commonPayload: SparkDepositBorrowArgsOmni
  dependencies: SparkDepositBorrowDependenciesOmni
}) => {
  return strategies.spark.omni.borrow.depositBorrow(commonPayload, dependencies)
}

export const sparkActionPaybackWithdraw = ({
  commonPayload,
  dependencies,
}: {
  commonPayload: SparkPaybackWithdrawArgsOmni
  dependencies: SparkPaybackWithdrawDependenciesOmni
}) => {
  return strategies.spark.omni.borrow.paybackWithdraw(commonPayload, dependencies)
}
