import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'

export function roundHalfUp(amount: BigNumber, token: string) {
  const { digits } = getToken(token)

  return new BigNumber(amount.toFixed(digits, BigNumber.ROUND_HALF_UP))
}

export function roundDown(amount: BigNumber, token: string) {
  const { digits } = getToken(token)

  return new BigNumber(amount.toFixed(digits, BigNumber.ROUND_DOWN))
}
