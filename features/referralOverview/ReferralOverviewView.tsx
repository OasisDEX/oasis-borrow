import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { getAddress } from 'ethers/lib/utils'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

import { FeesView } from './FeesView'
import { ReferralLanding } from './ReferralLanding'
import { ReferralLayout } from './ReferralLayout'
import { ReferralsView } from './ReferralsView'
import { UserReferralState } from './user'

interface Props {
  context: Context
  address: string
  userReferral: UserReferralState
}

export function ReferralsSummary({ address }: { address: string }) {
  const { context$, userReferral$ } = useAppContext()

  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [context, contextError] = useObservable(context$)
  const [userReferral, userReferralError] = useObservable(userReferral$)

  return (
    <WithErrorHandler error={[contextError, userReferralError]}>
      <WithLoadingIndicator value={[context, userReferral]}>
        {([context, userReferral]) => (
          <ReferralOverviewView
            context={context}
            userReferral={userReferral}
            address={checksumAddress}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

export function ReferralOverviewView({ context, userReferral, address }: Props) {
  const isConnected = context?.status === 'connected'

  const connectedAccount = isConnected ? context.account : undefined
  return (
    <>
      {isConnected && connectedAccount === address && userReferral.state !== 'newUser' && (
        <ReferralLayout>
          <>
            <ReferralsView address={connectedAccount} />
            <FeesView context={context} userReferral={userReferral} />
          </>
        </ReferralLayout>
      )}
      {isConnected && connectedAccount !== address && (
        <ReferralLanding context={context} userReferral={userReferral} />
      )}
      {!isConnected && <ReferralLanding context={context} userReferral={userReferral} />}
    </>
  )
}
