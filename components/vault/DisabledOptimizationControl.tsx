import type BigNumber from 'bignumber.js'
import { Icon } from 'components/Icon'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { warning } from 'theme/icons'

export function DisabledOptimizationControl({ minNetValue }: { minNetValue: BigNumber }) {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" icon={warning} />}
      withClose={false}
      header={t('vault-banners.too-low-net-value-for-optimization.header', {
        netValue: formatAmount(minNetValue, 'USD'),
      })}
      subheader={t('vault-banners.too-low-net-value-for-optimization.description')}
      color="primary100"
    />
  )
}
