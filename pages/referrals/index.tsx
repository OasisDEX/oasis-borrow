import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/Layouts'
import { ReferralLandingSummary } from 'features/referralOverview/ReferralLanding'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
    },
  }
}

function ReferralsPage() {
  const referralsEnabled = useFeatureToggle('Referrals')

  return (
    <>
      <WithConnection>
        <BackgroundLight />
        {referralsEnabled ? <ReferralLandingSummary /> : null}
      </WithConnection>
    </>
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
