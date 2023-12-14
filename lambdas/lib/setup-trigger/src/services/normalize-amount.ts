import { TokenBalance } from '~types'

export function normalizeAmount(token: TokenBalance, targetDecimals: number): bigint {
  return token.balance * 10n ** BigInt(targetDecimals - token.token.decimals)
}

export function getTheLeastCommonMultiple(...values: number[]): number {
  const max = Math.max(...values)
  const min = Math.min(...values)
  let result = max
  while (result % min !== 0) {
    result += max
  }
  return result
}
