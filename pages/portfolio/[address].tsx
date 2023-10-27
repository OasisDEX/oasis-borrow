import { AppLayout } from 'components/layouts/AppLayout'
import { useRedirect } from 'helpers/useRedirect'
import type { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect } from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale ?? 'en', ['portfolio', 'common'])),
      address: ctx.query?.address ?? null,
    },
  }
}

export default function PortfolioView({ address }: { address: string }) {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { replace } = useRedirect()
  useEffect(() => {
    if (!address) {
      replace('/')
    }
  }, [address, replace])
  return address ? <AppLayout>{tPortfolio('portfolio-view', { address })}</AppLayout> : null
}
