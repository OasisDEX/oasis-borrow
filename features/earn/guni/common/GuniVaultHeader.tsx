import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { TotalValueLocked } from '../../../../blockchain/collateral'
import { EarnVaultHeadline } from '../../../../components/vault/EarnVaultHeadline'
import { HeadlineDetailsProp } from '../../../../components/vault/VaultHeadline'
import { formatFiatBalance, formatPercent } from '../../../../helpers/formatters/format'
import { zero } from '../../../../helpers/zero'
import { YieldChanges } from '../../yieldCalculations'

export interface EarnVaultHeaderProps {
  ilk: string
  token: string
  yieldsChanges: YieldChanges
  totalValueLocked: TotalValueLocked
}

export function GuniVaultHeader({
  ilk,
  token,
  yieldsChanges,
  totalValueLocked,
}: EarnVaultHeaderProps) {
  const { t } = useTranslation()
  const details: HeadlineDetailsProp[] = [
    ...yieldsChanges.changes.map((change) => {
      return {
        label: t(`earn-vault.headlines.yield-${change.yieldFromDays}`),
        value: getPercent(change.yieldValue),
        sub: getPercent(change.change),
        subColor: getSubColor(change.change),
      }
    }),
    {
      label: t('earn-vault.headlines.total-value-locked'),
      value: `$${formatFiatBalance(totalValueLocked.value || zero)}`,
    },
  ]
  return <EarnVaultHeadline header={ilk} token={token} details={details} />
}

function getPercent(value?: BigNumber) {
  return formatPercent((value || zero).times(100), { precision: 2 })
}

function getSubColor(number: BigNumber) {
  if (number.lt(zero)) {
    return 'onError'
  }
  return 'onSuccess'
}
