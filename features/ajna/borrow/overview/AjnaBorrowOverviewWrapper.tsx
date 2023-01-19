import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowOverviewWrapper() {
  const { t } = useTranslation()

  return (
    <DetailsSection
      title={t('system.overview')}
      content={<DetailsSectionContentCardWrapper>Lorem ipsum</DetailsSectionContentCardWrapper>}
    />
  )
}
