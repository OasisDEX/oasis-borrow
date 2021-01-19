import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { Currency } from './currency'

describe.only('currency', () => {
  const iso = 'TKN'
  const unit = 2

  const c = (v: any) => new Currency(iso, unit, v)

  it('can be constructed with integer strings', () => {
    expect(c('1').toString()).equals('TKN 2 1')
    expect(c('-1').toString()).equals('TKN 2 -1')
    expect(c('0').toString()).equals('TKN 2 0')
    expect(c('-0').toString()).equals('TKN 2 0')
    expect(c('100').toString()).equals('TKN 2 100')
    expect(c(Number.MAX_SAFE_INTEGER.toString()).toString()).equals('TKN 2 9007199254740991')
    expect(c(Number.MIN_SAFE_INTEGER.toString()).toString()).equals('TKN 2 -9007199254740991')
  })

  it('can be constructed with integer bignumbers', () => {
    expect(c(new BigNumber('1')).toString()).equals('TKN 2 1')
    expect(c(new BigNumber('-1')).toString()).equals('TKN 2 -1')
    expect(c(new BigNumber('0')).toString()).equals('TKN 2 0')
    expect(c(new BigNumber('-0')).toString()).equals('TKN 2 0')
    expect(c('100').toString()).equals('TKN 2 100')
    expect(c(Number.MAX_SAFE_INTEGER.toString()).toString()).equals('TKN 2 9007199254740991')
    expect(c(Number.MIN_SAFE_INTEGER.toString()).toString()).equals('TKN 2 -9007199254740991')
  })
})

// describe.only('money-ts', () => {
//   describe('Discrete', () => {
//     it('add', () => {
//       const intX = wrapAsInteger(bigInt(101))
//       const intY = wrapAsInteger(bigInt(2))

//       const x = new Discrete({ dimension: 'USD', unit: 2 }, intX)
//       const y = new Discrete({ dimension: 'USD', unit: 2 }, intY)

//       const z = x.add(y)
//       expect(z.toString()).equals('USD 2 103') // 1.03 USD
//     })

//     it('precision behaviour', () => {
//       const intA = wrapAsInteger(bigInt(4))
//       const intB = wrapAsNonZeroInteger(bigInt(3)).getOrElse(NZ_ONE)

//       const disA = new Discrete({ dimension: 'USD', unit: 2 }, intA)

//       const disB = disA.div(intB)
//       expect(disB.toString()).equals('USD 2 1') // 0.01 USD
//       const disC = disB.mul(intB)
//       expect(disC.toString()).equals('USD 2 3') // 0.03 USD - lost 0.01 in division
//     })
//   })

//   describe('Dense', () => {
//     it('add', () => {
//       const intX = wrapAsInteger(bigInt(101))
//       const natX = wrapAsNatural(bigInt(100)).getOrElse(N_ONE)
//       const ratX = [intX, natX] as Rational

//       const intY = wrapAsInteger(bigInt(2))
//       const natY = wrapAsNatural(bigInt(100)).getOrElse(N_ONE)
//       const ratY = [intY, natY] as Rational

//       const x = new Dense('USD', ratX)
//       const y = new Dense('USD', ratY)

//       const z = x.add(y)

//       expect(z.toString()).equals('USD 103 / 100')
//     })

//     it('precision behaviour', () => {
//       const intA = wrapAsInteger(bigInt(4))
//       const natA = wrapAsNatural(bigInt(100)).getOrElse(N_ONE)
//       const ratA = [intA, natA] as Rational

//       const intB = wrapAsNonZeroInteger(bigInt(3)).getOrElse(NZ_ONE)
//       const natB = wrapAsNatural(bigInt(100)).getOrElse(N_ONE)
//       const ratB = [intB, natB] as NonZeroRational

//       const denA = new Dense('USD', ratA) // 0.04 USD

//       const denB = denA.div(ratB)
//       expect(denB.toString()).equals('USD 4 / 3') // 0.013333333333 ... USD
//       const denC = denB.mul(ratB)
//       expect(denC.toString()).equals('USD 1 / 25') // 0.04 USD
//     })
//   })
// })
