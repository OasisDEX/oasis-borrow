import BigNumber from 'bignumber.js'
import { buildPosition, collateralPriceAtRatio } from 'blockchain/vault.maths'
import { zero } from 'helpers/zero'

//TODO: [Mocha -> Jest] Rewrite in Jest compatible format.
describe.skip('vault maths', () => {
  describe('collateralPriceAtRatioThreshold', () => {
    it('converts', () => {
      const colRatioPriceUsd = collateralPriceAtRatio({
        colRatio: new BigNumber(1.5),
        vaultDebt: new BigNumber(100),
        collateral: new BigNumber(1000),
      })

      expect(colRatioPriceUsd.toString()).toBe('0.15')
    })

    it('handles zero collateral', () => {
      const colRatioPriceUsd = collateralPriceAtRatio({
        colRatio: new BigNumber(1.5),
        vaultDebt: new BigNumber(100),
        collateral: zero,
      })

      expect(colRatioPriceUsd.toString()).toBe('0')
    })
  })

  describe('daiYieldFromLockedCollateral', () => {
    it('accounts for the origination fee and min active col ratio in daiYieldFromLockedCollateral', () => {
      const args = {
        debtScalingFactor: new BigNumber(1),
        stabilityFee: new BigNumber(1),
        liquidationRatio: new BigNumber(1),
        ilkDebtAvailable: new BigNumber(1000),
        collateralizationDangerThreshold: new BigNumber(1),
        collateralizationWarningThreshold: new BigNumber(1),

        collateral: new BigNumber(150),
        currentPrice: new BigNumber(1),
        nextPrice: new BigNumber(2),
        normalizedDebt: new BigNumber('49.5'),
        minActiveColRatio: new BigNumber('1.5'),
        originationFee: new BigNumber('0.01'),
      }

      const result = buildPosition(args)

      expect(result.daiYieldFromLockedCollateral.toString()).toBe('50')
    })
  })
})
