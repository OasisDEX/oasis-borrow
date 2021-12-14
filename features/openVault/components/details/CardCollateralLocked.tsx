import {
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCardCollateralLocked,
} from 'components/vault/VaultDetails'
import { pick } from 'helpers/pick'
import { useHasChangedSinceFirstRender } from 'helpers/useHasChangedSinceFirstRender'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { zero } from 'helpers/zero'
import React from 'react'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function CardCollateralLocked() {
  const {
    afterCollateralizationRatio,
    token,
    inputAmountsEmpty,
    stage,
    afterDepositAmountUSD,
    liquidationRatio,
    collateralizationDangerThreshold,
    collateralizationWarningThreshold,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(ctx, 'afterCollateralizationRatio', 'token', 'inputAmountsEmpty', 'stage'),
    ...pick(
      ctx.ilkData,
      'liquidationRatio',
      'collateralizationDangerThreshold',
      'collateralizationWarningThreshold',
    ),
    afterDepositAmountUSD: ctx.depositAmountUSD,
  }))

  const depositAmountUSD = zero
  const depositAmount = zero

  const afterCollRatioColor = getCollRatioColor(
    inputAmountsEmpty,
    liquidationRatio,
    collateralizationDangerThreshold,
    collateralizationWarningThreshold,
    afterCollateralizationRatio,
  )
  const afterPillColors = getAfterPillColors(afterCollRatioColor)
  const showAfterPill = !inputAmountsEmpty && stage !== 'txSuccess'
  const inputAmountWasChanged = useHasChangedSinceFirstRender(inputAmountsEmpty)

  return (
    <VaultDetailsCardCollateralLocked
      {...{
        depositAmount,
        depositAmountUSD,
        afterDepositAmountUSD,
        token,
        afterPillColors,
        showAfterPill,
        relevant: inputAmountWasChanged,
      }}
    />
  )
}
