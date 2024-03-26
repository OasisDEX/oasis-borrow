import BigNumber from 'bignumber.js'
import { getToken, getTokenGuarded } from 'blockchain/tokensMetadata'
import { amountFromWei } from 'blockchain/utils'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import dayjs from 'dayjs'
import { billion, million, one, oneThousandth, ten, thousand, zero } from 'helpers/zero'

BigNumber.config({
  FORMAT: {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
  },
  EXPONENTIAL_AT: 100000,
})

export function toShorthandNumber(amount: BigNumber, suffix: string = '', precision?: number) {
  const sh = new BigNumber(
    amount
      .toString()
      .split('.')
      .map((part, index) => {
        if (index === 0) return part
        return part.substr(0, precision)
      })
      .filter((el) => el)
      .join('.'),
  )
  if (precision) {
    return sh.toFixed(precision).concat(suffix)
  }
  return sh.toFixed().concat(suffix)
}

export function formatAsShorthandNumbers(amount: BigNumber, precision?: number): string {
  if (amount.absoluteValue().gte(billion)) {
    return toShorthandNumber(amount.dividedBy(billion), 'B', precision)
  }
  if (amount.absoluteValue().gte(million)) {
    return toShorthandNumber(amount.dividedBy(million), 'M', precision)
  }
  if (amount.absoluteValue().gte(thousand)) {
    return toShorthandNumber(amount.dividedBy(thousand), 'K', precision)
  }
  return toShorthandNumber(amount, '', precision)
}

export function formatCryptoBalance(amount: BigNumber): string {
  const absAmount = amount.absoluteValue()

  if (absAmount.eq(zero)) {
    return formatAsShorthandNumbers(amount, 2)
  }

  if (absAmount.lt(oneThousandth)) {
    return `${amount.isNegative() ? '0.000' : '<0.001'}`
  }

  if (absAmount.lt(ten)) {
    return formatAsShorthandNumbers(amount, 4)
  }

  if (absAmount.lt(million)) return amount.toFormat(2, BigNumber.ROUND_DOWN)

  return formatAsShorthandNumbers(amount, 2)
}

export function formatUsdValue(amount: BigNumber, decimalPlaces = 2): string {
  const absoluteAmount = amount.absoluteValue()

  return amount.isZero()
    ? '$0.00'
    : absoluteAmount.lt(0.01)
      ? `$<${amount.isNegative() ? '-' : ''}0.01`
      : absoluteAmount.lt(million)
        ? `$${amount.toFormat(decimalPlaces, BigNumber.ROUND_DOWN)}`
        : `$${formatAsShorthandNumbers(amount, decimalPlaces)}`
}

export function formatFiatBalance(amount: BigNumber): string {
  const absAmount = amount.absoluteValue()

  if (absAmount.eq(zero)) return formatAsShorthandNumbers(amount, 2)
  if (absAmount.lt(one)) return formatAsShorthandNumbers(amount, 4)
  if (absAmount.lt(million)) return amount.toFormat(2, BigNumber.ROUND_DOWN)
  // We don't want to have numbers like 999999 formatted as 999.99k

  return formatAsShorthandNumbers(amount, 2)
}

export function formatAmount(amount: BigNumber, token: string): string {
  const digits = token === 'USD' ? 2 : getTokenGuarded(token)?.digits || DEFAULT_TOKEN_DIGITS
  return amount.toFormat(digits, BigNumber.ROUND_DOWN)
}

export function formatAmountWithPrecision(amount: BigNumber, token: string): string {
  return formatAmount(amountFromWei(amount, token), token)
}

export function formatPrice(amount: BigNumber, token: string): string {
  return amount.toFormat(getToken(token).digits, BigNumber.ROUND_HALF_UP)
}

export function formatPriceUp(amount: BigNumber, token: string): string {
  return amount.toFormat(getToken(token).digits, BigNumber.ROUND_UP)
}

export function formatPriceDown(amount: BigNumber, token: string): string {
  return amount.toFormat(getToken(token).digits, BigNumber.ROUND_DOWN)
}

export function formatPrecision(amount: BigNumber, precision: number): string {
  return amount.toFormat(precision, BigNumber.ROUND_DOWN)
}

interface FormatPercentOptions {
  precision?: number
  plus?: boolean
  noPercentSign?: boolean
  roundMode?: BigNumber.RoundingMode
}

export function formatPercent(
  number: BigNumber,
  {
    precision = 0,
    plus = false,
    roundMode = undefined,
    noPercentSign = false,
  }: FormatPercentOptions = {},
) {
  const sign = plus && number.isGreaterThan(0) ? '+' : ''

  return `${sign}${number.toFixed(precision, roundMode)}${noPercentSign ? '' : '%'}`
}

export function formatDecimalAsPercent(
  number: BigNumber,
  {
    precision = 2,
    plus = false,
    roundMode = BigNumber.ROUND_DOWN,
    noPercentSign = false,
  }: FormatPercentOptions = {},
) {
  return formatPercent(number.times(100), {
    precision,
    plus,
    roundMode,
    noPercentSign,
  })
}

export function formatLtvDecimalAsPercent(
  number: BigNumber,
  {
    precision = 2,
    plus = false,
    roundMode = BigNumber.ROUND_DOWN,
    noPercentSign = false,
  }: FormatPercentOptions = {},
) {
  const ltvHighestUiValue = new BigNumber(1.1)
  const value = number.gt(ltvHighestUiValue) ? ltvHighestUiValue : number
  const percentageValue = formatPercent(value.times(100), {
    precision,
    plus,
    roundMode,
    noPercentSign,
  })

  if (number.gt(ltvHighestUiValue)) {
    return `>${percentageValue}`
  }

  return percentageValue
}

export function formatDateTime(time: Date, showMs?: boolean): string {
  return dayjs(time).format(showMs ? 'DD.MM HH:mm:ss' : 'DD.MM HH:mm')
}

export function formatAddress(address: string, first: number = 4, last: number = 5) {
  return `${address.slice(0, first)}...${address.slice(-last)}`
}

export function shortenTokenSymbol({
  token,
  length = 15,
  first = 3,
  last = 3,
}: {
  token: string
  length?: number
  first?: number
  last?: number
}) {
  return token.length > length ? `${token.slice(0, first)}...${token.slice(-last)}` : token
}

export function formatBigNumber(amount: BigNumber, digits: number) {
  return amount.dp(digits, BigNumber.ROUND_DOWN).toString()
}
