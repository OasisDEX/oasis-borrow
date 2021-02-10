import { ConnectWallet } from 'components/connectWallet/ConnectWallet'
import { ConnectPageLayout } from 'components/Layouts'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import PageNotFound from 'pages/404'
import React from 'react'

export default function ConnectPage() {
  // we have to use `useRouter()` hook for consistent url path for redirection because `req.url` in `getServerSideProps` is handled differently on client and server:
  // https://nextjs.org/docs/basic-features/data-fetching#only-runs-on-server-side
  const router = useRouter()

  return <ConnectWallet url={router.query.url} />
}

ConnectPage.layout = ConnectPageLayout
