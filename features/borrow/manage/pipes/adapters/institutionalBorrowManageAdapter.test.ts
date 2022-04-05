import BigNumber from 'bignumber.js'
import { expect } from 'chai'

import { zero } from '../../../../../helpers/zero'
import { increasingRisk } from './institutionalBorrowManageAdapter'

describe('InstitutionalBorrowManageAdapter', () => {
  describe('increasingRisk', () => {
    it('shows as risk not increasing when increasing collateralisation ratio', () => {
      const result = increasingRisk({
        inputAmountsEmpty: false,
        afterCollateralizationRatioAtNextPrice: new BigNumber(1.6),
        afterCollateralizationRatio: new BigNumber(1.6),
        vault: {
          collateralizationRatioAtNextPrice: new BigNumber(1.5),
          collateralizationRatio: new BigNumber(1.5),
        },
      })

      expect(result).eq(false)
    })

    it('shows as risk increasing when decreasing collateralisation ratio', () => {
      const result = increasingRisk({
        inputAmountsEmpty: false,
        afterCollateralizationRatioAtNextPrice: new BigNumber(1.5),
        afterCollateralizationRatio: new BigNumber(1.5),
        vault: {
          collateralizationRatioAtNextPrice: new BigNumber(1.6),
          collateralizationRatio: new BigNumber(1.6),
        },
      })

      expect(result).eq(true)
    })

    it('shows as risk not increasing when there are no input values', () => {
      const result = increasingRisk({
        inputAmountsEmpty: true,
        afterCollateralizationRatioAtNextPrice: new BigNumber(1.5),
        afterCollateralizationRatio: new BigNumber(1.5),
        vault: {
          collateralizationRatioAtNextPrice: new BigNumber(1.6),
          collateralizationRatio: new BigNumber(1.6),
        },
      })

      expect(result).eq(false)
    })

    it('shows as risk increasing when only next price col ratio decreasing', () => {
      const result = increasingRisk({
        inputAmountsEmpty: true,
        afterCollateralizationRatioAtNextPrice: new BigNumber(1.5),
        afterCollateralizationRatio: new BigNumber(1.6),
        vault: {
          collateralizationRatioAtNextPrice: new BigNumber(1.6),
          collateralizationRatio: new BigNumber(1.5),
        },
      })

      expect(result).eq(false)
    })

    it('shows as risk increasing when only current col ratio decreasing', () => {
      const result = increasingRisk({
        inputAmountsEmpty: true,
        afterCollateralizationRatioAtNextPrice: new BigNumber(1.6),
        afterCollateralizationRatio: new BigNumber(1.5),
        vault: {
          collateralizationRatioAtNextPrice: new BigNumber(1.5),
          collateralizationRatio: new BigNumber(1.6),
        },
      })

      expect(result).eq(false)
    })

    it('shows as risk not increasing when taking vault from coll ratio to zero (zero col ratio means no debt drawn - infinite col ratio)', () => {
      const result = increasingRisk({
        inputAmountsEmpty: false,
        afterCollateralizationRatioAtNextPrice: zero,
        afterCollateralizationRatio: zero,
        vault: {
          collateralizationRatioAtNextPrice: new BigNumber(1.5),
          collateralizationRatio: new BigNumber(1.6),
        },
      })

      expect(result).eq(false)
    })

    it('shows as risk increasing when increasing col ratio from zero (zero col ratio means no debt drawn - infinite col ratio)', () => {
      const result = increasingRisk({
        inputAmountsEmpty: false,
        afterCollateralizationRatioAtNextPrice: new BigNumber(1.5),
        afterCollateralizationRatio: new BigNumber(1.6),
        vault: {
          collateralizationRatioAtNextPrice: zero,
          collateralizationRatio: zero,
        },
      })

      expect(result).eq(true)
    })
  })
})
