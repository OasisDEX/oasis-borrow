import { OpenAaveContext } from './types'

export function emptyProxyAddress({ proxyAddress }: OpenAaveContext) {
  return proxyAddress === undefined
}
export function enoughBalance({ amount, tokenBalance }: OpenAaveContext) {
  return tokenBalance !== undefined && amount !== undefined && tokenBalance.gt(amount)
}

export function validTransactionParameters({
  amount,
  proxyAddress,
  transactionParameters,
}: OpenAaveContext) {
  return amount !== undefined && proxyAddress !== undefined && transactionParameters !== undefined
}
