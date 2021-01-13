import { expect } from 'chai'
import { Currency, WAD, RAY, RAD, $add, $print } from './currency'
import BigNumber from 'bignumber.js'
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

describe.only('currency', () => {
  // const ONE_WAD_TKN = WAD('TKN')(1n) // 18
  // const ONE_RAY_TKN = RAY('TKN')(1n) // 27
  // const ONE_RAD_TKN = RAD('TKN')(1n) // 45

  // describe('$add', () => {

  //   it('adds', () => {
  //     const amount = $add({ a: ONE_WAD_TKN, b: ONE_RAD_TKN })
  //     expect($print(amount as Currency)).to.equal(
  //       '0.000000000000000001000000000000000000000000001 TKN',
  //     )
  //   })
  // })

  const rawDuty = '1000000000782997609082909351'
  const ONE = '1000000000000000000000000000'
  const base = '0'
  const now = (Date.now() / 1000).toString()
})
