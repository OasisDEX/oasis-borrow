import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { EarnVaultHeadline } from '../../../../components/vault/EarnVaultHeadline'
import { HeadlineDetailsProp } from '../../../../components/vault/VaultHeadline'
import { formatFiatBalance, formatPercent } from '../../../../helpers/formatters/format'
import { zero } from '../../../../helpers/zero'
import { YieldPeriod } from '../../yieldCalculations'

export interface EarnVaultHeaderProps {
  ilk: string
  token: string
  yields: {
    [key in YieldPeriod]?: {
      value: BigNumber
    }
  }
  totalValueLocked?: BigNumber
}

export function GuniVaultHeader({ ilk, token, yields, totalValueLocked }: EarnVaultHeaderProps) {
  const { t } = useTranslation()
  const details: HeadlineDetailsProp[] = [
    {
      label: t('open-earn-vault.headlines.current-yield'),
      value: getPercent(yields[YieldPeriod.Yield7Days]?.value),
    },
    {
      label: t('open-earn-vault.headlines.ninety-days-avg'),
      value: getPercent(yields[YieldPeriod.Yield90Days]?.value),
    },
    {
      label: t('open-earn-vault.headlines.total-value-locked'),
      value: `$${formatFiatBalance(totalValueLocked || zero)}`,
    },
  ]
  return <EarnVaultHeadline header={ilk} token={token} details={details} />
}

function getPercent(value?: BigNumber) {
  return formatPercent((value || zero).times(100), { precision: 2 })
}
