import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { DetailsSectionFooterItemWrapper } from 'components/DetailsSectionFooterItem'
import { useAjnaGeneralContext } from 'features/ajna/common/contexts/AjnaGeneralContext'
import { ContentFooterItemsEarnManage } from 'features/ajna/earn/overview/ContentFooterItemsEarnManage'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnOverviewManage() {
  const { t } = useTranslation()
  const {
    environment: { collateralToken },
  } = useAjnaGeneralContext()

  return (
    <DetailsSection
      title={t('system.overview')}
      content={<DetailsSectionContentCardWrapper>Test</DetailsSectionContentCardWrapper>}
      footer={
        <DetailsSectionFooterItemWrapper>
          <ContentFooterItemsEarnManage
            collateralToken={collateralToken}
            availableToWithdraw={new BigNumber(4.5)}
            earlyWithdrawalPenalty={new BigNumber(2)}
            earlyWithdrawalPeriod={new Date(new Date().getTime() + 10000000)}
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
