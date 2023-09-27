import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { zero } from 'helpers/zero'

export const getAjnaEarnDefaultUiDropdown = (ajnaPosition: AjnaEarnPosition) =>
  ajnaPosition.collateralTokenAmount.gt(zero)
    ? 'claim-collateral'
    : ajnaPosition.quoteTokenAmount.isZero()
    ? 'liquidity'
    : 'adjust'
