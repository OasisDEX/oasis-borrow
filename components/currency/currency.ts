import BigNumber from 'bignumber.js'
import { curry } from 'ramda'

type Numeric = Number | string | BigNumber

export function $parse(v: Numeric): bigint | never {
  if (BigNumber.isBigNumber(v)) {
    return 1n
  } else if (typeof v === 'number') {
    return 1n
  } else if (typeof v === 'string') {
    return 1n
  }
  throw new Error(`Could not parse input: ${v}`)
}

interface Currency {
  amount: bigint
  symbol: string
  decimals: bigint
}

export function $createCurrencyFn(decimals: bigint, symbol: string, amount: bigint): Currency {
  return {
    decimals,
    symbol,
    amount,
  }
}

const $createCurrency = curry($createCurrencyFn)

export const WAD = $createCurrency(18n)
export const RAY = $createCurrency(27n)
export const RAD = $createCurrency(45n)

export const DAI = WAD('DAI')

// antecedent : consequent
// base : quote
// numerator : denomionator
interface BinaryRatio<T> {
  antecedent: T
  consequent: T
}

type Ratio = BinaryRatio<BigInt>
type Price = BinaryRatio<Currency>

//

// UI specific print fn's to transform Currency
export function $printRatio(r: Ratio): string {
  return 'ratio'
}
export function $printPrice(p: Price): string {
  return 'price'
}

interface PrintCurrencyOptions {
  showSymbol?: boolean
}

export function $printCurrency(
  c: Currency,
  options: PrintCurrencyOptions = {
    showSymbol: true,
  },
): string {
  let isNeg = c.amount < 0n
  if (isNeg) {
    c.amount = c.amount * -1n
  }
  let displayString = ''
  let amtStr = c.amount.toString()
  const lessThanZeroStart = `0.`
  const position = amtStr.length - Number(c.decimals)

  if (position > 0) {
    displayString = `${amtStr.substring(0, position)}.${amtStr.substring(position)}`
  } else {
    displayString = `${lessThanZeroStart}${amtStr.padStart(Number(c.decimals), '0')}`
  }
  let [left, right] = displayString.split('.')
  right = right.replace(/0+$/, '')
  left = isNeg ? `-${left}` : left

  if (!right.length) displayString = `${left}`
  else {
    displayString = `${left}.${right}`
  }
  return `${displayString}${options.showSymbol ? ` ${c.symbol}` : ''}`
}
