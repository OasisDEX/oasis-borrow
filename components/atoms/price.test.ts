import { expect } from 'chai'
import { describe, it } from 'mocha'
import { Currency } from './currency'
import { $Int } from './numeric'
import { Price } from './price'

describe.only('price', () => {
  const $base = new Currency('EUR', 2, $Int('100'))
  const $quote = new Currency('USD', 2, $Int('120'))

  const $EUR_USD = new Price($base, $quote)

  test('exchanges amoount', () => {
    const $amnt = new Currency('EUR', 2, $Int('1000')) // 10
    const x = $EUR_USD.exchange($amnt)
  })
})
