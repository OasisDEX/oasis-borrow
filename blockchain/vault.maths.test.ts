import BigNumber from 'bignumber.js'
import { expect } from 'chai'

import { zero } from '../helpers/zero'
import { collateralPriceAtRatio } from './vault.maths'

describe('vault maths', () => {
  describe('collateralPriceAtRatioThreshold', () => {
    it('converts', () => {
      const colRatioPriceUsd = collateralPriceAtRatio({
        colRatio: new BigNumber(1.5),
        vaultDebt: new BigNumber(100),
        lockedCollateral: new BigNumber(1000),
      })

      expect(colRatioPriceUsd.toString()).equal('0.15')
    })

    it('handles zero collateral', () => {
      const colRatioPriceUsd = collateralPriceAtRatio({
        colRatio: new BigNumber(1.5),
        vaultDebt: new BigNumber(100),
        lockedCollateral: zero,
      })

      expect(colRatioPriceUsd.toString()).equal('0')
    })
  })
})
