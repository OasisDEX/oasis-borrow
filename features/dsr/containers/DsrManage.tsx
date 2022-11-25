import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { TabBar } from 'components/TabBar'
import { SidebarManageAaveVault } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { AaveFaq } from 'features/content/faqs/aave'
import { Survey } from 'features/survey'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Container, Grid } from 'theme-ui'
import { SidebarDsr } from 'features/dsr/components/SidebarDsr'

export function DsrManage() {
  const { t } = useTranslation()

  return (
    <Container variant="vaultPageContainer">
      <TabBar
        variant="underline"
        sections={[
          {
            value: 'overview',
            label: t('system.overview'),
            content: (
              <Grid variant="vaultContainer">
                <DetailsSection
                  title={t('150,000.00 DAI')}
                  content={
                    <DetailsSectionContentCardWrapper>Zeli papo</DetailsSectionContentCardWrapper>
                  }
                />
                <SidebarDsr />
              </Grid>
            ),
          },
          {
            value: 'position-info',
            label: t('nav.faq'),
            content: (
              <Card variant="faq">
                <AaveFaq />
              </Card>
            ),
          },
        ]}
      />
      <Survey for="earn" />
    </Container>
  )
}
