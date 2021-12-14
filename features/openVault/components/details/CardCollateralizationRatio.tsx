import BigNumber from 'bignumber.js'
import {
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCard,
  VaultDetailsCardCollaterlizationRatioModal,
} from 'components/vault/VaultDetails'
import { formatPercent } from 'helpers/formatters/format'
import { useModal } from 'helpers/modalHook'
import { pick } from 'helpers/pick'
import { useHasChangedSinceFirstRender } from 'helpers/useHasChangedSinceFirstRender'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function CardCollateralizationRatio() {
  const {
    afterCollateralizationRatio,
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
  const { t } = useTranslation()
  const openModal = useModal()

  // initial values only to show in UI as starting parameters
  const collateralizationRatio = zero

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
    <VaultDetailsCard
      title={`${t('system.collateralization-ratio')}`}
      value={formatPercent(collateralizationRatio.times(100), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      })}
      valueAfter={
        showAfterPill &&
        formatPercent(afterCollateralizationRatio.times(100), {
          precision: 2,
          roundMode: BigNumber.ROUND_DOWN,
        })
      }
      openModal={() =>
        openModal(VaultDetailsCardCollaterlizationRatioModal, {
          currentCollateralRatio: collateralizationRatio,
          collateralRatioOnNextPrice: afterCollateralizationRatio,
        })
      }
      afterPillColors={afterPillColors}
      relevant={inputAmountWasChanged}
    />
  )
}
