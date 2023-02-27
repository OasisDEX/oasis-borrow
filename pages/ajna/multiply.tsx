import { PageSEOTags } from 'components/HeadTags'
import { ajnaProducts } from 'features/ajna/common/consts'
import { AjnaProductController } from 'features/ajna/common/controls/AjnaProductController'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { GetServerSidePropsContext, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaMultiplySelectorPage() {
  return <>Multiply</>
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
