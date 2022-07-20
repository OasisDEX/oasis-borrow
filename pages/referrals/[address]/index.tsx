import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { ReferralsSummary } from 'features/referralOverview/ReferralOverviewView'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

export default function ReferralsPage({ address }: { address: string }) {
  const referralsEnabled = useFeatureToggle('Referrals')
  return address ? (
    <WithConnection>
      <BackgroundLight />
      {referralsEnabled ? <ReferralsSummary address={address} /> : null}
    </WithConnection>
  ) : null
}

ReferralsPage.layout = AppLayout
