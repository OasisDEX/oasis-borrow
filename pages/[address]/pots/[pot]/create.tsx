import { useAppContext } from 'components/AppContextProvider'
import { PotKind } from 'components/dashboard/dashboard'
import { DsrPotCreateView } from 'components/dashboard/dsrPot/DsrPotCreateView'
import { LogoWithBack } from 'components/Header'
import { AppLinkProps } from 'components/Links'
import { useObservable } from 'helpers/observableHook'
import { useReadonlyAccount } from 'helpers/useReadonlyAccount'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import React from 'react'

interface PotProps {
  query?: ParsedUrlQuery
}

function PotCreateView({ query }: PotProps) {
  const router = useRouter()
  const { pot } = (query || router.query) as { pot: string }

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

  return <DsrPotCreateView />
}

export default function PotCreatePage({ query }: PotProps) {
  useReadonlyAccount(true)

  return <PotCreateView {...{ query }} />
}

const DSR_STAGE_WITHOUT_BACK = ['depositWaiting4Approval', 'depositInProgress', 'depositSuccess']

function CustomLogoWithBack() {
  const router = useRouter()
  const {
    query: { pot, address, network },
  } = router
  const { dsrCreation$ } = useAppContext()
  const dsrCreation = useObservable(dsrCreation$)
  let onClick
  let backLink: AppLinkProps | undefined = {
    href: '/pots/create',
  }

  if (pot === 'dsr' && dsrCreation) {
    const { back, stage, change } = dsrCreation

    if (back) {
      onClick = back
    }

    if (stage === 'editing') {
      const networkQueryParam = network ? `?network=${network}` : ''
      onClick = () => {
        /* eslint-disable-next-line */
        router
          .push(
            `/[address]/pots/create${networkQueryParam}`,
            `/${address}/pots/create${networkQueryParam}`,
          )
          .then(() => {
            change!({ kind: 'amount', amount: undefined })
          })
      }
    }

    if (DSR_STAGE_WITHOUT_BACK.includes(stage)) {
      backLink = undefined
    }
  }

  return <LogoWithBack {...{ backLink, onClick }} />
}

PotCreatePage.layoutProps = {
  CustomLogoWithBack,
}
