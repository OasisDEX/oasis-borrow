import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { NewReferralModal } from 'components/NewReferralModal'
import { getAddress } from 'ethers/lib/utils'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Flex, Grid, Text } from 'theme-ui'

import { useModal } from '../../helpers/modalHook'
import { FeesView } from './FeesView'
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
            address={checksumAddress}
            userReferral={userReferral}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

export function ReferralOverviewView({ context, address, userReferral }: Props) {
  const openModal = useModal()

  const connectedAccount = context?.status === 'connected' ? context.account : undefined

  const router = useRouter()

  const [storedReferral, setStoredReferral] = useState<string>()

  // 1. Owner viewing - is not referred - but already a user (TOS)
  // 2. Owner viewing - is referred - already a user (TOS)
  // 3.
  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  useEffect(() => {
    const localReferral = localStorage.getItem(`referral/${connectedAccount}`)
    if (localReferral) {
      setStoredReferral(localReferral)
    } else {
      // @ts-ignore
      const linkReferral: string = router.query.ref
      if (linkReferral) {
        // TODO add check for checksum and if it's in db ?
        // observable -> user -> check on load ref vs user
        // if user that referrs exists ? Is address on curve
        localStorage.setItem(`referral/${connectedAccount}`, linkReferral)
        setStoredReferral(linkReferral)
      }
    }
  }, [])

  return (
    <Grid sx={{ flex: 1, zIndex: 1 }}>
      <Flex sx={{ mt: 5, mb: 4, flexDirection: 'column' }}>
        {connectedAccount && (
          <Button
            variant="secondary"
            sx={{
              textAlign: 'center',
              px: '12px',
              verticalAlign: 'baseline',
              fontSize: 'inherit',
            }}
            onClick={() =>
              openModal(NewReferralModal, {
                referrer: storedReferral,
                address: connectedAccount,
              })
            }
          >
            {/* {t('ref.claim')} */} Fake button
          </Button>
        )}
        {userReferral.state === 'newUser' && "user is not in the db"}
        {isOwnerViewing && userReferral.state !== 'newUser' && (
          <>
            <Text
              sx={{
                color: 'text',
                overflowWrap: 'break-word',
                fontSize: 7,
              }}
              variant="strong"
            >
              Referral
            </Text>
            <Grid
              columns={[1, null, 2]}
              sx={{
                justifyItems: 'center',
                /* ...slideInAnimation, */
                position: 'relative',
                width: '100%',
                gap: 4,
                margin: '0 auto',
              }}
            >
              <ReferralsView context={context} address={address} userReferral={userReferral} />

              <FeesView context={context} userReferral={userReferral} />
            </Grid>
          </>
        )}
      </Flex>
    </Grid>
  )
}
