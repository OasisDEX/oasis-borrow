import BigNumber from 'bignumber.js'
import { getRandomString } from 'helpers/getRandomString'

export function generateRandomBigNumber() {
  return BigNumber.random()
}

export function generateRandomAddress() {
  return `0x00${getRandomString()}`
}
