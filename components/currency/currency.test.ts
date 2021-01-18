/*
 *
 * Smart contract drip
 *
 * function drip(bytes32 ilk) external note returns (uint rate) {
        require(now >= ilks[ilk].rho, "Jug/invalid-now");
        (, uint prev) = vat.ilks(ilk);
        rate = rmul(rpow(add(base, ilks[ilk].duty), now - ilks[ilk].rho, ONE), prev);
        vat.fold(ilk, vow, diff(rate, prev));
        ilks[ilk].rho = now;
    }

    rate = rmul(rpow(add(base, ilks[ilk].duty), now - ilks[ilk].rho, ONE), prev);

    base - "0"
    duty - "1000000000782997609082909351"
    ONE - 10 ** 27
    prev - "1026317734294511797161403874
    rate - "1026317878139697269316455705"

 */

import { expect } from 'chai'
import { Discrete } from 'money-ts/lib/Discrete'
import { Dense } from 'money-ts/lib/Dense'

import { wrap as wrapAsInteger } from 'money-ts/lib/Integer'

import { wrap as wrapAsNatural, one as N_ONE } from 'money-ts/lib/Natural'
import { wrap as wrapAsNonZeroInteger, one as NZ_ONE } from 'money-ts/lib/NonZeroInteger'
import { NonZeroRational, one as NZR_ONE } from 'money-ts/lib/NonZeroRational'

import bigInt from 'big-integer'
import { Rational, show } from 'money-ts/lib/Rational'

describe.only('money-ts', () => {
  describe('Discrete', () => {
    it('add', () => {
      const intX = wrapAsInteger(bigInt(101))
      const intY = wrapAsInteger(bigInt(2))

      const x = new Discrete({ dimension: 'USD', unit: 2 }, intX)
      const y = new Discrete({ dimension: 'USD', unit: 2 }, intY)

      const z = x.add(y)
      expect(z.toString()).equals('USD 2 103') // 1.03 USD
    })

    it('precision behaviour', () => {
      const intA = wrapAsInteger(bigInt(4))
      const intB = wrapAsNonZeroInteger(bigInt(3)).getOrElse(NZ_ONE)

      const disA = new Discrete({ dimension: 'USD', unit: 2 }, intA)

      const disB = disA.div(intB)
      expect(disB.toString()).equals('USD 2 1') // 0.01 USD
      const disC = disB.mul(intB)
      expect(disC.toString()).equals('USD 2 3') // 0.03 USD - lost 0.01 in division
    })
  })

  describe('Dense', () => {
    it('add', () => {
      const intX = wrapAsInteger(bigInt(101))
      const natX = wrapAsNatural(bigInt(100)).getOrElse(N_ONE)
      const ratX = [intX, natX] as Rational

      const intY = wrapAsInteger(bigInt(2))
      const natY = wrapAsNatural(bigInt(100)).getOrElse(N_ONE)
      const ratY = [intY, natY] as Rational

      const x = new Dense('USD', ratX)
      const y = new Dense('USD', ratY)

      const z = x.add(y)

      expect(z.toString()).equals('USD 103 / 100')
    })

    it('precision behaviour', () => {
      const intA = wrapAsInteger(bigInt(4))
      const natA = wrapAsNatural(bigInt(100)).getOrElse(N_ONE)
      const ratA = [intA, natA] as Rational

      const intB = wrapAsNonZeroInteger(bigInt(3)).getOrElse(NZ_ONE)
      const natB = wrapAsNatural(bigInt(100)).getOrElse(N_ONE)
      const ratB = [intB, natB] as NonZeroRational

      const denA = new Dense('USD', ratA) // 0.04 USD

      const denB = denA.div(ratB)
      expect(denB.toString()).equals('USD 4 / 3') // 0.013333333333 ... USD
      const denC = denB.mul(ratB)
      expect(denC.toString()).equals('USD 1 / 25') // 0.04 USD
    })
  })
})
