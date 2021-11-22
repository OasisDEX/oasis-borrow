import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCryptoBalance, formatPercent } from '../../helpers/formatters/format'
import { VaultHeader, VaultIlkDetailsItem } from './VaultHeader'

export interface DefaultVaultHeaderProps_v2 {
  header: string
  vaultId: BigNumber
}

export function DefaultVaultHeader_v2(props: DefaultVaultHeaderProps_v2) {
  const { header, vaultId } = props
  const { t } = useTranslation()
  const { vault$, ilkDataList$ } = useAppContext()
  const vaultDataWithError = useObservableWithError(vault$(vaultId))
  const ilksDataWithError = useObservableWithError(ilkDataList$)
  return (
    <WithLoadingIndicator
      value={[vaultDataWithError.value, ilksDataWithError.value]}
      customLoader={<VaultContainerSpinner />}
    >
      {([vaultData, ilkDataList]) => {
        const ilk = ilkDataList.filter((x) => x.ilk === vaultData.ilk)[0]
        const translatedHeader = t(header, { ilk: ilk.ilk })

        return (
          <VaultHeader header={translatedHeader} id={vaultData.id}>
            <VaultIlkDetailsItem
              label={t('manage-vault.stability-fee')}
              value={`${formatPercent(ilk.stabilityFee.times(100), { precision: 2 })}`}
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
              value={`${formatPercent(ilk.liquidationPenalty.times(100))}`}
              tooltipContent={t('manage-multiply-vault.tooltip.liquidationFee')}
            />
            <VaultIlkDetailsItem
              label={t('manage-vault.min-collat-ratio')}
              value={`${formatPercent(ilk.liquidationRatio.times(100))}`}
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
              value={`$${formatCryptoBalance(ilk.debtFloor)}`}
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
      }}
    </WithLoadingIndicator>
  )
}
