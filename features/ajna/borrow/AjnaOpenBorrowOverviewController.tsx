import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { useTranslation } from 'next-i18next'

export function AjnaOpenBorrowOverviewController() {
  const { t } = useTranslation()

  return (
    <DetailsSection
      title={t('system.overview')}
      content={<DetailsSectionContentCardWrapper>Lorem ipsum</DetailsSectionContentCardWrapper>}
    />
  )
}
