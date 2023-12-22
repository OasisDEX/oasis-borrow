import type BigNumber from 'bignumber.js'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import type { OmniNetValuePnlDataReturnType } from 'features/omni-kit/helpers/getOmniNetValuePnlData.types'
import { formatPrecision } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function NetValueCard({
  netValue,
  nextNetValue,
  modal,
  footnote,
}: OmniNetValuePnlDataReturnType & {
  nextNetValue?: BigNumber
  modal?: React.ReactNode
  footnote?: string
}) {
  const { t } = useTranslation()
  return (
    <DetailsSectionContentCard
      title={t('system.net-value')}
      value={`${formatPrecision(netValue.inToken, 2)} ${netValue.netValueToken}`}
      footnote={footnote}
      change={
        nextNetValue && {
          variant: nextNetValue.gt(netValue.inToken) ? 'positive' : 'negative',
          value: `${formatPrecision(nextNetValue, 2)} ${t('after')}`,
        }
      }
      modal={modal}
    />
  )
}
