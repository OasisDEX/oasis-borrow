import { ManageAaveContext } from './types'

export function emptyProxyAddress({ proxyAddress }: ManageAaveContext) {
  return proxyAddress === undefined
}
export function enoughBalance({ amount, tokenBalance }: ManageAaveContext) {
  return tokenBalance !== undefined && amount !== undefined && tokenBalance.gt(amount)
}

export function validTransactionParameters({
  amount,
  proxyAddress,
  transactionParameters,
}: ManageAaveContext) {
  return amount !== undefined && proxyAddress !== undefined && transactionParameters !== undefined
}

export function validCloseTransactionParameters({
  proxyAddress,
  transactionParameters,
}: ManageAaveContext) {
  return proxyAddress !== undefined && transactionParameters !== undefined
}
