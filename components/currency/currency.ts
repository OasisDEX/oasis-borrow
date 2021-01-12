import BigNumber from 'bignumber.js'
import { curry } from 'ramda'

// antecedent : consequent
interface BinaryRatio<T> {
  antecedent: T
  consequent: T
}

interface Currency {
  amount: bigint
  symbol: string
  decimals: bigint
}

type Ratio = BinaryRatio<BigInt>
type Price = BinaryRatio<Currency>

type Numberish = Number | string | BigNumber

export function parseAsBigInt(v: Numberish) {
  if (BigNumber.isBigNumber(v)) {
    return BigInt(1)
  } else if (typeof v === 'number') {
    return BigInt(1)
  } else if (typeof v === 'string') {
    return BigInt(1)
  }
  throw new Error(`Could not parse input: ${v}`)
}

export function $createCurrency(decimals: bigint, symbol: string, amount: bigint): Currency {
  return {
    decimals,
    symbol,
    amount,
  }
}

const createCurrency = curry($createCurrency)

export const WAD = createCurrency(18n)
export const RAY = createCurrency(27n)
export const RAD = createCurrency(45n)

interface currencyPrintOptions {
  showSymbol?: boolean
}

export function $print(
  c: Currency,
  options: currencyPrintOptions = {
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
