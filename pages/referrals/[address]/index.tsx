import { WithConnection } from 'components/connectWallet'
import { FunctionalContextHandler } from 'components/context'
import { AppLayout } from 'components/layouts'
import { ReferralsSummary } from 'features/referralOverview/ReferralOverviewView'
import { useAppConfig } from 'helpers/config'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

export default function ReferralsPage({ address }: { address: string }) {
  const { Referrals: referralsEnabled } = useAppConfig('features')
  return address ? (
    <FunctionalContextHandler>
      <WithConnection>
        {referralsEnabled ? <ReferralsSummary address={address} /> : null}
      </WithConnection>
    </FunctionalContextHandler>
  ) : null
}

ReferralsPage.layout = AppLayout
