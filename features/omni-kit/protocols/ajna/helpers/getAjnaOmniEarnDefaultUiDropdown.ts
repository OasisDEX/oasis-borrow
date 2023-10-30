import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { OmniSidebarEarnPanel } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'

export const getAjnaOmniEarnDefaultUiDropdown = (ajnaPosition: AjnaEarnPosition) =>
  ajnaPosition.collateralTokenAmount.gt(zero)
    ? OmniSidebarEarnPanel.ClaimCollateral
    : ajnaPosition.quoteTokenAmount.isZero()
    ? OmniSidebarEarnPanel.Liquidity
    : OmniSidebarEarnPanel.Adjust
