import { getToken } from 'components/blockchain/config'
import { TokenBalanceView } from 'components/dashboard/tokenBalance/TokenBalanceView'
import { WithQuery } from 'helpers/types'
import { useRouter } from 'next/router'
import PageNotFound from 'pages/404'
import React from 'react'

export default function BalancesPage({ query }: WithQuery) {
  const router = useRouter()
  const { token } = (query || router.query) as { token: string }
  const tokenConfig = getToken(token.toUpperCase())

  if (!tokenConfig) {
    return <PageNotFound />
  }

  return <TokenBalanceView {...{ token: tokenConfig }} />
}

BalancesPage.layoutProps = {
  backLink: {
    href: '/dashboard',
  },
}
