import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import { formatCryptoBalance, formatPercent } from '../../helpers/formatters/format'
import { VaultHeader, VaultIlkDetailsItem } from './VaultHeader'
import { usePresenter } from '../../helpers/usePresenter'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'
import { memoize } from 'lodash'
import { OpenVaultState } from 'features/openVault/openVault'

export interface DefaultVaultHeaderProps {
  header: string
  id?: BigNumber
  ilk: string
}

const presenter = memoize(
  (openVault$: Observable<OpenVaultState>): Observable<HeaderViewData> =>
    openVault$.pipe(
      map((openVaultState) => {
        return {
          liquidationRatio: openVaultState.ilkData.liquidationRatio,
          stabilityFee: openVaultState.ilkData.stabilityFee,
          liquidationPenalty: openVaultState.ilkData.liquidationPenalty,
          debtFloor: openVaultState.ilkData.debtFloor,
        }
      }),
    ),
)

type HeaderViewData = {
  liquidationRatio: BigNumber
  stabilityFee: BigNumber
  liquidationPenalty: BigNumber
  debtFloor: BigNumber
}

export function DefaultVaultHeader(props: DefaultVaultHeaderProps) {
  const { id, header, ilk } = props
  const { t } = useTranslation()

  const openVault$ = useAppContext().openVault$(ilk)

  const viewData = usePresenter<OpenVaultState, HeaderViewData>(openVault$, presenter)

  if (!viewData) return null
  const { liquidationRatio, stabilityFee, liquidationPenalty, debtFloor } = viewData

  return (
    <VaultHeader header={header} id={id}>
      <VaultIlkDetailsItem
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(stabilityFee.times(100), { precision: 2 })}`}
        tooltipContent={t('manage-multiply-vault.tooltip.stabilityFee')}
        styles={{
          tooltip: {
            left: ['auto', '-20px'],
            right: ['-0px', 'auto'],
          },
        }}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.liquidation-fee')}
        value={`${formatPercent(liquidationPenalty.times(100))}`}
        tooltipContent={t('manage-multiply-vault.tooltip.liquidationFee')}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.min-collat-ratio')}
        value={`${formatPercent(liquidationRatio.times(100))}`}
        tooltipContent={t('manage-multiply-vault.tooltip.min-collateral')}
        styles={{
          tooltip: {
            left: 'auto',
            right: ['10px', '-154px'],
          },
        }}
      />
      <VaultIlkDetailsItem
        label={t('manage-vault.dust-limit')}
        value={`$${formatCryptoBalance(debtFloor)}`}
        tooltipContent={t('manage-multiply-vault.tooltip.dust-limit')}
        styles={{
          tooltip: {
            left: ['-80px', 'auto'],
            right: ['auto', '-32px'],
          },
        }}
      />
    </VaultHeader>
  )
}
