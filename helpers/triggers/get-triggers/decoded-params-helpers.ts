import BigNumber from 'bignumber.js'
import { ten } from 'helpers/zero'

export const getLtvNumberFromDecodedParam = (decodedParam: string | undefined) => {
  if (!decodedParam) {
    return undefined
  }
  const number = parseInt(decodedParam)

  return number / 100
}

export const parsePriceFromDecodedParam = (
  price: string | undefined,
  decimals: number | undefined,
) => {
  if (!price) {
    return undefined
  }

  if (!decimals) {
    return undefined
  }

  const bigNumber = new BigNumber(price)
  return bigNumber.div(ten.pow(decimals))
}

export const getIntFromDecodedParam = (decodedParam: string | undefined) => {
  if (!decodedParam) {
    return undefined
  }

  return parseInt(decodedParam)
}
