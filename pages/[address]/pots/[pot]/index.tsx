// @ts-ignore
import { useAppContext } from 'components/AppContextProvider'
import { PotKind } from 'components/dashboard/dashboard'
import { DsrPotView } from 'components/dashboard/dsrPot/DsrPotView'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import React from 'react'

interface PotProps {
  query?: ParsedUrlQuery
}

function PotView({ pot }: { pot: string }) {
  const { dashboard$ } = useAppContext()
  const dashboard = useObservable(dashboard$)

  if (!dashboard) {
    // TODO: add loading indicator!
    return null
  }

  if (!dashboard.pots[pot as PotKind]) {
    throw new Error('Wrong pot type!')
  }

  if ((pot as PotKind) !== 'dsr') {
    throw new Error('Only dsr this time!')
  }

  return <DsrPotView loadablePot={{ ...dashboard.pots.dsr }} />
}

export default function PotPage({ query }: PotProps) {
  const router = useRouter()
  const { pot } = (query || router.query) as { pot: string }

  return <PotView {...{ pot }} />
}

PotPage.layoutProps = {
  backLink: {
    href: '/dashboard',
  },
}
