import { WithConnection } from 'components/connectWallet'
import { TOSContextProvider } from 'components/context'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts'
import { ReferralLandingSummary } from 'features/referralOverview/ReferralLanding'
import { useAppConfig } from 'helpers/config'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
    },
  }
}

function ReferralsPage() {
  const { Referrals: referralsEnabled } = useAppConfig('features')

  return (
    <TOSContextProvider>
      <WithConnection>{referralsEnabled ? <ReferralLandingSummary /> : null}</WithConnection>
    </TOSContextProvider>
  )
}

ReferralsPage.layout = AppLayout
ReferralsPage.seoTags = (
  <PageSEOTags
    title="seo.referrals.title"
    description="seo.referrals.description"
    url="/referrals"
  />
)
export default ReferralsPage
