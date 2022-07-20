import { WithConnection } from 'components/connectWallet/ConnectWallet'
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

export default function ReferralsPage() {
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
