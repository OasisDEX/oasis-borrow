import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import type { mapPartialTakeProfitFromLambda } from 'features/aave/manage/helpers/map-partial-take-profit-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const AavePartialTakeProfitManageDetails = ({
  state,
  partialTakeProfitLambdaData,
}: Pick<ManageAaveStateProps, 'state'> & {
  partialTakeProfitLambdaData: ReturnType<typeof mapPartialTakeProfitFromLambda>
}) => {
  const { t } = useTranslation()
  console.log('state', state)
  console.log('partialTakeProfitLambdaData', partialTakeProfitLambdaData)

  return (
    <DetailsSection
      title={t('system.partial-take-profit')}
      badge={true}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard
            title={'New Dynamic Trigger Price'}
            value={'-'}
            unit={'TOKEN/PAIR'}
            change={['4,100 TOKEN/PAIR after']}
            changeVariant="positive"
            footnote={['TriggerLTV: -%']}
          />
          <OmniContentCard
            title={'Est. to receive next trigger'}
            value={'-'}
            unit={'TOKEN'}
            change={['100 TOKEN after']}
            changeVariant="positive"
            footnote={['Bazillion TOKEN']}
          />
          <OmniContentCard
            title={'Current profit/loss'}
            value={'343'}
            unit={'TOKEN'}
            footnote={['0 second TOKEN']}
          />
          <OmniContentCard
            title={'Profit realized to wallet'}
            value={'-'}
            unit={'TOKEN'}
            footnote={['0 second TOKEN']}
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <DetailsSectionFooterItem title={'Liquidation price'} value={'closer than you think'} />
          <DetailsSectionFooterItem title={'Current Loan to Value'} value={'42%'} />
          <DetailsSectionFooterItem title={'Current Multiple'} value={'2.1x'} />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
