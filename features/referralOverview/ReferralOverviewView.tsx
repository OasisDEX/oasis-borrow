import { User, WeeklyClaim } from '@prisma/client'
import axios from 'axios'
import { Context } from 'blockchain/network'
import { useAppContext } from 'components/AppContextProvider'
import { NewReferralModal } from 'components/NewReferralModal'
import { ethers } from 'ethers'
import { getAddress } from 'ethers/lib/utils'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Button, Flex, Grid, Text } from 'theme-ui'

import { useModal } from '../../helpers/modalHook'
import { FeesView } from './FeesView'
import { ReferralsView } from './ReferralsView'
const basePath = getConfig()?.publicRuntimeConfig?.basePath || ''

interface Props {
  context: Context
  address: string
}

export function ReferralsSummary({ address }: { address: string }) {
  const { context$ } = useAppContext()

  const checksumAddress = getAddress(address.toLocaleLowerCase())
  const [context, contextError] = useObservable(context$)

  return (
    <WithErrorHandler error={[contextError]}>
      <WithLoadingIndicator value={[context]}>
        {([context]) => <ReferralOverviewView context={context} address={checksumAddress} />}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

export function ReferralOverviewView({ context, address }: Props) {
  const openModal = useModal()

  const connectedAccount = context?.status === 'connected' ? context.account : undefined

  const [user, setUser] = useState<User>()
  const [referrals, setReferrals] = useState<User[]>()
  const [claims, setClaims] = useState<{
    weeks: ethers.BigNumber[]
    amounts: ethers.BigNumber[]
    proofs: string[][]
  }>()
  const router = useRouter()
  const [topEarners, setTopEarners] = useState<User[]>()
  const [storedReferral, setStoredReferral] = useState<string>()

  // 1. Owner viewing - is not referred - but already a user (TOS)
  // 2. Owner viewing - is referred - already a user (TOS)
  // 3.
  const isOwnerViewing = !!connectedAccount && address === connectedAccount

  useEffect(() => {
    const getData = async () => {
      const referrals = await axios.get<User[]>(`${basePath}/api/user/referrals/${address}`)
      const user = await axios.get<User>(`${basePath}/api/user/${address}`)
      const claims = await axios.get<WeeklyClaim[]>(`${basePath}/api/user/claims/${address}`)
      const topEarners = await axios.get<User[]>(`${basePath}/api/user/top`)
      setReferrals(referrals.data)
      setUser(user.data)
      setTopEarners(topEarners.data)
      const postprocessedClaims = {
        weeks: claims.data.map((item) => ethers.BigNumber.from(item.week_number)),
        amounts: claims.data.map((item) => ethers.utils.parseEther(item.amount)),
        proofs: claims.data.map((item) => item.proof),
      }

      setClaims(postprocessedClaims)
    }
    void getData()
  }, [])

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
        {isOwnerViewing && (
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
              {referrals && user && (
                <ReferralsView
                  context={context}
                  address={address}
                  referrals={referrals}
                  user={user}
                />
              )}
              {claims && user && topEarners && (
                <FeesView context={context} claims={claims} user={user} topEarners={topEarners} />
              )}
            </Grid>
          </>
        )}
      </Flex>
    </Grid>
  )
}
