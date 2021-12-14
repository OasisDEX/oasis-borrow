import {
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCardLiquidationPrice,
} from 'components/vault/VaultDetails'
import { pick } from 'helpers/pick'
import { useHasChangedSinceFirstRender } from 'helpers/useHasChangedSinceFirstRender'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function CardLiquidationPrice() {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    inputAmountsEmpty,
    stage,
    liquidationRatio,
    collateralizationDangerThreshold,
    collateralizationWarningThreshold,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(
      ctx,
      'afterCollateralizationRatio',
      'afterLiquidationPrice',
      'token',
      'inputAmountsEmpty',
      'stage',
    ),
    ...pick(
      ctx.ilkData,
      'liquidationRatio',
      'collateralizationDangerThreshold',
      'collateralizationWarningThreshold',
    ),
  }))

  // initial values only to show in UI as starting parameters
  const liquidationPrice = zero

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
    <VaultDetailsCardLiquidationPrice
      {...{
        liquidationPrice,
        afterLiquidationPrice,
        afterPillColors,
        showAfterPill,
        relevant: inputAmountWasChanged,
      }}
    />
  )
}
