import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { AjnaFlow } from 'features/ajna/common/types'
import { OmniEarnFormAction } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'

export const getAjnaEarnDefaultAction = (flow: AjnaFlow, ajnaPosition: AjnaEarnPosition) =>
  ajnaPosition.collateralTokenAmount.gt(zero)
    ? OmniEarnFormAction.ClaimEarn
    : flow === 'open'
    ? OmniEarnFormAction.OpenEarn
    : OmniEarnFormAction.DepositEarn
