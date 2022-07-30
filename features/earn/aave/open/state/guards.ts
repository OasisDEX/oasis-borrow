import { OpenAaveContext } from './types'

export function emptyProxyAddress({ proxyAddress }: OpenAaveContext) {
  return proxyAddress === undefined
}
export function enoughBalance({ amount, tokenBalance }: OpenAaveContext) {
  return tokenBalance !== undefined && amount !== undefined && tokenBalance.gt(amount)
}
