import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { zero } from '../../../helpers/zero'

interface ContentCardEarningsToDateProps {
  multiple?: BigNumber
}

export function ContentCardMultiple({ multiple }: ContentCardEarningsToDateProps) {
  const { t } = useTranslation()

  const formatted = {
    multiple: `${formatPercent((multiple || zero).times(100), { precision: 1 })}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('manage-earn-vault.net-apy'),
    value: formatted.multiple,
    modal: t('manage-earn-vault.net-apy-modal'),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
