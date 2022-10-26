import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { VaultChangesInformationItem } from '../../../../../components/vault/VaultChangesInformation'
import { formatPercent } from '../../../../../helpers/formatters/format'

interface LtvInformationProps {
  slippage: BigNumber
}

export function SlippageInformation({ slippage }: LtvInformationProps) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('vault-changes.slippage-limit')}
      value={formatPercent(slippage.times(100), { precision: 2 })}
    />
  )
}
