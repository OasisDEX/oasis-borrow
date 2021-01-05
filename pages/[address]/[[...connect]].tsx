import { ConnectWallet } from 'components/connectWallet/ConnectWallet'
import { ConnectPageLayout } from 'components/Layouts'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import PageNotFound from 'pages/404'
import React from 'react'

// it is used to catch paths like `/dashboard`, `/buy` without `[address]` param in query to present user connect screen
// by default it will catch all paths like `/fff` also and don't present 404 page, which should be rendered
// so we need to explicitly speficy paths to catch in array below
const PATHS_TO_CATCH = ['/dashboard', '/buy', '/balances', '/pots']

export default function ConnectPage({
  notFound,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // we have to use `useRouter()` hook for consistent url path for redirection because `req.url` in `getServerSideProps` is handled differently on client and server:
  // https://nextjs.org/docs/basic-features/data-fetching#only-runs-on-server-side
  const router = useRouter()

  return notFound ? <PageNotFound /> : <ConnectWallet {...{ originalUrl: router.asPath }} />
}

export async function getServerSideProps({ res, req }: GetServerSidePropsContext) {
  const originalUrl = req.url

  if (res && originalUrl && PATHS_TO_CATCH.some((url) => originalUrl.includes(url))) {
    return {
      props: {
        notFound: false,
      },
    }
  }

  return {
    props: {
      notFound: true,
    },
  }
}

ConnectPage.layout = ConnectPageLayout
ConnectPage.layoutProps = {
  backLink: {
    href: '/',
  },
}
