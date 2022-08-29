import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'

import { Banner, bannerGradientPresets } from '../../../../../../components/Banner'
import { DetailsSection } from '../../../../../../components/DetailsSection'
import { DetailsSectionContentTable } from '../../../../../../components/DetailsSectionContentTable'
import { DetailsSectionFooterItemWrapper } from '../../../../../../components/DetailsSectionFooterItem'
import { ContentFooterItemsEarnSimulate } from '../../../../../../components/vault/detailsSection/ContentFooterItemsEarnSimulate'
import { AaveSimulateTitle } from './AaveSimulateTitle'

export function SimulateSectionComponent() {
  const { t } = useTranslation()

  const depositAmount = new BigNumber(150_000)
  const breakeven = new BigNumber(23)
  const entryFees = new BigNumber(4_300)
  const apy = new BigNumber(12)
  return (
    <>
      <DetailsSection
        title={<AaveSimulateTitle token={'ETH'} depositAmount={depositAmount} />}
        content={
          <>
            <DetailsSectionContentTable
              headers={[
                t('earn-vault.simulate.header1'),
                t('earn-vault.simulate.header2'),
                t('earn-vault.simulate.header3'),
              ]}
              rows={[]}
              footnote={<>{t('earn-vault.simulate.footnote1')}</>}
            />
          </>
        }
        footer={
          <DetailsSectionFooterItemWrapper>
            <ContentFooterItemsEarnSimulate
              token={`ETH`}
              breakeven={breakeven}
              entryFees={entryFees}
              apy={apy}
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
      <Box sx={{ mt: '21px' }} />
      <Banner
        title={t('vault-banners.what-are-the-risks.header')}
        description={t('vault-banners.what-are-the-risks.content')}
        button={{
          text: t('vault-banners.what-are-the-risks.button'),
          action: () => {}, // TODO: Set proper action for this button to open the FAQ page
        }}
        image={{
          src: '/static/img/setup-banner/stop-loss.svg',
          backgroundColor: bannerGradientPresets.stopLoss[0],
          backgroundColorEnd: bannerGradientPresets.stopLoss[1],
        }}
      />
    </>
  )
}
