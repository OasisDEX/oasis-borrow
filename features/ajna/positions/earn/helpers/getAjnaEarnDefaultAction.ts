import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { ProtocolFlow } from 'features/unifiedProtocol/types'
import { zero } from 'helpers/zero'

export const getAjnaEarnDefaultAction = (flow: ProtocolFlow, ajnaPosition: AjnaEarnPosition) =>
  ajnaPosition.collateralTokenAmount.gt(zero)
    ? 'claim-earn'
    : flow === 'open'
    ? 'open-earn'
    : 'deposit-earn'
