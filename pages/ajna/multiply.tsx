import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { AjnaLayout, AjnaWrapper } from 'features/ajna/common/layout'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { useTranslation } from 'react-i18next'

function AjnaMultiplySelectorPage() {
  const { t } = useTranslation()

  return (
    <WithConnection>
      <AjnaWrapper>
        <AnimatedWrapper>
          <AjnaHeader
            title={t('ajna.product-page.multiply.coming-soon.title')}
            intro={t('ajna.product-page.multiply.coming-soon.intro')}
          />
        </AnimatedWrapper>
      </AjnaWrapper>
    </WithConnection>
  )
}

AjnaMultiplySelectorPage.layout = AjnaLayout
AjnaMultiplySelectorPage.seoTags = (
  <PageSEOTags
    title="seo.ajnaProductPage.title"
    titleParams={{ product: 'Multiply' }}
    description="seo.ajna.description"
    url={'/ajna/multiply'}
  />
)

export default AjnaMultiplySelectorPage

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
