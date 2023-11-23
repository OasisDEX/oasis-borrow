import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { OmniEarnFormAction } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'

export const getAjnaEarnDefaultAction = (isOpening: boolean, ajnaPosition: AjnaEarnPosition) =>
  ajnaPosition.collateralTokenAmount.gt(zero)
    ? OmniEarnFormAction.ClaimEarn
    : isOpening
    ? OmniEarnFormAction.OpenEarn
    : OmniEarnFormAction.DepositEarn
