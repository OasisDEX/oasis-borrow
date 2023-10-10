import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardMultipleProps {
  multiple?: BigNumber
}

export function ContentCardMultiple({ multiple }: ContentCardMultipleProps) {
  const { t } = useTranslation()

  const formatted = {
    multiple: `${(multiple || zero).toFixed(2)}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('system.multiple'),
    value: `${formatted.multiple}x ${t('system.exposure')}`,
    modal: t('manage-earn-vault.exposure-modal'),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
