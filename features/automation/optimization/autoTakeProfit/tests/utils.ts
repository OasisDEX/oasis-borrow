import BigNumber from 'bignumber.js'
import { v4 } from 'uuid'

export function generateRandomBigNumber() {
  return BigNumber.random()
}

export function generateRandomString() {
  return v4().replaceAll('-', '')
}

export function generateRandomAddress() {
  return `0x00${v4().replaceAll('-', '')}`
}
