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

export interface Currency {
  amount: bigint
  symbol: string
  decimals: bigint
}

export function $createCurrencyFn(
  decimals: bigint,
  symbol: string,
  amount: bigint,
): Currency | never {
  if (decimals < 0) {
    throw new Error('Currency must have positive decimals')
  }
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

// upscales and
export function $scale(c: Currency, scale: BigInt): Currency | undefined {
  if (scale > 0n) {
    if (scale === c.decimals) {
      return c
    }
    if (scale > c.decimals) {
      // upscale
      return c
    }
    if (scale < c.decimals) {
      // NOTE: This will lose precision
      return c
    }
  }
  return undefined
}

export function $add({ a, b }: { a: Currency; b: Currency }): Currency | undefined {
  let decimalDiff, offset, upscaledAmount
  if (a.symbol === b.symbol) {
    if (a.decimals === b.decimals) {
      return $createCurrency(a.decimals, a.symbol, a.amount + b.amount)
    } else if (a.decimals > b.decimals) {
      decimalDiff = a.decimals - b.decimals
      offset = 10n ** decimalDiff
      upscaledAmount = b.amount * offset
      return $createCurrency(a.decimals, a.symbol, a.amount + upscaledAmount)
    } else {
      decimalDiff = b.decimals - a.decimals
      offset = 10n ** decimalDiff
      upscaledAmount = a.amount * offset
      return $createCurrency(b.decimals, a.symbol, upscaledAmount + b.amount)
    }
  }
  return undefined
}

// antecedent : consequent
// base : quote
// numerator : denominator
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

export function $print(
  c: Currency,
  options: PrintCurrencyOptions = {
    showSymbol: true,
  },
): string {
  const isNeg = c.amount < 0n
  if (isNeg) {
    c.amount = c.amount * -1n
  }
  let displayString = ''
  const amtStr = c.amount.toString()
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
