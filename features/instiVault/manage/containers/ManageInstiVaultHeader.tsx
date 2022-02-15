import React from 'react'
import { DefaultVaultHeader, DefaultVaultHeaderProps } from 'components/vault/DefaultVaultHeader'
import { VaultIlkDetailsItem } from 'components/vault/VaultHeader'
import { useTranslation } from 'next-i18next'
import { BigNumber } from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { formatPercent } from 'helpers/formatters/format'


export function ManageInstiVaultHeader(props: DefaultVaultHeaderProps & { originationFee?: BigNumber}) {
  const { ilkData, id, originationFee } = props
  const { t } = useTranslation()
  return <DefaultVaultHeader header={t('vault.insti-header', { ilk: ilkData.ilk, id })} ilkData={ilkData} id={id}>
    <VaultIlkDetailsItem
        label={t('manage-vault.stability-fee')}
        value={`${formatPercent(originationFee!.times(100), { precision: 2 })}`}
        tooltipContent={t('manage-multiply-vault.tooltip.dust-limit')}
        styles={{
          tooltip: {
            left: ['-80px', 'auto'],
            right: ['auto', '-32px'],
          },
        }}
      />
  </DefaultVaultHeader>
}