import { getPortfolioLink } from 'helpers/get-portfolio-link'
import { useRedirect } from 'helpers/useRedirect'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useEffect } from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

function OwnerPage({ address }: { address: string }) {
  const { replace } = useRedirect()
  useEffect(() => {
    if (!address) {
      replace('/')
    } else {
      replace(getPortfolioLink(address))
    }
  }, [address, replace])
  return null
}

export default OwnerPage
