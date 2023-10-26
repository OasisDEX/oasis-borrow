import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { AjnaFlow } from 'features/ajna/common/types'
import { zero } from 'helpers/zero'

export const getAjnaEarnDefaultAction = (flow: AjnaFlow, ajnaPosition: AjnaEarnPosition) =>
  ajnaPosition.collateralTokenAmount.gt(zero)
    ? 'claim-earn'
    : flow === 'open'
    ? 'open-earn'
    : 'deposit-earn'
