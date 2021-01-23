import { Discrete } from 'money-ts/lib/Discrete'
import { Integer } from 'money-ts/lib/Integer'
import { Natural } from 'money-ts/lib/Natural'

export interface Vault<I extends Ilk> {
  id: Natural
  address: string
  owner: string
  controller: string
  token: TokenByIlk<I>
  iso: IsoCode
  ilk: I
  lockedCollateral: Collateral<I>
  unlockedCollateral: Collateral<I>
  collateralPrice: CollateralPrice<I>
  backingCollateral: Collateral<I>
  backingCollateralPrice: CollateralPrice<I>
  freeCollateral: Collateral<I>
  freeCollateralPrice: CollateralPrice<I>
  debt: RadDai
  normalizedDebt: Integer
  availableDebt: Token<'DAI'>
  availableIlkDebt: Token<'DAI'>
  liquidationRatio: CollateralDebtPriceRatio<I>
  collateralizationRatio: CollateralDebtPriceRatio<I>
  tokenOraclePrice: CollateralPrice<I>
  liquidationPrice: CollateralPrice<I>
  liquidationPenalty: Fraction
  stabilityFee: Fraction
  debtFloor: RadDai
}
